import { o as __toESM } from "../_runtime.mjs";
import { y as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { l as createServerFn } from "./esm-9EjmF9OT.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-wPl4xYQJ.mjs";
import { t as supabase } from "./client-Cx80Vihe.mjs";
import { t as createSsrRpc } from "./createSsrRpc-TuEXL4wz.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { t as Button } from "./button-OuFjfcpS.mjs";
import { t as Input } from "./input-CITjGSX3.mjs";
import { t as Label } from "./label-BPuF5-mq.mjs";
import { t as Card } from "./card-xVPC106M.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-BgKcOzjx.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { C as Send, D as RefreshCw, H as MapPin, Ht as CircleCheck, Lt as Funnel, Nt as Sparkles, P as Percent, Ut as CircleAlert, Wt as ChartColumn, X as Inbox, dt as Clock, f as TrendingUp, ht as ChevronRight, jt as Activity, o as Users, p as TrendingDown, st as Download, vt as Check, y as Smartphone } from "../_libs/lucide-react.mjs";
import { n as useActiveTenant } from "./use-tenant-B3bhUKig.mjs";
import { n as PopoverContent, r as PopoverTrigger, t as Popover } from "./popover-C4q8I-xJ.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-BHv1JhlL.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { t as require_papaparse } from "../_libs/papaparse.mjs";
import { t as Skeleton } from "./skeleton-D9W9wFsj.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reports-DVicKLhn.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_papaparse = /* @__PURE__ */ __toESM(require_papaparse());
var getReportsData = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => d).handler(createSsrRpc("978d1ca337732fa4d503ef351127e935588871929a9a8476af57562f948ae285"));
var Table = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: "relative w-full overflow-auto",
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("table", {
		ref,
		className: cn("w-full caption-bottom text-sm", className),
		...props
	})
}));
Table.displayName = "Table";
var TableHeader = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
	ref,
	className: cn("[&_tr]:border-b", className),
	...props
}));
TableHeader.displayName = "TableHeader";
var TableBody = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
	ref,
	className: cn("[&_tr:last-child]:border-0", className),
	...props
}));
TableBody.displayName = "TableBody";
var TableFooter = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tfoot", {
	ref,
	className: cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className),
	...props
}));
TableFooter.displayName = "TableFooter";
var TableRow = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
	ref,
	className: cn("border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted", className),
	...props
}));
TableRow.displayName = "TableRow";
var TableHead = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
	ref,
	className: cn("h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]", className),
	...props
}));
TableHead.displayName = "TableHead";
var TableCell = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
	ref,
	className: cn("p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]", className),
	...props
}));
TableCell.displayName = "TableCell";
var TableCaption = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("caption", {
	ref,
	className: cn("mt-4 text-sm text-muted-foreground", className),
	...props
}));
TableCaption.displayName = "TableCaption";
var TrendsChart = import_react.lazy(() => import("./ReportsCharts-BEZcS0Ns.mjs").then((m) => ({ default: m.TrendsChart })));
var DistributionChart = import_react.lazy(() => import("./ReportsCharts-BEZcS0Ns.mjs").then((m) => ({ default: m.DistributionChart })));
function ChartsSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "w-full h-full flex flex-col justify-between py-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex-1 flex items-end gap-2 px-2 pb-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-[20%] flex-1 rounded-sm opacity-50" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-[60%] flex-1 rounded-sm opacity-50" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-[40%] flex-1 rounded-sm opacity-50" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-[80%] flex-1 rounded-sm opacity-50" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-[50%] flex-1 rounded-sm opacity-50" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-[90%] flex-1 rounded-sm opacity-50" })
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex justify-center items-center gap-6 mt-2 pt-2 border-t border-border/50",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "size-2 rounded-full" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-10" })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "size-2 rounded-full" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-10" })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "size-2 rounded-full" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-10" })]
				})
			]
		})]
	});
}
var COLORS = [
	"#ef4444",
	"#3b82f6",
	"#10b981",
	"#f59e0b",
	"#6366f1",
	"#8b5cf6",
	"#ec4899"
];
var kpiMetrics = [
	{
		key: "newContacts",
		label: "Contacts Created"
	},
	{
		key: "contactsImported",
		label: "Contacts Imported"
	},
	{
		key: "totalCampaigns",
		label: "Campaigns Sent"
	},
	{
		key: "repliesReceived",
		label: "Replies Received"
	},
	{
		key: "delivered",
		label: "Messages Delivered"
	},
	{
		key: "read",
		label: "Messages Read"
	},
	{
		key: "conversationCount",
		label: "Conversation Count"
	},
	{
		key: "sent",
		label: "Total Messages Sent"
	},
	{
		key: "failed",
		label: "Failed Messages"
	},
	{
		key: "replyRate",
		label: "Reply Rate",
		suffix: "%"
	},
	{
		key: "deliveryRate",
		label: "Delivery Rate",
		suffix: "%"
	},
	{
		key: "readRate",
		label: "Read Rate",
		suffix: "%"
	},
	{
		key: "conversationRate",
		label: "Conversion Rate",
		suffix: "%"
	},
	{
		key: "activeConversations",
		label: "Active Conversations"
	},
	{
		key: "activeCampaigns",
		label: "Active Campaigns"
	}
];
function ReportsPage() {
	const { activeId } = useActiveTenant();
	const [range, setRange] = (0, import_react.useState)("last7days");
	const [customStart, setCustomStart] = (0, import_react.useState)("");
	const [customEnd, setCustomEnd] = (0, import_react.useState)("");
	const [campaignId, setCampaignId] = (0, import_react.useState)("all");
	const [templateId, setTemplateId] = (0, import_react.useState)("all");
	const [agentId, setAgentId] = (0, import_react.useState)("all");
	const [status, setStatus] = (0, import_react.useState)("all");
	const [priority, setPriority] = (0, import_react.useState)("all");
	const [convStatus, setConvStatus] = (0, import_react.useState)("all");
	const [phone, setPhone] = (0, import_react.useState)("");
	const [tagId, setTagId] = (0, import_react.useState)("all");
	const [search, setSearch] = (0, import_react.useState)("");
	const [campaignSearch, setCampaignSearch] = (0, import_react.useState)("");
	const [compareCampaignIds, setCompareCampaignIds] = (0, import_react.useState)([]);
	const [isComparing, setIsComparing] = (0, import_react.useState)(false);
	const { data: filterOptions } = useQuery({
		queryKey: ["reports-filter-options", activeId],
		enabled: !!activeId,
		queryFn: async () => {
			const tenant = activeId;
			const [campaignsRes, templatesRes, membersRes, tagsRes] = await Promise.all([
				supabase.from("campaigns").select("id, name").eq("tenant_id", tenant).is("deleted_at", null),
				supabase.from("message_templates").select("id, template_name").eq("tenant_id", tenant).is("deleted_at", null),
				supabase.from("tenant_members").select("user_id, role, profile:profiles(id, full_name, email)").eq("tenant_id", tenant),
				supabase.from("tags").select("id, name").eq("tenant_id", tenant)
			]);
			return {
				campaigns: campaignsRes.data ?? [],
				templates: templatesRes.data ?? [],
				agents: (membersRes.data ?? []).map((m) => ({
					id: m.user_id,
					name: m.profile?.full_name || m.profile?.email || m.user_id,
					role: m.role
				})),
				tags: tagsRes.data ?? []
			};
		}
	});
	const queryInput = (0, import_react.useMemo)(() => {
		return {
			tenantId: activeId,
			dateRange: {
				range,
				customStart: range === "custom" ? customStart : void 0,
				customEnd: range === "custom" ? customEnd : void 0
			},
			filters: {
				campaignId: campaignId !== "all" ? campaignId : void 0,
				templateId: templateId !== "all" ? templateId : void 0,
				agentId: agentId !== "all" ? agentId : void 0,
				status: status !== "all" ? status : void 0,
				priority: priority !== "all" ? priority : void 0,
				conversationStatus: convStatus !== "all" ? convStatus : void 0,
				phone: phone.trim() !== "" ? phone : void 0,
				tagId: tagId !== "all" ? tagId : void 0
			}
		};
	}, [
		activeId,
		range,
		customStart,
		customEnd,
		campaignId,
		templateId,
		agentId,
		status,
		priority,
		convStatus,
		phone,
		tagId
	]);
	const { data: analytics, isLoading, refetch } = useQuery({
		queryKey: ["reports-analytics", queryInput],
		enabled: !!activeId,
		queryFn: () => getReportsData({ data: queryInput }),
		refetchInterval: 1e4
	});
	function exportCSV(tableData, filename) {
		if (!tableData.length) return;
		const csv = import_papaparse.default.unparse(tableData);
		const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
		const link = document.createElement("a");
		link.href = URL.createObjectURL(blob);
		link.setAttribute("download", `${filename}_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.csv`);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}
	function handlePDFExport() {
		window.print();
	}
	function resetAllFilters() {
		setCampaignId("all");
		setTemplateId("all");
		setAgentId("all");
		setStatus("all");
		setPriority("all");
		setConvStatus("all");
		setPhone("");
		setTagId("all");
	}
	const filteredCampaigns = (0, import_react.useMemo)(() => {
		const list = analytics?.campaignPerformance ?? [];
		if (!campaignSearch.trim()) return list;
		const s = campaignSearch.toLowerCase();
		return list.filter((c) => c.name.toLowerCase().includes(s) || c.templateName.toLowerCase().includes(s));
	}, [analytics?.campaignPerformance, campaignSearch]);
	const sortedCampaigns = (0, import_react.useMemo)(() => {
		return [...filteredCampaigns].sort((a, b) => b.sent - a.sent);
	}, [filteredCampaigns]);
	const comparedCampaignsList = (0, import_react.useMemo)(() => {
		if (!analytics?.campaignPerformance) return [];
		return analytics.campaignPerformance.filter((c) => compareCampaignIds.includes(c.id));
	}, [analytics?.campaignPerformance, compareCampaignIds]);
	if (isLoading || !analytics) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-center justify-between",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-8 w-48 bg-muted animate-pulse rounded-lg" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-4 w-64 bg-muted animate-pulse rounded-lg" })]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 md:grid-cols-3 gap-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-40 bg-muted animate-pulse rounded-xl col-span-1 md:col-span-3" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
				children: Array.from({ length: 12 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-28 bg-muted animate-pulse rounded-xl" }, i))
			})
		]
	});
	const { kpis, deliveryFunnel, messageStatusDistribution, campaignPerformance, messageTrend, topTemplates, conversationAnalytics, agentPerformance, failureAnalysis, contactAnalytics, geoAnalytics, realtimeMonitor, healthScore, role } = analytics;
	const isPrivileged = role === "owner" || role === "admin" || role === "manager";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8 pb-12 print:p-0 print:space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl md:text-3xl font-semibold tracking-tight",
					children: "Reports 2.0"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground mt-1",
					children: "Enterprise-grade delivery and conversation analytics."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "icon",
							onClick: () => refetch(),
							className: "size-9",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-4 text-muted-foreground" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: range,
							onValueChange: setRange,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: "w-[160px] h-9 bg-card",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Date range" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "today",
									children: "Today"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "yesterday",
									children: "Yesterday"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "last7days",
									children: "Last 7 Days"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "last30days",
									children: "Last 30 Days"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "thismonth",
									children: "This Month"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "lastmonth",
									children: "Last Month"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "custom",
									children: "Custom Range"
								})
							] })]
						}),
						range === "custom" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "date",
									value: customStart,
									onChange: (e) => setCustomStart(e.target.value),
									className: "h-9 w-[130px]"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted-foreground",
									children: "to"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "date",
									value: customEnd,
									onChange: (e) => setCustomEnd(e.target.value),
									className: "h-9 w-[130px]"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								size: "sm",
								className: "h-9 gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Funnel, { className: "size-4" }),
									"Filters",
									(campaignId !== "all" || templateId !== "all" || agentId !== "all" || status !== "all" || priority !== "all" || convStatus !== "all" || phone.trim() !== "" || tagId !== "all") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "destructive",
										className: "ml-1 px-1.5 py-0.5 text-[10px]",
										children: "Active"
									})
								]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PopoverContent, {
							className: "w-80 p-4 space-y-4 bg-popover border border-border shadow-xl rounded-xl",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between border-b pb-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-semibold",
									children: "Filter Analytics"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: resetAllFilters,
									className: "text-[10px] text-primary hover:underline font-medium",
									children: "Reset All"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-[10px] uppercase font-bold text-muted-foreground",
											children: "Campaign"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											value: campaignId,
											onChange: (e) => setCampaignId(e.target.value),
											className: "w-full h-8 rounded-lg border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "all",
												children: "All Campaigns"
											}), filterOptions?.campaigns.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: c.id,
												children: c.name
											}, c.id))]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-[10px] uppercase font-bold text-muted-foreground",
											children: "Template"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											value: templateId,
											onChange: (e) => setTemplateId(e.target.value),
											className: "w-full h-8 rounded-lg border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "all",
												children: "All Templates"
											}), filterOptions?.templates.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: t.id,
												children: t.template_name
											}, t.id))]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-[10px] uppercase font-bold text-muted-foreground",
											children: "Assigned Agent"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											value: agentId,
											onChange: (e) => setAgentId(e.target.value),
											className: "w-full h-8 rounded-lg border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "all",
												children: "All Agents"
											}), filterOptions?.agents.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: a.id,
												children: a.name
											}, a.id))]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-[10px] uppercase font-bold text-muted-foreground",
											children: "Chat Priority"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											value: priority,
											onChange: (e) => setPriority(e.target.value),
											className: "w-full h-8 rounded-lg border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "all",
													children: "All Priorities"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "low",
													children: "Low"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "medium",
													children: "Medium"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "high",
													children: "High"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "urgent",
													children: "Urgent"
												})
											]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-[10px] uppercase font-bold text-muted-foreground",
											children: "Chat Status"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											value: convStatus,
											onChange: (e) => setConvStatus(e.target.value),
											className: "w-full h-8 rounded-lg border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "all",
													children: "All Statuses"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "open",
													children: "Open"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "pending",
													children: "Pending"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "resolved",
													children: "Resolved"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "closed",
													children: "Closed"
												})
											]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-[10px] uppercase font-bold text-muted-foreground",
											children: "Contact Tag"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											value: tagId,
											onChange: (e) => setTagId(e.target.value),
											className: "w-full h-8 rounded-lg border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "all",
												children: "All Tags"
											}), filterOptions?.tags.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: t.id,
												children: t.name
											}, t.id))]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-[10px] uppercase font-bold text-muted-foreground",
											children: "Phone Number / Search Keyword"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "text",
											value: phone,
											onChange: (e) => setPhone(e.target.value),
											placeholder: "Enter phone or text…",
											className: "h-8 text-xs"
										})]
									})
								]
							})]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: "",
							onValueChange: (val) => {
								if (val === "pdf") handlePDFExport();
								if (val === "csv-campaigns") exportCSV(campaignPerformance, "campaigns_report");
								if (val === "csv-templates") exportCSV(topTemplates, "templates_report");
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectTrigger, {
								className: "w-[130px] h-9 bg-card",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4 mr-2" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Export" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "csv-campaigns",
									children: "CSV Campaigns"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "csv-templates",
									children: "CSV Templates"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "pdf",
									children: "Print / PDF"
								})
							] })]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 lg:grid-cols-3 gap-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-6 bg-card border-border flex flex-col items-center justify-center text-center space-y-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative size-32 flex items-center justify-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
								className: "size-full transform -rotate-90",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
									cx: "64",
									cy: "64",
									r: "50",
									stroke: "hsl(var(--border))",
									strokeWidth: "10",
									fill: "transparent"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
									cx: "64",
									cy: "64",
									r: "50",
									stroke: "hsl(var(--primary))",
									strokeWidth: "10",
									fill: "transparent",
									strokeDasharray: "314",
									strokeDashoffset: 314 - 314 * healthScore.score / 100,
									className: "transition-all duration-1000 ease-out"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "absolute flex flex-col items-center justify-center",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-3xl font-bold tracking-tight",
									children: healthScore.score
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[10px] uppercase font-bold text-muted-foreground",
									children: "Health Score"
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-semibold text-sm",
							children: "Overall Channel Health"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground mt-1",
							children: "Calculated dynamically based on active API delivery, read triggers, and customer engagement reply rates."
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-6 bg-card border-border space-y-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-semibold text-sm",
							children: "Score Factors"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground mt-0.5",
							children: "Primary performance scores evaluated this period."
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-3",
							children: healthScore.factors.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between text-xs",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium",
										children: f.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "tabular-nums font-semibold",
										children: [f.value, "%"]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-1.5 w-full bg-muted rounded-full overflow-hidden",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "h-full bg-primary transition-all duration-500",
										style: { width: `${f.value}%` }
									})
								})]
							}, f.name))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-6 bg-card border-border space-y-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-5 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-semibold text-sm",
								children: "Insights & Recommendations"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3",
							children: [healthScore.recommendations.map((rec, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start gap-2.5 text-xs p-2.5 rounded-lg bg-primary/5 border border-primary/10",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4 text-primary mt-0.5 flex-shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground leading-normal",
									children: rec
								})]
							}, i)), healthScore.recommendations.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground italic",
								children: "No new recommendations for this period. Healthy performance!"
							})]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
				children: kpiMetrics.map(({ key, label, suffix }) => {
					const metric = kpis[key] || {
						value: 0,
						change: "0%",
						trend: "neutral"
					};
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-5 flex flex-col justify-between space-y-4 hover:border-primary/30 transition-all group",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-medium text-muted-foreground uppercase tracking-wider",
								children: label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(key === "sent" ? Send : key === "delivered" ? CircleCheck : key === "failed" ? CircleAlert : key === "read" ? Inbox : key === "activeConversations" ? Activity : key === "newContacts" ? Users : key === "contactsImported" ? Download : key === "totalCampaigns" ? ChartColumn : key === "repliesReceived" ? Inbox : key === "conversationCount" ? Smartphone : Percent, { className: "size-4 text-muted-foreground group-hover:text-primary transition-colors" })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-2xl font-bold tracking-tight tabular-nums",
								children: [metric.value.toLocaleString(), suffix]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1.5 text-xs",
								children: [
									metric.trend === "up" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
										className: "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/15 border-none px-1.5 py-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "size-3 mr-1" }), metric.change]
									}),
									metric.trend === "down" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
										className: "bg-destructive/10 text-destructive hover:bg-destructive/15 border-none px-1.5 py-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingDown, { className: "size-3 mr-1" }), metric.change]
									}),
									metric.trend === "neutral" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										className: "bg-muted text-muted-foreground border-none px-1.5 py-0",
										children: metric.change
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] text-muted-foreground",
										children: "vs prev period"
									})
								]
							})]
						})]
					}, key);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-5 border-border print:hidden relative overflow-hidden bg-primary/5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute top-0 right-0 size-24 bg-primary/10 rounded-full blur-2xl pointer-events-none" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative size-3 flex-shrink-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "relative inline-flex rounded-full h-3 w-3 bg-emerald-500" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
								className: "font-semibold text-sm flex items-center gap-1.5",
								children: ["Real-Time Monitor", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[9px] bg-emerald-500/10 text-emerald-500 font-bold px-1.5 py-0.5 rounded-full uppercase",
									children: "Live"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] text-muted-foreground",
								children: "Refreshes automatically every 10s"
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 sm:flex items-center gap-4 sm:gap-8",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-0.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] uppercase font-bold text-muted-foreground",
										children: "API Latency"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-sm font-semibold tabular-nums text-primary",
										children: [realtimeMonitor.apiLatency, "ms"]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-0.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] uppercase font-bold text-muted-foreground",
										children: "Webhook Health"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-sm font-semibold tabular-nums text-emerald-500",
										children: [realtimeMonitor.webhookHealth, "%"]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-0.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] uppercase font-bold text-muted-foreground",
										children: "Queue Length"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-sm font-semibold tabular-nums",
										children: [realtimeMonitor.queueLength, " pending"]
									})]
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-border/60",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
							className: "text-xs font-semibold text-muted-foreground mb-2",
							children: "Recent Inbound Activity"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [realtimeMonitor.recentReplies.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between text-xs p-2 rounded-lg bg-card border border-border",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "truncate pr-4 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-medium mr-1.5",
										children: [r.contactName, ":"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground",
										children: r.body
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[10px] text-muted-foreground flex-shrink-0",
									children: new Date(r.time).toLocaleTimeString("en-US", {
										hour: "2-digit",
										minute: "2-digit",
										second: "2-digit",
										hour12: false
									})
								})]
							}, i)), realtimeMonitor.recentReplies.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs text-muted-foreground italic p-2 text-center",
								children: "No recent replies found."
							})]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
							className: "text-xs font-semibold text-muted-foreground mb-2",
							children: "Recent Delivery Failures"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [realtimeMonitor.recentFailures.map((rf, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between text-xs p-2 rounded-lg bg-destructive/5 border border-destructive/10",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "truncate pr-4 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-medium text-destructive mr-1.5",
										children: [rf.campaignName, ":"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground",
										children: rf.error
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[10px] text-muted-foreground flex-shrink-0",
									children: new Date(rf.time).toLocaleTimeString("en-US", {
										hour: "2-digit",
										minute: "2-digit",
										second: "2-digit",
										hour12: false
									})
								})]
							}, i)), realtimeMonitor.recentFailures.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs text-muted-foreground italic p-2 text-center",
								children: "No recent failures logged. Good health!"
							})]
						})] })]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				defaultValue: "trends",
				className: "w-full",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
						className: "bg-muted p-1 rounded-xl mb-4 print:hidden",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "trends",
							className: "rounded-lg text-xs",
							children: "Trends & Funnel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "statuses",
							className: "rounded-lg text-xs",
							children: "Message Statuses"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "trends",
						className: "space-y-6",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-1 lg:grid-cols-3 gap-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
								className: "p-6 bg-card border-border lg:col-span-2 space-y-6",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "font-semibold text-sm",
									children: "Delivery & Response Trends"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground mt-0.5",
									children: "Interaction volumes plotted over the selected dates."
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-[300px] w-full",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
										fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartsSkeleton, {}),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendsChart, { messageTrend })
									})
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
								className: "p-6 bg-card border-border flex flex-col justify-between space-y-6",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "font-semibold text-sm",
									children: "Delivery Conversion Funnel"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground mt-0.5",
									children: "Progressive step drop-offs for dispatches."
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "space-y-3.5 flex-1 flex flex-col justify-center",
									children: deliveryFunnel.map((f, idx) => {
										const widthPct = 100 - idx * 10;
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center justify-between text-xs",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-medium",
													children: f.step
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center gap-2",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-semibold tabular-nums",
														children: f.count.toLocaleString()
													}), idx > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
														variant: "destructive",
														className: "bg-destructive/10 text-destructive border-none px-1.5 py-0 text-[10px]",
														children: [
															"-",
															f.dropoff,
															"%"
														]
													})]
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "h-7 bg-primary/10 rounded-lg flex items-center px-3 border border-primary/20 text-[10px] font-bold text-primary transition-all duration-500",
												style: { width: `${widthPct}%` },
												children: [f.percentage, "%"]
											})]
										}, f.step);
									})
								})]
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "statuses",
						className: "space-y-6",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-1 lg:grid-cols-3 gap-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
								className: "p-6 bg-card border-border flex flex-col items-center justify-center text-center space-y-6",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "font-semibold text-sm",
										children: "Status Distribution"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground mt-0.5",
										children: "Ratio of current message statuses."
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "h-[240px] w-full flex items-center justify-center",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
											fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartsSkeleton, {}),
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DistributionChart, {
												messageStatusDistribution,
												colors: COLORS
											})
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "grid grid-cols-2 gap-x-4 gap-y-2 text-xs w-full text-left",
										children: messageStatusDistribution.filter((d) => d.count > 0).map((d, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "size-2.5 rounded-full",
													style: { backgroundColor: COLORS[index % COLORS.length] }
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-muted-foreground text-[11px] truncate flex-1",
													children: d.status
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "font-semibold tabular-nums text-[11px]",
													children: [
														d.count,
														" (",
														d.percentage,
														"%)"
													]
												})
											]
										}, d.status))
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
								className: "p-6 bg-card border-border lg:col-span-2 space-y-6",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "font-semibold text-sm",
									children: "Status Analysis Details"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground mt-0.5",
									children: "Detailed aggregates of meta messaging statuses."
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
										className: "text-xs",
										children: "Message Status"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
										className: "text-xs text-right",
										children: "Messages Count"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
										className: "text-xs text-right",
										children: "Ratio Percentage"
									})
								] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: messageStatusDistribution.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "text-xs font-semibold",
										children: row.status
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "text-xs text-right tabular-nums",
										children: row.count.toLocaleString()
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
										className: "text-xs text-right tabular-nums",
										children: [row.percentage, "%"]
									})
								] }, row.status)) })] })]
							})]
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "print:hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-6 bg-card border-border space-y-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between border-b pb-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-semibold text-sm",
							children: "Campaign Comparison"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground mt-0.5",
							children: "Compare side-by-side performance of key campaigns."
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => {
								setIsComparing(!isComparing);
								setCompareCampaignIds([]);
							},
							className: "text-xs h-8",
							children: isComparing ? "Close Compare" : "Compare Campaigns"
						})]
					}), isComparing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-3 p-3 rounded-lg bg-muted/40 border text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold text-muted-foreground self-center mr-2",
									children: "Select to compare:"
								}),
								filterOptions?.campaigns.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "flex items-center gap-2 cursor-pointer bg-card px-2.5 py-1.5 rounded-md border hover:border-primary/30",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "checkbox",
										checked: compareCampaignIds.includes(c.id),
										onChange: (e) => {
											if (e.target.checked) setCompareCampaignIds([...compareCampaignIds, c.id]);
											else setCompareCampaignIds(compareCampaignIds.filter((id) => id !== c.id));
										},
										className: "accent-primary"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium text-xs",
										children: c.name
									})]
								}, c.id)),
								filterOptions?.campaigns.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted-foreground italic",
									children: "No campaigns found."
								})
							]
						}), comparedCampaignsList.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
							children: comparedCampaignsList.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
								className: "p-4 bg-card border-primary/20 shadow-md space-y-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between border-b pb-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-bold text-sm truncate",
										children: c.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "outline",
										className: "text-[10px]",
										children: c.status
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5 text-xs",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground",
												children: "Recipients:"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-semibold tabular-nums",
												children: c.recipients
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground",
												children: "Sent:"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-semibold tabular-nums",
												children: c.sent
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground",
												children: "Delivered Rate:"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "font-bold text-blue-500 tabular-nums",
												children: [c.deliveryRate, "%"]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground",
												children: "Read Rate:"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "font-bold text-emerald-500 tabular-nums",
												children: [c.readRate, "%"]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground",
												children: "Reply Rate:"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "font-bold text-amber-500 tabular-nums",
												children: [c.replyRate, "%"]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground",
												children: "Failures:"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-semibold text-destructive tabular-nums",
												children: c.failures
											})]
										})
									]
								})]
							}, c.id))
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground italic text-center p-6 border border-dashed rounded-lg",
							children: "Check checkboxes above to select campaigns for side-by-side comparison."
						})]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-6 bg-card border-border space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-semibold text-sm",
						children: "Campaign Performance"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground mt-0.5",
						children: "Overview of individual campaign outcomes and metrics."
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-center gap-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "text",
							placeholder: "Search campaigns…",
							value: campaignSearch,
							onChange: (e) => setCampaignSearch(e.target.value),
							className: "h-8 text-xs w-[180px]"
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-lg border overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "text-xs",
							children: "Campaign Name"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "text-xs",
							children: "Template"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "text-xs text-right",
							children: "Recipients"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "text-xs text-right",
							children: "Sent"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "text-xs text-right",
							children: "Delivered"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "text-xs text-right",
							children: "Read"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "text-xs text-right",
							children: "Replies"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "text-xs text-right",
							children: "Failures"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "text-xs text-right",
							children: "Delivery %"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "text-xs text-right",
							children: "Read %"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "text-xs text-right",
							children: "Reply %"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "text-xs",
							children: "Status"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "text-xs",
							children: "Started At"
						})
					] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [sortedCampaigns.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-xs font-semibold",
							children: c.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-xs text-muted-foreground truncate max-w-[120px]",
							children: c.templateName
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-xs text-right tabular-nums",
							children: c.recipients
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-xs text-right tabular-nums",
							children: c.sent
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-xs text-right tabular-nums",
							children: c.delivered
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-xs text-right tabular-nums",
							children: c.read
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-xs text-right tabular-nums",
							children: c.replies
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-xs text-right tabular-nums text-destructive",
							children: c.failures
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
							className: "text-xs text-right font-medium tabular-nums text-blue-500",
							children: [c.deliveryRate, "%"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
							className: "text-xs text-right font-medium tabular-nums text-emerald-500",
							children: [c.readRate, "%"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
							className: "text-xs text-right font-medium tabular-nums text-amber-500",
							children: [c.replyRate, "%"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-xs uppercase",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: c.status === "completed" ? "outline" : "default",
								className: "text-[9px] px-1 py-0 font-bold",
								children: c.status
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-xs text-muted-foreground",
							children: c.startedAt ? new Date(c.startedAt).toLocaleDateString() : "-"
						})
					] }, c.id)), sortedCampaigns.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						colSpan: 13,
						className: "text-xs text-center text-muted-foreground py-6",
						children: "No campaigns matching filters."
					}) })] })] })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 lg:grid-cols-2 gap-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-6 bg-card border-border space-y-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-semibold text-sm",
						children: "Top Performing Templates"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground mt-0.5",
						children: "Templates ranked by incoming customer reply conversion."
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rounded-lg border overflow-x-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "text-xs",
								children: "Template Name"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "text-xs text-right",
								children: "Sent"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "text-xs text-right",
								children: "Replies"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "text-xs text-right",
								children: "Read %"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "text-xs text-right",
								children: "Reply %"
							})
						] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [topTemplates.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "text-xs font-semibold truncate max-w-[150px]",
								children: row.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "text-xs text-right tabular-nums",
								children: row.sent
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "text-xs text-right tabular-nums",
								children: row.replies
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
								className: "text-xs text-right font-medium tabular-nums text-emerald-500",
								children: [row.readRate, "%"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
								className: "text-xs text-right font-bold tabular-nums text-primary",
								children: [row.replyRate, "%"]
							})
						] }, row.name)), topTemplates.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							colSpan: 5,
							className: "text-xs text-center text-muted-foreground py-6",
							children: "No template data found."
						}) })] })] })
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-6 bg-card border-border space-y-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-semibold text-sm",
						children: "Agent Performance"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground mt-0.5",
						children: "Assigned chats and customer service metrics (Supervisors only)."
					})] }), isPrivileged ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rounded-lg border overflow-x-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "text-xs",
								children: "Agent"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "text-xs text-right font-medium",
								children: "Assigned"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "text-xs text-right font-medium",
								children: "Pending"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "text-xs text-right font-medium",
								children: "Resolved"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "text-xs text-right font-medium",
								children: "Avg Resp"
							})
						] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [agentPerformance.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
								className: "text-xs font-semibold flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `size-1.5 rounded-full ${row.onlineStatus === "online" ? "bg-emerald-500" : row.onlineStatus === "away" ? "bg-amber-400" : "bg-muted"}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "truncate max-w-[120px]",
									children: row.name
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "text-xs text-right tabular-nums",
								children: row.assignedChats
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "text-xs text-right tabular-nums",
								children: row.pending
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "text-xs text-right tabular-nums text-emerald-500 font-medium",
								children: row.resolved
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
								className: "text-xs text-right tabular-nums font-medium",
								children: [row.avgResponseTime, "m"]
							})
						] }, row.agentId)), agentPerformance.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							colSpan: 5,
							className: "text-xs text-center text-muted-foreground py-6",
							children: "No agent performance metrics logged."
						}) })] })] })
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground italic text-center p-6 border border-dashed rounded-lg bg-muted/20",
						children: "🔒 You have insufficient permissions to view workspace agent performance metrics. Reach out to your Administrator."
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 lg:grid-cols-3 gap-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-6 bg-card border-border lg:col-span-2 space-y-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-semibold text-sm",
						children: "Delivery Failure Reasons"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground mt-0.5",
						children: "Top causes of campaign delivery failures on Meta API."
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rounded-lg border overflow-x-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "text-xs",
								children: "Reason"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "text-xs text-center",
								children: "Code"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "text-xs text-right",
								children: "Count"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "text-xs",
								children: "Suggested Resolution"
							})
						] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [failureAnalysis.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "text-xs font-semibold text-destructive max-w-[150px] truncate",
								children: row.reason
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "text-xs text-center tabular-nums",
								children: row.code
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "text-xs text-right tabular-nums font-semibold",
								children: row.count
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "text-xs text-muted-foreground",
								children: row.resolution
							})
						] }, row.reason)), failureAnalysis.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							colSpan: 4,
							className: "text-xs text-center text-emerald-500 py-6 font-semibold",
							children: "🎉 No delivery failures recorded in this period!"
						}) })] })] })
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-6 bg-card border-border space-y-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-semibold text-sm",
						children: "Contact Engagement"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground mt-0.5",
						children: "Audit contact frequency and return stats."
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-4 text-xs",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between border-b pb-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: "Returning Contacts:"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold tabular-nums",
									children: contactAnalytics.returningContacts
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between border-b pb-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: "Contacts Replied:"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold tabular-nums",
									children: contactAnalytics.contactsReplied
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between border-b pb-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: "Inactive Contacts (30d):"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold text-destructive tabular-nums",
									children: contactAnalytics.inactiveContacts
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2 pt-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold text-[11px] uppercase tracking-wider text-muted-foreground",
									children: "Most Active Contacts"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [contactAnalytics.mostActiveContacts.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between p-2 rounded-lg bg-muted/40 border",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-medium truncate max-w-[150px]",
											children: c.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "font-semibold text-primary",
											children: [c.count, " replies"]
										})]
									}, c.id)), contactAnalytics.mostActiveContacts.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground italic text-center py-2",
										children: "No active contacts."
									})]
								})]
							})
						]
					})]
				})]
			}),
			geoAnalytics.topCountries.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-6 bg-card border-border space-y-4 print:hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-5 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-semibold text-sm",
						children: "Geographical Distribution"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground mt-0.5",
						children: "Volume breakdown by country codes."
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-2 md:grid-cols-4 gap-4",
					children: geoAnalytics.topCountries.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-3 bg-muted/30 border rounded-lg flex items-center justify-between text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-semibold",
							children: ["🌍 ", c.name]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-muted-foreground font-semibold tabular-nums",
							children: [c.count, " contacts"]
						})]
					}, c.name))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-6 bg-card border-border space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-semibold text-sm",
					children: "Operational Conversational Metrics"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground mt-0.5",
					children: "Average reply loops, durations, and resolution times."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-1 sm:grid-cols-3 gap-6 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-4 bg-muted/20 border rounded-xl space-y-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex justify-center text-primary",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-2xl font-bold tracking-tight tabular-nums",
									children: [conversationAnalytics.avgFirstResponseTime, "m"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground font-medium uppercase tracking-wider",
									children: "Average First Response"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-4 bg-muted/20 border rounded-xl space-y-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex justify-center text-primary",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-2xl font-bold tracking-tight tabular-nums",
									children: [conversationAnalytics.avgResolutionTime, "m"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground font-medium uppercase tracking-wider",
									children: "Average Resolution Time"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-4 bg-muted/20 border rounded-xl space-y-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex justify-center text-primary",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-2xl font-bold tracking-tight tabular-nums",
									children: [conversationAnalytics.avgConversationDuration, "m"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground font-medium uppercase tracking-wider",
									children: "Average Conversation Duration"
								})
							]
						})
					]
				})]
			})
		]
	});
}
//#endregion
export { ReportsPage as component };
