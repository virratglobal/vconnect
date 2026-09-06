import { l as createServerFn } from "./esm-9EjmF9OT.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-BBYtZ6z0.mjs";
import { t as createServerRpc } from "./createServerRpc-TAUNrjZd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-BPkHPLi1.js
var deleteOrganization_createServerFn_handler = createServerRpc({
	id: "6dc32d7f4b92c8e4470ff6be8ad5336162bab4ff415d0e288b4f4f879c74e95f",
	name: "deleteOrganization",
	filename: "src/routes/_authenticated/settings.tsx"
}, (opts) => deleteOrganization.__executeServer(opts));
var deleteOrganization = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => d).handler(deleteOrganization_createServerFn_handler, async ({ data, context }) => {
	const { userId } = context;
	const { tenantId } = data;
	const { supabaseAdmin } = await import("./client.server-Ck2b02Cx.mjs").then((n) => n.t).then((n) => n.t);
	const { data: member, error: memErr } = await supabaseAdmin.from("tenant_members").select("role").eq("tenant_id", tenantId).eq("user_id", userId).maybeSingle();
	if (memErr || !member || member.role !== "owner") throw new Error("Access Denied: Only the organization owner can delete the organization.");
	const { error: delErr } = await supabaseAdmin.from("tenants").delete().eq("id", tenantId);
	if (delErr) throw delErr;
	return { success: true };
});
var getWhatsAppConfig_createServerFn_handler = createServerRpc({
	id: "4cbecaef7fbb8557762a9b3ab912600208de5ddb3b4cb35e5b4042800c75fc05",
	name: "getWhatsAppConfig",
	filename: "src/routes/_authenticated/settings.tsx"
}, (opts) => getWhatsAppConfig.__executeServer(opts));
var getWhatsAppConfig = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).inputValidator((d) => d).handler(getWhatsAppConfig_createServerFn_handler, async ({ data, context }) => {
	const { tenantId } = data;
	const { supabase: userSupabase, userId } = context;
	const { data: member, error: memberError } = await userSupabase.from("tenant_members").select("role").eq("tenant_id", tenantId).eq("user_id", userId).maybeSingle();
	if (memberError) throw memberError;
	const role = member?.role;
	if (role !== "owner" && role !== "admin") throw new Error("Access Denied: You do not have permission to view WhatsApp credentials");
	const { data: tenant, error: tenantError } = await userSupabase.from("tenants").select("allow_admin_whatsapp_config").eq("id", tenantId).single();
	if (tenantError) throw tenantError;
	const { data: creds, error: credsError } = await userSupabase.from("whatsapp_credentials").select("*").eq("tenant_id", tenantId).eq("is_default", true).maybeSingle();
	if (credsError) throw credsError;
	function maskToken(token) {
		if (!token) return "";
		if (token.length <= 4) return "************";
		return "************" + token.slice(-4);
	}
	return {
		creds: {
			phone_number_id: creds?.phone_number_id ?? "",
			waba_id: creds?.waba_id ?? "",
			display_phone_number: creds?.display_phone_number ?? "",
			access_token: maskToken(creds?.access_token || null),
			status: creds?.status ?? "disconnected"
		},
		allowAdminWhatsappConfig: tenant?.allow_admin_whatsapp_config ?? true,
		role
	};
});
var saveWhatsAppConfig_createServerFn_handler = createServerRpc({
	id: "c0ee1c71cd012ba410476afd2d07b1227f9a9ad09cf44b0b97055af0eba56dff",
	name: "saveWhatsAppConfig",
	filename: "src/routes/_authenticated/settings.tsx"
}, (opts) => saveWhatsAppConfig.__executeServer(opts));
var saveWhatsAppConfig = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => d).handler(saveWhatsAppConfig_createServerFn_handler, async ({ data, context }) => {
	const { tenantId, phone_number_id, waba_id, display_phone_number, access_token, allowAdminWhatsappConfig } = data;
	const { supabase: userSupabase, userId } = context;
	const { data: member, error: memberError } = await userSupabase.from("tenant_members").select("role").eq("tenant_id", tenantId).eq("user_id", userId).maybeSingle();
	if (memberError) throw memberError;
	const role = member?.role;
	if (role !== "owner" && role !== "admin") throw new Error("Access Denied: You do not have permission to edit WhatsApp credentials");
	const { data: tenant, error: tenantReadError } = await userSupabase.from("tenants").select("allow_admin_whatsapp_config").eq("id", tenantId).single();
	if (tenantReadError) throw tenantReadError;
	if (role === "admin" && !tenant?.allow_admin_whatsapp_config) throw new Error("Access Denied: The organization owner has disabled administrator modifications for WhatsApp credentials.");
	if (allowAdminWhatsappConfig !== void 0) {
		if (role !== "owner") throw new Error("Access Denied: Only the organization owner can change administrator permissions.");
		const { error: tenantErr } = await userSupabase.from("tenants").update({ allow_admin_whatsapp_config: allowAdminWhatsappConfig }).eq("id", tenantId);
		if (tenantErr) throw tenantErr;
	}
	let tokenToSave = access_token.trim();
	if (tokenToSave.startsWith("************")) {
		const { data: existing } = await userSupabase.from("whatsapp_credentials").select("access_token").eq("tenant_id", tenantId).eq("is_default", true).maybeSingle();
		tokenToSave = existing?.access_token ?? "";
	}
	const { data: existingCreds, error: existingCredsError } = await userSupabase.from("whatsapp_credentials").select("id").eq("tenant_id", tenantId).eq("is_default", true).maybeSingle();
	if (existingCredsError) throw existingCredsError;
	if (existingCreds) {
		const { error: updateErr } = await userSupabase.from("whatsapp_credentials").update({
			phone_number_id: phone_number_id.trim() || null,
			waba_id: waba_id.trim() || null,
			display_phone_number: display_phone_number.trim() || null,
			access_token: tokenToSave || null,
			status: tokenToSave ? "configured" : "disconnected",
			updated_at: (/* @__PURE__ */ new Date()).toISOString()
		}).eq("id", existingCreds.id);
		if (updateErr) throw updateErr;
	} else {
		const { error: insertErr } = await userSupabase.from("whatsapp_credentials").insert({
			tenant_id: tenantId,
			phone_number_id: phone_number_id.trim() || null,
			waba_id: waba_id.trim() || null,
			display_phone_number: display_phone_number.trim() || null,
			access_token: tokenToSave || null,
			status: tokenToSave ? "configured" : "disconnected",
			is_default: true,
			account_name: "Primary Number"
		});
		if (insertErr) throw insertErr;
	}
	return { success: true };
});
var getMetaDiagnostics_createServerFn_handler = createServerRpc({
	id: "61c3f582cdac0a308798c6b257e9376ad59856a8acc668e76d7acb35a572e6dd",
	name: "getMetaDiagnostics",
	filename: "src/routes/_authenticated/settings.tsx"
}, (opts) => getMetaDiagnostics.__executeServer(opts));
var getMetaDiagnostics = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).inputValidator((d) => d).handler(getMetaDiagnostics_createServerFn_handler, async ({ data, context }) => {
	const { tenantId } = data;
	const userId = context.userId;
	const { supabaseAdmin } = await import("./client.server-Ck2b02Cx.mjs").then((n) => n.t).then((n) => n.t);
	const { authorize } = await import("./authorization.server-9qb3Vk4A.mjs");
	await authorize(userId, "whatsapp.diagnostics.view", null, tenantId);
	const { data: creds } = await supabaseAdmin.from("whatsapp_credentials").select("*").eq("tenant_id", tenantId).eq("is_default", true).maybeSingle();
	if (!creds?.phone_number_id || !creds.access_token) return {
		ok: false,
		error: "Credentials not configured"
	};
	try {
		const phoneRes = await fetch(`https://graph.facebook.com/v20.0/${creds.phone_number_id}?fields=quality_rating,status,messaging_limit_tier,whatsapp_business_manager_messaging_limit,verified_name,code_verification_status,name_status,account_mode`, { headers: { Authorization: `Bearer ${creds.access_token}` } });
		if (!phoneRes.ok) {
			const text = await phoneRes.text();
			return {
				ok: false,
				error: `Meta Phone API: ${phoneRes.status} (${text.slice(0, 300)})`
			};
		}
		const phoneJson = await phoneRes.json();
		let webhookSubs = null;
		let webhookSubsError = null;
		if (creds.waba_id) try {
			const subRes = await fetch(`https://graph.facebook.com/v20.0/${creds.waba_id}/subscribed_apps`, { headers: { Authorization: `Bearer ${creds.access_token}` } });
			const subJson = await subRes.json();
			if (subRes.ok) webhookSubs = subJson.data ?? [];
			else webhookSubsError = subJson?.error?.message ?? `HTTP ${subRes.status}`;
		} catch (e) {
			webhookSubsError = e.message;
		}
		const limitTier = phoneJson.whatsapp_business_manager_messaging_limit || phoneJson.messaging_limit_tier || "TIER_50";
		const accountMode = phoneJson.account_mode ?? null;
		const isSandbox = accountMode === "SANDBOX" || limitTier === "TIER_50" || (phoneJson.verified_name ?? "").toLowerCase().includes("test");
		const hasWebhookSubscription = Array.isArray(webhookSubs) && webhookSubs.length > 0;
		return {
			ok: true,
			data: {
				status: phoneJson.status || "CONNECTED",
				verified_name: phoneJson.verified_name || "Unknown",
				name_status: phoneJson.name_status || "APPROVED",
				quality_rating: phoneJson.quality_rating || "GREEN",
				messaging_limit_tier: limitTier,
				code_verification_status: phoneJson.code_verification_status || "VERIFIED",
				account_mode: accountMode,
				waba_id: creds.waba_id || "Unknown",
				phone_number_id: creds.phone_number_id,
				is_test_mode: isSandbox,
				webhook_verify_token_set: !!creds.webhook_verify_token,
				webhook_subs: webhookSubs,
				webhook_subs_error: webhookSubsError,
				has_webhook_subscription: hasWebhookSubscription,
				token_expiry_at: creds.token_expiry_at || null
			}
		};
	} catch (e) {
		return {
			ok: false,
			error: e.message || "Failed to call Meta Cloud API"
		};
	}
});
var getWebhookStats_createServerFn_handler = createServerRpc({
	id: "16b339b55d60c49ef121d8e456281924ec22ba9a53c97b4d5dd76e01637c6b9a",
	name: "getWebhookStats",
	filename: "src/routes/_authenticated/settings.tsx"
}, (opts) => getWebhookStats.__executeServer(opts));
var getWebhookStats = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).inputValidator((d) => d).handler(getWebhookStats_createServerFn_handler, async ({ data, context }) => {
	const { tenantId } = data;
	const userId = context.userId;
	const { supabaseAdmin } = await import("./client.server-Ck2b02Cx.mjs").then((n) => n.t).then((n) => n.t);
	const { authorize } = await import("./authorization.server-9qb3Vk4A.mjs");
	await authorize(userId, "webhook.stats.view", null, tenantId);
	const { count: totalEvents } = await supabaseAdmin.from("webhook_events").select("*", {
		count: "exact",
		head: true
	}).eq("tenant_id", tenantId);
	const { count: deliveryEvents } = await supabaseAdmin.from("campaign_recipients").select("*", {
		count: "exact",
		head: true
	}).eq("tenant_id", tenantId).not("meta_status", "is", null);
	const { count: failedDelivery } = await supabaseAdmin.from("campaign_recipients").select("*", {
		count: "exact",
		head: true
	}).eq("tenant_id", tenantId).eq("meta_status", "failed");
	const { count: sentCount } = await supabaseAdmin.from("campaign_recipients").select("*", {
		count: "exact",
		head: true
	}).eq("tenant_id", tenantId).not("meta_message_id", "is", null);
	return {
		total_webhook_events: totalEvents ?? 0,
		delivery_status_updates: deliveryEvents ?? 0,
		failed_deliveries: failedDelivery ?? 0,
		messages_sent_to_meta: sentCount ?? 0
	};
});
var sendDirectDebugMessage_createServerFn_handler = createServerRpc({
	id: "4bee8307c28c32b7730f8c750801efcf2d76c6b5b4f240f075a9057fd8276d99",
	name: "sendDirectDebugMessage",
	filename: "src/routes/_authenticated/settings.tsx"
}, (opts) => sendDirectDebugMessage.__executeServer(opts));
var sendDirectDebugMessage = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => d).handler(sendDirectDebugMessage_createServerFn_handler, async ({ data, context }) => {
	const { tenantId, phoneNumber, templateName, mediaUrl } = data;
	const userId = context.userId;
	const { supabaseAdmin } = await import("./client.server-Ck2b02Cx.mjs").then((n) => n.t).then((n) => n.t);
	const { authorize } = await import("./authorization.server-9qb3Vk4A.mjs");
	await authorize(userId, "debug.send_message", null, tenantId);
	const { data: creds } = await supabaseAdmin.from("whatsapp_credentials").select("*").eq("tenant_id", tenantId).eq("is_default", true).maybeSingle();
	if (!creds?.phone_number_id || !creds.access_token) return {
		ok: false,
		error: "Credentials not configured"
	};
	const { data: dbTemplate } = await supabaseAdmin.from("message_templates").select("language, variables, header_type").eq("tenant_id", tenantId).eq("template_name", templateName).maybeSingle();
	if (!dbTemplate) return {
		ok: false,
		error: `Message template "${templateName}" not found in database.`
	};
	const lang = (dbTemplate.language ?? "").trim();
	if (!lang) return {
		ok: false,
		error: `Template language is empty for "${templateName}". Re-sync your templates.`
	};
	const vars = dbTemplate.variables || [];
	const normalizedPhone = phoneNumber.replace(/\D/g, "");
	const parameters = vars.map((idx) => ({
		type: "text",
		text: `Test_${idx}`
	}));
	const components = [];
	if (parameters.length) components.push({
		type: "body",
		parameters
	});
	if (mediaUrl) components.push({
		type: "header",
		parameters: [{
			type: "image",
			image: { link: mediaUrl }
		}]
	});
	const payload = {
		messaging_product: "whatsapp",
		to: normalizedPhone,
		type: "template",
		template: {
			name: templateName,
			language: { code: lang },
			components
		}
	};
	try {
		const res = await fetch(`https://graph.facebook.com/v20.0/${creds.phone_number_id}/messages`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${creds.access_token}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify(payload)
		});
		const text = await res.text();
		let responseJson = {};
		try {
			responseJson = JSON.parse(text);
		} catch {
			responseJson = { raw: text };
		}
		await supabaseAdmin.from("campaign_logs").insert({
			tenant_id: tenantId,
			log_type: "debug_test_message",
			request_payload: payload,
			response_payload: responseJson,
			http_status: res.status,
			error_message: res.ok ? null : responseJson?.error?.message || "Failed test message"
		});
		return {
			ok: res.ok,
			payload,
			status: res.status,
			response: responseJson,
			message_id: responseJson?.messages?.[0]?.id || null,
			delivery_status: res.ok && responseJson?.messages?.[0]?.id ? "sent_to_meta" : "failed"
		};
	} catch (e) {
		return {
			ok: false,
			error: e.message
		};
	}
});
//#endregion
export { deleteOrganization_createServerFn_handler, getMetaDiagnostics_createServerFn_handler, getWebhookStats_createServerFn_handler, getWhatsAppConfig_createServerFn_handler, saveWhatsAppConfig_createServerFn_handler, sendDirectDebugMessage_createServerFn_handler };
