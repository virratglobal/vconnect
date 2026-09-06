import { createFileRoute } from "@tanstack/react-router";
import { sendMetaTemplate } from "@/lib/whatsapp-service";
import type { TemplateSnapshot } from "@/lib/whatsapp-service";

const BATCH = 50;

export const Route = createFileRoute("/api/public/hooks/process-campaigns")({
  server: {
    handlers: {
      POST: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // Reset any recipient rows stuck in 'sending' status for > 10 minutes back to 'pending'
        // This handles execution interrupts/restarts gracefully and prevents campaigns from being stuck
        const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
        await supabaseAdmin
          .from("campaign_recipients")
          .update({ status: "pending" })
          .eq("status", "sending")
          .lt("updated_at", tenMinsAgo);

        // Update scheduled campaigns to processing
        await supabaseAdmin
          .from("campaigns")
          .update({ status: "processing", started_at: new Date().toISOString() })
          .eq("status", "scheduled")
          .lte("scheduled_at", new Date().toISOString());

        const { data: active } = await supabaseAdmin
          .from("campaigns")
          .select(
            "id, tenant_id, template_id, template_snapshot, total_recipients, processed_count, failed_count, audience_criteria, created_by, tenants:tenant_id(suspended), campaign_media(file_url)",
          )
          .in("status", ["queued", "sending", "processing"])
          .limit(20);

        if (!active?.length) return Response.json({ processed: 0 });

        let totalSent = 0;
        for (const c of active) {
          // Check if workspace is suspended
          let isSuspended = (c as any).tenants?.suspended === true;
          if (isSuspended) {
            // Bypass suspension for mail@virratglobal.com
            const { data: ownerMember } = await supabaseAdmin
              .from("tenant_members")
              .select("user_id")
              .eq("tenant_id", c.tenant_id)
              .eq("role", "owner")
              .maybeSingle();

            let ownerEmail: string | null = null;
            if (ownerMember?.user_id) {
              const { data: ownerProfile } = await supabaseAdmin
                .from("profiles")
                .select("email")
                .eq("id", ownerMember.user_id)
                .maybeSingle();
              ownerEmail = ownerProfile?.email ?? null;
            }

            if (ownerEmail === "mail@virratglobal.com") {
              isSuspended = false;
            }
          }

          if (isSuspended) {
            await supabaseAdmin
              .from("campaigns")
              .update({ status: "failed", completed_at: new Date().toISOString() })
              .eq("id", c.id);
            await supabaseAdmin.from("system_errors").insert({
              tenant_id: c.tenant_id,
              type: "campaign_send",
              error: "Campaign aborted: Workspace is suspended",
              context: { campaign_id: c.id } as never,
            });
            continue;
          }

          // Check if creator's permission has been revoked
          if (c.created_by) {
            const { data: isCreatorManagerPlus } = await supabaseAdmin.rpc("has_tenant_role", {
              _tenant: c.tenant_id,
              _user: c.created_by,
              _roles: ["owner", "admin", "manager"],
            });

            if (!isCreatorManagerPlus) {
              const audience = c.audience_criteria as any;
              let targetGroupIds: string[] = [];
              if (audience) {
                if (audience.mode === "groups" && Array.isArray(audience.ids)) {
                  targetGroupIds = audience.ids;
                } else if (audience.mode === "audience_builder") {
                  let activeAudience = audience;
                  if (audience.savedAudienceId) {
                    const { data: sa } = await supabaseAdmin
                      .from("saved_audiences")
                      .select("criteria")
                      .eq("id", audience.savedAudienceId)
                      .maybeSingle();
                    if (sa && sa.criteria) activeAudience = sa.criteria;
                  }
                  if (Array.isArray(activeAudience.includeGroups)) {
                    targetGroupIds = activeAudience.includeGroups;
                  }
                }
              }

              if (targetGroupIds.length > 0) {
                const { data: groups } = await supabaseAdmin
                  .from("groups")
                  .select("id, created_by")
                  .in("id", targetGroupIds);
                const foreignGroupIds = (groups ?? [])
                  .filter((g: any) => g.created_by && g.created_by !== c.created_by)
                  .map((g: any) => g.id);

                if (foreignGroupIds.length > 0) {
                  const { data: shares } = await supabaseAdmin
                    .from("group_shares")
                    .select("group_id, can_use_in_campaigns")
                    .in("group_id", foreignGroupIds)
                    .eq("shared_with_user", c.created_by);

                  const permittedGroupIds = (shares ?? [])
                    .filter((s: any) => s.can_use_in_campaigns)
                    .map((s: any) => s.group_id);

                  const hasUnauthorizedAudience = foreignGroupIds.some((id: string) => !permittedGroupIds.includes(id));
                  if (hasUnauthorizedAudience) {
                    await supabaseAdmin
                      .from("campaigns")
                      .update({ status: "failed", completed_at: new Date().toISOString() })
                      .eq("id", c.id);

                    await supabaseAdmin.from("system_errors").insert({
                      tenant_id: c.tenant_id,
                      type: "campaign_send",
                      error: "Campaign aborted: Creator's access to the shared audience was revoked.",
                      context: { campaign_id: c.id, creator_id: c.created_by } as never,
                    });

                    await supabaseAdmin
                      .from("campaign_recipients")
                      .update({
                        status: "api_failed",
                        meta_error: "Campaign aborted: Creator's access to the shared audience was revoked.",
                        attempts: 1,
                      })
                      .eq("campaign_id", c.id)
                      .eq("status", "pending");

                    continue;
                  }
                }
              }
            }
          }

          const { data: creds } = await supabaseAdmin
            .from("whatsapp_credentials")
            .select("phone_number_id, access_token")
            .eq("tenant_id", c.tenant_id)
            .eq("is_default", true)
            .maybeSingle();

          if (!creds?.phone_number_id || !creds.access_token) {
            await supabaseAdmin.from("campaigns").update({ status: "failed" }).eq("id", c.id);
            await supabaseAdmin.from("system_errors").insert({
              tenant_id: c.tenant_id,
              type: "campaign_send",
              error: "Missing WhatsApp credentials",
            });
            continue;
          }

          // Mark campaign status as processing explicitly
          await supabaseAdmin.from("campaigns").update({ status: "processing" }).eq("id", c.id);

          // Fetch pending recipients — guard against already-sent to prevent duplicates
          const { data: pending } = await supabaseAdmin
            .from("campaign_recipients")
            .select("id, contact_id, phone_number_normalized, rendered_variables, status")
            .eq("campaign_id", c.id)
            .eq("status", "pending")
            .order("created_at", { ascending: true })
            .limit(BATCH);

          if (!pending?.length) {
            const { count: remaining } = await supabaseAdmin
              .from("campaign_recipients")
              .select("id", { count: "exact", head: true })
              .eq("campaign_id", c.id)
              .eq("status", "pending");

            if (!remaining) {
              const { count: countSent } = await supabaseAdmin
                .from("campaign_recipients")
                .select("id", { count: "exact", head: true })
                .eq("campaign_id", c.id)
                .in("status", ["sent", "sent_to_meta"]); // both statuses count as sent

              const { count: countFailed } = await supabaseAdmin
                .from("campaign_recipients")
                .select("id", { count: "exact", head: true })
                .eq("campaign_id", c.id)
                .in("status", ["failed", "api_failed"]);

              let finalStatus: "completed" | "failed" = "completed";
              const totalRecipients = c.total_recipients;
              if (countFailed === totalRecipients) {
                finalStatus = "failed";
              } else {
                finalStatus = "completed";
              }

              await supabaseAdmin
                .from("campaigns")
                .update({ status: finalStatus, completed_at: new Date().toISOString() })
                .eq("id", c.id);
            }
            continue;
          }

          const tpl = c.template_snapshot as unknown as TemplateSnapshot;
          const mediaUrl = (c as any).campaign_media?.[0]?.file_url || null;

          // ====== 3 & 5. TEMPLATE VERIFICATION & LANGUAGE PROTECTION ======
          const { data: dbTemplate } = c.template_id
            ? await supabaseAdmin
                .from("message_templates")
                .select("id, template_name, language, sync_status, header_type")
                .eq("id", c.template_id)
                .maybeSingle()
            : { data: null };

          let templateValidationError = "";
          if (!dbTemplate) {
            templateValidationError = `Template not found in database (ID: ${c.template_id})`;
          } else if (dbTemplate!.sync_status !== "approved") {
            templateValidationError = `Template "${dbTemplate!.template_name}" is not approved (Status: ${dbTemplate!.sync_status})`;
          } else if (dbTemplate!.language !== tpl.language) {
            templateValidationError = `CRM language ("${tpl.language}") differs from Meta synced template language ("${dbTemplate!.language}")`;
          } else if (dbTemplate!.template_name !== tpl.template_name) {
            templateValidationError = `CRM template name ("${tpl.template_name}") differs from Meta synced template name ("${dbTemplate!.template_name}")`;
          }

          if (templateValidationError) {
            // Abort sending for this campaign entirely
            await supabaseAdmin
              .from("campaigns")
              .update({ status: "failed", completed_at: new Date().toISOString() })
              .eq("id", c.id);

            await supabaseAdmin.from("system_errors").insert({
              tenant_id: c.tenant_id,
              type: "campaign_send",
              error: `Campaign rejected: ${templateValidationError}`,
              context: { campaign_id: c.id, template_id: c.template_id } as never,
            });

            // Mark all pending recipients for this campaign as api_failed
            await supabaseAdmin
              .from("campaign_recipients")
              .update({
                status: "api_failed",
                meta_error: templateValidationError,
                attempts: 1,
              })
              .eq("campaign_id", c.id)
              .eq("status", "pending");

            // Log validation failure in campaign_logs
            await supabaseAdmin.from("campaign_logs").insert({
              tenant_id: c.tenant_id,
              campaign_id: c.id,
              log_type: "validation_fail",
              error_message: templateValidationError,
            });

            continue;
          }

          let processed = 0;
          let failed = 0;
          let batchSent = false;

          for (const r of pending) {
            // Guard: double-check recipient is still pending (prevents re-send race condition)
            const { data: recipientCheck } = await supabaseAdmin
              .from("campaign_recipients")
              .select("status")
              .eq("id", r.id)
              .maybeSingle();
            if (recipientCheck?.status && recipientCheck.status !== "pending") {
              // Already processed by another worker — skip to prevent duplicates
              continue;
            }

            // Optimistically lock the row by updating status to 'sending' before API call
            const { data: lockedRows, error: lockErr } = await supabaseAdmin
              .from("campaign_recipients")
              .update({ status: "sending", attempts: 1 })
              .eq("id", r.id)
              .eq("status", "pending") // only update if still pending
              .select("id");

            if (lockErr || !lockedRows || lockedRows.length === 0) {
              // Could not lock (another concurrent request locked it first) — skip to prevent duplicates
              continue;
            }

            try {
              // 4. PHONE NUMBER NORMALIZATION
              // Convert number to E.164 (strip non-digits: spaces, dashes, brackets, leading +)
              const rawPhone = r.phone_number_normalized;
              const normalizedPhone = rawPhone.replace(/\D/g, "");
              const phoneValid = normalizedPhone.length >= 7 && normalizedPhone.length <= 15;

              // Recipient-level validation checks
              let recipientValidationError = "";
              if (!phoneValid) {
                recipientValidationError = `Invalid E.164 phone number: original="${rawPhone}", normalized="${normalizedPhone}"`;
              } else if (dbTemplate!.header_type === "IMAGE" && !mediaUrl) {
                recipientValidationError = `Image template requires an image URL but none was provided`;
              }

              // F. Media URL accessibility check
              if (!recipientValidationError && dbTemplate!.header_type === "IMAGE" && mediaUrl) {
                try {
                  const headRes = await fetch(mediaUrl, {
                    method: "HEAD",
                    signal: AbortSignal.timeout(5000),
                  });
                  if (!headRes.ok) {
                    recipientValidationError = `Image URL returned status ${headRes.status} (Not 200)`;
                  } else {
                    const contentType = headRes.headers.get("content-type") ?? "";
                    const contentLengthStr = headRes.headers.get("content-length");
                    if (!contentType.startsWith("image/")) {
                      recipientValidationError = `Image URL content-type is ${contentType}, expected image/*`;
                    } else if (contentLengthStr) {
                      const contentLength = parseInt(contentLengthStr, 10);
                      if (contentLength > 5 * 1024 * 1024) {
                        recipientValidationError = `Image size (${(contentLength / 1024 / 1024).toFixed(2)}MB) exceeds Meta limit of 5MB`;
                      }
                    }
                  }
                } catch (e: any) {
                  recipientValidationError = `Image URL not accessible: ${e.message}`;
                }
              }

              if (recipientValidationError) {
                // Mark recipient as api_failed
                await supabaseAdmin
                  .from("campaign_recipients")
                  .update({
                    status: "api_failed",
                    meta_error: recipientValidationError,
                    attempts: 1,
                  })
                  .eq("id", r.id);

                // Store in campaign_logs
                await supabaseAdmin.from("campaign_logs").insert({
                  tenant_id: c.tenant_id,
                  campaign_id: c.id,
                  recipient_id: r.id,
                  log_type: "validation_fail",
                  error_message: recipientValidationError,
                  request_payload: {
                    phone_original: rawPhone,
                    phone_normalized: normalizedPhone,
                    media_url: mediaUrl,
                  } as any,
                });

                failed++;
                continue;
              }

              // ── LANGUAGE RESOLUTION LOG ──────────────────────────────
              // Log template name, DB-stored language, and the exact language
              // that will be sent in the Meta payload for every recipient send.
              const resolvedLang = dbTemplate!.language ?? "";
              const langLogMsg =
                `[LANGUAGE_AUDIT] Campaign=${c.id} Recipient=${r.id} ` +
                `Template="${dbTemplate!.template_name}" ` +
                `DB_Language="${resolvedLang}" ` +
                `PayloadLanguage="${resolvedLang}" ` +
                `Phone="${normalizedPhone}"`;
              console.log(langLogMsg);

              // Hard-fail this recipient if language is somehow empty — never send with a bad language
              if (!resolvedLang) {
                await supabaseAdmin
                  .from("campaign_recipients")
                  .update({
                    status: "api_failed",
                    meta_error: `Template language is empty for "${dbTemplate!.template_name}" — re-sync templates from Meta`,
                    attempts: 1,
                  })
                  .eq("id", r.id);

                await supabaseAdmin.from("campaign_logs").insert({
                  tenant_id: c.tenant_id,
                  campaign_id: c.id,
                  recipient_id: r.id,
                  log_type: "validation_fail",
                  error_message: `Empty language for template "${dbTemplate!.template_name}"`,
                  request_payload: {
                    template_name: dbTemplate!.template_name,
                    db_language: resolvedLang,
                    phone: normalizedPhone,
                  } as any,
                });
                failed++;
                continue;
              }

              // Send to Meta — language.code will be exactly resolvedLang (e.g. "en_US")
              const result = await sendMetaTemplate({
                phoneNumberId: creds.phone_number_id,
                accessToken: creds.access_token,
                to: normalizedPhone,
                template: {
                  ...tpl,
                  language: resolvedLang, // Always use exact DB-synced language from Meta
                },
                variables: (r.rendered_variables ?? {}) as Record<string, string>,
                mediaUrl,
              });

              // Log request/response payload in campaign_logs
              await supabaseAdmin.from("campaign_logs").insert({
                tenant_id: c.tenant_id,
                campaign_id: c.id,
                recipient_id: r.id,
                log_type: result.ok ? "send_success" : "api_fail",
                request_payload: result.requestPayload as any,
                response_payload: result.responsePayload as any,
                http_status: (result as any).status ?? null,
                error_message: result.ok ? null : (result as any).error,
              });

              if (result.ok) {
                batchSent = true;
                // Update recipient to sent (valid enum) — prevents re-picking on next cron tick
                await supabaseAdmin
                  .from("campaign_recipients")
                  .update({
                    status: "sent",
                    meta_message_id: result.id,
                    sent_at: new Date().toISOString(),
                    attempts: 1,
                    meta_status: "sent_to_meta",
                  })
                  .eq("id", r.id);

                // Log fallback substitutions (if any variables were empty)
                if (result.emptyVarIndices && result.emptyVarIndices.length > 0) {
                  await supabaseAdmin.from("system_errors").insert({
                    tenant_id: c.tenant_id,
                    type: "campaign_empty_var",
                    error: `Recipient ${r.id}: variables [${result.emptyVarIndices.join(", ")}] were empty — sent with fallback " "`,
                    context: {
                      campaign_id: c.id,
                      recipient_id: r.id,
                      empty_vars: result.emptyVarIndices,
                    } as never,
                  });
                }

                // Add message to conversations history for UI
                let bodyText = tpl.body || "";
                const vars = (r.rendered_variables ?? {}) as Record<string, string>;
                for (const [key, val] of Object.entries(vars)) {
                  bodyText = bodyText.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), val || "");
                }

                const { data: conv } = await supabaseAdmin
                  .from("conversations")
                  .upsert(
                    {
                      tenant_id: c.tenant_id,
                      contact_id: r.contact_id,
                      phone_number: r.phone_number_normalized,
                      status: "open",
                      last_message: bodyText || "[Template]",
                      last_message_at: new Date().toISOString(),
                    },
                    { onConflict: "tenant_id,contact_id" },
                  )
                  .select("id")
                  .single();

                if (conv) {
                  await supabaseAdmin.from("messages").insert({
                    tenant_id: c.tenant_id,
                    conversation_id: conv.id,
                    contact_id: r.contact_id,
                    campaign_id: c.id,
                    direction: "out",
                    type: "template",
                    body: tpl.body,
                    meta_message_id: result.id,
                    status: "sent",
                    payload: result.requestPayload as any,
                  });
                }

                processed++;
                totalSent++;
              } else {
                // Mark recipient as api_failed
                await supabaseAdmin
                  .from("campaign_recipients")
                  .update({
                    status: "api_failed",
                    error: result.error,
                    meta_error: result.error,
                    attempts: 1,
                  })
                  .eq("id", r.id);

                failed++;

                if (result.code === 132001) {
                  const staleError = `Template "${tpl.template_name}" does not exist on Meta (code 132001)`;
                  
                  // 1. Mark template rejected in database so it cannot be chosen anymore
                  if (c.template_id) {
                    await supabaseAdmin
                      .from("message_templates")
                      .update({ sync_status: "rejected", last_sync_at: new Date().toISOString() })
                      .eq("id", c.template_id);
                  }

                  // 2. Mark all other pending recipients for this campaign as api_failed
                  await supabaseAdmin
                    .from("campaign_recipients")
                    .update({
                      status: "api_failed",
                      meta_error: staleError,
                      attempts: 1,
                    })
                    .eq("campaign_id", c.id)
                    .eq("status", "pending");

                  // 3. Mark the campaign as failed
                  await supabaseAdmin
                    .from("campaigns")
                    .update({ status: "failed", completed_at: new Date().toISOString() })
                    .eq("id", c.id);

                  // 4. Log the critical failure in campaign_logs
                  await supabaseAdmin.from("campaign_logs").insert({
                    tenant_id: c.tenant_id,
                    campaign_id: c.id,
                    log_type: "validation_fail",
                    error_message: staleError,
                  });

                  break;
                }
              }
            } catch (err: any) {
              const msg = err instanceof Error ? err.message : "Unknown error";
              await supabaseAdmin
                .from("campaign_recipients")
                .update({
                  status: "api_failed",
                  error: `Handler exception: ${msg}`,
                  meta_error: msg,
                  attempts: 1,
                })
                .eq("id", r.id);
              failed++;
            }
          } // end for recipients


          if (batchSent) {
            await supabaseAdmin
              .from("whatsapp_credentials")
              .update({ last_successful_message_at: new Date().toISOString() })
              .eq("tenant_id", c.tenant_id)
              .eq("is_default", true);
          }

          // Increment campaign processed/failed counters
          if (processed || failed) {
            try {
              await supabaseAdmin.rpc("increment_campaign_counters", {
                _campaign_id: c.id,
                _processed: processed,
                _failed: failed,
              });
            } catch {
              await supabaseAdmin
                .from("campaigns")
                .update({
                  processed_count: (c.processed_count ?? 0) + processed,
                  failed_count: (c.failed_count ?? 0) + failed,
                })
                .eq("id", c.id);
            }
          }

          // Verify if campaign is fully completed (pending = 0 AND sending = 0)
          const { count: stillPending } = await supabaseAdmin
            .from("campaign_recipients")
            .select("id", { count: "exact", head: true })
            .eq("campaign_id", c.id)
            .in("status", ["pending", "sending"]); // also wait for in-flight 'sending' records

          if (!stillPending) {
            const { count: countSent } = await supabaseAdmin
              .from("campaign_recipients")
              .select("id", { count: "exact", head: true })
              .eq("campaign_id", c.id)
              .in("status", ["sent", "sent_to_meta"]); // both count as successfully sent

            const { count: countFailed } = await supabaseAdmin
              .from("campaign_recipients")
              .select("id", { count: "exact", head: true })
              .eq("campaign_id", c.id)
              .in("status", ["failed", "api_failed"]);

            let finalStatus: "completed" | "failed" = "completed";
            const totalRecipients = c.total_recipients;
            if (countFailed === totalRecipients) {
              finalStatus = "failed";
            } else {
              finalStatus = "completed";
            }

            await supabaseAdmin
              .from("campaigns")
              .update({ status: finalStatus, completed_at: new Date().toISOString() })
              .eq("id", c.id);
          }
        }

        // Self-chaining trigger: if there are still pending recipients in the queue,
        // trigger the next batch asynchronously in the background.
        try {
          const { data: nextPending } = await supabaseAdmin
            .from("campaign_recipients")
            .select("id")
            .eq("status", "pending")
            .limit(1);

          if (nextPending && nextPending.length > 0) {
            const origin =
              process.env.PUBLIC_BASE_URL ??
              "https://vconnect.virratglobal.com";
            void fetch(`${origin}/api/public/hooks/process-campaigns`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: "{}",
            }).catch(() => {});
          }
        } catch {
          // Ignore self-triggering exceptions
        }

        return Response.json({ processed: totalSent });
      },
    },
  },
});
