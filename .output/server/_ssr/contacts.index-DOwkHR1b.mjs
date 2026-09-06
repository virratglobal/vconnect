import { o as __toESM } from "../_runtime.mjs";
import { y as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as useServerFn } from "./useServerFn-BqzygRuj.mjs";
import { t as supabase } from "./client-DTaxocpy.mjs";
import { n as useAuth } from "./use-auth-BLya4MAJ.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { t as Button } from "./button-OuFjfcpS.mjs";
import { t as Input } from "./input-CITjGSX3.mjs";
import { t as Label } from "./label-BPuF5-mq.mjs";
import { t as Card } from "./card-xVPC106M.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-BgKcOzjx.mjs";
import { i as useQueryClient, n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { Dt as ArrowUpDown, Lt as Funnel, Rt as Ellipsis, Ut as CircleAlert, bt as Building, gt as ChevronLeft, ht as ChevronRight, j as Plus, n as X, o as Users, st as Download, w as Search } from "../_libs/lucide-react.mjs";
import { n as useActiveTenant, t as canManage } from "./use-tenant-DyGfRuCR.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-B5SRUUUO.mjs";
import { t as MultiSelect } from "./MultiSelect-B5EH7G1E.mjs";
import { i as getContactsList, o as saveContact, r as getContactDetails, t as bulkUpdateContacts } from "./contacts.functions-BFyqMXcx.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-BHv1JhlL.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { n as CreatorMultiSelect, t as Checkbox } from "./CreatorMultiSelect-PZQF0l0b.mjs";
import { t as Skeleton } from "./skeleton-D9W9wFsj.mjs";
import { n as DropdownMenuContent, o as DropdownMenuTrigger, r as DropdownMenuItem, t as DropdownMenu } from "./dropdown-menu-DXMm4jWj.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, i as AlertDialogContent, n as AlertDialogAction, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog } from "./alert-dialog-BCrgGGf7.mjs";
import { a as SheetTitle, i as SheetHeader, n as SheetContent, r as SheetDescription, t as Sheet } from "./sheet-Q5ezC41X.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/contacts.index-DOwkHR1b.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ContactsList() {
	const { activeId, membership } = useActiveTenant();
	const { user } = useAuth();
	const qc = useQueryClient();
	const getContactsFn = useServerFn(getContactsList);
	const saveContactFn = useServerFn(saveContact);
	const bulkUpdateFn = useServerFn(bulkUpdateContacts);
	const getDetailsFn = useServerFn(getContactDetails);
	const canEdit = canManage(membership?.role, "agent");
	const isManager = canManage(membership?.role, "manager");
	const defaultTab = isManager ? "all_contacts" : "my_contacts";
	const [search, setSearch] = (0, import_react.useState)("");
	const [activeTab, setActiveTab] = (0, import_react.useState)(defaultTab);
	const [showFilters, setShowFilters] = (0, import_react.useState)(false);
	const [filterTags, setFilterTags] = (0, import_react.useState)([]);
	const [filterGroups, setFilterGroups] = (0, import_react.useState)([]);
	const [filterCreatedStart, setFilterCreatedStart] = (0, import_react.useState)("");
	const [filterCreatedEnd, setFilterCreatedEnd] = (0, import_react.useState)("");
	const [filterCampaignId, setFilterCampaignId] = (0, import_react.useState)("");
	const [filterConvStatus, setFilterConvStatus] = (0, import_react.useState)("");
	const [filterAgentId, setFilterAgentId] = (0, import_react.useState)("");
	const [filterCountry, setFilterCountry] = (0, import_react.useState)("");
	const [filterSource, setFilterSource] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		setActiveTab(defaultTab);
	}, [defaultTab]);
	(0, import_react.useEffect)(() => {
		setDetailContactId(null);
		setSelected(/* @__PURE__ */ new Set());
	}, [activeId]);
	const [page, setPage] = (0, import_react.useState)(0);
	const [pageSize, setPageSize] = (0, import_react.useState)(25);
	const [sortBy, setSortBy] = (0, import_react.useState)("created_at");
	const [sortOrder, setSortOrder] = (0, import_react.useState)("desc");
	const [selected, setSelected] = (0, import_react.useState)(/* @__PURE__ */ new Set());
	const [confirmDelete, setConfirmDelete] = (0, import_react.useState)(null);
	const [addOpen, setAddOpen] = (0, import_react.useState)(false);
	const [editingContact, setEditingContact] = (0, import_react.useState)(null);
	const [detailContactId, setDetailContactId] = (0, import_react.useState)(null);
	const [targetAgentId, setTargetAgentId] = (0, import_react.useState)("");
	const [duplicateChoice, setDuplicateChoice] = (0, import_react.useState)(null);
	const [bulkAction, setBulkAction] = (0, import_react.useState)(null);
	const [bulkTargetIds, setBulkTargetIds] = (0, import_react.useState)([]);
	const [bulkTagIds, setBulkTagIds] = (0, import_react.useState)([]);
	const [bulkGroupIds, setBulkGroupIds] = (0, import_react.useState)([]);
	const [applyingBulk, setApplyingBulk] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setPage(0);
	}, [
		search,
		filterTags,
		filterGroups,
		filterCreatedStart,
		filterCreatedEnd,
		filterCampaignId,
		filterConvStatus,
		filterAgentId,
		filterCountry,
		filterSource,
		activeTab
	]);
	const { data: allTags } = useQuery({
		queryKey: ["tags", activeId],
		enabled: !!activeId,
		queryFn: async () => {
			const { data } = await supabase.from("tags").select("id, name").eq("tenant_id", activeId).order("name");
			return data ?? [];
		}
	});
	const { data: allGroups } = useQuery({
		queryKey: ["groups", activeId],
		enabled: !!activeId,
		queryFn: async () => {
			const { data } = await supabase.from("groups").select("id, name").eq("tenant_id", activeId).order("name");
			return data ?? [];
		}
	});
	const { data: allCampaigns } = useQuery({
		queryKey: ["campaigns-list", activeId],
		enabled: !!activeId,
		queryFn: async () => {
			const { data } = await supabase.from("campaigns").select("id, name").eq("tenant_id", activeId).is("deleted_at", null).order("name");
			return data ?? [];
		}
	});
	const { data: allAgents } = useQuery({
		queryKey: ["agents-list", activeId],
		enabled: !!activeId,
		queryFn: async () => {
			const { data } = await supabase.from("tenant_members").select("user_id, profiles!tenant_members_user_id_profiles_fkey(full_name, email)").eq("tenant_id", activeId);
			return (data ?? []).map((m) => ({
				id: m.user_id,
				name: m.profiles?.full_name || m.profiles?.email || "Agent"
			}));
		}
	});
	const { data, isLoading } = useQuery({
		queryKey: [
			"contacts",
			activeId,
			search,
			page,
			pageSize,
			sortBy,
			sortOrder,
			filterTags,
			filterGroups,
			filterCreatedStart,
			filterCreatedEnd,
			filterCampaignId,
			filterConvStatus,
			filterAgentId,
			filterCountry,
			filterSource,
			activeTab
		],
		enabled: !!activeId,
		queryFn: async () => {
			return getContactsFn({ data: {
				tenantId: activeId,
				search,
				page,
				pageSize,
				sortBy,
				sortOrder,
				filters: {
					tagIds: filterTags.length ? filterTags : void 0,
					groupIds: filterGroups.length ? filterGroups : void 0,
					createdStart: filterCreatedStart || void 0,
					createdEnd: filterCreatedEnd || void 0,
					campaignId: filterCampaignId || void 0,
					conversationStatus: filterConvStatus || void 0,
					assignedAgentId: filterAgentId || void 0,
					country: filterCountry || void 0,
					creatorId: activeTab === "my_contacts" || activeTab === "imported_by_me" ? user?.id : void 0,
					source: activeTab === "imported" || activeTab === "imported_by_me" ? "csv_import" : filterSource || void 0,
					recentlyAdded: activeTab === "recently_added" ? true : void 0
				}
			} });
		}
	});
	const { data: detailsData, isLoading: isDetailsLoading } = useQuery({
		queryKey: [
			"contact-details",
			detailContactId,
			activeId
		],
		enabled: !!detailContactId && !!activeId,
		queryFn: async () => {
			return getDetailsFn({ data: {
				contactId: detailContactId,
				tenantId: activeId
			} });
		}
	});
	const rows = data?.rows ?? [];
	const total = data?.total ?? 0;
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	function toggleSort(col) {
		if (sortBy === col) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
		else {
			setSortBy(col);
			setSortOrder("desc");
		}
	}
	async function handleSoftDelete(ids) {
		if (!ids.length) return;
		try {
			await bulkUpdateFn({ data: {
				tenantId: activeId,
				action: "delete",
				contactIds: ids
			} });
			toast.success(`Deleted ${ids.length} contact(s) successfully`);
			setSelected(/* @__PURE__ */ new Set());
			setConfirmDelete(null);
			qc.invalidateQueries({ queryKey: ["contacts"] });
			qc.invalidateQueries({ queryKey: ["dashboard-kpis"] });
			qc.invalidateQueries({ queryKey: ["groups"] });
			qc.invalidateQueries({ queryKey: ["groups-with-counts"] });
			qc.invalidateQueries({ queryKey: ["tags"] });
			qc.invalidateQueries({ queryKey: ["tags-with-counts"] });
		} catch (err) {
			toast.error(err.message);
		}
	}
	async function handleApplyBulk() {
		if (!bulkAction) return;
		setApplyingBulk(true);
		try {
			await bulkUpdateFn({ data: {
				tenantId: activeId,
				action: bulkAction,
				contactIds: bulkTargetIds,
				tagIds: bulkTagIds,
				groupIds: bulkGroupIds,
				targetAgentId: bulkAction === "transfer_ownership" ? targetAgentId : void 0
			} });
			toast.success("Bulk update applied successfully");
			setBulkAction(null);
			setSelected(/* @__PURE__ */ new Set());
			setBulkTagIds([]);
			setBulkGroupIds([]);
			setTargetAgentId("");
			qc.invalidateQueries({ queryKey: ["contacts"] });
			qc.invalidateQueries({ queryKey: ["dashboard-kpis"] });
			qc.invalidateQueries({ queryKey: ["groups"] });
			qc.invalidateQueries({ queryKey: ["groups-with-counts"] });
			qc.invalidateQueries({ queryKey: ["tags"] });
			qc.invalidateQueries({ queryKey: ["tags-with-counts"] });
			qc.invalidateQueries({ queryKey: ["contact-details"] });
		} catch (err) {
			toast.error(err.message);
		} finally {
			setApplyingBulk(false);
		}
	}
	const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));
	function toggleAll() {
		if (allSelected) {
			const next = new Set(selected);
			rows.forEach((r) => next.delete(r.id));
			setSelected(next);
		} else {
			const next = new Set(selected);
			rows.forEach((r) => next.add(r.id));
			setSelected(next);
		}
	}
	function toggleOne(id) {
		const next = new Set(selected);
		if (next.has(id)) next.delete(id);
		else next.add(id);
		setSelected(next);
	}
	function exportCsv() {
		if (!rows.length) return;
		const csv = [[
			"Name",
			"Phone",
			"Email",
			"Company",
			"Tags",
			"Groups",
			"Created Date"
		], ...rows.map((c) => [
			c.name ?? "",
			`+${c.phone_number_normalized}`,
			c.email ?? "",
			c.company ?? "",
			c.tags.map((t) => t.name).join("; "),
			c.groups.map((g) => g.name).join("; "),
			new Date(c.created_at).toLocaleString()
		])].map((r) => r.map((v) => `"${String(v).replace(/"/g, "\"\"")}"`).join(",")).join("\n");
		const blob = new Blob([csv], { type: "text/csv" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `contacts-${Date.now()}.csv`;
		a.click();
		URL.revokeObjectURL(url);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-1 border-b border-border overflow-x-auto",
				children: isManager ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setActiveTab("all_contacts"),
						className: cn("px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap", activeTab === "all_contacts" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"),
						children: "All Contacts"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setActiveTab("my_contacts"),
						className: cn("px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap", activeTab === "my_contacts" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"),
						children: "My Contacts"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setActiveTab("recently_added"),
						className: cn("px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap", activeTab === "recently_added" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"),
						children: "Recently Added"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setActiveTab("imported"),
						className: cn("px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap", activeTab === "imported" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"),
						children: "Imported"
					})
				] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setActiveTab("my_contacts"),
						className: cn("px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap", activeTab === "my_contacts" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"),
						children: "My Contacts"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setActiveTab("recently_added"),
						className: cn("px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap", activeTab === "recently_added" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"),
						children: "Recently Added"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setActiveTab("imported_by_me"),
						className: cn("px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap", activeTab === "imported_by_me" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"),
						children: "Imported By Me"
					})
				] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative flex-1 min-w-[200px] max-w-md",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: search,
							onChange: (e) => setSearch(e.target.value),
							placeholder: "Search contacts, tags, groups, or notes…",
							className: "pl-9 bg-card"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						onClick: () => setShowFilters(!showFilters),
						className: showFilters ? "border-primary text-primary" : "",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Funnel, { className: "size-4" }), " Filters"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2 ml-auto",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							onClick: exportCsv,
							disabled: !rows.length,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), " Export"]
						}), canEdit && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: () => setAddOpen(true),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), " Add Contact"]
						})]
					})
				]
			}),
			showFilters && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-4 bg-muted/10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-muted-foreground font-semibold",
							children: "Filter Groups"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MultiSelect, {
							options: (allGroups ?? []).map((g) => ({
								id: g.id,
								label: g.name
							})),
							value: filterGroups,
							onChange: setFilterGroups,
							placeholder: "All Groups"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-muted-foreground font-semibold",
							children: "Filter Tags"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MultiSelect, {
							options: (allTags ?? []).map((t) => ({
								id: t.id,
								label: t.name
							})),
							value: filterTags,
							onChange: setFilterTags,
							placeholder: "All Tags"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-muted-foreground font-semibold",
							children: "Campaign"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: filterCampaignId || "all",
							onValueChange: (val) => setFilterCampaignId(val === "all" ? "" : val),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "All Campaigns" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "all",
								children: "All Campaigns"
							}), (allCampaigns ?? []).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: c.id,
								children: c.name
							}, c.id))] })]
						})]
					}),
					isManager && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-muted-foreground font-semibold",
							children: "Assigned Agent"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: filterAgentId || "all",
							onValueChange: (val) => setFilterAgentId(val === "all" ? "" : val),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "All Agents" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "all",
								children: "All Agents"
							}), (allAgents ?? []).map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: a.id,
								children: a.name
							}, a.id))] })]
						})]
					}),
					isManager && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-muted-foreground font-semibold",
							children: "Source"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: filterSource || "all",
							onValueChange: (val) => setFilterSource(val === "all" ? "" : val),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "All Sources" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "all",
									children: "All Sources"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "manual",
									children: "Manual"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "csv_import",
									children: "CSV Import"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "api",
									children: "API"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "webhook",
									children: "Webhook"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "landing_page",
									children: "Landing Page"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "campaign_reply",
									children: "Campaign Reply"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "automation",
									children: "Automation"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "future",
									children: "Future"
								})
							] })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-muted-foreground font-semibold",
							children: "Conversation Status"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: filterConvStatus || "all",
							onValueChange: (val) => setFilterConvStatus(val === "all" ? "" : val),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "All Statuses" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "all",
									children: "All Statuses"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "open",
									children: "Open"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "pending",
									children: "Pending"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "resolved",
									children: "Resolved"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "closed",
									children: "Closed"
								})
							] })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-muted-foreground font-semibold",
							children: "Created Start"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "date",
							value: filterCreatedStart,
							onChange: (e) => setFilterCreatedStart(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-muted-foreground font-semibold",
							children: "Created End"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "date",
							value: filterCreatedEnd,
							onChange: (e) => setFilterCreatedEnd(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-muted-foreground font-semibold",
							children: "Country Code"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							placeholder: "e.g. 91, 1",
							value: filterCountry,
							onChange: (e) => setFilterCountry(e.target.value.replace(/\D/g, ""))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "col-span-1 sm:col-span-2 md:col-span-4 flex justify-end pt-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "sm",
							onClick: () => {
								setFilterGroups([]);
								setFilterTags([]);
								setFilterCampaignId("");
								setFilterAgentId("");
								setFilterConvStatus("");
								setFilterCreatedStart("");
								setFilterCreatedEnd("");
								setFilterCountry("");
								setFilterSource("");
							},
							children: "Clear All Filters"
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-0 overflow-hidden",
				children: [isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "p-6 space-y-3",
					children: Array.from({ length: 8 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-12 w-full" }, i))
				}) : !rows.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-16 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-10 mx-auto mb-2 text-muted-foreground" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-semibold",
							children: "No contacts matched your criteria"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground mt-1",
							children: "Try relaxing filters or search term."
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-sm table-fixed",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
							className: "bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-b",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-4 py-3 w-12 text-center",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
											checked: allSelected,
											onCheckedChange: toggleAll,
											"aria-label": "Select all"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "text-left px-4 py-3 font-medium w-48 cursor-pointer",
										onClick: () => toggleSort("name"),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-1",
											children: ["Name ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpDown, { className: "size-3 shrink-0" })]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "text-left px-4 py-3 font-medium w-40 cursor-pointer",
										onClick: () => toggleSort("phone_number_normalized"),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-1",
											children: ["Phone ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpDown, { className: "size-3 shrink-0" })]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "text-left px-4 py-3 font-medium w-36 cursor-pointer",
										onClick: () => toggleSort("company"),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-1",
											children: ["Company ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpDown, { className: "size-3 shrink-0" })]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "text-left px-4 py-3 font-medium w-36 cursor-pointer",
										onClick: () => toggleSort("source"),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-1",
											children: ["Source ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpDown, { className: "size-3 shrink-0" })]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "text-left px-4 py-3 font-medium w-44",
										children: "Tags"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "text-left px-4 py-3 font-medium w-44",
										children: "Groups"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "text-left px-4 py-3 font-medium w-40",
										children: "Last Campaign"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "text-left px-4 py-3 font-medium w-44",
										children: "Last Message"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "text-left px-4 py-3 font-medium w-28 cursor-pointer",
										onClick: () => toggleSort("created_at"),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-1",
											children: ["Created ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpDown, { className: "size-3 shrink-0" })]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "px-4 py-3 w-16 text-center" })
								]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
							className: "divide-y",
							children: rows.map((c) => {
								const initials = (c.name || "").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "+";
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "hover:bg-muted/30 cursor-pointer",
									onClick: () => setDetailContactId(c.id),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3 text-center",
											onClick: (e) => e.stopPropagation(),
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
												checked: selected.has(c.id),
												onCheckedChange: () => toggleOne(c.id),
												"aria-label": `Select ${c.name || c.phone_number_normalized}`
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3 font-medium",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-2 truncate",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "size-8 rounded-full bg-primary-soft text-primary grid place-items-center text-xs font-semibold shrink-0",
													children: initials
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "truncate",
													children: c.name || "Unnamed"
												})]
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "px-4 py-3 font-mono text-xs truncate",
											children: ["+", c.phone_number_normalized]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3 truncate",
											children: c.company || "—"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3 truncate",
											children: c.source ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: "outline",
												className: "capitalize",
												children: c.source.replace(/_/g, " ")
											}) : "—"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex flex-wrap gap-1",
												children: [
													c.tags.slice(0, 2).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "px-2 py-0.5 rounded-full bg-primary-soft text-primary text-[10px] font-medium max-w-[80px] truncate",
														children: t.name
													}, t.id)),
													c.tags.length > 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "text-[10px] text-muted-foreground",
														children: ["+", c.tags.length - 2]
													}),
													!c.tags.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-muted-foreground text-xs",
														children: "—"
													})
												]
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex flex-wrap gap-1",
												children: [
													c.groups.slice(0, 2).map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "px-2 py-0.5 rounded-full bg-info-soft text-info text-[10px] font-medium max-w-[80px] truncate",
														children: g.name
													}, g.id)),
													c.groups.length > 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "text-[10px] text-muted-foreground",
														children: ["+", c.groups.length - 2]
													}),
													!c.groups.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-muted-foreground text-xs",
														children: "—"
													})
												]
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3 truncate",
											children: c.lastCampaign ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "truncate text-xs",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-semibold",
													children: c.lastCampaign.name
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-[10px] text-muted-foreground block capitalize",
													children: c.lastCampaign.status
												})]
											}) : "—"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3 truncate",
											children: c.lastConversation ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "truncate text-xs",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "block truncate text-muted-foreground italic",
													children: `"${c.lastConversation.lastMessage}"`
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-[10px] text-muted-foreground block",
													children: c.lastConversation.lastMessageAt ? new Date(c.lastConversation.lastMessageAt).toLocaleDateString() : "—"
												})]
											}) : "—"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3 text-muted-foreground text-xs",
											children: new Date(c.created_at).toLocaleDateString()
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3 text-center",
											onClick: (e) => e.stopPropagation(),
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
												asChild: true,
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													variant: "ghost",
													size: "icon",
													className: "size-8",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, { className: "size-4" })
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuContent, {
												align: "end",
												children: canEdit && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
													onClick: () => setEditingContact(c),
													children: "Modify Info"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
													className: "text-destructive focus:text-destructive",
													onClick: () => setConfirmDelete({
														ids: [c.id],
														label: c.name || `+${c.phone_number_normalized}`
													}),
													children: "Delete"
												})] })
											})] })
										})
									]
								}, c.id);
							})
						})]
					})
				}), rows.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between px-4 py-3 border-t text-sm text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						"Showing ",
						page * pageSize + 1,
						"–",
						Math.min((page + 1) * pageSize, total),
						" of ",
						total
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-1.5 text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Rows per page:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								value: pageSize,
								onChange: (e) => {
									setPageSize(Number(e.target.value));
									setPage(0);
								},
								className: "bg-background border rounded px-1.5 py-0.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: 10,
										children: "10"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: 25,
										children: "25"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: 50,
										children: "50"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: 100,
										children: "100"
									})
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "outline",
									size: "sm",
									disabled: page === 0,
									onClick: () => setPage((p) => Math.max(0, p - 1)),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-4" }), " Prev"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									"Page ",
									page + 1,
									" / ",
									totalPages
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "outline",
									size: "sm",
									disabled: page + 1 >= totalPages,
									onClick: () => setPage((p) => p + 1),
									children: ["Next ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4" })]
								})
							]
						})]
					})]
				})]
			}),
			selected.size > 0 && canEdit && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "fixed bottom-4 left-1/2 -translate-x-1/2 bg-card border rounded-2xl p-3.5 shadow-2xl flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-xs font-semibold px-2 py-1 rounded bg-primary-soft text-primary",
						children: [selected.size, " selected"]
					}),
					isManager && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						onClick: () => {
							setBulkTargetIds(Array.from(selected));
							setBulkAction("transfer_ownership");
						},
						children: "Transfer Ownership"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						onClick: () => {
							setBulkTargetIds(Array.from(selected));
							setBulkAction("add_groups");
						},
						children: "Add Groups"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						onClick: () => {
							setBulkTargetIds(Array.from(selected));
							setBulkAction("add_tags");
						},
						children: "Add Tags"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						onClick: () => {
							setBulkTargetIds(Array.from(selected));
							setBulkAction("remove_tags");
						},
						children: "Remove Tags"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						className: "text-destructive hover:bg-destructive-soft hover:text-destructive border-destructive",
						onClick: () => setConfirmDelete({
							ids: Array.from(selected),
							label: `${selected.size} contacts`
						}),
						children: "Delete"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setSelected(/* @__PURE__ */ new Set()),
						className: "text-muted-foreground hover:text-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
				open: !!detailContactId,
				onOpenChange: (o) => !o && setDetailContactId(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetContent, {
					className: "w-full sm:max-w-xl overflow-y-auto",
					children: isDetailsLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-6 space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-3/4" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-6 w-1/2" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-24 w-full" })
						]
					}) : detailsData ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetHeader, {
							className: "text-left border-b pb-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetTitle, {
									className: "text-xl font-bold flex items-center gap-2",
									children: [detailsData.contact.name || "Unnamed", detailsData.contact.company && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-xs text-muted-foreground font-normal flex items-center gap-1",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building, { className: "size-3.5" }),
											" ",
											detailsData.contact.company
										]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetDescription, {
									className: "font-mono text-xs mt-1 text-primary",
									children: ["+", detailsData.contact.phone_number_normalized]
								})] }), canEdit && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "outline",
									onClick: () => {
										setEditingContact(detailsData.contact);
										setDetailContactId(null);
									},
									children: "Modify Info"
								})]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
							defaultValue: "overview",
							className: "w-full",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
									className: "grid grid-cols-5 text-xs",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
											value: "overview",
											children: "Profile"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
											value: "timeline",
											children: "Timeline"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
											value: "campaigns",
											children: "Campaigns"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
											value: "chats",
											children: "Chats"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
											value: "notes",
											children: "Notes"
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
									value: "overview",
									className: "space-y-4 pt-3 text-xs",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-2 gap-3 bg-muted/20 p-3 rounded-lg",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-muted-foreground block",
													children: "Email"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
													className: "text-sm font-semibold",
													children: detailsData.contact.email || "—"
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-muted-foreground block",
													children: "Opt-in Source"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
													className: "text-sm font-semibold",
													children: detailsData.contact.opt_in_source || "Manual creation"
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-muted-foreground block",
													children: "Opt-in Date"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
													className: "text-sm font-semibold",
													children: detailsData.contact.opt_in_date ? new Date(detailsData.contact.opt_in_date).toLocaleString() : "—"
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-muted-foreground block",
													children: "Created At"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
													className: "text-sm font-semibold",
													children: new Date(detailsData.contact.created_at).toLocaleString()
												})] })
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "font-semibold text-muted-foreground",
												children: "Groups Assigned"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex flex-wrap gap-1.5",
												children: [detailsData.groups.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "px-2.5 py-0.5 rounded-full bg-info-soft text-info font-medium text-xs",
													children: g.name
												}, g.id)), !detailsData.groups.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-muted-foreground italic text-xs",
													children: "No groups assigned"
												})]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "font-semibold text-muted-foreground",
												children: "Tags Assigned"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex flex-wrap gap-1.5",
												children: [detailsData.tags.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "px-2.5 py-0.5 rounded-full bg-primary-soft text-primary font-medium text-xs",
													children: t.name
												}, t.id)), !detailsData.tags.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-muted-foreground italic text-xs",
													children: "No tags assigned"
												})]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "border-t pt-3 space-y-2 text-muted-foreground",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex justify-between items-center",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Assigned Agent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-[10px] italic bg-muted px-1.5 py-0.5 rounded",
													children: "Future feature"
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex justify-between items-center",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Timeline Scoring" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-[10px] italic bg-muted px-1.5 py-0.5 rounded",
													children: "Future feature"
												})]
											})]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
									value: "timeline",
									className: "space-y-4 pt-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "relative pl-6 border-l border-border space-y-4",
										children: [detailsData.timeline.map((act) => {
											let typeLabel = "Activity";
											let color = "bg-muted text-muted-foreground";
											if (act.activity_type === "imported") if (act.metadata?.action === "ownership_transferred") {
												typeLabel = "Ownership Transferred";
												color = "bg-amber-50 text-amber-600 border border-amber-200";
											} else {
												typeLabel = "Imported / Created";
												color = "bg-emerald-50 text-emerald-600 border border-emerald-200";
											}
											else if (act.activity_type === "tag_added") {
												typeLabel = `Tag Added: "${act.label}"`;
												color = "bg-sky-50 text-sky-600 border border-sky-200";
											} else if (act.activity_type === "tag_removed") {
												typeLabel = `Tag Removed: "${act.label}"`;
												color = "bg-muted text-muted-foreground border border-border";
											} else if (act.activity_type === "group_added") {
												typeLabel = `Group Added: "${act.label}"`;
												color = "bg-indigo-50 text-indigo-600 border border-indigo-200";
											} else if (act.activity_type === "group_removed") {
												typeLabel = `Group Removed: "${act.label}"`;
												color = "bg-muted text-muted-foreground border border-border";
											}
											return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "relative space-y-1",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "absolute -left-[30px] top-0.5 size-4 rounded-full bg-background border flex items-center justify-center",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 rounded-full bg-primary" })
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "text-xs text-muted-foreground flex justify-between items-center",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: new Date(act.created_at).toLocaleString() })
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: `p-2.5 rounded-lg text-xs font-semibold ${color}`,
														children: typeLabel
													})
												]
											}, act.id);
										}), !detailsData.timeline.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-center py-6 text-xs text-muted-foreground",
											children: "No activity timeline recorded yet."
										})]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
									value: "campaigns",
									className: "space-y-3 pt-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "border rounded-lg overflow-hidden text-xs",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
											className: "w-full text-left",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
												className: "bg-muted text-muted-foreground font-semibold",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
													className: "border-b",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
															className: "p-2",
															children: "Campaign Name"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
															className: "p-2",
															children: "Template"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
															className: "p-2",
															children: "Status"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
															className: "p-2",
															children: "Sent Date"
														})
													]
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", {
												className: "divide-y",
												children: [detailsData.campaigns.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
													className: "hover:bg-muted/10",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
															className: "p-2 font-medium",
															children: c.campaignName
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
															className: "p-2 uppercase font-mono text-[10px]",
															children: c.templateName
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
															className: "p-2",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800",
																children: c.status
															})
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
															className: "p-2 text-muted-foreground",
															children: c.sentAt ? new Date(c.sentAt).toLocaleDateString() : "Pending"
														})
													]
												}, c.id)), !detailsData.campaigns.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													colSpan: 4,
													className: "p-8 text-center text-muted-foreground",
													children: "This contact has not been targeted in any campaigns yet."
												}) })]
											})]
										})
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
									value: "chats",
									className: "space-y-3 pt-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2 max-h-[350px] overflow-y-auto pr-1",
										children: [detailsData.messages.map((m) => {
											const isIn = m.direction === "in";
											return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: `flex ${isIn ? "justify-start" : "justify-end"}`,
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: `p-2.5 rounded-xl text-xs max-w-[80%] whitespace-pre-wrap ${isIn ? "bg-muted text-foreground" : "bg-primary text-primary-foreground"}`,
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: m.body }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-[9px] block text-right mt-1 opacity-70",
														children: new Date(m.created_at).toLocaleTimeString([], {
															hour: "2-digit",
															minute: "2-digit"
														})
													})]
												})
											}, m.id);
										}), !detailsData.messages.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-center py-8 text-xs text-muted-foreground",
											children: "No messages exchanged with this contact yet."
										})]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
									value: "notes",
									className: "space-y-3 pt-3 text-xs",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "p-4 bg-muted/20 border rounded-lg text-center text-muted-foreground italic",
										children: "Internal notes are thread-bound. Go to the Conversations page to write, view, and assign notes for this contact."
									})
								})
							]
						})]
					}) : null
				})
			}),
			(addOpen || editingContact) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddEditContactDialog, {
				contact: editingContact,
				open: addOpen || !!editingContact,
				onOpenChange: (op) => {
					if (!op) {
						setAddOpen(false);
						setEditingContact(null);
					}
				},
				activeId: activeId || "",
				userId: user?.id || "",
				allTags: allTags ?? [],
				allGroups: allGroups ?? [],
				qc,
				saveContactFn,
				onDuplicate: (dupDetails) => {
					setDuplicateChoice(dupDetails);
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: !!duplicateChoice,
				onOpenChange: (o) => !o && setDuplicateChoice(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-md text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
							className: "flex items-center gap-1.5 text-destructive font-semibold",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-4" }), " Duplicate Contact Detected"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: [
							"A contact already exists with the phone number (+",
							duplicateChoice?.payload.phone,
							")."
						] })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "py-2 space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["Existing Contact: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: duplicateChoice?.name })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "What action would you like to perform?" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
							className: "flex flex-col sm:flex-row gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									onClick: () => {
										const cid = duplicateChoice?.contactId;
										setDuplicateChoice(null);
										setAddOpen(false);
										setEditingContact(null);
										if (cid) setDetailContactId(cid);
									},
									children: "View Existing Contact"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									onClick: async () => {
										if (!duplicateChoice) return;
										try {
											await saveContactFn({ data: {
												...duplicateChoice.payload,
												forceUpdate: true
											} });
											toast.success("Contact updated successfully.");
											setDuplicateChoice(null);
											setAddOpen(false);
											setEditingContact(null);
											qc.invalidateQueries({ queryKey: ["contacts"] });
											qc.invalidateQueries({ queryKey: ["dashboard-kpis"] });
											qc.invalidateQueries({ queryKey: ["groups-with-counts"] });
											qc.invalidateQueries({ queryKey: ["tags-with-counts"] });
											qc.invalidateQueries({ queryKey: ["groups"] });
											qc.invalidateQueries({ queryKey: ["tags"] });
										} catch (err) {
											toast.error(err.message);
										}
									},
									children: "Update Existing Info"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									onClick: () => setDuplicateChoice(null),
									children: "Cancel"
								})
							]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: !!bulkAction,
				onOpenChange: (o) => !o && setBulkAction(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-md",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
							className: "capitalize",
							children: [
								bulkAction?.replace(/_/g, " "),
								" (",
								bulkTargetIds.length,
								" contacts)"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Select the items to apply to all selected contacts." })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "py-4 space-y-4",
							children: [
								bulkAction?.includes("tag") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Select Tags" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MultiSelect, {
										options: (allTags ?? []).map((t) => ({
											id: t.id,
											label: t.name
										})),
										value: bulkTagIds,
										onChange: setBulkTagIds,
										placeholder: "Select tags…"
									})]
								}),
								bulkAction?.includes("group") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Select Groups" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MultiSelect, {
										options: (allGroups ?? []).map((g) => ({
											id: g.id,
											label: g.name
										})),
										value: bulkGroupIds,
										onChange: setBulkGroupIds,
										placeholder: "Select groups…"
									})]
								}),
								bulkAction === "transfer_ownership" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Select Target Agent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: targetAgentId,
										onValueChange: setTargetAgentId,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select agent…" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: (allAgents ?? []).map((agent) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: agent.id,
											children: agent.name
										}, agent.id)) })]
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => setBulkAction(null),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: handleApplyBulk,
							disabled: applyingBulk,
							children: applyingBulk ? "Applying…" : "Apply Bulk Update"
						})] })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
				open: !!confirmDelete,
				onOpenChange: (o) => !o && setConfirmDelete(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogTitle, { children: [
					"Delete ",
					confirmDelete?.label,
					"?"
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, { children: "This moves the contact to the recycle bin. Soft-deleted contacts are excluded from campaigns and the contact list." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Cancel" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
					className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
					onClick: () => confirmDelete && handleSoftDelete(confirmDelete.ids),
					children: "Delete"
				})] })] })
			})
		]
	});
}
function AddEditContactDialog({ contact, open, onOpenChange, activeId, userId, allTags, allGroups, qc, saveContactFn, onDuplicate }) {
	const [name, setName] = (0, import_react.useState)("");
	const [phone, setPhone] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [company, setCompany] = (0, import_react.useState)("");
	const [tagIds, setTagIds] = (0, import_react.useState)([]);
	const [groupIds, setGroupIds] = (0, import_react.useState)([]);
	const [defaultCountryCode, setDefaultCountryCode] = (0, import_react.useState)("91");
	const [optInSource, setOptInSource] = (0, import_react.useState)("");
	const [optInDate, setOptInDate] = (0, import_react.useState)((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
	const [saving, setSaving] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (contact) {
			setName(contact.name ?? "");
			setPhone(contact.phone_number_raw ?? contact.phone_number_normalized ?? "");
			setEmail(contact.email ?? "");
			setCompany(contact.company ?? "");
			setTagIds(contact.tags?.map((t) => t.id) ?? []);
			setGroupIds(contact.groups?.map((g) => g.id) ?? []);
			setOptInSource(contact.opt_in_source ?? "");
			if (contact.opt_in_date) setOptInDate(new Date(contact.opt_in_date).toISOString().slice(0, 10));
		}
	}, [contact]);
	async function handleCreateTag(tagName) {
		const { data, error } = await supabase.from("tags").insert({
			tenant_id: activeId,
			name: tagName.trim()
		}).select("id, name").single();
		if (error) {
			toast.error(error.message);
			throw error;
		}
		toast.success(`Tag "${tagName}" created`);
		qc.invalidateQueries({ queryKey: ["tags"] });
		qc.invalidateQueries({ queryKey: ["tags-with-counts"] });
		return data.id;
	}
	async function handleCreateGroup(groupName) {
		const { data, error } = await supabase.from("groups").insert({
			tenant_id: activeId,
			name: groupName.trim(),
			created_by: userId
		}).select("id, name").single();
		if (error) {
			toast.error(error.message);
			throw error;
		}
		toast.success(`Group "${groupName}" created`);
		qc.invalidateQueries({ queryKey: ["groups"] });
		qc.invalidateQueries({ queryKey: ["groups-with-counts"] });
		return data.id;
	}
	async function handleSave() {
		if (!phone.trim()) {
			toast.error("Phone number is required");
			return;
		}
		setSaving(true);
		const payload = {
			id: contact?.id || null,
			tenantId: activeId,
			name: name.trim() || null,
			phone: phone.trim(),
			email: email.trim() || null,
			company: company.trim() || null,
			defaultCountryCode,
			tagIds,
			groupIds,
			optInSource: optInSource.trim() || null,
			optInDate: optInSource ? new Date(optInDate).toISOString() : null,
			forceUpdate: false
		};
		try {
			const res = await saveContactFn({ data: payload });
			if (res.duplicate) onDuplicate({
				contactId: res.contactId,
				name: res.name,
				payload
			});
			else {
				toast.success("Contact saved successfully.");
				qc.invalidateQueries({ queryKey: ["contacts"] });
				qc.invalidateQueries({ queryKey: ["dashboard-kpis"] });
				qc.invalidateQueries({ queryKey: ["groups"] });
				qc.invalidateQueries({ queryKey: ["groups-with-counts"] });
				qc.invalidateQueries({ queryKey: ["tags"] });
				qc.invalidateQueries({ queryKey: ["tags-with-counts"] });
				onOpenChange(false);
			}
		} catch (err) {
			toast.error(err.message);
		} finally {
			setSaving(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-md max-h-[90vh] overflow-y-auto",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: contact ? "Edit Contact" : "Add Contact" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: contact ? "Modify contact information." : "Create a new contact." })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4 py-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "add-name",
								children: "Name"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "add-name",
								placeholder: "Contact name",
								value: name,
								onChange: (e) => setName(e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-3 gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1 col-span-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "add-cc",
									children: "Country Code"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "add-cc",
									value: defaultCountryCode,
									onChange: (e) => setDefaultCountryCode(e.target.value.replace(/\D/g, "")),
									placeholder: "91"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1 col-span-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "add-phone",
									children: "Phone number"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "add-phone",
									placeholder: "9876543210",
									value: phone,
									onChange: (e) => setPhone(e.target.value)
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "add-email",
								children: "Email"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "add-email",
								type: "email",
								placeholder: "email@example.com",
								value: email,
								onChange: (e) => setEmail(e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "add-company",
								children: "Company"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "add-company",
								placeholder: "e.g. Acme Inc.",
								value: company,
								onChange: (e) => setCompany(e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Tags" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreatorMultiSelect, {
								options: allTags.map((t) => ({
									id: t.id,
									label: t.name
								})),
								value: tagIds,
								onChange: setTagIds,
								placeholder: "Select tags…",
								onCreate: handleCreateTag
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Groups" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreatorMultiSelect, {
								options: allGroups.map((g) => ({
									id: g.id,
									label: g.name
								})),
								value: groupIds,
								onChange: setGroupIds,
								placeholder: "Select groups…",
								onCreate: handleCreateGroup
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-2 border-t pt-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "add-opt",
									children: "Opt-in Source"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "add-opt",
									placeholder: "Website signup…",
									value: optInSource,
									onChange: (e) => setOptInSource(e.target.value)
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Opt-in Date" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "date",
									value: optInDate,
									onChange: (e) => setOptInDate(e.target.value),
									disabled: !optInSource
								})]
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: () => onOpenChange(false),
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: handleSave,
					disabled: saving,
					children: saving ? "Saving…" : "Save Contact"
				})] })
			]
		})
	});
}
//#endregion
export { ContactsList as component };
