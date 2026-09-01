import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { authorize } from "./authorization.server";
import {
  sendMetaFreeform,
  sendMetaTemplate,
  META_API,
  META_TIMEOUT_MS,
  metaAuthHeader,
} from "./whatsapp-service";

export const sendConversationReply = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      messageId: string;
      tenantId: string;
      conversationId: string;
      contactId: string | null;
      phoneNumber: string;
      messageType: "text" | "image" | "document" | "audio" | "video" | "template";
      messageText?: string | null;
      mediaUrl?: string | null;
      templateName?: string | null;
      templateVariables?: Record<string, string> | null;
    }) => d,
  )
  .handler(async ({ data, context }) => {
    const { supabase: userSupabase, userId } = context;
    const {
      messageId,
      tenantId,
      conversationId,
      contactId,
      phoneNumber,
      messageType,
      messageText,
      mediaUrl,
      templateName,
      templateVariables,
    } = data;

    await authorize(userId, "conversation.reply", conversationId, tenantId);

    // 1. Duplicate Send Protection (Check if message ID already exists)
    const { data: existingMsg } = await userSupabase
      .from("messages")
      .select("id")
      .eq("id", messageId)
      .maybeSingle();

    if (existingMsg) {
      return { ok: false, error: "Duplicate submission ignored." };
    }

    // Determine the body text to store
    let bodyText = messageText || "";
    let previewText = "";

    if (messageType === "text") {
      previewText = messageText || "";
    } else if (messageType === "image") {
      bodyText = mediaUrl || "";
      previewText = "📷 Image";
    } else if (messageType === "document") {
      bodyText = messageText || "Document"; // messageText holds filename for document
      previewText = "📄 Document";
    } else if (messageType === "audio") {
      bodyText = mediaUrl || "";
      previewText = "🎵 Audio";
    } else if (messageType === "video") {
      bodyText = mediaUrl || "";
      previewText = "🎥 Video";
    } else if (messageType === "template") {
      previewText = templateName || "Template";
      // Resolve variable substitutions for local text preview
      const { data: dbTemplate } = await userSupabase
        .from("message_templates")
        .select("body")
        .eq("tenant_id", tenantId)
        .eq("template_name", templateName!)
        .maybeSingle();

      let tplBody = dbTemplate?.body || "";
      if (templateVariables) {
        for (const [key, val] of Object.entries(templateVariables)) {
          tplBody = tplBody.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), val || "");
        }
      }
      bodyText = tplBody;
    }

    // 2. Insert message with 'sending' status (Optimistic rendering support)
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
      created_at: new Date().toISOString(),
    });

    if (insertErr) {
      return { ok: false, error: `Failed to initialize message: ${insertErr.message}` };
    }

    // 3. Immediately update conversation sidebar preview
    await userSupabase
      .from("conversations")
      .update({
        last_message: previewText || bodyText,
        last_message_at: new Date().toISOString(),
        status: "open",
      })
      .eq("id", conversationId);

    // 4. Fetch tenant-specific credentials using supabaseAdmin to bypass RLS for non-owners
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: creds } = await supabaseAdmin
      .from("whatsapp_credentials")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("is_default", true)
      .maybeSingle();

    if (!creds?.phone_number_id || !creds.access_token) {
      await userSupabase.from("messages").update({ status: "failed" }).eq("id", messageId);
      return { ok: false, error: "WhatsApp credentials not configured for this workspace." };
    }

    // 5. Send message using WhatsApp Cloud API via shared service
    const normalizedPhone = phoneNumber.replace(/\D/g, "");
    let sendResult;

    if (messageType === "template") {
      // Fetch template variables structure
      const { data: dbTemplate } = await userSupabase
        .from("message_templates")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("template_name", templateName!)
        .maybeSingle();

      if (!dbTemplate) {
        await userSupabase.from("messages").update({ status: "failed" }).eq("id", messageId);
        return { ok: false, error: `Message template "${templateName}" not found.` };
      }

      sendResult = await sendMetaTemplate({
        phoneNumberId: creds.phone_number_id,
        accessToken: creds.access_token,
        to: normalizedPhone,
        template: {
          template_name: dbTemplate.template_name,
          language: dbTemplate.language || "en",
          body: dbTemplate.body || "",
          variables: (dbTemplate.variables as string[]) || [],
          header_type: dbTemplate.header_type,
          header_format: dbTemplate.header_format,
        },
        variables: templateVariables || {},
        mediaUrl: mediaUrl || null,
      });
    } else {
      sendResult = await sendMetaFreeform({
        phoneNumberId: creds.phone_number_id,
        accessToken: creds.access_token,
        to: normalizedPhone,
        type: messageType,
        body: bodyText,
        mediaUrl: mediaUrl || null,
      });
    }

    // 6. Update message status based on API result
    if (sendResult.ok) {
      await supabaseAdmin
        .from("whatsapp_credentials")
        .update({ last_successful_message_at: new Date().toISOString() })
        .eq("tenant_id", tenantId)
        .eq("is_default", true);

      await userSupabase
        .from("messages")
        .update({
          status: "sent",
          meta_message_id: sendResult.id,
          sent_at: new Date().toISOString(),
          payload: sendResult.requestPayload as any,
        })
        .eq("id", messageId);

      // 7. Store Audit Log for the outbound reply
      await userSupabase.from("audit_logs").insert({
        tenant_id: tenantId,
        user_id: userId,
        action: "send_reply",
        entity_type: "message",
        entity_id: messageId,
        metadata: {
          conversation_id: conversationId,
          meta_message_id: sendResult.id,
          timestamp: new Date().toISOString(),
          reply_type: messageType,
        },
      });

      return { ok: true, messageId: sendResult.id };
    } else {
      await userSupabase
        .from("messages")
        .update({
          status: "failed",
          payload: sendResult.requestPayload as any,
        })
        .eq("id", messageId);

      return { ok: false, error: sendResult.error };
    }
  });

export const retryConversationReply = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { tenantId: string; messageId: string }) => d)
  .handler(async ({ data, context }) => {
    const { supabase: userSupabase, userId } = context;
    const { tenantId, messageId } = data;

    // Retrieve failed message
    const { data: msg } = await userSupabase
      .from("messages")
      .select("*, conversations(*)")
      .eq("id", messageId)
      .maybeSingle();

    if (!msg || msg.status !== "failed") {
      return { ok: false, error: "Failed message not found or already processed." };
    }

    const conversations = msg.conversations;
    const conversationId = msg.conversation_id;

    await authorize(userId, "conversation.reply", conversationId, tenantId);

    const contactId = msg.contact_id;
    const phoneNumber = conversations?.phone_number;

    if (!phoneNumber) {
      return { ok: false, error: "Customer phone number not resolved." };
    }

    // Map database type back to messageType
    let messageType: "text" | "image" | "document" | "audio" | "video" | "template" = "text";
    if (msg.type === "template") messageType = "template";
    else if (msg.type === "image") messageType = "image";
    else if (msg.type === "document") messageType = "document";
    else if (msg.type === "audio") messageType = "audio";
    else if (msg.type === "video") messageType = "video";

    // Set status to 'sending'
    await userSupabase.from("messages").update({ status: "sending" }).eq("id", messageId);

    // Fetch tenant-specific credentials using supabaseAdmin to bypass RLS for non-owners
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: creds } = await supabaseAdmin
      .from("whatsapp_credentials")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("is_default", true)
      .maybeSingle();

    if (!creds?.phone_number_id || !creds.access_token) {
      await userSupabase.from("messages").update({ status: "failed" }).eq("id", messageId);
      return { ok: false, error: "WhatsApp credentials not configured for this workspace." };
    }

    const normalizedPhone = phoneNumber.replace(/\D/g, "");
    let sendResult;

    // Check if we have the original request payload stored, so we can dispatch it directly!
    const originalPayload = msg.payload as any;
    if (
      originalPayload &&
      typeof originalPayload === "object" &&
      originalPayload.messaging_product
    ) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), META_TIMEOUT_MS);
      try {
        const res = await fetch(`${META_API}/${creds.phone_number_id}/messages`, {
          method: "POST",
          headers: {
            Authorization: metaAuthHeader(creds.access_token),
            "Content-Type": "application/json",
          },
          body: JSON.stringify(originalPayload),
          signal: controller.signal,
        });
        clearTimeout(timer);
        const text = await res.text();
        let json: any = {};
        try {
          json = JSON.parse(text);
        } catch {
          json = { raw: text };
        }

        if (!res.ok) {
          const errMsg = json?.error?.message ?? `Meta API returned HTTP ${res.status}`;
          sendResult = {
            ok: false,
            error: errMsg,
            requestPayload: originalPayload,
            responsePayload: json,
          };
        } else {
          const messageId = json?.messages?.[0]?.id;
          if (!messageId) {
            sendResult = {
              ok: false,
              error: "Meta API response did not contain a message ID",
              requestPayload: originalPayload,
              responsePayload: json,
            };
          } else {
            sendResult = {
              ok: true,
              id: messageId,
              requestPayload: originalPayload,
              responsePayload: json,
            };
          }
        }
      } catch (e: any) {
        clearTimeout(timer);
        sendResult = {
          ok: false,
          error: e.message || "Request timed out",
          requestPayload: originalPayload,
          responsePayload: { error: e.message },
        };
      }
    } else {
      // Fallback if no valid payload was stored
      if (messageType === "template") {
        const payloadTpl = (
          msg.payload as { template?: { name: string; language?: { code?: string } } } | null
        )?.template;
        if (payloadTpl) {
          sendResult = await sendMetaTemplate({
            phoneNumberId: creds.phone_number_id,
            accessToken: creds.access_token,
            to: normalizedPhone,
            template: {
              template_name: payloadTpl.name,
              language: payloadTpl.language?.code || "en",
              body: msg.body || "",
              variables: [],
            },
            variables: {},
            mediaUrl: msg.media_url,
          });
        } else {
          sendResult = await sendMetaFreeform({
            phoneNumberId: creds.phone_number_id,
            accessToken: creds.access_token,
            to: normalizedPhone,
            type: "text",
            body: msg.body,
          });
        }
      } else {
        sendResult = await sendMetaFreeform({
          phoneNumberId: creds.phone_number_id,
          accessToken: creds.access_token,
          to: normalizedPhone,
          type: messageType,
          body: msg.body,
          mediaUrl: msg.media_url,
        });
      }
    }

    if (sendResult.ok) {
      await supabaseAdmin
        .from("whatsapp_credentials")
        .update({ last_successful_message_at: new Date().toISOString() })
        .eq("tenant_id", tenantId)
        .eq("is_default", true);

      await userSupabase
        .from("messages")
        .update({
          status: "sent",
          meta_message_id: sendResult.id,
          sent_at: new Date().toISOString(),
          payload: sendResult.requestPayload as any,
        })
        .eq("id", messageId);

      // Audit Log
      await userSupabase.from("audit_logs").insert({
        tenant_id: tenantId,
        user_id: userId,
        action: "send_reply_retry",
        entity_type: "message",
        entity_id: messageId,
        metadata: {
          conversation_id: conversationId,
          meta_message_id: sendResult.id,
          timestamp: new Date().toISOString(),
          reply_type: messageType,
        },
      });

      return { ok: true, messageId: sendResult.id };
    } else {
      await userSupabase
        .from("messages")
        .update({
          status: "failed",
          payload: sendResult.requestPayload as any,
        })
        .eq("id", messageId);

      return { ok: false, error: sendResult.error };
    }
  });

export const getConversationsList = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      tenantId: string;
      statusFilter?: string;
      assignFilter?: string;
      priorityFilter?: string;
    }) => d,
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { tenantId, statusFilter = "all", assignFilter = "all", priorityFilter = "all" } = data;

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // 1. Verify user membership in tenant
    const { data: member, error: memErr } = await supabaseAdmin
      .from("tenant_members")
      .select("role")
      .eq("tenant_id", tenantId)
      .eq("user_id", userId)
      .single();

    if (memErr || !member) {
      throw new Error("Unauthorized access to workspace conversations.");
    }

    // 2. Fetch conversations using supabaseAdmin
    let q = supabaseAdmin
      .from("conversations")
      .select(
        "*, contact:contact_id(id, name, phone_number_normalized), assignee:profiles!conversations_assigned_to_fkey(id, full_name, email)",
      )
      .eq("tenant_id", tenantId)
      .order("last_message_at", { ascending: false, nullsFirst: false });

    if (statusFilter !== "all") q = q.eq("status", statusFilter);
    if (assignFilter === "mine") q = q.eq("assigned_to", userId);
    if (assignFilter === "unassigned") q = q.is("assigned_to", null);
    if (assignFilter === "replied") {
      const { data: inboundMsgs } = await supabaseAdmin
        .from("conversation_messages")
        .select("conversation_id")
        .eq("tenant_id", tenantId)
        .eq("direction", "inbound");

      const repliedIds = Array.from(
        new Set((inboundMsgs ?? []).map((m) => m.conversation_id).filter((id): id is string => !!id)),
      );

      if (repliedIds.length > 0) {
        q = q.in("id", repliedIds);
      } else {
        q = q.not("last_inbound_at", "is", null);
      }
    }
    if (priorityFilter !== "all") q = q.eq("priority", priorityFilter);

    // If role is agent and filter is 'all', restrict to assigned conversations for security
    if (member.role === "agent" && assignFilter === "all") {
      q = q.eq("assigned_to", userId);
    }

    const { data: rawConvs, error: convErr } = await q;
    if (convErr) throw convErr;

    const convs = (rawConvs ?? []) as any[];

    // 3. Auto-resolve & heal contact names: for any conversations missing contact details, match by phone digits
    const missingContactInfo = convs.filter((c) => !c.contact?.name && c.phone_number);

    if (missingContactInfo.length > 0) {
      const { data: tenantContacts } = await supabaseAdmin
        .from("contacts")
        .select("id, name, phone_number_normalized")
        .eq("tenant_id", tenantId);

      if (tenantContacts && tenantContacts.length > 0) {
        const contactMap = new Map<string, { id: string; name: string; phone_number_normalized: string }>();
        for (const tc of tenantContacts) {
          if (tc.phone_number_normalized && tc.name) {
            const digits = tc.phone_number_normalized.replace(/\D/g, "");
            if (digits) {
              contactMap.set(digits, {
                id: tc.id,
                name: tc.name,
                phone_number_normalized: tc.phone_number_normalized,
              });
            }
          }
        }

        for (const conv of missingContactInfo) {
          const digits = (conv.phone_number ?? "").replace(/\D/g, "");
          const match = contactMap.get(digits);
          if (match) {
            conv.contact = match;
            if (!conv.contact_id) {
              conv.contact_id = match.id;
              // Persist foreign key link in database asynchronously
              supabaseAdmin
                .from("conversations")
                .update({ contact_id: match.id })
                .eq("id", conv.id)
                .then(() => {});
            }
          }
        }
      }
    }

    return convs;
  });
