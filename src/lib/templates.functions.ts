import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const META_API = "https://graph.facebook.com/v20.0";

interface MetaTemplate {
  id: string;
  name: string;
  language: string;
  category: string;
  status: string;
  components: Array<{
    type: string;
    text?: string;
    format?: string;
    example?: { body_text?: string[][]; header_text?: string[] };
  }>;
}

function extractVariables(body: string): string[] {
  const set = new Set<string>();
  const re = /\{\{\s*(\d+)\s*\}\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) set.add(m[1]);
  return Array.from(set).sort((a, b) => Number(a) - Number(b));
}

type SyncStatus = "approved" | "disabled" | "draft" | "pending" | "rejected";

function normalizeMetaStatus(status?: string | null) {
  return (status ?? "PENDING").trim().toUpperCase();
}

function mapMetaStatus(status?: string | null): SyncStatus {
  const v = normalizeMetaStatus(status).toLowerCase();
  if (v === "approved") return "approved";
  if (v === "rejected") return "rejected";
  if (v === "disabled" || v === "paused") return "disabled";
  if (v === "pending" || v === "pending_review" || v === "in_review") return "pending";
  return "draft";
}

function metaAuthHeader(accessToken: string) {
  const token = accessToken.trim();
  return token.toLowerCase().startsWith("bearer ") ? token : `Bearer ${token}`;
}

export const syncMetaTemplates = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ tenantId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { tenantId } = data;

    const { authorize } = await import("./authorization.server");
    // Verify caller is owner/admin (anyone who can manage templates per PRD RBAC)
    await authorize(userId, "whatsapp.config.manage", null, tenantId);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Fetch credentials after authorization. Admin client is used so owner/admin RBAC is enforced here,
    // not by the owner-only credentials RLS policy.
    const { data: creds, error: cErr } = await supabaseAdmin
      .from("whatsapp_credentials")
      .select("waba_id, access_token")
      .eq("tenant_id", tenantId)
      .eq("is_default", true)
      .maybeSingle();
    if (cErr) throw cErr;
    if (!creds?.waba_id || !creds?.access_token) {
      throw new Error("Connect Meta Cloud API in Settings → WhatsApp first");
    }

    // Fetch templates from Meta Graph API
    const url = `${META_API}/${encodeURIComponent(creds.waba_id)}/message_templates?fields=name,language,status,category,components,id&limit=200`;
    const res = await fetch(url, {
      headers: { Authorization: metaAuthHeader(creds.access_token) },
    });
    const json = (await res.json()) as { data?: MetaTemplate[]; error?: { message?: string } };
    if (!res.ok) {
      const msg = json?.error?.message ?? `Meta API ${res.status}`;
      await supabaseAdmin.from("system_errors").insert({
        tenant_id: tenantId,
        type: "meta_template_sync",
        error: msg,
        context: { status: res.status },
      });
      await supabaseAdmin
        .from("whatsapp_credentials")
        .update({ last_failure_at: new Date().toISOString() })
        .eq("tenant_id", tenantId)
        .eq("is_default", true);
      throw new Error(`Meta API: ${msg}`);
    }

    const templates = json.data ?? [];
    let upserted = 0;
    const syncedAt = new Date().toISOString();
    const seenMetaIds = new Set<string>();

    for (const t of templates) {
      seenMetaIds.add(t.id);
      const bodyComp = t.components.find((c) => c.type === "BODY");
      const headerComp = t.components.find((c) => c.type === "HEADER");
      const footerComp = t.components.find((c) => c.type === "FOOTER");
      const body = bodyComp?.text ?? "";
      const variables = extractVariables(body);

      const { data: existing } = await supabaseAdmin
        .from("message_templates")
        .select("id, version, body")
        .eq("tenant_id", tenantId)
        .eq("template_name", t.name)
        .eq("language", t.language)
        .is("deleted_at", null)
        .maybeSingle();

      const nextVersion =
        existing && existing.body !== body ? (existing.version ?? 1) + 1 : (existing?.version ?? 1);

      const basePayload = {
        tenant_id: tenantId,
        template_name: t.name,
        language: t.language,
        category: t.category,
        body,
        header: headerComp?.text ?? null,
        footer: footerComp?.text ?? null,
        variables,
        version: nextVersion,
        meta_template_id: t.id,
        sync_status: mapMetaStatus(t.status),
        last_sync_at: syncedAt,
        header_type: headerComp?.format ?? "NONE",
        header_format: headerComp?.format ?? "NONE",
        approval_status: t.status || null,
        example_media_url:
          (headerComp as any)?.example?.header_handle?.[0] ||
          (headerComp as any)?.example?.header_url?.[0] ||
          null,
      };

      if (existing) {
        await supabaseAdmin.from("message_templates").update(basePayload).eq("id", existing.id);
      } else {
        await supabaseAdmin.from("message_templates").insert({ ...basePayload, source: "meta" });
      }
      upserted++;
    }

    // P0-D: Detect stale rows — rows bound to a Meta template ID that no longer
    // appears in Meta's listing. Mark them rejected so the campaign builder hides them.
    const { data: dbBound } = await supabaseAdmin
      .from("message_templates")
      .select("id, meta_template_id, sync_status")
      .eq("tenant_id", tenantId)
      .not("meta_template_id", "is", null)
      .is("deleted_at", null);

    let removed = 0;
    for (const row of dbBound ?? []) {
      if (
        row.meta_template_id &&
        !seenMetaIds.has(row.meta_template_id) &&
        row.sync_status !== "rejected"
      ) {
        await supabaseAdmin
          .from("message_templates")
          .update({ sync_status: "rejected", last_sync_at: syncedAt })
          .eq("id", row.id);
        removed++;
      }
    }

    await supabaseAdmin
      .from("whatsapp_credentials")
      .update({ last_template_sync_at: syncedAt, last_success_at: syncedAt, status: "configured" })
      .eq("tenant_id", tenantId)
      .eq("is_default", true);

    return { count: upserted, removed };
  });

// ============ Submit manual template to Meta for approval ============
type MetaComponent =
  | { type: "HEADER"; format: "TEXT"; text: string; example?: { header_text: string[] } }
  | { type: "HEADER"; format: "IMAGE"; example?: { header_handle: string[] } }
  | { type: "BODY"; text: string; example?: { body_text: string[][] } }
  | { type: "FOOTER"; text: string };

function buildMetaComponents(t: {
  body: string;
  header: string | null;
  footer: string | null;
  header_type?: string | null;
  header_handle?: string | null;
}): MetaComponent[] {
  const components: MetaComponent[] = [];
  if (t.header_type === "IMAGE") {
    const headerComp: any = { type: "HEADER", format: "IMAGE" };
    if (t.header_handle) {
      headerComp.example = { header_handle: [t.header_handle] };
    }
    components.push(headerComp);
  } else if (t.header && t.header.trim()) {
    const headerVars = extractVariables(t.header);
    const headerComp: any = { type: "HEADER", format: "TEXT", text: t.header };
    if (headerVars.length)
      headerComp.example = { header_text: headerVars.map((v) => `sample_${v}`) };
    components.push(headerComp);
  }
  const bodyComp: any = { type: "BODY", text: t.body };
  const bodyVars = extractVariables(t.body);
  if (bodyVars.length) {
    bodyComp.example = { body_text: [bodyVars.map((v) => `sample_${v}`)] };
  }
  components.push(bodyComp);
  if (t.footer && t.footer.trim()) components.push({ type: "FOOTER", text: t.footer });
  return components;
}

export const submitTemplateToMeta = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ tenantId: z.string().uuid(), templateId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { tenantId, templateId } = data;
    const { authorize } = await import("./authorization.server");
    await authorize(userId, "whatsapp.config.manage", null, tenantId);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: tpl, error: tErr } = await supabaseAdmin
      .from("message_templates")
      .select(
        "id, template_name, language, category, body, header, footer, source, sync_status, header_type, example_media_url",
      )
      .eq("id", templateId)
      .eq("tenant_id", tenantId)
      .is("deleted_at", null)
      .maybeSingle();
    if (tErr) throw tErr;
    if (!tpl) throw new Error("Template not found");
    if (tpl.source !== "manual") throw new Error("Only manual templates can be submitted to Meta");
    if (tpl.sync_status === "approved" || tpl.sync_status === "pending") {
      throw new Error(`Template is already ${tpl.sync_status} on Meta`);
    }

    const { data: creds, error: cErr } = await supabaseAdmin
      .from("whatsapp_credentials")
      .select("waba_id, access_token")
      .eq("tenant_id", tenantId)
      .eq("is_default", true)
      .maybeSingle();
    if (cErr) throw cErr;
    if (!creds?.waba_id || !creds?.access_token) {
      throw new Error("Connect Meta Cloud API in Settings → WhatsApp first");
    }

    let headerHandle: string | null = null;
    if (tpl.header_type === "IMAGE" && tpl.example_media_url) {
      try {
        // 1. Fetch image from Supabase Storage
        const fileRes = await fetch(tpl.example_media_url);
        if (!fileRes.ok) throw new Error(`Failed to fetch image: ${fileRes.status}`);
        const fileBuffer = await fileRes.arrayBuffer();
        const fileSize = fileBuffer.byteLength;
        const fileType = fileRes.headers.get("content-type") || "image/png";

        // 2. Get App ID from debugging token
        const debugUrl = `${META_API}/debug_token?input_token=${encodeURIComponent(creds.access_token)}&access_token=${encodeURIComponent(creds.access_token)}`;
        const debugRes = await fetch(debugUrl);
        const debugJson = await debugRes.json();
        const appId = debugJson?.data?.app_id;
        if (!appId) throw new Error("Could not retrieve Facebook App ID from access token");

        // 3. Initiate resumable upload session
        const initUrl = `${META_API}/${appId}/uploads?file_length=${fileSize}&file_type=${fileType}`;
        const initRes = await fetch(initUrl, {
          method: "POST",
          headers: { Authorization: metaAuthHeader(creds.access_token) },
        });
        const initJson = await initRes.json();
        const uploadSessionId = initJson.id;
        if (!uploadSessionId)
          throw new Error(initJson?.error?.message ?? "Failed to initiate upload session");

        // 4. Upload file binary
        const uploadUrl = `${META_API}/${uploadSessionId}`;
        const uploadRes = await fetch(uploadUrl, {
          method: "POST",
          headers: {
            Authorization: metaAuthHeader(creds.access_token),
            file_offset: "0",
            "Content-Type": "application/octet-stream",
          },
          body: fileBuffer,
        });
        const uploadJson = await uploadRes.json();
        headerHandle = uploadJson.h;
        if (!headerHandle)
          throw new Error(uploadJson?.error?.message ?? "Failed to upload media to Meta");
      } catch (err) {
        throw new Error(`Media preparation failed: ${(err as Error).message}`);
      }
    }

    const components = buildMetaComponents({
      body: tpl.body,
      header: tpl.header,
      footer: tpl.footer,
      header_type: tpl.header_type,
      header_handle: headerHandle,
    });

    const url = `${META_API}/${encodeURIComponent(creds.waba_id)}/message_templates`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: metaAuthHeader(creds.access_token),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: tpl.template_name,
        language: tpl.language,
        category: (tpl.category ?? "UTILITY").toUpperCase(),
        components,
      }),
    });
    const json = (await res.json()) as {
      id?: string;
      status?: string;
      error?: { message?: string; error_user_msg?: string };
    };

    if (!res.ok) {
      const msg = json?.error?.error_user_msg ?? json?.error?.message ?? `Meta API ${res.status}`;
      await supabaseAdmin.from("system_errors").insert({
        tenant_id: tenantId,
        type: "meta_template_submit",
        error: msg,
        context: { status: res.status, template_name: tpl.template_name },
      });
      await supabaseAdmin
        .from("whatsapp_credentials")
        .update({ last_failure_at: new Date().toISOString() })
        .eq("tenant_id", tenantId)
        .eq("is_default", true);
      throw new Error(`Meta: ${msg}`);
    }

    const now = new Date().toISOString();
    const nextStatus = mapMetaStatus(json.status);

    await supabaseAdmin
      .from("message_templates")
      .update({
        meta_template_id: json.id ?? null,
        sync_status: nextStatus,
        submitted_at: now,
        last_sync_at: now,
      })
      .eq("id", tpl.id);

    await supabaseAdmin
      .from("whatsapp_credentials")
      .update({ last_success_at: now, status: "configured" })
      .eq("tenant_id", tenantId)
      .eq("is_default", true);

    return { id: json.id, status: nextStatus };
  });
