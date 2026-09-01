import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type AuthAction =
  | "contact.view"
  | "contact.manage"
  | "contact.create"
  | "contact.bulk_update"
  | "contact.saved_audience.manage"
  | "campaign.view"
  | "campaign.manage"
  | "campaign.send"
  | "conversation.reply"
  | "conversation.view"
  | "group.share"
  | "group.view"
  | "group.edit"
  | "group.use"
  | "whatsapp.config.view"
  | "whatsapp.config.manage"
  | "whatsapp.diagnostics.view"
  | "webhook.stats.view"
  | "debug.send_message";

/**
 * Shared authorization service to check if a user is permitted to perform an action.
 * Throws a descriptive error on failure, or returns membership info on success.
 */
export async function authorize(
  userId: string,
  action: AuthAction,
  resourceId?: string | null,
  tenantId?: string | null
): Promise<{ role: "owner" | "admin" | "manager" | "agent" }> {
  let resolvedTenantId = tenantId;

  // 1. Resolve tenant ID if not provided but resourceId is
  if (!resolvedTenantId && resourceId) {
    if (action.startsWith("contact.")) {
      const { data } = await supabaseAdmin
        .from("contacts")
        .select("tenant_id")
        .eq("id", resourceId)
        .maybeSingle();
      resolvedTenantId = data?.tenant_id || null;
    } else if (action.startsWith("conversation.")) {
      const { data } = await supabaseAdmin
        .from("conversations")
        .select("tenant_id")
        .eq("id", resourceId)
        .maybeSingle();
      resolvedTenantId = data?.tenant_id || null;
    } else if (action.startsWith("group.")) {
      const { data } = await supabaseAdmin
        .from("groups")
        .select("tenant_id")
        .eq("id", resourceId)
        .maybeSingle();
      resolvedTenantId = data?.tenant_id || null;
    } else if (action.startsWith("campaign.")) {
      const { data } = await supabaseAdmin
        .from("campaigns")
        .select("tenant_id")
        .eq("id", resourceId)
        .maybeSingle();
      resolvedTenantId = data?.tenant_id || null;
    }
  }

  if (!resolvedTenantId) {
    throw new Error("Forbidden: tenant context not resolved");
  }

  // 2. Fetch user's membership and role in this tenant
  const { data: member, error: memberError } = await supabaseAdmin
    .from("tenant_members")
    .select("role")
    .eq("tenant_id", resolvedTenantId)
    .eq("user_id", userId)
    .maybeSingle();

  if (memberError || !member) {
    throw new Error("Forbidden");
  }

  const role = member.role as "owner" | "admin" | "manager" | "agent";

  // 3. Perform action-specific checks
  switch (action) {
    case "contact.view": {
      if (!resourceId) throw new Error("Contact ID is required");
      const { data: canView } = await supabaseAdmin.rpc("can_view_contact", {
        _contact_id: resourceId,
        _user_id: userId,
      });
      if (!canView) throw new Error("Forbidden");
      break;
    }

    case "contact.manage": {
      if (!resourceId) throw new Error("Contact ID is required");
      const { data: canManage } = await supabaseAdmin.rpc("can_manage_contact", {
        _contact_id: resourceId,
        _user_id: userId,
      });
      if (!canManage) throw new Error("Forbidden");
      break;
    }

    case "contact.create":
    case "contact.bulk_update": {
      // Must be a member (already checked above)
      break;
    }

    case "contact.saved_audience.manage": {
      if (role !== "owner" && role !== "admin" && role !== "manager") {
        throw new Error("Forbidden");
      }
      break;
    }

    case "campaign.view": {
      if (!resourceId) throw new Error("Campaign ID is required");
      const { data: canView } = await supabaseAdmin.rpc("can_view_campaign", {
        _campaign_id: resourceId,
        _user_id: userId,
      });
      if (!canView) throw new Error("Forbidden");
      break;
    }

    case "campaign.manage":
    case "campaign.send": {
      // Verify tenant member can manage/send
      if (resourceId) {
        const { data: canView } = await supabaseAdmin.rpc("can_view_campaign", {
          _campaign_id: resourceId,
          _user_id: userId,
        });
        if (!canView) throw new Error("Forbidden");
      }
      break;
    }

    case "conversation.view":
    case "conversation.reply": {
      if (!resourceId) throw new Error("Conversation ID is required");
      const { data: canView } = await supabaseAdmin.rpc("can_view_conversation", {
        _conversation_id: resourceId,
        _user_id: userId,
      });
      if (!canView) throw new Error("Forbidden");
      break;
    }

    case "group.share": {
      if (!resourceId) throw new Error("Group ID is required");
      const { data: group } = await supabaseAdmin
        .from("groups")
        .select("created_by")
        .eq("id", resourceId)
        .single();
      const isOwner = group && group.created_by === userId;
      if (role !== "owner" && role !== "admin" && role !== "manager" && !isOwner) {
        throw new Error("Only Owners, Admins, and Managers can share contact groups.");
      }
      break;
    }

    case "group.view": {
      if (!resourceId) throw new Error("Group ID is required");
      const { data: canView } = await supabaseAdmin.rpc("can_view_group", {
        _group_id: resourceId,
        _user_id: userId,
      });
      if (!canView) throw new Error("Forbidden");
      break;
    }

    case "group.edit": {
      if (!resourceId) throw new Error("Group ID is required");
      const { data: canEdit } = await supabaseAdmin.rpc("can_edit_group", {
        _group_id: resourceId,
        _user_id: userId,
      });
      if (!canEdit) throw new Error("Forbidden");
      break;
    }

    case "group.use": {
      if (!resourceId) throw new Error("Group ID is required");
      const { data: canUse } = await supabaseAdmin.rpc("can_use_shared_audience", {
        _group_id: resourceId,
        _user_id: userId,
      });
      if (!canUse) throw new Error("Forbidden");
      break;
    }

    case "whatsapp.config.view": {
      if (role !== "owner" && role !== "admin") {
        throw new Error("Access Denied: You do not have permission to view WhatsApp credentials");
      }
      break;
    }

    case "whatsapp.config.manage": {
      if (role !== "owner" && role !== "admin") {
        throw new Error("Access Denied: You do not have permission to edit WhatsApp credentials");
      }
      if (role === "admin") {
        const { data: tenant } = await supabaseAdmin
          .from("tenants")
          .select("allow_admin_whatsapp_config")
          .eq("id", resolvedTenantId)
          .single();
        if (!tenant?.allow_admin_whatsapp_config) {
          throw new Error("Access Denied: The organization owner has disabled administrator modifications for WhatsApp credentials.");
        }
      }
      break;
    }

    case "whatsapp.diagnostics.view": {
      if (role !== "owner" && role !== "admin" && role !== "manager") {
        throw new Error("Access Denied: You do not have permission to view WhatsApp diagnostics");
      }
      break;
    }

    case "webhook.stats.view": {
      if (role !== "owner" && role !== "admin" && role !== "manager") {
        throw new Error("Access Denied: You do not have permission to view webhook stats");
      }
      break;
    }

    case "debug.send_message": {
      if (role !== "owner" && role !== "admin") {
        throw new Error("Access Denied: You do not have permission to send debug messages");
      }
      break;
    }

    default: {
      const _exhaustiveCheck: never = action;
      throw new Error(`Unsupported authorization action: ${_exhaustiveCheck}`);
    }
  }

  return { role };
}
