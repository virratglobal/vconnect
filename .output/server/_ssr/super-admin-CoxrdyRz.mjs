import { o as __toESM } from "../_runtime.mjs";
import { y as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as useServerFn } from "./useServerFn-BqzygRuj.mjs";
import { t as supabase } from "./client-Cx80Vihe.mjs";
import { n as useAuth } from "./use-auth-xGd_AUkc.mjs";
import { t as Button } from "./button-OuFjfcpS.mjs";
import { t as Input } from "./input-CITjGSX3.mjs";
import { t as Card } from "./card-xVPC106M.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-BgKcOzjx.mjs";
import { i as useQueryClient, n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { A as PowerOff, C as Send, D as RefreshCw, Mt as TriangleAlert, R as MessageSquare, bt as Building, jt as Activity, k as Power, o as Users, u as UserCheck, w as Search, x as ShieldAlert } from "../_libs/lucide-react.mjs";
import { n as superAdminDeleteUser, r as superAdminGetUsers } from "./super-admin-DcIuJ4ql.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/super-admin-CoxrdyRz.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SuperAdminDashboard() {
	const { user } = useAuth();
	const qc = useQueryClient();
	const [activeTab, setActiveTab] = (0, import_react.useState)("tenants");
	const [search, setSearch] = (0, import_react.useState)("");
	const [statusFilter, setStatusFilter] = (0, import_react.useState)("all");
	const [impersonatingId, setImpersonatingId] = (0, import_react.useState)(null);
	const [togglingId, setTogglingId] = (0, import_react.useState)(null);
	const { data: profile, isLoading: profileLoading } = useQuery({
		queryKey: ["my-profile", user?.id],
		enabled: !!user,
		queryFn: async () => {
			const { data } = await supabase.from("profiles").select("is_super_admin").eq("id", user.id).single();
			return data;
		}
	});
	const { data: analytics, isLoading: analyticsLoading } = useQuery({
		queryKey: ["super-admin-analytics"],
		enabled: !!profile?.is_super_admin,
		queryFn: async () => {
			const { data, error } = await supabase.rpc("super_admin_get_analytics");
			if (error) throw error;
			return data;
		}
	});
	const { data: tenants, isLoading: tenantsLoading, refetch: refetchTenants } = useQuery({
		queryKey: ["super-admin-tenants"],
		enabled: !!profile?.is_super_admin,
		queryFn: async () => {
			const { data, error } = await supabase.rpc("super_admin_get_tenants");
			if (error) throw error;
			return data ?? [];
		}
	});
	const { data: errors, isLoading: errorsLoading, refetch: refetchErrors } = useQuery({
		queryKey: ["super-admin-errors"],
		enabled: !!profile?.is_super_admin,
		queryFn: async () => {
			const { data, error } = await supabase.rpc("super_admin_get_system_errors");
			if (error) throw error;
			return data ?? [];
		}
	});
	const getUsersFn = useServerFn(superAdminGetUsers);
	const deleteUserFn = useServerFn(superAdminDeleteUser);
	const { data: allUsers, isLoading: usersLoading, refetch: refetchUsers } = useQuery({
		queryKey: ["super-admin-users"],
		enabled: !!profile?.is_super_admin,
		queryFn: async () => {
			return await getUsersFn();
		}
	});
	const [deletingUserId, setDeletingUserId] = (0, import_react.useState)(null);
	async function handleDeleteUser(targetUserId, targetUserEmail) {
		if (!confirm(`Are you absolutely sure you want to permanently delete the user account "${targetUserEmail}"? This will log them out, delete their profile, and remove them from all organizations. This action is permanent and cannot be undone.`)) return;
		setDeletingUserId(targetUserId);
		try {
			await deleteUserFn({ data: { targetUserId } });
			toast.success("User account deleted successfully");
			refetchUsers();
			qc.invalidateQueries({ queryKey: ["super-admin-tenants"] });
			qc.invalidateQueries({ queryKey: ["super-admin-analytics"] });
		} catch (err) {
			toast.error(err.message || "Failed to delete user account");
		} finally {
			setDeletingUserId(null);
		}
	}
	if (profileLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-[400px] flex items-center justify-center text-sm text-muted-foreground",
		children: "Loading Super Admin Platform…"
	});
	if (!profile?.is_super_admin) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-[400px] flex items-center justify-center p-6 text-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md space-y-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "size-12 rounded-xl bg-destructive/10 text-destructive grid place-items-center mx-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "size-6" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-xl font-bold",
					children: "Access Denied"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted-foreground text-sm",
					children: "You do not have platform Super Admin permissions."
				})
			]
		})
	});
	async function toggleTenantSuspension(tenantId, currentlySuspended) {
		setTogglingId(tenantId);
		try {
			const targetStatus = !currentlySuspended;
			const { error } = await supabase.rpc("super_admin_toggle_tenant_status", {
				_tenant_id: tenantId,
				_suspended: targetStatus
			});
			if (error) throw error;
			toast.success(targetStatus ? "Tenant suspended successfully" : "Tenant activated successfully");
			qc.invalidateQueries({ queryKey: ["super-admin-tenants"] });
			qc.invalidateQueries({ queryKey: ["super-admin-analytics"] });
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Failed to change tenant status");
		} finally {
			setTogglingId(null);
		}
	}
	async function handleLoginAs(tenantId) {
		setImpersonatingId(tenantId);
		try {
			const { error } = await supabase.rpc("start_impersonating_tenant", { _tenant_id: tenantId });
			if (error) throw error;
			localStorage.setItem("wa-crm.impersonator", "true");
			localStorage.setItem("wa-crm.active-tenant", tenantId);
			await qc.invalidateQueries({ queryKey: ["my-tenants"] });
			toast.success("Impersonation started. Redirecting…");
			window.location.href = "/";
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Impersonation failed");
			setImpersonatingId(null);
		}
	}
	const filteredTenants = (tenants ?? []).filter((t) => {
		const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.slug.toLowerCase().includes(search.toLowerCase());
		if (statusFilter === "active") return matchesSearch && !t.suspended;
		if (statusFilter === "suspended") return matchesSearch && t.suspended;
		return matchesSearch;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl md:text-3xl font-semibold tracking-tight",
				children: "Super Admin Platform"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground mt-1",
				children: "Monitor workspaces, query analytics, manage suspension status, and impersonate accounts."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 lg:grid-cols-5 gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						title: "Total Tenants",
						value: analytics?.total_tenants,
						loading: analyticsLoading,
						icon: Building
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						title: "Active Tenants",
						value: analytics?.active_tenants,
						loading: analyticsLoading,
						icon: Activity
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						title: "Total Contacts",
						value: analytics?.total_contacts,
						loading: analyticsLoading,
						icon: Users
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						title: "Total Campaigns",
						value: analytics?.total_campaigns,
						loading: analyticsLoading,
						icon: Send
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						title: "Messages Sent",
						value: analytics?.total_messages_sent,
						loading: analyticsLoading,
						icon: MessageSquare
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				value: activeTab,
				onValueChange: setActiveTab,
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
						className: "bg-muted p-1 rounded-lg",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "tenants",
								children: "Tenant Management"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "users",
								children: "User Management"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "monitoring",
								children: "System Monitoring"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "tenants",
						className: "space-y-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-2 mb-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative flex-1 min-w-[200px] max-w-md",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: search,
										onChange: (e) => setSearch(e.target.value),
										placeholder: "Search by name or slug",
										className: "pl-9 bg-background"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 ml-auto",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										value: statusFilter,
										onChange: (e) => setStatusFilter(e.target.value),
										className: "h-10 rounded-md border border-input bg-background px-3 text-sm",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "all",
												children: "All Statuses"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "active",
												children: "Active Only"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "suspended",
												children: "Suspended Only"
											})
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "outline",
										size: "icon",
										onClick: () => refetchTenants(),
										"aria-label": "Refresh tenants",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-4" })
									})]
								})]
							}), tenantsLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground p-6 text-center",
								children: "Loading tenants…"
							}) : !filteredTenants.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground p-12 text-center",
								children: "No tenants found"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "overflow-x-auto border rounded-lg",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
									className: "w-full text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
										className: "bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "text-left px-4 py-3 font-medium",
												children: "Workspace Name"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "text-left px-4 py-3 font-medium",
												children: "Slug"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "text-left px-4 py-3 font-medium",
												children: "Contacts"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "text-left px-4 py-3 font-medium",
												children: "Campaigns"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "text-left px-4 py-3 font-medium",
												children: "Members"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "text-left px-4 py-3 font-medium",
												children: "Created"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "text-left px-4 py-3 font-medium",
												children: "Status"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "px-4 py-3 w-10",
												children: "Actions"
											})
										] })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
										className: "divide-y",
										children: filteredTenants.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
											className: "hover:bg-muted/30",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "px-4 py-3 font-medium",
													children: t.name
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "px-4 py-3 font-mono text-xs",
													children: t.slug
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "px-4 py-3",
													children: t.contact_count
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "px-4 py-3",
													children: t.campaign_count
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "px-4 py-3",
													children: t.member_count
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "px-4 py-3 text-muted-foreground",
													children: new Date(t.created_at).toLocaleDateString()
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "px-4 py-3",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: `px-2 py-0.5 rounded-full text-xs font-medium ${t.suspended ? "bg-destructive/10 text-destructive" : "bg-primary-soft text-primary"}`,
														children: t.suspended ? "Suspended" : "Active"
													})
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "px-4 py-3",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex gap-2",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
															variant: "outline",
															size: "sm",
															className: "text-xs",
															disabled: impersonatingId === t.id,
															onClick: () => handleLoginAs(t.id),
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserCheck, { className: "size-3.5 mr-1" }), impersonatingId === t.id ? "Entering…" : "Login"]
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
															variant: t.suspended ? "outline" : "destructive",
															size: "sm",
															className: "text-xs",
															disabled: togglingId === t.id,
															onClick: () => toggleTenantSuspension(t.id, t.suspended),
															children: t.suspended ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Power, { className: "size-3.5 mr-1 text-primary" }), "Activate"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PowerOff, { className: "size-3.5 mr-1" }), "Suspend"] })
														})]
													})
												})
											]
										}, t.id))
									})]
								})
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "users",
						className: "space-y-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-2 mb-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative flex-1 min-w-[200px] max-w-md",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: search,
										onChange: (e) => setSearch(e.target.value),
										placeholder: "Search users by name or email",
										className: "pl-9 bg-background"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex items-center gap-2 ml-auto",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "outline",
										size: "icon",
										onClick: () => refetchUsers(),
										"aria-label": "Refresh users",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-4" })
									})
								})]
							}), usersLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground p-6 text-center",
								children: "Loading users…"
							}) : !allUsers || !allUsers.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground p-12 text-center",
								children: "No users found"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "overflow-x-auto border rounded-lg",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
									className: "w-full text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
										className: "bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "text-left px-4 py-3 font-medium",
												children: "User Details"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "text-left px-4 py-3 font-medium",
												children: "Email"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "text-left px-4 py-3 font-medium",
												children: "Joined Date"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "text-left px-4 py-3 font-medium",
												children: "Organizations & Roles"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "text-left px-4 py-3 font-medium",
												children: "Type"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "px-4 py-3 w-10 text-right",
												children: "Actions"
											})
										] })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
										className: "divide-y",
										children: allUsers.filter((u) => {
											const term = search.toLowerCase().trim();
											if (!term) return true;
											return (u.full_name ?? "").toLowerCase().includes(term) || (u.email ?? "").toLowerCase().includes(term);
										}).map((u) => {
											const isSelf = u.id === user?.id;
											return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
												className: "hover:bg-muted/30",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "px-4 py-3",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "flex items-center gap-2",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
																className: "size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 uppercase",
																children: u.avatar_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
																	src: u.avatar_url,
																	alt: "",
																	className: "size-full rounded-full object-cover"
																}) : (u.full_name?.[0] || u.email?.[0] || "U").toUpperCase()
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "font-medium truncate",
																children: [u.full_name || "—", isSelf && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																	className: "ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-semibold",
																	children: "You"
																})]
															})]
														})
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "px-4 py-3 font-medium",
														children: u.email
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "px-4 py-3 text-muted-foreground",
														children: new Date(u.created_at).toLocaleDateString()
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "px-4 py-3",
														children: u.tenant_members && u.tenant_members.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
															className: "flex flex-wrap gap-1 max-w-sm",
															children: u.tenant_members.map((tm, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																className: "px-2 py-0.5 rounded bg-muted text-[10px] text-foreground font-medium border",
																children: [
																	tm.tenants?.name || "Workspace",
																	" (",
																	tm.role,
																	")"
																]
															}, i))
														}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-xs text-muted-foreground italic",
															children: "No organizations"
														})
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "px-4 py-3",
														children: u.is_super_admin ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "px-2 py-0.5 rounded-full text-xs font-semibold bg-warning/10 text-warning-foreground",
															children: "Super Admin"
														}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "px-2 py-0.5 rounded-full text-xs text-muted-foreground bg-muted",
															children: "Standard User"
														})
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "px-4 py-3 text-right",
														children: !isSelf && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
															variant: "destructive",
															size: "sm",
															disabled: deletingUserId === u.id,
															onClick: () => handleDeleteUser(u.id, u.email),
															className: "rounded-lg text-xs",
															children: deletingUserId === u.id ? "Deleting…" : "Delete Account"
														})
													})
												]
											}, u.id);
										})
									})]
								})
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "monitoring",
						className: "space-y-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between items-center mb-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
									className: "text-lg font-semibold flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-5 text-warning" }), " Recent System Errors"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "outline",
									size: "sm",
									onClick: () => refetchErrors(),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-4 mr-2" }), " Refresh"]
								})]
							}), errorsLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground p-6 text-center",
								children: "Loading logs…"
							}) : !errors?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground p-12 text-center",
								children: "No system errors logged"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "overflow-x-auto border rounded-lg",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
									className: "w-full text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
										className: "bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "text-left px-4 py-3 font-medium w-40",
												children: "Timestamp"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "text-left px-4 py-3 font-medium w-48",
												children: "Tenant Workspace"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "text-left px-4 py-3 font-medium w-36",
												children: "Type"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "text-left px-4 py-3 font-medium",
												children: "Error Description"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "text-left px-4 py-3 font-medium w-48",
												children: "Context"
											})
										] })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
										className: "divide-y",
										children: errors.map((err) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
											className: "hover:bg-muted/30",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "px-4 py-3 font-mono text-xs whitespace-nowrap",
													children: new Date(err.created_at).toLocaleString()
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "px-4 py-3 font-medium",
													children: err.tenant_name || "System Level"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "px-4 py-3 text-xs font-semibold uppercase",
													children: err.type
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "px-4 py-3 font-mono text-xs text-destructive max-w-sm break-words",
													children: err.error
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "px-4 py-3",
													children: err.context ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
														className: "cursor-pointer text-xs",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
															className: "text-primary hover:underline",
															children: "View Metadata"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
															className: "mt-1 p-2 rounded bg-muted/60 text-[10px] overflow-auto max-w-xs font-mono max-h-32",
															children: JSON.stringify(err.context, null, 2)
														})]
													}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-xs text-muted-foreground",
														children: "—"
													})
												})
											]
										}, err.id))
									})]
								})
							})]
						})
					})
				]
			})
		]
	});
}
function KpiCard({ title, value, loading, icon: Icon }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
		className: "p-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-xs text-muted-foreground uppercase tracking-wider",
				children: title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-2xl font-semibold mt-1",
				children: loading ? "…" : value !== void 0 ? value.toLocaleString() : "0"
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "size-9 rounded-lg bg-primary-soft text-primary grid place-items-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" })
			})]
		})
	});
}
//#endregion
export { SuperAdminDashboard as component };
