import { l as createServerFn } from "./esm-9EjmF9OT.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-BBYtZ6z0.mjs";
import { t as createServerRpc } from "./createServerRpc-TAUNrjZd.mjs";
import { authorize } from "./authorization.server-9qb3Vk4A.mjs";
import { a as sendMetaTemplate, i as sendMetaFreeform, n as META_TIMEOUT_MS, r as metaAuthHeader, t as META_API } from "./whatsapp-service-CN9sXmbC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/conversations.functions-D407vEJK.js
var sendConversationReply_createServerFn_handler = createServerRpc({
	id: "3c995c0aaf452a864821d3ab8ca7f4ec233508b65892e914fd4867f2c2debcf9",
	name: "sendConversationReply",
	filename: "src/lib/conversations.functions.ts"
}, (opts) => sendConversationReply.__executeServer(opts));
var sendConversationReply = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => d).handler(sendConversationReply_createServerFn_handler, async ({ data, context }) => {
	const { supabase: userSupabase, userId } = context;
	const { messageId, tenantId, conversationId, contactId, phoneNumber, messageType, messageText, mediaUrl, templateName, templateVariables } = data;
	await authorize(userId, "conversation.reply", conversationId, tenantId);
	const { data: existingMsg } = await userSupabase.from("messages").select("id").eq("id", messageId).maybeSingle();
	if (existingMsg) return {
		ok: false,
		error: "Duplicate submission ignored."
	};
	let bodyText = messageText || "";
	let previewText = "";
	if (messageType === "text") previewText = messageText || "";
	else if (messageType === "image") {
		bodyText = mediaUrl || "";
		previewText = "📷 Image";
	} else if (messageType === "document") {
		bodyText = messageText || "Document";
		previewText = "📄 Document";
	} else if (messageType === "audio") {
		bodyText = mediaUrl || "";
		previewText = "🎵 Audio";
	} else if (messageType === "video") {
		bodyText = mediaUrl || "";
		previewText = "🎥 Video";
	} else if (messageType === "template") {
		previewText = templateName || "Template";
		const { data: dbTemplate } = await userSupabase.from("message_templates").select("body").eq("tenant_id", tenantId).eq("template_name", templateName).maybeSingle();
		let tplBody = dbTemplate?.body || "";
		if (templateVariables) for (const [key, val] of Object.entries(templateVariables)) tplBody = tplBody.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), val || "");
		bodyText = tplBody;
	}
	const { error: insertErr } = await userSupabase.from("messages").insert({
		id: messageId,
		tenant_id: tenantId,
		conversation_id: conversationId,
		contact_id: contactId,
		direction: "out",
		type: messageType === "template" ? "template" : messageType,
		body: bodyText,
		status: "sending",
		media_url: mediaUrl || null,
		created_at: (/* @__PURE__ */ new Date()).toISOString()
	});
	if (insertErr) return {
		ok: false,
		error: `Failed to initialize message: ${insertErr.message}`
	};
	await userSupabase.from("conversations").update({
		last_message: previewText || bodyText,
		last_message_at: (/* @__PURE__ */ new Date()).toISOString(),
		status: "open"
	}).eq("id", conversationId);
	const { supabaseAdmin } = await import("./client.server-Ck2b02Cx.mjs").then((n) => n.t).then((n) => n.t);
	const { data: creds } = await supabaseAdmin.from("whatsapp_credentials").select("*").eq("tenant_id", tenantId).eq("is_default", true).maybeSingle();
	if (!creds?.phone_number_id || !creds.access_token) {
		await userSupabase.from("messages").update({ status: "failed" }).eq("id", messageId);
		return {
			ok: false,
			error: "WhatsApp credentials not configured for this workspace."
		};
	}
	const normalizedPhone = phoneNumber.replace(/\D/g, "");
	let sendResult;
	if (messageType === "template") {
		const { data: dbTemplate } = await userSupabase.from("message_templates").select("*").eq("tenant_id", tenantId).eq("template_name", templateName).maybeSingle();
		if (!dbTemplate) {
			await userSupabase.from("messages").update({ status: "failed" }).eq("id", messageId);
			return {
				ok: false,
				error: `Message template "${templateName}" not found.`
			};
		}
		sendResult = await sendMetaTemplate({
			phoneNumberId: creds.phone_number_id,
			accessToken: creds.access_token,
			to: normalizedPhone,
			template: {
				template_name: dbTemplate.template_name,
				language: dbTemplate.language || "en",
				body: dbTemplate.body || "",
				variables: dbTemplate.variables || [],
				header_type: dbTemplate.header_type,
				header_format: dbTemplate.header_format
			},
			variables: templateVariables || {},
			mediaUrl: mediaUrl || null
		});
	} else sendResult = await sendMetaFreeform({
		phoneNumberId: creds.phone_number_id,
		accessToken: creds.access_token,
		to: normalizedPhone,
		type: messageType,
		body: bodyText,
		mediaUrl: mediaUrl || null
	});
	if (sendResult.ok) {
		await supabaseAdmin.from("whatsapp_credentials").update({ last_successful_message_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("tenant_id", tenantId).eq("is_default", true);
		await userSupabase.from("messages").update({
			status: "sent",
			meta_message_id: sendResult.id,
			sent_at: (/* @__PURE__ */ new Date()).toISOString(),
			payload: sendResult.requestPayload
		}).eq("id", messageId);
		await userSupabase.from("audit_logs").insert({
			tenant_id: tenantId,
			user_id: userId,
			action: "send_reply",
			entity_type: "message",
			entity_id: messageId,
			metadata: {
				conversation_id: conversationId,
				meta_message_id: sendResult.id,
				timestamp: (/* @__PURE__ */ new Date()).toISOString(),
				reply_type: messageType
			}
		});
		return {
			ok: true,
			messageId: sendResult.id
		};
	} else {
		await userSupabase.from("messages").update({
			status: "failed",
			payload: sendResult.requestPayload
		}).eq("id", messageId);
		return {
			ok: false,
			error: sendResult.error
		};
	}
});
var retryConversationReply_createServerFn_handler = createServerRpc({
	id: "86aa98318deb44875ce145d4d9b7a51eef982d7d1d1f678ead22e0473396b162",
	name: "retryConversationReply",
	filename: "src/lib/conversations.functions.ts"
}, (opts) => retryConversationReply.__executeServer(opts));
var retryConversationReply = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => d).handler(retryConversationReply_createServerFn_handler, async ({ data, context }) => {
	const { supabase: userSupabase, userId } = context;
	const { tenantId, messageId } = data;
	const { data: msg } = await userSupabase.from("messages").select("*, conversations(*)").eq("id", messageId).maybeSingle();
	if (!msg || msg.status !== "failed") return {
		ok: false,
		error: "Failed message not found or already processed."
	};
	const conversations = msg.conversations;
	const conversationId = msg.conversation_id;
	await authorize(userId, "conversation.reply", conversationId, tenantId);
	msg.contact_id;
	const phoneNumber = conversations?.phone_number;
	if (!phoneNumber) return {
		ok: false,
		error: "Customer phone number not resolved."
	};
	let messageType = "text";
	if (msg.type === "template") messageType = "template";
	else if (msg.type === "image") messageType = "image";
	else if (msg.type === "document") messageType = "document";
	else if (msg.type === "audio") messageType = "audio";
	else if (msg.type === "video") messageType = "video";
	await userSupabase.from("messages").update({ status: "sending" }).eq("id", messageId);
	const { supabaseAdmin } = await import("./client.server-Ck2b02Cx.mjs").then((n) => n.t).then((n) => n.t);
	const { data: creds } = await supabaseAdmin.from("whatsapp_credentials").select("*").eq("tenant_id", tenantId).eq("is_default", true).maybeSingle();
	if (!creds?.phone_number_id || !creds.access_token) {
		await userSupabase.from("messages").update({ status: "failed" }).eq("id", messageId);
		return {
			ok: false,
			error: "WhatsApp credentials not configured for this workspace."
		};
	}
	const normalizedPhone = phoneNumber.replace(/\D/g, "");
	let sendResult;
	const originalPayload = msg.payload;
	if (originalPayload && typeof originalPayload === "object" && originalPayload.messaging_product) {
		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(), META_TIMEOUT_MS);
		try {
			const res = await fetch(`${META_API}/${creds.phone_number_id}/messages`, {
				method: "POST",
				headers: {
					Authorization: metaAuthHeader(creds.access_token),
					"Content-Type": "application/json"
				},
				body: JSON.stringify(originalPayload),
				signal: controller.signal
			});
			clearTimeout(timer);
			const text = await res.text();
			let json = {};
			try {
				json = JSON.parse(text);
			} catch {
				json = { raw: text };
			}
			if (!res.ok) sendResult = {
				ok: false,
				error: json?.error?.message ?? `Meta API returned HTTP ${res.status}`,
				requestPayload: originalPayload,
				responsePayload: json
			};
			else {
				const messageId = json?.messages?.[0]?.id;
				if (!messageId) sendResult = {
					ok: false,
					error: "Meta API response did not contain a message ID",
					requestPayload: originalPayload,
					responsePayload: json
				};
				else sendResult = {
					ok: true,
					id: messageId,
					requestPayload: originalPayload,
					responsePayload: json
				};
			}
		} catch (e) {
			clearTimeout(timer);
			sendResult = {
				ok: false,
				error: e.message || "Request timed out",
				requestPayload: originalPayload,
				responsePayload: { error: e.message }
			};
		}
	} else if (messageType === "template") {
		const payloadTpl = msg.payload?.template;
		if (payloadTpl) sendResult = await sendMetaTemplate({
			phoneNumberId: creds.phone_number_id,
			accessToken: creds.access_token,
			to: normalizedPhone,
			template: {
				template_name: payloadTpl.name,
				language: payloadTpl.language?.code || "en",
				body: msg.body || "",
				variables: []
			},
			variables: {},
			mediaUrl: msg.media_url
		});
		else sendResult = await sendMetaFreeform({
			phoneNumberId: creds.phone_number_id,
			accessToken: creds.access_token,
			to: normalizedPhone,
			type: "text",
			body: msg.body
		});
	} else sendResult = await sendMetaFreeform({
		phoneNumberId: creds.phone_number_id,
		accessToken: creds.access_token,
		to: normalizedPhone,
		type: messageType,
		body: msg.body,
		mediaUrl: msg.media_url
	});
	if (sendResult.ok) {
		await supabaseAdmin.from("whatsapp_credentials").update({ last_successful_message_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("tenant_id", tenantId).eq("is_default", true);
		await userSupabase.from("messages").update({
			status: "sent",
			meta_message_id: sendResult.id,
			sent_at: (/* @__PURE__ */ new Date()).toISOString(),
			payload: sendResult.requestPayload
		}).eq("id", messageId);
		await userSupabase.from("audit_logs").insert({
			tenant_id: tenantId,
			user_id: userId,
			action: "send_reply_retry",
			entity_type: "message",
			entity_id: messageId,
			metadata: {
				conversation_id: conversationId,
				meta_message_id: sendResult.id,
				timestamp: (/* @__PURE__ */ new Date()).toISOString(),
				reply_type: messageType
			}
		});
		return {
			ok: true,
			messageId: sendResult.id
		};
	} else {
		await userSupabase.from("messages").update({
			status: "failed",
			payload: sendResult.requestPayload
		}).eq("id", messageId);
		return {
			ok: false,
			error: sendResult.error
		};
	}
});
var getConversationsList_createServerFn_handler = createServerRpc({
	id: "e1894197d9fbb6266e4cfa5b66eb442bf823a9ac3708d55d37ae05445c0b22fb",
	name: "getConversationsList",
	filename: "src/lib/conversations.functions.ts"
}, (opts) => getConversationsList.__executeServer(opts));
var getConversationsList = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => d).handler(getConversationsList_createServerFn_handler, async ({ data, context }) => {
	const { userId } = context;
	const { tenantId, statusFilter = "all", assignFilter = "all", priorityFilter = "all" } = data;
	const { supabaseAdmin } = await import("./client.server-Ck2b02Cx.mjs").then((n) => n.t).then((n) => n.t);
	const { data: member, error: memErr } = await supabaseAdmin.from("tenant_members").select("role").eq("tenant_id", tenantId).eq("user_id", userId).single();
	if (memErr || !member) throw new Error("Unauthorized access to workspace conversations.");
	let q = supabaseAdmin.from("conversations").select("*, contact:contact_id(id, name, phone_number_normalized), assignee:profiles!conversations_assigned_to_fkey(id, full_name, email)").eq("tenant_id", tenantId).order("last_message_at", {
		ascending: false,
		nullsFirst: false
	});
	if (statusFilter !== "all") q = q.eq("status", statusFilter);
	if (assignFilter === "mine") q = q.eq("assigned_to", userId);
	if (assignFilter === "unassigned") q = q.is("assigned_to", null);
	if (assignFilter === "replied") {
		const { data: inboundMsgs } = await supabaseAdmin.from("conversation_messages").select("conversation_id").eq("tenant_id", tenantId).eq("direction", "inbound");
		const repliedIds = Array.from(new Set((inboundMsgs ?? []).map((m) => m.conversation_id).filter((id) => !!id)));
		if (repliedIds.length > 0) q = q.in("id", repliedIds);
		else q = q.not("last_inbound_at", "is", null);
	}
	if (priorityFilter !== "all") q = q.eq("priority", priorityFilter);
	if (member.role === "agent" && assignFilter === "all") q = q.eq("assigned_to", userId);
	const { data: rawConvs, error: convErr } = await q;
	if (convErr) throw convErr;
	const convs = rawConvs ?? [];
	const missingContactInfo = convs.filter((c) => !c.contact?.name && c.phone_number);
	if (missingContactInfo.length > 0) {
		const { data: tenantContacts } = await supabaseAdmin.from("contacts").select("id, name, phone_number_normalized").eq("tenant_id", tenantId);
		if (tenantContacts && tenantContacts.length > 0) {
			const contactMap = /* @__PURE__ */ new Map();
			for (const tc of tenantContacts) if (tc.phone_number_normalized && tc.name) {
				const digits = tc.phone_number_normalized.replace(/\D/g, "");
				if (digits) contactMap.set(digits, {
					id: tc.id,
					name: tc.name,
					phone_number_normalized: tc.phone_number_normalized
				});
			}
			for (const conv of missingContactInfo) {
				const digits = (conv.phone_number ?? "").replace(/\D/g, "");
				const match = contactMap.get(digits);
				if (match) {
					conv.contact = match;
					if (!conv.contact_id) {
						conv.contact_id = match.id;
						supabaseAdmin.from("conversations").update({ contact_id: match.id }).eq("id", conv.id).then(() => {});
					}
				}
			}
		}
	}
	return convs;
});
//#endregion
export { getConversationsList_createServerFn_handler, retryConversationReply_createServerFn_handler, sendConversationReply_createServerFn_handler };
