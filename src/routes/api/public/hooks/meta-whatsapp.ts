import { createFileRoute } from "@tanstack/react-router";

type MetaStatus = {
  id: string;
  status: string;
  recipient_id: string;
  timestamp: string;
  errors?: Array<{
    code: number;
    title: string;
    message?: string;
    error_data?: { details?: string };
  }>;
};

type MetaMessage = {
  id: string;
  from: string;
  timestamp: string;
  type: string;
  text?: { body: string };
};

type MetaChange = {
  value: {
    metadata: { phone_number_id: string };
    messages?: MetaMessage[];
    statuses?: MetaStatus[];
  };
  field: string;
};

export const Route = createFileRoute("/api/public/hooks/meta-whatsapp")({
  server: {
    handlers: {
      // Webhook verification handshake
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const mode = url.searchParams.get("hub.mode");
        const token = url.searchParams.get("hub.verify_token");
        const challenge = url.searchParams.get("hub.challenge");

        if (mode !== "subscribe" || !token || !challenge) {
          return new Response("Bad request", { status: 400 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // 1. First look up the token from tenants table (auto-generated unique per tenant)
        const { data: tenantData } = await supabaseAdmin
          .from("tenants")
          .select("id")
          .eq("webhook_verify_token", token)
          .maybeSingle();

        if (tenantData) {
          await supabaseAdmin
            .from("whatsapp_credentials")
            .update({ last_incoming_webhook_at: new Date().toISOString() })
            .eq("tenant_id", tenantData.id)
            .eq("is_default", true);

          return new Response(challenge, {
            status: 200,
            headers: { "content-type": "text/plain" },
          });
        }

        // 2. Fallback: look up the token in whatsapp_credentials table (for existing verified tokens)
        const { data: credData } = await supabaseAdmin
          .from("whatsapp_credentials")
          .select("tenant_id")
          .eq("webhook_verify_token", token)
          .maybeSingle();

        if (credData) {
          await supabaseAdmin
            .from("whatsapp_credentials")
            .update({ last_incoming_webhook_at: new Date().toISOString() })
            .eq("tenant_id", credData.tenant_id)
            .eq("webhook_verify_token", token);

          return new Response(challenge, {
            status: 200,
            headers: { "content-type": "text/plain" },
          });
        }

        return new Response("Forbidden", { status: 403 });
      },

      POST: async ({ request }) => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const raw = await request.text();
        let payload: { entry?: Array<{ changes?: MetaChange[] }> };
        try {
          payload = JSON.parse(raw);
        } catch {
          return new Response("Bad JSON", { status: 400 });
        }

        for (const entry of payload.entry ?? []) {
          for (const change of entry.changes ?? []) {
            const phoneNumberId = change.value?.metadata?.phone_number_id;
            if (!phoneNumberId) continue;

            // Resolve tenant_id deterministically if multiple credentials share the same phone_number_id
            const { data: cred } = await supabaseAdmin
              .from("whatsapp_credentials")
              .select("tenant_id")
              .eq("phone_number_id", phoneNumberId)
              .order("last_success_at", { ascending: false, nullsFirst: false })
              .order("updated_at", { ascending: false })
              .limit(1)
              .maybeSingle();

            if (!cred) continue;
            const tenantId = cred.tenant_id;

            // Update connection health metric for this credentials record
            await supabaseAdmin
              .from("whatsapp_credentials")
              .update({ last_incoming_webhook_at: new Date().toISOString() })
              .eq("tenant_id", tenantId)
              .eq("phone_number_id", phoneNumberId);

            // Log raw webhook event
            await supabaseAdmin.from("webhook_events").insert({
              tenant_id: tenantId,
              source: "meta",
              event_type: change.field,
              payload: change as never,
            });

            // Delivery status updates
            for (const s of change.value.statuses ?? []) {
              const updatePayload: any = {
                meta_status: s.status,
              };

              // Map delivery timestamps
              if (s.status === "delivered") {
                updatePayload.delivered_at = new Date().toISOString();
              } else if (s.status === "read") {
                updatePayload.read_at = new Date().toISOString();
                // Ensure delivered_at is also set
                updatePayload.delivered_at = new Date().toISOString();
              } else if (s.status === "failed") {
                updatePayload.status = "failed";
                const errObj = s.errors?.[0];
                if (errObj) {
                  const details = errObj.message ?? errObj.error_data?.details ?? "Unknown error";
                  updatePayload.meta_error = `(${errObj.code}) ${errObj.title}: ${details}`;
                } else {
                  updatePayload.meta_error = "Meta delivery failed";
                }
              }

              // Update campaign recipient
              const { data: recipient } = await supabaseAdmin
                .from("campaign_recipients")
                .update(updatePayload)
                .eq("meta_message_id", s.id)
                .eq("tenant_id", tenantId)
                .select("id, campaign_id")
                .maybeSingle();

              // Update in messages table — also update sent_at/delivered_at/read_at
              const msgUpdate: Record<string, string | null> = { status: s.status };
              if (s.status === "sent") msgUpdate.sent_at = new Date().toISOString();
              if (s.status === "delivered") msgUpdate.delivered_at = new Date().toISOString();
              if (s.status === "read") {
                msgUpdate.read_at = new Date().toISOString();
                msgUpdate.delivered_at = new Date().toISOString();
              }
              await supabaseAdmin
                .from("messages")
                .update(msgUpdate as never)
                .eq("meta_message_id", s.id)
                .eq("tenant_id", tenantId);

              // If status failed, also insert into campaign_logs
              if (s.status === "failed" && recipient) {
                const errObj = s.errors?.[0];
                const errMsg = errObj
                  ? `(${errObj.code}) ${errObj.title}: ${errObj.message ?? "Unknown details"}`
                  : "Webhook reported delivery failure";
                await supabaseAdmin.from("campaign_logs").insert({
                  tenant_id: tenantId,
                  campaign_id: recipient.campaign_id,
                  recipient_id: recipient.id,
                  log_type: "delivery_fail",
                  response_payload: s as any,
                  error_message: errMsg,
                });
              }

              // Update campaign counters and verify completion if status changes
              if (recipient && s.status === "failed") {
                await supabaseAdmin.rpc("increment_campaign_counters", {
                  _campaign_id: recipient.campaign_id,
                  _processed: 0,
                  _failed: 1,
                });
              }
            }

            // Inbound messages — extend conversation with phone_number & last_message
            for (const m of change.value.messages ?? []) {
              const from = m.from.replace(/\D/g, "");
              const msgBody = m.text?.body ?? `[${m.type}]`;
              const now = new Date().toISOString();

              const { data: contact } = await supabaseAdmin
                .from("contacts")
                .select("id, name")
                .eq("tenant_id", tenantId)
                .eq("phone_number_normalized", from)
                .is("deleted_at", null)
                .maybeSingle();

              let contactId = contact?.id;
              if (!contactId) {
                const { data: ins } = await supabaseAdmin
                  .from("contacts")
                  .insert({
                    tenant_id: tenantId,
                    name: from,
                    phone_number_raw: from,
                    phone_number_normalized: from,
                    opt_in_source: "inbound",
                    opt_in_date: now,
                  })
                  .select("id")
                  .single();
                contactId = ins?.id;
              }
              if (!contactId) continue;

              // Robust conversation lookup: first search by contact_id, then by phone_number
              let { data: existingConv } = await supabaseAdmin
                .from("conversations")
                .select("id, unread_count, contact_id")
                .eq("tenant_id", tenantId)
                .eq("contact_id", contactId)
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle();

              if (!existingConv && from) {
                const { data: convByPhone } = await supabaseAdmin
                  .from("conversations")
                  .select("id, unread_count, contact_id")
                  .eq("tenant_id", tenantId)
                  .eq("phone_number", from)
                  .order("created_at", { ascending: false })
                  .limit(1)
                  .maybeSingle();
                existingConv = convByPhone;
              }

              let convId: string;
              if (existingConv) {
                convId = existingConv.id;
                await supabaseAdmin
                  .from("conversations")
                  .update({
                    contact_id: contactId || existingConv.contact_id,
                    last_message: msgBody,
                    last_message_at: now,
                    last_inbound_at: now,
                    unread_count: (existingConv.unread_count ?? 0) + 1,
                    phone_number: from,
                    status: "open",
                    updated_at: now,
                  })
                  .eq("id", convId);
              } else {
                const { data: newConv } = await supabaseAdmin
                  .from("conversations")
                  .upsert(
                    {
                      tenant_id: tenantId,
                      contact_id: contactId,
                      phone_number: from,
                      last_message: msgBody,
                      last_message_at: now,
                      last_inbound_at: now,
                      unread_count: 1,
                      status: "open",
                      updated_at: now,
                    },
                    { onConflict: "tenant_id,contact_id" },
                  )
                  .select("id")
                  .single();
                if (!newConv) continue;
                convId = newConv.id;
              }

              await supabaseAdmin.from("messages").insert({
                tenant_id: tenantId,
                conversation_id: convId,
                contact_id: contactId,
                direction: "in",
                type: m.type,
                body: msgBody,
                meta_message_id: m.id,
                status: "received",
                payload: m as never,
              });
            }
          }
        }

        return new Response("ok");
      },
    },
  },
});
