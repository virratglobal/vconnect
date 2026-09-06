import { o as __toESM } from "../_runtime.mjs";
import { y as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as useServerFn } from "./useServerFn-BqzygRuj.mjs";
import { t as supabase } from "./client-DTaxocpy.mjs";
import { n as useAuth } from "./use-auth-BLya4MAJ.mjs";
import { t as Button } from "./button-OuFjfcpS.mjs";
import { t as Input } from "./input-CITjGSX3.mjs";
import { t as Label } from "./label-BPuF5-mq.mjs";
import { a as CardHeader, i as CardFooter, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card-xVPC106M.mjs";
import { i as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { F as Pencil, L as Palette, Ot as ArrowRight, Q as Globe, dt as Clock, j as Plus, m as Trash2, vt as Check, xt as Building2 } from "../_libs/lucide-react.mjs";
import { n as useActiveTenant, r as useMyTenants } from "./use-tenant-DyGfRuCR.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-B5SRUUUO.mjs";
import { n as deleteOrganization } from "./settings-BvZIF22Z.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/organization-ZUrPP-Cu.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function OrganizationPage() {
	const { user } = useAuth();
	const qc = useQueryClient();
	const { activeId, switchTenant } = useActiveTenant();
	const { data: tenantMemberships, isLoading } = useMyTenants();
	const [openModal, setOpenModal] = (0, import_react.useState)(false);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [deletingOrgId, setDeletingOrgId] = (0, import_react.useState)(null);
	const deleteOrgFn = useServerFn(deleteOrganization);
	const [renameDialogOpen, setRenameDialogOpen] = (0, import_react.useState)(false);
	const [renamingOrg, setRenamingOrg] = (0, import_react.useState)(null);
	const [newOrgName, setNewOrgName] = (0, import_react.useState)("");
	const [renameLoading, setRenameLoading] = (0, import_react.useState)(false);
	async function handleRename(e) {
		e.preventDefault();
		if (!renamingOrg || !newOrgName.trim()) return;
		setRenameLoading(true);
		try {
			const { error } = await supabase.from("tenants").update({ name: newOrgName.trim() }).eq("id", renamingOrg.id);
			if (error) throw error;
			toast.success("Organization renamed successfully");
			await qc.invalidateQueries({ queryKey: ["my-tenants"] });
			setRenameDialogOpen(false);
			setRenamingOrg(null);
			setNewOrgName("");
		} catch (err) {
			toast.error(err.message || "Failed to rename organization");
		} finally {
			setRenameLoading(false);
		}
	}
	async function handleDeleteOrganization(orgId, orgName) {
		const slug = tenantMemberships?.find((m) => m.tenant_id === orgId)?.tenants.slug;
		const input = prompt(`To delete "${orgName}", please type the organization slug "/${slug}" to confirm:`);
		if (input !== `/${slug}`) {
			if (input !== null) toast.error("Slug did not match. Deletion aborted.");
			return;
		}
		if (!confirm(`Are you absolutely sure you want to permanently delete "${orgName}"? This action cannot be undone and will delete all campaigns, contacts, and WhatsApp credentials.`)) return;
		setDeletingOrgId(orgId);
		try {
			await deleteOrgFn({ data: { tenantId: orgId } });
			toast.success("Organization deleted successfully");
			if (activeId === orgId) localStorage.removeItem("wa-crm.active-tenant");
			await qc.invalidateQueries({ queryKey: ["my-tenants"] });
		} catch (err) {
			toast.error(err.message || "Failed to delete organization");
		} finally {
			setDeletingOrgId(null);
		}
	}
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
			if (tenantData) switchTenant(tenantData.id);
			await qc.invalidateQueries({ queryKey: ["my-tenants"] });
			setOpenModal(false);
			setName("");
			setCompanyName("");
			setIndustry("");
			setLogo("");
			setBrandColor("#CC1100");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Failed to create organization");
		} finally {
			setLoading(false);
		}
	}
	const handleEnterOrg = (tenantId) => {
		switchTenant(tenantId);
		toast.success("Switched active organization context");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl md:text-3xl font-extrabold tracking-tight",
					children: "Organizations"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground mt-1.5",
					children: "Switch between or manage the organizations you belong to."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: () => setOpenModal(true),
					className: "bg-[#CC1100] hover:bg-[#B00E00] text-white font-semibold rounded-xl gap-1.5 self-start sm:self-auto",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "Create Organization"]
				})]
			}),
			isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
				children: [1, 2].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "animate-pulse border-border/50",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-5 w-2/3 bg-muted rounded" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-4 w-1/2 bg-muted rounded" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { className: "h-20 bg-muted/20" })]
				}, i))
			}) : tenantMemberships && tenantMemberships.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
				children: tenantMemberships.map((membership) => {
					const org = membership.tenants;
					const isActive = org.id === activeId;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: `flex flex-col relative overflow-hidden transition-all duration-300 hover:shadow-lg border ${isActive ? "border-primary/50 shadow-md shadow-primary/5 bg-gradient-to-br from-card to-primary/5" : "border-border/50 bg-card hover:border-border"}`,
						children: [
							isActive && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3" }), " Active"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
								className: "text-lg font-bold flex items-center gap-2 truncate pr-16",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: `size-5 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "truncate",
									children: org.name
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardDescription, {
								className: "font-mono text-xs truncate",
								children: ["/", org.slug]
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
								className: "flex-1 py-2 text-sm text-muted-foreground space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between items-center text-xs border-b border-border/50 pb-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Role" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "capitalize font-semibold text-foreground bg-muted px-2 py-0.5 rounded-full",
										children: membership.role
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between items-center text-xs",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Domain" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "truncate max-w-[150px] font-medium text-foreground",
										children: org.custom_domain || "Standard domain"
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardFooter, {
								className: "pt-4 border-t border-border/50 gap-2",
								children: [isActive ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									disabled: true,
									className: "w-full rounded-xl border-dashed",
									children: "Currently Active"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									onClick: () => handleEnterOrg(org.id),
									className: "flex-1 bg-[#CC1100] hover:bg-[#B00E00] text-white font-semibold rounded-xl gap-1.5",
									children: ["Enter Organization ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
								}), membership.role === "owner" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									size: "icon",
									onClick: () => {
										setRenamingOrg({
											id: org.id,
											name: org.name
										});
										setNewOrgName(org.name);
										setRenameDialogOpen(true);
									},
									className: "border-input hover:bg-muted text-muted-foreground hover:text-foreground rounded-xl shrink-0",
									title: "Rename Organization",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-4" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									size: "icon",
									onClick: () => handleDeleteOrganization(org.id, org.name),
									disabled: deletingOrgId === org.id,
									className: "border-destructive/30 hover:bg-destructive/10 text-destructive rounded-xl shrink-0",
									title: "Delete Organization",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
								})] })]
							})
						]
					}, org.id);
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border-dashed p-12 text-center max-w-xl mx-auto space-y-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "size-16 rounded-2xl bg-muted grid place-items-center mx-auto text-muted-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "size-8" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-bold text-lg",
							children: "No organizations found"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "You are not a member of any organization yet. Create a new organization to start setting up your WhatsApp CRM workspace."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: () => setOpenModal(true),
						className: "bg-[#CC1100] hover:bg-[#B00E00] text-white font-semibold rounded-xl gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "Create Organization"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
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
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: renameDialogOpen,
				onOpenChange: setRenameDialogOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-md rounded-3xl p-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
						className: "text-xl font-bold flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-5 text-primary" }), " Rename Organization"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Update the name of the organization workspace." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handleRename,
						className: "space-y-4 py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "rename-org-name",
								children: "New Name"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "rename-org-name",
								placeholder: "Acme Marketing",
								value: newOrgName,
								onChange: (e) => setNewOrgName(e.target.value),
								required: true,
								className: "rounded-xl"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
							className: "pt-4 border-t border-border/50 gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "ghost",
								onClick: () => setRenameDialogOpen(false),
								className: "rounded-xl font-semibold",
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								disabled: renameLoading || !newOrgName.trim() || newOrgName === renamingOrg?.name,
								className: "bg-[#CC1100] hover:bg-[#B00E00] text-white font-semibold rounded-xl",
								children: renameLoading ? "Saving…" : "Save Name"
							})]
						})]
					})]
				})
			})
		]
	});
}
//#endregion
export { OrganizationPage as component };
