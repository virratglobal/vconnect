import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf8');
const SUPABASE_URL = env.match(/SUPABASE_URL="([^"]+)"/)[1];
const SUPABASE_PUBLISHABLE_KEY = env.match(/SUPABASE_PUBLISHABLE_KEY="([^"]+)"/)[1];

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: undefined,
    persistSession: false,
    autoRefreshToken: false,
  },
});

const waba_id = "27091297057198631";
const access_token = "EAAfG9m5O3WMBRmAFfcXoAov3k20yK3tiVuExtoqzNgeEkk8cGn4op7vKU36Swp85mOCmOYAZBik5IoWAqDpaIHf746Y1cJ4nrG4g3qvvSiGpkns2s4FYpvZB3fq5sKY6B5CwLRHDxLu1jWVzZBlFUZCQodyecoCGv0k9HQjq0Wafg0ZC0cPMAozODjKXeVfh6LgZDZD";

const tenantId = "e79d30f9-77ff-47b4-b5b6-7bfacb7adedb";

// We will fetch templates from Meta and do the exact logic of syncMetaTemplates manually here to update the DB!
const META_API = "https://graph.facebook.com/v20.0";
const url = `${META_API}/${waba_id}/message_templates?fields=name,language,status,category,components,id&limit=200`;

const res = await fetch(url, {
  headers: { Authorization: `Bearer ${access_token}` },
});
const json = await res.json();
console.log("Status:", res.status);
const templates = json.data ?? [];
console.log("Meta templates found:", templates.length);

const { supabaseAdmin } = await import("./src/integrations/supabase/client.server.js");

const syncedAt = new Date().toISOString();
const seenMetaIds = new Set();

const mapMetaStatus = (s) => {
  if (s === "APPROVED") return "approved";
  if (s === "PENDING") return "pending";
  return "rejected";
};

const extractVariables = (body) => {
  const matches = body.match(/\{\{\d+\}\}/g) ?? [];
  return [...new Set(matches.map((m) => m.replace(/[\{\}]/g, "")))];
};

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
      headerComp?.example?.header_handle?.[0] ||
      headerComp?.example?.header_url?.[0] ||
      null,
  };

  if (existing) {
    await supabaseAdmin.from("message_templates").update(basePayload).eq("id", existing.id);
  } else {
    await supabaseAdmin.from("message_templates").insert({ ...basePayload, source: "meta" });
  }
}

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

console.log("Sync done, marked rejected:", removed);
