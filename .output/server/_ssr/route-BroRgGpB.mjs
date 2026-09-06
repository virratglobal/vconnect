import { o as __toESM } from "../_runtime.mjs";
import { y as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { f as Outlet, g as Link, l as useLocation, v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as supabase } from "./client-Cx80Vihe.mjs";
import { n as useAuth, t as AuthProvider } from "./use-auth-xGd_AUkc.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { t as Button } from "./button-OuFjfcpS.mjs";
import { t as Input } from "./input-CITjGSX3.mjs";
import { i as useQueryClient, n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { B as Menu, C as Send, Mt as TriangleAlert, R as MessageSquare, S as Settings, Vt as CircleQuestionMark, W as LogOut, Wt as ChartColumn, b as Shield, nt as FileText, o as Users, pt as ChevronsUpDown, q as LayoutDashboard, vt as Check, w as Search, wt as Bell } from "../_libs/lucide-react.mjs";
import { n as useActiveTenant, t as canManage } from "./use-tenant-B3bhUKig.mjs";
import { a as DropdownMenuSeparator, i as DropdownMenuLabel, n as DropdownMenuContent, o as DropdownMenuTrigger, r as DropdownMenuItem, t as DropdownMenu } from "./dropdown-menu-DXMm4jWj.mjs";
import { t as useBranding } from "./use-branding-UdiGE1Ur.mjs";
import { a as useNotificationSound } from "./use-notification-sound-BtekCotn.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/route-BroRgGpB.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AppShell({ children }) {
	const [mobileOpen, setMobileOpen] = (0, import_react.useState)(false);
	const { activeId, tenants } = useActiveTenant();
	const qc = useQueryClient();
	const [stopping, setStopping] = (0, import_react.useState)(false);
	const isImpersonating = typeof window !== "undefined" && localStorage.getItem("wa-crm.impersonator") === "true";
	const activeOrganizationName = tenants.find((t) => t.tenant_id === activeId)?.tenants.name ?? "Organization";
	async function handleStopImpersonation() {
		if (!activeId) return;
		setStopping(true);
		try {
			const { error } = await supabase.rpc("stop_impersonating_tenant", { _tenant_id: activeId });
			if (error) throw error;
			localStorage.removeItem("wa-crm.impersonator");
			await qc.invalidateQueries({ queryKey: ["my-tenants"] });
			toast.success("Impersonation ended.");
			window.location.href = "/super-admin";
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Failed to stop impersonation");
		} finally {
			setStopping(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen flex flex-col bg-background",
		children: [isImpersonating && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "bg-amber-600 text-white text-xs font-medium px-4 py-2 flex items-center justify-between gap-4 z-50 sticky top-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-1.5 truncate",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "truncate",
					children: [
						"Impersonating Organization: ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: activeOrganizationName }),
						" (Super Admin Mode)"
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: handleStopImpersonation,
				disabled: stopping,
				className: "bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-[11px] font-semibold px-2.5 py-1 rounded transition border border-white/25 shrink-0 disabled:opacity-50",
				children: stopping ? "Stopping…" : "Return to Super Admin"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex-1 flex min-h-0",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
					className: "hidden md:flex w-[260px] flex-col border-r border-sidebar-border bg-sidebar",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarContent, { onNavigate: () => setMobileOpen(false) })
				}),
				mobileOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "md:hidden fixed inset-0 z-50 flex",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute inset-0 bg-black/40",
						onClick: () => setMobileOpen(false)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
						className: "relative w-[260px] bg-sidebar border-r border-sidebar-border flex flex-col",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarContent, { onNavigate: () => setMobileOpen(false) })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1 flex flex-col min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopNav, { onMenuClick: () => setMobileOpen(true) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
						className: "flex-1 overflow-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mx-auto max-w-[1400px] px-4 md:px-8 py-6 md:py-8",
							children
						})
					})]
				})
			]
		})]
	});
}
function SidebarContent({ onNavigate }) {
	const location = useLocation();
	const { user } = useAuth();
	const { tenants, activeId, switchTenant, membership } = useActiveTenant();
	const active = tenants.find((t) => t.tenant_id === activeId);
	const { branding } = useBranding();
	const { data: profile } = useQuery({
		queryKey: ["my-profile", user?.id],
		enabled: !!user,
		queryFn: async () => {
			const { data } = await supabase.from("profiles").select("is_super_admin").eq("id", user.id).single();
			return data;
		}
	});
	const isSuper = profile?.is_super_admin;
	const hasAccessToTemplates = canManage(membership?.role, "manager") || isSuper;
	const dynamicNav = activeId ? [
		{
			to: "/dashboard",
			label: "Dashboard",
			icon: LayoutDashboard,
			exact: true
		},
		{
			to: "/contacts",
			label: "Contacts",
			icon: Users
		},
		...hasAccessToTemplates ? [{
			to: "/templates",
			label: "Templates",
			icon: FileText
		}] : [],
		{
			to: "/campaigns",
			label: "Campaigns",
			icon: Send
		},
		{
			to: "/conversations",
			label: "Conversations",
			icon: MessageSquare
		},
		{
			to: "/reports",
			label: "Reports",
			icon: ChartColumn
		},
		...canManage(membership?.role, "manager") || isSuper ? [{
			to: "/settings",
			label: "Settings",
			icon: Settings
		}] : []
	] : [
		{
			to: "/dashboard",
			label: "Home",
			icon: LayoutDashboard,
			exact: true
		},
		{
			to: "/organization",
			label: "Organization",
			icon: Users
		},
		{
			to: "/account-settings",
			label: "Account Settings",
			icon: Settings
		},
		{
			to: "/help",
			label: "Help",
			icon: CircleQuestionMark
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-16 px-4 flex items-center border-b border-sidebar-border",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/dashboard",
				className: "flex items-center gap-2",
				onClick: onNavigate,
				children: branding?.company_logo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: branding.company_logo,
					alt: branding.company_name || "CONVEXA",
					className: "h-11 max-w-[180px] object-contain",
					fetchPriority: "high"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: "/logo.png",
					alt: "CONVEXA",
					className: "h-11 max-w-[180px] object-contain",
					fetchPriority: "high"
				})
			})
		}),
		activeId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "px-3 py-3 border-b border-sidebar-border",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuTrigger, {
				className: "w-full flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm hover:bg-sidebar-accent",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-left min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-medium truncate",
						children: active?.tenants.name ?? "Organization"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs text-muted-foreground capitalize",
						children: membership?.role
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronsUpDown, { className: "size-4 text-muted-foreground shrink-0" })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
				align: "start",
				className: "w-[230px]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuLabel, { children: "Organizations" }), tenants.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
					onClick: () => switchTenant(t.tenant_id),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "flex-1 truncate",
						children: t.tenants.name
					}), t.tenant_id === activeId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4 text-primary" })]
				}, t.tenant_id))]
			})] })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
			className: "flex-1 px-3 py-3 space-y-0.5 overflow-y-auto",
			children: [dynamicNav.map((item) => {
				const Icon = item.icon;
				const isActive = item.exact ? location.pathname === item.to : location.pathname === item.to || location.pathname.startsWith(item.to + "/");
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: item.to,
					onClick: onNavigate,
					viewTransition: true,
					className: cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors", isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-[18px] shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.label })]
				}, item.to);
			}), isSuper && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/super-admin",
				onClick: onNavigate,
				viewTransition: true,
				className: cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors mt-4 pt-4 border-t border-sidebar-border", location.pathname === "/super-admin" || location.pathname.startsWith("/super-admin/") ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "size-[18px] shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Super Admin" })]
			})]
		})
	] });
}
function TopNav({ onMenuClick }) {
	const { user, signOut } = useAuth();
	const [notifCount, setNotifCount] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		if (!user?.id) return;
		const assignChannel = supabase.channel(`assign-notif:${user.id}`).on("postgres_changes", {
			event: "UPDATE",
			schema: "public",
			table: "conversations"
		}, (payload) => {
			const newRow = payload.new;
			const oldRow = payload.old;
			if (newRow?.assigned_to === user.id && oldRow?.assigned_to !== user.id) {
				toast.success("📩 A conversation has been assigned to you.", {
					description: "Open Conversations to view it.",
					duration: 6e3
				});
				setNotifCount((c) => c + 1);
			}
		}).subscribe();
		const mentionChannel = supabase.channel(`mention-notif:${user.id}`).on("postgres_changes", {
			event: "INSERT",
			schema: "public",
			table: "conversation_internal_notes"
		}, (payload) => {
			const note = payload.new;
			if ((Array.isArray(note?.mentions) ? note.mentions : []).includes(user.id) && note?.author_id !== user.id) {
				toast.info("💬 You were mentioned in an internal note.", {
					description: "Open the conversation to view it.",
					duration: 6e3
				});
				setNotifCount((c) => c + 1);
			}
		}).subscribe();
		return () => {
			supabase.removeChannel(assignChannel);
			supabase.removeChannel(mentionChannel);
		};
	}, [user?.id]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "h-16 border-b border-border bg-card sticky top-0 z-30 flex items-center px-4 md:px-6 gap-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: onMenuClick,
				className: "md:hidden p-2 -ml-2 rounded-lg hover:bg-muted",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-5" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "hidden md:flex flex-1 max-w-md relative",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					placeholder: "Search contacts, campaigns…",
					className: "pl-9 bg-background"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex-1" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				className: "p-2 rounded-lg hover:bg-muted relative",
				"aria-label": "Notifications",
				onClick: () => setNotifCount(0),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-5 text-muted-foreground" }), notifCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "absolute top-1 right-1 size-4 min-w-[1rem] rounded-full bg-primary text-[9px] font-bold text-primary-foreground flex items-center justify-center leading-none",
					children: notifCount > 9 ? "9+" : notifCount
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
				className: "size-9 rounded-full bg-primary text-primary-foreground grid place-items-center text-sm font-medium",
				children: (user?.email?.[0] ?? "U").toUpperCase()
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
				align: "end",
				className: "w-56",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuLabel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-sm font-medium truncate",
						children: user?.email
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs text-muted-foreground",
						children: "Signed in"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/account-settings",
							className: "w-full cursor-pointer flex items-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "size-4 mr-2" }), " Account Settings"]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
						onClick: () => signOut(),
						className: "cursor-pointer",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-4 mr-2" }), " Sign out"]
					})
				]
			})] })
		]
	});
}
function AuthGate() {
	const { user, loading } = useAuth();
	const { tenants, activeId, isLoading: tenantLoading } = useActiveTenant();
	useNotificationSound(activeId);
	const navigate = useNavigate();
	const location = useLocation();
	(0, import_react.useEffect)(() => {
		if (!loading && !user) navigate({
			to: "/auth",
			replace: true
		});
	}, [
		user,
		loading,
		navigate
	]);
	const { data: profile, isLoading: profileLoading } = useQuery({
		queryKey: ["my-profile", user?.id],
		enabled: !!user,
		queryFn: async () => {
			const { data } = await supabase.from("profiles").select("is_super_admin").eq("id", user.id).single();
			return data;
		}
	});
	const { data: ownerEmail, isLoading: ownerEmailLoading } = useQuery({
		queryKey: ["active-tenant-owner-email", activeId],
		enabled: !!activeId,
		queryFn: async () => {
			const { data: tm } = await supabase.from("tenant_members").select("user_id").eq("tenant_id", activeId).eq("role", "owner").maybeSingle();
			if (!tm?.user_id) return null;
			const { data: p } = await supabase.from("profiles").select("email").eq("id", tm.user_id).maybeSingle();
			return p?.email ?? null;
		}
	});
	(0, import_react.useEffect)(() => {
		if (!loading && !tenantLoading && user && !activeId) {
			if (![
				"/dashboard",
				"/organization",
				"/account-settings",
				"/help"
			].some((path) => location.pathname === path || location.pathname.startsWith(path + "/"))) navigate({
				to: "/dashboard",
				replace: true
			});
		}
	}, [
		activeId,
		location.pathname,
		loading,
		tenantLoading,
		user,
		navigate
	]);
	if (loading || tenantLoading || profileLoading || ownerEmailLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen grid place-items-center text-sm text-muted-foreground",
		children: "Loading organization…"
	});
	if (!user) return null;
	const hasActiveOrg = !!activeId;
	const isSuspended = (tenants.find((t) => t.tenant_id === activeId)?.tenants)?.suspended && ownerEmail !== "mail@virratglobal.com";
	const isSuper = profile?.is_super_admin;
	if (hasActiveOrg && isSuspended && !isSuper) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen bg-background flex items-center justify-center p-6 text-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "size-16 rounded-2xl bg-destructive/10 text-destructive grid place-items-center mx-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-8" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-2xl font-bold",
					children: "Organization Suspended"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted-foreground text-sm",
					children: "This organization has been suspended by a platform administrator. If you believe this is an error, please contact your administrator or support."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => supabase.auth.signOut(),
					children: "Sign Out"
				})
			]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) });
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthGate, {}) });
//#endregion
export { SplitComponent as component };
