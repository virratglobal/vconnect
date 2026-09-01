import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { normalizePhone } from "@/lib/phone";

// ─── ZOD SCHEMAS ─────────────────────────────────────────────────────────────
const filtersSchema = z.object({
  groupIds: z.array(z.string().uuid()).optional(),
  tagIds: z.array(z.string().uuid()).optional(),
  createdStart: z.string().optional().nullable(),
  createdEnd: z.string().optional().nullable(),
  campaignId: z.string().uuid().optional().nullable(),
  conversationStatus: z.string().optional().nullable(),
  assignedAgentId: z.string().uuid().optional().nullable(),
  country: z.string().optional().nullable(),
  lastActivity: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  creatorId: z.string().uuid().optional().nullable(),
  source: z.string().optional().nullable(),
  recentlyAdded: z.boolean().optional().nullable(),
});

const getContactsInput = z.object({
  tenantId: z.string().uuid(),
  search: z.string().default(""),
  page: z.number().default(0),
  pageSize: z.number().default(25),
  sortBy: z.string().default("created_at"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  filters: filtersSchema,
});

const saveContactInput = z.object({
  id: z.string().uuid().optional().nullable(),
  tenantId: z.string().uuid(),
  name: z.string().max(100).optional().nullable(),
  phone: z.string().min(5).max(30),
  email: z.string().email().max(100).optional().nullable(),
  company: z.string().max(100).optional().nullable(),
  defaultCountryCode: z.string().default("91"),
  tagIds: z.array(z.string().uuid()).default([]),
  groupIds: z.array(z.string().uuid()).default([]),
  optInSource: z.string().optional().nullable(),
  optInDate: z.string().optional().nullable(),
  forceUpdate: z.boolean().default(false),
});

const bulkUpdateInput = z.object({
  tenantId: z.string().uuid(),
  action: z.enum(["add_tags", "remove_tags", "add_groups", "remove_groups", "delete", "transfer_ownership"]),
  contactIds: z.array(z.string().uuid()),
  tagIds: z.array(z.string().uuid()).default([]),
  groupIds: z.array(z.string().uuid()).default([]),
  targetAgentId: z.string().uuid().optional().nullable(),
});

const savedAudienceInput = z.object({
  id: z.string().uuid().optional().nullable(),
  tenantId: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional().nullable(),
  criteria: z.any(),
});

// ─── SERVICE FUNCTIONS ────────────────────────────────────────────────────────

// 1. Get Contacts List (with Advanced Filters & Joins)
export const getContactsList = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => getContactsInput.parse(d))
  .handler(async ({ data: input, context }) => {
    const { supabase, userId } = context;
    const { tenantId, search, page, pageSize, sortBy, sortOrder, filters } = input;

    const { authorize } = await import("./authorization.server");
    await authorize(userId, "contact.create", null, tenantId);

    const hasGroupFilter = filters.groupIds && filters.groupIds.length > 0;
    let q = supabase
      .from("contacts")
      .select(
        "id, name, phone_number_raw, phone_number_normalized, email, company, created_at, updated_at, source, created_by",
        { count: "exact" },
      )
      .is("deleted_at", null);

    if (!hasGroupFilter) {
      q = q.eq("tenant_id", tenantId);
    }

    // Apply Filter: creatorId
    if (filters.creatorId) {
      q = q.eq("created_by", filters.creatorId);
    }

    // Apply Filter: source
    if (filters.source) {
      q = q.eq("source", filters.source);
    }

    // Apply Filter: recentlyAdded
    if (filters.recentlyAdded) {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      q = q.gte("created_at", sevenDaysAgo.toISOString());
    }

    // Apply Filter: groupIds
    if (filters.groupIds && filters.groupIds.length) {
      const { data: cg } = await supabase
        .from("contact_groups")
        .select("contact_id")
        .in("group_id", filters.groupIds);
      const cids = (cg ?? []).map((r) => r.contact_id);
      if (!cids.length) return { rows: [], total: 0 };
      q = q.in("id", cids);
    }

    // Apply Filter: tagIds
    if (filters.tagIds && filters.tagIds.length) {
      const { data: ct } = await supabase
        .from("contact_tags")
        .select("contact_id")
        .eq("tenant_id", tenantId)
        .in("tag_id", filters.tagIds);
      const cids = (ct ?? []).map((r) => r.contact_id);
      if (!cids.length) return { rows: [], total: 0 };
      q = q.in("id", cids);
    }

    // Apply Filter: campaignId
    if (filters.campaignId) {
      const { data: cr } = await supabase
        .from("campaign_recipients")
        .select("contact_id")
        .eq("tenant_id", tenantId)
        .eq("campaign_id", filters.campaignId);
      const cids = (cr ?? []).map((r) => r.contact_id).filter(Boolean) as string[];
      if (!cids.length) return { rows: [], total: 0 };
      q = q.in("id", cids);
    }

    // Apply Filter: conversationStatus / assignedAgentId
    let hasConvFilter = false;
    let convQuery = supabase.from("conversations").select("contact_id").eq("tenant_id", tenantId);
    if (filters.conversationStatus) {
      convQuery = convQuery.eq("status", filters.conversationStatus);
      hasConvFilter = true;
    }
    if (filters.assignedAgentId) {
      convQuery = convQuery.eq("assigned_to", filters.assignedAgentId);
      hasConvFilter = true;
    }
    if (hasConvFilter) {
      const { data: convs } = await convQuery;
      const cids = (convs ?? []).map((r) => r.contact_id).filter(Boolean) as string[];
      if (!cids.length) return { rows: [], total: 0 };
      q = q.in("id", cids);
    }

    // Apply Filter: country code prefix
    if (filters.country) {
      q = q.eq("country_code", filters.country);
    }

    // Apply Filter: date range
    if (filters.createdStart) q = q.gte("created_at", filters.createdStart);
    if (filters.createdEnd) q = q.lte("created_at", filters.createdEnd);

    // Apply Filter: specific phone / name filters
    if (filters.phone) q = q.ilike("phone_number_normalized", `%${filters.phone}%`);
    if (filters.name) q = q.ilike("name", `%${filters.name}%`);

    // Global Search Engine
    if (search.trim()) {
      const term = `%${search.trim()}%`;
      const contactIds = new Set<string>();

      // 1. Tag name match
      const { data: matchingTags } = await supabase
        .from("tags")
        .select("id")
        .eq("tenant_id", tenantId)
        .ilike("name", term);
      if (matchingTags?.length) {
        const { data: ct } = await supabase
          .from("contact_tags")
          .select("contact_id")
          .eq("tenant_id", tenantId)
          .in(
            "tag_id",
            matchingTags.map((t) => t.id),
          );
        ct?.forEach((r) => contactIds.add(r.contact_id));
      }

      // 2. Group name match
      const { data: matchingGroups } = await supabase
        .from("groups")
        .select("id")
        .eq("tenant_id", tenantId)
        .ilike("name", term);
      if (matchingGroups?.length) {
        const { data: cg } = await supabase
          .from("contact_groups")
          .select("contact_id")
          .eq("tenant_id", tenantId)
          .in(
            "group_id",
            matchingGroups.map((g) => g.id),
          );
        cg?.forEach((r) => contactIds.add(r.contact_id));
      }

      // 3. Campaign name match
      const { data: matchingCampaigns } = await supabase
        .from("campaigns")
        .select("id")
        .eq("tenant_id", tenantId)
        .ilike("name", term);
      if (matchingCampaigns?.length) {
        const { data: cr } = await supabase
          .from("campaign_recipients")
          .select("contact_id")
          .eq("tenant_id", tenantId)
          .in(
            "campaign_id",
            matchingCampaigns.map((c) => c.id),
          );
        cr?.forEach((r) => r.contact_id && contactIds.add(r.contact_id));
      }

      // 4. Conversation message match
      const { data: matchingMsgs } = await supabase
        .from("messages")
        .select("contact_id")
        .eq("tenant_id", tenantId)
        .ilike("body", term);
      matchingMsgs?.forEach((r) => r.contact_id && contactIds.add(r.contact_id));

      // 5. Notes match
      const { data: matchingNotes } = await supabase
        .from("conversation_internal_notes")
        .select("conversation_id")
        .eq("tenant_id", tenantId)
        .ilike("body", term);
      if (matchingNotes?.length) {
        const { data: convs } = await supabase
          .from("conversations")
          .select("contact_id")
          .eq("tenant_id", tenantId)
          .in(
            "id",
            matchingNotes.map((n) => n.conversation_id),
          );
        convs?.forEach((r) => r.contact_id && contactIds.add(r.contact_id));
      }

      let filterStr = `name.ilike.${term},phone_number_normalized.ilike.${term},phone_number_raw.ilike.${term},email.ilike.${term},company.ilike.${term}`;
      if (contactIds.size > 0) {
        const idsArr = Array.from(contactIds).slice(0, 1000);
        filterStr += `,id.in.(${idsArr.join(",")})`;
      }
      q = q.or(filterStr);
    }

    // Apply Sorting
    q = q.order(sortBy, { ascending: sortOrder === "asc" });

    // Apply Range/Pagination
    q = q.range(page * pageSize, (page + 1) * pageSize - 1);

    const { data: contacts, error, count } = await q;
    if (error) throw error;

    const list = contacts ?? [];
    if (!list.length) return { rows: [], total: 0 };

    const contactIds = list.map((c) => c.id);

    // Batch query relations to optimize performance
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [tagsRes, groupsRes, convsRes, recipientsRes, messagesCountsRes] = await Promise.all([
      supabaseAdmin
        .from("contact_tags")
        .select("contact_id, tags(id, name, color)")
        .in("contact_id", contactIds),
      supabaseAdmin
        .from("contact_groups")
        .select("contact_id, groups(id, name, color)")
        .in("contact_id", contactIds),
      supabaseAdmin
        .from("conversations")
        .select("contact_id, status, last_message, last_message_at, assigned_to")
        .in("contact_id", contactIds),
      supabaseAdmin
        .from("campaign_recipients")
        .select("contact_id, campaign_id, campaigns(name), status")
        .in("contact_id", contactIds),
      Promise.resolve(
        supabaseAdmin.rpc("get_contacts_messages_counts" as any, { _contact_ids: contactIds }),
      ).catch(() => null), // fallback if rpc not present
    ]);

    // Format results
    const rows = list.map((c) => {
      const cTags = (tagsRes.data ?? [])
        .filter((t: any) => t.contact_id === c.id)
        .map((t: any) => t.tags)
        .filter(Boolean) as { id: string; name: string; color: string | null }[];

      const cGroups = (groupsRes.data ?? [])
        .filter((g: any) => g.contact_id === c.id)
        .map((g: any) => g.groups)
        .filter(Boolean) as { id: string; name: string; color: string | null }[];

      const cConv = (convsRes.data ?? []).find((v: any) => v.contact_id === c.id) ?? null;
      const cRecipients = (recipientsRes.data ?? []).filter((r: any) => r.contact_id === c.id);

      const lastRecipient = cRecipients.length
        ? cRecipients.sort((a: any, b: any) => b.campaign_id.localeCompare(a.campaign_id))[0]
        : null;

      const totalMessages =
        messagesCountsRes && (messagesCountsRes as any).data
          ? ((messagesCountsRes as any).data.find((item: any) => item.contact_id === c.id)?.count ??
            0)
          : 0;

      const lastActivity = cConv?.last_message_at || c.created_at;

      return {
        id: c.id,
        name: c.name,
        phone_number_raw: c.phone_number_raw,
        phone_number_normalized: c.phone_number_normalized,
        email: c.email,
        company: c.company,
        created_at: c.created_at,
        updated_at: c.updated_at,
        source: (c as any).source,
        created_by: (c as any).created_by,
        tags: cTags,
        groups: cGroups,
        lastConversation: cConv
          ? {
              status: cConv.status,
              lastMessage: cConv.last_message,
              lastMessageAt: cConv.last_message_at,
              assignedTo: cConv.assigned_to,
            }
          : null,
        lastCampaign: lastRecipient
          ? {
              id: lastRecipient.campaign_id,
              name: (lastRecipient.campaigns as any)?.name ?? "Campaign",
              status: lastRecipient.status,
            }
          : null,
        totalMessages,
        lastActivity,
        status: cConv?.status === "open" || cConv?.status === "pending" ? "active" : "inactive",
      };
    });

    return { rows, total: count ?? 0 };
  });

// 2. Save/Update Contact with Transactional Tags/Groups Integrity & Duplication Choice
export const saveContact = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => saveContactInput.parse(d))
  .handler(async ({ data: input, context }) => {
    const { userId } = context;
    const {
      id,
      tenantId,
      name,
      phone,
      email,
      company,
      defaultCountryCode,
      tagIds,
      groupIds,
      optInSource,
      optInDate,
      forceUpdate,
    } = input;

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Check role
    const { authorize } = await import("./authorization.server");
    const { role } = await authorize(userId, "contact.create", null, tenantId);
    const isAgent = role === "agent";
    const isManager = role === "owner" || role === "admin" || role === "manager";

    // Normalize phone number
    const pNorm = normalizePhone(phone, { defaultCountryCode });
    if (!pNorm.valid || !pNorm.normalized) {
      throw new Error(`Phone validation failed: ${pNorm.reason ?? "Invalid format"}`);
    }

    // Check duplicate phone number
    const { data: existing } = await supabaseAdmin
      .from("contacts")
      .select("id, name, deleted_at, created_by")
      .eq("tenant_id", tenantId)
      .eq("phone_number_normalized", pNorm.normalized)
      .maybeSingle();

    if (existing) {
      const belongsToOther = existing.created_by !== userId;
      if (isAgent && !isManager && belongsToOther) {
        throw new Error("This phone number is already registered in the organization.");
      }

      if (!id && !forceUpdate && !existing.deleted_at) {
        return {
          duplicate: true,
          contactId: existing.id,
          name: existing.name || `+${pNorm.normalized}`,
        };
      }
    }

    let contactId = id || "";
    const isNewInsert = !id && !(existing && existing.deleted_at);

    // Insert or Update Contact
    if (contactId) {
      // If updating, verify Agent ownership
      if (isAgent && !isManager) {
        await authorize(userId, "contact.manage", contactId, tenantId);
      }

      // Update
      const { error: updateErr } = await supabaseAdmin
        .from("contacts")
        .update({
          name: name?.trim() || null,
          email: email?.trim() || null,
          company: company?.trim() || null,
          phone_number_raw: phone.trim(),
          phone_number_normalized: pNorm.normalized,
          opt_in_source: optInSource || null,
          opt_in_date: optInSource ? new Date(optInDate || Date.now()).toISOString() : null,
          updated_at: new Date().toISOString(),
          deleted_at: null, // restore if soft deleted
        })
        .eq("id", contactId)
        .eq("tenant_id", tenantId);

      if (updateErr) throw updateErr;
    } else {
      // Create (or restore existing soft-deleted contact)
      if (existing && existing.deleted_at) {
        // If restoring, verify Agent ownership
        if (isAgent && !isManager && existing.created_by !== userId) {
          throw new Error("This phone number is already registered in the organization.");
        }

        const { error: restoreErr } = await supabaseAdmin
          .from("contacts")
          .update({
            name: name?.trim() || null,
            email: email?.trim() || null,
            company: company?.trim() || null,
            phone_number_raw: phone.trim(),
            phone_number_normalized: pNorm.normalized,
            opt_in_source: optInSource || null,
            opt_in_date: optInSource ? new Date(optInDate || Date.now()).toISOString() : null,
            deleted_at: null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
        if (restoreErr) throw restoreErr;
        contactId = existing.id;
      } else {
        const { data: inserted, error: insertErr } = await supabaseAdmin
          .from("contacts")
          .insert({
            tenant_id: tenantId,
            name: name?.trim() || null,
            phone_number_raw: phone.trim(),
            phone_number_normalized: pNorm.normalized,
            email: email?.trim() || null,
            company: company?.trim() || null,
            country_code:
              pNorm.normalized.slice(0, pNorm.normalized.length - 10) || defaultCountryCode,
            opt_in_source: optInSource || null,
            opt_in_date: optInSource ? new Date(optInDate || Date.now()).toISOString() : null,
            created_by: userId,
            source: "manual",
          })
          .select("id")
          .single();
        if (insertErr) throw insertErr;
        contactId = inserted.id;

        // Log Created Timeline entry
        await supabaseAdmin.from("contact_activities").insert({
          tenant_id: tenantId,
          contact_id: contactId,
          activity_type: "imported", // or custom type
          metadata: { source: optInSource || "manual" },
        });
      }
    }

    // Transactional Mapping updates (Tags + Groups)
    try {
      // Resolve original tags/groups to write timeline additions/removals
      const [oldTagsRes, oldGroupsRes] = await Promise.all([
        supabaseAdmin.from("contact_tags").select("tag_id").eq("contact_id", contactId),
        supabaseAdmin.from("contact_groups").select("group_id").eq("contact_id", contactId),
      ]);

      const oldTagIds = (oldTagsRes.data ?? []).map((t) => t.tag_id);
      const oldGroupIds = (oldGroupsRes.data ?? []).map((g) => g.group_id);

      // Re-map tags
      await supabaseAdmin.from("contact_tags").delete().eq("contact_id", contactId);
      if (tagIds.length) {
        const rows = tagIds.map((tid) => ({
          contact_id: contactId,
          tag_id: tid,
          tenant_id: tenantId,
        }));
        const { error } = await supabaseAdmin.from("contact_tags").insert(rows);
        if (error) throw error;
      }

      // Re-map groups
      await supabaseAdmin.from("contact_groups").delete().eq("contact_id", contactId);
      if (groupIds.length) {
        const rows = groupIds.map((gid) => ({
          contact_id: contactId,
          group_id: gid,
          tenant_id: tenantId,
          created_by: userId,
        }));
        const { error } = await supabaseAdmin.from("contact_groups").insert(rows);
        if (error) throw error;
      }

      // Log Timeline Entries for tags additions/removals
      const addedTags = tagIds.filter((tid) => !oldTagIds.includes(tid));
      const removedTags = oldTagIds.filter((tid) => !tagIds.includes(tid));

      for (const tid of addedTags) {
        await supabaseAdmin.from("contact_activities").insert({
          tenant_id: tenantId,
          contact_id: contactId,
          activity_type: "tag_added",
          reference_id: tid,
        });
      }
      for (const tid of removedTags) {
        await supabaseAdmin.from("contact_activities").insert({
          tenant_id: tenantId,
          contact_id: contactId,
          activity_type: "tag_removed",
          reference_id: tid,
        });
      }

      // Log Timeline Entries for groups additions/removals
      const addedGroups = groupIds.filter((gid) => !oldGroupIds.includes(gid));
      const removedGroups = oldGroupIds.filter((gid) => !groupIds.includes(gid));

      for (const gid of addedGroups) {
        await supabaseAdmin.from("contact_activities").insert({
          tenant_id: tenantId,
          contact_id: contactId,
          activity_type: "group_added",
          reference_id: gid,
        });
      }
      for (const gid of removedGroups) {
        await supabaseAdmin.from("contact_activities").insert({
          tenant_id: tenantId,
          contact_id: contactId,
          activity_type: "group_removed",
          reference_id: gid,
        });
      }
    } catch (err) {
      // Rollback (delete contact if it was a new insertion to maintain integrity)
      if (isNewInsert) {
        await supabaseAdmin.from("contacts").delete().eq("id", contactId);
      } else if (!id && existing && existing.deleted_at) {
        await supabaseAdmin
          .from("contacts")
          .update({ deleted_at: existing.deleted_at })
          .eq("id", contactId);
      }
      throw err;
    }

    return { id: contactId, duplicate: false };
  });

// 3. Bulk Update Contacts (Tags, Groups, Delete)
export const bulkUpdateContacts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => bulkUpdateInput.parse(d))
  .handler(async ({ data: input, context }) => {
    const { userId } = context;
    const { tenantId, action, contactIds, tagIds, groupIds, targetAgentId } = input;

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Check role
    const { authorize } = await import("./authorization.server");
    const { role } = await authorize(userId, "contact.bulk_update", null, tenantId);
    const isAgent = role === "agent";
    const isManager = role === "owner" || role === "admin" || role === "manager";

    if (!contactIds.length) return { ok: true };

    if (isAgent && !isManager) {
      // Agents can only bulk edit contacts they created.
      // Verify that all contactIds belong to this agent.
      for (const cid of contactIds) {
        await authorize(userId, "contact.manage", cid, tenantId);
      }
    }

    if (action === "delete") {
      const { error } = await supabaseAdmin
        .from("contacts")
        .update({ deleted_at: new Date().toISOString() })
        .in("id", contactIds)
        .eq("tenant_id", tenantId);
      if (error) throw error;
    } else if (action === "transfer_ownership") {
      if (!isManager) {
        throw new Error("Forbidden: Only Owners, Admins, and Managers can transfer contact ownership");
      }
      if (!targetAgentId) {
        throw new Error("Target agent is required for transferring ownership");
      }

      // Verify target agent is a member of the tenant
      const { data: member } = await supabaseAdmin
        .from("tenant_members")
        .select("user_id")
        .eq("tenant_id", tenantId)
        .eq("user_id", targetAgentId)
        .maybeSingle();
      if (!member) {
        throw new Error("Forbidden: Target user is not a member of this organization");
      }

      const { error } = await supabaseAdmin
        .from("contacts")
        .update({ created_by: targetAgentId })
        .in("id", contactIds)
        .eq("tenant_id", tenantId);
      if (error) throw error;

      // 1. Fetch conversations linked to the transferred contacts to log previous assignee details
      const { data: conversations } = await supabaseAdmin
        .from("conversations")
        .select("id, assigned_to")
        .in("contact_id", contactIds)
        .eq("tenant_id", tenantId);

      if (conversations && conversations.length > 0) {
        // 2. Reassign conversations to the new contact owner
        const convIds = conversations.map((c) => c.id);
        const { error: convError } = await supabaseAdmin
          .from("conversations")
          .update({
            assigned_to: targetAgentId,
            assigned_by: userId,
            assigned_at: new Date().toISOString(),
          })
          .in("id", convIds);

        if (convError) {
          console.warn("[transfer_ownership] Failed to reassign conversations:", convError.message);
        } else {
          // 3. Insert assignment logs for audit history
          const assignmentLogs = conversations.map((c) => ({
            tenant_id: tenantId,
            conversation_id: c.id,
            action: "transferred",
            assigned_to: targetAgentId,
            assigned_by: userId,
            previous_assignee: c.assigned_to ?? null,
            reason: "Contact ownership transferred",
          }));
          await supabaseAdmin.from("conversation_assignment_logs").insert(assignmentLogs);

          // 4. Insert unified activity timeline entries
          const activityLogs = conversations.map((c) => ({
            tenant_id: tenantId,
            conversation_id: c.id,
            actor_id: userId,
            activity_type: "transferred",
            metadata: {
              assigned_to: targetAgentId,
              previous_assignee: c.assigned_to ?? null,
              reason: "Contact ownership transferred",
            },
          }));
          await supabaseAdmin.from("conversation_activities").insert(activityLogs);
        }
      }

      // Log contact timeline
      for (const cid of contactIds) {
        await supabaseAdmin.from("contact_activities").insert({
          tenant_id: tenantId,
          contact_id: cid,
          activity_type: "imported",
          metadata: { action: "ownership_transferred", new_owner: targetAgentId, transferred_by: userId } as any,
        });
      }
    } else if (action === "add_tags" && tagIds.length) {
      const rows = contactIds.flatMap((cid) =>
        tagIds.map((tid) => ({
          contact_id: cid,
          tag_id: tid,
          tenant_id: tenantId,
        })),
      );
      const { error } = await supabaseAdmin
        .from("contact_tags")
        .upsert(rows, { onConflict: "contact_id,tag_id", ignoreDuplicates: true });
      if (error) throw error;

      // Log timeline
      for (const cid of contactIds) {
        for (const tid of tagIds) {
          await supabaseAdmin.from("contact_activities").insert({
            tenant_id: tenantId,
            contact_id: cid,
            activity_type: "tag_added",
            reference_id: tid,
          });
        }
      }
    } else if (action === "remove_tags" && tagIds.length) {
      const { error } = await supabaseAdmin
        .from("contact_tags")
        .delete()
        .in("contact_id", contactIds)
        .in("tag_id", tagIds)
        .eq("tenant_id", tenantId);
      if (error) throw error;

      // Log timeline
      for (const cid of contactIds) {
        for (const tid of tagIds) {
          await supabaseAdmin.from("contact_activities").insert({
            tenant_id: tenantId,
            contact_id: cid,
            activity_type: "tag_removed",
            reference_id: tid,
          });
        }
      }
    } else if (action === "add_groups" && groupIds.length) {
      const rows = contactIds.flatMap((cid) =>
        groupIds.map((gid) => ({
          contact_id: cid,
          group_id: gid,
          tenant_id: tenantId,
          created_by: userId,
        })),
      );
      const { error } = await supabaseAdmin
        .from("contact_groups")
        .upsert(rows, { onConflict: "contact_id,group_id", ignoreDuplicates: true });
      if (error) throw error;

      // Log timeline
      for (const cid of contactIds) {
        for (const gid of groupIds) {
          await supabaseAdmin.from("contact_activities").insert({
            tenant_id: tenantId,
            contact_id: cid,
            activity_type: "group_added",
            reference_id: gid,
          });
        }
      }
    } else if (action === "remove_groups" && groupIds.length) {
      const { error } = await supabaseAdmin
        .from("contact_groups")
        .delete()
        .in("contact_id", contactIds)
        .in("group_id", groupIds)
        .eq("tenant_id", tenantId);
      if (error) throw error;

      // Log timeline
      for (const cid of contactIds) {
        for (const gid of groupIds) {
          await supabaseAdmin.from("contact_activities").insert({
            tenant_id: tenantId,
            contact_id: cid,
            activity_type: "group_removed",
            reference_id: gid,
          });
        }
      }
    }

    return { ok: true };
  });

// 4. Saved Audiences API
export const saveSavedAudience = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => savedAudienceInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { id, tenantId, name, description, criteria } = data;

    const { authorize } = await import("./authorization.server");
    await authorize(userId, "contact.saved_audience.manage", null, tenantId);

    if (id) {
      const { error } = await supabase
        .from("saved_audiences")
        .update({
          name: name.trim(),
          description: description?.trim() || null,
          criteria: criteria as never,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("tenant_id", tenantId);
      if (error) throw error;
      return { id };
    } else {
      const { data: inserted, error } = await supabase
        .from("saved_audiences")
        .insert({
          tenant_id: tenantId,
          name: name.trim(),
          description: description?.trim() || null,
          criteria: criteria as never,
        })
        .select("id")
        .single();
      if (error) throw error;
      return { id: inserted.id };
    }
  });

export const deleteSavedAudience = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid(), tenantId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { id, tenantId } = data;

    const { authorize } = await import("./authorization.server");
    await authorize(userId, "contact.saved_audience.manage", null, tenantId);

    const { error } = await supabase
      .from("saved_audiences")
      .delete()
      .eq("id", id)
      .eq("tenant_id", tenantId);
    if (error) throw error;
    return { ok: true };
  });

// 5. Contact Details (Timeline events + Campaigns + Conversations)
export const getContactDetails = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ contactId: z.string().uuid(), tenantId: z.string().uuid() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { contactId, tenantId } = data;

    const { authorize } = await import("./authorization.server");
    await authorize(userId, "contact.view", contactId, tenantId);

    // Fetch contact
    const { data: contact, error: cErr } = await supabase
      .from("contacts")
      .select("*")
      .eq("id", contactId)
      .eq("tenant_id", tenantId)
      .maybeSingle();
    if (cErr || !contact) throw cErr ?? new Error("Contact not found");

    // Fetch tags & groups
    const [tagsRes, groupsRes, timelineRes, campaignsRes, msgsRes] = await Promise.all([
      supabase.from("contact_tags").select("tags(id, name, color)").eq("contact_id", contactId),
      supabase
        .from("contact_groups")
        .select("groups(id, name, color, icon)")
        .eq("contact_id", contactId),
      supabase
        .from("contact_activities")
        .select("*")
        .eq("contact_id", contactId)
        .order("created_at", { ascending: false }),
      supabase
        .from("campaign_recipients")
        .select(
          "id, status, sent_at, rendered_variables, campaign:campaign_id(id, name, template_snapshot)",
        )
        .eq("contact_id", contactId)
        .order("created_at", { ascending: false }),
      supabase
        .from("messages")
        .select("*")
        .eq("contact_id", contactId)
        .order("created_at", { ascending: false })
        .limit(100),
    ]);

    // Resolve reference labels on activities
    const activities = timelineRes.data ?? [];
    const tagIds = new Set<string>();
    const groupIds = new Set<string>();
    const campaignIds = new Set<string>();

    for (const act of activities) {
      if (act.reference_id) {
        if (act.activity_type.includes("tag")) {
          tagIds.add(act.reference_id);
        } else if (act.activity_type.includes("group")) {
          groupIds.add(act.reference_id);
        } else if (act.activity_type === "campaign_sent") {
          campaignIds.add(act.reference_id);
        }
      }
    }

    const [tagsBatch, groupsBatch, campaignsBatch] = await Promise.all([
      tagIds.size > 0
        ? supabase
            .from("tags")
            .select("id, name")
            .eq("tenant_id", tenantId)
            .in("id", Array.from(tagIds))
        : Promise.resolve({ data: null }),
      groupIds.size > 0
        ? supabase
            .from("groups")
            .select("id, name")
            .eq("tenant_id", tenantId)
            .in("id", Array.from(groupIds))
        : Promise.resolve({ data: null }),
      campaignIds.size > 0
        ? supabase
            .from("campaigns")
            .select("id, name")
            .eq("tenant_id", tenantId)
            .in("id", Array.from(campaignIds))
        : Promise.resolve({ data: null }),
    ]);

    const tagsMap = new Map<string, string>();
    const groupsMap = new Map<string, string>();
    const campaignsMap = new Map<string, string>();

    tagsBatch.data?.forEach((t) => tagsMap.set(t.id, t.name));
    groupsBatch.data?.forEach((g) => groupsMap.set(g.id, g.name));
    campaignsBatch.data?.forEach((c) => campaignsMap.set(c.id, c.name));

    const resolvedActivities = activities.map((act) => {
      let label = "";
      let details = "";
      if (act.reference_id) {
        if (act.activity_type.includes("tag")) {
          label = tagsMap.get(act.reference_id) || "Tag";
        } else if (act.activity_type.includes("group")) {
          label = groupsMap.get(act.reference_id) || "Group";
        } else if (act.activity_type === "campaign_sent") {
          label = campaignsMap.get(act.reference_id) || "Campaign";
        }
      }
      return {
        ...act,
        label,
        details,
      };
    });

    return {
      contact,
      tags: (tagsRes.data ?? []).map((t) => t.tags).filter(Boolean),
      groups: (groupsRes.data ?? []).map((g) => g.groups).filter(Boolean),
      timeline: resolvedActivities,
      campaigns: (campaignsRes.data ?? []).map((r) => ({
        id: r.id,
        status: r.status,
        sentAt: r.sent_at,
        campaignId: r.campaign?.id,
        campaignName: r.campaign?.name || "WhatsApp Campaign",
        templateName: (r.campaign?.template_snapshot as any)?.template_name || "Freeform",
      })),
      messages: msgsRes.data ?? [],
    };
  });

export const getAudienceContacts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        tenantId: z.string().uuid(),
        audience: z.any(),
        search: z.string().default(""),
        page: z.number().default(0),
        pageSize: z.number().default(10),
      })
      .parse(d),
  )
  .handler(async ({ data: input, context }) => {
    const { supabase, userId } = context;
    const { tenantId, audience, search, page, pageSize } = input;

    const { authorize } = await import("./authorization.server");
    const { role } = await authorize(userId, "contact.create", null, tenantId);
    const isManagerPlus = role === "owner" || role === "admin" || role === "manager";

    let targetGroupIds: string[] = [];
    if (audience.mode === "groups" && Array.isArray(audience.ids)) {
      targetGroupIds = audience.ids;
    } else if (audience.mode === "audience_builder") {
      let activeAudience = audience;
      if (audience.savedAudienceId) {
        const { data: sa } = await supabase
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

    let hasRestrictedAudience = false;
    if (!isManagerPlus && targetGroupIds.length > 0) {
      const { data: groups } = await supabase
        .from("groups")
        .select("id, created_by")
        .in("id", targetGroupIds);
      const foreignGroupIds = (groups ?? [])
        .filter((g: any) => g.created_by && g.created_by !== userId)
        .map((g: any) => g.id);

      if (foreignGroupIds.length > 0) {
        const { data: shares } = await supabase
          .from("group_shares")
          .select("group_id, can_view_contacts, can_manage_contacts")
          .in("group_id", foreignGroupIds)
          .eq("shared_with_user", userId);

        const viewableGroupIds = (shares ?? [])
          .filter((s: any) => s.can_view_contacts || s.can_manage_contacts)
          .map((s: any) => s.group_id);

        hasRestrictedAudience = foreignGroupIds.some((id: string) => !viewableGroupIds.includes(id));
      }
    }

    if (hasRestrictedAudience) {
      return {
        rows: [],
        total: 0,
        permissionDenied: true,
      };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let clientToUse = supabaseAdmin;
    let q = clientToUse
      .from("contacts")
      .select(
        "id, name, phone_number_raw, phone_number_normalized, email, created_at, contact_tags(tags(id,name)), contact_groups(groups(id,name))",
        { count: "exact" }
      )
      .is("deleted_at", null)
      .not("phone_number_normalized", "is", null);

    const hasGroupAudience = targetGroupIds.length > 0;
    if (!hasGroupAudience) {
      q = q.eq("tenant_id", tenantId);
    }

    if (audience.mode === "tags" && audience.ids?.length) {
      const { data: ct } = await clientToUse
        .from("contact_tags")
        .select("contact_id")
        .eq("tenant_id", tenantId)
        .in("tag_id", audience.ids);
      const ids = (ct ?? []).map((r: any) => r.contact_id);
      q = q.in("id", ids);
    } else if (audience.mode === "groups" && audience.ids?.length) {
      const { data: cg } = await clientToUse
        .from("contact_groups")
        .select("contact_id")
        .in("group_id", audience.ids);
      const ids = (cg ?? []).map((r: any) => r.contact_id);
      q = q.in("id", ids);
    } else if (audience.mode === "audience_builder") {
      let activeAudience = audience;
      if (audience.savedAudienceId) {
        const { data: sa } = await clientToUse
          .from("saved_audiences")
          .select("criteria")
          .eq("id", audience.savedAudienceId)
          .maybeSingle();
        if (sa && sa.criteria) activeAudience = sa.criteria;
      }

      let includeSet: Set<string> | null = null;
      let groupMatches: string[] = [];
      if (activeAudience.includeGroups?.length) {
        const { data: cg } = await clientToUse
          .from("contact_groups")
          .select("contact_id")
          .in("group_id", activeAudience.includeGroups);
        groupMatches = (cg ?? []).map((r: any) => r.contact_id);
      }
      let tagMatches: string[] = [];
      if (activeAudience.includeTags?.length) {
        const { data: ct } = await clientToUse
          .from("contact_tags")
          .select("contact_id")
          .eq("tenant_id", tenantId)
          .in("tag_id", activeAudience.includeTags);
        tagMatches = (ct ?? []).map((r: any) => r.contact_id);
      }
      if (activeAudience.includeGroups?.length && activeAudience.includeTags?.length) {
        const groupSet = new Set(groupMatches);
        includeSet = new Set(tagMatches.filter((id) => groupSet.has(id)));
      } else if (activeAudience.includeGroups?.length) {
        includeSet = new Set(groupMatches);
      } else if (activeAudience.includeTags?.length) {
        includeSet = new Set(tagMatches);
      }

      if (activeAudience.manualContactIds?.length) {
        if (includeSet) {
          activeAudience.manualContactIds.forEach((id: string) => includeSet!.add(id));
        } else {
          includeSet = new Set(activeAudience.manualContactIds);
        }
      }

      const excludeIds = new Set<string>();
      if (activeAudience.excludeGroups?.length) {
        const { data: cg } = await clientToUse
          .from("contact_groups")
          .select("contact_id")
          .in("group_id", activeAudience.excludeGroups);
        cg?.forEach((r: any) => excludeIds.add(r.contact_id));
      }
      if (activeAudience.excludeTags?.length) {
        const { data: ct } = await clientToUse
          .from("contact_tags")
          .select("contact_id")
          .eq("tenant_id", tenantId)
          .in("tag_id", activeAudience.excludeTags);
        ct?.forEach((r: any) => excludeIds.add(r.contact_id));
      }

      if (includeSet !== null) {
        const finalIds = Array.from(includeSet).filter((id) => !excludeIds.has(id));
        if (!finalIds.length) return { rows: [], total: 0 };
        q = q.in("id", finalIds);
      } else if (excludeIds.size > 0) {
        q = q.not("id", "in", `(${Array.from(excludeIds).join(",")})`);
      }
    }

    if (search.trim()) {
      q = q.or(`name.ilike.%${search}%,phone_number_normalized.ilike.%${search}%`);
    }

    q = q.range(page * pageSize, (page + 1) * pageSize - 1);
    const { data, count } = await q.order("name", { ascending: true });
    return {
      rows: data ?? [],
      total: count ?? 0,
    };
  });

export const shareGroup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        tenantId: z.string().uuid(),
        groupId: z.string().uuid(),
        shares: z.array(
          z.object({
            userId: z.string().uuid(),
            canViewContacts: z.boolean(),
            canUseInCampaigns: z.boolean(),
            canEditAudience: z.boolean(),
            canManageContacts: z.boolean(),
            canReshareAudience: z.boolean(),
          })
        ),
      })
      .parse(d),
  )
  .handler(async ({ data: input, context }) => {
    const { supabase, userId } = context;
    const { tenantId, groupId, shares } = input;

    const { authorize } = await import("./authorization.server");
    await authorize(userId, "group.share", groupId, tenantId);

    await supabase
      .from("group_shares")
      .delete()
      .eq("group_id", groupId);

    if (shares.length > 0) {
      const rows = shares.map((s) => ({
        tenant_id: tenantId,
        group_id: groupId,
        shared_by: userId,
        shared_with_user: s.userId,
        audience_type: "group",
        can_view_contacts: s.canViewContacts,
        can_use_in_campaigns: s.canUseInCampaigns,
        can_edit_audience: s.canEditAudience,
        can_manage_contacts: s.canManageContacts,
        can_reshare_audience: s.canReshareAudience,
      }));

      const { error } = await supabase.from("group_shares").insert(rows);
      if (error) throw error;

      const auditRows = shares.map((s) => ({
        tenant_id: tenantId,
        action: "audience_shared",
        entity_type: "group",
        entity_id: groupId,
        user_id: userId,
        metadata: {
          shared_with_user: s.userId,
          permissions: {
            can_view_contacts: s.canViewContacts,
            can_use_in_campaigns: s.canUseInCampaigns,
            can_edit_audience: s.canEditAudience,
            can_manage_contacts: s.canManageContacts,
            can_reshare_audience: s.canReshareAudience,
          },
        },
      }));
      await supabase.from("audit_logs").insert(auditRows);
    } else {
      await supabase.from("audit_logs").insert({
        tenant_id: tenantId,
        action: "audience_unshared",
        entity_type: "group",
        entity_id: groupId,
        user_id: userId,
        metadata: { info: "Cleared all shares" },
      });
    }

    return { success: true };
  });

export const unshareGroup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        tenantId: z.string().uuid(),
        groupId: z.string().uuid(),
      })
      .parse(d),
  )
  .handler(async ({ data: input, context }) => {
    const { supabase, userId } = context;
    const { tenantId, groupId } = input;

    const { authorize } = await import("./authorization.server");
    await authorize(userId, "group.share", groupId, tenantId);

    await supabase
      .from("group_shares")
      .delete()
      .eq("group_id", groupId);

    await supabase.from("audit_logs").insert({
      tenant_id: tenantId,
      action: "audience_unshared",
      entity_type: "group",
      entity_id: groupId,
      user_id: userId,
    });

    return { success: true };
  });

const importContactsBulkInput = z.object({
  tenantId: z.string().uuid(),
  sourceType: z.enum(["bulk_paste", "csv"]),
  optInSource: z.string().optional().nullable(),
  optInDate: z.string().optional().nullable(),
  tagIds: z.array(z.string().uuid()).default([]),
  groupIds: z.array(z.string().uuid()).default([]),
  contacts: z.array(
    z.object({
      raw: z.string(),
      normalized: z.string(),
      name: z.string().optional().nullable(),
      email: z.string().optional().nullable(),
      company: z.string().optional().nullable(),
      wasDeleted: z.boolean().default(false),
      tags: z.array(z.string().uuid()).default([]),
      groups: z.array(z.string().uuid()).default([]),
    })
  ),
  totalRows: z.number(),
  duplicateRows: z.number(),
  invalidRows: z.number(),
});

export const importContactsBulk = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => importContactsBulkInput.parse(d))
  .handler(async ({ data: input, context }) => {
    const { userId } = context;
    const {
      tenantId,
      sourceType,
      optInSource,
      optInDate,
      tagIds,
      groupIds,
      contacts,
      totalRows,
      duplicateRows,
      invalidRows,
    } = input;

    const { authorize } = await import("./authorization.server");
    await authorize(userId, "contact.create", null, tenantId);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // 1. Create import session record
    const { data: imp, error: impErr } = await supabaseAdmin
      .from("contact_imports")
      .insert({
        tenant_id: tenantId,
        source_type: sourceType,
        file_name: sourceType === "csv" ? "Imported CSV" : null,
        total_rows: totalRows,
        imported_rows: contacts.length,
        duplicate_rows: duplicateRows,
        invalid_rows: invalidRows,
        created_by: userId,
      })
      .select("id")
      .single();
    if (impErr) throw impErr;

    const toInsert = contacts.filter((c) => !c.wasDeleted);
    const toRestore = contacts.filter((c) => c.wasDeleted);

    const restoredMap = new Map<string, string>(); // normalized -> id
    const insertedMap = new Map<string, string>(); // normalized -> id

    // 2. Restore deleted contacts
    if (toRestore.length) {
      for (const r of toRestore) {
        const { data: restored, error: rErr } = await supabaseAdmin
          .from("contacts")
          .update({
            deleted_at: null,
            name: r.name || null,
            email: r.email || null,
            company: r.company || null,
            opt_in_source: optInSource || null,
            opt_in_date: optInSource && optInDate ? new Date(optInDate).toISOString() : null,
            source_import_id: imp.id,
            updated_at: new Date().toISOString(),
          })
          .eq("tenant_id", tenantId)
          .eq("phone_number_normalized", r.normalized)
          .select("id");
        if (rErr) throw rErr;
        if (restored && restored.length > 0) {
          restoredMap.set(r.normalized, restored[0].id);
        }
      }
    }

    // 3. Insert new contacts in chunks
    if (toInsert.length) {
      for (let i = 0; i < toInsert.length; i += 500) {
        const chunk = toInsert.slice(i, i + 500);
        const { data: inserted, error: insertErr } = await supabaseAdmin
          .from("contacts")
          .insert(
            chunk.map((r) => {
              const cc = r.normalized.slice(0, r.normalized.length - 10) || "91";
              return {
                tenant_id: tenantId,
                phone_number_raw: r.raw,
                phone_number_normalized: r.normalized,
                name: r.name || null,
                email: r.email || null,
                company: r.company || null,
                country_code: cc,
                opt_in_source: optInSource || null,
                opt_in_date: optInSource && optInDate ? new Date(optInDate).toISOString() : null,
                source_import_id: imp.id,
                created_by: userId,
                source: sourceType === "csv" ? "csv_import" : "manual",
              };
            })
          )
          .select("id, phone_number_normalized");
        if (insertErr) throw insertErr;
        if (inserted) {
          inserted.forEach((c) => {
            insertedMap.set(c.phone_number_normalized, c.id);
          });
        }
      }
    }

    // 4. Create junction mappings & timeline logging in chunks
    const bulkContactTags: { contact_id: string; tag_id: string; tenant_id: string }[] = [];
    const bulkContactGroups: {
      contact_id: string;
      group_id: string;
      tenant_id: string;
      created_by: string;
    }[] = [];
    const bulkActivities: {
      tenant_id: string;
      contact_id: string;
      activity_type:
        | "delivered"
        | "read"
        | "imported"
        | "tag_added"
        | "tag_removed"
        | "group_added"
        | "group_removed"
        | "campaign_sent"
        | "replied"
        | "opted_out";
      reference_id?: string;
    }[] = [];

    contacts.forEach((c) => {
      const cid = restoredMap.get(c.normalized) || insertedMap.get(c.normalized);
      if (!cid) return;

      const combinedTags = Array.from(new Set([...tagIds, ...(c.tags ?? [])]));
      const combinedGroups = Array.from(new Set([...groupIds, ...(c.groups ?? [])]));

      combinedTags.forEach((tid) => {
        bulkContactTags.push({ contact_id: cid, tag_id: tid, tenant_id: tenantId });
        bulkActivities.push({
          tenant_id: tenantId,
          contact_id: cid,
          activity_type: "tag_added",
          reference_id: tid,
        });
      });

      combinedGroups.forEach((gid) => {
        bulkContactGroups.push({
          contact_id: cid,
          group_id: gid,
          tenant_id: tenantId,
          created_by: userId,
        });
        bulkActivities.push({
          tenant_id: tenantId,
          contact_id: cid,
          activity_type: "group_added",
          reference_id: gid,
        });
      });
    });

    if (bulkContactTags.length) {
      for (let i = 0; i < bulkContactTags.length; i += 500) {
        const { error } = await supabaseAdmin
          .from("contact_tags")
          .upsert(bulkContactTags.slice(i, i + 500), {
            onConflict: "contact_id,tag_id",
            ignoreDuplicates: true,
          });
        if (error) throw error;
      }
    }

    if (bulkContactGroups.length) {
      for (let i = 0; i < bulkContactGroups.length; i += 500) {
        const { error } = await supabaseAdmin
          .from("contact_groups")
          .upsert(bulkContactGroups.slice(i, i + 500), {
            onConflict: "contact_id,group_id",
            ignoreDuplicates: true,
          });
        if (error) throw error;
      }
    }

    if (bulkActivities.length) {
      for (let i = 0; i < bulkActivities.length; i += 500) {
        const { error } = await supabaseAdmin
          .from("contact_activities")
          .insert(bulkActivities.slice(i, i + 500));
        if (error) throw error;
      }
    }

    return {
      success: true,
      importedCount: restoredMap.size + insertedMap.size,
    };
  });
