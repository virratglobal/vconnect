import { o as __toESM } from "../_runtime.mjs";
import { y as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as supabase } from "./client-Cx80Vihe.mjs";
import { n as useAuth } from "./use-auth-xGd_AUkc.mjs";
import { t as Button } from "./button-OuFjfcpS.mjs";
import { t as Input } from "./input-CITjGSX3.mjs";
import { t as Label } from "./label-BPuF5-mq.mjs";
import { t as Card } from "./card-xVPC106M.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-BgKcOzjx.mjs";
import { t as Switch } from "./switch-C_mzcXif.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { $ as Folder, Ft as Pen, G as Lock, Tt as Award, V as Megaphone, _ as Star, b as Shield, et as Flame, h as Tag, it as Eye, j as Plus, m as Trash2, o as Users, ut as Compass, vt as Check, w as Search, zt as EllipsisVertical } from "../_libs/lucide-react.mjs";
import { n as useActiveTenant, t as canManage } from "./use-tenant-B3bhUKig.mjs";
import { t as Textarea } from "./textarea-1llmCJsE.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-B5SRUUUO.mjs";
import { c as shareGroup } from "./contacts.functions-C5DHb4ik.mjs";
import { n as DropdownMenuContent, o as DropdownMenuTrigger, r as DropdownMenuItem, t as DropdownMenu } from "./dropdown-menu-DXMm4jWj.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, i as AlertDialogContent, n as AlertDialogAction, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog } from "./alert-dialog-BCrgGGf7.mjs";
import { a as SheetTitle, i as SheetHeader, n as SheetContent, r as SheetDescription, t as Sheet } from "./sheet-Q5ezC41X.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/contacts.tags-DnAIpxLy.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var GROUP_ICONS = [
	{
		name: "users",
		icon: Users,
		label: "Users"
	},
	{
		name: "folder",
		icon: Folder,
		label: "Folder"
	},
	{
		name: "star",
		icon: Star,
		label: "Star"
	},
	{
		name: "award",
		icon: Award,
		label: "Award"
	},
	{
		name: "compass",
		icon: Compass,
		label: "Compass"
	},
	{
		name: "flame",
		icon: Flame,
		label: "Flame"
	},
	{
		name: "shield",
		icon: Shield,
		label: "Shield"
	}
];
var CURATED_COLORS = [
	{
		value: "#ef4444",
		label: "Red",
		bg: "bg-red-500",
		text: "text-red-500",
		border: "border-red-500",
		softBg: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
	},
	{
		value: "#f43f5e",
		label: "Rose",
		bg: "bg-rose-500",
		text: "text-rose-500",
		border: "border-rose-500",
		softBg: "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400"
	},
	{
		value: "#f97316",
		label: "Orange",
		bg: "bg-orange-500",
		text: "text-orange-500",
		border: "border-orange-500",
		softBg: "bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400"
	},
	{
		value: "#eab308",
		label: "Yellow",
		bg: "bg-yellow-500",
		text: "text-yellow-500",
		border: "border-yellow-500",
		softBg: "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400"
	},
	{
		value: "#10b981",
		label: "Green",
		bg: "bg-emerald-500",
		text: "text-emerald-500",
		border: "border-emerald-500",
		softBg: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
	},
	{
		value: "#3b82f6",
		label: "Blue",
		bg: "bg-blue-500",
		text: "text-blue-500",
		border: "border-blue-500",
		softBg: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
	},
	{
		value: "#8b5cf6",
		label: "Violet",
		bg: "bg-violet-500",
		text: "text-violet-500",
		border: "border-violet-500",
		softBg: "bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-400"
	},
	{
		value: "#71717a",
		label: "Gray",
		bg: "bg-zinc-500",
		text: "text-zinc-500",
		border: "border-zinc-500",
		softBg: "bg-zinc-50 text-zinc-700 dark:bg-zinc-950/30 dark:text-zinc-400"
	}
];
function getColorStyle(colorHex) {
	const found = CURATED_COLORS.find((c) => c.value === colorHex);
	if (found) return found;
	return {
		value: colorHex || "#71717a",
		label: "Custom",
		bg: "bg-zinc-500",
		text: "text-zinc-500",
		border: "border-zinc-500",
		softBg: "bg-zinc-50 text-zinc-700 dark:bg-zinc-950/30 dark:text-zinc-400"
	};
}
function getGroupIcon(iconName) {
	const found = GROUP_ICONS.find((i) => i.name === iconName);
	return found ? found.icon : Folder;
}
function getPermissionSummary(share) {
	const parts = [];
	if (share.can_view_contacts) parts.push("View");
	if (share.can_use_in_campaigns) parts.push("Target");
	if (share.can_edit_audience) parts.push("Edit");
	if (share.can_manage_contacts) parts.push("Manage");
	if (share.can_reshare_audience) parts.push("Reshare");
	return parts.length > 0 ? parts.join(", ") : "No permissions";
}
function TagsGroups() {
	const { activeId, membership } = useActiveTenant();
	const { user } = useAuth();
	const qc = useQueryClient();
	const canEdit = canManage(membership?.role, "manager");
	const [selected, setSelected] = (0, import_react.useState)(null);
	const [activeTab, setActiveTab] = (0, import_react.useState)("groups");
	(0, import_react.useEffect)(() => {
		setSelected(null);
	}, [activeId]);
	const [groupSearch, setGroupSearch] = (0, import_react.useState)("");
	const [tagSearch, setTagSearch] = (0, import_react.useState)("");
	const [groupDialogOpen, setGroupDialogOpen] = (0, import_react.useState)(false);
	const [groupEditId, setGroupEditId] = (0, import_react.useState)(null);
	const [groupName, setGroupName] = (0, import_react.useState)("");
	const [groupDesc, setGroupDesc] = (0, import_react.useState)("");
	const [groupColor, setGroupColor] = (0, import_react.useState)(CURATED_COLORS[0].value);
	const [groupIcon, setGroupIconState] = (0, import_react.useState)("folder");
	const [groupActive, setGroupActive] = (0, import_react.useState)(true);
	const [tagDialogOpen, setTagDialogOpen] = (0, import_react.useState)(false);
	const [tagEditId, setTagEditId] = (0, import_react.useState)(null);
	const [tagName, setTagName] = (0, import_react.useState)("");
	const [tagDesc, setTagDesc] = (0, import_react.useState)("");
	const [tagColor, setTagColor] = (0, import_react.useState)(CURATED_COLORS[0].value);
	const [shareDialogOpen, setShareDialogOpen] = (0, import_react.useState)(false);
	const [sharingGroup, setSharingGroup] = (0, import_react.useState)(null);
	const [groupSharesList, setGroupSharesList] = (0, import_react.useState)([]);
	const [saveSharePending, setSaveSharePending] = (0, import_react.useState)(false);
	const [deleteTarget, setDeleteTarget] = (0, import_react.useState)(null);
	const { data: workspaceMembers } = useQuery({
		queryKey: ["workspace-members", activeId],
		enabled: !!activeId,
		queryFn: async () => {
			const { data } = await supabase.from("tenant_members").select("id, role, user_id, profiles!tenant_members_user_id_profiles_fkey(email, full_name)").eq("tenant_id", activeId);
			return data ?? [];
		}
	});
	const { data: groupShares, refetch: refetchShares } = useQuery({
		queryKey: ["group-shares", activeId],
		enabled: !!activeId,
		queryFn: async () => {
			const { data, error } = await supabase.from("group_shares").select(`
          id,
          group_id,
          shared_by,
          shared_with_user,
          can_view_contacts,
          can_use_in_campaigns,
          can_edit_audience,
          can_manage_contacts,
          can_reshare_audience
        `).eq("tenant_id", activeId);
			if (error) throw error;
			return data ?? [];
		}
	});
	const { data: tags, isLoading: loadingTags } = useQuery({
		queryKey: ["tags-with-counts", activeId],
		enabled: !!activeId,
		queryFn: async () => {
			const { data: tagRows } = await supabase.from("tags").select("id, name, color, description, created_at, updated_at").eq("tenant_id", activeId).order("name");
			const list = tagRows ?? [];
			if (!list.length) return [];
			const counts = await Promise.all(list.map((t) => supabase.from("contact_tags").select("contacts!inner(id)", {
				count: "exact",
				head: true
			}).eq("tag_id", t.id).is("contacts.deleted_at", null)));
			return list.map((t, i) => ({
				...t,
				count: counts[i].count ?? 0
			}));
		}
	});
	const { data: groups, isLoading: loadingGroups } = useQuery({
		queryKey: ["groups-with-counts", activeId],
		enabled: !!activeId,
		queryFn: async () => {
			const { data: gRows } = await supabase.from("groups").select("id, name, description, color, icon, created_at, updated_at, is_system_group, is_active, created_by").eq("tenant_id", activeId).order("name");
			const rawList = gRows ?? [];
			if (!rawList.length) return [];
			const createdByIds = Array.from(new Set(rawList.map((g) => g.created_by).filter((id) => !!id)));
			let profilesMap = {};
			if (createdByIds.length > 0) {
				const { data: pRows } = await supabase.from("profiles").select("id, full_name, email").in("id", createdByIds);
				(pRows ?? []).forEach((p) => {
					profilesMap[p.id] = {
						full_name: p.full_name,
						email: p.email
					};
				});
			}
			const list = rawList.map((g) => ({
				...g,
				profiles: g.created_by ? profilesMap[g.created_by] ?? null : null
			}));
			const counts = await Promise.all(list.map((g) => supabase.from("contact_groups").select("contacts!inner(id)", {
				count: "exact",
				head: true
			}).eq("group_id", g.id).is("contacts.deleted_at", null)));
			return list.map((g, i) => ({
				...g,
				count: counts[i].count ?? 0
			}));
		}
	});
	const { data: campaigns } = useQuery({
		queryKey: ["campaigns-for-counts", activeId],
		enabled: !!activeId,
		queryFn: async () => {
			const { data, error } = await supabase.from("campaigns").select("id, audience_criteria").eq("tenant_id", activeId).is("deleted_at", null);
			if (error) throw error;
			return data ?? [];
		}
	});
	const { data: savedAudiences } = useQuery({
		queryKey: ["saved-audiences-for-counts", activeId],
		enabled: !!activeId,
		queryFn: async () => {
			const { data, error } = await supabase.from("saved_audiences").select("id, criteria").eq("tenant_id", activeId);
			if (error) throw error;
			return data ?? [];
		}
	});
	const groupsWithCampaignCount = (0, import_react.useMemo)(() => {
		if (!groups) return [];
		const list = campaigns ?? [];
		const sa = savedAudiences ?? [];
		return groups.map((g) => {
			let count = 0;
			for (const c of list) {
				const aud = c.audience_criteria;
				if (!aud) continue;
				if (aud.mode === "groups" && Array.isArray(aud.ids) && aud.ids.includes(g.id)) count++;
				else if (aud.mode === "audience_builder") {
					if (Array.isArray(aud.includeGroups) && aud.includeGroups.includes(g.id) || Array.isArray(aud.excludeGroups) && aud.excludeGroups.includes(g.id)) count++;
					else if (aud.savedAudienceId) {
						const criteria = sa.find((s) => s.id === aud.savedAudienceId)?.criteria;
						if (criteria && (Array.isArray(criteria.includeGroups) && criteria.includeGroups.includes(g.id) || Array.isArray(criteria.excludeGroups) && criteria.excludeGroups.includes(g.id))) count++;
					}
				}
			}
			return {
				...g,
				campaignCount: count
			};
		});
	}, [
		groups,
		campaigns,
		savedAudiences
	]);
	const tagsWithCampaignCount = (0, import_react.useMemo)(() => {
		if (!tags) return [];
		const list = campaigns ?? [];
		const sa = savedAudiences ?? [];
		return tags.map((t) => {
			let count = 0;
			for (const c of list) {
				const aud = c.audience_criteria;
				if (!aud) continue;
				if (aud.mode === "tags" && Array.isArray(aud.ids) && aud.ids.includes(t.id)) count++;
				else if (aud.mode === "audience_builder") {
					if (Array.isArray(aud.includeTags) && aud.includeTags.includes(t.id) || Array.isArray(aud.excludeTags) && aud.excludeTags.includes(t.id)) count++;
					else if (aud.savedAudienceId) {
						const criteria = sa.find((s) => s.id === aud.savedAudienceId)?.criteria;
						if (criteria && (Array.isArray(criteria.includeTags) && criteria.includeTags.includes(t.id) || Array.isArray(criteria.excludeTags) && criteria.excludeTags.includes(t.id))) count++;
					}
				}
			}
			return {
				...t,
				campaignCount: count
			};
		});
	}, [
		tags,
		campaigns,
		savedAudiences
	]);
	const filteredGroups = (0, import_react.useMemo)(() => {
		const term = groupSearch.toLowerCase().trim();
		if (!term) return groupsWithCampaignCount;
		return groupsWithCampaignCount.filter((g) => g.name.toLowerCase().includes(term) || g.description && g.description.toLowerCase().includes(term));
	}, [groupsWithCampaignCount, groupSearch]);
	const { myGroups, sharedGroups } = (0, import_react.useMemo)(() => {
		const my = [];
		const shared = [];
		const isAgent = membership?.role === "agent";
		filteredGroups.forEach((g) => {
			if (g.created_by === user?.id || g.is_system_group || !g.created_by) my.push(g);
			else {
				const isShared = groupShares?.some((s) => s.shared_with_user === user?.id && s.group_id === g.id);
				if (!isAgent || isShared) shared.push(g);
			}
		});
		return {
			myGroups: my,
			sharedGroups: shared
		};
	}, [
		filteredGroups,
		user?.id,
		groupShares,
		membership?.role
	]);
	const filteredTags = (0, import_react.useMemo)(() => {
		const term = tagSearch.toLowerCase().trim();
		if (!term) return tagsWithCampaignCount;
		return tagsWithCampaignCount.filter((t) => t.name.toLowerCase().includes(term) || t.description && t.description.toLowerCase().includes(term));
	}, [tagsWithCampaignCount, tagSearch]);
	const saveGroupMutation = useMutation({
		mutationFn: async () => {
			if (!groupName.trim() || !activeId) return;
			const payload = {
				tenant_id: activeId,
				name: groupName.trim(),
				description: groupDesc.trim() || null,
				color: groupColor,
				icon: groupIcon,
				is_active: groupActive
			};
			if (groupEditId) {
				const { error } = await supabase.from("groups").update(payload).eq("id", groupEditId).eq("tenant_id", activeId);
				if (error) throw error;
			} else {
				const { error } = await supabase.from("groups").insert({
					...payload,
					created_by: user?.id
				});
				if (error) throw error;
			}
		},
		onSuccess: () => {
			toast.success(groupEditId ? "Group updated" : "Group created");
			setGroupDialogOpen(false);
			qc.invalidateQueries({ queryKey: ["groups-with-counts"] });
			qc.invalidateQueries({ queryKey: ["groups"] });
		},
		onError: (err) => {
			toast.error(err.message);
		}
	});
	const saveTagMutation = useMutation({
		mutationFn: async () => {
			if (!tagName.trim() || !activeId) return;
			const payload = {
				tenant_id: activeId,
				name: tagName.trim(),
				description: tagDesc.trim() || null,
				color: tagColor
			};
			if (tagEditId) {
				const { error } = await supabase.from("tags").update(payload).eq("id", tagEditId).eq("tenant_id", activeId);
				if (error) throw error;
			} else {
				const { error } = await supabase.from("tags").insert(payload);
				if (error) throw error;
			}
		},
		onSuccess: () => {
			toast.success(tagEditId ? "Tag updated" : "Tag created");
			setTagDialogOpen(false);
			qc.invalidateQueries({ queryKey: ["tags-with-counts"] });
			qc.invalidateQueries({ queryKey: ["tags"] });
		},
		onError: (err) => {
			toast.error(err.message);
		}
	});
	const deleteMutation = useMutation({
		mutationFn: async () => {
			if (!deleteTarget || !activeId) return;
			if (deleteTarget.kind === "group") {
				const { data: memberRows } = await supabase.from("contact_groups").select("contact_id").eq("group_id", deleteTarget.id);
				const contactIds = (memberRows ?? []).map((r) => r.contact_id);
				if (contactIds.length > 0) {
					const { error: contactsErr } = await supabase.from("contacts").update({ deleted_at: (/* @__PURE__ */ new Date()).toISOString() }).in("id", contactIds).eq("tenant_id", activeId);
					if (contactsErr) throw contactsErr;
				}
				const { error } = await supabase.from("groups").delete().eq("id", deleteTarget.id).eq("tenant_id", activeId);
				if (error) throw error;
			} else {
				const { error } = await supabase.from("tags").delete().eq("id", deleteTarget.id).eq("tenant_id", activeId);
				if (error) throw error;
			}
		},
		onSuccess: () => {
			toast.success(`${deleteTarget?.kind === "group" ? "Group" : "Tag"} deleted successfully`);
			setDeleteTarget(null);
			qc.invalidateQueries({ queryKey: ["groups-with-counts"] });
			qc.invalidateQueries({ queryKey: ["tags-with-counts"] });
			qc.invalidateQueries({ queryKey: ["groups"] });
			qc.invalidateQueries({ queryKey: ["tags"] });
			qc.invalidateQueries({ queryKey: ["contacts"] });
		},
		onError: (err) => {
			toast.error(err.message);
		}
	});
	function openNewGroup() {
		setGroupEditId(null);
		setGroupName("");
		setGroupDesc("");
		setGroupColor(CURATED_COLORS[0].value);
		setGroupIconState("folder");
		setGroupActive(true);
		setGroupDialogOpen(true);
	}
	function openEditGroup(g) {
		setGroupEditId(g.id);
		setGroupName(g.name);
		setGroupDesc(g.description || "");
		setGroupColor(g.color || CURATED_COLORS[0].value);
		setGroupIconState(g.icon || "folder");
		setGroupActive(g.is_active ?? true);
		setGroupDialogOpen(true);
	}
	async function openShareGroup(g) {
		setSharingGroup(g);
		const { data: shares, error } = await supabase.from("group_shares").select("shared_with_user, can_view_contacts, can_use_in_campaigns, can_edit_audience, can_manage_contacts, can_reshare_audience").eq("group_id", g.id).eq("tenant_id", activeId);
		if (error) {
			toast.error("Failed to load group shares: " + error.message);
			return;
		}
		setGroupSharesList((workspaceMembers ?? []).filter((m) => m.user_id !== user?.id && m.user_id !== g.created_by).map((m) => {
			const existing = shares?.find((s) => s.shared_with_user === m.user_id);
			return {
				userId: m.user_id,
				email: m.profiles?.email || "",
				fullName: m.profiles?.full_name || "Unnamed",
				canViewContacts: existing ? existing.can_view_contacts : false,
				canUseInCampaigns: existing ? existing.can_use_in_campaigns : false,
				canEditAudience: existing ? existing.can_edit_audience : false,
				canManageContacts: existing ? existing.can_manage_contacts : false,
				canReshareAudience: existing ? existing.can_reshare_audience : false
			};
		}));
		setShareDialogOpen(true);
	}
	function updateSharePermission(idx, key, value) {
		const copy = [...groupSharesList];
		copy[idx] = {
			...copy[idx],
			[key]: value
		};
		setGroupSharesList(copy);
	}
	async function saveGroupShares() {
		if (!activeId || !sharingGroup) return;
		setSaveSharePending(true);
		try {
			const activeShares = groupSharesList.filter((s) => s.canViewContacts || s.canUseInCampaigns || s.canEditAudience || s.canManageContacts || s.canReshareAudience).map((s) => ({
				userId: s.userId,
				canViewContacts: s.canViewContacts,
				canUseInCampaigns: s.canUseInCampaigns,
				canEditAudience: s.canEditAudience,
				canManageContacts: s.canManageContacts,
				canReshareAudience: s.canReshareAudience
			}));
			await shareGroup({ data: {
				tenantId: activeId,
				groupId: sharingGroup.id,
				shares: activeShares
			} });
			toast.success("Group sharing permissions updated");
			setShareDialogOpen(false);
			refetchShares();
		} catch (err) {
			toast.error(err.message || "Failed to update sharing");
		} finally {
			setSaveSharePending(false);
		}
	}
	function openNewTag() {
		setTagEditId(null);
		setTagName("");
		setTagDesc("");
		setTagColor(CURATED_COLORS[0].value);
		setTagDialogOpen(true);
	}
	function openEditTag(t) {
		setTagEditId(t.id);
		setTagName(t.name);
		setTagDesc(t.description || "");
		setTagColor(t.color || CURATED_COLORS[0].value);
		setTagDialogOpen(true);
	}
	const renderGroupCard = (g) => {
		const IconComponent = getGroupIcon(g.icon);
		const colorDetails = getColorStyle(g.color);
		const userShare = groupShares?.find((s) => s.group_id === g.id && s.shared_with_user === user?.id);
		const isOwnerOrAdmin = membership?.role === "owner" || membership?.role === "admin";
		const hasViewAccess = isOwnerOrAdmin || g.created_by === user?.id || g.is_system_group || !g.created_by || userShare?.can_view_contacts || userShare?.can_manage_contacts;
		const hasEditAccess = isOwnerOrAdmin || g.created_by === user?.id || canEdit || userShare?.can_edit_audience;
		const canReshare = isOwnerOrAdmin || g.created_by === user?.id || canEdit || userShare?.can_reshare_audience;
		const isSharedWithMe = g.created_by && g.created_by !== user?.id && !g.is_system_group;
		const shareCount = groupShares?.filter((s) => s.group_id === g.id).length ?? 0;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "relative overflow-hidden group border border-border p-5 flex flex-col justify-between hover:shadow-md transition duration-200",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute left-0 top-0 bottom-0 w-1",
					style: { backgroundColor: colorDetails.value }
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: `p-2 rounded-lg`,
								style: {
									backgroundColor: `${colorDetails.value}15`,
									color: colorDetails.value
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconComponent, { className: "size-5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
								className: "font-semibold text-sm leading-none flex items-center gap-1.5",
								children: [g.name, g.is_system_group && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									title: "System Group",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-3 text-muted-foreground" })
								})]
							}), g.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground mt-1 line-clamp-1",
								children: g.description
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								className: "size-8 h-8 w-8",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EllipsisVertical, { className: "size-4" })
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
							align: "end",
							children: [
								hasViewAccess && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
									onClick: () => setSelected({
										kind: "group",
										id: g.id,
										name: g.name
									}),
									className: "cursor-pointer",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-4 mr-2" }), " View Members"]
								}),
								canReshare && !g.is_system_group && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
									onClick: () => openShareGroup(g),
									className: "cursor-pointer text-primary",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-4 mr-2" }), " Share Group"]
								}),
								hasEditAccess && !g.is_system_group && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
									onClick: () => openEditGroup(g),
									className: "cursor-pointer",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pen, { className: "size-4 mr-2" }), " Edit Details"]
								}),
								(canEdit || g.created_by === user?.id) && !g.is_system_group && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
									onClick: () => setDeleteTarget({
										kind: "group",
										id: g.id,
										name: g.name
									}),
									className: "text-destructive cursor-pointer focus:bg-destructive/10 focus:text-destructive",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4 mr-2" }), " Delete Group"]
								})
							]
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-1.5 mt-3 flex-wrap",
						children: [
							!g.is_active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "inline-flex items-center rounded bg-destructive/10 px-1.5 py-0.5 text-[10px] font-medium text-destructive",
								children: "Inactive"
							}),
							g.is_system_group && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "inline-flex items-center rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground",
								children: "System Folder"
							}),
							isSharedWithMe && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "inline-flex items-center rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary",
								title: `Shared by ${g.profiles?.full_name || g.profiles?.email || "Workspace Member"}`,
								children: [
									"🤝 Shared (Owner: ",
									g.profiles?.full_name || g.profiles?.email?.split("@")[0] || "Unknown",
									")"
								]
							}),
							!isSharedWithMe && shareCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "inline-flex items-center rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400",
								children: [
									"🤝 Shared with ",
									shareCount,
									" member",
									shareCount === 1 ? "" : "s"
								]
							})
						]
					}),
					isSharedWithMe && userShare && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-[10px] text-muted-foreground mt-2",
						children: ["Permissions: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium text-foreground",
							children: getPermissionSummary(userShare)
						})]
					})
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-border text-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1.5 text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-3.5 text-muted-foreground/75" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-semibold text-foreground",
							children: hasViewAccess ? g.count : "—"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-[10px]",
							children: ["Contact", g.count === 1 ? "" : "s"]
						})] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1.5 text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Megaphone, { className: "size-3.5 text-muted-foreground/75" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-semibold text-foreground",
							children: g.campaignCount
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-[10px]",
							children: ["Campaign", g.campaignCount === 1 ? "" : "s"]
						})] })]
					})]
				})
			]
		}, g.id);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl md:text-3xl font-semibold tracking-tight",
				children: "Audiences, Groups & Tags"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground mt-1",
				children: "Segment contacts and organize lists for targeting broadcasts."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				value: activeTab,
				onValueChange: setActiveTab,
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
						className: "grid w-full max-w-[400px] grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
							value: "groups",
							className: "flex items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-4" }),
								"Groups (",
								groups?.length ?? 0,
								")"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
							value: "tags",
							className: "flex items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { className: "size-4" }),
								"Tags (",
								tags?.length ?? 0,
								")"
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
						value: "groups",
						className: "space-y-4 outline-none",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col sm:flex-row gap-3 items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative w-full sm:max-w-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-2.5 size-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									placeholder: "Search groups...",
									className: "pl-9",
									value: groupSearch,
									onChange: (e) => setGroupSearch(e.target.value)
								})]
							}), canEdit && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								onClick: openNewGroup,
								className: "w-full sm:w-auto",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4 mr-1" }), " New Group"]
							})]
						}), loadingGroups ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm text-muted-foreground",
							children: "Loading groups…"
						}) : !filteredGroups.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "flex flex-col items-center justify-center p-8 text-center text-muted-foreground border-dashed",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-8 mb-2 opacity-50" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-medium text-sm",
									children: "No groups found"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground mt-0.5",
									children: groupSearch ? "Clear your search to see groups." : "Create folders to organize lists."
								})
							]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-8",
							children: [myGroups.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-xs font-semibold text-muted-foreground tracking-wider uppercase",
									children: "My Groups"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
									children: myGroups.map((g) => renderGroupCard(g))
								})]
							}), sharedGroups.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-xs font-semibold text-muted-foreground tracking-wider uppercase",
									children: "Shared With Me"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
									children: sharedGroups.map((g) => renderGroupCard(g))
								})]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
						value: "tags",
						className: "space-y-4 outline-none",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col sm:flex-row gap-3 items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative w-full sm:max-w-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-2.5 size-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									placeholder: "Search tags...",
									className: "pl-9",
									value: tagSearch,
									onChange: (e) => setTagSearch(e.target.value)
								})]
							}), canEdit && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								onClick: openNewTag,
								className: "w-full sm:w-auto",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4 mr-1" }), " New Tag"]
							})]
						}), loadingTags ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm text-muted-foreground",
							children: "Loading tags…"
						}) : !filteredTags.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "flex flex-col items-center justify-center p-8 text-center text-muted-foreground border-dashed",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { className: "size-8 mb-2 opacity-50" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-medium text-sm",
									children: "No tags found"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground mt-0.5",
									children: tagSearch ? "Clear your search to see tags." : "Add label tags to categorize contacts."
								})
							]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
							children: filteredTags.map((t) => {
								const colorDetails = getColorStyle(t.color);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
									className: "relative overflow-hidden group border border-border p-5 flex flex-col justify-between hover:shadow-md transition duration-200",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "absolute left-0 top-0 bottom-0 w-1",
											style: { backgroundColor: colorDetails.value }
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-start justify-between gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold`,
												style: {
													backgroundColor: `${colorDetails.value}15`,
													color: colorDetails.value
												},
												children: t.name
											}), t.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-muted-foreground mt-2 line-clamp-2",
												children: t.description
											})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
												asChild: true,
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													variant: "ghost",
													size: "icon",
													className: "size-8 h-8 w-8",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EllipsisVertical, { className: "size-4" })
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
												align: "end",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
													onClick: () => setSelected({
														kind: "tag",
														id: t.id,
														name: t.name
													}),
													className: "cursor-pointer",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-4 mr-2" }), " View Members"]
												}), canEdit && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
													onClick: () => openEditTag(t),
													className: "cursor-pointer",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pen, { className: "size-4 mr-2" }), " Edit Details"]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
													onClick: () => setDeleteTarget({
														kind: "tag",
														id: t.id,
														name: t.name
													}),
													className: "text-destructive cursor-pointer focus:bg-destructive/10 focus:text-destructive",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4 mr-2" }), " Delete Tag"]
												})] })]
											})] })]
										}) }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-border text-xs",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-1.5 text-muted-foreground",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-3.5 text-muted-foreground/75" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "font-semibold text-foreground",
													children: t.count
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "text-[10px]",
													children: ["Contact", t.count === 1 ? "" : "s"]
												})] })]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-1.5 text-muted-foreground",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Megaphone, { className: "size-3.5 text-muted-foreground/75" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "font-semibold text-foreground",
													children: t.campaignCount
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "text-[10px]",
													children: ["Campaign", t.campaignCount === 1 ? "" : "s"]
												})] })]
											})]
										})
									]
								}, t.id);
							})
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: groupDialogOpen,
				onOpenChange: setGroupDialogOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-[425px]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: groupEditId ? "Edit Group Details" : "Create Folder Group" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: groupEditId ? "Modify group parameters. Changes will apply to all segmented audiences." : "Organize contacts in first-class folders for bulk template targeting." })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4 py-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "groupName",
										children: "Group Name"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "groupName",
										value: groupName,
										onChange: (e) => setGroupName(e.target.value),
										placeholder: "e.g. Retail Customers, Leads"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "groupDesc",
										children: "Description"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										id: "groupDesc",
										value: groupDesc,
										onChange: (e) => setGroupDesc(e.target.value),
										placeholder: "Details about group segmentation...",
										rows: 3
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Theme Color" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex flex-wrap gap-2 pt-1",
										children: CURATED_COLORS.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => setGroupColor(c.value),
											className: `size-6 rounded-full ${c.bg} border-2 relative transition hover:scale-110`,
											style: { borderColor: groupColor === c.value ? "#000" : "transparent" },
											title: c.label,
											children: groupColor === c.value && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5 absolute inset-0 m-auto text-white" })
										}, c.value))
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Group Icon" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex flex-wrap gap-2 pt-1",
										children: GROUP_ICONS.map((i) => {
											const Icon = i.icon;
											return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												onClick: () => setGroupIconState(i.name),
												className: `p-2 rounded-lg border transition hover:bg-muted ${groupIcon === i.name ? "bg-primary-soft text-primary border-primary" : "border-border"}`,
												title: i.label,
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" })
											}, i.name);
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between pt-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-0.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "groupActive",
											children: "Active Status"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted-foreground",
											children: "Inactive groups are omitted from bulk sender options."
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
										id: "groupActive",
										checked: groupActive,
										onCheckedChange: setGroupActive
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => setGroupDialogOpen(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: () => saveGroupMutation.mutate(),
							disabled: saveGroupMutation.isPending || !groupName.trim(),
							children: saveGroupMutation.isPending ? "Saving…" : "Save Changes"
						})] })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: shareDialogOpen,
				onOpenChange: setShareDialogOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-[550px]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, { children: ["Share Group: ", sharingGroup?.name] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Grant specific permissions to workspace members. Users will be able to target this audience based on flags." })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-4 py-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "max-h-[300px] overflow-y-auto space-y-4 pr-1",
								children: groupSharesList.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted-foreground text-center py-4",
									children: "No other members in this workspace to share with."
								}) : groupSharesList.map((s, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-3 border rounded-lg space-y-2 bg-muted/20",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex items-center justify-between",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm font-medium",
											children: s.fullName
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted-foreground",
											children: s.email
										})] })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t text-xs",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
												className: "flex items-center gap-1.5 cursor-pointer",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "checkbox",
													checked: s.canViewContacts,
													onChange: (e) => updateSharePermission(idx, "canViewContacts", e.target.checked),
													className: "rounded border-gray-300 size-3.5 accent-primary mr-1"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "View Contacts" })]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
												className: "flex items-center gap-1.5 cursor-pointer",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "checkbox",
													checked: s.canUseInCampaigns,
													onChange: (e) => updateSharePermission(idx, "canUseInCampaigns", e.target.checked),
													className: "rounded border-gray-300 size-3.5 accent-primary mr-1"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Use in Campaigns" })]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
												className: "flex items-center gap-1.5 cursor-pointer",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "checkbox",
													checked: s.canEditAudience,
													onChange: (e) => updateSharePermission(idx, "canEditAudience", e.target.checked),
													className: "rounded border-gray-300 size-3.5 accent-primary mr-1"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Edit Audience" })]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
												className: "flex items-center gap-1.5 cursor-pointer",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "checkbox",
													checked: s.canManageContacts,
													onChange: (e) => updateSharePermission(idx, "canManageContacts", e.target.checked),
													className: "rounded border-gray-300 size-3.5 accent-primary mr-1"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Manage Contacts" })]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
												className: "flex items-center gap-1.5 cursor-pointer",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "checkbox",
													checked: s.canReshareAudience,
													onChange: (e) => updateSharePermission(idx, "canReshareAudience", e.target.checked),
													className: "rounded border-gray-300 size-3.5 accent-primary mr-1"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Re-share Audience" })]
											})
										]
									})]
								}, s.userId))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => setShareDialogOpen(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: saveGroupShares,
							disabled: saveSharePending,
							children: saveSharePending ? "Saving…" : "Save Sharing"
						})] })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: tagDialogOpen,
				onOpenChange: setTagDialogOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-[425px]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: tagEditId ? "Edit Tag Parameters" : "Create Categorization Tag" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Tags are flexible labels to categorize, highlight, and filter contacts in grids." })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4 py-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "tagName",
										children: "Tag Label"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "tagName",
										value: tagName,
										onChange: (e) => setTagName(e.target.value),
										placeholder: "e.g. VIP, Hot Lead"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "tagDesc",
										children: "Tag Description"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										id: "tagDesc",
										value: tagDesc,
										onChange: (e) => setTagDesc(e.target.value),
										placeholder: "Describe when this label should be applied...",
										rows: 3
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Label Badge Color" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex flex-wrap gap-2 pt-1",
										children: CURATED_COLORS.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => setTagColor(c.value),
											className: `size-6 rounded-full ${c.bg} border-2 relative transition hover:scale-110`,
											style: { borderColor: tagColor === c.value ? "#000" : "transparent" },
											title: c.label,
											children: tagColor === c.value && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5 absolute inset-0 m-auto text-white" })
										}, c.value))
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => setTagDialogOpen(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: () => saveTagMutation.mutate(),
							disabled: saveTagMutation.isPending || !tagName.trim(),
							children: saveTagMutation.isPending ? "Saving…" : "Save Label"
						})] })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MembersSheet, {
				selected,
				onClose: () => setSelected(null)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
				open: !!deleteTarget,
				onOpenChange: (o) => !o && setDeleteTarget(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: "Are you absolutely sure?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, { children: deleteTarget?.kind === "group" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					"This will permanently delete the group \"",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: deleteTarget?.name }),
					"\" and ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "all contacts inside it" }),
					". This action cannot be undone."
				] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					"This will permanently delete the tag \"",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: deleteTarget?.name }),
					"\". This action cannot be undone. Contacts belonging to this tag will not be deleted, but the tag mapping will be severed."
				] }) })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Cancel" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
					className: "bg-destructive hover:bg-destructive/90 text-white",
					onClick: () => deleteMutation.mutate(),
					disabled: deleteMutation.isPending,
					children: deleteMutation.isPending ? "Deleting…" : "Confirm Delete"
				})] })] })
			})
		]
	});
}
function MembersSheet({ selected, onClose }) {
	const { activeId } = useActiveTenant();
	const { data: members, isLoading } = useQuery({
		queryKey: [
			"members",
			selected?.kind,
			selected?.id,
			activeId
		],
		enabled: !!selected && !!activeId,
		queryFn: async () => {
			if (!selected || !activeId) return [];
			if (selected.kind === "tag") {
				const { data } = await supabase.from("contact_tags").select("contact:contacts(id, name, phone_number_normalized, company)").eq("tag_id", selected.id).eq("tenant_id", activeId);
				return (data ?? []).map((r) => r.contact).filter(Boolean);
			}
			const { data } = await supabase.from("contact_groups").select("contact:contacts(id, name, phone_number_normalized, company)").eq("group_id", selected.id);
			return (data ?? []).map((r) => r.contact).filter(Boolean);
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
		open: !!selected,
		onOpenChange: (o) => !o && onClose(),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
			className: "sm:max-w-md",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetTitle, {
				className: "flex items-center gap-2",
				children: [selected?.kind === "group" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-5 text-primary" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { className: "size-5 text-primary" }), selected?.name]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetDescription, { children: [
				"List of contacts associated with this ",
				selected?.kind ?? "segment",
				"."
			] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 space-y-3 overflow-y-auto max-h-[calc(100vh-200px)]",
				children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-sm text-muted-foreground",
					children: "Loading members…"
				}) : members?.length ? members.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-3.5 rounded-lg border border-border flex items-center justify-between gap-3 hover:bg-muted/30 transition",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-semibold text-sm",
						children: c.name || "Unnamed"
					}), c.company && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-xs text-muted-foreground flex items-center gap-1 mt-0.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Folder, { className: "size-3" }), c.company]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-xs text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded border border-border",
						children: ["+", c.phone_number_normalized]
					})]
				}, c.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted-foreground text-center py-8",
					children: [
						"No contacts in this ",
						selected?.kind,
						" yet."
					]
				})
			})]
		})
	});
}
//#endregion
export { TagsGroups as component };
