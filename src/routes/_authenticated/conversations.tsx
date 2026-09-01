import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useActiveTenant, canManage } from "@/hooks/use-tenant";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  MessageSquare,
  Search,
  Check,
  CheckCheck,
  Image as ImageIcon,
  FileText,
  Smile,
  Paperclip,
  SendHorizonal,
  RefreshCw,
  UserPlus,
  ChevronDown,
  AlertCircle,
  Inbox,
  RotateCcw,
  Loader2,
  User,
  Users,
  X,
  StickyNote,
  Activity,
  Timer,
  ArrowRightLeft,
  UserX,
  Flag,
  Clock,
  Lock,
  AtSign,
} from "lucide-react";
import { sendConversationReply, retryConversationReply, getConversationsList } from "@/lib/conversations.functions";
import {
  assignConversation,
  changeConversationStatus,
  changeConversationPriority,
  addInternalNote,
  extractMentions,
  resolveAction,
  formatDuration,
} from "@/lib/conversation-assignment";

// ─── Route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/_authenticated/conversations")({
  head: () => ({ meta: [{ title: "Conversations · Virrat Reach" }] }),
  component: ConversationsPage,
});

// ─── Types ────────────────────────────────────────────────────────────────────

type ConvStatusFilter = "all" | "open" | "pending" | "resolved" | "closed";
type ConvAssignFilter = "all" | "mine" | "unassigned" | "replied";
type ConvPriorityFilter = "all" | "low" | "medium" | "high" | "urgent";

interface Conversation {
  id: string;
  tenant_id: string;
  contact_id: string | null;
  phone_number: string;
  last_message: string | null;
  last_message_at: string | null;
  last_inbound_at: string | null;
  unread_count: number;
  status: string;
  priority: "low" | "medium" | "high" | "urgent";
  assigned_to: string | null;
  assigned_by: string | null;
  assigned_at: string | null;
  first_response_at: string | null;
  resolved_at: string | null;
  created_at: string;
  contact?: { id: string; name: string; phone_number_normalized: string } | null;
  assignee?: { id: string; full_name: string | null; email: string | null } | null;
}

interface Message {
  id: string;
  conversation_id: string;
  direction: string;
  message_type: string;
  message_text: string | null;
  media_url: string | null;
  meta_message_id: string | null;
  meta_status: string | null;
  sent_at: string | null;
  delivered_at: string | null;
  read_at: string | null;
  created_at: string;
}

interface Message {
  id: string;
  conversation_id: string;
  direction: string;
  message_type: string;
  message_text: string | null;
  media_url: string | null;
  meta_message_id: string | null;
  meta_status: string | null;
  sent_at: string | null;
  delivered_at: string | null;
  read_at: string | null;
  created_at: string;
}

interface InternalNote {
  id: string;
  conversation_id: string;
  author_id: string;
  body: string;
  mentions: string[];
  created_at: string;
  updated_at: string;
  author?: { id: string; full_name: string | null; email: string | null } | null;
}

interface ConversationActivity {
  id: string;
  conversation_id: string;
  actor_id: string | null;
  activity_type: string;
  metadata: Record<string, any>;
  created_at: string;
  actor?: { id: string; full_name: string | null; email: string | null } | null;
}

interface WorkspaceMember {
  user_id: string;
  role: string;
  profile: { id: string; full_name: string | null; email: string | null } | null;
}

type TimelineItem =
  | { kind: "message"; timestamp: string; data: Message }
  | { kind: "note"; timestamp: string; data: InternalNote }
  | { kind: "activity"; timestamp: string; data: ConversationActivity };

// ─── Priority config ──────────────────────────────────────────────────────────

const PRIORITY_CONFIG: Record<string, { label: string; color: string; dotColor: string }> = {
  low: {
    label: "Low",
    color: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    dotColor: "bg-slate-400",
  },
  medium: {
    label: "Medium",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    dotColor: "bg-blue-500",
  },
  high: {
    label: "High",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    dotColor: "bg-amber-500",
  },
  urgent: {
    label: "Urgent",
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    dotColor: "bg-red-500",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string | null): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString();
}

function formatTime(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Today";
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function getContactDisplay(conv: Conversation, contactsByPhoneMap?: Map<string, string>): string {
  if (conv.contact?.name) return conv.contact.name;
  if (contactsByPhoneMap && conv.phone_number) {
    const norm = conv.phone_number.replace(/\D/g, "");
    if (norm && contactsByPhoneMap.has(norm)) {
      return contactsByPhoneMap.get(norm)!;
    }
  }
  return conv.phone_number || "Unknown";
}

function getMemberName(member: WorkspaceMember | undefined | null): string {
  return member?.profile?.full_name || member?.profile?.email || "Unknown";
}

function getUserDisplayName(userId: string | null, members: WorkspaceMember[]): string {
  if (!userId) return "Unassigned";
  const m = members.find((m) => m.user_id === userId);
  return getMemberName(m);
}

function getUserInitials(name: string): string {
  return (
    name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?"
  );
}

function getActivityLabel(activity: ConversationActivity, members: WorkspaceMember[]): string {
  const actor = activity.actor?.full_name || activity.actor?.email || "Someone";
  const m = activity.metadata;
  switch (activity.activity_type) {
    case "created":
      return "Conversation started";
    case "assigned":
      return `${actor} assigned to ${getUserDisplayName(m.assigned_to, members)}`;
    case "reassigned":
      return `${actor} reassigned from ${getUserDisplayName(m.previous_assignee, members)} → ${getUserDisplayName(m.assigned_to, members)}`;
    case "transferred":
      return `${actor} transferred to ${getUserDisplayName(m.assigned_to, members)}`;
    case "unassigned":
      return `${actor} removed assignee`;
    case "status_changed":
      return `${actor} changed status to ${m.new_status}`;
    case "priority_changed":
      return `${actor} set priority to ${m.new_priority}`;
    case "note_added":
      return `${actor} added an internal note`;
    case "resolved":
      return `${actor} marked as resolved`;
    case "closed":
      return `${actor} closed conversation`;
    case "reopened":
      return `${actor} reopened conversation`;
    default:
      return `${actor} performed an action`;
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MsgStatus({ status }: { status: string | null }) {
  if (!status) return null;
  switch (status) {
    case "sending":
      return <span className="text-[10px] text-muted-foreground">⏳ Sending</span>;
    case "sent":
      return <span className="text-[10px] text-muted-foreground">✓ Sent</span>;
    case "delivered":
      return <span className="text-[10px] text-muted-foreground">✓✓ Delivered</span>;
    case "read":
      return <span className="text-[10px] text-blue-500 font-medium">✓✓ Read</span>;
    case "failed":
      return <span className="text-[10px] text-destructive">❌ Failed</span>;
    default:
      return null;
  }
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    open: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    resolved: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    closed: "bg-muted text-muted-foreground",
  };
  return (
    <span
      className={cn(
        "text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize",
        colors[status] ?? colors.open,
      )}
    >
      {status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const cfg = PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG.medium;
  return (
    <span
      className={cn(
        "text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1",
        cfg.color,
      )}
    >
      <span className={cn("size-1.5 rounded-full inline-block", cfg.dotColor)} />
      {cfg.label}
    </span>
  );
}

function DateSeparator({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-2 px-2">
      <div className="flex-1 h-px bg-border" />
      <span className="text-[11px] text-muted-foreground font-medium px-2">{label}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

function ActivityEventPill({
  activity,
  members,
}: {
  activity: ConversationActivity;
  members: WorkspaceMember[];
}) {
  const icons: Record<string, React.ReactNode> = {
    assigned: <User className="size-3" />,
    reassigned: <ArrowRightLeft className="size-3" />,
    transferred: <ArrowRightLeft className="size-3" />,
    unassigned: <UserX className="size-3" />,
    status_changed: <Activity className="size-3" />,
    priority_changed: <Flag className="size-3" />,
    note_added: <StickyNote className="size-3" />,
    resolved: <Check className="size-3" />,
    closed: <X className="size-3" />,
    created: <MessageSquare className="size-3" />,
    reopened: <RotateCcw className="size-3" />,
  };
  const icon = icons[activity.activity_type] ?? <Activity className="size-3" />;
  const label = getActivityLabel(activity, members);

  return (
    <div className="flex items-center justify-center gap-2 py-1">
      <div className="flex items-center gap-1.5 bg-muted/60 border border-border/50 text-muted-foreground rounded-full px-3 py-1 text-[11px]">
        <span className="text-primary/70">{icon}</span>
        <span>{label}</span>
        <span className="text-muted-foreground/50">·</span>
        <span className="text-[10px]">{formatTime(activity.created_at)}</span>
      </div>
    </div>
  );
}

function NoteCard({
  note,
  currentUserId,
  canDelete,
  onEdit,
  onDelete,
}: {
  note: InternalNote;
  currentUserId: string;
  canDelete: boolean;
  onEdit: (note: InternalNote) => void;
  onDelete: (noteId: string) => void;
}) {
  const authorName = note.author?.full_name || note.author?.email || "Team member";
  const isOwn = note.author_id === currentUserId;

  // Highlight @mentions in the note body
  const renderedBody = note.body.replace(/@([\w. ]+)/g, (match) => {
    return `<span class="font-semibold text-primary">${match}</span>`;
  });

  return (
    <div className="flex justify-center py-1">
      <div className="max-w-[80%] w-full">
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl px-4 py-2.5">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <StickyNote className="size-3 text-amber-600 dark:text-amber-400" />
              <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                Internal Note
              </span>
              <span className="text-[10px] text-amber-600/70 dark:text-amber-500/70">·</span>
              <span className="text-[11px] text-amber-600/80 dark:text-amber-500/80">
                {authorName}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-amber-600/60">{formatTime(note.created_at)}</span>
              {(isOwn || canDelete) && (
                <>
                  {isOwn && (
                    <button
                      onClick={() => onEdit(note)}
                      className="text-amber-600/60 hover:text-amber-700 dark:hover:text-amber-400 p-0.5 rounded transition-colors"
                      title="Edit note"
                    >
                      <FileText className="size-3" />
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => onDelete(note.id)}
                      className="text-amber-600/60 hover:text-destructive p-0.5 rounded transition-colors"
                      title="Delete note"
                    >
                      <X className="size-3" />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
          <p
            className="text-sm text-amber-900 dark:text-amber-200 whitespace-pre-wrap break-words leading-snug"
            dangerouslySetInnerHTML={{ __html: renderedBody }}
          />
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ msg, onRetry }: { msg: Message; onRetry?: (id: string) => void }) {
  const isOutbound = msg.direction === "outbound";
  return (
    <div className={cn("flex mb-2", isOutbound ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm",
          isOutbound
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-card border border-border rounded-tl-sm",
        )}
      >
        {msg.message_type === "image" && (
          <div className="flex items-center gap-2 mb-1 text-xs opacity-80">
            <ImageIcon className="size-3" /> Image
          </div>
        )}
        {["document", "audio", "video"].includes(msg.message_type) && (
          <div className="flex items-center gap-2 mb-1 text-xs opacity-80">
            <FileText className="size-3" />{" "}
            {msg.message_type.charAt(0).toUpperCase() + msg.message_type.slice(1)}
          </div>
        )}
        {msg.message_type === "template" && (
          <div className="text-[10px] opacity-60 mb-1 font-medium uppercase tracking-wide">
            Template
          </div>
        )}
        {msg.media_url && msg.message_type === "image" && (
          <div className="mb-2">
            <img
              src={msg.media_url}
              alt="Attached Image"
              className="max-h-40 rounded border object-contain bg-background"
              loading="lazy"
            />
          </div>
        )}
        {msg.media_url && msg.message_type !== "image" && (
          <div className="mb-2">
            <a
              href={msg.media_url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "text-xs underline flex items-center gap-1 opacity-90 hover:opacity-100",
                isOutbound ? "text-primary-foreground" : "text-primary",
              )}
            >
              <Paperclip className="size-3" /> Open {msg.message_type}
            </a>
          </div>
        )}
        {msg.message_text && (
          <p className="text-sm whitespace-pre-wrap break-words leading-snug">{msg.message_text}</p>
        )}
        <div
          className={cn(
            "flex items-center gap-1 mt-1",
            isOutbound ? "justify-end" : "justify-start",
          )}
        >
          <span className="text-[10px] opacity-60">{formatTime(msg.created_at)}</span>
          {isOutbound && (
            <div className="flex items-center gap-1">
              <MsgStatus status={msg.meta_status} />
              {msg.meta_status === "failed" && onRetry && (
                <button
                  type="button"
                  onClick={() => onRetry(msg.id)}
                  className={cn(
                    "p-0.5 rounded transition-colors ml-1",
                    isOutbound
                      ? "hover:bg-primary-foreground/20 text-primary-foreground"
                      : "hover:bg-muted text-destructive",
                  )}
                  title="Retry sending"
                >
                  <RotateCcw className="size-3" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Assign Modal ─────────────────────────────────────────────────────────────

function AssignModal({
  conv,
  members,
  currentUserId,
  tenantId,
  onClose,
  onAssigned,
}: {
  conv: Conversation;
  members: WorkspaceMember[];
  currentUserId: string;
  tenantId: string;
  onClose: () => void;
  onAssigned: () => void;
}) {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const filtered = members.filter((m) => {
    if (!search.trim()) return true;
    const name = (m.profile?.full_name ?? "").toLowerCase();
    const email = (m.profile?.email ?? "").toLowerCase();
    return name.includes(search.toLowerCase()) || email.includes(search.toLowerCase());
  });

  async function handleAssign(targetUserId: string | null) {
    const action = resolveAction(conv.assigned_to, targetUserId);
    setLoading(targetUserId ?? "__unassign__");
    const result = await assignConversation({
      conversationId: conv.id,
      tenantId,
      assignedTo: targetUserId,
      assignedBy: currentUserId,
      previousAssignee: conv.assigned_to,
      action,
      reason: reason.trim() || undefined,
    });
    setLoading(null);
    if (!result.ok) {
      toast.error("Assignment failed: " + result.error);
    } else {
      const label = targetUserId
        ? `Assigned to ${getUserDisplayName(targetUserId, members)}`
        : "Unassigned";
      toast.success(label);
      onAssigned();
      onClose();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-2xl shadow-2xl w-[360px] max-h-[500px] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div>
            <h3 className="text-sm font-semibold">Assign Conversation</h3>
            {conv.assigned_to && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Currently:{" "}
                <span className="font-medium">{getUserDisplayName(conv.assigned_to, members)}</span>
              </p>
            )}
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-muted transition-colors">
            <X className="size-4 text-muted-foreground" />
          </button>
        </div>

        {/* Search */}
        <div className="px-3 pt-3 pb-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              autoFocus
              placeholder="Search team members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
          </div>
        </div>

        {/* Optional reason */}
        <div className="px-3 pb-2">
          <Input
            placeholder="Reason (optional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="h-7 text-xs"
          />
        </div>

        {/* Member list */}
        <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-0.5">
          {conv.assigned_to && (
            <button
              onClick={() => handleAssign(null)}
              disabled={!!loading}
              className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors text-sm"
            >
              {loading === "__unassign__" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <UserX className="size-4" />
              )}
              Unassign
            </button>
          )}
          {filtered.map((m) => {
            const name = getMemberName(m);
            const initials = getUserInitials(name);
            const isAssigned = conv.assigned_to === m.user_id;
            return (
              <button
                key={m.user_id}
                onClick={() => handleAssign(m.user_id)}
                disabled={!!loading || isAssigned}
                className={cn(
                  "w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-colors text-left",
                  isAssigned ? "bg-primary/10 cursor-default" : "hover:bg-accent",
                )}
              >
                <div
                  className={cn(
                    "size-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0",
                    isAssigned
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {loading === m.user_id ? <Loader2 className="size-3.5 animate-spin" /> : initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium truncate">{name}</span>
                    {isAssigned && (
                      <span className="text-[10px] text-primary font-semibold">Assigned</span>
                    )}
                  </div>
                  <span className="text-[11px] text-muted-foreground truncate capitalize">
                    {m.role}
                  </span>
                </div>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center text-xs text-muted-foreground py-4">No members found</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Conversation List Item ───────────────────────────────────────────────────

function ConversationItem({
  conv,
  isActive,
  hasReplied,
  contactsByPhoneMap,
  onClick,
  members,
}: {
  conv: Conversation;
  isActive: boolean;
  hasReplied?: boolean;
  contactsByPhoneMap?: Map<string, string>;
  onClick: () => void;
  members: WorkspaceMember[];
}) {
  const name = getContactDisplay(conv, contactsByPhoneMap);
  const initials = name.slice(0, 2).toUpperCase();
  const assigneeName = conv.assigned_to ? getUserDisplayName(conv.assigned_to, members) : null;

  return (
    <button
      onClick={onClick}
      style={
        { contentVisibility: "auto", containIntrinsicSize: "auto 80px" } as React.CSSProperties
      }
      className={cn(
        "w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/60 border-b border-border/50",
        isActive && "bg-primary/8 border-l-2 border-l-primary",
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "size-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-semibold",
          isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
        )}
      >
        {initials}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <span className={cn("text-sm font-medium truncate", isActive && "text-primary")}>
            {name}
          </span>
          <span className="text-[11px] text-muted-foreground flex-shrink-0">
            {timeAgo(conv.last_message_at)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-1 mt-0.5">
          <p className="text-xs text-muted-foreground truncate">
            {conv.last_message || "No messages yet"}
          </p>
          {conv.unread_count > 0 && (
            <span className="flex-shrink-0 size-4 min-w-[1rem] rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
              {conv.unread_count > 9 ? "9+" : conv.unread_count}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 mt-1 flex-wrap">
          {hasReplied && (
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 px-1.5 py-0.5 rounded-full">
              Replied
            </span>
          )}
          <PriorityBadge priority={conv.priority} />
          {assigneeName && (
            <span className="text-[10px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded-full truncate max-w-[80px]">
              {assigneeName}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

// ─── SLA Timer ────────────────────────────────────────────────────────────────

function SLATimer({ conv }: { conv: Conversation }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  if (conv.status === "closed") return null;

  if (conv.resolved_at) {
    const duration = new Date(conv.resolved_at).getTime() - new Date(conv.created_at).getTime();
    return (
      <div className="flex items-center gap-1 text-[11px] text-purple-600 dark:text-purple-400">
        <Check className="size-3" />
        <span>Resolved in {formatDuration(duration)}</span>
      </div>
    );
  }

  const elapsed = now - new Date(conv.created_at).getTime();
  const isOld = elapsed > 4 * 60 * 60 * 1000; // > 4 hours

  return (
    <div
      className={cn(
        "flex items-center gap-1 text-[11px]",
        isOld ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground",
      )}
    >
      <Clock className="size-3" />
      <span>Open {formatDuration(elapsed)}</span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function ConversationsPage() {
  const { activeId, membership } = useActiveTenant();
  const { user } = useAuth();
  const qc = useQueryClient();

  const isAgent = membership?.role === "agent";
  const canAssign = canManage(membership?.role, "manager");
  const canDeleteNotes = canManage(membership?.role, "admin");
  const currentUserId = user?.id ?? "";

  // ── Existing state ────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ConvStatusFilter>("all");
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [msgPage, setMsgPage] = useState(1);
  const MSG_PAGE_SIZE = 30;

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevConvIdRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [messageText, setMessageText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [templateVars, setTemplateVars] = useState<Record<string, string>>({});
  const [templateMediaUrl, setTemplateMediaUrl] = useState("");
  const [uploadingTemplateMedia, setUploadingTemplateMedia] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{
    url: string;
    name: string;
    type: "image" | "document" | "audio" | "video";
  } | null>(null);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);

  // ── New state ─────────────────────────────────────────────────────────────
  const [assignFilter, setAssignFilter] = useState<ConvAssignFilter>("all");
  const [priorityFilter, setPriorityFilter] = useState<ConvPriorityFilter>("all");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [composerTab, setComposerTab] = useState<"message" | "note">("message");
  const [noteText, setNoteText] = useState("");
  const [mentionSearch, setMentionSearch] = useState("");
  const [showMentionPicker, setShowMentionPicker] = useState(false);
  const noteTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editNoteText, setEditNoteText] = useState("");

  // Reset active conversation selection when active tenant changes
  useEffect(() => {
    setActiveConvId(null);
  }, [activeId]);

  // ── Server function hooks (unchanged) ─────────────────────────────────────
  const sendReplyFn = useServerFn(sendConversationReply);
  const retryReplyFn = useServerFn(retryConversationReply);
  const getConvsListFn = useServerFn(getConversationsList);

  // ── Last inbound message (for 24h window) ─────────────────────────────────
  const { data: lastInboundMessage } = useQuery({
    queryKey: ["last-inbound", activeConvId, activeId],
    enabled: !!activeConvId && !!activeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conversation_messages")
        .select("created_at")
        .eq("conversation_id", activeConvId!)
        .eq("direction", "inbound")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const lastInboundTime = lastInboundMessage?.created_at
    ? new Date(lastInboundMessage.created_at).getTime()
    : null;
  const isWindowOpen = lastInboundTime ? Date.now() - lastInboundTime < 24 * 60 * 60 * 1000 : false;

  useEffect(() => {
    if (activeConvId) {
      if (!isWindowOpen) {
        setShowTemplatePicker(true);
      } else {
        setShowTemplatePicker(false);
      }
      setMessageText("");
      setAttachedFile(null);
      setSelectedTemplateId("");
      setTemplateVars({});
      setTemplateMediaUrl("");
      setComposerTab("message");
      setNoteText("");
    }
  }, [activeConvId, isWindowOpen]);

  // ── Templates list (for template picker in non-window state) ──────────────
  const { data: templates = [] } = useQuery({
    queryKey: ["templates", activeId],
    enabled: !!activeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("message_templates")
        .select("*")
        .eq("tenant_id", activeId!)
        .eq("approval_status", "APPROVED")
        .order("template_name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId) ?? null;

  // ── Workspace members (for assign modal + mentions) ───────────────────────
  const { data: workspaceMembers = [] } = useQuery({
    queryKey: ["workspace-members", activeId],
    enabled: !!activeId,
    queryFn: async (): Promise<WorkspaceMember[]> => {
      const { data, error } = await supabase
        .from("tenant_members")
        .select("user_id, role, profile:user_id(id, full_name, email)")
        .eq("tenant_id", activeId!)
        .order("created_at");
      if (error) throw error;
      return (data ?? []) as unknown as WorkspaceMember[];
    },
  });

  // ── Conversations list ────────────────────────────────────────────────────
  const { data: conversations = [], isLoading: convsLoading } = useQuery({
    queryKey: ["conversations", activeId, statusFilter, assignFilter, priorityFilter],
    enabled: !!activeId,
    queryFn: async () => {
      const res = await getConvsListFn({
        data: {
          tenantId: activeId!,
          statusFilter,
          assignFilter,
          priorityFilter,
        },
      });
      return (res ?? []) as Conversation[];
    },
  });

  // ── Fetch inbound reply timestamps for loaded conversations ───────────────
  const convIds = useMemo(() => conversations.map((c) => c.id), [conversations]);

  const { data: inboundReplyMap = new Map<string, string>() } = useQuery({
    queryKey: ["inbound-replies-map", activeId, convIds.join(",")],
    enabled: !!activeId && convIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conversation_messages")
        .select("conversation_id, created_at")
        .in("conversation_id", convIds)
        .eq("direction", "inbound")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const map = new Map<string, string>();
      for (const msg of data ?? []) {
        if (msg.conversation_id && msg.created_at && !map.has(msg.conversation_id)) {
          map.set(msg.conversation_id, msg.created_at);
        }
      }
      return map;
    },
    staleTime: 5000,
  });

  // ── Contact names map fallback (for unlinked or RLS propagation delays) ────
  const { data: contactsMinimal = [] } = useQuery({
    queryKey: ["contacts-minimal-map", activeId],
    enabled: !!activeId,
    queryFn: async () => {
      const { data } = await supabase
        .from("contacts")
        .select("name, phone_number_normalized")
        .eq("tenant_id", activeId!);
      return data ?? [];
    },
  });

  const contactsByPhoneMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of contactsMinimal) {
      if (c.phone_number_normalized && c.name) {
        const norm = c.phone_number_normalized.replace(/\D/g, "");
        if (norm) map.set(norm, c.name);
      }
    }
    return map;
  }, [contactsMinimal]);

  // ── Count of conversations where customer has replied ──────────────────────
  const repliedCount = useMemo(() => {
    return conversations.filter((c) => !!(inboundReplyMap.get(c.id) || c.last_inbound_at)).length;
  }, [conversations, inboundReplyMap]);

  // ── Filtered and sorted: Unread & numbers that REPLIED ALWAYS at the top ─────
  const sortedConvs = useMemo(() => {
    const list = conversations.filter((c) => {
      // 1. Search text filter
      if (search.trim()) {
        const s = search.toLowerCase();
        const contactName = getContactDisplay(c, contactsByPhoneMap).toLowerCase();
        const matchesSearch =
          contactName.includes(s) ||
          (c.phone_number ?? "").includes(s) ||
          (c.last_message ?? "").toLowerCase().includes(s);
        if (!matchesSearch) return false;
      }

      // 2. Campaign Replies filter section
      if (assignFilter === "replied") {
        const hasReplied = !!(inboundReplyMap.get(c.id) || c.last_inbound_at);
        if (!hasReplied) return false;
      }

      return true;
    });

    return list.sort((a, b) => {
      // 1. Unread customer replies ALWAYS take priority at top of list
      const unreadA = (a.unread_count ?? 0) > 0 ? 1 : 0;
      const unreadB = (b.unread_count ?? 0) > 0 ? 1 : 0;
      if (unreadA !== unreadB) {
        return unreadB - unreadA;
      }

      // 2. Numbers that HAVE REPLIED (in inboundReplyMap or last_inbound_at) ALWAYS come BEFORE unreplied campaign contacts
      const inboundTimeA = inboundReplyMap.get(a.id) || a.last_inbound_at;
      const inboundTimeB = inboundReplyMap.get(b.id) || b.last_inbound_at;

      const hasRepliedA = inboundTimeA ? 1 : 0;
      const hasRepliedB = inboundTimeB ? 1 : 0;
      if (hasRepliedA !== hasRepliedB) {
        return hasRepliedB - hasRepliedA;
      }

      // 3. Among replied (or non-replied) conversations, sort by latest inbound time / message time DESC
      const timeA = inboundTimeA
        ? new Date(inboundTimeA).getTime()
        : a.last_message_at
          ? new Date(a.last_message_at).getTime()
          : new Date(a.created_at).getTime();
      const timeB = inboundTimeB
        ? new Date(inboundTimeB).getTime()
        : b.last_message_at
          ? new Date(b.last_message_at).getTime()
          : new Date(b.created_at).getTime();
      return timeB - timeA;
    });
  }, [conversations, inboundReplyMap, contactsByPhoneMap, search, assignFilter]);

  const activeConv = conversations.find((c) => c.id === activeConvId) ?? null;

  // ── Messages ──────────────────────────────────────────────────────────────
  const { data: messages = [], isLoading: msgsLoading } = useQuery({
    queryKey: ["messages", activeConvId, msgPage, activeId],
    enabled: !!activeConvId && !!activeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conversation_messages")
        .select(
          "id, conversation_id, direction, message_type, message_text, media_url, meta_message_id, meta_status, sent_at, delivered_at, read_at, created_at",
        )
        .eq("conversation_id", activeConvId!)
        .order("created_at", { ascending: false })
        .range((msgPage - 1) * MSG_PAGE_SIZE, msgPage * MSG_PAGE_SIZE - 1);
      if (error) throw error;
      return ((data ?? []) as Message[]).reverse();
    },
    staleTime: 0,
  });

  // ── Internal notes ────────────────────────────────────────────────────────
  const { data: internalNotes = [] } = useQuery({
    queryKey: ["conv-notes", activeConvId, activeId],
    enabled: !!activeConvId && !!activeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conversation_internal_notes")
        .select("*, author:author_id(id, full_name, email)")
        .eq("conversation_id", activeConvId!)
        .is("deleted_at", null)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as InternalNote[];
    },
  });

  // ── Activities ────────────────────────────────────────────────────────────
  const { data: activities = [] } = useQuery({
    queryKey: ["conv-activities", activeConvId, activeId],
    enabled: !!activeConvId && !!activeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conversation_activities")
        .select("*, actor:actor_id(id, full_name, email)")
        .eq("conversation_id", activeConvId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as ConversationActivity[];
    },
  });

  // ── Unified timeline builder ──────────────────────────────────────────────
  const timeline = useMemo((): TimelineItem[] => {
    const items: TimelineItem[] = [
      ...messages.map((m) => ({ kind: "message" as const, timestamp: m.created_at, data: m })),
      ...internalNotes.map((n) => ({ kind: "note" as const, timestamp: n.created_at, data: n })),
      ...activities.map((a) => ({ kind: "activity" as const, timestamp: a.created_at, data: a })),
    ];
    return items.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [messages, internalNotes, activities]);

  // Group timeline items by date
  function groupTimeline(items: TimelineItem[]): { label: string; items: TimelineItem[] }[] {
    const groups: { label: string; items: TimelineItem[] }[] = [];
    let currentLabel = "";
    for (const item of items) {
      const label = formatDate(item.timestamp);
      if (label !== currentLabel) {
        currentLabel = label;
        groups.push({ label, items: [item] });
      } else {
        groups[groups.length - 1].items.push(item);
      }
    }
    return groups;
  }

  // ── Permission checks ─────────────────────────────────────────────────────
  const canReply = !isAgent || activeConv?.assigned_to === currentUserId;

  // ── Reset unread ──────────────────────────────────────────────────────────
  const resetUnread = useCallback(
    async (convId: string) => {
      await supabase.from("conversations").update({ unread_count: 0 }).eq("id", convId);
      qc.invalidateQueries({ queryKey: ["conversations", activeId] });
    },
    [activeId, qc],
  );

  useEffect(() => {
    if (activeConvId && activeConvId !== prevConvIdRef.current) {
      prevConvIdRef.current = activeConvId;
      setMsgPage(1);
      resetUnread(activeConvId);
    }
  }, [activeConvId, resetUnread]);

  // ── Auto-scroll ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (msgPage === 1) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [timeline, msgPage]);

  // ── Realtime subscriptions ────────────────────────────────────────────────
  useEffect(() => {
    if (!activeId) return;

    const convChannel = supabase
      .channel(`convs:${activeId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
          filter: `tenant_id=eq.${activeId}`,
        },
        () => {
          qc.invalidateQueries({ queryKey: ["conversations", activeId] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(convChannel);
    };
  }, [activeId, qc]);

  useEffect(() => {
    if (!activeConvId) return;

    const msgChannel = supabase
      .channel(`msgs:${activeConvId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversation_messages",
          filter: `conversation_id=eq.${activeConvId}`,
        },
        () => {
          qc.invalidateQueries({ queryKey: ["messages", activeConvId] });
          resetUnread(activeConvId);
        },
      )
      .subscribe();

    const noteChannel = supabase
      .channel(`notes:${activeConvId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversation_internal_notes",
          filter: `conversation_id=eq.${activeConvId}`,
        },
        () => {
          qc.invalidateQueries({ queryKey: ["conv-notes", activeConvId] });
        },
      )
      .subscribe();

    const activityChannel = supabase
      .channel(`activities:${activeConvId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversation_activities",
          filter: `conversation_id=eq.${activeConvId}`,
        },
        () => {
          qc.invalidateQueries({ queryKey: ["conv-activities", activeConvId] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(msgChannel);
      supabase.removeChannel(noteChannel);
      supabase.removeChannel(activityChannel);
    };
  }, [activeConvId, qc, resetUnread]);

  // ── Mutations ─────────────────────────────────────────────────────────────

  // Send reply (unchanged from original)
  const sendMutation = useMutation({
    mutationFn: async (opts: {
      messageId: string;
      messageType: "text" | "image" | "document" | "audio" | "video" | "template";
      messageText?: string | null;
      mediaUrl?: string | null;
      templateName?: string | null;
      templateVariables?: Record<string, string> | null;
    }) => {
      if (!activeId || !activeConvId) return;
      const currentConv = conversations.find((c) => c.id === activeConvId);
      if (!currentConv) throw new Error("Active conversation not found.");
      const res = await sendReplyFn({
        data: {
          messageId: opts.messageId,
          tenantId: activeId,
          conversationId: activeConvId,
          contactId: currentConv.contact_id,
          phoneNumber: currentConv.phone_number,
          messageType: opts.messageType,
          messageText: opts.messageText,
          mediaUrl: opts.mediaUrl,
          templateName: opts.templateName,
          templateVariables: opts.templateVariables,
        },
      });
      if (!res.ok) throw new Error(res.error || "Failed to send reply");
      return res;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["messages", activeConvId] });
      qc.invalidateQueries({ queryKey: ["conversations", activeId] });
      qc.invalidateQueries({ queryKey: ["last-inbound", activeConvId] });
    },
    onError: (err: any) => {
      toast.error("Failed to send message: " + err.message);
      qc.invalidateQueries({ queryKey: ["messages", activeConvId] });
    },
  });

  // Retry (unchanged)
  const retryMutation = useMutation({
    mutationFn: async (messageId: string) => {
      if (!activeId) return;
      const res = await retryReplyFn({ data: { tenantId: activeId, messageId } });
      if (!res.ok) throw new Error(res.error || "Failed to retry message");
      return res;
    },
    onSuccess: () => {
      toast.success("Retry initiated.");
      qc.invalidateQueries({ queryKey: ["messages", activeConvId] });
    },
    onError: (err: any) => toast.error("Retry failed: " + err.message),
  });

  // Create contact (unchanged)
  const createContactMutation = useMutation({
    mutationFn: async (conv: Conversation) => {
      if (!activeId) return;
      const phone = conv.phone_number ?? "";
      const { data: contact, error } = await supabase
        .from("contacts")
        .insert({
          tenant_id: activeId,
          name: phone,
          phone_number_raw: phone,
          phone_number_normalized: phone,
          opt_in_source: "manual",
          opt_in_date: new Date().toISOString(),
        })
        .select("id")
        .single();
      if (error) throw error;
      await supabase.from("conversations").update({ contact_id: contact.id }).eq("id", conv.id);
      return contact;
    },
    onSuccess: () => {
      toast.success("Contact created and linked.");
      qc.invalidateQueries({ queryKey: ["conversations", activeId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Add internal note
  const addNoteMutation = useMutation({
    mutationFn: async () => {
      if (!activeId || !activeConvId || !noteText.trim()) return;
      const mentionedIds = extractMentions(noteText, workspaceMembers);
      const result = await addInternalNote({
        conversationId: activeConvId,
        tenantId: activeId,
        authorId: currentUserId,
        body: noteText.trim(),
        mentionedUserIds: mentionedIds,
      });
      if (!result.ok) throw new Error(result.error);
      if (mentionedIds.length > 0) {
        toast.info(`Notified ${mentionedIds.length} team member(s)`);
      }
    },
    onSuccess: () => {
      setNoteText("");
      qc.invalidateQueries({ queryKey: ["conv-notes", activeConvId] });
      qc.invalidateQueries({ queryKey: ["conv-activities", activeConvId] });
    },
    onError: (e: Error) => toast.error("Note failed: " + e.message),
  });

  // Edit note
  const editNoteMutation = useMutation({
    mutationFn: async ({ noteId, body }: { noteId: string; body: string }) => {
      const { error } = await supabase
        .from("conversation_internal_notes")
        .update({ body: body.trim() })
        .eq("id", noteId);
      if (error) throw error;
    },
    onSuccess: () => {
      setEditingNoteId(null);
      setEditNoteText("");
      qc.invalidateQueries({ queryKey: ["conv-notes", activeConvId] });
    },
    onError: (e: Error) => toast.error("Edit failed: " + e.message),
  });

  // Delete note
  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      const { error } = await supabase
        .from("conversation_internal_notes")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", noteId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Note deleted.");
      qc.invalidateQueries({ queryKey: ["conv-notes", activeConvId] });
    },
    onError: (e: Error) => toast.error("Delete failed: " + e.message),
  });

  // Set priority
  const setPriorityMutation = useMutation({
    mutationFn: async ({ convId, priority }: { convId: string; priority: string }) => {
      if (!activeId) return;
      const prev = activeConv?.priority ?? "medium";
      const result = await changeConversationPriority(
        convId,
        activeId,
        priority,
        currentUserId,
        prev,
      );
      if (!result.ok) throw new Error(result.error);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["conversations", activeId] });
      qc.invalidateQueries({ queryKey: ["conv-activities", activeConvId] });
    },
    onError: (e: Error) => toast.error("Priority update failed: " + e.message),
  });

  // Change status (via service — logs activity)
  async function handleSetStatus(convId: string, status: string) {
    if (!activeId || !activeConv) return;
    const result = await changeConversationStatus(
      convId,
      activeId,
      status,
      currentUserId,
      activeConv.status,
    );
    if (!result.ok) return toast.error(result.error ?? "Failed");
    qc.invalidateQueries({ queryKey: ["conversations", activeId] });
    qc.invalidateQueries({ queryKey: ["conv-activities", activeConvId] });
  }

  const handleRetry = (messageId: string) => retryMutation.mutate(messageId);

  const handleSendFreeform = () => {
    if (!messageText.trim() && !attachedFile) return;
    const messageId = crypto.randomUUID();
    if (attachedFile) {
      sendMutation.mutate({
        messageId,
        messageType: attachedFile.type,
        mediaUrl: attachedFile.url,
        messageText: attachedFile.type === "document" ? attachedFile.name : messageText || null,
      });
      setAttachedFile(null);
    } else {
      sendMutation.mutate({ messageId, messageType: "text", messageText });
    }
    setMessageText("");
  };

  const validateFile = (file: File) => {
    let type: "image" | "document" | "audio" | "video" = "document";
    if (file.type.startsWith("image/")) type = "image";
    else if (file.type.startsWith("audio/")) type = "audio";
    else if (file.type.startsWith("video/")) type = "video";
    const size = file.size;
    if (type === "image" && size > 5 * 1024 * 1024)
      return { ok: false, error: "Image size exceeds 5MB limit." };
    if (type === "document" && size > 100 * 1024 * 1024)
      return { ok: false, error: "Document size exceeds 100MB limit." };
    if ((type === "audio" || type === "video") && size > 16 * 1024 * 1024)
      return { ok: false, error: `${type} size exceeds 16MB limit.` };
    return { ok: true, type };
  };

  const handleManualRefresh = useCallback(() => {
    qc.invalidateQueries({ queryKey: ["conversations", activeId] });
    if (activeConvId) {
      qc.invalidateQueries({ queryKey: ["messages", activeConvId] });
      qc.invalidateQueries({ queryKey: ["conv-notes", activeConvId] });
      qc.invalidateQueries({ queryKey: ["conv-activities", activeConvId] });
    }
    toast.success("Inbox refreshed.");
  }, [activeId, activeConvId, qc]);

  // ── Note @mention picker ──────────────────────────────────────────────────
  function handleNoteTextChange(text: string) {
    setNoteText(text);
    const lastAtIdx = text.lastIndexOf("@");
    if (lastAtIdx !== -1 && (lastAtIdx === 0 || text[lastAtIdx - 1] === " ")) {
      const afterAt = text.slice(lastAtIdx + 1);
      if (!afterAt.includes(" ") && afterAt.length <= 20) {
        setMentionSearch(afterAt.toLowerCase());
        setShowMentionPicker(true);
        return;
      }
    }
    setShowMentionPicker(false);
    setMentionSearch("");
  }

  function insertMention(member: WorkspaceMember) {
    const name = member.profile?.full_name || member.profile?.email || "User";
    const lastAtIdx = noteText.lastIndexOf("@");
    const newText = noteText.slice(0, lastAtIdx) + `@${name} `;
    setNoteText(newText);
    setShowMentionPicker(false);
    setMentionSearch("");
    noteTextareaRef.current?.focus();
  }

  const mentionCandidates = workspaceMembers
    .filter((m) => {
      if (!mentionSearch) return true;
      const name = (m.profile?.full_name ?? m.profile?.email ?? "").toLowerCase();
      return name.includes(mentionSearch);
    })
    .slice(0, 5);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex h-[calc(100vh-4rem)] -mx-4 -mb-4 overflow-hidden bg-background">
      {/* ── LEFT SIDEBAR ────────────────────────────────────────────────── */}
      <div className="w-80 xl:w-96 flex-shrink-0 border-r border-border flex flex-col bg-card">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-base font-semibold">Conversations</h1>
            <Button variant="ghost" size="icon" className="size-7" onClick={handleManualRefresh}>
              <RefreshCw className="size-3.5" />
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search conversations"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
          </div>
        </div>

        {/* Assign & Replied filter tabs */}
        <div className="flex border-b border-border px-1 bg-muted/30 overflow-x-auto">
          {(["all", "mine", "unassigned", "replied"] as ConvAssignFilter[]).map((f) => {
            const labels: Record<ConvAssignFilter, string> = {
              all: "All",
              mine: "Mine",
              unassigned: "Unassigned",
              replied: "Replies",
            };
            return (
              <button
                key={f}
                onClick={() => setAssignFilter(f)}
                className={cn(
                  "flex-1 py-2 px-1.5 text-xs font-medium capitalize transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap",
                  assignFilter === f
                    ? f === "replied"
                      ? "border-b-2 border-emerald-600 text-emerald-600 dark:text-emerald-400 font-semibold"
                      : "border-b-2 border-primary text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span>{labels[f]}</span>
                {f === "replied" && (
                  <span
                    className={cn(
                      "px-1.5 py-0.2 rounded-full text-[10px] font-bold",
                      assignFilter === "replied"
                        ? "bg-emerald-600 text-white"
                        : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
                    )}
                  >
                    {repliedCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Status + Priority filters */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
          {/* Status tabs */}
          <div className="flex flex-1 gap-0.5 flex-wrap">
            {(["all", "open", "pending", "resolved", "closed"] as ConvStatusFilter[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "px-2 py-0.5 text-[10px] font-medium capitalize rounded-full transition-colors",
                  statusFilter === s
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent",
                )}
              >
                {s}
              </button>
            ))}
          </div>
          {/* Priority filter */}
          <Select
            value={priorityFilter}
            onValueChange={(v) => setPriorityFilter(v as ConvPriorityFilter)}
          >
            <SelectTrigger className="h-6 text-[10px] w-[80px] px-2">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {convsLoading ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              Loading conversations…
            </div>
          ) : sortedConvs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 p-8 text-center">
              <div className="size-12 rounded-full bg-muted flex items-center justify-center">
                <Inbox className="size-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                {search
                  ? "No matching conversations"
                  : assignFilter === "replied"
                    ? "No numbers have replied to campaigns yet."
                    : assignFilter === "mine"
                      ? "No conversations assigned to you"
                      : assignFilter === "unassigned"
                        ? "No unassigned conversations"
                        : "Waiting for WhatsApp conversations."}
              </p>
            </div>
          ) : (
            sortedConvs.map((conv) => (
              <ConversationItem
                key={conv.id}
                conv={conv}
                isActive={conv.id === activeConvId}
                hasReplied={!!(inboundReplyMap.get(conv.id) || conv.last_inbound_at)}
                contactsByPhoneMap={contactsByPhoneMap}
                onClick={() => setActiveConvId(conv.id)}
                members={workspaceMembers}
              />
            ))
          )}
        </div>

        {/* Count */}
        {sortedConvs.length > 0 && (
          <div className="px-4 py-2 border-t border-border text-[10px] text-muted-foreground">
            {sortedConvs.length} conversation{sortedConvs.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* ── RIGHT PANEL ─────────────────────────────────────────────────── */}
      {!activeConv ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-8">
          <div className="size-16 rounded-2xl bg-muted flex items-center justify-center">
            <MessageSquare className="size-7 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-sm font-medium">Select a conversation to view messages.</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {conversations.length === 0
                ? "Conversations will appear when WhatsApp messages are received."
                : "Choose a conversation from the list on the left."}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-w-0">
          {/* ── Chat header ──────────────────────────────────────────────── */}
          <div className="flex items-start justify-between px-4 py-3 border-b border-border bg-card flex-shrink-0 gap-2">
            <div className="flex items-start gap-3 min-w-0">
              <div className="size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold flex-shrink-0">
                {getContactDisplay(activeConv, contactsByPhoneMap).slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h2 className="text-sm font-semibold">{getContactDisplay(activeConv, contactsByPhoneMap)}</h2>
                  <StatusBadge status={activeConv.status} />
                  <PriorityBadge priority={activeConv.priority} />
                </div>
                <p className="text-xs text-muted-foreground">
                  {activeConv.phone_number && activeConv.contact?.name
                    ? activeConv.phone_number
                    : (activeConv.phone_number ?? "")}
                </p>
                {/* Assignee + SLA */}
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  {activeConv.assigned_to ? (
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <User className="size-3" />
                      <span>
                        Assigned to{" "}
                        <span className="font-medium text-foreground">
                          {getUserDisplayName(activeConv.assigned_to, workspaceMembers)}
                        </span>
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Users className="size-3" />
                      <span>Unassigned</span>
                    </div>
                  )}
                  <SLATimer conv={activeConv} />
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
              {/* Create contact */}
              {!activeConv.contact_id && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1.5"
                  onClick={() => createContactMutation.mutate(activeConv)}
                  disabled={createContactMutation.isPending}
                >
                  <UserPlus className="size-3" /> Create Contact
                </Button>
              )}

              {/* Assign button (manager+) */}
              {canAssign && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1"
                  onClick={() => setShowAssignModal(true)}
                >
                  <User className="size-3" />
                  {activeConv.assigned_to ? "Reassign" : "Assign"}
                </Button>
              )}

              {/* Priority selector */}
              {canAssign && (
                <Select
                  value={activeConv.priority}
                  onValueChange={(v) =>
                    setPriorityMutation.mutate({ convId: activeConv.id, priority: v })
                  }
                >
                  <SelectTrigger className="h-7 text-xs w-[90px]">
                    <Flag className="size-3 mr-1" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Status dropdown */}
              <div className="relative group">
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                  <StatusBadge status={activeConv.status} />
                  <ChevronDown className="size-3" />
                </Button>
                <div className="absolute right-0 top-full mt-1 z-50 hidden group-hover:flex group-focus-within:flex flex-col bg-popover border border-border rounded-lg shadow-lg overflow-hidden min-w-[120px]">
                  {["open", "pending", "resolved", "closed"].map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSetStatus(activeConv.id, s)}
                      className={cn(
                        "px-4 py-2 text-xs text-left capitalize hover:bg-accent transition-colors",
                        activeConv.status === s && "font-semibold text-primary",
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Unified Timeline ──────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto p-4 bg-background/50">
            {/* Load more */}
            {messages.length === msgPage * MSG_PAGE_SIZE && (
              <div className="flex justify-center mb-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7 gap-1"
                  onClick={() => setMsgPage((p) => p + 1)}
                >
                  <ChevronDown className="size-3 rotate-180" /> Load earlier
                </Button>
              </div>
            )}

            {msgsLoading && timeline.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            ) : timeline.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                <MessageSquare className="size-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  No messages in this conversation yet.
                </p>
              </div>
            ) : (
              groupTimeline(timeline).map((group) => (
                <div key={group.label}>
                  <DateSeparator label={group.label} />
                  {group.items.map((item) => {
                    if (item.kind === "message") {
                      return (
                        <MessageBubble key={item.data.id} msg={item.data} onRetry={handleRetry} />
                      );
                    }
                    if (item.kind === "note") {
                      const note = item.data;
                      if (editingNoteId === note.id) {
                        return (
                          <div key={note.id} className="flex justify-center py-1">
                            <div className="max-w-[80%] w-full space-y-2">
                              <Textarea
                                value={editNoteText}
                                onChange={(e) => setEditNoteText(e.target.value)}
                                className="text-sm bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700 min-h-[60px]"
                                autoFocus
                              />
                              <div className="flex gap-2 justify-end">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 text-xs"
                                  onClick={() => {
                                    setEditingNoteId(null);
                                    setEditNoteText("");
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  size="sm"
                                  className="h-7 text-xs"
                                  disabled={editNoteMutation.isPending || !editNoteText.trim()}
                                  onClick={() =>
                                    editNoteMutation.mutate({ noteId: note.id, body: editNoteText })
                                  }
                                >
                                  {editNoteMutation.isPending ? (
                                    <Loader2 className="size-3 animate-spin" />
                                  ) : (
                                    "Save"
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return (
                        <NoteCard
                          key={note.id}
                          note={note}
                          currentUserId={currentUserId}
                          canDelete={canDeleteNotes}
                          onEdit={(n) => {
                            setEditingNoteId(n.id);
                            setEditNoteText(n.body);
                          }}
                          onDelete={(id) => deleteNoteMutation.mutate(id)}
                        />
                      );
                    }
                    if (item.kind === "activity") {
                      return (
                        <ActivityEventPill
                          key={item.data.id}
                          activity={item.data}
                          members={workspaceMembers}
                        />
                      );
                    }
                    return null;
                  })}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* ── Composer ──────────────────────────────────────────────────── */}
          <div className="border-t border-border bg-card flex-shrink-0">
            {/* Permission banner */}
            {!canReply && composerTab === "message" && (
              <div className="flex items-center gap-2 px-4 py-2 bg-muted/60 text-muted-foreground text-xs">
                <Lock className="size-3.5 flex-shrink-0" />
                <span>
                  {activeConv.assigned_to
                    ? "This conversation is assigned to another team member."
                    : "This conversation is unassigned. A manager can assign it to you."}
                </span>
              </div>
            )}

            {/* 24h window warning */}
            {composerTab === "message" && !isWindowOpen && canReply && (
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-600 text-xs">
                <AlertCircle className="size-3.5 flex-shrink-0" />
                <span>Customer service window expired. Send an approved template.</span>
              </div>
            )}

            {/* Composer tabs */}
            <div className="flex border-b border-border px-3">
              {(["message", "note"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setComposerTab(tab)}
                  className={cn(
                    "py-2 px-3 text-xs font-medium flex items-center gap-1.5 transition-colors",
                    composerTab === tab
                      ? "border-b-2 border-primary text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {tab === "message" ? (
                    <MessageSquare className="size-3" />
                  ) : (
                    <StickyNote className="size-3" />
                  )}
                  {tab === "message" ? "Message" : "Note"}
                </button>
              ))}
            </div>

            <div className="p-3">
              {composerTab === "note" ? (
                /* ─── Note Composer ─── */
                <div className="space-y-2">
                  <div className="relative">
                    <Textarea
                      ref={noteTextareaRef}
                      placeholder="Write an internal note… Type @ to mention a teammate"
                      value={noteText}
                      onChange={(e) => handleNoteTextChange(e.target.value)}
                      className="min-h-[72px] text-sm resize-none bg-amber-50/50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-800/50 focus-visible:ring-amber-400/30"
                      disabled={addNoteMutation.isPending}
                    />
                    {/* Mention picker */}
                    {showMentionPicker && mentionCandidates.length > 0 && (
                      <div className="absolute bottom-full left-0 mb-1 bg-popover border border-border rounded-lg shadow-lg overflow-hidden w-52 z-50">
                        {mentionCandidates.map((m) => (
                          <button
                            key={m.user_id}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              insertMention(m);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-accent text-left"
                          >
                            <AtSign className="size-3 text-muted-foreground" />
                            <span className="font-medium">
                              {m.profile?.full_name || m.profile?.email}
                            </span>
                            <span className="text-muted-foreground capitalize">{m.role}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-amber-600/70 dark:text-amber-400/70 flex items-center gap-1">
                      <Lock className="size-3" /> Only visible to team members
                    </span>
                    <Button
                      size="sm"
                      className="h-7 text-xs gap-1 bg-amber-500 hover:bg-amber-600 text-white"
                      disabled={addNoteMutation.isPending || !noteText.trim()}
                      onClick={() => addNoteMutation.mutate()}
                    >
                      {addNoteMutation.isPending ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        <StickyNote className="size-3" />
                      )}
                      Add Note
                    </Button>
                  </div>
                </div>
              ) : canReply ? (
                /* ─── Message Composer (existing, unchanged logic) ─── */
                showTemplatePicker ? (
                  <div className="space-y-3 bg-background border border-border rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">Select and Send Template</span>
                      {isWindowOpen && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs text-muted-foreground hover:text-foreground"
                          onClick={() => setShowTemplatePicker(false)}
                        >
                          Use Freeform Text
                        </Button>
                      )}
                    </div>

                    <Select
                      value={selectedTemplateId}
                      onValueChange={(val) => {
                        setSelectedTemplateId(val);
                        setTemplateVars({});
                        setTemplateMediaUrl("");
                      }}
                    >
                      <SelectTrigger className="w-full text-xs h-9">
                        <SelectValue placeholder="Select an approved template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.template_name} ({t.language})
                          </SelectItem>
                        ))}
                        {templates.length === 0 && (
                          <div className="p-4 text-xs text-center text-muted-foreground">
                            No approved templates found.
                          </div>
                        )}
                      </SelectContent>
                    </Select>

                    {selectedTemplate && (
                      <div className="space-y-3 border-t border-border/50 pt-2">
                        <div className="text-[11px] text-muted-foreground p-2.5 bg-muted/50 rounded-lg whitespace-pre-wrap border border-border/30">
                          <div className="font-semibold text-[10px] uppercase tracking-wider mb-1 text-muted-foreground/80">
                            Template Body Preview:
                          </div>
                          {selectedTemplate.body}
                        </div>

                        {selectedTemplate.header_type === "IMAGE" && (
                          <div className="space-y-1.5 border border-border/50 rounded-lg p-2.5 bg-muted/20">
                            <Label className="text-[11px] font-semibold">
                              Header Image (Required)
                            </Label>
                            <p className="text-[10px] text-muted-foreground">
                              JPEG or PNG only, max 5MB.
                            </p>
                            {templateMediaUrl ? (
                              <div className="space-y-1.5">
                                <img
                                  src={templateMediaUrl}
                                  alt="Header Preview"
                                  className="max-h-20 rounded border object-contain bg-background"
                                  loading="lazy"
                                />
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-destructive border-destructive h-6 text-xs px-2"
                                  onClick={() => setTemplateMediaUrl("")}
                                >
                                  Remove Image
                                </Button>
                              </div>
                            ) : (
                              <div className="flex flex-col gap-1.5">
                                <Input
                                  type="file"
                                  accept=".jpg,.jpeg,.png"
                                  disabled={uploadingTemplateMedia}
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    if (file.size > 5 * 1024 * 1024) {
                                      toast.error("File exceeds maximum size of 5MB");
                                      return;
                                    }
                                    setUploadingTemplateMedia(true);
                                    try {
                                      const fileName = `${Date.now()}.${file.name.split(".").pop()?.toLowerCase()}`;
                                      const filePath = `${activeId}/chat-attachments/${fileName}`;
                                      const { error: uploadError } = await supabase.storage
                                        .from("campaign-media")
                                        .upload(filePath, file);
                                      if (uploadError) throw uploadError;
                                      const {
                                        data: { publicUrl },
                                      } = supabase.storage
                                        .from("campaign-media")
                                        .getPublicUrl(filePath);
                                      setTemplateMediaUrl(publicUrl);
                                      toast.success("Header image uploaded");
                                    } catch (err) {
                                      toast.error("Upload failed: " + (err as Error).message);
                                    } finally {
                                      setUploadingTemplateMedia(false);
                                    }
                                  }}
                                  className="text-xs h-8"
                                />
                                {uploadingTemplateMedia && (
                                  <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <Loader2 className="size-3 animate-spin" /> Uploading image...
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {selectedTemplate.variables &&
                          (selectedTemplate.variables as string[]).length > 0 && (
                            <div className="space-y-1.5">
                              <Label className="text-[11px] font-semibold">
                                Template Variables
                              </Label>
                              <div className="space-y-1.5">
                                {(selectedTemplate.variables as string[]).map((v) => (
                                  <div key={v} className="flex items-center gap-2">
                                    <span className="font-mono text-[10px] px-1.5 py-0.5 bg-muted rounded border border-border/40">{`{{${v}}}`}</span>
                                    <Input
                                      placeholder={`Value for {{${v}}}`}
                                      value={templateVars[v] ?? ""}
                                      onChange={(e) =>
                                        setTemplateVars({ ...templateVars, [v]: e.target.value })
                                      }
                                      className="h-8 text-xs flex-1"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        <div className="flex justify-end gap-2 pt-1">
                          <Button
                            size="sm"
                            disabled={
                              sendMutation.isPending ||
                              uploadingTemplateMedia ||
                              (selectedTemplate.header_type === "IMAGE" && !templateMediaUrl)
                            }
                            onClick={async () => {
                              const vars = (selectedTemplate.variables as string[]) || [];
                              const missing = vars.filter((v) => !(templateVars[v] ?? "").trim());
                              if (missing.length > 0) {
                                toast.error(
                                  `Please fill in: ${missing.map((v) => `{{${v}}}`).join(", ")}`,
                                );
                                return;
                              }
                              sendMutation.mutate({
                                messageId: crypto.randomUUID(),
                                messageType: "template",
                                templateName: selectedTemplate.template_name,
                                templateVariables: templateVars,
                                mediaUrl: templateMediaUrl || null,
                              });
                              setSelectedTemplateId("");
                              setTemplateVars({});
                              setTemplateMediaUrl("");
                            }}
                            className="text-xs h-8 gap-1"
                          >
                            {sendMutation.isPending ? (
                              <Loader2 className="size-3 animate-spin" />
                            ) : (
                              <SendHorizonal className="size-3" />
                            )}
                            Send Template
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {attachedFile && (
                      <div className="flex items-center justify-between px-3 py-1.5 bg-muted rounded-lg text-xs border border-border/30">
                        <div className="flex items-center gap-1.5 truncate text-muted-foreground">
                          {attachedFile.type === "image" ? (
                            <ImageIcon className="size-3.5" />
                          ) : (
                            <FileText className="size-3.5" />
                          )}
                          <span className="truncate font-medium text-foreground">
                            {attachedFile.name}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAttachedFile(null)}
                          className="text-muted-foreground hover:text-destructive p-0.5 rounded transition-colors"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    )}

                    <div className="flex items-center gap-1 px-2 py-1.5 rounded-xl border border-border bg-background">
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const check = validateFile(file);
                          if (!check.ok) {
                            toast.error(check.error);
                            return;
                          }
                          setUploadingAttachment(true);
                          try {
                            const fileName = `${Date.now()}.${file.name.split(".").pop()?.toLowerCase()}`;
                            const filePath = `${activeId}/chat-attachments/${fileName}`;
                            const { error: uploadError } = await supabase.storage
                              .from("campaign-media")
                              .upload(filePath, file);
                            if (uploadError) throw uploadError;
                            const {
                              data: { publicUrl },
                            } = supabase.storage.from("campaign-media").getPublicUrl(filePath);
                            setAttachedFile({ url: publicUrl, name: file.name, type: check.type! });
                            toast.success("File attached.");
                          } catch (err) {
                            toast.error("Upload failed: " + (err as Error).message);
                          } finally {
                            setUploadingAttachment(false);
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingAttachment || sendMutation.isPending}
                        title="Attach file"
                      >
                        {uploadingAttachment ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Paperclip className="size-4" />
                        )}
                      </button>

                      <div className="relative">
                        <button
                          type="button"
                          className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          disabled={sendMutation.isPending}
                          title="Add emoji"
                        >
                          <Smile className="size-4" />
                        </button>
                        {showEmojiPicker && (
                          <div className="absolute bottom-full left-0 mb-2 p-1.5 bg-popover border border-border rounded-lg shadow-lg grid grid-cols-6 gap-1 z-50 w-44">
                            {[
                              "😀",
                              "😂",
                              "😍",
                              "👍",
                              "🙏",
                              "❤️",
                              "🎉",
                              "🔥",
                              "👏",
                              "🚀",
                              "💡",
                              "⚠️",
                            ].map((emoji) => (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => {
                                  setMessageText((prev) => prev + emoji);
                                  setShowEmojiPicker(false);
                                }}
                                className="hover:bg-accent p-1 text-sm rounded text-center transition-colors"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <Input
                        placeholder="Type a message..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        disabled={sendMutation.isPending || uploadingAttachment}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendFreeform();
                          }
                        }}
                        className="flex-1 border-0 shadow-none focus-visible:ring-0 text-sm h-8 bg-transparent text-foreground"
                      />

                      {templates.length > 0 && (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowTemplatePicker(true)}
                        >
                          Template
                        </Button>
                      )}

                      <button
                        disabled={
                          sendMutation.isPending ||
                          uploadingAttachment ||
                          (!messageText.trim() && !attachedFile)
                        }
                        onClick={handleSendFreeform}
                        className={cn(
                          "p-1.5 transition-colors",
                          (messageText.trim() || attachedFile) &&
                            !sendMutation.isPending &&
                            !uploadingAttachment
                            ? "text-primary hover:text-primary/80 cursor-pointer"
                            : "text-muted-foreground cursor-not-allowed",
                        )}
                        title="Send message"
                      >
                        {sendMutation.isPending ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <SendHorizonal className="size-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* ── Assign Modal ────────────────────────────────────────────────── */}
      {showAssignModal && activeConv && (
        <AssignModal
          conv={activeConv}
          members={workspaceMembers}
          currentUserId={currentUserId}
          tenantId={activeId!}
          onClose={() => setShowAssignModal(false)}
          onAssigned={() => {
            qc.invalidateQueries({ queryKey: ["conversations", activeId] });
            qc.invalidateQueries({ queryKey: ["conv-activities", activeConvId] });
          }}
        />
      )}
    </div>
  );
}
