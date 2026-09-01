import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { authorize } from "./authorization.server";
import { normalizePhone } from "@/lib/phone";

const audienceSchema = z.object({
  mode: z.enum(["all", "tags", "groups", "audience_builder"]),
  ids: z.array(z.string().uuid()).default([]),
  includeGroups: z.array(z.string().uuid()).default([]),
  includeTags: z.array(z.string().uuid()).default([]),
  excludeGroups: z.array(z.string().uuid()).default([]),
  excludeTags: z.array(z.string().uuid()).default([]),
  savedAudienceId: z.string().uuid().optional().nullable(),
  manualContactIds: z.array(z.string().uuid()).default([]),
  freezeAudience: z.boolean().default(false),
});

const baseSchema = z.object({
  tenantId: z.string().uuid(),
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional().nullable(),
  templateId: z.string().uuid(),
  audience: audienceSchema,
  variableMapping: z.record(z.string(), z.string()),
  scheduledAt: z.string().datetime().nullable(),
  mediaUrl: z.string().url().optional().nullable(),
});

const FIELD_LABEL: Record<string, string> = {
  name: "Name",
  phone: "Phone",
  email: "Email",
};

type Contact = {
  id: string;
  name: string | null;
  phone_number_normalized: string | null;
  email: string | null;
};

function valueFor(c: Contact, field: string): string {
  if (field === "name") return c.name ?? "";
  if (field === "phone") return c.phone_number_normalized ?? "";
  if (field === "email") return c.email ?? "";
  return "";
}

type ValidationIssue = {
  contactId: string;
  contactName: string;
  phone: string;
  variable: string; // e.g. "2"
  field: string; // e.g. "email"
  fieldLabel: string;
};

async function loadTemplateAndAudience(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sb: any,
  tenantId: string,
  templateId: string,
  audience: z.infer<typeof audienceSchema>,
) {
  const { data: tpl, error: tErr } = await sb
    .from("message_templates")
    .select(
      "id, template_name, language, category, body, header, footer, variables, version, sync_status, meta_template_id, header_type",
    )
    .eq("id", templateId)
    .eq("tenant_id", tenantId)
    .is("deleted_at", null)
    .maybeSingle();
  if (tErr || !tpl) throw new Error("Template not found");
  if (tpl.sync_status !== "approved" || !tpl.meta_template_id) {
    throw new Error(
      "Template is not approved on Meta. Open Templates → Sync from Meta and pick an approved template.",
    );
  }

  let activeAudience = audience;
  if (audience.mode === "audience_builder" && audience.savedAudienceId) {
    const { data: sa } = await sb
      .from("saved_audiences")
      .select("criteria")
      .eq("id", audience.savedAudienceId)
      .maybeSingle();
    if (sa && sa.criteria) {
      activeAudience = {
        ...audience,
        ...(sa.criteria as any),
      };
    }
  }

  const hasGroupAudience = 
    (activeAudience.mode === "groups" && activeAudience.ids?.length > 0) ||
    (activeAudience.mode === "audience_builder" && 
     activeAudience.includeGroups && activeAudience.includeGroups.length > 0);

  let q = sb
    .from("contacts")
    .select("id, name, phone_number_normalized, email")
    .is("deleted_at", null)
    .not("phone_number_normalized", "is", null);

  if (!hasGroupAudience) {
    q = q.eq("tenant_id", tenantId);
  }

  async function fetchAllContactTags(tagIds: string[]): Promise<string[]> {
    let matches: string[] = [];
    let offset = 0;
    let hasMore = true;
    while (hasMore) {
      const { data, error } = await sb
        .from("contact_tags")
        .select("contact_id")
        .in("tag_id", tagIds)
        .range(offset, offset + 999);
      if (error) throw error;
      const rows = data ?? [];
      matches.push(...rows.map((r: any) => r.contact_id));
      offset += 1000;
      hasMore = rows.length === 1000;
    }
    return matches;
  }

  async function fetchAllContactGroups(groupIds: string[]): Promise<string[]> {
    let matches: string[] = [];
    let offset = 0;
    let hasMore = true;
    while (hasMore) {
      const { data, error } = await sb
        .from("contact_groups")
        .select("contact_id")
        .in("group_id", groupIds)
        .range(offset, offset + 999);
      if (error) throw error;
      const rows = data ?? [];
      matches.push(...rows.map((r: any) => r.contact_id));
      offset += 1000;
      hasMore = rows.length === 1000;
    }
    return matches;
  }

  let excludedCount = 0;
  let duplicateCount = 0;

  if (audience.mode === "tags" && audience.ids.length) {
    const matchedIds = await fetchAllContactTags(audience.ids);
    const ids = Array.from(new Set(matchedIds));
    if (!ids.length) throw new Error("No contacts match the selected tags");
    q = q.in("id", ids);
  } else if (audience.mode === "groups" && audience.ids.length) {
    const matchedIds = await fetchAllContactGroups(audience.ids);
    const ids = Array.from(new Set(matchedIds));
    if (!ids.length) throw new Error("No contacts match the selected groups");
    q = q.in("id", ids);
  } else if (audience.mode === "audience_builder") {
    // activeAudience is resolved at the top of the function
    let includeSet: Set<string> | null = null;
    let totalRawMatches = 0;

    // Resolve Groups Include (OR)
    let groupMatches: string[] = [];
    if (activeAudience.includeGroups && activeAudience.includeGroups.length) {
      groupMatches = await fetchAllContactGroups(activeAudience.includeGroups);
      totalRawMatches += groupMatches.length;
    }

    // Resolve Tags Include (OR)
    let tagMatches: string[] = [];
    if (activeAudience.includeTags && activeAudience.includeTags.length) {
      tagMatches = await fetchAllContactTags(activeAudience.includeTags);
      totalRawMatches += tagMatches.length;
    }

    // Combine includeGroups and includeTags (Intersection)
    if (activeAudience.includeGroups?.length && activeAudience.includeTags?.length) {
      const groupSet = new Set(groupMatches);
      const intersect = tagMatches.filter((id) => groupSet.has(id));
      includeSet = new Set(intersect);
    } else if (activeAudience.includeGroups?.length) {
      includeSet = new Set(groupMatches);
    } else if (activeAudience.includeTags?.length) {
      includeSet = new Set(tagMatches);
    }

    // Merge manual contacts
    if (activeAudience.manualContactIds && activeAudience.manualContactIds.length) {
      totalRawMatches += activeAudience.manualContactIds.length;
      if (includeSet) {
        activeAudience.manualContactIds.forEach((id) => includeSet!.add(id));
      } else {
        includeSet = new Set(activeAudience.manualContactIds);
      }
    }

    if (includeSet) {
      duplicateCount = Math.max(0, totalRawMatches - includeSet.size);
    }

    // Resolve Exclusions (OR between excludeGroups and excludeTags)
    const excludeIds = new Set<string>();
    if (activeAudience.excludeGroups && activeAudience.excludeGroups.length) {
      const matchedExcludeGroupIds = await fetchAllContactGroups(activeAudience.excludeGroups);
      matchedExcludeGroupIds.forEach((id) => excludeIds.add(id));
    }
    if (activeAudience.excludeTags && activeAudience.excludeTags.length) {
      const matchedExcludeTagIds = await fetchAllContactTags(activeAudience.excludeTags);
      matchedExcludeTagIds.forEach((id) => excludeIds.add(id));
    }

    excludedCount = excludeIds.size;

    if (includeSet !== null) {
      const finalIds = Array.from(includeSet).filter((id) => !excludeIds.has(id));
      if (!finalIds.length) throw new Error("No contacts match the selected audience criteria");
      q = q.in("id", finalIds);
    } else if (excludeIds.size > 0) {
      const idsArr = Array.from(excludeIds);
      q = q.not("id", "in", `(${idsArr.join(",")})`);
    }
  }

  const { data: contacts, error: cErr } = await q.limit(5000);
  if (cErr) throw cErr;
  if (!contacts?.length) throw new Error("Audience is empty");
  return { tpl, contacts: contacts as Contact[], excludedCount, duplicateCount };
}

function computeIssuesAndRendered(
  tpl: { variables: string[] | null },
  contacts: Contact[],
  variableMapping: Record<string, string>,
) {
  const required = (tpl.variables ?? []) as string[];
  const issues: ValidationIssue[] = [];
  const rendered = contacts.map((c) => {
    const vars: Record<string, string> = {};
    for (const idx of required) {
      const field = variableMapping[idx];
      if (!field) {
        issues.push({
          contactId: c.id,
          contactName: c.name ?? "(unnamed)",
          phone: c.phone_number_normalized ?? "",
          variable: idx,
          field: "(unmapped)",
          fieldLabel: "Not mapped",
        });
        vars[idx] = "";
        continue;
      }
      const v = valueFor(c, field).trim();
      if (!v) {
        issues.push({
          contactId: c.id,
          contactName: c.name ?? "(unnamed)",
          phone: c.phone_number_normalized ?? "",
          variable: idx,
          field,
          fieldLabel: FIELD_LABEL[field] ?? field,
        });
      }
      vars[idx] = v;
    }
    return {
      contact_id: c.id,
      phone_number_normalized: c.phone_number_normalized!,
      rendered_variables: vars,
    };
  });
  return { issues, rendered };
}

export const previewCampaign = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => baseSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    await authorize(userId, "campaign.manage", null, data.tenantId);

    let targetGroupIds: string[] = [];
    if (data.audience.mode === "groups" && Array.isArray(data.audience.ids)) {
      targetGroupIds = data.audience.ids;
    } else if (data.audience.mode === "audience_builder") {
      let activeAudience = data.audience;
      if (data.audience.savedAudienceId) {
        const { data: sa } = await supabase
          .from("saved_audiences")
          .select("criteria")
          .eq("id", data.audience.savedAudienceId)
          .maybeSingle();
        if (sa && sa.criteria) activeAudience = sa.criteria as any;
      }
      if (Array.isArray(activeAudience.includeGroups)) {
        targetGroupIds = activeAudience.includeGroups;
      }
    }

    // Verify permission to target each group
    for (const gid of targetGroupIds) {
      try {
        await authorize(userId, "group.use", gid, data.tenantId);
      } catch {
        throw new Error("You do not have permission to target this shared group in campaigns.");
      }
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { tpl, contacts, excludedCount, duplicateCount } = await loadTemplateAndAudience(
      supabaseAdmin,
      data.tenantId,
      data.templateId,
      data.audience,
    );
    const { issues } = computeIssuesAndRendered(
      tpl as { variables: string[] | null },
      contacts,
      data.variableMapping,
    );
    return {
      totalRecipients: contacts.length,
      issues,
      requiredVariables: (tpl as { variables: string[] | null }).variables ?? [],
      excludedCount,
      duplicateCount,
    };
  });

export const createCampaign = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => baseSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { tenantId } = data;

    await authorize(userId, "campaign.manage", null, tenantId);

    let targetGroupIds: string[] = [];
    if (data.audience.mode === "groups" && Array.isArray(data.audience.ids)) {
      targetGroupIds = data.audience.ids;
    } else if (data.audience.mode === "audience_builder") {
      let activeAudience = data.audience;
      if (data.audience.savedAudienceId) {
        const { data: sa } = await supabase
          .from("saved_audiences")
          .select("criteria")
          .eq("id", data.audience.savedAudienceId)
          .maybeSingle();
        if (sa && sa.criteria) activeAudience = sa.criteria as any;
      }
      if (Array.isArray(activeAudience.includeGroups)) {
        targetGroupIds = activeAudience.includeGroups;
      }
    }

    // Verify permission to target each group
    for (const gid of targetGroupIds) {
      try {
        await authorize(userId, "group.use", gid, tenantId);
      } catch {
        throw new Error("You do not have permission to target this shared group in campaigns.");
      }
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { tpl, contacts } = await loadTemplateAndAudience(
      supabaseAdmin,
      tenantId,
      data.templateId,
      data.audience,
    );

    const { issues, rendered } = computeIssuesAndRendered(
      tpl as { variables: string[] | null },
      contacts,
      data.variableMapping,
    );

    // Hard block — primary protection for empty Meta template parameters.
    if (issues.length) {
      // Encode issues so the UI can render the validation screen.
      throw new Error(
        `VALIDATION_FAILED:${JSON.stringify({
          issues: issues.slice(0, 200),
          totalIssues: issues.length,
        })}`,
      );
    }

    // FIX-3: Block campaign if any contact lacks a country code.
    // Meta requires E.164 numbers (≥ 11 digits including country code, e.g. 919876543210).
    // 10-digit local numbers are the most common cause of Meta delivery failures.
    const shortPhones = contacts.filter((c) => {
      const digits = (c.phone_number_normalized ?? "").replace(/\D+/g, "");
      return digits.length < 11;
    });
    if (shortPhones.length > 0) {
      const samples = shortPhones
        .slice(0, 5)
        .map((c) => c.phone_number_normalized ?? "")
        .join(", ");
      throw new Error(
        `PHONE_VALIDATION_FAILED:${JSON.stringify({
          message:
            `${shortPhones.length} contact(s) have phone numbers without a country code (e.g. 10-digit local numbers). ` +
            `Meta requires full international numbers (E.164 format). ` +
            `Please re-import these contacts with the correct country code. ` +
            `Affected sample numbers: ${samples}`,
          count: shortPhones.length,
          samples: shortPhones.slice(0, 10).map((c) => c.phone_number_normalized),
        })}`,
      );
    }

    if ((tpl as any).header_type === "IMAGE" && !data.mediaUrl) {
      throw new Error("An image is required for this campaign template");
    }

    const status = data.scheduledAt ? "scheduled" : "sending";
    const scheduled_at = data.scheduledAt ?? new Date().toISOString();
    const { data: campaign, error: cmpErr } = await supabaseAdmin
      .from("campaigns")
      .insert({
        tenant_id: tenantId,
        name: data.name,
        description: data.description ?? null,
        template_id: (tpl as { id: string }).id,
        template_snapshot: tpl as never,
        audience_criteria: data.audience as never,
        variable_mapping: data.variableMapping as never,
        status,
        scheduled_at,
        total_recipients: rendered.length,
        created_by: userId,
      })
      .select("id")
      .single();
    if (cmpErr || !campaign) throw cmpErr ?? new Error("Failed to create campaign");

    if ((tpl as any).header_type === "IMAGE" && data.mediaUrl) {
      const fileName = data.mediaUrl.split("/").pop() || "campaign_image";
      const { error: mediaErr } = await supabaseAdmin.from("campaign_media").insert({
        tenant_id: tenantId,
        campaign_id: campaign.id,
        file_name: fileName,
        file_url: data.mediaUrl,
        uploaded_by: userId,
      });
      if (mediaErr) throw mediaErr;
    }

    const chunkSize = 500;
    for (let i = 0; i < rendered.length; i += chunkSize) {
      const chunk = rendered.slice(i, i + chunkSize).map((r) => {
        const norm = normalizePhone(r.phone_number_normalized);
        return {
          tenant_id: tenantId,
          campaign_id: campaign.id,
          contact_id: r.contact_id,
          phone_number_normalized: norm.normalized ?? r.phone_number_normalized,
          rendered_variables: r.rendered_variables as never,
          status: "pending" as const,
          attempts: 0,
        };
      });
      const { error } = await supabaseAdmin.from("campaign_recipients").insert(chunk);
      if (error) throw error;
    }

    // Insert audit log if any shared groups are used
    if (targetGroupIds.length > 0) {
      const { data: groups } = await supabaseAdmin
        .from("groups")
        .select("id, created_by")
        .in("id", targetGroupIds);
      const sharedGroups = (groups ?? []).filter((g: any) => g.created_by && g.created_by !== userId);
      if (sharedGroups.length > 0) {
        const auditRows = sharedGroups.map((g: any) => ({
          tenant_id: tenantId,
          action: "campaign_created_with_shared_audience",
          entity_type: "campaign",
          entity_id: campaign.id,
          user_id: userId,
          metadata: {
            group_id: g.id,
            owner_id: g.created_by,
          },
        }));
        await supabaseAdmin.from("audit_logs").insert(auditRows);
      }
    }

    if (!data.scheduledAt) {
      const origin =
        process.env.PUBLIC_BASE_URL ??
        "https://convexa.virratglobal.com";
      void fetch(`${origin}/api/public/hooks/process-campaigns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      }).catch(() => {});
    }

    return { id: campaign.id, total: rendered.length };
  });

export const cancelCampaign = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ tenantId: z.string().uuid(), campaignId: z.string().uuid() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { tenantId, campaignId } = data;

    await authorize(userId, "campaign.manage", campaignId, tenantId);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("campaigns")
      .update({ status: "cancelled" })
      .eq("id", campaignId)
      .eq("tenant_id", tenantId)
      .in("status", ["scheduled", "sending"]);
    if (error) throw error;
    return { ok: true };
  });

export const resumeCampaign = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ tenantId: z.string().uuid(), campaignId: z.string().uuid() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { tenantId, campaignId } = data;

    await authorize(userId, "campaign.manage", campaignId, tenantId);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("campaigns")
      .update({ 
        status: "sending", 
        started_at: new Date().toISOString(), 
        completed_at: null 
      })
      .eq("id", campaignId)
      .eq("tenant_id", tenantId)
      .in("status", ["failed", "partial", "cancelled", "processing"]);

      
    if (error) throw error;

    const origin =
      process.env.PUBLIC_BASE_URL ??
      "https://convexa.virratglobal.com";
    void fetch(`${origin}/api/public/hooks/process-campaigns`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    }).catch(() => {});

    return { ok: true };
  });

