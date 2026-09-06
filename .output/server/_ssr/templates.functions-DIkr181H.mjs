import { l as createServerFn } from "./esm-9EjmF9OT.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-BBYtZ6z0.mjs";
import { t as createServerRpc } from "./createServerRpc-TAUNrjZd.mjs";
import { c as stringType, o as objectType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/templates.functions-DIkr181H.js
var META_API = "https://graph.facebook.com/v20.0";
function extractVariables(body) {
	const set = /* @__PURE__ */ new Set();
	const re = /\{\{\s*(\d+)\s*\}\}/g;
	let m;
	while ((m = re.exec(body)) !== null) set.add(m[1]);
	return Array.from(set).sort((a, b) => Number(a) - Number(b));
}
function normalizeMetaStatus(status) {
	return (status ?? "PENDING").trim().toUpperCase();
}
function mapMetaStatus(status) {
	const v = normalizeMetaStatus(status).toLowerCase();
	if (v === "approved") return "approved";
	if (v === "rejected") return "rejected";
	if (v === "disabled" || v === "paused") return "disabled";
	if (v === "pending" || v === "pending_review" || v === "in_review") return "pending";
	return "draft";
}
function metaAuthHeader(accessToken) {
	const token = accessToken.trim();
	return token.toLowerCase().startsWith("bearer ") ? token : `Bearer ${token}`;
}
var syncMetaTemplates_createServerFn_handler = createServerRpc({
	id: "1795372c99b893fdf679c1908ba274ead0cea34cbba15b66f1dcb09b2c3a2a88",
	name: "syncMetaTemplates",
	filename: "src/lib/templates.functions.ts"
}, (opts) => syncMetaTemplates.__executeServer(opts));
var syncMetaTemplates = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({ tenantId: stringType().uuid() }).parse(input)).handler(syncMetaTemplates_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	const { tenantId } = data;
	const { authorize } = await import("./authorization.server-9qb3Vk4A.mjs");
	await authorize(userId, "whatsapp.config.manage", null, tenantId);
	const { supabaseAdmin } = await import("./client.server-Ck2b02Cx.mjs").then((n) => n.t).then((n) => n.t);
	const { data: creds, error: cErr } = await supabaseAdmin.from("whatsapp_credentials").select("waba_id, access_token").eq("tenant_id", tenantId).eq("is_default", true).maybeSingle();
	if (cErr) throw cErr;
	if (!creds?.waba_id || !creds?.access_token) throw new Error("Connect Meta Cloud API in Settings → WhatsApp first");
	const url = `${META_API}/${encodeURIComponent(creds.waba_id)}/message_templates?fields=name,language,status,category,components,id&limit=200`;
	const res = await fetch(url, { headers: { Authorization: metaAuthHeader(creds.access_token) } });
	const json = await res.json();
	if (!res.ok) {
		const msg = json?.error?.message ?? `Meta API ${res.status}`;
		await supabaseAdmin.from("system_errors").insert({
			tenant_id: tenantId,
			type: "meta_template_sync",
			error: msg,
			context: { status: res.status }
		});
		await supabaseAdmin.from("whatsapp_credentials").update({ last_failure_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("tenant_id", tenantId).eq("is_default", true);
		throw new Error(`Meta API: ${msg}`);
	}
	const templates = json.data ?? [];
	let upserted = 0;
	const syncedAt = (/* @__PURE__ */ new Date()).toISOString();
	const seenMetaIds = /* @__PURE__ */ new Set();
	for (const t of templates) {
		seenMetaIds.add(t.id);
		const bodyComp = t.components.find((c) => c.type === "BODY");
		const headerComp = t.components.find((c) => c.type === "HEADER");
		const footerComp = t.components.find((c) => c.type === "FOOTER");
		const body = bodyComp?.text ?? "";
		const variables = extractVariables(body);
		const { data: existing } = await supabaseAdmin.from("message_templates").select("id, version, body").eq("tenant_id", tenantId).eq("template_name", t.name).eq("language", t.language).is("deleted_at", null).maybeSingle();
		const nextVersion = existing && existing.body !== body ? (existing.version ?? 1) + 1 : existing?.version ?? 1;
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
			example_media_url: headerComp?.example?.header_handle?.[0] || headerComp?.example?.header_url?.[0] || null
		};
		if (existing) await supabaseAdmin.from("message_templates").update(basePayload).eq("id", existing.id);
		else await supabaseAdmin.from("message_templates").insert({
			...basePayload,
			source: "meta"
		});
		upserted++;
	}
	const { data: dbBound } = await supabaseAdmin.from("message_templates").select("id, meta_template_id, sync_status").eq("tenant_id", tenantId).not("meta_template_id", "is", null).is("deleted_at", null);
	let removed = 0;
	for (const row of dbBound ?? []) if (row.meta_template_id && !seenMetaIds.has(row.meta_template_id) && row.sync_status !== "rejected") {
		await supabaseAdmin.from("message_templates").update({
			sync_status: "rejected",
			last_sync_at: syncedAt
		}).eq("id", row.id);
		removed++;
	}
	await supabaseAdmin.from("whatsapp_credentials").update({
		last_template_sync_at: syncedAt,
		last_success_at: syncedAt,
		status: "configured"
	}).eq("tenant_id", tenantId).eq("is_default", true);
	return {
		count: upserted,
		removed
	};
});
function buildMetaComponents(t) {
	const components = [];
	if (t.header_type === "IMAGE") {
		const headerComp = {
			type: "HEADER",
			format: "IMAGE"
		};
		if (t.header_handle) headerComp.example = { header_handle: [t.header_handle] };
		components.push(headerComp);
	} else if (t.header && t.header.trim()) {
		const headerVars = extractVariables(t.header);
		const headerComp = {
			type: "HEADER",
			format: "TEXT",
			text: t.header
		};
		if (headerVars.length) headerComp.example = { header_text: headerVars.map((v) => `sample_${v}`) };
		components.push(headerComp);
	}
	const bodyComp = {
		type: "BODY",
		text: t.body
	};
	const bodyVars = extractVariables(t.body);
	if (bodyVars.length) bodyComp.example = { body_text: [bodyVars.map((v) => `sample_${v}`)] };
	components.push(bodyComp);
	if (t.footer && t.footer.trim()) components.push({
		type: "FOOTER",
		text: t.footer
	});
	return components;
}
var submitTemplateToMeta_createServerFn_handler = createServerRpc({
	id: "2e9c4384af068a6efcefefaf410ce57be036cabb26f5622f6e2437bc4166ca52",
	name: "submitTemplateToMeta",
	filename: "src/lib/templates.functions.ts"
}, (opts) => submitTemplateToMeta.__executeServer(opts));
var submitTemplateToMeta = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
	tenantId: stringType().uuid(),
	templateId: stringType().uuid()
}).parse(input)).handler(submitTemplateToMeta_createServerFn_handler, async ({ data, context }) => {
	const { userId } = context;
	const { tenantId, templateId } = data;
	const { authorize } = await import("./authorization.server-9qb3Vk4A.mjs");
	await authorize(userId, "whatsapp.config.manage", null, tenantId);
	const { supabaseAdmin } = await import("./client.server-Ck2b02Cx.mjs").then((n) => n.t).then((n) => n.t);
	const { data: tpl, error: tErr } = await supabaseAdmin.from("message_templates").select("id, template_name, language, category, body, header, footer, source, sync_status, header_type, example_media_url").eq("id", templateId).eq("tenant_id", tenantId).is("deleted_at", null).maybeSingle();
	if (tErr) throw tErr;
	if (!tpl) throw new Error("Template not found");
	if (tpl.source !== "manual") throw new Error("Only manual templates can be submitted to Meta");
	if (tpl.sync_status === "approved" || tpl.sync_status === "pending") throw new Error(`Template is already ${tpl.sync_status} on Meta`);
	const { data: creds, error: cErr } = await supabaseAdmin.from("whatsapp_credentials").select("waba_id, access_token").eq("tenant_id", tenantId).eq("is_default", true).maybeSingle();
	if (cErr) throw cErr;
	if (!creds?.waba_id || !creds?.access_token) throw new Error("Connect Meta Cloud API in Settings → WhatsApp first");
	let headerHandle = null;
	if (tpl.header_type === "IMAGE" && tpl.example_media_url) try {
		const fileRes = await fetch(tpl.example_media_url);
		if (!fileRes.ok) throw new Error(`Failed to fetch image: ${fileRes.status}`);
		const fileBuffer = await fileRes.arrayBuffer();
		const fileSize = fileBuffer.byteLength;
		const fileType = fileRes.headers.get("content-type") || "image/png";
		const debugUrl = `${META_API}/debug_token?input_token=${encodeURIComponent(creds.access_token)}&access_token=${encodeURIComponent(creds.access_token)}`;
		const appId = (await (await fetch(debugUrl)).json())?.data?.app_id;
		if (!appId) throw new Error("Could not retrieve Facebook App ID from access token");
		const initUrl = `${META_API}/${appId}/uploads?file_length=${fileSize}&file_type=${fileType}`;
		const initJson = await (await fetch(initUrl, {
			method: "POST",
			headers: { Authorization: metaAuthHeader(creds.access_token) }
		})).json();
		const uploadSessionId = initJson.id;
		if (!uploadSessionId) throw new Error(initJson?.error?.message ?? "Failed to initiate upload session");
		const uploadUrl = `${META_API}/${uploadSessionId}`;
		const uploadJson = await (await fetch(uploadUrl, {
			method: "POST",
			headers: {
				Authorization: metaAuthHeader(creds.access_token),
				file_offset: "0",
				"Content-Type": "application/octet-stream"
			},
			body: fileBuffer
		})).json();
		headerHandle = uploadJson.h;
		if (!headerHandle) throw new Error(uploadJson?.error?.message ?? "Failed to upload media to Meta");
	} catch (err) {
		throw new Error(`Media preparation failed: ${err.message}`);
	}
	const components = buildMetaComponents({
		body: tpl.body,
		header: tpl.header,
		footer: tpl.footer,
		header_type: tpl.header_type,
		header_handle: headerHandle
	});
	const url = `${META_API}/${encodeURIComponent(creds.waba_id)}/message_templates`;
	const res = await fetch(url, {
		method: "POST",
		headers: {
			Authorization: metaAuthHeader(creds.access_token),
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			name: tpl.template_name,
			language: tpl.language,
			category: (tpl.category ?? "UTILITY").toUpperCase(),
			components
		})
	});
	const json = await res.json();
	if (!res.ok) {
		const msg = json?.error?.error_user_msg ?? json?.error?.message ?? `Meta API ${res.status}`;
		await supabaseAdmin.from("system_errors").insert({
			tenant_id: tenantId,
			type: "meta_template_submit",
			error: msg,
			context: {
				status: res.status,
				template_name: tpl.template_name
			}
		});
		await supabaseAdmin.from("whatsapp_credentials").update({ last_failure_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("tenant_id", tenantId).eq("is_default", true);
		throw new Error(`Meta: ${msg}`);
	}
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const nextStatus = mapMetaStatus(json.status);
	await supabaseAdmin.from("message_templates").update({
		meta_template_id: json.id ?? null,
		sync_status: nextStatus,
		submitted_at: now,
		last_sync_at: now
	}).eq("id", tpl.id);
	await supabaseAdmin.from("whatsapp_credentials").update({
		last_success_at: now,
		status: "configured"
	}).eq("tenant_id", tenantId).eq("is_default", true);
	return {
		id: json.id,
		status: nextStatus
	};
});
//#endregion
export { submitTemplateToMeta_createServerFn_handler, syncMetaTemplates_createServerFn_handler };
