import { n as supabaseAdmin } from "./client.server-Bs0W82-x.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/authorization.server-Dvum_v3H.js
/**
* Shared authorization service to check if a user is permitted to perform an action.
* Throws a descriptive error on failure, or returns membership info on success.
*/
async function authorize(userId, action, resourceId, tenantId) {
	let resolvedTenantId = tenantId;
	if (!resolvedTenantId && resourceId) {
		if (action.startsWith("contact.")) {
			const { data } = await supabaseAdmin.from("contacts").select("tenant_id").eq("id", resourceId).maybeSingle();
			resolvedTenantId = data?.tenant_id || null;
		} else if (action.startsWith("conversation.")) {
			const { data } = await supabaseAdmin.from("conversations").select("tenant_id").eq("id", resourceId).maybeSingle();
			resolvedTenantId = data?.tenant_id || null;
		} else if (action.startsWith("group.")) {
			const { data } = await supabaseAdmin.from("groups").select("tenant_id").eq("id", resourceId).maybeSingle();
			resolvedTenantId = data?.tenant_id || null;
		} else if (action.startsWith("campaign.")) {
			const { data } = await supabaseAdmin.from("campaigns").select("tenant_id").eq("id", resourceId).maybeSingle();
			resolvedTenantId = data?.tenant_id || null;
		}
	}
	if (!resolvedTenantId) throw new Error("Forbidden: tenant context not resolved");
	const { data: member, error: memberError } = await supabaseAdmin.from("tenant_members").select("role").eq("tenant_id", resolvedTenantId).eq("user_id", userId).maybeSingle();
	if (memberError || !member) throw new Error("Forbidden");
	const role = member.role;
	switch (action) {
		case "contact.view": {
			if (!resourceId) throw new Error("Contact ID is required");
			const { data: canView } = await supabaseAdmin.rpc("can_view_contact", {
				_contact_id: resourceId,
				_user_id: userId
			});
			if (!canView) throw new Error("Forbidden");
			break;
		}
		case "contact.manage": {
			if (!resourceId) throw new Error("Contact ID is required");
			const { data: canManage } = await supabaseAdmin.rpc("can_manage_contact", {
				_contact_id: resourceId,
				_user_id: userId
			});
			if (!canManage) throw new Error("Forbidden");
			break;
		}
		case "contact.create":
		case "contact.bulk_update": break;
		case "contact.saved_audience.manage":
			if (role !== "owner" && role !== "admin" && role !== "manager") throw new Error("Forbidden");
			break;
		case "campaign.view": {
			if (!resourceId) throw new Error("Campaign ID is required");
			const { data: canView } = await supabaseAdmin.rpc("can_view_campaign", {
				_campaign_id: resourceId,
				_user_id: userId
			});
			if (!canView) throw new Error("Forbidden");
			break;
		}
		case "campaign.manage":
		case "campaign.send":
			if (resourceId) {
				const { data: canView } = await supabaseAdmin.rpc("can_view_campaign", {
					_campaign_id: resourceId,
					_user_id: userId
				});
				if (!canView) throw new Error("Forbidden");
			}
			break;
		case "conversation.view":
		case "conversation.reply": {
			if (!resourceId) throw new Error("Conversation ID is required");
			const { data: canView } = await supabaseAdmin.rpc("can_view_conversation", {
				_conversation_id: resourceId,
				_user_id: userId
			});
			if (!canView) throw new Error("Forbidden");
			break;
		}
		case "group.share": {
			if (!resourceId) throw new Error("Group ID is required");
			const { data: group } = await supabaseAdmin.from("groups").select("created_by").eq("id", resourceId).single();
			const isOwner = group && group.created_by === userId;
			if (role !== "owner" && role !== "admin" && role !== "manager" && !isOwner) throw new Error("Only Owners, Admins, and Managers can share contact groups.");
			break;
		}
		case "group.view": {
			if (!resourceId) throw new Error("Group ID is required");
			const { data: canView } = await supabaseAdmin.rpc("can_view_group", {
				_group_id: resourceId,
				_user_id: userId
			});
			if (!canView) throw new Error("Forbidden");
			break;
		}
		case "group.edit": {
			if (!resourceId) throw new Error("Group ID is required");
			const { data: canEdit } = await supabaseAdmin.rpc("can_edit_group", {
				_group_id: resourceId,
				_user_id: userId
			});
			if (!canEdit) throw new Error("Forbidden");
			break;
		}
		case "group.use": {
			if (!resourceId) throw new Error("Group ID is required");
			const { data: canUse } = await supabaseAdmin.rpc("can_use_shared_audience", {
				_group_id: resourceId,
				_user_id: userId
			});
			if (!canUse) throw new Error("Forbidden");
			break;
		}
		case "whatsapp.config.view":
			if (role !== "owner" && role !== "admin") throw new Error("Access Denied: You do not have permission to view WhatsApp credentials");
			break;
		case "whatsapp.config.manage":
			if (role !== "owner" && role !== "admin") throw new Error("Access Denied: You do not have permission to edit WhatsApp credentials");
			if (role === "admin") {
				const { data: tenant } = await supabaseAdmin.from("tenants").select("allow_admin_whatsapp_config").eq("id", resolvedTenantId).single();
				if (!tenant?.allow_admin_whatsapp_config) throw new Error("Access Denied: The organization owner has disabled administrator modifications for WhatsApp credentials.");
			}
			break;
		case "whatsapp.diagnostics.view":
			if (role !== "owner" && role !== "admin" && role !== "manager") throw new Error("Access Denied: You do not have permission to view WhatsApp diagnostics");
			break;
		case "webhook.stats.view":
			if (role !== "owner" && role !== "admin" && role !== "manager") throw new Error("Access Denied: You do not have permission to view webhook stats");
			break;
		case "debug.send_message":
			if (role !== "owner" && role !== "admin") throw new Error("Access Denied: You do not have permission to send debug messages");
			break;
		default: throw new Error(`Unsupported authorization action: ${action}`);
	}
	return { role };
}
//#endregion
export { authorize };
