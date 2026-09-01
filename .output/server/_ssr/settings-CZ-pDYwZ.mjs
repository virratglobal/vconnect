import { o as __toESM } from "../_runtime.mjs";
import { y as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { _ as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as useServerFn } from "./useServerFn-BqzygRuj.mjs";
import { t as supabase } from "./client-Cx80Vihe.mjs";
import { n as useAuth } from "./use-auth-xGd_AUkc.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { t as Button } from "./button-OuFjfcpS.mjs";
import { t as Input } from "./input-CITjGSX3.mjs";
import { t as Label } from "./label-BPuF5-mq.mjs";
import { t as Card } from "./card-xVPC106M.mjs";
import { i as useQueryClient, n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { Bt as CircleX, Ht as CircleCheck, It as LoaderCircle, L as Palette, Mt as TriangleAlert, R as MessageSquare, St as Bug, Y as Info, a as Volume2, at as EyeOff, i as VolumeX, it as Eye, jt as Activity, lt as Copy, o as Users, r as Webhook, vt as Check, wt as Bell, xt as Building2, z as MessageCircle } from "../_libs/lucide-react.mjs";
import { n as useActiveTenant, t as canManage } from "./use-tenant-B3bhUKig.mjs";
import { n as getOrganizationHealth } from "./dashboard-CEmpL9IX.mjs";
import { t as Progress } from "./progress-BaJBfUMd.mjs";
import { a as getWhatsAppConfig, i as getWebhookStats, n as deleteOrganization, o as saveWhatsAppConfig, r as getMetaDiagnostics } from "./settings-Bows4HpH.mjs";
import { i as setSoundVolume, n as getSoundVolume, r as setSoundEnabled, t as getSoundEnabled } from "./use-notification-sound-BtekCotn.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-CZ-pDYwZ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var tabs = [
	{
		id: "business",
		label: "General Settings",
		icon: Building2
	},
	{
		id: "wa_connection",
		label: "WhatsApp Connection",
		icon: MessageCircle
	},
	{
		id: "wa_diagnostics",
		label: "Diagnostics",
		icon: Activity
	},
	{
		id: "wa_webhooks",
		label: "Webhook Setup",
		icon: Webhook
	},
	{
		id: "wa_logs",
		label: "API Logs",
		icon: Bug
	},
	{
		id: "users",
		label: "Members & Roles",
		icon: Users
	},
	{
		id: "branding",
		label: "Branding",
		icon: Palette
	},
	{
		id: "notifications",
		label: "Notifications",
		icon: Bell
	},
	{
		id: "conversations",
		label: "Conversations",
		icon: MessageSquare
	},
	{
		id: "billing",
		label: "Billing & Subscription",
		icon: Activity
	},
	{
		id: "danger",
		label: "Danger Zone",
		icon: TriangleAlert
	}
];
function SettingsPage() {
	const { user } = useAuth();
	const { membership } = useActiveTenant();
	const { data: profile } = useQuery({
		queryKey: ["my-profile-settings", user?.id],
		enabled: !!user?.id,
		queryFn: async () => {
			const { data, error } = await supabase.from("profiles").select("id, is_super_admin").eq("id", user.id).single();
			if (error) throw error;
			return data;
		}
	});
	const isSuperAdmin = profile?.is_super_admin ?? false;
	const isOwnerOrAdmin = isSuperAdmin || canManage(membership?.role, "admin");
	const isOwnerAdminManager = isSuperAdmin || canManage(membership?.role, "manager");
	if (membership && membership.role === "agent") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, {
		to: "/dashboard",
		replace: true
	});
	const filteredTabs = tabs.filter((t) => {
		if (t.id === "branding") return isOwnerOrAdmin;
		if (t.id === "conversations") return canManage(membership?.role, "admin");
		if (t.id === "billing") return isOwnerOrAdmin;
		if (t.id === "danger") return canManage(membership?.role, "owner") || isSuperAdmin;
		if (t.id === "wa_connection") return isOwnerOrAdmin;
		if (t.id === "wa_diagnostics") return isOwnerAdminManager;
		if (t.id === "wa_webhooks") return isOwnerOrAdmin;
		if (t.id === "wa_logs") return isOwnerOrAdmin;
		return true;
	});
	const [tab, setTab] = (0, import_react.useState)("business");
	(0, import_react.useEffect)(() => {
		if (!profile) return;
		if (tab === "branding" && !isOwnerOrAdmin) setTab("business");
		if (tab === "billing" && !isOwnerOrAdmin) setTab("business");
		if (tab === "danger" && !canManage(membership?.role, "owner") && !isSuperAdmin) setTab("business");
		if (tab === "wa_connection" && !isOwnerOrAdmin) setTab("business");
		if (tab === "wa_diagnostics" && !isOwnerAdminManager) setTab("business");
		if (tab === "wa_webhooks" && !isOwnerOrAdmin) setTab("business");
		if (tab === "wa_logs" && !isOwnerOrAdmin) setTab("business");
	}, [
		isSuperAdmin,
		isOwnerOrAdmin,
		isOwnerAdminManager,
		tab,
		profile,
		membership?.role
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-2xl md:text-3xl font-extrabold tracking-tight text-foreground",
			children: "Organization Settings"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground mt-1.5",
			children: "Manage your organization details, WhatsApp settings, members, branding, and integrations."
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "flex md:flex-col gap-1 overflow-x-auto",
				children: filteredTabs.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => setTab(t.id),
					className: cn("flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap text-left transition-all", tab === t.id ? "bg-primary-soft text-primary shadow-sm" : "text-muted-foreground hover:bg-muted"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(t.icon, { className: "size-4 shrink-0" }),
						" ",
						t.label
					]
				}, t.id))
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-6",
				children: [
					tab === "business" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BusinessTab, {}),
					tab === "wa_connection" && isOwnerOrAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WhatsAppConnectionTab, {}),
					tab === "wa_diagnostics" && isOwnerAdminManager && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DiagnosticsTab, {}),
					tab === "wa_webhooks" && isOwnerOrAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WebhookSetupTab, {}),
					tab === "wa_logs" && isOwnerOrAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ApiLogsTab, {}),
					tab === "users" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UsersTab, {}),
					tab === "branding" && isOwnerOrAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandingTab, { isSuperAdmin }),
					tab === "notifications" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotificationsTab, {}),
					tab === "conversations" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConversationsTab, {}),
					tab === "billing" && isOwnerOrAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BillingTab, {}),
					tab === "danger" && (canManage(membership?.role, "owner") || isSuperAdmin) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DangerZoneTab, {})
				]
			})]
		})]
	});
}
function BusinessTab() {
	const { activeId, membership } = useActiveTenant();
	const qc = useQueryClient();
	const [name, setName] = (0, import_react.useState)("");
	const [slug, setSlug] = (0, import_react.useState)("");
	const [country, setCountry] = (0, import_react.useState)("");
	const [industry, setIndustry] = (0, import_react.useState)("");
	const [timezone, setTimezone] = (0, import_react.useState)("");
	const [saving, setSaving] = (0, import_react.useState)(false);
	const canEdit = canManage(membership?.role, "admin");
	const { data: tenant, isLoading } = useQuery({
		queryKey: ["tenant-details-settings", activeId],
		enabled: !!activeId,
		queryFn: async () => {
			const { data, error } = await supabase.from("tenants").select("name, slug, country, industry, timezone").eq("id", activeId).single();
			if (error) throw error;
			return data;
		}
	});
	(0, import_react.useEffect)(() => {
		if (tenant) {
			setName(tenant.name || "");
			setSlug(tenant.slug || "");
			setCountry(tenant.country || "");
			setIndustry(tenant.industry || "");
			setTimezone(tenant.timezone || "");
		}
	}, [tenant]);
	async function save() {
		if (!activeId) return;
		setSaving(true);
		try {
			const { error } = await supabase.from("tenants").update({
				name: name.trim(),
				slug: slug.trim(),
				country: country.trim() || null,
				industry: industry.trim() || null,
				timezone: timezone.trim()
			}).eq("id", activeId);
			if (error) throw error;
			toast.success("Organization settings updated");
			await qc.invalidateQueries({ queryKey: ["my-tenants"] });
			await qc.invalidateQueries({ queryKey: ["tenant-details-settings", activeId] });
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Failed to update organization settings");
		} finally {
			setSaving(false);
		}
	}
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "p-6 space-y-4 max-w-xl animate-pulse",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-6 w-1/3 bg-muted rounded" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-4 bg-muted rounded w-full" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-10 bg-muted rounded w-full" })]
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "p-6 space-y-6 max-w-xl border-border/50 rounded-2xl shadow-sm bg-card",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
				className: "text-lg font-bold flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "size-5 text-primary" }), " Organization Details"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground mt-1",
				children: "Configure your core organization and business details."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-1 sm:grid-cols-2 gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "org-settings-name",
								children: "Organization Name"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "org-settings-name",
								value: name,
								onChange: (e) => setName(e.target.value),
								disabled: !canEdit,
								className: "rounded-xl"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "org-settings-slug",
								children: "Slug (Unique)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "org-settings-slug",
								value: slug,
								onChange: (e) => setSlug(e.target.value),
								disabled: !canEdit,
								className: "rounded-xl font-mono text-xs"
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-1 sm:grid-cols-2 gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "org-settings-country",
								children: "Country"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "org-settings-country",
								value: country,
								onChange: (e) => setCountry(e.target.value),
								disabled: !canEdit,
								className: "rounded-xl"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "org-settings-timezone",
								children: "Timezone"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "org-settings-timezone",
								value: timezone,
								onChange: (e) => setTimezone(e.target.value),
								disabled: !canEdit,
								className: "rounded-xl"
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "org-settings-industry",
							children: "Industry"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "org-settings-industry",
							placeholder: "e.g. Retail, Healthcare",
							value: industry,
							onChange: (e) => setIndustry(e.target.value),
							disabled: !canEdit,
							className: "rounded-xl"
						})]
					})
				]
			}),
			canEdit && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex justify-end pt-2 border-t border-border/50",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: save,
					disabled: saving || !name.trim() || !slug.trim(),
					className: "bg-[#CC1100] hover:bg-[#B00E00] text-white font-semibold rounded-xl",
					children: saving ? "Saving…" : "Save Changes"
				})
			})
		]
	});
}
function StatusPill({ status }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "px-2.5 py-1 rounded-full text-xs font-medium capitalize " + (status === "configured" ? "bg-primary-soft text-primary" : "bg-muted text-muted-foreground"),
		children: ["Status: ", status]
	});
}
function DiagRow({ label, value, badgeColor }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between p-3 bg-muted/50 rounded-lg text-sm border border-muted",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-muted-foreground font-medium text-xs",
			children: label
		}), badgeColor ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: cn("px-2 py-0.5 rounded text-[10px] font-semibold capitalize", badgeColor),
			children: value
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-mono font-semibold text-xs text-right truncate max-w-[200px]",
			children: value
		})]
	});
}
function WhatsAppConnectionTab() {
	const { activeId, membership } = useActiveTenant();
	const isOwner = membership?.role === "owner";
	const isOwnerOrAdmin = isOwner || membership?.role === "admin";
	const qc = useQueryClient();
	const { data: config, isLoading, refetch } = useQuery({
		queryKey: ["wa-config", activeId],
		enabled: !!activeId && isOwnerOrAdmin,
		queryFn: async () => {
			return getWhatsAppConfig({ data: { tenantId: activeId } });
		}
	});
	const [form, setForm] = (0, import_react.useState)({
		phone_number_id: "",
		waba_id: "",
		display_phone_number: "",
		access_token: ""
	});
	const [allowAdminConfig, setAllowAdminConfig] = (0, import_react.useState)(true);
	const [saving, setSaving] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (config) {
			setForm({
				phone_number_id: config.creds.phone_number_id ?? "",
				waba_id: config.creds.waba_id ?? "",
				display_phone_number: config.creds.display_phone_number ?? "",
				access_token: config.creds.access_token ?? ""
			});
			setAllowAdminConfig(config.allowAdminWhatsappConfig);
		}
	}, [config]);
	const canEdit = isOwner || membership?.role === "admin" && allowAdminConfig;
	async function handleSave() {
		if (!activeId) return;
		setSaving(true);
		try {
			if ((await saveWhatsAppConfig({ data: {
				tenantId: activeId,
				phone_number_id: form.phone_number_id,
				waba_id: form.waba_id,
				display_phone_number: form.display_phone_number,
				access_token: form.access_token,
				allowAdminWhatsappConfig: isOwner ? allowAdminConfig : void 0
			} })).success) {
				toast.success("WhatsApp credentials saved successfully!");
				qc.invalidateQueries({ queryKey: ["wa-config", activeId] });
				qc.invalidateQueries({ queryKey: ["wa-diagnostics-tab", activeId] });
				qc.invalidateQueries({ queryKey: ["org-health-diag", activeId] });
				refetch();
			}
		} catch (err) {
			toast.error(err.message || "Failed to save WhatsApp config");
		} finally {
			setSaving(false);
		}
	}
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
		className: "p-6 flex items-center justify-center min-h-[300px]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-6 animate-spin text-primary" })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "p-6 space-y-6 max-w-xl border-border/50 rounded-2xl shadow-sm bg-card",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
				className: "text-lg font-bold flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-5 text-primary" }), " WhatsApp Connection"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground mt-1",
				children: "Connect your organization's Meta Cloud API credentials. These credentials are used globally for sending campaigns and sync operations."
			})] }),
			!canEdit && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start gap-2.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-4 shrink-0 mt-0.5 text-amber-600" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Read-Only Mode:" }), " The organization Owner has disabled administrator modifications for WhatsApp credentials."]
					})]
				})
			}),
			isOwner && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start space-x-3 p-4 bg-muted/20 border border-border/50 rounded-2xl",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "checkbox",
					id: "allowAdminWhatsappConfig",
					checked: allowAdminConfig,
					onChange: (e) => setAllowAdminConfig(e.target.checked),
					className: "size-4 mt-0.5 text-primary focus:ring-primary border-muted rounded cursor-pointer"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-0.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "allowAdminWhatsappConfig",
						className: "font-semibold text-xs cursor-pointer",
						children: "Allow administrators to edit WhatsApp credentials"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[10px] text-muted-foreground",
						children: "If checked, admins can edit these credentials. Otherwise, only the Owner can make changes."
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-1 sm:grid-cols-2 gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "phone-id",
								children: "Phone Number ID"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "phone-id",
								value: form.phone_number_id,
								onChange: (e) => setForm((prev) => ({
									...prev,
									phone_number_id: e.target.value
								})),
								disabled: !canEdit,
								placeholder: "e.g. 104839201948201",
								className: "rounded-xl font-mono text-xs"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "waba-id",
								children: "WABA ID"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "waba-id",
								value: form.waba_id,
								onChange: (e) => setForm((prev) => ({
									...prev,
									waba_id: e.target.value
								})),
								disabled: !canEdit,
								placeholder: "e.g. 293810485720194",
								className: "rounded-xl font-mono text-xs"
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "display-num",
							children: "Display Phone Number"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "display-num",
							value: form.display_phone_number,
							onChange: (e) => setForm((prev) => ({
								...prev,
								display_phone_number: e.target.value
							})),
							disabled: !canEdit,
							placeholder: "e.g. +1 555-019-2834",
							className: "rounded-xl"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "access-token",
								children: "Access Token"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "access-token",
								type: "password",
								value: form.access_token,
								onChange: (e) => setForm((prev) => ({
									...prev,
									access_token: e.target.value
								})),
								disabled: !canEdit,
								placeholder: form.access_token ? "••••••••••••••••" : "Paste your Meta Access Token",
								className: "rounded-xl font-mono text-xs"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[10px] text-muted-foreground",
								children: "The access token is stored securely and never sent in plain text to the client."
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between pt-4 border-t border-border/50",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusPill, { status: config?.creds.status ?? "disconnected" }), canEdit && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: handleSave,
					disabled: saving,
					className: "bg-[#CC1100] hover:bg-[#B00E00] text-white font-semibold rounded-xl text-xs",
					children: saving ? "Saving…" : "Save credentials"
				})]
			})
		]
	});
}
function DiagnosticsTab() {
	const { activeId } = useActiveTenant();
	const { data: health, isLoading: healthLoading, refetch: refetchHealth } = useQuery({
		queryKey: ["org-health-diag", activeId],
		enabled: !!activeId,
		queryFn: async () => {
			return getOrganizationHealth({ data: { tenantId: activeId } });
		}
	});
	const { data: diag, isLoading: diagLoading, refetch: refetchDiag } = useQuery({
		queryKey: ["wa-diagnostics-tab", activeId],
		enabled: !!activeId && !!health?.connected,
		queryFn: async () => {
			const res = await getMetaDiagnostics({ data: { tenantId: activeId } });
			if (!res.ok) throw new Error(res.error);
			return res.data;
		}
	});
	const handleRefresh = () => {
		refetchHealth();
		if (health?.connected) refetchDiag();
	};
	if (healthLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
		className: "p-6 flex items-center justify-center min-h-[300px]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-6 animate-spin text-primary" })
	});
	const isSandbox = diag?.is_test_mode;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6 max-w-3xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-6 border-border/50 rounded-2xl shadow-sm bg-card space-y-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-between items-center border-b pb-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "text-base font-bold flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "size-5 text-primary" }), " Organization Health"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground mt-1",
						children: "Real-time synchronization and deliverability health status."
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "outline",
						onClick: handleRefresh,
						className: "rounded-xl text-xs font-semibold",
						children: "Refresh Health"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HealthStatusItem, {
							label: "WhatsApp Connected",
							active: health?.health.whatsappConnected
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HealthStatusItem, {
							label: "Templates Synced",
							active: health?.health.templatesSynced
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HealthStatusItem, {
							label: "Webhook Active",
							active: health?.health.webhookActive
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HealthStatusItem, {
							label: "Messages Sending",
							active: health?.health.messagesSending
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HealthStatusItem, {
							label: "Campaign Queue Healthy",
							active: health?.health.campaignQueueHealthy
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HealthStatusItem, {
							label: "Storage Healthy",
							active: health?.health.storageHealthy
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-6 border-border/50 rounded-2xl shadow-sm bg-card space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-sm font-semibold text-foreground border-b pb-2",
					children: "Connection Health Metrics"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-1 md:grid-cols-2 gap-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DiagRow, {
							label: "Display Phone Number",
							value: health?.phoneNumber || "Not configured"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DiagRow, {
							label: "Account Name",
							value: health?.accountName || "Primary Number"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DiagRow, {
							label: "Graph API Version",
							value: health?.graphApiVersion || "v20.0"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DiagRow, {
							label: "Last Sync Attempt",
							value: health?.lastSync ? new Date(health.lastSync).toLocaleString() : "Never"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DiagRow, {
							label: "Last Successful Message",
							value: health?.lastSuccessfulMessage ? new Date(health.lastSuccessfulMessage).toLocaleString() : "Never"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DiagRow, {
							label: "Last Webhook Ingest",
							value: health?.lastIncomingWebhook ? new Date(health.lastIncomingWebhook).toLocaleString() : "Never"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DiagRow, {
							label: "Last Template Sync",
							value: health?.lastTemplateSync ? new Date(health.lastTemplateSync).toLocaleString() : "Never"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DiagRow, {
							label: "Token Expiry",
							value: diag?.token_expiry_at ? new Date(diag.token_expiry_at).toLocaleString() : "Permanent / Not Checked"
						})
					]
				})]
			}),
			health?.connected && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-6 border-border/50 rounded-2xl shadow-sm bg-card space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-sm font-semibold text-foreground border-b pb-2",
					children: "Meta Cloud Diagnostics"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground mt-1",
					children: "Live status query details from the Meta Cloud platform."
				})] }), diagLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-6 text-center text-sm text-muted-foreground flex items-center justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin text-primary" }), " Querying Meta..."]
				}) : diag ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [isSandbox && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-5 mt-0.5 shrink-0 text-amber-600" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
									className: "font-semibold text-sm",
									children: "Sandbox / Test Mode Detected"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1",
									children: [
										"Your WhatsApp account is in ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Test Mode (TIER_50)" }),
										". Messages are only delivered to registered test numbers. Complete Business Verification in Meta to send to real customers."
									]
								})]
							})]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-1 md:grid-cols-2 gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DiagRow, {
								label: "Phone Status",
								value: diag.status,
								badgeColor: diag.status === "CONNECTED" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DiagRow, {
								label: "Quality Rating",
								value: diag.quality_rating,
								badgeColor: diag.quality_rating === "GREEN" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DiagRow, {
								label: "Messaging Tier",
								value: diag.messaging_limit_tier,
								badgeColor: diag.messaging_limit_tier === "TIER_50" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DiagRow, {
								label: "Business Verification",
								value: diag.code_verification_status
							})
						]
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "p-4 text-center text-xs text-red-600 bg-red-50 rounded-xl",
					children: "Failed to query live Meta Cloud metrics. Please check connection status and access token validity."
				})]
			})
		]
	});
}
function HealthStatusItem({ label, active }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "p-4 bg-muted/20 border border-border/50 rounded-2xl flex items-center justify-between",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-xs font-semibold text-foreground",
			children: label
		}), active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4 text-emerald-600 shrink-0" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "size-4 text-red-500 shrink-0" })]
	});
}
function WebhookSetupTab() {
	const { activeId, membership } = useActiveTenant();
	const qc = useQueryClient();
	const isOwner = membership?.role === "owner";
	const { data: creds } = useQuery({
		queryKey: ["wa-creds-webhooks", activeId],
		enabled: !!activeId,
		queryFn: async () => {
			const { data } = await supabase.from("whatsapp_credentials").select("*").eq("tenant_id", activeId).eq("is_default", true).maybeSingle();
			return data;
		}
	});
	const { data: verifyToken } = useQuery({
		queryKey: ["webhook-verify-token-webhooks", activeId],
		enabled: !!activeId && isOwner,
		queryFn: async () => {
			const { data, error } = await supabase.rpc("get_webhook_verify_token", { _tenant: activeId });
			if (error) return "";
			return data ?? "";
		}
	});
	const { data: webhookStats, refetch: refetchWebhookStats } = useQuery({
		queryKey: ["webhook-stats-webhooks", activeId],
		enabled: !!activeId,
		queryFn: async () => getWebhookStats({ data: { tenantId: activeId } })
	});
	const [testingWebhook, setTestingWebhook] = (0, import_react.useState)(false);
	const [showVerifyToken, setShowVerifyToken] = (0, import_react.useState)(false);
	async function handleTestWebhook() {
		if (!creds?.phone_number_id) {
			toast.error("Please configure your WhatsApp Credentials before testing the webhook.");
			return;
		}
		setTestingWebhook(true);
		try {
			const simulatedPayload = {
				object: "whatsapp_business_account",
				entry: [{
					id: creds.waba_id || "WABA_ID_TEST",
					changes: [{
						value: {
							messaging_product: "whatsapp",
							metadata: {
								display_phone_number: creds.display_phone_number || "15555555555",
								phone_number_id: creds.phone_number_id
							},
							statuses: [{
								id: `wamid.TEST_SIMULATION_${Math.random().toString(36).substring(2, 15).toUpperCase()}`,
								status: "delivered",
								timestamp: Math.floor(Date.now() / 1e3).toString(),
								recipient_id: "15555555555"
							}]
						},
						field: "messages"
					}]
				}]
			};
			const response = await fetch("/api/public/hooks/meta-whatsapp", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(simulatedPayload)
			});
			if (!response.ok) {
				const text = await response.text();
				throw new Error(text || `Server error: ${response.status}`);
			}
			toast.success("Webhook simulation sent successfully!");
			refetchWebhookStats();
			qc.invalidateQueries({ queryKey: ["org-health-diag", activeId] });
			qc.invalidateQueries({ queryKey: ["webhook-events-list-api-logs", activeId] });
		} catch (e) {
			toast.error(`Failed to send test webhook: ${e.message}`);
		} finally {
			setTestingWebhook(false);
		}
	}
	const webhookUrl = typeof window !== "undefined" ? window.location.origin + "/api/public/hooks/meta-whatsapp" : "/api/public/hooks/meta-whatsapp";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "p-6 space-y-6 max-w-2xl border-border/50 rounded-2xl shadow-sm bg-card",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
				className: "text-lg font-bold flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Webhook, { className: "size-5 text-primary" }), " Meta Webhook Configuration"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground mt-1",
				children: "Set up and test your integration with the Meta WhatsApp Cloud API webhooks."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Webhook URL" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								readOnly: true,
								value: webhookUrl,
								className: "font-mono text-xs bg-muted/50 rounded-xl"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "icon",
								title: "Copy Webhook URL",
								onClick: () => {
									navigator.clipboard.writeText(webhookUrl);
									toast.success("Webhook URL copied to clipboard!");
								},
								className: "rounded-xl",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-4" })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[10px] text-muted-foreground",
							children: "Copy this URL into the Meta Developer Console under your WhatsApp Product settings."
						})
					]
				}), isOwner ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Verify Token" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									readOnly: true,
									type: showVerifyToken ? "text" : "password",
									value: verifyToken || "",
									className: "font-mono text-xs bg-muted/50 rounded-xl"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									size: "icon",
									title: showVerifyToken ? "Hide Verify Token" : "Show Verify Token",
									onClick: () => setShowVerifyToken(!showVerifyToken),
									className: "rounded-xl",
									children: showVerifyToken ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-4" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									size: "icon",
									title: "Copy Verify Token",
									onClick: () => {
										if (verifyToken) {
											navigator.clipboard.writeText(verifyToken);
											toast.success("Verify Token copied to clipboard!");
										}
									},
									className: "rounded-xl",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-4" })
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[10px] text-muted-foreground",
							children: "This token is auto-generated for your organization. Paste it into the Meta App Dashboard exactly as shown."
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "p-3 bg-muted/30 border rounded-xl text-xs text-muted-foreground",
					children: "Verify Token is only visible to organization Owners."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-4 border rounded-2xl bg-muted/20 space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-xs font-semibold text-foreground",
					children: "Simulate Webhook Pipeline"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] text-muted-foreground mt-0.5",
					children: "Trigger a simulated webhook payload to test if the CRM processes status updates correctly."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: handleTestWebhook,
					disabled: testingWebhook || !creds?.phone_number_id,
					className: "w-full rounded-xl font-semibold",
					children: testingWebhook ? "Simulating Webhook..." : "Test Webhook Simulation"
				})]
			})
		]
	});
}
function ApiLogsTab() {
	const { activeId } = useActiveTenant();
	const [showApiKey, setShowApiKey] = (0, import_react.useState)(false);
	const [mockApiKey, setMockApiKey] = (0, import_react.useState)(() => {
		return "vr_live_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
	});
	const { data: webhookEvents, isLoading: eventsLoading, refetch: refetchEvents } = useQuery({
		queryKey: ["webhook-events-list-api-logs", activeId],
		enabled: !!activeId,
		queryFn: async () => {
			const { data, error } = await supabase.from("webhook_events").select("id, event_type, created_at, processed_at, error, source").eq("tenant_id", activeId).order("created_at", { ascending: false }).limit(20);
			if (error) throw error;
			return data ?? [];
		},
		refetchInterval: 5e3
	});
	function handleRegenerateApiKey() {
		if (confirm("Are you sure you want to regenerate your API Key? All existing integrations using the old key will stop working.")) {
			setMockApiKey("vr_live_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
			toast.success("New API key generated successfully");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "p-6 space-y-4 border-border/50 rounded-2xl shadow-sm bg-card max-w-2xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
				className: "text-lg font-bold flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Webhook, { className: "size-5 text-primary" }), " Programmatic API Keys"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground mt-1",
				children: "API keys allow you to send template messages programmatically from your external applications."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4 pt-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Active API Key" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									readOnly: true,
									type: showApiKey ? "text" : "password",
									value: mockApiKey,
									className: "font-mono text-xs bg-muted/30 rounded-xl"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									onClick: () => setShowApiKey(!showApiKey),
									className: "rounded-xl shrink-0 text-xs font-semibold",
									children: showApiKey ? "Hide" : "Show"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									onClick: () => {
										navigator.clipboard.writeText(mockApiKey);
										toast.success("API key copied to clipboard");
									},
									className: "rounded-xl shrink-0 text-xs font-semibold",
									children: "Copy"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[10px] text-muted-foreground",
							children: "Keep this key secure. Never expose it in public client-side code."
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex justify-end border-t pt-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						onClick: handleRegenerateApiKey,
						className: "rounded-xl text-xs font-semibold",
						children: "Regenerate API Key"
					})
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "p-6 border-border/50 rounded-2xl shadow-sm bg-card space-y-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex justify-between items-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-bold text-sm",
					children: "Webhook Events Log"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] text-muted-foreground mt-0.5",
					children: "Live ingest log of events delivered from Meta Cloud API."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "outline",
					onClick: () => refetchEvents(),
					className: "rounded-xl text-xs font-semibold",
					children: "Refresh Logs"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border border-border/50 rounded-xl overflow-hidden bg-background text-sm",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "min-w-full divide-y divide-border",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "bg-muted/50 font-semibold text-muted-foreground text-xs",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 text-left",
								children: "Event Type"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 text-left",
								children: "Timestamp"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 text-left",
								children: "Status"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 text-left",
								children: "Errors"
							})
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
						className: "divide-y divide-border font-mono text-xs",
						children: eventsLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							colSpan: 4,
							className: "px-4 py-6 text-center text-muted-foreground",
							children: "Loading logs..."
						}) }) : !webhookEvents || webhookEvents.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							colSpan: 4,
							className: "px-4 py-6 text-center text-muted-foreground font-sans",
							children: "No webhook events logged yet."
						}) }) : webhookEvents.map((evt) => {
							const isError = !!evt.error;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: cn(isError && "bg-red-500/5"),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-2.5 font-semibold text-foreground",
										children: evt.event_type || "—"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-2.5 text-muted-foreground",
										children: new Date(evt.created_at).toLocaleString()
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-2.5",
										children: isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "inline-flex items-center gap-1 text-red-600 font-semibold",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "size-3" }), " Failed"]
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "inline-flex items-center gap-1 text-emerald-600 font-semibold",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-3" }), " Processed"]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-2.5 text-red-600 break-all whitespace-pre-wrap max-w-xs",
										children: evt.error || "—"
									})
								]
							}, evt.id);
						})
					})]
				})
			})]
		})]
	});
}
var ROLES = [
	"owner",
	"admin",
	"manager",
	"agent"
];
function UsersTab() {
	const { activeId, membership } = useActiveTenant();
	const { user } = useAuth();
	const qc = useQueryClient();
	const isOwner = canManage(membership?.role, "owner");
	const [inviteEmail, setInviteEmail] = (0, import_react.useState)("");
	const [inviteRole, setInviteRole] = (0, import_react.useState)("agent");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const { data: members } = useQuery({
		queryKey: ["members", activeId],
		enabled: !!activeId,
		queryFn: async () => {
			const { data, error } = await supabase.from("tenant_members").select("id, role, user_id, created_at, profiles!tenant_members_user_id_profiles_fkey(email, full_name)").eq("tenant_id", activeId).order("created_at", { ascending: true });
			if (error) throw error;
			return data ?? [];
		}
	});
	async function invite() {
		if (!activeId || !inviteEmail.trim()) return;
		setBusy(true);
		try {
			const email = inviteEmail.trim().toLowerCase();
			const { data: uid, error: pErr } = await supabase.rpc("lookup_user_id_by_email", {
				_tenant: activeId,
				_email: email
			});
			if (pErr) throw pErr;
			if (!uid) {
				toast.error("No account found for that email. Ask them to sign up first.");
				return;
			}
			const profile = { id: uid };
			const { error } = await supabase.from("tenant_members").insert({
				tenant_id: activeId,
				user_id: profile.id,
				role: inviteRole
			});
			if (error) throw error;
			toast.success("Member added");
			setInviteEmail("");
			qc.invalidateQueries({ queryKey: ["members"] });
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Failed to add member");
		} finally {
			setBusy(false);
		}
	}
	async function changeRole(memberId, role, memberUserId) {
		if (memberUserId === user?.id) {
			toast.error("You cannot change your own role.");
			return;
		}
		const { error } = await supabase.from("tenant_members").update({ role }).eq("id", memberId);
		if (error) return toast.error(error.message);
		toast.success(`Role updated to ${role}`);
		qc.invalidateQueries({ queryKey: ["members"] });
		qc.invalidateQueries({ queryKey: ["agents-list"] });
	}
	async function removeMember(memberId) {
		const { error } = await supabase.from("tenant_members").delete().eq("id", memberId);
		if (error) return toast.error(error.message);
		toast.success("Member removed");
		qc.invalidateQueries({ queryKey: ["members"] });
		qc.invalidateQueries({ queryKey: ["agents-list"] });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [isOwner && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "p-6 space-y-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-lg font-semibold",
				children: "Invite member"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground mt-1",
				children: "Add an existing account to this workspace. Ask new users to sign up at the auth page first."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 md:grid-cols-[1fr_180px_auto] gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "email",
						placeholder: "teammate@company.com",
						value: inviteEmail,
						onChange: (e) => setInviteEmail(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						value: inviteRole,
						onChange: (e) => setInviteRole(e.target.value),
						className: "h-10 rounded-md border border-input bg-background px-3 text-sm capitalize",
						children: ROLES.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: r,
							children: r
						}, r))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: invite,
						disabled: busy || !inviteEmail.trim(),
						children: busy ? "Adding…" : "Add member"
					})
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "p-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
				className: "text-lg font-semibold mb-4",
				children: [
					"Team members (",
					members?.length ?? 0,
					")"
				]
			}), members && members.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "divide-y",
				children: members.map((m) => {
					const isSelf = m.user_id === user?.id;
					const displayName = m.profiles?.full_name || m.profiles?.email || m.user_id;
					const displayEmail = m.profiles?.full_name ? m.profiles?.email : null;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "py-3 flex items-center justify-between gap-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs shrink-0 uppercase",
								children: displayName.slice(0, 2)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "font-medium truncate flex items-center gap-1.5",
									children: [displayName, isSelf && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium",
										children: "You"
									})]
								}), displayEmail && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs text-muted-foreground truncate",
									children: displayEmail
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 shrink-0",
							children: [isOwner && !isSelf ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								value: m.role,
								onChange: (e) => changeRole(m.id, e.target.value, m.user_id),
								className: "h-8 rounded-md border border-input bg-background px-2 text-xs capitalize cursor-pointer",
								children: [
									"admin",
									"manager",
									"agent"
								].map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: r,
									children: r
								}, r))
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "px-2 py-0.5 rounded-full bg-primary-soft text-primary text-xs font-medium capitalize",
								children: m.role
							}), isOwner && !isSelf && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "sm",
								className: "text-destructive hover:text-destructive",
								onClick: () => removeMember(m.id),
								children: "Remove"
							})]
						})]
					}, m.id);
				})
			}) : members ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-sm text-muted-foreground py-4 text-center",
				children: "No members yet. Add teammates above."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-sm text-muted-foreground",
				children: "Loading members…"
			})]
		})]
	});
}
function BrandingTab({ isSuperAdmin }) {
	const { activeId, membership } = useActiveTenant();
	const qc = useQueryClient();
	const [brandingLevel, setBrandingLevel] = (0, import_react.useState)("default");
	const [brandingTenantId, setBrandingTenantId] = (0, import_react.useState)(null);
	const [companyName, setCompanyName] = (0, import_react.useState)("");
	const [logoUrl, setLogoUrl] = (0, import_react.useState)("");
	const [faviconUrl, setFaviconUrl] = (0, import_react.useState)("");
	const [primaryColor, setPrimaryColor] = (0, import_react.useState)("#16A34A");
	const [secondaryColor, setSecondaryColor] = (0, import_react.useState)("#F8FAFC");
	const [supportEmail, setSupportEmail] = (0, import_react.useState)("");
	const [customDomain, setCustomDomain] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [uploading, setUploading] = (0, import_react.useState)(false);
	const isOwner = isSuperAdmin || canManage(membership?.role, "admin");
	(0, import_react.useEffect)(() => {
		if (!activeId) return;
		async function loadBranding() {
			try {
				const { data, error } = await supabase.from("tenant_branding").select("*").eq("tenant_id", activeId).maybeSingle();
				if (error) throw error;
				if (data) {
					setBrandingTenantId(data.tenant_id);
					setCompanyName(data.company_name ?? "");
					setLogoUrl(data.company_logo ?? "");
					setFaviconUrl(data.favicon ?? "");
					setPrimaryColor(data.primary_color ?? "#16A34A");
					setSecondaryColor(data.secondary_color ?? "#F8FAFC");
					setSupportEmail(data.support_email ?? "");
					setBrandingLevel(data.branding_level ?? "default");
					const { data: tenantData } = await supabase.from("tenants").select("custom_domain").eq("id", data.tenant_id).maybeSingle();
					if (tenantData) setCustomDomain(tenantData.custom_domain ?? "");
				} else setCustomDomain(membership?.tenants?.custom_domain ?? "");
			} catch (err) {
				console.error("Failed to load branding:", err);
			} finally {
				setLoading(false);
			}
		}
		loadBranding();
	}, [activeId, membership]);
	async function handleSaveBranding(e) {
		e.preventDefault();
		if (!activeId) return;
		setSaving(true);
		const targetTenantId = brandingTenantId || activeId;
		try {
			const { error: tenantErr } = await supabase.from("tenants").update({
				branding_level: brandingLevel,
				custom_domain: customDomain || null
			}).eq("id", targetTenantId);
			if (tenantErr) throw tenantErr;
			const { error: brandingErr } = await supabase.from("tenant_branding").upsert({
				tenant_id: targetTenantId,
				company_name: companyName || null,
				company_logo: logoUrl || null,
				favicon: faviconUrl || null,
				primary_color: primaryColor || null,
				secondary_color: secondaryColor || null,
				support_email: supportEmail || null,
				branding_level: brandingLevel,
				updated_at: (/* @__PURE__ */ new Date()).toISOString()
			}, { onConflict: "tenant_id" });
			if (brandingErr) throw brandingErr;
			await qc.invalidateQueries({ queryKey: ["my-tenants"] });
			await qc.invalidateQueries({ queryKey: ["global-branding"] });
			toast.success("Global branding settings saved successfully!");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Failed to save branding");
		} finally {
			setSaving(false);
		}
	}
	async function handleFileChange(e, type) {
		const file = e.target.files?.[0];
		if (!file) return;
		const maxSize = type === "logo" ? 5 * 1024 * 1024 : 1 * 1024 * 1024;
		if (file.size > maxSize) {
			toast.error(`File is too large. Max size allowed is ${maxSize / (1024 * 1024)}MB.`);
			return;
		}
		if (!activeId) return;
		setUploading(true);
		try {
			const fileExt = file.name.split(".").pop();
			const filePath = `${activeId}/branding/${type}_${Date.now()}.${fileExt}`;
			const { error: uploadError } = await supabase.storage.from("branding-assets").upload(filePath, file, { upsert: true });
			if (uploadError) throw uploadError;
			const { data: { publicUrl } } = supabase.storage.from("branding-assets").getPublicUrl(filePath);
			if (type === "logo") {
				setLogoUrl(publicUrl);
				toast.success("Logo uploaded!");
			} else {
				setFaviconUrl(publicUrl);
				toast.success("Favicon uploaded!");
			}
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Upload failed");
		} finally {
			setUploading(false);
		}
	}
	async function handleResetBranding() {
		if (!activeId) return;
		if (!confirm("Are you sure you want to delete all custom branding settings and reset to default?")) return;
		setSaving(true);
		const targetTenantId = brandingTenantId || activeId;
		try {
			const { error: tenantErr } = await supabase.from("tenants").update({
				branding_level: "default",
				custom_domain: null
			}).eq("id", targetTenantId);
			if (tenantErr) throw tenantErr;
			const { error: brandingErr } = await supabase.from("tenant_branding").delete().eq("tenant_id", targetTenantId);
			if (brandingErr) throw brandingErr;
			setBrandingTenantId(null);
			setBrandingLevel("default");
			setCompanyName("");
			setLogoUrl("");
			setFaviconUrl("");
			setPrimaryColor("#16A34A");
			setSecondaryColor("#F8FAFC");
			setSupportEmail("");
			setCustomDomain("");
			await qc.invalidateQueries({ queryKey: ["my-tenants"] });
			await qc.invalidateQueries({ queryKey: ["global-branding"] });
			toast.success("Branding reset to default successfully!");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Failed to reset branding");
		} finally {
			setSaving(false);
		}
	}
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "text-sm text-muted-foreground",
		children: "Loading branding settings…"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
		className: "p-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-xl font-semibold text-foreground",
				children: "Custom Branding Settings"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground mt-1",
				children: "Configure company name, logos, favicons, and accent colors for your workspace."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: handleSaveBranding,
				className: "space-y-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-1 md:grid-cols-2 gap-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5 md:col-span-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "branding-level",
								children: "Branding Level (Feature Flag)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								id: "branding-level",
								value: brandingLevel,
								onChange: (e) => setBrandingLevel(e.target.value),
								disabled: !isOwner,
								className: "w-full h-10 px-3 border rounded-lg bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "default",
										children: "Default (Virrat Reach Branding)"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "white_label",
										children: "White Label (Custom Branding Allowed)"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "full_white_label",
										children: "Full White Label (Remove Brand Powered-by Badges)"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] text-muted-foreground",
								children: "Sets the level of white-label capability enabled for this tenant workspace subscription."
							})
						]
					}), brandingLevel !== "default" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "company-name",
								children: "Company Name"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "company-name",
								value: companyName,
								onChange: (e) => setCompanyName(e.target.value),
								disabled: !isOwner,
								placeholder: "Enter custom company name"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "support-email",
								children: "Support Email"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "support-email",
								type: "email",
								value: supportEmail,
								onChange: (e) => setSupportEmail(e.target.value),
								disabled: !isOwner,
								placeholder: "support@company.com"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "custom-domain",
								children: "Custom Domain (Future Ready)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "custom-domain",
								value: customDomain,
								onChange: (e) => setCustomDomain(e.target.value),
								disabled: !isOwner,
								placeholder: "crm.company.com"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "primary-color",
								children: "Primary Theme Color"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "primary-color",
									type: "color",
									value: primaryColor,
									onChange: (e) => setPrimaryColor(e.target.value),
									disabled: !isOwner,
									className: "w-12 h-10 p-1 cursor-pointer bg-background"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "text",
									value: primaryColor,
									onChange: (e) => setPrimaryColor(e.target.value),
									disabled: !isOwner,
									placeholder: "#16A34A",
									className: "font-mono"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "secondary-color",
								children: "Secondary Theme Color"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "secondary-color",
									type: "color",
									value: secondaryColor,
									onChange: (e) => setSecondaryColor(e.target.value),
									disabled: !isOwner,
									className: "w-12 h-10 p-1 cursor-pointer bg-background"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "text",
									value: secondaryColor,
									onChange: (e) => setSecondaryColor(e.target.value),
									disabled: !isOwner,
									placeholder: "#F8FAFC",
									className: "font-mono"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Company Logo" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "file",
									accept: "image/*",
									disabled: !isOwner || uploading,
									onChange: (e) => handleFileChange(e, "logo")
								}), logoUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "p-3 border rounded-lg bg-muted/30 w-fit flex items-center justify-center",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: logoUrl,
										alt: "Logo preview",
										className: "h-10 max-w-[200px] object-contain"
									})
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Favicon Icon" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "file",
									accept: "image/*",
									disabled: !isOwner || uploading,
									onChange: (e) => handleFileChange(e, "favicon")
								}), faviconUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "p-2 border rounded-lg bg-muted/30 w-fit flex items-center justify-center",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: faviconUrl,
										alt: "Favicon preview",
										className: "size-6 object-contain"
									})
								})]
							})]
						})
					] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "p-4 bg-muted/40 rounded-xl md:col-span-2 text-center text-xs text-muted-foreground border border-dashed",
						children: "Select \"White Label\" or \"Full White Label\" branding level to enable customization."
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col sm:flex-row gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						disabled: saving || uploading || !isOwner,
						className: "w-full sm:w-auto",
						children: saving ? "Saving branding…" : "Save Branding Settings"
					}), brandingLevel !== "default" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "destructive",
						disabled: saving || uploading || !isOwner,
						onClick: handleResetBranding,
						className: "w-full sm:w-auto",
						children: "Delete & Reset Branding"
					})]
				})]
			})]
		})
	});
}
function NotificationsTab() {
	const [soundEnabled, setSoundEnabledState] = (0, import_react.useState)(() => getSoundEnabled());
	const [volume, setVolumeState] = (0, import_react.useState)(() => getSoundVolume());
	const [saved, setSaved] = (0, import_react.useState)(false);
	function handleToggle(enabled) {
		setSoundEnabledState(enabled);
		setSaved(false);
	}
	function handleVolumeChange(v) {
		setVolumeState(v);
		setSaved(false);
	}
	function handleSave() {
		setSoundEnabled(soundEnabled);
		setSoundVolume(volume);
		setSaved(true);
		toast.success("Notification preferences saved.");
		setTimeout(() => setSaved(false), 3e3);
	}
	async function handlePreview() {
		try {
			const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
			if (!AudioCtxClass) {
				toast.error("Audio not supported in this browser.");
				return;
			}
			const ctx = new AudioCtxClass();
			if (ctx.state === "suspended") await ctx.resume();
			const master = volume / 100;
			function ping(freq, delaySeconds) {
				const osc = ctx.createOscillator();
				const env = ctx.createGain();
				osc.type = "sine";
				osc.frequency.value = freq;
				const startTime = ctx.currentTime + delaySeconds;
				env.gain.setValueAtTime(0, startTime);
				env.gain.linearRampToValueAtTime(master * .35, startTime + .008);
				env.gain.exponentialRampToValueAtTime(1e-4, startTime + .45);
				osc.connect(env);
				env.connect(ctx.destination);
				osc.start(startTime);
				osc.stop(startTime + .5);
			}
			ping(880, 0);
			ping(1108, .18);
			setTimeout(() => {
				try {
					ctx.close();
				} catch {}
			}, 900);
		} catch (err) {
			toast.error("Could not play preview sound: " + (err?.message ?? "unknown error"));
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "p-6 space-y-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "text-base font-semibold flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-4 text-primary" }), "Notification Preferences"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground mt-1",
					children: "Configure how you are alerted when customers send you new WhatsApp messages."
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between rounded-xl border border-border px-4 py-3.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-3",
							children: [soundEnabled ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-5 text-primary mt-0.5 flex-shrink-0" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-5 text-muted-foreground mt-0.5 flex-shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-semibold",
								children: "Enable Conversation Sound"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground mt-0.5",
								children: "Play a chime when a customer sends a new WhatsApp message. Sound plays only while this tab is open."
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							id: "notification-sound-toggle",
							type: "button",
							role: "switch",
							"aria-checked": soundEnabled,
							onClick: () => handleToggle(!soundEnabled),
							className: cn("relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 flex-shrink-0 ml-4", soundEnabled ? "bg-primary" : "bg-muted-foreground/30"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("inline-block size-4 rounded-full bg-white shadow-sm transition-transform", soundEnabled ? "translate-x-6" : "translate-x-1") })
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: cn("rounded-xl border border-border px-4 py-3.5 space-y-3 transition-opacity", !soundEnabled && "opacity-40 pointer-events-none"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-sm font-semibold",
									children: "Notification Volume"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-sm font-mono text-muted-foreground",
									children: [Math.round(volume), "%"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: "notification-volume-slider",
								type: "range",
								min: 0,
								max: 100,
								step: 1,
								value: volume,
								onChange: (e) => handleVolumeChange(Number(e.target.value)),
								disabled: !soundEnabled,
								className: "w-full h-2 rounded-full accent-primary cursor-pointer"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between text-xs text-muted-foreground",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Silent" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										id: "notification-sound-preview",
										onClick: handlePreview,
										disabled: !soundEnabled || volume === 0,
										className: "text-primary hover:underline disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium",
										children: "▶ Preview sound"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Max" })
								]
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "border border-border rounded-xl p-4 space-y-2 bg-muted/30",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "size-4 text-primary mt-0.5 flex-shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5 text-xs text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-medium text-foreground",
								children: "How it works"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
								className: "space-y-1 list-disc pl-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Sound plays instantly when a customer replies via WhatsApp." }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "If you have multiple browser tabs open, sound plays in only one tab." }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "No sound for campaign sends, status updates (delivered/read), or outbound messages." }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "These settings are saved per-browser and will reset if you clear site data." })
								]
							})]
						})]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					id: "notification-settings-save",
					onClick: handleSave,
					className: "h-9",
					children: saved ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4 mr-2 text-emerald-400" }), " Saved"] }) : "Save Preferences"
				})
			]
		})
	});
}
function ConversationsTab() {
	const { activeId, membership } = useActiveTenant();
	const qc = useQueryClient();
	const isAdmin = canManage(membership?.role, "admin");
	const { data: members = [] } = useQuery({
		queryKey: ["workspace-members", activeId],
		enabled: !!activeId,
		queryFn: async () => {
			const { data, error } = await supabase.from("tenant_members").select("user_id, role, profile:user_id(id, full_name, email)").eq("tenant_id", activeId);
			if (error) throw error;
			return data ?? [];
		}
	});
	const { data: settings, isLoading } = useQuery({
		queryKey: ["assignment-settings", activeId],
		enabled: !!activeId,
		queryFn: async () => {
			const { data, error } = await supabase.from("tenant_assignment_settings").select("*").eq("tenant_id", activeId).maybeSingle();
			if (error) throw error;
			return data;
		}
	});
	const [strategy, setStrategy] = (0, import_react.useState)("unassigned");
	const [defaultAgentId, setDefaultAgentId] = (0, import_react.useState)("");
	const [saving, setSaving] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (settings) {
			setStrategy(settings.strategy ?? "unassigned");
			setDefaultAgentId(settings.default_agent_id ?? "");
		}
	}, [settings]);
	async function handleSave() {
		if (!activeId) return;
		setSaving(true);
		try {
			const payload = {
				tenant_id: activeId,
				strategy,
				default_agent_id: strategy === "specific_agent" && defaultAgentId ? defaultAgentId : null
			};
			const { error } = await supabase.from("tenant_assignment_settings").upsert(payload, { onConflict: "tenant_id" });
			if (error) throw error;
			toast.success("Conversation settings saved.");
			qc.invalidateQueries({ queryKey: ["assignment-settings", activeId] });
		} catch (e) {
			toast.error("Save failed: " + e.message);
		} finally {
			setSaving(false);
		}
	}
	const strategies = [
		{
			id: "unassigned",
			label: "Unassigned",
			description: "New conversations arrive without an assignee. Managers assign manually.",
			available: true
		},
		{
			id: "round_robin",
			label: "Round Robin",
			description: "Automatically rotate new conversations evenly across all available agents.",
			available: false
		},
		{
			id: "least_active",
			label: "Least Active Agent",
			description: "Assign to the agent with the fewest open conversations.",
			available: false
		},
		{
			id: "specific_agent",
			label: "Specific Default Agent",
			description: "Always assign incoming conversations to one selected agent.",
			available: true
		},
		{
			id: "department_based",
			label: "Department Based",
			description: "Route conversations to agents based on department or team skill tags.",
			available: false
		}
	];
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
		className: "p-6 flex items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-5 animate-spin text-muted-foreground" })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "p-6 space-y-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-base font-semibold",
					children: "Conversation Settings"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground mt-1",
					children: "Control how incoming WhatsApp conversations are handled and distributed."
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-sm font-semibold",
							children: "Auto Assignment Strategy"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground mt-0.5",
							children: "Choose how new conversations are automatically assigned to agents."
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-2",
							children: strategies.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => isAdmin && s.available && setStrategy(s.id),
								disabled: !isAdmin || !s.available,
								className: cn("w-full flex items-start gap-3 text-left rounded-xl border px-4 py-3 transition-all", strategy === s.id ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30", (!isAdmin || !s.available) && "opacity-50 cursor-not-allowed"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: cn("size-4 rounded-full border-2 mt-0.5 flex-shrink-0 flex items-center justify-center", strategy === s.id ? "border-primary" : "border-muted-foreground/40"),
									children: strategy === s.id && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "size-2 rounded-full bg-primary" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex-1 min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-sm font-medium",
											children: s.label
										}), !s.available && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full",
											children: "Coming Soon"
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground mt-0.5",
										children: s.description
									})]
								})]
							}, s.id))
						}),
						strategy === "specific_agent" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5 pl-7",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "text-xs font-medium",
								children: "Default Agent"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								value: defaultAgentId,
								onChange: (e) => setDefaultAgentId(e.target.value),
								disabled: !isAdmin,
								className: "w-full h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "Select an agent…"
								}), members.filter((m) => m.role === "agent").map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: m.user_id,
									children: m.profile?.full_name || m.profile?.email || m.user_id
								}, m.user_id))]
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "border border-border rounded-xl p-4 space-y-3 bg-muted/30",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "size-4 text-primary mt-0.5 flex-shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium",
							children: "Role-Based Conversation Visibility"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground mt-0.5",
							children: "These rules are enforced at the database level (Row Level Security)."
						})] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-1.5 text-xs",
						children: [{
							role: "Owner / Admin / Manager",
							rule: "See all conversations in the workspace"
						}, {
							role: "Agent",
							rule: "See only conversations explicitly assigned to them"
						}].map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-3.5 text-emerald-500 flex-shrink-0" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-medium",
									children: [row.role, ":"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: row.rule
								})
							]
						}, row.role))
					})]
				}),
				isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: handleSave,
					disabled: saving,
					className: "h-9",
					children: saving ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 mr-2 animate-spin" }), " Saving…"] }) : "Save Settings"
				})
			]
		})
	});
}
function BillingTab() {
	const { activeId } = useActiveTenant();
	const usage = {
		messagesSent: 1482,
		messagesLimit: 1e4,
		contactsCount: 842,
		contactsLimit: 2500,
		seatsCount: 3,
		seatsLimit: 5
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "p-6 border-border/50 rounded-2xl shadow-sm bg-card max-w-2xl space-y-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-between items-start",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "text-lg font-bold flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "size-5 text-primary" }), " Subscription & Plan"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground mt-1",
						children: "Manage your billing tier, resource usage limits, and invoices."
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "bg-primary-soft text-primary text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider",
						children: "Standard Plan"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4 pt-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between text-xs font-medium",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Monthly Messages Sent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-muted-foreground",
									children: [
										usage.messagesSent.toLocaleString(),
										" / ",
										usage.messagesLimit.toLocaleString()
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
								value: usage.messagesSent / usage.messagesLimit * 100,
								className: "h-2"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between text-xs font-medium",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Active Contacts" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-muted-foreground",
									children: [
										usage.contactsCount.toLocaleString(),
										" / ",
										usage.contactsLimit.toLocaleString()
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
								value: usage.contactsCount / usage.contactsLimit * 100,
								className: "h-2"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between text-xs font-medium",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Team Seats" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-muted-foreground",
									children: [
										usage.seatsCount,
										" / ",
										usage.seatsLimit,
										" used"
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
								value: usage.seatsCount / usage.seatsLimit * 100,
								className: "h-2"
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex justify-end border-t pt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: () => toast.info("To upgrade your plan, please email billing@virratreach.com"),
						className: "bg-[#CC1100] hover:bg-[#B00E00] text-white font-semibold rounded-xl",
						children: "Upgrade Plan"
					})
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "p-6 border-border/50 rounded-2xl shadow-sm bg-card max-w-2xl space-y-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-bold text-sm",
				children: "Invoice History"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border border-border/50 rounded-xl overflow-hidden text-sm",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full text-left border-collapse",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "bg-muted/40 border-b border-border/50 text-xs font-semibold text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "p-3",
								children: "Invoice ID"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "p-3",
								children: "Date"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "p-3",
								children: "Amount"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "p-3",
								children: "Status"
							})
						]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
						className: "divide-y divide-border/50",
						children: [{
							id: "INV-2026-001",
							date: "2026-06-01",
							amount: "$49.00",
							status: "Paid"
						}, {
							id: "INV-2026-002",
							date: "2026-05-01",
							amount: "$49.00",
							status: "Paid"
						}].map((inv) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "hover:bg-muted/10 transition-colors",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "p-3 font-mono text-xs",
									children: inv.id
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "p-3 text-xs",
									children: inv.date
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "p-3 text-xs font-medium",
									children: inv.amount
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "p-3 text-xs text-emerald-600 font-semibold",
									children: inv.status
								})
							]
						}, inv.id))
					})]
				})
			})]
		})]
	});
}
function DangerZoneTab() {
	const { activeId, membership } = useActiveTenant();
	const { user } = useAuth();
	const qc = useQueryClient();
	const [confirmOrgSlug, setConfirmOrgSlug] = (0, import_react.useState)("");
	const [transferring, setTransferring] = (0, import_react.useState)(false);
	const [deleting, setDeleting] = (0, import_react.useState)(false);
	const [transferTargetId, setTransferTargetId] = (0, import_react.useState)("");
	const deleteOrgFn = useServerFn(deleteOrganization);
	const { data: members } = useQuery({
		queryKey: ["members-danger", activeId],
		enabled: !!activeId,
		queryFn: async () => {
			const { data } = await supabase.from("tenant_members").select("id, role, user_id, profiles!tenant_members_user_id_profiles_fkey(email, full_name)").eq("tenant_id", activeId);
			return data ?? [];
		}
	});
	const otherMembers = (members || []).filter((m) => m.user_id !== user?.id);
	async function handleTransferOwnership(e) {
		e.preventDefault();
		if (!activeId || !transferTargetId) return;
		if (!confirm("Are you sure you want to transfer ownership? You will lose owner privileges and become an Admin.")) return;
		setTransferring(true);
		try {
			const { error: promoErr } = await supabase.from("tenant_members").update({ role: "owner" }).eq("tenant_id", activeId).eq("user_id", transferTargetId);
			if (promoErr) throw promoErr;
			const { error: demoteErr } = await supabase.from("tenant_members").update({ role: "admin" }).eq("tenant_id", activeId).eq("user_id", user.id);
			if (demoteErr) throw demoteErr;
			toast.success("Ownership transferred successfully!");
			await qc.invalidateQueries({ queryKey: ["my-tenants"] });
			window.location.reload();
		} catch (err) {
			toast.error(err.message || "Failed to transfer ownership");
		} finally {
			setTransferring(false);
		}
	}
	async function handleDeleteOrganization() {
		if (!activeId) return;
		if (confirmOrgSlug !== membership?.tenants.slug) {
			toast.error("Organization slug does not match. Deletion aborted.");
			return;
		}
		if (!confirm(`Are you absolutely sure you want to delete "${membership?.tenants.name}"? This action is permanent and cannot be undone.`)) return;
		setDeleting(true);
		try {
			await deleteOrgFn({ data: { tenantId: activeId } });
			toast.success("Organization deleted successfully");
			localStorage.removeItem("wa-crm.active-tenant");
			await qc.invalidateQueries({ queryKey: ["my-tenants"] });
			window.location.href = "/dashboard";
		} catch (err) {
			toast.error(err.message || "Failed to delete organization");
		} finally {
			setDeleting(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "p-6 border border-warning/30 bg-warning/5 rounded-2xl shadow-sm space-y-4 max-w-2xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
				className: "text-lg font-bold flex items-center gap-2 text-warning-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-5 text-warning" }), " Transfer Organization Ownership"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground mt-1",
				children: "Promote another member to Owner. This will demote your role in this organization to Admin."
			})] }), otherMembers.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: handleTransferOwnership,
				className: "space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "transfer-target",
						children: "Select new owner"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						id: "transfer-target",
						value: transferTargetId,
						onChange: (e) => setTransferTargetId(e.target.value),
						required: true,
						className: "w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "Select a member…"
						}), otherMembers.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
							value: m.user_id,
							children: [
								m.profiles?.full_name || m.profiles?.email || m.user_id,
								" (",
								m.role,
								")"
							]
						}, m.user_id))]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					disabled: transferring || !transferTargetId,
					variant: "outline",
					className: "border-warning/50 text-warning-foreground hover:bg-warning/10 rounded-xl font-semibold",
					children: transferring ? "Transferring…" : "Transfer Ownership"
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground italic",
				children: "No other members found in this organization. Invite team members first to enable transfer."
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "p-6 border border-destructive/30 bg-destructive/5 rounded-2xl shadow-sm space-y-4 max-w-2xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
				className: "text-lg font-bold flex items-center gap-2 text-destructive",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-5 text-destructive animate-pulse" }), " Delete Organization"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground mt-1",
				children: "Permanently delete this organization, including all contacts, campaigns, logs, and credentials. This action cannot be undone."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4 pt-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
						htmlFor: "confirm-slug",
						children: [
							"Type the organization slug",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-mono bg-destructive/10 px-1.5 py-0.5 rounded text-destructive font-bold text-xs",
								children: ["/", membership?.tenants.slug]
							}),
							" ",
							"to confirm:"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "confirm-slug",
						placeholder: membership?.tenants.slug,
						value: confirmOrgSlug,
						onChange: (e) => setConfirmOrgSlug(e.target.value),
						className: "rounded-xl border-destructive/20 focus-visible:ring-destructive font-mono text-xs"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: handleDeleteOrganization,
					disabled: deleting || confirmOrgSlug !== membership?.tenants.slug,
					variant: "destructive",
					className: "rounded-xl font-semibold w-full sm:w-auto",
					children: deleting ? "Deleting…" : "Permanently Delete Organization"
				})]
			})]
		})]
	});
}
//#endregion
export { SettingsPage as component };
