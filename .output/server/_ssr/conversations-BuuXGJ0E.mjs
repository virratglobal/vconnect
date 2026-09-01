import { o as __toESM } from "../_runtime.mjs";
import { y as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { l as createServerFn } from "./esm-9EjmF9OT.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-wPl4xYQJ.mjs";
import { t as useServerFn } from "./useServerFn-BqzygRuj.mjs";
import { t as supabase } from "./client-Cx80Vihe.mjs";
import { n as useAuth } from "./use-auth-xGd_AUkc.mjs";
import { t as createSsrRpc } from "./createSsrRpc-TuEXL4wz.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { t as Button } from "./button-OuFjfcpS.mjs";
import { t as Input } from "./input-CITjGSX3.mjs";
import { t as Label } from "./label-BPuF5-mq.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { D as RefreshCw, E as RotateCcw, Et as AtSign, G as Lock, I as Paperclip, It as LoaderCircle, Pt as SendHorizontal, R as MessageSquare, Ut as CircleAlert, X as Inbox, Z as Image, _t as ChevronDown, c as UserX, dt as Clock, g as StickyNote, jt as Activity, kt as ArrowRightLeft, l as UserPlus, n as X, nt as FileText, o as Users, s as User, tt as Flag, v as Smile, vt as Check, w as Search } from "../_libs/lucide-react.mjs";
import { n as useActiveTenant, t as canManage } from "./use-tenant-B3bhUKig.mjs";
import { t as Textarea } from "./textarea-1llmCJsE.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-BHv1JhlL.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/conversations-BuuXGJ0E.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var sendConversationReply = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => d).handler(createSsrRpc("3c995c0aaf452a864821d3ab8ca7f4ec233508b65892e914fd4867f2c2debcf9"));
var retryConversationReply = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => d).handler(createSsrRpc("86aa98318deb44875ce145d4d9b7a51eef982d7d1d1f678ead22e0473396b162"));
var getConversationsList = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => d).handler(createSsrRpc("e1894197d9fbb6266e4cfa5b66eb442bf823a9ac3708d55d37ae05445c0b22fb"));
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
async function assignConversation(opts) {
	const { conversationId, tenantId, assignedTo, assignedBy, previousAssignee, action, reason } = opts;
	const { error: convError } = await supabase.from("conversations").update({
		assigned_to: assignedTo,
		assigned_by: assignedBy,
		assigned_at: (/* @__PURE__ */ new Date()).toISOString(),
		...action === "assigned" || action === "transferred" ? {} : {}
	}).eq("id", conversationId);
	if (convError) return {
		ok: false,
		error: convError.message
	};
	const { error: logError } = await supabase.from("conversation_assignment_logs").insert({
		tenant_id: tenantId,
		conversation_id: conversationId,
		action,
		assigned_to: assignedTo,
		assigned_by: assignedBy,
		previous_assignee: previousAssignee ?? null,
		reason: reason ?? null
	});
	if (logError) console.warn("[AssignmentService] Log insert failed:", logError.message);
	const { error: actError } = await supabase.from("conversation_activities").insert({
		tenant_id: tenantId,
		conversation_id: conversationId,
		actor_id: assignedBy,
		activity_type: action,
		metadata: {
			assigned_to: assignedTo,
			previous_assignee: previousAssignee ?? null,
			reason: reason ?? null
		}
	});
	if (actError) console.warn("[AssignmentService] Activity insert failed:", actError.message);
	return { ok: true };
}
async function changeConversationStatus(conversationId, tenantId, newStatus, actorId, previousStatus) {
	const { error } = await supabase.from("conversations").update({
		status: newStatus,
		...newStatus === "resolved" ? { resolved_at: (/* @__PURE__ */ new Date()).toISOString() } : {},
		...newStatus === "open" ? { resolved_at: null } : {}
	}).eq("id", conversationId);
	if (error) return {
		ok: false,
		error: error.message
	};
	await supabase.from("conversation_activities").insert({
		tenant_id: tenantId,
		conversation_id: conversationId,
		actor_id: actorId,
		activity_type: newStatus === "resolved" ? "resolved" : newStatus === "closed" ? "closed" : "status_changed",
		metadata: {
			previous_status: previousStatus,
			new_status: newStatus
		}
	});
	return { ok: true };
}
async function changeConversationPriority(conversationId, tenantId, newPriority, actorId, previousPriority) {
	const { error } = await supabase.from("conversations").update({ priority: newPriority }).eq("id", conversationId);
	if (error) return {
		ok: false,
		error: error.message
	};
	await supabase.from("conversation_activities").insert({
		tenant_id: tenantId,
		conversation_id: conversationId,
		actor_id: actorId,
		activity_type: "priority_changed",
		metadata: {
			previous_priority: previousPriority,
			new_priority: newPriority
		}
	});
	return { ok: true };
}
async function addInternalNote(opts) {
	const { conversationId, tenantId, authorId, body, mentionedUserIds } = opts;
	const { data: note, error } = await supabase.from("conversation_internal_notes").insert({
		tenant_id: tenantId,
		conversation_id: conversationId,
		author_id: authorId,
		body,
		mentions: mentionedUserIds
	}).select("id").single();
	if (error) return {
		ok: false,
		error: error.message
	};
	await supabase.from("conversation_activities").insert({
		tenant_id: tenantId,
		conversation_id: conversationId,
		actor_id: authorId,
		activity_type: "note_added",
		metadata: {
			note_id: note.id,
			mentions: mentionedUserIds
		}
	});
	return {
		ok: true,
		noteId: note.id
	};
}
/** Extract @mention names from note body and resolve to user_ids */
function extractMentions(body, members) {
	const mentionRegex = /@([\w.\s]+?)(?=\s|$|[@,.])/g;
	const mentioned = [];
	let match;
	while ((match = mentionRegex.exec(body)) !== null) {
		const name = match[1].trim().toLowerCase();
		const member = members.find((m) => {
			const fullName = (m.profile?.full_name ?? "").toLowerCase();
			const email = (m.profile?.email ?? "").toLowerCase();
			return fullName.startsWith(name) || email.startsWith(name);
		});
		if (member && !mentioned.includes(member.user_id)) mentioned.push(member.user_id);
	}
	return mentioned;
}
/** Determine the correct AssignmentAction based on previous and new assignee */
function resolveAction(previousAssignee, newAssignee) {
	if (!newAssignee) return "unassigned";
	if (!previousAssignee) return "assigned";
	return "reassigned";
}
/** Format duration for SLA display */
function formatDuration(ms) {
	const totalMins = Math.floor(ms / 6e4);
	if (totalMins < 60) return `${totalMins}m`;
	const hrs = Math.floor(totalMins / 60);
	const mins = totalMins % 60;
	if (hrs < 24) return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
	const days = Math.floor(hrs / 24);
	const remHrs = hrs % 24;
	return remHrs > 0 ? `${days}d ${remHrs}h` : `${days}d`;
}
var PRIORITY_CONFIG = {
	low: {
		label: "Low",
		color: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
		dotColor: "bg-slate-400"
	},
	medium: {
		label: "Medium",
		color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
		dotColor: "bg-blue-500"
	},
	high: {
		label: "High",
		color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
		dotColor: "bg-amber-500"
	},
	urgent: {
		label: "Urgent",
		color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
		dotColor: "bg-red-500"
	}
};
function timeAgo(iso) {
	if (!iso) return "";
	const diff = Date.now() - new Date(iso).getTime();
	const mins = Math.floor(diff / 6e4);
	if (mins < 1) return "just now";
	if (mins < 60) return `${mins}m`;
	const hrs = Math.floor(mins / 60);
	if (hrs < 24) return `${hrs}h`;
	const days = Math.floor(hrs / 24);
	if (days < 7) return `${days}d`;
	return new Date(iso).toLocaleDateString();
}
function formatTime(iso) {
	if (!iso) return "";
	return new Date(iso).toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit"
	});
}
function formatDate(iso) {
	if (!iso) return "";
	const d = new Date(iso);
	const today = /* @__PURE__ */ new Date();
	if (d.toDateString() === today.toDateString()) return "Today";
	const yesterday = new Date(today);
	yesterday.setDate(today.getDate() - 1);
	if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
	return d.toLocaleDateString([], {
		month: "short",
		day: "numeric"
	});
}
function getContactDisplay(conv, contactsByPhoneMap) {
	if (conv.contact?.name) return conv.contact.name;
	if (contactsByPhoneMap && conv.phone_number) {
		const norm = conv.phone_number.replace(/\D/g, "");
		if (norm && contactsByPhoneMap.has(norm)) return contactsByPhoneMap.get(norm);
	}
	return conv.phone_number || "Unknown";
}
function getMemberName(member) {
	return member?.profile?.full_name || member?.profile?.email || "Unknown";
}
function getUserDisplayName(userId, members) {
	if (!userId) return "Unassigned";
	return getMemberName(members.find((m) => m.user_id === userId));
}
function getUserInitials(name) {
	return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase() || "?";
}
function getActivityLabel(activity, members) {
	const actor = activity.actor?.full_name || activity.actor?.email || "Someone";
	const m = activity.metadata;
	switch (activity.activity_type) {
		case "created": return "Conversation started";
		case "assigned": return `${actor} assigned to ${getUserDisplayName(m.assigned_to, members)}`;
		case "reassigned": return `${actor} reassigned from ${getUserDisplayName(m.previous_assignee, members)} → ${getUserDisplayName(m.assigned_to, members)}`;
		case "transferred": return `${actor} transferred to ${getUserDisplayName(m.assigned_to, members)}`;
		case "unassigned": return `${actor} removed assignee`;
		case "status_changed": return `${actor} changed status to ${m.new_status}`;
		case "priority_changed": return `${actor} set priority to ${m.new_priority}`;
		case "note_added": return `${actor} added an internal note`;
		case "resolved": return `${actor} marked as resolved`;
		case "closed": return `${actor} closed conversation`;
		case "reopened": return `${actor} reopened conversation`;
		default: return `${actor} performed an action`;
	}
}
function MsgStatus({ status }) {
	if (!status) return null;
	switch (status) {
		case "sending": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-[10px] text-muted-foreground",
			children: "⏳ Sending"
		});
		case "sent": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-[10px] text-muted-foreground",
			children: "✓ Sent"
		});
		case "delivered": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-[10px] text-muted-foreground",
			children: "✓✓ Delivered"
		});
		case "read": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-[10px] text-blue-500 font-medium",
			children: "✓✓ Read"
		});
		case "failed": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-[10px] text-destructive",
			children: "❌ Failed"
		});
		default: return null;
	}
}
function StatusBadge({ status }) {
	const colors = {
		open: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
		pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
		resolved: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
		closed: "bg-muted text-muted-foreground"
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize", colors[status] ?? colors.open),
		children: status
	});
}
function PriorityBadge({ priority }) {
	const cfg = PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG.medium;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1", cfg.color),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("size-1.5 rounded-full inline-block", cfg.dotColor) }), cfg.label]
	});
}
function DateSeparator({ label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-3 py-2 px-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex-1 h-px bg-border" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-[11px] text-muted-foreground font-medium px-2",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex-1 h-px bg-border" })
		]
	});
}
function ActivityEventPill({ activity, members }) {
	const icon = {
		assigned: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "size-3" }),
		reassigned: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRightLeft, { className: "size-3" }),
		transferred: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRightLeft, { className: "size-3" }),
		unassigned: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserX, { className: "size-3" }),
		status_changed: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "size-3" }),
		priority_changed: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flag, { className: "size-3" }),
		note_added: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StickyNote, { className: "size-3" }),
		resolved: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3" }),
		closed: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3" }),
		created: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "size-3" }),
		reopened: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-3" })
	}[activity.activity_type] ?? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "size-3" });
	const label = getActivityLabel(activity, members);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex items-center justify-center gap-2 py-1",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-1.5 bg-muted/60 border border-border/50 text-muted-foreground rounded-full px-3 py-1 text-[11px]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-primary/70",
					children: icon
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-muted-foreground/50",
					children: "·"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[10px]",
					children: formatTime(activity.created_at)
				})
			]
		})
	});
}
function NoteCard({ note, currentUserId, canDelete, onEdit, onDelete }) {
	const authorName = note.author?.full_name || note.author?.email || "Team member";
	const isOwn = note.author_id === currentUserId;
	const renderedBody = note.body.replace(/@([\w. ]+)/g, (match) => {
		return `<span class="font-semibold text-primary">${match}</span>`;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex justify-center py-1",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "max-w-[80%] w-full",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl px-4 py-2.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between mb-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StickyNote, { className: "size-3 text-amber-600 dark:text-amber-400" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[11px] font-semibold text-amber-700 dark:text-amber-400",
								children: "Internal Note"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] text-amber-600/70 dark:text-amber-500/70",
								children: "·"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[11px] text-amber-600/80 dark:text-amber-500/80",
								children: authorName
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] text-amber-600/60",
							children: formatTime(note.created_at)
						}), (isOwn || canDelete) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [isOwn && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => onEdit(note),
							className: "text-amber-600/60 hover:text-amber-700 dark:hover:text-amber-400 p-0.5 rounded transition-colors",
							title: "Edit note",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-3" })
						}), canDelete && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => onDelete(note.id),
							className: "text-amber-600/60 hover:text-destructive p-0.5 rounded transition-colors",
							title: "Delete note",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3" })
						})] })]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-amber-900 dark:text-amber-200 whitespace-pre-wrap break-words leading-snug",
					dangerouslySetInnerHTML: { __html: renderedBody }
				})]
			})
		})
	});
}
function MessageBubble({ msg, onRetry }) {
	const isOutbound = msg.direction === "outbound";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex mb-2", isOutbound ? "justify-end" : "justify-start"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: cn("max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm", isOutbound ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-card border border-border rounded-tl-sm"),
			children: [
				msg.message_type === "image" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 mb-1 text-xs opacity-80",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, { className: "size-3" }), " Image"]
				}),
				[
					"document",
					"audio",
					"video"
				].includes(msg.message_type) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 mb-1 text-xs opacity-80",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-3" }),
						" ",
						msg.message_type.charAt(0).toUpperCase() + msg.message_type.slice(1)
					]
				}),
				msg.message_type === "template" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[10px] opacity-60 mb-1 font-medium uppercase tracking-wide",
					children: "Template"
				}),
				msg.media_url && msg.message_type === "image" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: msg.media_url,
						alt: "Attached Image",
						className: "max-h-40 rounded border object-contain bg-background",
						loading: "lazy"
					})
				}),
				msg.media_url && msg.message_type !== "image" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: msg.media_url,
						target: "_blank",
						rel: "noopener noreferrer",
						className: cn("text-xs underline flex items-center gap-1 opacity-90 hover:opacity-100", isOutbound ? "text-primary-foreground" : "text-primary"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Paperclip, { className: "size-3" }),
							" Open ",
							msg.message_type
						]
					})
				}),
				msg.message_text && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm whitespace-pre-wrap break-words leading-snug",
					children: msg.message_text
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: cn("flex items-center gap-1 mt-1", isOutbound ? "justify-end" : "justify-start"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[10px] opacity-60",
						children: formatTime(msg.created_at)
					}), isOutbound && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MsgStatus, { status: msg.meta_status }), msg.meta_status === "failed" && onRetry && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => onRetry(msg.id),
							className: cn("p-0.5 rounded transition-colors ml-1", isOutbound ? "hover:bg-primary-foreground/20 text-primary-foreground" : "hover:bg-muted text-destructive"),
							title: "Retry sending",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-3" })
						})]
					})]
				})
			]
		})
	});
}
function AssignModal({ conv, members, currentUserId, tenantId, onClose, onAssigned }) {
	const [search, setSearch] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(null);
	const [reason, setReason] = (0, import_react.useState)("");
	const filtered = members.filter((m) => {
		if (!search.trim()) return true;
		const name = (m.profile?.full_name ?? "").toLowerCase();
		const email = (m.profile?.email ?? "").toLowerCase();
		return name.includes(search.toLowerCase()) || email.includes(search.toLowerCase());
	});
	async function handleAssign(targetUserId) {
		const action = resolveAction(conv.assigned_to, targetUserId);
		setLoading(targetUserId ?? "__unassign__");
		const result = await assignConversation({
			conversationId: conv.id,
			tenantId,
			assignedTo: targetUserId,
			assignedBy: currentUserId,
			previousAssignee: conv.assigned_to,
			action,
			reason: reason.trim() || void 0
		});
		setLoading(null);
		if (!result.ok) toast.error("Assignment failed: " + result.error);
		else {
			const label = targetUserId ? `Assigned to ${getUserDisplayName(targetUserId, members)}` : "Unassigned";
			toast.success(label);
			onAssigned();
			onClose();
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm",
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "bg-card border border-border rounded-2xl shadow-2xl w-[360px] max-h-[500px] flex flex-col",
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between px-4 py-3 border-b border-border",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-sm font-semibold",
						children: "Assign Conversation"
					}), conv.assigned_to && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground mt-0.5",
						children: [
							"Currently:",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-medium",
								children: getUserDisplayName(conv.assigned_to, members)
							})
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: onClose,
						className: "p-1 rounded hover:bg-muted transition-colors",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4 text-muted-foreground" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "px-3 pt-3 pb-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							autoFocus: true,
							placeholder: "Search team members...",
							value: search,
							onChange: (e) => setSearch(e.target.value),
							className: "pl-8 h-8 text-sm"
						})]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "px-3 pb-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						placeholder: "Reason (optional)",
						value: reason,
						onChange: (e) => setReason(e.target.value),
						className: "h-7 text-xs"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1 overflow-y-auto px-2 pb-2 space-y-0.5",
					children: [
						conv.assigned_to && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => handleAssign(null),
							disabled: !!loading,
							className: "w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors text-sm",
							children: [loading === "__unassign__" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserX, { className: "size-4" }), "Unassign"]
						}),
						filtered.map((m) => {
							const name = getMemberName(m);
							const initials = getUserInitials(name);
							const isAssigned = conv.assigned_to === m.user_id;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => handleAssign(m.user_id),
								disabled: !!loading || isAssigned,
								className: cn("w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-colors text-left", isAssigned ? "bg-primary/10 cursor-default" : "hover:bg-accent"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: cn("size-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0", isAssigned ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"),
									children: loading === m.user_id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3.5 animate-spin" }) : initials
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex-1 min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-sm font-medium truncate",
											children: name
										}), isAssigned && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[10px] text-primary font-semibold",
											children: "Assigned"
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[11px] text-muted-foreground truncate capitalize",
										children: m.role
									})]
								})]
							}, m.user_id);
						}),
						filtered.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-center text-xs text-muted-foreground py-4",
							children: "No members found"
						})
					]
				})
			]
		})
	});
}
function ConversationItem({ conv, isActive, hasReplied, contactsByPhoneMap, onClick, members }) {
	const name = getContactDisplay(conv, contactsByPhoneMap);
	const initials = name.slice(0, 2).toUpperCase();
	const assigneeName = conv.assigned_to ? getUserDisplayName(conv.assigned_to, members) : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		onClick,
		style: {
			contentVisibility: "auto",
			containIntrinsicSize: "auto 80px"
		},
		className: cn("w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/60 border-b border-border/50", isActive && "bg-primary/8 border-l-2 border-l-primary"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn("size-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-semibold", isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"),
			children: initials
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex-1 min-w-0",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn("text-sm font-medium truncate", isActive && "text-primary"),
						children: name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[11px] text-muted-foreground flex-shrink-0",
						children: timeAgo(conv.last_message_at)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-1 mt-0.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground truncate",
						children: conv.last_message || "No messages yet"
					}), conv.unread_count > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "flex-shrink-0 size-4 min-w-[1rem] rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center",
						children: conv.unread_count > 9 ? "9+" : conv.unread_count
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1 mt-1 flex-wrap",
					children: [
						hasReplied && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] font-semibold text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 px-1.5 py-0.5 rounded-full",
							children: "Replied"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriorityBadge, { priority: conv.priority }),
						assigneeName && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded-full truncate max-w-[80px]",
							children: assigneeName
						})
					]
				})
			]
		})]
	});
}
function SLATimer({ conv }) {
	const [now, setNow] = (0, import_react.useState)(Date.now());
	(0, import_react.useEffect)(() => {
		const interval = setInterval(() => setNow(Date.now()), 6e4);
		return () => clearInterval(interval);
	}, []);
	if (conv.status === "closed") return null;
	if (conv.resolved_at) {
		const duration = new Date(conv.resolved_at).getTime() - new Date(conv.created_at).getTime();
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-1 text-[11px] text-purple-600 dark:text-purple-400",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Resolved in ", formatDuration(duration)] })]
		});
	}
	const elapsed = now - new Date(conv.created_at).getTime();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex items-center gap-1 text-[11px]", elapsed > 14400 * 1e3 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Open ", formatDuration(elapsed)] })]
	});
}
function ConversationsPage() {
	const { activeId, membership } = useActiveTenant();
	const { user } = useAuth();
	const qc = useQueryClient();
	const isAgent = membership?.role === "agent";
	const canAssign = canManage(membership?.role, "manager");
	const canDeleteNotes = canManage(membership?.role, "admin");
	const currentUserId = user?.id ?? "";
	const [search, setSearch] = (0, import_react.useState)("");
	const [statusFilter, setStatusFilter] = (0, import_react.useState)("all");
	const [activeConvId, setActiveConvId] = (0, import_react.useState)(null);
	const [msgPage, setMsgPage] = (0, import_react.useState)(1);
	const MSG_PAGE_SIZE = 30;
	const messagesEndRef = (0, import_react.useRef)(null);
	const prevConvIdRef = (0, import_react.useRef)(null);
	const fileInputRef = (0, import_react.useRef)(null);
	const [messageText, setMessageText] = (0, import_react.useState)("");
	const [showEmojiPicker, setShowEmojiPicker] = (0, import_react.useState)(false);
	const [selectedTemplateId, setSelectedTemplateId] = (0, import_react.useState)("");
	const [templateVars, setTemplateVars] = (0, import_react.useState)({});
	const [templateMediaUrl, setTemplateMediaUrl] = (0, import_react.useState)("");
	const [uploadingTemplateMedia, setUploadingTemplateMedia] = (0, import_react.useState)(false);
	const [showTemplatePicker, setShowTemplatePicker] = (0, import_react.useState)(false);
	const [attachedFile, setAttachedFile] = (0, import_react.useState)(null);
	const [uploadingAttachment, setUploadingAttachment] = (0, import_react.useState)(false);
	const [assignFilter, setAssignFilter] = (0, import_react.useState)("all");
	const [priorityFilter, setPriorityFilter] = (0, import_react.useState)("all");
	const [showAssignModal, setShowAssignModal] = (0, import_react.useState)(false);
	const [composerTab, setComposerTab] = (0, import_react.useState)("message");
	const [noteText, setNoteText] = (0, import_react.useState)("");
	const [mentionSearch, setMentionSearch] = (0, import_react.useState)("");
	const [showMentionPicker, setShowMentionPicker] = (0, import_react.useState)(false);
	const noteTextareaRef = (0, import_react.useRef)(null);
	const [editingNoteId, setEditingNoteId] = (0, import_react.useState)(null);
	const [editNoteText, setEditNoteText] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		setActiveConvId(null);
	}, [activeId]);
	const sendReplyFn = useServerFn(sendConversationReply);
	const retryReplyFn = useServerFn(retryConversationReply);
	const getConvsListFn = useServerFn(getConversationsList);
	const { data: lastInboundMessage } = useQuery({
		queryKey: [
			"last-inbound",
			activeConvId,
			activeId
		],
		enabled: !!activeConvId && !!activeId,
		queryFn: async () => {
			const { data, error } = await supabase.from("conversation_messages").select("created_at").eq("conversation_id", activeConvId).eq("direction", "inbound").order("created_at", { ascending: false }).limit(1).maybeSingle();
			if (error) throw error;
			return data;
		}
	});
	const lastInboundTime = lastInboundMessage?.created_at ? new Date(lastInboundMessage.created_at).getTime() : null;
	const isWindowOpen = lastInboundTime ? Date.now() - lastInboundTime < 1440 * 60 * 1e3 : false;
	(0, import_react.useEffect)(() => {
		if (activeConvId) {
			if (!isWindowOpen) setShowTemplatePicker(true);
			else setShowTemplatePicker(false);
			setMessageText("");
			setAttachedFile(null);
			setSelectedTemplateId("");
			setTemplateVars({});
			setTemplateMediaUrl("");
			setComposerTab("message");
			setNoteText("");
		}
	}, [activeConvId, isWindowOpen]);
	const { data: templates = [] } = useQuery({
		queryKey: ["templates", activeId],
		enabled: !!activeId,
		queryFn: async () => {
			const { data, error } = await supabase.from("message_templates").select("*").eq("tenant_id", activeId).eq("approval_status", "APPROVED").order("template_name");
			if (error) throw error;
			return data ?? [];
		}
	});
	const selectedTemplate = templates.find((t) => t.id === selectedTemplateId) ?? null;
	const { data: workspaceMembers = [] } = useQuery({
		queryKey: ["workspace-members", activeId],
		enabled: !!activeId,
		queryFn: async () => {
			const { data, error } = await supabase.from("tenant_members").select("user_id, role, profile:user_id(id, full_name, email)").eq("tenant_id", activeId).order("created_at");
			if (error) throw error;
			return data ?? [];
		}
	});
	const { data: conversations = [], isLoading: convsLoading } = useQuery({
		queryKey: [
			"conversations",
			activeId,
			statusFilter,
			assignFilter,
			priorityFilter
		],
		enabled: !!activeId,
		queryFn: async () => {
			return await getConvsListFn({ data: {
				tenantId: activeId,
				statusFilter,
				assignFilter,
				priorityFilter
			} }) ?? [];
		}
	});
	const convIds = (0, import_react.useMemo)(() => conversations.map((c) => c.id), [conversations]);
	const { data: inboundReplyMap = /* @__PURE__ */ new Map() } = useQuery({
		queryKey: [
			"inbound-replies-map",
			activeId,
			convIds.join(",")
		],
		enabled: !!activeId && convIds.length > 0,
		queryFn: async () => {
			const { data, error } = await supabase.from("conversation_messages").select("conversation_id, created_at").in("conversation_id", convIds).eq("direction", "inbound").order("created_at", { ascending: false });
			if (error) throw error;
			const map = /* @__PURE__ */ new Map();
			for (const msg of data ?? []) if (msg.conversation_id && msg.created_at && !map.has(msg.conversation_id)) map.set(msg.conversation_id, msg.created_at);
			return map;
		},
		staleTime: 5e3
	});
	const { data: contactsMinimal = [] } = useQuery({
		queryKey: ["contacts-minimal-map", activeId],
		enabled: !!activeId,
		queryFn: async () => {
			const { data } = await supabase.from("contacts").select("name, phone_number_normalized").eq("tenant_id", activeId);
			return data ?? [];
		}
	});
	const contactsByPhoneMap = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		for (const c of contactsMinimal) if (c.phone_number_normalized && c.name) {
			const norm = c.phone_number_normalized.replace(/\D/g, "");
			if (norm) map.set(norm, c.name);
		}
		return map;
	}, [contactsMinimal]);
	const repliedCount = (0, import_react.useMemo)(() => {
		return conversations.filter((c) => !!(inboundReplyMap.get(c.id) || c.last_inbound_at)).length;
	}, [conversations, inboundReplyMap]);
	const sortedConvs = (0, import_react.useMemo)(() => {
		return conversations.filter((c) => {
			if (search.trim()) {
				const s = search.toLowerCase();
				if (!(getContactDisplay(c, contactsByPhoneMap).toLowerCase().includes(s) || (c.phone_number ?? "").includes(s) || (c.last_message ?? "").toLowerCase().includes(s))) return false;
			}
			if (assignFilter === "replied") {
				if (!!!(inboundReplyMap.get(c.id) || c.last_inbound_at)) return false;
			}
			return true;
		}).sort((a, b) => {
			const unreadA = (a.unread_count ?? 0) > 0 ? 1 : 0;
			const unreadB = (b.unread_count ?? 0) > 0 ? 1 : 0;
			if (unreadA !== unreadB) return unreadB - unreadA;
			const inboundTimeA = inboundReplyMap.get(a.id) || a.last_inbound_at;
			const inboundTimeB = inboundReplyMap.get(b.id) || b.last_inbound_at;
			const hasRepliedA = inboundTimeA ? 1 : 0;
			const hasRepliedB = inboundTimeB ? 1 : 0;
			if (hasRepliedA !== hasRepliedB) return hasRepliedB - hasRepliedA;
			const timeA = inboundTimeA ? new Date(inboundTimeA).getTime() : a.last_message_at ? new Date(a.last_message_at).getTime() : new Date(a.created_at).getTime();
			return (inboundTimeB ? new Date(inboundTimeB).getTime() : b.last_message_at ? new Date(b.last_message_at).getTime() : new Date(b.created_at).getTime()) - timeA;
		});
	}, [
		conversations,
		inboundReplyMap,
		contactsByPhoneMap,
		search,
		assignFilter
	]);
	const activeConv = conversations.find((c) => c.id === activeConvId) ?? null;
	const { data: messages = [], isLoading: msgsLoading } = useQuery({
		queryKey: [
			"messages",
			activeConvId,
			msgPage,
			activeId
		],
		enabled: !!activeConvId && !!activeId,
		queryFn: async () => {
			const { data, error } = await supabase.from("conversation_messages").select("id, conversation_id, direction, message_type, message_text, media_url, meta_message_id, meta_status, sent_at, delivered_at, read_at, created_at").eq("conversation_id", activeConvId).order("created_at", { ascending: false }).range((msgPage - 1) * MSG_PAGE_SIZE, msgPage * MSG_PAGE_SIZE - 1);
			if (error) throw error;
			return (data ?? []).reverse();
		},
		staleTime: 0
	});
	const { data: internalNotes = [] } = useQuery({
		queryKey: [
			"conv-notes",
			activeConvId,
			activeId
		],
		enabled: !!activeConvId && !!activeId,
		queryFn: async () => {
			const { data, error } = await supabase.from("conversation_internal_notes").select("*, author:author_id(id, full_name, email)").eq("conversation_id", activeConvId).is("deleted_at", null).order("created_at", { ascending: true });
			if (error) throw error;
			return data ?? [];
		}
	});
	const { data: activities = [] } = useQuery({
		queryKey: [
			"conv-activities",
			activeConvId,
			activeId
		],
		enabled: !!activeConvId && !!activeId,
		queryFn: async () => {
			const { data, error } = await supabase.from("conversation_activities").select("*, actor:actor_id(id, full_name, email)").eq("conversation_id", activeConvId).order("created_at", { ascending: true });
			if (error) throw error;
			return data ?? [];
		}
	});
	const timeline = (0, import_react.useMemo)(() => {
		return [
			...messages.map((m) => ({
				kind: "message",
				timestamp: m.created_at,
				data: m
			})),
			...internalNotes.map((n) => ({
				kind: "note",
				timestamp: n.created_at,
				data: n
			})),
			...activities.map((a) => ({
				kind: "activity",
				timestamp: a.created_at,
				data: a
			}))
		].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
	}, [
		messages,
		internalNotes,
		activities
	]);
	function groupTimeline(items) {
		const groups = [];
		let currentLabel = "";
		for (const item of items) {
			const label = formatDate(item.timestamp);
			if (label !== currentLabel) {
				currentLabel = label;
				groups.push({
					label,
					items: [item]
				});
			} else groups[groups.length - 1].items.push(item);
		}
		return groups;
	}
	const canReply = !isAgent || activeConv?.assigned_to === currentUserId;
	const resetUnread = (0, import_react.useCallback)(async (convId) => {
		await supabase.from("conversations").update({ unread_count: 0 }).eq("id", convId);
		qc.invalidateQueries({ queryKey: ["conversations", activeId] });
	}, [activeId, qc]);
	(0, import_react.useEffect)(() => {
		if (activeConvId && activeConvId !== prevConvIdRef.current) {
			prevConvIdRef.current = activeConvId;
			setMsgPage(1);
			resetUnread(activeConvId);
		}
	}, [activeConvId, resetUnread]);
	(0, import_react.useEffect)(() => {
		if (msgPage === 1) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [timeline, msgPage]);
	(0, import_react.useEffect)(() => {
		if (!activeId) return;
		const convChannel = supabase.channel(`convs:${activeId}`).on("postgres_changes", {
			event: "*",
			schema: "public",
			table: "conversations",
			filter: `tenant_id=eq.${activeId}`
		}, () => {
			qc.invalidateQueries({ queryKey: ["conversations", activeId] });
		}).subscribe();
		return () => {
			supabase.removeChannel(convChannel);
		};
	}, [activeId, qc]);
	(0, import_react.useEffect)(() => {
		if (!activeConvId) return;
		const msgChannel = supabase.channel(`msgs:${activeConvId}`).on("postgres_changes", {
			event: "*",
			schema: "public",
			table: "conversation_messages",
			filter: `conversation_id=eq.${activeConvId}`
		}, () => {
			qc.invalidateQueries({ queryKey: ["messages", activeConvId] });
			resetUnread(activeConvId);
		}).subscribe();
		const noteChannel = supabase.channel(`notes:${activeConvId}`).on("postgres_changes", {
			event: "*",
			schema: "public",
			table: "conversation_internal_notes",
			filter: `conversation_id=eq.${activeConvId}`
		}, () => {
			qc.invalidateQueries({ queryKey: ["conv-notes", activeConvId] });
		}).subscribe();
		const activityChannel = supabase.channel(`activities:${activeConvId}`).on("postgres_changes", {
			event: "*",
			schema: "public",
			table: "conversation_activities",
			filter: `conversation_id=eq.${activeConvId}`
		}, () => {
			qc.invalidateQueries({ queryKey: ["conv-activities", activeConvId] });
		}).subscribe();
		return () => {
			supabase.removeChannel(msgChannel);
			supabase.removeChannel(noteChannel);
			supabase.removeChannel(activityChannel);
		};
	}, [
		activeConvId,
		qc,
		resetUnread
	]);
	const sendMutation = useMutation({
		mutationFn: async (opts) => {
			if (!activeId || !activeConvId) return;
			const currentConv = conversations.find((c) => c.id === activeConvId);
			if (!currentConv) throw new Error("Active conversation not found.");
			const res = await sendReplyFn({ data: {
				messageId: opts.messageId,
				tenantId: activeId,
				conversationId: activeConvId,
				contactId: currentConv.contact_id,
				phoneNumber: currentConv.phone_number,
				messageType: opts.messageType,
				messageText: opts.messageText,
				mediaUrl: opts.mediaUrl,
				templateName: opts.templateName,
				templateVariables: opts.templateVariables
			} });
			if (!res.ok) throw new Error(res.error || "Failed to send reply");
			return res;
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["messages", activeConvId] });
			qc.invalidateQueries({ queryKey: ["conversations", activeId] });
			qc.invalidateQueries({ queryKey: ["last-inbound", activeConvId] });
		},
		onError: (err) => {
			toast.error("Failed to send message: " + err.message);
			qc.invalidateQueries({ queryKey: ["messages", activeConvId] });
		}
	});
	const retryMutation = useMutation({
		mutationFn: async (messageId) => {
			if (!activeId) return;
			const res = await retryReplyFn({ data: {
				tenantId: activeId,
				messageId
			} });
			if (!res.ok) throw new Error(res.error || "Failed to retry message");
			return res;
		},
		onSuccess: () => {
			toast.success("Retry initiated.");
			qc.invalidateQueries({ queryKey: ["messages", activeConvId] });
		},
		onError: (err) => toast.error("Retry failed: " + err.message)
	});
	const createContactMutation = useMutation({
		mutationFn: async (conv) => {
			if (!activeId) return;
			const phone = conv.phone_number ?? "";
			const { data: contact, error } = await supabase.from("contacts").insert({
				tenant_id: activeId,
				name: phone,
				phone_number_raw: phone,
				phone_number_normalized: phone,
				opt_in_source: "manual",
				opt_in_date: (/* @__PURE__ */ new Date()).toISOString()
			}).select("id").single();
			if (error) throw error;
			await supabase.from("conversations").update({ contact_id: contact.id }).eq("id", conv.id);
			return contact;
		},
		onSuccess: () => {
			toast.success("Contact created and linked.");
			qc.invalidateQueries({ queryKey: ["conversations", activeId] });
		},
		onError: (e) => toast.error(e.message)
	});
	const addNoteMutation = useMutation({
		mutationFn: async () => {
			if (!activeId || !activeConvId || !noteText.trim()) return;
			const mentionedIds = extractMentions(noteText, workspaceMembers);
			const result = await addInternalNote({
				conversationId: activeConvId,
				tenantId: activeId,
				authorId: currentUserId,
				body: noteText.trim(),
				mentionedUserIds: mentionedIds
			});
			if (!result.ok) throw new Error(result.error);
			if (mentionedIds.length > 0) toast.info(`Notified ${mentionedIds.length} team member(s)`);
		},
		onSuccess: () => {
			setNoteText("");
			qc.invalidateQueries({ queryKey: ["conv-notes", activeConvId] });
			qc.invalidateQueries({ queryKey: ["conv-activities", activeConvId] });
		},
		onError: (e) => toast.error("Note failed: " + e.message)
	});
	const editNoteMutation = useMutation({
		mutationFn: async ({ noteId, body }) => {
			const { error } = await supabase.from("conversation_internal_notes").update({ body: body.trim() }).eq("id", noteId);
			if (error) throw error;
		},
		onSuccess: () => {
			setEditingNoteId(null);
			setEditNoteText("");
			qc.invalidateQueries({ queryKey: ["conv-notes", activeConvId] });
		},
		onError: (e) => toast.error("Edit failed: " + e.message)
	});
	const deleteNoteMutation = useMutation({
		mutationFn: async (noteId) => {
			const { error } = await supabase.from("conversation_internal_notes").update({ deleted_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", noteId);
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Note deleted.");
			qc.invalidateQueries({ queryKey: ["conv-notes", activeConvId] });
		},
		onError: (e) => toast.error("Delete failed: " + e.message)
	});
	const setPriorityMutation = useMutation({
		mutationFn: async ({ convId, priority }) => {
			if (!activeId) return;
			const result = await changeConversationPriority(convId, activeId, priority, currentUserId, activeConv?.priority ?? "medium");
			if (!result.ok) throw new Error(result.error);
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["conversations", activeId] });
			qc.invalidateQueries({ queryKey: ["conv-activities", activeConvId] });
		},
		onError: (e) => toast.error("Priority update failed: " + e.message)
	});
	async function handleSetStatus(convId, status) {
		if (!activeId || !activeConv) return;
		const result = await changeConversationStatus(convId, activeId, status, currentUserId, activeConv.status);
		if (!result.ok) return toast.error(result.error ?? "Failed");
		qc.invalidateQueries({ queryKey: ["conversations", activeId] });
		qc.invalidateQueries({ queryKey: ["conv-activities", activeConvId] });
	}
	const handleRetry = (messageId) => retryMutation.mutate(messageId);
	const handleSendFreeform = () => {
		if (!messageText.trim() && !attachedFile) return;
		const messageId = crypto.randomUUID();
		if (attachedFile) {
			sendMutation.mutate({
				messageId,
				messageType: attachedFile.type,
				mediaUrl: attachedFile.url,
				messageText: attachedFile.type === "document" ? attachedFile.name : messageText || null
			});
			setAttachedFile(null);
		} else sendMutation.mutate({
			messageId,
			messageType: "text",
			messageText
		});
		setMessageText("");
	};
	const validateFile = (file) => {
		let type = "document";
		if (file.type.startsWith("image/")) type = "image";
		else if (file.type.startsWith("audio/")) type = "audio";
		else if (file.type.startsWith("video/")) type = "video";
		const size = file.size;
		if (type === "image" && size > 5 * 1024 * 1024) return {
			ok: false,
			error: "Image size exceeds 5MB limit."
		};
		if (type === "document" && size > 100 * 1024 * 1024) return {
			ok: false,
			error: "Document size exceeds 100MB limit."
		};
		if ((type === "audio" || type === "video") && size > 16 * 1024 * 1024) return {
			ok: false,
			error: `${type} size exceeds 16MB limit.`
		};
		return {
			ok: true,
			type
		};
	};
	const handleManualRefresh = (0, import_react.useCallback)(() => {
		qc.invalidateQueries({ queryKey: ["conversations", activeId] });
		if (activeConvId) {
			qc.invalidateQueries({ queryKey: ["messages", activeConvId] });
			qc.invalidateQueries({ queryKey: ["conv-notes", activeConvId] });
			qc.invalidateQueries({ queryKey: ["conv-activities", activeConvId] });
		}
		toast.success("Inbox refreshed.");
	}, [
		activeId,
		activeConvId,
		qc
	]);
	function handleNoteTextChange(text) {
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
	function insertMention(member) {
		const name = member.profile?.full_name || member.profile?.email || "User";
		const lastAtIdx = noteText.lastIndexOf("@");
		setNoteText(noteText.slice(0, lastAtIdx) + `@${name} `);
		setShowMentionPicker(false);
		setMentionSearch("");
		noteTextareaRef.current?.focus();
	}
	const mentionCandidates = workspaceMembers.filter((m) => {
		if (!mentionSearch) return true;
		return (m.profile?.full_name ?? m.profile?.email ?? "").toLowerCase().includes(mentionSearch);
	}).slice(0, 5);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-[calc(100vh-4rem)] -mx-4 -mb-4 overflow-hidden bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-80 xl:w-96 flex-shrink-0 border-r border-border flex flex-col bg-card",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-4 border-b border-border",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between mb-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "text-base font-semibold",
								children: "Conversations"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								className: "size-7",
								onClick: handleManualRefresh,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-3.5" })
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								placeholder: "Search conversations",
								value: search,
								onChange: (e) => setSearch(e.target.value),
								className: "pl-8 h-8 text-sm"
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex border-b border-border px-1 bg-muted/30 overflow-x-auto",
						children: [
							"all",
							"mine",
							"unassigned",
							"replied"
						].map((f) => {
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => setAssignFilter(f),
								className: cn("flex-1 py-2 px-1.5 text-xs font-medium capitalize transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap", assignFilter === f ? f === "replied" ? "border-b-2 border-emerald-600 text-emerald-600 dark:text-emerald-400 font-semibold" : "border-b-2 border-primary text-primary font-semibold" : "text-muted-foreground hover:text-foreground"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: {
									all: "All",
									mine: "Mine",
									unassigned: "Unassigned",
									replied: "Replies"
								}[f] }), f === "replied" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: cn("px-1.5 py-0.2 rounded-full text-[10px] font-bold", assignFilter === "replied" ? "bg-emerald-600 text-white" : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"),
									children: repliedCount
								})]
							}, f);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 px-3 py-2 border-b border-border",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-1 gap-0.5 flex-wrap",
							children: [
								"all",
								"open",
								"pending",
								"resolved",
								"closed"
							].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setStatusFilter(s),
								className: cn("px-2 py-0.5 text-[10px] font-medium capitalize rounded-full transition-colors", statusFilter === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"),
								children: s
							}, s))
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: priorityFilter,
							onValueChange: (v) => setPriorityFilter(v),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: "h-6 text-[10px] w-[80px] px-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Priority" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "all",
								children: "All"
							}), Object.entries(PRIORITY_CONFIG).map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: k,
								children: v.label
							}, k))] })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex-1 overflow-y-auto",
						children: convsLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "p-6 text-center text-xs text-muted-foreground",
							children: "Loading conversations…"
						}) : sortedConvs.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col items-center justify-center h-full gap-3 p-8 text-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "size-12 rounded-full bg-muted flex items-center justify-center",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Inbox, { className: "size-5 text-muted-foreground" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium text-muted-foreground",
								children: search ? "No matching conversations" : assignFilter === "replied" ? "No numbers have replied to campaigns yet." : assignFilter === "mine" ? "No conversations assigned to you" : assignFilter === "unassigned" ? "No unassigned conversations" : "Waiting for WhatsApp conversations."
							})]
						}) : sortedConvs.map((conv) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConversationItem, {
							conv,
							isActive: conv.id === activeConvId,
							hasReplied: !!(inboundReplyMap.get(conv.id) || conv.last_inbound_at),
							contactsByPhoneMap,
							onClick: () => setActiveConvId(conv.id),
							members: workspaceMembers
						}, conv.id))
					}),
					sortedConvs.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "px-4 py-2 border-t border-border text-[10px] text-muted-foreground",
						children: [
							sortedConvs.length,
							" conversation",
							sortedConvs.length !== 1 ? "s" : ""
						]
					})
				]
			}),
			!activeConv ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 flex flex-col items-center justify-center gap-4 text-center p-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "size-16 rounded-2xl bg-muted flex items-center justify-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "size-7 text-muted-foreground" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-sm font-medium",
					children: "Select a conversation to view messages."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground mt-1",
					children: conversations.length === 0 ? "Conversations will appear when WhatsApp messages are received." : "Choose a conversation from the list on the left."
				})] })]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 flex flex-col min-w-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between px-4 py-3 border-b border-border bg-card flex-shrink-0 gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-3 min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold flex-shrink-0",
								children: getContactDisplay(activeConv, contactsByPhoneMap).slice(0, 2).toUpperCase()
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-1.5 flex-wrap",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
												className: "text-sm font-semibold",
												children: getContactDisplay(activeConv, contactsByPhoneMap)
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: activeConv.status }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriorityBadge, { priority: activeConv.priority })
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: activeConv.phone_number && activeConv.contact?.name ? activeConv.phone_number : activeConv.phone_number ?? ""
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2 mt-0.5 flex-wrap",
										children: [activeConv.assigned_to ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-1 text-[11px] text-muted-foreground",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "size-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
												"Assigned to",
												" ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-medium text-foreground",
													children: getUserDisplayName(activeConv.assigned_to, workspaceMembers)
												})
											] })]
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-1 text-[11px] text-muted-foreground",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Unassigned" })]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SLATimer, { conv: activeConv })]
									})
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end",
							children: [
								!activeConv.contact_id && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "outline",
									className: "h-7 text-xs gap-1.5",
									onClick: () => createContactMutation.mutate(activeConv),
									disabled: createContactMutation.isPending,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "size-3" }), " Create Contact"]
								}),
								canAssign && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "outline",
									className: "h-7 text-xs gap-1",
									onClick: () => setShowAssignModal(true),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "size-3" }), activeConv.assigned_to ? "Reassign" : "Assign"]
								}),
								canAssign && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: activeConv.priority,
									onValueChange: (v) => setPriorityMutation.mutate({
										convId: activeConv.id,
										priority: v
									}),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectTrigger, {
										className: "h-7 text-xs w-[90px]",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flag, { className: "size-3 mr-1" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: Object.entries(PRIORITY_CONFIG).map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: k,
										children: v.label
									}, k)) })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative group",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										variant: "outline",
										className: "h-7 text-xs gap-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: activeConv.status }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-3" })]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "absolute right-0 top-full mt-1 z-50 hidden group-hover:flex group-focus-within:flex flex-col bg-popover border border-border rounded-lg shadow-lg overflow-hidden min-w-[120px]",
										children: [
											"open",
											"pending",
											"resolved",
											"closed"
										].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => handleSetStatus(activeConv.id, s),
											className: cn("px-4 py-2 text-xs text-left capitalize hover:bg-accent transition-colors", activeConv.status === s && "font-semibold text-primary"),
											children: s
										}, s))
									})]
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex-1 overflow-y-auto p-4 bg-background/50",
						children: [
							messages.length === msgPage * MSG_PAGE_SIZE && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex justify-center mb-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "ghost",
									size: "sm",
									className: "text-xs h-7 gap-1",
									onClick: () => setMsgPage((p) => p + 1),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-3 rotate-180" }), " Load earlier"]
								})
							}),
							msgsLoading && timeline.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex items-center justify-center h-full",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-5 animate-spin text-muted-foreground" })
							}) : timeline.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col items-center justify-center h-full gap-3 text-center",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "size-8 text-muted-foreground/40" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted-foreground",
									children: "No messages in this conversation yet."
								})]
							}) : groupTimeline(timeline).map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DateSeparator, { label: group.label }), group.items.map((item) => {
								if (item.kind === "message") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageBubble, {
									msg: item.data,
									onRetry: handleRetry
								}, item.data.id);
								if (item.kind === "note") {
									const note = item.data;
									if (editingNoteId === note.id) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex justify-center py-1",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "max-w-[80%] w-full space-y-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
												value: editNoteText,
												onChange: (e) => setEditNoteText(e.target.value),
												className: "text-sm bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700 min-h-[60px]",
												autoFocus: true
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex gap-2 justify-end",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													size: "sm",
													variant: "ghost",
													className: "h-7 text-xs",
													onClick: () => {
														setEditingNoteId(null);
														setEditNoteText("");
													},
													children: "Cancel"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													size: "sm",
													className: "h-7 text-xs",
													disabled: editNoteMutation.isPending || !editNoteText.trim(),
													onClick: () => editNoteMutation.mutate({
														noteId: note.id,
														body: editNoteText
													}),
													children: editNoteMutation.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3 animate-spin" }) : "Save"
												})]
											})]
										})
									}, note.id);
									return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NoteCard, {
										note,
										currentUserId,
										canDelete: canDeleteNotes,
										onEdit: (n) => {
											setEditingNoteId(n.id);
											setEditNoteText(n.body);
										},
										onDelete: (id) => deleteNoteMutation.mutate(id)
									}, note.id);
								}
								if (item.kind === "activity") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActivityEventPill, {
									activity: item.data,
									members: workspaceMembers
								}, item.data.id);
								return null;
							})] }, group.label)),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ref: messagesEndRef })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "border-t border-border bg-card flex-shrink-0",
						children: [
							!canReply && composerTab === "message" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 px-4 py-2 bg-muted/60 text-muted-foreground text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-3.5 flex-shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: activeConv.assigned_to ? "This conversation is assigned to another team member." : "This conversation is unassigned. A manager can assign it to you." })]
							}),
							composerTab === "message" && !isWindowOpen && canReply && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-600 text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-3.5 flex-shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Customer service window expired. Send an approved template." })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex border-b border-border px-3",
								children: ["message", "note"].map((tab) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: () => setComposerTab(tab),
									className: cn("py-2 px-3 text-xs font-medium flex items-center gap-1.5 transition-colors", composerTab === tab ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"),
									children: [tab === "message" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "size-3" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StickyNote, { className: "size-3" }), tab === "message" ? "Message" : "Note"]
								}, tab))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "p-3",
								children: composerTab === "note" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "relative",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
											ref: noteTextareaRef,
											placeholder: "Write an internal note… Type @ to mention a teammate",
											value: noteText,
											onChange: (e) => handleNoteTextChange(e.target.value),
											className: "min-h-[72px] text-sm resize-none bg-amber-50/50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-800/50 focus-visible:ring-amber-400/30",
											disabled: addNoteMutation.isPending
										}), showMentionPicker && mentionCandidates.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "absolute bottom-full left-0 mb-1 bg-popover border border-border rounded-lg shadow-lg overflow-hidden w-52 z-50",
											children: mentionCandidates.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												onMouseDown: (e) => {
													e.preventDefault();
													insertMention(m);
												},
												className: "w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-accent text-left",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AtSign, { className: "size-3 text-muted-foreground" }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-medium",
														children: m.profile?.full_name || m.profile?.email
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-muted-foreground capitalize",
														children: m.role
													})
												]
											}, m.user_id))
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-[10px] text-amber-600/70 dark:text-amber-400/70 flex items-center gap-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-3" }), " Only visible to team members"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											size: "sm",
											className: "h-7 text-xs gap-1 bg-amber-500 hover:bg-amber-600 text-white",
											disabled: addNoteMutation.isPending || !noteText.trim(),
											onClick: () => addNoteMutation.mutate(),
											children: [addNoteMutation.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StickyNote, { className: "size-3" }), "Add Note"]
										})]
									})]
								}) : canReply ? showTemplatePicker ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-3 bg-background border border-border rounded-xl p-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs font-semibold",
												children: "Select and Send Template"
											}), isWindowOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												type: "button",
												variant: "ghost",
												size: "sm",
												className: "h-6 text-xs text-muted-foreground hover:text-foreground",
												onClick: () => setShowTemplatePicker(false),
												children: "Use Freeform Text"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: selectedTemplateId,
											onValueChange: (val) => {
												setSelectedTemplateId(val);
												setTemplateVars({});
												setTemplateMediaUrl("");
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
												className: "w-full text-xs h-9",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select an approved template" })
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [templates.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
												value: t.id,
												children: [
													t.template_name,
													" (",
													t.language,
													")"
												]
											}, t.id)), templates.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "p-4 text-xs text-center text-muted-foreground",
												children: "No approved templates found."
											})] })]
										}),
										selectedTemplate && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-3 border-t border-border/50 pt-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "text-[11px] text-muted-foreground p-2.5 bg-muted/50 rounded-lg whitespace-pre-wrap border border-border/30",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "font-semibold text-[10px] uppercase tracking-wider mb-1 text-muted-foreground/80",
														children: "Template Body Preview:"
													}), selectedTemplate.body]
												}),
												selectedTemplate.header_type === "IMAGE" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "space-y-1.5 border border-border/50 rounded-lg p-2.5 bg-muted/20",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
															className: "text-[11px] font-semibold",
															children: "Header Image (Required)"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
															className: "text-[10px] text-muted-foreground",
															children: "JPEG or PNG only, max 5MB."
														}),
														templateMediaUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "space-y-1.5",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
																src: templateMediaUrl,
																alt: "Header Preview",
																className: "max-h-20 rounded border object-contain bg-background",
																loading: "lazy"
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
																size: "sm",
																variant: "outline",
																className: "text-destructive border-destructive h-6 text-xs px-2",
																onClick: () => setTemplateMediaUrl(""),
																children: "Remove Image"
															})]
														}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "flex flex-col gap-1.5",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
																type: "file",
																accept: ".jpg,.jpeg,.png",
																disabled: uploadingTemplateMedia,
																onChange: async (e) => {
																	const file = e.target.files?.[0];
																	if (!file) return;
																	if (file.size > 5 * 1024 * 1024) {
																		toast.error("File exceeds maximum size of 5MB");
																		return;
																	}
																	setUploadingTemplateMedia(true);
																	try {
																		const filePath = `${activeId}/chat-attachments/${`${Date.now()}.${file.name.split(".").pop()?.toLowerCase()}`}`;
																		const { error: uploadError } = await supabase.storage.from("campaign-media").upload(filePath, file);
																		if (uploadError) throw uploadError;
																		const { data: { publicUrl } } = supabase.storage.from("campaign-media").getPublicUrl(filePath);
																		setTemplateMediaUrl(publicUrl);
																		toast.success("Header image uploaded");
																	} catch (err) {
																		toast.error("Upload failed: " + err.message);
																	} finally {
																		setUploadingTemplateMedia(false);
																	}
																},
																className: "text-xs h-8"
															}), uploadingTemplateMedia && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "text-[10px] text-muted-foreground flex items-center gap-1",
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3 animate-spin" }), " Uploading image..."]
															})]
														})
													]
												}),
												selectedTemplate.variables && selectedTemplate.variables.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "space-y-1.5",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
														className: "text-[11px] font-semibold",
														children: "Template Variables"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "space-y-1.5",
														children: selectedTemplate.variables.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "flex items-center gap-2",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "font-mono text-[10px] px-1.5 py-0.5 bg-muted rounded border border-border/40",
																children: `{{${v}}}`
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
																placeholder: `Value for {{${v}}}`,
																value: templateVars[v] ?? "",
																onChange: (e) => setTemplateVars({
																	...templateVars,
																	[v]: e.target.value
																}),
																className: "h-8 text-xs flex-1"
															})]
														}, v))
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "flex justify-end gap-2 pt-1",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
														size: "sm",
														disabled: sendMutation.isPending || uploadingTemplateMedia || selectedTemplate.header_type === "IMAGE" && !templateMediaUrl,
														onClick: async () => {
															const missing = (selectedTemplate.variables || []).filter((v) => !(templateVars[v] ?? "").trim());
															if (missing.length > 0) {
																toast.error(`Please fill in: ${missing.map((v) => `{{${v}}}`).join(", ")}`);
																return;
															}
															sendMutation.mutate({
																messageId: crypto.randomUUID(),
																messageType: "template",
																templateName: selectedTemplate.template_name,
																templateVariables: templateVars,
																mediaUrl: templateMediaUrl || null
															});
															setSelectedTemplateId("");
															setTemplateVars({});
															setTemplateMediaUrl("");
														},
														className: "text-xs h-8 gap-1",
														children: [sendMutation.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SendHorizontal, { className: "size-3" }), "Send Template"]
													})
												})
											]
										})
									]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [attachedFile && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between px-3 py-1.5 bg-muted rounded-lg text-xs border border-border/30",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-1.5 truncate text-muted-foreground",
											children: [attachedFile.type === "image" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "truncate font-medium text-foreground",
												children: attachedFile.name
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => setAttachedFile(null),
											className: "text-muted-foreground hover:text-destructive p-0.5 rounded transition-colors",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" })
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-1 px-2 py-1.5 rounded-xl border border-border bg-background",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "file",
												ref: fileInputRef,
												className: "hidden",
												onChange: async (e) => {
													const file = e.target.files?.[0];
													if (!file) return;
													const check = validateFile(file);
													if (!check.ok) {
														toast.error(check.error);
														return;
													}
													setUploadingAttachment(true);
													try {
														const filePath = `${activeId}/chat-attachments/${`${Date.now()}.${file.name.split(".").pop()?.toLowerCase()}`}`;
														const { error: uploadError } = await supabase.storage.from("campaign-media").upload(filePath, file);
														if (uploadError) throw uploadError;
														const { data: { publicUrl } } = supabase.storage.from("campaign-media").getPublicUrl(filePath);
														setAttachedFile({
															url: publicUrl,
															name: file.name,
															type: check.type
														});
														toast.success("File attached.");
													} catch (err) {
														toast.error("Upload failed: " + err.message);
													} finally {
														setUploadingAttachment(false);
													}
												}
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "p-1.5 text-muted-foreground hover:text-foreground transition-colors",
												onClick: () => fileInputRef.current?.click(),
												disabled: uploadingAttachment || sendMutation.isPending,
												title: "Attach file",
												children: uploadingAttachment ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Paperclip, { className: "size-4" })
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "relative",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													className: "p-1.5 text-muted-foreground hover:text-foreground transition-colors",
													onClick: () => setShowEmojiPicker(!showEmojiPicker),
													disabled: sendMutation.isPending,
													title: "Add emoji",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smile, { className: "size-4" })
												}), showEmojiPicker && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "absolute bottom-full left-0 mb-2 p-1.5 bg-popover border border-border rounded-lg shadow-lg grid grid-cols-6 gap-1 z-50 w-44",
													children: [
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
														"⚠️"
													].map((emoji) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
														type: "button",
														onClick: () => {
															setMessageText((prev) => prev + emoji);
															setShowEmojiPicker(false);
														},
														className: "hover:bg-accent p-1 text-sm rounded text-center transition-colors",
														children: emoji
													}, emoji))
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												placeholder: "Type a message...",
												value: messageText,
												onChange: (e) => setMessageText(e.target.value),
												disabled: sendMutation.isPending || uploadingAttachment,
												onKeyDown: (e) => {
													if (e.key === "Enter" && !e.shiftKey) {
														e.preventDefault();
														handleSendFreeform();
													}
												},
												className: "flex-1 border-0 shadow-none focus-visible:ring-0 text-sm h-8 bg-transparent text-foreground"
											}),
											templates.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												type: "button",
												size: "sm",
												variant: "ghost",
												className: "h-7 text-xs px-2 text-muted-foreground hover:text-foreground",
												onClick: () => setShowTemplatePicker(true),
												children: "Template"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												disabled: sendMutation.isPending || uploadingAttachment || !messageText.trim() && !attachedFile,
												onClick: handleSendFreeform,
												className: cn("p-1.5 transition-colors", (messageText.trim() || attachedFile) && !sendMutation.isPending && !uploadingAttachment ? "text-primary hover:text-primary/80 cursor-pointer" : "text-muted-foreground cursor-not-allowed"),
												title: "Send message",
												children: sendMutation.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SendHorizontal, { className: "size-4" })
											})
										]
									})]
								}) : null
							})
						]
					})
				]
			}),
			showAssignModal && activeConv && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AssignModal, {
				conv: activeConv,
				members: workspaceMembers,
				currentUserId,
				tenantId: activeId,
				onClose: () => setShowAssignModal(false),
				onAssigned: () => {
					qc.invalidateQueries({ queryKey: ["conversations", activeId] });
					qc.invalidateQueries({ queryKey: ["conv-activities", activeConvId] });
				}
			})
		]
	});
}
//#endregion
export { ConversationsPage as component };
