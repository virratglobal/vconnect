import { createFileRoute } from "@tanstack/react-router";

const META_API = "https://graph.facebook.com/v20.0";

export const Route = createFileRoute("/api/debug/send-test")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const authHeader = request.headers.get("authorization");
          if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return Response.json({ error: "Unauthorized: Missing Bearer Token" }, { status: 401 });
          }

          const token = authHeader.replace("Bearer ", "");
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

          const {
            data: { user },
            error: authErr,
          } = await supabaseAdmin.auth.getUser(token);
          if (authErr || !user) {
            return Response.json({ error: "Unauthorized: Invalid Session" }, { status: 401 });
          }

          // Parse input body
          const body = await request.json();
          const { phone_number, template_name, media_url, tenant_id, variables } = body;

          if (!phone_number || !template_name) {
            return Response.json(
              { error: "Missing required fields: phone_number, template_name" },
              { status: 400 },
            );
          }

          // Resolve tenant ID
          let resolvedTenantId = tenant_id;
          if (!resolvedTenantId) {
            // Find first tenant membership
            const { data: membership } = await supabaseAdmin
              .from("tenant_members")
              .select("tenant_id")
              .eq("user_id", user.id)
              .limit(1)
              .maybeSingle();

            if (!membership) {
              return Response.json(
                { error: "User is not associated with any tenant" },
                { status: 403 },
              );
            }
            resolvedTenantId = membership.tenant_id;
          }

          // Retrieve credentials
          const { data: creds } = await supabaseAdmin
            .from("whatsapp_credentials")
            .select("phone_number_id, access_token")
            .eq("tenant_id", resolvedTenantId)
            .maybeSingle();

          if (!creds?.phone_number_id || !creds.access_token) {
            return Response.json(
              { error: "WhatsApp credentials not configured for this tenant" },
              { status: 400 },
            );
          }

          // Fetch the template to construct variables correctly
          const { data: dbTemplate } = await supabaseAdmin
            .from("message_templates")
            .select("language, variables, header_type")
            .eq("tenant_id", resolvedTenantId)
            .eq("template_name", template_name)
            .maybeSingle();

          if (!dbTemplate) {
            return Response.json(
              { error: `Message template "${template_name}" not found in database.` },
              { status: 404 },
            );
          }

          const lang = (dbTemplate.language ?? "").trim();
          if (!lang) {
            return Response.json(
              {
                error: `Template language is empty for "${template_name}". Re-sync your templates.`,
              },
              { status: 400 },
            );
          }
          const vars = (dbTemplate?.variables as string[]) || [];

          // Normalize phone number (E.164, strip non-digits)
          const normalizedPhone = phone_number.replace(/\D/g, "");

          // Construct parameters
          const parameters = vars.map((idx) => {
            const val = (variables?.[idx] ?? `Test_${idx}`).toString();
            return { type: "text", text: val || "-" };
          });

          const components: any[] = [];
          if (parameters.length) {
            components.push({ type: "body", parameters });
          }

          if (media_url && (dbTemplate?.header_type === "IMAGE" || !dbTemplate)) {
            components.push({
              type: "header",
              parameters: [
                {
                  type: "image",
                  image: { link: media_url },
                },
              ],
            });
          }

          const payload = {
            messaging_product: "whatsapp",
            to: normalizedPhone,
            type: "template",
            template: {
              name: template_name,
              language: { code: lang },
              components,
            },
          };

          // Send directly to Meta
          const res = await fetch(`${META_API}/${creds.phone_number_id}/messages`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${creds.access_token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });

          const responseText = await res.text();
          let responseJson = {};
          try {
            responseJson = JSON.parse(responseText);
          } catch {
            responseJson = { raw: responseText };
          }

          return Response.json({
            payload,
            http_status: res.status,
            response: responseJson,
            message_id: (responseJson as any)?.messages?.[0]?.id || null,
            delivery_status:
              res.ok && (responseJson as any)?.messages?.[0]?.id ? "sent_to_meta" : "failed",
          });
        } catch (e: any) {
          return Response.json({ error: e.message }, { status: 500 });
        }
      },
    },
  },
});
