import { o as __toESM } from "../_runtime.mjs";
import { y as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as supabase } from "./client-DTaxocpy.mjs";
import { n as useAuth } from "./use-auth-BLya4MAJ.mjs";
import { t as Button } from "./button-OuFjfcpS.mjs";
import { t as Input } from "./input-CITjGSX3.mjs";
import { t as Label } from "./label-BPuF5-mq.mjs";
import { t as Card } from "./card-xVPC106M.mjs";
import { i as useQueryClient, n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { Bt as CircleX, C as Send, D as RefreshCw, Ht as CircleCheck, L as Palette, Nt as Sparkles, Ot as ArrowRight, Q as Globe, R as MessageSquare, Ut as CircleAlert, d as Upload, dt as Clock, j as Plus, jt as Activity, nt as FileText, o as Users, ot as ExternalLink, xt as Building2 } from "../_libs/lucide-react.mjs";
import { n as useActiveTenant } from "./use-tenant-DyGfRuCR.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-B5SRUUUO.mjs";
import { t as Skeleton } from "./skeleton-D9W9wFsj.mjs";
import { t as useBranding } from "./use-branding-CH2X2Z_g.mjs";
import { n as getOrganizationHealth } from "./dashboard-CSEZyVll.mjs";
import { t as Progress } from "./progress-BaJBfUMd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard-CX33Pioo.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PageHeader({ title, description, actions }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-wrap items-start justify-between gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-2xl md:text-3xl font-semibold tracking-tight",
			children: title
		}), description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground mt-1",
			children: description
		})] }), actions && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex gap-2",
			children: actions
		})]
	});
}
var STORAGE_KEY = "wa-crm.active-tenant";
function OnboardingDialog() {
	const { user, signOut } = useAuth();
	const qc = useQueryClient();
	const [openModal, setOpenModal] = (0, import_react.useState)(false);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [name, setName] = (0, import_react.useState)("");
	const [slug, setSlug] = (0, import_react.useState)("");
	const [companyName, setCompanyName] = (0, import_react.useState)("");
	const [industry, setIndustry] = (0, import_react.useState)("");
	const [country, setCountry] = (0, import_react.useState)("India");
	const [timezone, setTimezone] = (0, import_react.useState)("Asia/Kolkata");
	const [logo, setLogo] = (0, import_react.useState)("");
	const [brandColor, setBrandColor] = (0, import_react.useState)("#CC1100");
	const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
	(0, import_react.useEffect)(() => {
		if (name) setSlug(`${slugify(name)}-${Math.random().toString(36).slice(2, 6)}`);
		else setSlug("");
	}, [name]);
	async function handleCreate(e) {
		e.preventDefault();
		if (!user) return;
		setLoading(true);
		try {
			const finalSlug = slug.trim() || `${slugify(name)}-${Math.random().toString(36).slice(2, 6)}`;
			const { data: tenantData, error: tenantErr } = await supabase.from("tenants").insert({
				name: name.trim(),
				slug: finalSlug,
				country,
				industry: industry.trim() || null,
				timezone
			}).select().single();
			if (tenantErr) throw tenantErr;
			if (tenantData && (logo.trim() || brandColor !== "#CC1100" || companyName.trim())) {
				const { error: brandingErr } = await supabase.from("tenant_branding").insert({
					tenant_id: tenantData.id,
					company_name: companyName.trim() || name.trim(),
					company_logo: logo.trim() || null,
					primary_color: brandColor,
					secondary_color: "#1f2937"
				});
				if (brandingErr) console.error("Failed to insert branding:", brandingErr);
			}
			toast.success("Organization created successfully");
			if (tenantData) localStorage.setItem(STORAGE_KEY, tenantData.id);
			await qc.invalidateQueries({ queryKey: ["my-tenants"] });
			setOpenModal(false);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Failed to create organization");
		} finally {
			setLoading(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-background via-muted/30 to-background",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-2xl text-center space-y-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3 justify-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "size-12 rounded-2xl bg-[#CC1100] grid place-items-center text-white shadow-lg shadow-[#CC1100]/25",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "size-6" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent",
					children: "CONVEXA"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-8 md:p-12 shadow-xl border border-border/50 bg-card/80 backdrop-blur-md rounded-3xl space-y-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-3xl md:text-4xl font-extrabold tracking-tight",
							children: "Welcome to CONVEXA"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-muted-foreground text-base md:text-lg max-w-md mx-auto",
							children: "You're not part of any organization yet. Create your first organization to start using the CRM."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col sm:flex-row items-center justify-center gap-3 pt-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "lg",
							onClick: () => setOpenModal(true),
							className: "w-full sm:w-auto bg-[#CC1100] hover:bg-[#B00E00] text-white font-semibold px-8 py-6 rounded-xl shadow-lg shadow-[#CC1100]/20 gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-5" }), "Create Organization"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "lg",
							variant: "outline",
							disabled: true,
							className: "w-full sm:w-auto font-semibold px-8 py-6 rounded-xl border-dashed",
							children: "Join Organization (Coming Soon)"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-center items-center gap-6 pt-6 text-sm border-t border-border/50",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: "https://convexa.virratglobal.com",
								target: "_blank",
								rel: "noreferrer",
								className: "text-muted-foreground hover:text-foreground flex items-center gap-1 transition",
								children: ["Learn More ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-3.5" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-border",
								children: "|"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => signOut(),
								className: "text-muted-foreground hover:text-destructive transition font-medium",
								children: "Sign Out"
							})
						]
					})
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open: openModal,
			onOpenChange: setOpenModal,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
				className: "max-w-lg rounded-3xl p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
					className: "text-xl font-bold flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "size-5 text-[#CC1100]" }), " Create your organization"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Organizations are independent entities that own all CRM data, members, and billing details." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: handleCreate,
					className: "space-y-4 py-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5 col-span-2 sm:col-span-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "org-name",
									children: "Organization Name"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "org-name",
									placeholder: "Acme Marketing",
									value: name,
									onChange: (e) => setName(e.target.value),
									required: true,
									className: "rounded-xl"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5 col-span-2 sm:col-span-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "org-slug",
									children: "Slug (Unique)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "org-slug",
									placeholder: "acme-marketing",
									value: slug,
									onChange: (e) => setSlug(slugify(e.target.value)),
									required: true,
									className: "rounded-xl font-mono text-xs"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5 col-span-2 sm:col-span-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "company-name",
									children: "Company Name (Optional)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "company-name",
									placeholder: "Acme Technologies Inc.",
									value: companyName,
									onChange: (e) => setCompanyName(e.target.value),
									className: "rounded-xl"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5 col-span-2 sm:col-span-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "org-industry",
									children: "Industry (Optional)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "org-industry",
									placeholder: "E-commerce, Retail",
									value: industry,
									onChange: (e) => setIndustry(e.target.value),
									className: "rounded-xl"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5 col-span-2 sm:col-span-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
									htmlFor: "org-country",
									className: "flex items-center gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, { className: "size-3.5" }), " Country"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "org-country",
									value: country,
									onChange: (e) => setCountry(e.target.value),
									required: true,
									className: "rounded-xl"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5 col-span-2 sm:col-span-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
									htmlFor: "org-timezone",
									className: "flex items-center gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-3.5" }), " Timezone"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "org-timezone",
									value: timezone,
									onChange: (e) => setTimezone(e.target.value),
									required: true,
									className: "rounded-xl"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5 col-span-2 sm:col-span-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "org-logo",
									children: "Logo URL (Optional)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "org-logo",
									placeholder: "https://example.com/logo.png",
									value: logo,
									onChange: (e) => setLogo(e.target.value),
									className: "rounded-xl"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5 col-span-2 sm:col-span-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
									htmlFor: "org-color",
									className: "flex items-center gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Palette, { className: "size-3.5" }), " Brand Color"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "org-color-picker",
										type: "color",
										value: brandColor,
										onChange: (e) => setBrandColor(e.target.value),
										className: "w-12 h-10 p-1 rounded-xl cursor-pointer shrink-0"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "org-color",
										value: brandColor,
										onChange: (e) => setBrandColor(e.target.value),
										className: "rounded-xl font-mono text-xs uppercase"
									})]
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
							className: "pt-4 border-t border-border/50 gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "ghost",
								onClick: () => setOpenModal(false),
								className: "rounded-xl font-semibold",
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								disabled: loading || !name.trim(),
								className: "bg-[#CC1100] hover:bg-[#B00E00] text-white font-semibold rounded-xl",
								children: loading ? "Creating…" : "Create Organization"
							})]
						})
					]
				})]
			})
		})]
	});
}
function formatRelativeTime(date) {
	const diffMs = Date.now() - date.getTime();
	const diffMins = Math.floor(diffMs / 6e4);
	if (diffMins < 1) return "Just now";
	if (diffMins < 60) return `${diffMins} minutes ago`;
	const diffHours = Math.floor(diffMins / 60);
	if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
	return date.toLocaleDateString();
}
function Dashboard() {
	const { activeId, membership } = useActiveTenant();
	const { branding } = useBranding();
	const { data: kpis, isLoading: isKpisLoading } = useQuery({
		queryKey: ["dashboard-kpis", activeId],
		enabled: !!activeId,
		queryFn: async () => {
			const [contacts, campaigns, sent, failed] = await Promise.all([
				supabase.from("contacts").select("*", {
					count: "exact",
					head: true
				}).is("deleted_at", null).eq("tenant_id", activeId),
				supabase.from("campaigns").select("*", {
					count: "exact",
					head: true
				}).is("deleted_at", null).eq("tenant_id", activeId),
				supabase.from("campaign_recipients").select("*", {
					count: "exact",
					head: true
				}).eq("status", "sent").eq("tenant_id", activeId),
				supabase.from("campaign_recipients").select("*", {
					count: "exact",
					head: true
				}).eq("status", "failed").eq("tenant_id", activeId)
			]);
			return {
				contacts: contacts.count ?? 0,
				campaigns: campaigns.count ?? 0,
				sent: sent.count ?? 0,
				failed: failed.count ?? 0
			};
		}
	});
	const { data: recent } = useQuery({
		queryKey: ["recent-campaigns", activeId],
		enabled: !!activeId,
		queryFn: async () => {
			const { data } = await supabase.from("campaigns").select("id, name, status, total_recipients, processed_count, created_at").is("deleted_at", null).eq("tenant_id", activeId).order("created_at", { ascending: false }).limit(5);
			return data ?? [];
		}
	});
	const { data: health, isLoading: isHealthLoading } = useQuery({
		queryKey: ["dashboard-health", activeId],
		enabled: !!activeId,
		queryFn: async () => {
			return getOrganizationHealth({ data: { tenantId: activeId } });
		}
	});
	const { data: activities } = useQuery({
		queryKey: ["dashboard-activities", activeId],
		enabled: !!activeId,
		queryFn: async () => {
			const tenant = activeId;
			const [campaigns, imports, contacts, templates] = await Promise.all([
				supabase.from("campaigns").select("name, status, created_at, completed_at, total_recipients").eq("tenant_id", tenant).is("deleted_at", null).order("created_at", { ascending: false }).limit(3),
				supabase.from("contact_imports").select("source_type, imported_rows, created_at").eq("tenant_id", tenant).order("created_at", { ascending: false }).limit(3),
				supabase.from("contacts").select("name, phone_number_normalized, created_at").eq("tenant_id", tenant).is("deleted_at", null).order("created_at", { ascending: false }).limit(3),
				supabase.from("message_templates").select("template_name, last_sync_at").eq("tenant_id", tenant).order("last_sync_at", { ascending: false }).limit(3)
			]);
			const items = [];
			(campaigns.data ?? []).forEach((c, idx) => {
				items.push({
					id: `campaign-create-${idx}`,
					type: "campaign",
					title: "Campaign Created",
					desc: `Campaign "${c.name}" was configured`,
					time: new Date(c.created_at)
				});
				if (c.status === "completed" && c.completed_at) items.push({
					id: `campaign-complete-${idx}`,
					type: "success",
					title: "Campaign Completed",
					desc: `Campaign "${c.name}" completed successfully`,
					time: new Date(c.completed_at)
				});
			});
			(imports.data ?? []).forEach((imp, idx) => {
				items.push({
					id: `import-${idx}`,
					type: "contact",
					title: "Contacts Imported",
					desc: `${imp.imported_rows} contacts added via ${imp.source_type === "csv" ? "CSV" : "Bulk"}`,
					time: new Date(imp.created_at)
				});
			});
			(contacts.data ?? []).forEach((c, idx) => {
				items.push({
					id: `contact-${idx}`,
					type: "contact",
					title: "Contact Added",
					desc: `Contact ${c.name || c.phone_number_normalized} saved`,
					time: new Date(c.created_at)
				});
			});
			(templates.data ?? []).forEach((t, idx) => {
				if (t.last_sync_at) items.push({
					id: `template-${idx}`,
					type: "template",
					title: "Template Synced",
					desc: `Template "${t.template_name}" synced from Meta`,
					time: new Date(t.last_sync_at)
				});
			});
			items.sort((a, b) => b.time.getTime() - a.time.getTime());
			if (items.length === 0) {
				items.push({
					id: "mock-1",
					type: "success",
					title: "Campaign Completed",
					desc: "Campaign \"Real Estate Leads\" completed successfully",
					time: /* @__PURE__ */ new Date(Date.now() - 7200 * 1e3)
				}, {
					id: "mock-2",
					type: "template",
					title: "Template Synced",
					desc: "12 templates synced from Meta",
					time: /* @__PURE__ */ new Date(Date.now() - 1500 * 1e3)
				}, {
					id: "mock-3",
					type: "contact",
					title: "Contacts Imported",
					desc: "145 contacts imported via CSV",
					time: /* @__PURE__ */ new Date(Date.now() - 720 * 1e3)
				}, {
					id: "mock-4",
					type: "campaign",
					title: "Campaign Sent",
					desc: "Campaign \"Summer Offer\" sent to 250 contacts",
					time: /* @__PURE__ */ new Date(Date.now() - 120 * 1e3)
				});
				items.sort((a, b) => b.time.getTime() - a.time.getTime());
			}
			return items.slice(0, 5);
		}
	});
	if (!activeId) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OnboardingDialog, {});
	const cards = [
		{
			label: "Total Contacts",
			value: kpis?.contacts,
			icon: Users,
			tone: "primary"
		},
		{
			label: "Total Campaigns",
			value: kpis?.campaigns,
			icon: Send,
			tone: "info"
		},
		{
			label: "Messages Sent To Meta",
			value: kpis?.sent,
			icon: CircleCheck,
			tone: "success"
		},
		{
			label: "Failed Messages",
			value: kpis?.failed,
			icon: CircleX,
			tone: "destructive"
		}
	];
	const RecentActivityCard = () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "p-5 flex flex-col h-fit bg-white",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex justify-between items-center mb-4 pb-2 border-b",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-semibold text-sm tracking-tight text-foreground",
					children: "Recent Activity"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-4 text-primary" })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative border-l pl-4 ml-2 space-y-5 py-1",
				children: activities?.map((act) => {
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative group transition-all",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "absolute -left-[25px] top-1 rounded-full p-1 bg-background border text-muted-foreground group-hover:text-primary group-hover:border-primary transition-colors",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(act.type === "campaign" ? Send : act.type === "contact" ? Users : act.type === "template" ? FileText : act.type === "success" ? CircleCheck : CircleAlert, { className: "size-2.5" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-0.5 hover:bg-primary-soft/30 p-1.5 rounded transition-all",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs font-semibold text-foreground",
									children: act.title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] text-muted-foreground leading-normal",
									children: act.desc
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[10px] text-muted-foreground/80 mt-1",
									children: formatRelativeTime(act.time)
								})
							]
						})]
					}, act.id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "sm",
				className: "w-full mt-4 text-xs font-medium text-primary hover:text-primary/90",
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/campaigns",
					children: ["View All Activity ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-3.5 ml-1" })]
				})
			})
		]
	});
	const OrganizationHealthCard = () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "p-5 flex flex-col h-fit bg-white",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex justify-between items-center mb-4 pb-2 border-b",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-semibold text-sm tracking-tight text-foreground",
					children: "Organization Health"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "size-4 text-primary animate-pulse" })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3 mb-5 border-b pb-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground flex items-center gap-1.5",
							children: "WhatsApp Connected"
						}), health?.health?.whatsappConnected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-emerald-600 font-semibold flex items-center gap-1",
							children: "✅ Connected"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-destructive font-semibold flex items-center gap-1",
							children: "❌ Disconnected"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground",
							children: "Templates Synced"
						}), health?.health?.templatesSynced ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-emerald-600 font-semibold flex items-center gap-1",
							children: [
								"✅ Synced (",
								health?.templatesCount,
								")"
							]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-amber-600 font-semibold flex items-center gap-1",
							children: "⚠️ Not Synced"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground",
							children: "Webhook Active"
						}), health?.health?.webhookActive ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-emerald-600 font-semibold flex items-center gap-1",
							children: "✅ Active"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-destructive font-semibold flex items-center gap-1",
							children: "❌ Inactive"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground",
							children: "Messages Sending"
						}), health?.health?.messagesSending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-emerald-600 font-semibold flex items-center gap-1",
							children: "✅ Healthy"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-amber-600 font-semibold flex items-center gap-1",
							children: "⚠️ No Sends"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground",
							children: "Campaign Queue"
						}), health?.health?.campaignQueueHealthy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-emerald-600 font-semibold flex items-center gap-1",
							children: "✅ Healthy"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-destructive font-semibold flex items-center gap-1",
							children: "⚠️ Stuck Jobs"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground",
							children: "Storage Health"
						}), health?.health?.storageHealthy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-emerald-600 font-semibold flex items-center gap-1",
							children: "✅ Healthy"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-destructive font-semibold flex items-center gap-1",
							children: "❌ Issue"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2.5 text-[11px] text-muted-foreground border-b pb-4 mb-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between items-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Active Number" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium text-foreground",
							children: health?.phoneNumber
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between items-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Account Name" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium text-foreground",
							children: health?.accountName
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between items-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "API Version" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium text-foreground",
							children: health?.graphApiVersion
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between items-center border-t pt-2.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Last Sync" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium text-foreground",
							children: health?.lastSync ? formatRelativeTime(new Date(health.lastSync)) : "Never"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between items-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Last Successful Send" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium text-foreground",
							children: health?.lastSuccessfulMessage ? formatRelativeTime(new Date(health.lastSuccessfulMessage)) : "Never"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between items-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Last Webhook Inbound" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium text-foreground",
							children: health?.lastIncomingWebhook ? formatRelativeTime(new Date(health.lastIncomingWebhook)) : "Never"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3.5 text-xs",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-between items-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-muted-foreground",
						children: "Sent Today"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-medium text-foreground",
						children: [health?.sentToday, " Messages"]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5 border-t pt-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between text-[11px]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground font-medium",
							children: "Success Rate"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-semibold text-primary",
							children: [health?.successRate, "%"]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
						value: health?.successRate,
						className: "h-1.5"
					})]
				})]
			})
		]
	});
	const QuickActionsCard = () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "p-5 flex flex-col h-fit bg-white",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
			className: "font-semibold text-sm tracking-tight text-foreground mb-4 pb-2 border-b",
			children: "Quick Actions"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-2.5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "w-full h-10 rounded-lg bg-[#CC1100] hover:bg-[#B00E00] text-white gap-2 font-medium",
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/campaigns",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), " New Campaign"]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					className: "w-full h-10 rounded-lg bg-background text-foreground gap-2 font-medium border-input hover:bg-muted",
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/contacts",
						search: { add: "true" },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-4" }), " Add Contact"]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					className: "w-full h-10 rounded-lg bg-background text-foreground gap-2 font-medium border-input hover:bg-muted",
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/contacts/import",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "size-4" }), " Import CSV"]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					className: "w-full h-10 rounded-lg bg-background text-foreground gap-2 font-medium border-input hover:bg-muted",
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/templates",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-4" }), " Sync Templates"]
					})
				})
			]
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: `Welcome back${membership ? ", " + membership.tenants.name : ""}`,
			description: `Snapshot of your ${branding?.company_name || "Virrat Reach"} activity.`
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-1 lg:grid-cols-10 gap-8 items-start",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "lg:col-span-7 flex flex-col gap-8 order-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 order-1",
						children: cards.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
							className: "p-5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs text-muted-foreground leading-none",
									children: c.label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-2 text-2xl font-semibold tracking-tight",
									children: isKpisLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-7 w-12" }) : (c.value ?? 0).toLocaleString()
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "size-9 rounded-xl grid place-items-center " + (c.tone === "destructive" ? "bg-destructive-soft text-destructive" : c.tone === "info" ? "bg-info-soft text-info" : "bg-primary-soft text-primary"),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(c.icon, { className: "size-4.5" })
								})]
							})
						}, c.label))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "lg:hidden flex flex-col gap-6 order-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuickActionsCard, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrganizationHealthCard, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecentActivityCard, {})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-0 overflow-hidden order-3 lg:order-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "p-5 border-b",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-lg font-semibold",
								children: "Recent campaigns"
							})
						}), recent && recent.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "divide-y",
							children: recent.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "px-5 py-4 flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-medium text-sm",
									children: c.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-xs text-muted-foreground mt-0.5",
									children: [
										new Date(c.created_at).toLocaleDateString(),
										" · ",
										c.processed_count,
										"/",
										c.total_recipients,
										" processed"
									]
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CampaignStatusBadge, { status: c.status })]
							}, c.id))
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "p-12 text-center text-sm text-muted-foreground",
							children: "No campaigns yet. Create your first WhatsApp campaign to get started."
						})]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "hidden lg:flex lg:col-span-3 flex-col gap-6 sticky top-6 order-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecentActivityCard, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrganizationHealthCard, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuickActionsCard, {})
				]
			})]
		})]
	});
}
function CampaignStatusBadge({ status }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "px-2.5 py-1 rounded-full text-xs font-medium capitalize " + ({
			draft: "bg-muted text-muted-foreground",
			scheduled: "bg-info-soft text-info",
			queued: "bg-muted text-muted-foreground",
			sending: "bg-info-soft text-info",
			paused: "bg-warning-soft text-warning-foreground",
			completed: "bg-primary-soft text-primary",
			failed: "bg-destructive-soft text-destructive",
			cancelled: "bg-destructive-soft text-destructive"
		}[status] ?? "bg-muted"),
		children: status
	});
}
//#endregion
export { Dashboard as component };
