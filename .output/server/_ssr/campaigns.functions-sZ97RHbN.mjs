import { l as createServerFn } from "./esm-9EjmF9OT.mjs";
import { t as createServerRpc } from "./createServerRpc-TAUNrjZd.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-wPl4xYQJ.mjs";
import { authorize } from "./authorization.server-Dvum_v3H.mjs";
import { c as stringType, i as enumType, n as arrayType, o as objectType, r as booleanType, s as recordType } from "../_libs/zod.mjs";
import { n as normalizePhone } from "./phone-BQ3n_kyc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/campaigns.functions-sZ97RHbN.js
var audienceSchema = objectType({
	mode: enumType([
		"all",
		"tags",
		"groups",
		"audience_builder"
	]),
	ids: arrayType(stringType().uuid()).default([]),
	includeGroups: arrayType(stringType().uuid()).default([]),
	includeTags: arrayType(stringType().uuid()).default([]),
	excludeGroups: arrayType(stringType().uuid()).default([]),
	excludeTags: arrayType(stringType().uuid()).default([]),
	savedAudienceId: stringType().uuid().optional().nullable(),
	manualContactIds: arrayType(stringType().uuid()).default([]),
	freezeAudience: booleanType().default(false)
});
var baseSchema = objectType({
	tenantId: stringType().uuid(),
	name: stringType().min(1).max(120),
	description: stringType().max(500).optional().nullable(),
	templateId: stringType().uuid(),
	audience: audienceSchema,
	variableMapping: recordType(stringType(), stringType()),
	scheduledAt: stringType().datetime().nullable(),
	mediaUrl: stringType().url().optional().nullable()
});
var FIELD_LABEL = {
	name: "Name",
	phone: "Phone",
	email: "Email"
};
function valueFor(c, field) {
	if (field === "name") return c.name ?? "";
	if (field === "phone") return c.phone_number_normalized ?? "";
	if (field === "email") return c.email ?? "";
	return "";
}
async function loadTemplateAndAudience(sb, tenantId, templateId, audience) {
	const { data: tpl, error: tErr } = await sb.from("message_templates").select("id, template_name, language, category, body, header, footer, variables, version, sync_status, meta_template_id, header_type").eq("id", templateId).eq("tenant_id", tenantId).is("deleted_at", null).maybeSingle();
	if (tErr || !tpl) throw new Error("Template not found");
	if (tpl.sync_status !== "approved" || !tpl.meta_template_id) throw new Error("Template is not approved on Meta. Open Templates → Sync from Meta and pick an approved template.");
	let activeAudience = audience;
	if (audience.mode === "audience_builder" && audience.savedAudienceId) {
		const { data: sa } = await sb.from("saved_audiences").select("criteria").eq("id", audience.savedAudienceId).maybeSingle();
		if (sa && sa.criteria) activeAudience = {
			...audience,
			...sa.criteria
		};
	}
	const hasGroupAudience = activeAudience.mode === "groups" && activeAudience.ids?.length > 0 || activeAudience.mode === "audience_builder" && activeAudience.includeGroups && activeAudience.includeGroups.length > 0;
	let q = sb.from("contacts").select("id, name, phone_number_normalized, email").is("deleted_at", null).not("phone_number_normalized", "is", null);
	if (!hasGroupAudience) q = q.eq("tenant_id", tenantId);
	async function fetchAllContactTags(tagIds) {
		let matches = [];
		let offset = 0;
		let hasMore = true;
		while (hasMore) {
			const { data, error } = await sb.from("contact_tags").select("contact_id").in("tag_id", tagIds).range(offset, offset + 999);
			if (error) throw error;
			const rows = data ?? [];
			matches.push(...rows.map((r) => r.contact_id));
			offset += 1e3;
			hasMore = rows.length === 1e3;
		}
		return matches;
	}
	async function fetchAllContactGroups(groupIds) {
		let matches = [];
		let offset = 0;
		let hasMore = true;
		while (hasMore) {
			const { data, error } = await sb.from("contact_groups").select("contact_id").in("group_id", groupIds).range(offset, offset + 999);
			if (error) throw error;
			const rows = data ?? [];
			matches.push(...rows.map((r) => r.contact_id));
			offset += 1e3;
			hasMore = rows.length === 1e3;
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
		let includeSet = null;
		let totalRawMatches = 0;
		let groupMatches = [];
		if (activeAudience.includeGroups && activeAudience.includeGroups.length) {
			groupMatches = await fetchAllContactGroups(activeAudience.includeGroups);
			totalRawMatches += groupMatches.length;
		}
		let tagMatches = [];
		if (activeAudience.includeTags && activeAudience.includeTags.length) {
			tagMatches = await fetchAllContactTags(activeAudience.includeTags);
			totalRawMatches += tagMatches.length;
		}
		if (activeAudience.includeGroups?.length && activeAudience.includeTags?.length) {
			const groupSet = new Set(groupMatches);
			const intersect = tagMatches.filter((id) => groupSet.has(id));
			includeSet = new Set(intersect);
		} else if (activeAudience.includeGroups?.length) includeSet = new Set(groupMatches);
		else if (activeAudience.includeTags?.length) includeSet = new Set(tagMatches);
		if (activeAudience.manualContactIds && activeAudience.manualContactIds.length) {
			totalRawMatches += activeAudience.manualContactIds.length;
			if (includeSet) activeAudience.manualContactIds.forEach((id) => includeSet.add(id));
			else includeSet = new Set(activeAudience.manualContactIds);
		}
		if (includeSet) duplicateCount = Math.max(0, totalRawMatches - includeSet.size);
		const excludeIds = /* @__PURE__ */ new Set();
		if (activeAudience.excludeGroups && activeAudience.excludeGroups.length) (await fetchAllContactGroups(activeAudience.excludeGroups)).forEach((id) => excludeIds.add(id));
		if (activeAudience.excludeTags && activeAudience.excludeTags.length) (await fetchAllContactTags(activeAudience.excludeTags)).forEach((id) => excludeIds.add(id));
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
	const { data: contacts, error: cErr } = await q.limit(5e3);
	if (cErr) throw cErr;
	if (!contacts?.length) throw new Error("Audience is empty");
	return {
		tpl,
		contacts,
		excludedCount,
		duplicateCount
	};
}
function computeIssuesAndRendered(tpl, contacts, variableMapping) {
	const required = tpl.variables ?? [];
	const issues = [];
	return {
		issues,
		rendered: contacts.map((c) => {
			const vars = {};
			for (const idx of required) {
				const field = variableMapping[idx];
				if (!field) {
					issues.push({
						contactId: c.id,
						contactName: c.name ?? "(unnamed)",
						phone: c.phone_number_normalized ?? "",
						variable: idx,
						field: "(unmapped)",
						fieldLabel: "Not mapped"
					});
					vars[idx] = "";
					continue;
				}
				const v = valueFor(c, field).trim();
				if (!v) issues.push({
					contactId: c.id,
					contactName: c.name ?? "(unnamed)",
					phone: c.phone_number_normalized ?? "",
					variable: idx,
					field,
					fieldLabel: FIELD_LABEL[field] ?? field
				});
				vars[idx] = v;
			}
			return {
				contact_id: c.id,
				phone_number_normalized: c.phone_number_normalized,
				rendered_variables: vars
			};
		})
	};
}
var previewCampaign_createServerFn_handler = createServerRpc({
	id: "7a4765948af1a0183bf63ffa21dea3db340f22765dc4edffb718a26c8297b12a",
	name: "previewCampaign",
	filename: "src/lib/campaigns.functions.ts"
}, (opts) => previewCampaign.__executeServer(opts));
var previewCampaign = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => baseSchema.parse(d)).handler(previewCampaign_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	await authorize(userId, "campaign.manage", null, data.tenantId);
	let targetGroupIds = [];
	if (data.audience.mode === "groups" && Array.isArray(data.audience.ids)) targetGroupIds = data.audience.ids;
	else if (data.audience.mode === "audience_builder") {
		let activeAudience = data.audience;
		if (data.audience.savedAudienceId) {
			const { data: sa } = await supabase.from("saved_audiences").select("criteria").eq("id", data.audience.savedAudienceId).maybeSingle();
			if (sa && sa.criteria) activeAudience = sa.criteria;
		}
		if (Array.isArray(activeAudience.includeGroups)) targetGroupIds = activeAudience.includeGroups;
	}
	for (const gid of targetGroupIds) try {
		await authorize(userId, "group.use", gid, data.tenantId);
	} catch {
		throw new Error("You do not have permission to target this shared group in campaigns.");
	}
	const { supabaseAdmin } = await import("./client.server-Bs0W82-x.mjs").then((n) => n.t).then((n) => n.t);
	const { tpl, contacts, excludedCount, duplicateCount } = await loadTemplateAndAudience(supabaseAdmin, data.tenantId, data.templateId, data.audience);
	const { issues } = computeIssuesAndRendered(tpl, contacts, data.variableMapping);
	return {
		totalRecipients: contacts.length,
		issues,
		requiredVariables: tpl.variables ?? [],
		excludedCount,
		duplicateCount
	};
});
var createCampaign_createServerFn_handler = createServerRpc({
	id: "fdd1cd7187316037ea146cc01f5803c448f81fba3975f8ab8d92e76b9ef5f2d3",
	name: "createCampaign",
	filename: "src/lib/campaigns.functions.ts"
}, (opts) => createCampaign.__executeServer(opts));
var createCampaign = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => baseSchema.parse(d)).handler(createCampaign_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	const { tenantId } = data;
	await authorize(userId, "campaign.manage", null, tenantId);
	let targetGroupIds = [];
	if (data.audience.mode === "groups" && Array.isArray(data.audience.ids)) targetGroupIds = data.audience.ids;
	else if (data.audience.mode === "audience_builder") {
		let activeAudience = data.audience;
		if (data.audience.savedAudienceId) {
			const { data: sa } = await supabase.from("saved_audiences").select("criteria").eq("id", data.audience.savedAudienceId).maybeSingle();
			if (sa && sa.criteria) activeAudience = sa.criteria;
		}
		if (Array.isArray(activeAudience.includeGroups)) targetGroupIds = activeAudience.includeGroups;
	}
	for (const gid of targetGroupIds) try {
		await authorize(userId, "group.use", gid, tenantId);
	} catch {
		throw new Error("You do not have permission to target this shared group in campaigns.");
	}
	const { supabaseAdmin } = await import("./client.server-Bs0W82-x.mjs").then((n) => n.t).then((n) => n.t);
	const { tpl, contacts } = await loadTemplateAndAudience(supabaseAdmin, tenantId, data.templateId, data.audience);
	const { issues, rendered } = computeIssuesAndRendered(tpl, contacts, data.variableMapping);
	if (issues.length) throw new Error(`VALIDATION_FAILED:${JSON.stringify({
		issues: issues.slice(0, 200),
		totalIssues: issues.length
	})}`);
	const shortPhones = contacts.filter((c) => {
		return (c.phone_number_normalized ?? "").replace(/\D+/g, "").length < 11;
	});
	if (shortPhones.length > 0) {
		const samples = shortPhones.slice(0, 5).map((c) => c.phone_number_normalized ?? "").join(", ");
		throw new Error(`PHONE_VALIDATION_FAILED:${JSON.stringify({
			message: `${shortPhones.length} contact(s) have phone numbers without a country code (e.g. 10-digit local numbers). Meta requires full international numbers (E.164 format). Please re-import these contacts with the correct country code. Affected sample numbers: ${samples}`,
			count: shortPhones.length,
			samples: shortPhones.slice(0, 10).map((c) => c.phone_number_normalized)
		})}`);
	}
	if (tpl.header_type === "IMAGE" && !data.mediaUrl) throw new Error("An image is required for this campaign template");
	const status = data.scheduledAt ? "scheduled" : "sending";
	const scheduled_at = data.scheduledAt ?? (/* @__PURE__ */ new Date()).toISOString();
	const { data: campaign, error: cmpErr } = await supabaseAdmin.from("campaigns").insert({
		tenant_id: tenantId,
		name: data.name,
		description: data.description ?? null,
		template_id: tpl.id,
		template_snapshot: tpl,
		audience_criteria: data.audience,
		variable_mapping: data.variableMapping,
		status,
		scheduled_at,
		total_recipients: rendered.length,
		created_by: userId
	}).select("id").single();
	if (cmpErr || !campaign) throw cmpErr ?? /* @__PURE__ */ new Error("Failed to create campaign");
	if (tpl.header_type === "IMAGE" && data.mediaUrl) {
		const fileName = data.mediaUrl.split("/").pop() || "campaign_image";
		const { error: mediaErr } = await supabaseAdmin.from("campaign_media").insert({
			tenant_id: tenantId,
			campaign_id: campaign.id,
			file_name: fileName,
			file_url: data.mediaUrl,
			uploaded_by: userId
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
				rendered_variables: r.rendered_variables,
				status: "pending",
				attempts: 0
			};
		});
		const { error } = await supabaseAdmin.from("campaign_recipients").insert(chunk);
		if (error) throw error;
	}
	if (targetGroupIds.length > 0) {
		const { data: groups } = await supabaseAdmin.from("groups").select("id, created_by").in("id", targetGroupIds);
		const sharedGroups = (groups ?? []).filter((g) => g.created_by && g.created_by !== userId);
		if (sharedGroups.length > 0) {
			const auditRows = sharedGroups.map((g) => ({
				tenant_id: tenantId,
				action: "campaign_created_with_shared_audience",
				entity_type: "campaign",
				entity_id: campaign.id,
				user_id: userId,
				metadata: {
					group_id: g.id,
					owner_id: g.created_by
				}
			}));
			await supabaseAdmin.from("audit_logs").insert(auditRows);
		}
	}
	if (!data.scheduledAt) {
		const origin = process.env.PUBLIC_BASE_URL ?? "https://convexa.virratglobal.com";
		fetch(`${origin}/api/public/hooks/process-campaigns`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: "{}"
		}).catch(() => {});
	}
	return {
		id: campaign.id,
		total: rendered.length
	};
});
var cancelCampaign_createServerFn_handler = createServerRpc({
	id: "9083bd210f05e1df59ad4ebedfe73428916782c1be9c0df2cd98f6cebf093691",
	name: "cancelCampaign",
	filename: "src/lib/campaigns.functions.ts"
}, (opts) => cancelCampaign.__executeServer(opts));
var cancelCampaign = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
	tenantId: stringType().uuid(),
	campaignId: stringType().uuid()
}).parse(d)).handler(cancelCampaign_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	const { tenantId, campaignId } = data;
	await authorize(userId, "campaign.manage", campaignId, tenantId);
	const { supabaseAdmin } = await import("./client.server-Bs0W82-x.mjs").then((n) => n.t).then((n) => n.t);
	const { error } = await supabaseAdmin.from("campaigns").update({ status: "cancelled" }).eq("id", campaignId).eq("tenant_id", tenantId).in("status", ["scheduled", "sending"]);
	if (error) throw error;
	return { ok: true };
});
var resumeCampaign_createServerFn_handler = createServerRpc({
	id: "756734ef907e5ce7fe12a526a4069035edbc168f308652f5e081d09cf4b86d82",
	name: "resumeCampaign",
	filename: "src/lib/campaigns.functions.ts"
}, (opts) => resumeCampaign.__executeServer(opts));
var resumeCampaign = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
	tenantId: stringType().uuid(),
	campaignId: stringType().uuid()
}).parse(d)).handler(resumeCampaign_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	const { tenantId, campaignId } = data;
	await authorize(userId, "campaign.manage", campaignId, tenantId);
	const { supabaseAdmin } = await import("./client.server-Bs0W82-x.mjs").then((n) => n.t).then((n) => n.t);
	const { error } = await supabaseAdmin.from("campaigns").update({
		status: "sending",
		started_at: (/* @__PURE__ */ new Date()).toISOString(),
		completed_at: null
	}).eq("id", campaignId).eq("tenant_id", tenantId).in("status", [
		"failed",
		"partial",
		"cancelled",
		"processing"
	]);
	if (error) throw error;
	const origin = process.env.PUBLIC_BASE_URL ?? "https://convexa.virratglobal.com";
	fetch(`${origin}/api/public/hooks/process-campaigns`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: "{}"
	}).catch(() => {});
	return { ok: true };
});
//#endregion
export { cancelCampaign_createServerFn_handler, createCampaign_createServerFn_handler, previewCampaign_createServerFn_handler, resumeCampaign_createServerFn_handler };
