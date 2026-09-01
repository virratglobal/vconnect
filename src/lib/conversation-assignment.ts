/**
 * Conversation Assignment Service
 *
 * Central service for all conversation assignment operations.
 * All business logic for assign / reassign / transfer / unassign lives here.
 * conversations.tsx, future AI handlers, webhooks, and automations must all
 * call through this service — never write assignment SQL inline.
 *
 * Future extension points (no schema change required):
 *   - AI agent takeover → call assignConversation({ ..., action: 'transferred', reason: 'AI handoff' })
 *   - Department routing → pre-select the target agent then call assignConversation
 *   - Round-robin / least-active → resolve the target agent server-side, then call here
 *   - Escalation → reassign to manager + log reason
 *   - Skill-based routing → same pattern
 */

import { supabase } from "@/integrations/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AssignmentAction = "assigned" | "reassigned" | "transferred" | "unassigned";

export interface AssignmentOptions {
  conversationId: string;
  tenantId: string;
  /** null = unassign */
  assignedTo: string | null;
  assignedBy: string;
  previousAssignee: string | null;
  action: AssignmentAction;
  reason?: string;
}

export interface AssignmentResult {
  ok: boolean;
  error?: string;
}

// ─── Core assignment function ─────────────────────────────────────────────────

export async function assignConversation(opts: AssignmentOptions): Promise<AssignmentResult> {
  const { conversationId, tenantId, assignedTo, assignedBy, previousAssignee, action, reason } =
    opts;

  // 1. Update the conversation row
  const { error: convError } = await supabase
    .from("conversations")
    .update({
      assigned_to: assignedTo,
      assigned_by: assignedBy,
      assigned_at: new Date().toISOString(),
      // When resolved conversation is reopened via reassignment, restore status
      ...(action === "assigned" || action === "transferred" ? {} : {}),
    })
    .eq("id", conversationId);

  if (convError) return { ok: false, error: convError.message };

  // 2. Write assignment log (full audit record)
  const { error: logError } = await supabase.from("conversation_assignment_logs").insert({
    tenant_id: tenantId,
    conversation_id: conversationId,
    action,
    assigned_to: assignedTo,
    assigned_by: assignedBy,
    previous_assignee: previousAssignee ?? null,
    reason: reason ?? null,
  });

  if (logError) {
    console.warn("[AssignmentService] Log insert failed:", logError.message);
    // Non-fatal — don't roll back the assignment
  }

  // 3. Write unified activity record (for timeline)
  const { error: actError } = await supabase.from("conversation_activities").insert({
    tenant_id: tenantId,
    conversation_id: conversationId,
    actor_id: assignedBy,
    activity_type: action,
    metadata: {
      assigned_to: assignedTo,
      previous_assignee: previousAssignee ?? null,
      reason: reason ?? null,
    },
  });

  if (actError) {
    console.warn("[AssignmentService] Activity insert failed:", actError.message);
  }

  return { ok: true };
}

// ─── Status change (with activity log) ───────────────────────────────────────

export async function changeConversationStatus(
  conversationId: string,
  tenantId: string,
  newStatus: string,
  actorId: string,
  previousStatus: string,
): Promise<AssignmentResult> {
  const { error } = await supabase
    .from("conversations")
    .update({
      status: newStatus,
      ...(newStatus === "resolved" ? { resolved_at: new Date().toISOString() } : {}),
      ...(newStatus === "open" ? { resolved_at: null } : {}),
    })
    .eq("id", conversationId);

  if (error) return { ok: false, error: error.message };

  await supabase.from("conversation_activities").insert({
    tenant_id: tenantId,
    conversation_id: conversationId,
    actor_id: actorId,
    activity_type:
      newStatus === "resolved" ? "resolved" : newStatus === "closed" ? "closed" : "status_changed",
    metadata: { previous_status: previousStatus, new_status: newStatus },
  });

  return { ok: true };
}

// ─── Priority change (with activity log) ─────────────────────────────────────

export async function changeConversationPriority(
  conversationId: string,
  tenantId: string,
  newPriority: string,
  actorId: string,
  previousPriority: string,
): Promise<AssignmentResult> {
  const { error } = await supabase
    .from("conversations")
    .update({ priority: newPriority })
    .eq("id", conversationId);

  if (error) return { ok: false, error: error.message };

  await supabase.from("conversation_activities").insert({
    tenant_id: tenantId,
    conversation_id: conversationId,
    actor_id: actorId,
    activity_type: "priority_changed",
    metadata: { previous_priority: previousPriority, new_priority: newPriority },
  });

  return { ok: true };
}

// ─── Internal note (with activity log + mention extraction) ──────────────────

export async function addInternalNote(opts: {
  conversationId: string;
  tenantId: string;
  authorId: string;
  body: string;
  mentionedUserIds: string[];
}): Promise<AssignmentResult & { noteId?: string }> {
  const { conversationId, tenantId, authorId, body, mentionedUserIds } = opts;

  const { data: note, error } = await supabase
    .from("conversation_internal_notes")
    .insert({
      tenant_id: tenantId,
      conversation_id: conversationId,
      author_id: authorId,
      body,
      mentions: mentionedUserIds,
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };

  await supabase.from("conversation_activities").insert({
    tenant_id: tenantId,
    conversation_id: conversationId,
    actor_id: authorId,
    activity_type: "note_added",
    metadata: { note_id: note.id, mentions: mentionedUserIds },
  });

  return { ok: true, noteId: note.id };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Extract @mention names from note body and resolve to user_ids */
export function extractMentions(
  body: string,
  members: Array<{
    user_id: string;
    profile: { full_name: string | null; email: string | null } | null;
  }>,
): string[] {
  const mentionRegex = /@([\w.\s]+?)(?=\s|$|[@,.])/g;
  const mentioned: string[] = [];
  let match: RegExpExecArray | null;

  // eslint-disable-next-line no-cond-assign
  while ((match = mentionRegex.exec(body)) !== null) {
    const name = match[1].trim().toLowerCase();
    const member = members.find((m) => {
      const fullName = (m.profile?.full_name ?? "").toLowerCase();
      const email = (m.profile?.email ?? "").toLowerCase();
      return fullName.startsWith(name) || email.startsWith(name);
    });
    if (member && !mentioned.includes(member.user_id)) {
      mentioned.push(member.user_id);
    }
  }
  return mentioned;
}

/** Determine the correct AssignmentAction based on previous and new assignee */
export function resolveAction(
  previousAssignee: string | null,
  newAssignee: string | null,
): AssignmentAction {
  if (!newAssignee) return "unassigned";
  if (!previousAssignee) return "assigned";
  return "reassigned";
}

/** Format duration for SLA display */
export function formatDuration(ms: number): string {
  const totalMins = Math.floor(ms / 60000);
  if (totalMins < 60) return `${totalMins}m`;
  const hrs = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (hrs < 24) return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
  const days = Math.floor(hrs / 24);
  const remHrs = hrs % 24;
  return remHrs > 0 ? `${days}d ${remHrs}h` : `${days}d`;
}
