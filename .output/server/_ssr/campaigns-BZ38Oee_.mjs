import { o as __toESM } from "../_runtime.mjs";
import { y as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
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
import { t as Card } from "./card-xVPC106M.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { Bt as CircleX, C as Send, Ht as CircleCheck, It as LoaderCircle, T as Save, Ut as CircleAlert, dt as Clock, gt as ChevronLeft, ht as ChevronRight, j as Plus, o as Users, yt as Calendar } from "../_libs/lucide-react.mjs";
import { n as useActiveTenant, t as canManage } from "./use-tenant-B3bhUKig.mjs";
import { t as Textarea } from "./textarea-1llmCJsE.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-B5SRUUUO.mjs";
import { t as MultiSelect } from "./MultiSelect-B5EH7G1E.mjs";
import { c as stringType, i as enumType, n as arrayType, o as objectType, r as booleanType, s as recordType } from "../_libs/zod.mjs";
import { n as getAudienceContacts, s as saveSavedAudience } from "./contacts.functions-C5DHb4ik.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-BHv1JhlL.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { t as EmptyState } from "./EmptyState-CgQAnAgP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/campaigns-BZ38Oee_.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var audienceSchema = objectType({
	mode: enumType([
		"all",
		"tags",
		"groups",
		"audience_builder"
	]),
	ids: arrayType(stringType().uuid()).default([]),
	includeGroups: arrayType(stringType().uuid()).default([]),
	includeTags: arrayType(stringType().uuid()).default([]),
	excludeGroups: arrayType(stringType().uuid()).default([]),
	excludeTags: arrayType(stringType().uuid()).default([]),
	savedAudienceId: stringType().uuid().optional().nullable(),
	manualContactIds: arrayType(stringType().uuid()).default([]),
	freezeAudience: booleanType().default(false)
});
var baseSchema = objectType({
	tenantId: stringType().uuid(),
	name: stringType().min(1).max(120),
	description: stringType().max(500).optional().nullable(),
	templateId: stringType().uuid(),
	audience: audienceSchema,
	variableMapping: recordType(stringType(), stringType()),
	scheduledAt: stringType().datetime().nullable(),
	mediaUrl: stringType().url().optional().nullable()
});
var previewCampaign = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => baseSchema.parse(d)).handler(createSsrRpc("7a4765948af1a0183bf63ffa21dea3db340f22765dc4edffb718a26c8297b12a"));
var createCampaign = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => baseSchema.parse(d)).handler(createSsrRpc("fdd1cd7187316037ea146cc01f5803c448f81fba3975f8ab8d92e76b9ef5f2d3"));
var cancelCampaign = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
	tenantId: stringType().uuid(),
	campaignId: stringType().uuid()
}).parse(d)).handler(createSsrRpc("9083bd210f05e1df59ad4ebedfe73428916782c1be9c0df2cd98f6cebf093691"));
var resumeCampaign = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
	tenantId: stringType().uuid(),
	campaignId: stringType().uuid()
}).parse(d)).handler(createSsrRpc("756734ef907e5ce7fe12a526a4069035edbc168f308652f5e081d09cf4b86d82"));
function AudienceBuilder({ tenantId, value, onChange, templateId, variableMapping = {}, mediaUrl = null }) {
	const qc = useQueryClient();
	const { user } = useAuth();
	const previewFn = useServerFn(previewCampaign);
	const getContactsFn = useServerFn(getAudienceContacts);
	const saveAudienceFn = useServerFn(saveSavedAudience);
	const [previewOpen, setPreviewOpen] = (0, import_react.useState)(false);
	const [saveOpen, setSaveOpen] = (0, import_react.useState)(false);
	const [audienceName, setAudienceName] = (0, import_react.useState)("");
	const [audienceDesc, setAudienceDesc] = (0, import_react.useState)("");
	const [savingAudience, setSavingAudience] = (0, import_react.useState)(false);
	const [previewPage, setPreviewPage] = (0, import_react.useState)(0);
	const [previewSearch, setPreviewSearch] = (0, import_react.useState)("");
	const { data: tags } = useQuery({
		queryKey: ["campaigns:tags", tenantId],
		enabled: !!tenantId,
		queryFn: async () => {
			const { data } = await supabase.from("tags").select("id, name").eq("tenant_id", tenantId);
			return data ?? [];
		}
	});
	const { data: groups } = useQuery({
		queryKey: ["campaigns:groups", tenantId],
		enabled: !!tenantId,
		queryFn: async () => {
			const { data } = await supabase.from("groups").select("id, name, created_by").eq("tenant_id", tenantId);
			return data ?? [];
		}
	});
	const formattedGroups = (0, import_react.useMemo)(() => {
		if (!groups) return [];
		return groups.map((g) => {
			const isShared = g.created_by && g.created_by !== user?.id;
			return {
				id: g.id,
				name: isShared ? `${g.name} (Shared)` : g.name
			};
		});
	}, [groups, user?.id]);
	const { data: savedAudiences } = useQuery({
		queryKey: ["saved-audiences", tenantId],
		enabled: !!tenantId,
		queryFn: async () => {
			const { data } = await supabase.from("saved_audiences").select("id, name, description, criteria").eq("tenant_id", tenantId).order("name");
			return data ?? [];
		}
	});
	const { data: stats, isLoading: isStatsLoading } = useQuery({
		queryKey: [
			"audience-stats",
			tenantId,
			templateId,
			value,
			variableMapping,
			mediaUrl
		],
		enabled: !!tenantId && !!templateId,
		queryFn: async () => {
			try {
				return await previewFn({ data: {
					tenantId,
					name: "Live Stats",
					templateId,
					audience: value,
					variableMapping,
					scheduledAt: null,
					mediaUrl: mediaUrl || null
				} });
			} catch (err) {
				console.error(err);
				return {
					error: err.message,
					totalRecipients: 0,
					excludedCount: 0,
					duplicateCount: 0
				};
			}
		}
	});
	const { data: previewContacts, isLoading: isPreviewLoading } = useQuery({
		queryKey: [
			"audience-preview-contacts",
			tenantId,
			value,
			previewSearch,
			previewPage,
			previewOpen
		],
		enabled: !!tenantId && previewOpen,
		queryFn: async () => {
			return await getContactsFn({ data: {
				tenantId,
				audience: value,
				search: previewSearch,
				page: previewPage,
				pageSize: 10
			} });
		}
	});
	function handleSelectSavedAudience(saId) {
		if (!saId) {
			onChange({
				...value,
				savedAudienceId: null
			});
			return;
		}
		const sa = savedAudiences?.find((item) => item.id === saId);
		if (sa && sa.criteria) {
			const crit = sa.criteria;
			onChange({
				...value,
				savedAudienceId: saId,
				includeGroups: crit.includeGroups ?? [],
				includeTags: crit.includeTags ?? [],
				excludeGroups: crit.excludeGroups ?? [],
				excludeTags: crit.excludeTags ?? []
			});
		}
	}
	async function handleSaveAudience() {
		if (!audienceName.trim()) {
			toast.error("Please enter a name for the audience");
			return;
		}
		setSavingAudience(true);
		try {
			const criteria = {
				includeGroups: value.includeGroups,
				includeTags: value.includeTags,
				excludeGroups: value.excludeGroups,
				excludeTags: value.excludeTags
			};
			const res = await saveAudienceFn({ data: {
				tenantId,
				name: audienceName.trim(),
				description: audienceDesc.trim() || null,
				criteria
			} });
			toast.success("Audience saved successfully");
			setSaveOpen(false);
			setAudienceName("");
			setAudienceDesc("");
			qc.invalidateQueries({ queryKey: ["saved-audiences"] });
			onChange({
				...value,
				savedAudienceId: res.id
			});
		} catch (err) {
			toast.error(err.message);
		} finally {
			setSavingAudience(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 md:grid-cols-2 gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Target Mode" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: value.mode,
						onValueChange: (val) => onChange({
							...value,
							mode: val,
							savedAudienceId: null,
							includeGroups: [],
							includeTags: [],
							excludeGroups: [],
							excludeTags: []
						}),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "all",
							children: "Entire Contact List"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "audience_builder",
							children: "Audience Builder (Rules & Exclusions)"
						})] })]
					})]
				}), value.mode === "audience_builder" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Load Saved Audience" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: value.savedAudienceId || "none",
						onValueChange: (val) => handleSelectSavedAudience(val === "none" ? "" : val),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select a saved template…" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "none",
							children: "Create Custom Rule"
						}), (savedAudiences ?? []).map((sa) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: sa.id,
							children: sa.name
						}, sa.id))] })]
					})]
				})]
			}),
			value.mode === "audience_builder" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-4 space-y-4 bg-muted/10 border-dashed",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
						className: "text-sm font-semibold text-foreground flex items-center gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-4 text-primary" }), " Target Selection Rules"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-1 md:grid-cols-2 gap-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "flex items-center gap-1.5 text-xs text-muted-foreground uppercase font-semibold",
									children: "Include Groups (OR)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MultiSelect, {
									options: formattedGroups.map((g) => ({
										id: g.id,
										label: g.name
									})),
									value: value.includeGroups,
									onChange: (next) => onChange({
										...value,
										includeGroups: next,
										savedAudienceId: null
									}),
									placeholder: "Target these groups…"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "flex items-center gap-1.5 text-xs text-muted-foreground uppercase font-semibold",
									children: "Include Tags (OR)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MultiSelect, {
									options: (tags ?? []).map((t) => ({
										id: t.id,
										label: t.name
									})),
									value: value.includeTags,
									onChange: (next) => onChange({
										...value,
										includeTags: next,
										savedAudienceId: null
									}),
									placeholder: "Target these tags…"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "flex items-center gap-1.5 text-xs text-destructive uppercase font-semibold",
									children: "Exclude Groups"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MultiSelect, {
									options: formattedGroups.map((g) => ({
										id: g.id,
										label: g.name
									})),
									value: value.excludeGroups,
									onChange: (next) => onChange({
										...value,
										excludeGroups: next,
										savedAudienceId: null
									}),
									placeholder: "Exclude these groups…"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "flex items-center gap-1.5 text-xs text-destructive uppercase font-semibold",
									children: "Exclude Tags"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MultiSelect, {
									options: (tags ?? []).map((t) => ({
										id: t.id,
										label: t.name
									})),
									value: value.excludeTags,
									onChange: (next) => onChange({
										...value,
										excludeTags: next,
										savedAudienceId: null
									}),
									placeholder: "Exclude these tags…"
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2 justify-end pt-2",
						children: [!value.savedAudienceId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							className: "gap-1 text-xs",
							onClick: () => setSaveOpen(true),
							disabled: !value.includeGroups.length && !value.includeTags.length && !value.excludeGroups.length && !value.excludeTags.length,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "size-3.5" }), " Save Audience Template"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "sm",
							className: "gap-1 text-xs",
							onClick: () => {
								setPreviewPage(0);
								setPreviewOpen(true);
							},
							children: "Preview Audience list"
						})]
					})
				]
			}),
			templateId && stats?.error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-3.5 bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-medium flex items-start gap-2.5 rounded-lg mb-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-4.5 mt-0.5 flex-shrink-0 text-red-600" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-semibold text-red-700",
						children: "Audience Validation Error:"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "opacity-95 leading-relaxed",
						children: (() => {
							const str = String(stats.error);
							if (str.includes("VALIDATION_FAILED:")) try {
								const jsonStr = str.substring(str.indexOf(":") + 1);
								const parsed = JSON.parse(jsonStr);
								if (parsed.issues?.length) return `Variable mapping validation failed: Please map all variables. (Affected template has ${parsed.totalIssues || parsed.issues.length} variables or issues)`;
								return parsed.message || str;
							} catch {
								return str;
							}
							if (str.includes("PHONE_VALIDATION_FAILED:")) try {
								const jsonStr = str.substring(str.indexOf(":") + 1);
								return JSON.parse(jsonStr).message || str;
							} catch {
								return str;
							}
							return str;
						})()
					})]
				})]
			}),
			templateId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "p-3 bg-primary-soft/10 border border-primary/20 flex flex-wrap items-center justify-between gap-3 text-xs",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-x-4 gap-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-semibold text-foreground flex items-center gap-1",
						children: [
							isStatsLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3.5 animate-spin text-primary" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-3.5 text-emerald-500" }),
							"Matching Recipients:",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
								className: "text-sm font-bold tabular-nums ml-0.5",
								children: isStatsLoading ? "Calculating…" : stats?.error ? "0" : stats?.totalRecipients ?? 0
							})
						]
					}), value.mode === "audience_builder" && !isStatsLoading && !stats?.error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-muted-foreground",
						children: ["Duplicates Removed: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: stats?.duplicateCount ?? 0 })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-muted-foreground",
						children: ["Excluded Contacts: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: stats?.excludedCount ?? 0 })]
					})] })]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: previewOpen,
				onOpenChange: setPreviewOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-3xl max-h-[85vh] overflow-y-auto",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Preview Audience List" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Verify contacts matches before scheduling campaign. (Showing max 5,000 matches)" })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4 py-2",
							children: [
								!previewContacts?.permissionDenied && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex gap-2",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										placeholder: "Search matching name or phone number normalized…",
										value: previewSearch,
										onChange: (e) => {
											setPreviewPage(0);
											setPreviewSearch(e.target.value);
										}
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "border rounded-lg overflow-hidden",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
										className: "w-full text-sm text-left",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
											className: "bg-muted text-xs uppercase text-muted-foreground font-semibold",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "p-2.5",
													children: "Name"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "p-2.5",
													children: "Phone"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "p-2.5",
													children: "Groups"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "p-2.5",
													children: "Tags"
												})
											] })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
											className: "divide-y",
											children: isPreviewLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
												colSpan: 4,
												className: "p-8 text-center text-muted-foreground",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-6 animate-spin mx-auto mb-2 text-primary" }), "Resolving matches…"]
											}) }) : previewContacts?.permissionDenied ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												colSpan: 4,
												className: "p-8 text-center text-muted-foreground font-sans",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex flex-col items-center justify-center space-y-2 py-6",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "p-3 bg-destructive/10 text-destructive rounded-full",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-6" })
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
															className: "font-semibold text-foreground",
															children: "Access Restricted"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
															className: "text-xs text-muted-foreground max-w-md mx-auto",
															children: "You do not have View Contacts permission for this shared audience. Contact list details are hidden."
														})
													]
												})
											}) }) : previewContacts?.rows?.length ? previewContacts.rows.map((r) => {
												const grps = (r.contact_groups ?? []).map((cg) => cg.groups?.name).filter(Boolean);
												const tgs = (r.contact_tags ?? []).map((ct) => ct.tags?.name).filter(Boolean);
												return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
													className: "hover:bg-muted/30",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
															className: "p-2.5 font-medium",
															children: r.name || "Unnamed"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
															className: "p-2.5 font-mono text-xs",
															children: ["+", r.phone_number_normalized]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
															className: "p-2.5",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "flex flex-wrap gap-1",
																children: [grps.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																	className: "px-1.5 py-0.5 rounded bg-info-soft text-info text-[10px] font-medium",
																	children: g
																}, g)), !grps.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																	className: "text-muted-foreground text-[10px]",
																	children: "—"
																})]
															})
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
															className: "p-2.5",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "flex flex-wrap gap-1",
																children: [tgs.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																	className: "px-1.5 py-0.5 rounded bg-primary-soft text-primary text-[10px] font-medium",
																	children: t
																}, t)), !tgs.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																	className: "text-muted-foreground text-[10px]",
																	children: "—"
																})]
															})
														})
													]
												}, r.id);
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												colSpan: 4,
												className: "p-8 text-center text-muted-foreground font-sans",
												children: "No matching contacts found."
											}) })
										})]
									})
								}),
								previewContacts && !previewContacts.permissionDenied && previewContacts.total > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between text-xs text-muted-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										"Showing ",
										previewPage * 10 + 1,
										"–",
										Math.min((previewPage + 1) * 10, previewContacts.total),
										" of",
										" ",
										previewContacts.total,
										" matching"
									] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "outline",
											size: "sm",
											className: "h-7 w-7 p-0",
											disabled: previewPage === 0,
											onClick: () => setPreviewPage((p) => Math.max(0, p - 1)),
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-4" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "outline",
											size: "sm",
											className: "h-7 w-7 p-0",
											disabled: (previewPage + 1) * 10 >= previewContacts.total,
											onClick: () => setPreviewPage((p) => p + 1),
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4" })
										})]
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: () => setPreviewOpen(false),
							children: "Close Preview"
						}) })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: saveOpen,
				onOpenChange: setSaveOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-md",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Save Audience Template" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Save this rules configuration so you can easily target it in future campaigns." })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4 py-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Audience Template Name" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									placeholder: "e.g. VIP Customers, Hot Leads",
									value: audienceName,
									onChange: (e) => setAudienceName(e.target.value)
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Description" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									placeholder: "Describe who matches this audience…",
									value: audienceDesc,
									onChange: (e) => setAudienceDesc(e.target.value),
									rows: 3
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => setSaveOpen(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: handleSaveAudience,
							disabled: savingAudience,
							children: [savingAudience ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3.5 animate-spin mr-1.5" }) : null, "Save Audience"]
						})] })
					]
				})
			})
		]
	});
}
var STATUS_META = {
	draft: {
		label: "Draft",
		tone: "bg-muted text-muted-foreground",
		icon: Clock
	},
	scheduled: {
		label: "Scheduled",
		tone: "bg-primary-soft text-primary",
		icon: Calendar
	},
	sending: {
		label: "Sending",
		tone: "bg-warning-soft text-warning-foreground",
		icon: LoaderCircle
	},
	processing: {
		label: "Processing",
		tone: "bg-warning-soft text-warning-foreground",
		icon: LoaderCircle
	},
	completed: {
		label: "Completed",
		tone: "bg-success-soft text-success-foreground",
		icon: CircleCheck
	},
	partial: {
		label: "Completed",
		tone: "bg-success-soft text-success-foreground",
		icon: CircleCheck
	},
	failed: {
		label: "Failed",
		tone: "bg-destructive/10 text-destructive",
		icon: CircleAlert
	},
	cancelled: {
		label: "Cancelled",
		tone: "bg-muted text-muted-foreground",
		icon: CircleX
	}
};
function CampaignsPage() {
	const { activeId, membership } = useActiveTenant();
	const canCreate = canManage(membership?.role, "manager");
	const [open, setOpen] = (0, import_react.useState)(false);
	const [detailId, setDetailId] = (0, import_react.useState)(null);
	const { data: campaigns, isLoading } = useQuery({
		queryKey: ["campaigns", activeId],
		enabled: !!activeId,
		queryFn: async () => {
			const { data, error } = await supabase.from("campaigns").select(`
          id, name, description, status, scheduled_at, total_recipients, 
          processed_count, failed_count, created_at, template_id,
          template:template_id(template_name, header_type),
          campaign_media(file_url)
        `).eq("tenant_id", activeId).is("deleted_at", null).order("created_at", { ascending: false });
			if (error) throw error;
			return data ?? [];
		},
		refetchInterval: (q) => {
			return (q.state.data ?? []).some((r) => r.status === "sending" || r.status === "scheduled") ? 4e3 : false;
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col md:flex-row md:items-center md:justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl md:text-3xl font-semibold tracking-tight",
					children: "Campaigns"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground mt-1",
					children: "Schedule and monitor template broadcasts."
				})] }), canCreate && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: () => setOpen(true),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), " New Campaign"]
				})]
			}),
			isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-muted-foreground text-sm",
				children: "Loading…"
			}) : !campaigns?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
				icon: Send,
				title: "No campaigns yet",
				description: "Create your first WhatsApp template broadcast — pick a template, audience and schedule.",
				action: canCreate ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: () => setOpen(true),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), " New Campaign"]
				}) : void 0
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
				children: campaigns.map((c) => {
					const meta = STATUS_META[c.status] ?? STATUS_META.draft;
					const Icon = meta.icon;
					const total = c.total_recipients ?? 0;
					const sent = c.processed_count ?? 0;
					const failed = c.failed_count ?? 0;
					const pct = total ? Math.round((sent + failed) / total * 100) : 0;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setDetailId(c.id),
						className: "text-left",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "p-5 space-y-3 hover:shadow-md transition-shadow",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex gap-3 items-start min-w-0 flex-1",
										children: [c.template?.header_type === "IMAGE" && c.campaign_media?.[0]?.file_url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
											src: c.campaign_media[0].file_url,
											alt: "Thumbnail",
											className: "size-12 rounded object-cover bg-muted shrink-0 border"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "min-w-0 flex-1",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "font-medium truncate",
													children: c.name
												}),
												c.template?.template_name && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "text-[10px] font-medium text-primary uppercase tracking-wider mt-0.5",
													children: c.template.template_name
												}),
												c.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "text-xs text-muted-foreground line-clamp-2 mt-0.5",
													children: c.description
												})
											]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
										className: meta.tone + " gap-1 shrink-0",
										variant: "outline",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-3 " + (c.status === "sending" ? "animate-spin" : "") }),
											" ",
											meta.label
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between text-xs text-muted-foreground",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "flex items-center gap-1",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-3" }),
													" ",
													total,
													" recipients"
												]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [pct, "%"] })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "h-1.5 rounded-full bg-muted overflow-hidden",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "h-full bg-primary transition-all",
												style: { width: `${pct}%` }
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-3 text-xs text-muted-foreground",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "flex items-center gap-1 text-success-foreground",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-3" }),
													" ",
													sent
												]
											}), failed > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "flex items-center gap-1 text-destructive",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-3" }),
													" ",
													failed
												]
											})]
										})
									]
								}),
								c.scheduled_at && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-xs text-muted-foreground flex items-center gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "size-3" }), new Date(c.scheduled_at).toLocaleString()]
								})
							]
						})
					}, c.id);
				})
			}),
			open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreateCampaignDialog, { onClose: () => setOpen(false) }),
			detailId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CampaignDetailDialog, {
				id: detailId,
				onClose: () => setDetailId(null)
			})
		]
	});
}
function CreateCampaignDialog({ onClose }) {
	const { activeId } = useActiveTenant();
	const qc = useQueryClient();
	const create = useServerFn(createCampaign);
	const preview = useServerFn(previewCampaign);
	const [name, setName] = (0, import_react.useState)("");
	const [description, setDescription] = (0, import_react.useState)("");
	const [templateId, setTemplateId] = (0, import_react.useState)("");
	const [audience, setAudience] = (0, import_react.useState)({
		mode: "all",
		ids: [],
		includeGroups: [],
		includeTags: [],
		excludeGroups: [],
		excludeTags: [],
		savedAudienceId: null,
		manualContactIds: [],
		freezeAudience: false
	});
	const [variableMapping, setVariableMapping] = (0, import_react.useState)({});
	const [scheduleType, setScheduleType] = (0, import_react.useState)("now");
	const [scheduledAt, setScheduledAt] = (0, import_react.useState)("");
	const [issues, setIssues] = (0, import_react.useState)(null);
	const [phoneError, setPhoneError] = (0, import_react.useState)(null);
	const [campaignImageUrl, setCampaignImageUrl] = (0, import_react.useState)("");
	const [uploadingImage, setUploadingImage] = (0, import_react.useState)(false);
	const { data: templates } = useQuery({
		queryKey: ["campaigns:templates", activeId],
		enabled: !!activeId,
		queryFn: async () => {
			const { data } = await supabase.from("message_templates").select("id, template_name, language, sync_status, body, variables, header_type, header_format").eq("tenant_id", activeId).eq("sync_status", "approved").is("deleted_at", null).order("template_name");
			return data ?? [];
		}
	});
	const selectedTemplate = (0, import_react.useMemo)(() => templates?.find((t) => t.id === templateId), [templates, templateId]);
	function payload() {
		if (!activeId) throw new Error("No workspace");
		if (!name.trim() || !templateId) throw new Error("Name and template are required");
		if (selectedTemplate?.header_type === "IMAGE" && !campaignImageUrl) throw new Error("Header image is required for this template");
		const scheduledAtIso = scheduleType === "later" ? new Date(scheduledAt).toISOString() : null;
		return {
			tenantId: activeId,
			name: name.trim(),
			description: description.trim() || null,
			templateId,
			audience,
			variableMapping,
			scheduledAt: scheduledAtIso,
			mediaUrl: selectedTemplate?.header_type === "IMAGE" ? campaignImageUrl : null
		};
	}
	const mut = useMutation({
		mutationFn: async () => {
			const pv = await preview({ data: payload() });
			if (pv.issues.length) {
				setIssues(pv.issues);
				throw new Error(`__VALIDATION__:${pv.issues.length}`);
			}
			setIssues(null);
			return create({ data: payload() });
		},
		onSuccess: (res) => {
			toast.success(`Campaign created — ${res.total} recipients queued`);
			qc.invalidateQueries({ queryKey: ["campaigns"] });
			onClose();
		},
		onError: (e) => {
			if (e.message.startsWith("__VALIDATION__:")) return;
			const m = e.message.match(/VALIDATION_FAILED:(.+)$/s);
			if (m) try {
				setIssues(JSON.parse(m[1]).issues);
				return;
			} catch {}
			const pm = e.message.match(/PHONE_VALIDATION_FAILED:(.+)$/s);
			if (pm) try {
				setPhoneError(JSON.parse(pm[1]));
				return;
			} catch {}
			toast.error(e.message);
		}
	});
	const vars = selectedTemplate?.variables ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: true,
		onOpenChange: (v) => !v && onClose(),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-2xl max-h-[90vh] overflow-y-auto",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "New Campaign" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Pick a template, audience and schedule." })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Campaign name" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: name,
								onChange: (e) => setName(e.target.value),
								placeholder: "Diwali Promo 2026"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Description (optional)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								value: description,
								onChange: (e) => setDescription(e.target.value),
								rows: 2
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Template" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: templateId,
									onValueChange: setTemplateId,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select an approved template" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [(templates ?? []).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
										value: t.id,
										children: [
											t.template_name,
											" · ",
											t.language
										]
									}, t.id)), !templates?.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "px-3 py-6 text-sm text-muted-foreground text-center",
										children: "No approved templates yet"
									})] })]
								}),
								selectedTemplate?.body && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs text-muted-foreground p-3 bg-muted rounded-md whitespace-pre-wrap",
									children: selectedTemplate.body
								})
							]
						}),
						selectedTemplate?.header_type === "IMAGE" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2 border rounded-lg p-3 bg-muted/20",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "font-semibold text-sm",
									children: "Campaign Header Image (Required)"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground",
									children: "Select the image for this campaign. Max 5MB (JPG, JPEG, PNG only)."
								}),
								campaignImageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: campaignImageUrl,
										alt: "Campaign Header Preview",
										className: "max-h-40 rounded border object-contain bg-background"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "outline",
										className: "text-destructive border-destructive",
										onClick: () => setCampaignImageUrl(""),
										children: "Remove Image"
									})]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-col gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "file",
										accept: ".jpg,.jpeg,.png",
										disabled: uploadingImage,
										onChange: async (e) => {
											const file = e.target.files?.[0];
											if (!file) return;
											if (file.size > 5 * 1024 * 1024) {
												toast.error("File exceeds maximum size of 5MB");
												return;
											}
											setUploadingImage(true);
											try {
												const fileExt = file.name.split(".").pop()?.toLowerCase();
												const filePath = `${activeId}/campaigns/${`${Date.now()}.${fileExt}`}`;
												const { error: uploadError } = await supabase.storage.from("campaign-media").upload(filePath, file);
												if (uploadError) throw uploadError;
												const { data: { publicUrl } } = supabase.storage.from("campaign-media").getPublicUrl(filePath);
												setCampaignImageUrl(publicUrl);
												toast.success("Image uploaded successfully");
											} catch (err) {
												toast.error("Failed to upload image: " + err.message);
											} finally {
												setUploadingImage(false);
											}
										}
									}), uploadingImage && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-xs text-muted-foreground flex items-center gap-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3 animate-spin" }), " Uploading image..."]
									})]
								})
							]
						}),
						vars.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Variables" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground",
									children: "Map each template variable to a contact field."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "space-y-2",
									children: vars.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-mono text-xs px-2 py-1 bg-muted rounded",
											children: `{{${v}}}`
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: variableMapping[v] ?? "",
											onValueChange: (val) => setVariableMapping({
												...variableMapping,
												[v]: val
											}),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Contact field" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "name",
													children: "Name"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "phone",
													children: "Phone"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "email",
													children: "Email"
												})
											] })]
										})]
									}, v))
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Target Audience Selection" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AudienceBuilder, {
								tenantId: activeId,
								value: audience,
								onChange: setAudience,
								templateId,
								variableMapping,
								mediaUrl: campaignImageUrl
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Schedule" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: scheduleType,
									onValueChange: (v) => setScheduleType(v),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "now",
										children: "Send immediately"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "later",
										children: "Schedule for later"
									})] })]
								}),
								scheduleType === "later" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "datetime-local",
									value: scheduledAt,
									onChange: (e) => setScheduledAt(e.target.value),
									min: (/* @__PURE__ */ new Date()).toISOString().slice(0, 16)
								})
							]
						})
					]
				}),
				issues && issues.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "border border-destructive/40 bg-destructive/5 rounded-md p-3 space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 text-destructive font-medium text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-4" }),
							issues.length,
							" recipient",
							issues.length === 1 ? "" : "s",
							" missing required data — fix before sending"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "max-h-56 overflow-y-auto text-xs space-y-1",
						children: [issues.slice(0, 50).map((i, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-x-2 gap-y-0.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium",
									children: i.contactName
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-muted-foreground",
									children: [
										"(",
										i.phone,
										")"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "missing" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium",
									children: i.fieldLabel
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-muted-foreground",
									children: ["required for ", `{{${i.variable}}}`]
								})
							]
						}, idx)), issues.length > 50 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-muted-foreground",
							children: [
								"…and ",
								issues.length - 50,
								" more"
							]
						})]
					})]
				}),
				phoneError && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "border border-destructive/40 bg-destructive/5 rounded-md p-3 space-y-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 text-destructive font-medium text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-4" }), "Phone numbers missing country code — campaign blocked"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: phoneError.message
						}),
						phoneError.samples.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs font-mono space-y-0.5",
							children: phoneError.samples.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-destructive",
								children: s
							}, i))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground",
							children: [
								"Go to ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Contacts → Bulk Add" }),
								" and include a country code (e.g.",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "91" }),
								" for India) when pasting numbers, or re-import your CSV with the country code prefix."
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: onClose,
					disabled: mut.isPending,
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: () => mut.mutate(),
					disabled: mut.isPending,
					children: [mut.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-4" }), issues && issues.length > 0 ? "Re-validate" : scheduleType === "later" ? "Schedule" : "Send now"]
				})] })
			]
		})
	});
}
function CampaignDetailDialog({ id, onClose }) {
	const { activeId, membership } = useActiveTenant();
	const qc = useQueryClient();
	const canEdit = canManage(membership?.role, "manager");
	const cancel = useServerFn(cancelCampaign);
	const { data: campaign } = useQuery({
		queryKey: ["campaign", id],
		queryFn: async () => {
			const { data } = await supabase.from("campaigns").select("*, template:template_id(template_name, language, body, header_type), campaign_media(file_url)").eq("id", id).single();
			return data;
		},
		refetchInterval: 5e3
	});
	const { data: recipientStats } = useQuery({
		queryKey: ["campaign-stats", id],
		queryFn: async () => {
			const { data } = await supabase.from("campaign_recipients").select("status").eq("campaign_id", id).limit(1e4);
			const counts = {};
			for (const r of data ?? []) counts[r.status] = (counts[r.status] ?? 0) + 1;
			return counts;
		},
		refetchInterval: 5e3
	});
	const { data: recipients } = useQuery({
		queryKey: ["campaign-recipients", id],
		queryFn: async () => {
			const { data } = await supabase.from("campaign_recipients").select("id, phone_number_normalized, status, meta_status, meta_message_id, meta_error, error").eq("campaign_id", id).order("created_at", { ascending: true }).limit(200);
			return data ?? [];
		},
		refetchInterval: 5e3
	});
	const { data: revCheck } = useQuery({
		queryKey: [
			"campaign-revocation-check",
			campaign?.id,
			campaign?.audience_criteria,
			campaign?.created_by,
			campaign?.tenant_id
		],
		enabled: !!campaign && (campaign.status === "scheduled" || campaign.status === "sending" || campaign.status === "processing"),
		queryFn: async () => {
			const tenantId = campaign?.tenant_id;
			const creatorId = campaign?.created_by;
			if (!tenantId || !creatorId) return { revoked: false };
			const { data: isCreatorManagerPlus } = await supabase.rpc("has_tenant_role", {
				_tenant: tenantId,
				_user: creatorId,
				_roles: [
					"owner",
					"admin",
					"manager"
				]
			});
			if (isCreatorManagerPlus) return { revoked: false };
			const audience = campaign?.audience_criteria;
			let targetGroupIds = [];
			if (audience) {
				if (audience.mode === "groups" && Array.isArray(audience.ids)) targetGroupIds = audience.ids;
				else if (audience.mode === "audience_builder") {
					let activeAudience = audience;
					if (audience.savedAudienceId) {
						const { data: sa } = await supabase.from("saved_audiences").select("criteria").eq("id", audience.savedAudienceId).maybeSingle();
						if (sa && sa.criteria) activeAudience = sa.criteria;
					}
					if (Array.isArray(activeAudience.includeGroups)) targetGroupIds = activeAudience.includeGroups;
				}
			}
			if (targetGroupIds.length === 0) return { revoked: false };
			const { data: groups } = await supabase.from("groups").select("id, name, created_by").in("id", targetGroupIds);
			const foreignGroupIds = (groups ?? []).filter((g) => g.created_by && g.created_by !== creatorId).map((g) => g.id);
			if (foreignGroupIds.length === 0) return { revoked: false };
			const { data: shares } = await supabase.from("group_shares").select("group_id, can_use_in_campaigns").in("group_id", foreignGroupIds).eq("shared_with_user", creatorId);
			const permittedGroupIds = (shares ?? []).filter((s) => s.can_use_in_campaigns).map((s) => s.group_id);
			const unauthorizedGroups = (groups ?? []).filter((g) => foreignGroupIds.includes(g.id) && !permittedGroupIds.includes(g.id));
			if (unauthorizedGroups.length > 0) return {
				revoked: true,
				groups: unauthorizedGroups.map((g) => g.name)
			};
			return { revoked: false };
		}
	});
	const { data: audienceDetails } = useQuery({
		queryKey: [
			"campaign-audience-details",
			campaign?.id,
			campaign?.audience_criteria
		],
		enabled: !!campaign,
		queryFn: async () => {
			const audience = campaign?.audience_criteria;
			let targetGroupIds = [];
			if (audience) {
				if (audience.mode === "groups" && Array.isArray(audience.ids)) targetGroupIds = audience.ids;
				else if (audience.mode === "audience_builder") {
					let activeAudience = audience;
					if (audience.savedAudienceId) {
						const { data: sa } = await supabase.from("saved_audiences").select("criteria").eq("id", audience.savedAudienceId).maybeSingle();
						if (sa && sa.criteria) activeAudience = sa.criteria;
					}
					if (Array.isArray(activeAudience.includeGroups)) targetGroupIds = activeAudience.includeGroups;
				}
			}
			if (targetGroupIds.length === 0) return {
				mode: audience?.mode || "all",
				groups: []
			};
			const { data: groups } = await supabase.from("groups").select("id, name, created_by, profiles:created_by(full_name, email)").in("id", targetGroupIds);
			return {
				mode: audience?.mode || "groups",
				groups: (groups ?? []).map((g) => ({
					id: g.id,
					name: g.name,
					ownerName: g.profiles?.full_name || g.profiles?.email || "Workspace",
					isShared: g.created_by && g.created_by !== campaign?.created_by
				}))
			};
		}
	});
	const cancelMut = useMutation({
		mutationFn: () => cancel({ data: {
			tenantId: activeId,
			campaignId: id
		} }),
		onSuccess: () => {
			toast.success("Campaign cancelled");
			qc.invalidateQueries({ queryKey: ["campaigns"] });
			qc.invalidateQueries({ queryKey: ["campaign", id] });
		},
		onError: (e) => toast.error(e.message)
	});
	const resume = useServerFn(resumeCampaign);
	const resumeMut = useMutation({
		mutationFn: () => resume({ data: {
			tenantId: activeId,
			campaignId: id
		} }),
		onSuccess: () => {
			toast.success("Campaign resumed. Remaining messages are being processed.");
			qc.invalidateQueries({ queryKey: ["campaigns"] });
			qc.invalidateQueries({ queryKey: ["campaign", id] });
		},
		onError: (e) => toast.error(e.message)
	});
	if (!campaign) return null;
	const meta = STATUS_META[campaign.status] ?? STATUS_META.draft;
	const canCancel = canEdit && (campaign.status === "scheduled" || campaign.status === "sending" || campaign.status === "processing");
	const canResume = canEdit && (campaign.status === "failed" || campaign.status === "cancelled" || campaign.status === "processing");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: true,
		onOpenChange: (v) => !v && onClose(),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-2xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
					className: "flex items-center gap-2",
					children: [campaign.name, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						className: meta.tone,
						variant: "outline",
						children: meta.label
					})]
				}), campaign.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: campaign.description })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [
						revCheck?.revoked && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg flex items-start gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-5 shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-sm font-sans",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-semibold",
									children: "Campaign Audience Revoked"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-0.5",
									children: [
										"The creator's access to the shared group(s) (",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: revCheck.groups?.join(", ") }),
										") has been revoked. This scheduled campaign will fail when processed."
									]
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 sm:grid-cols-4 gap-3 text-center",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "Total",
									value: campaign.total_recipients ?? 0
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "Sent",
									value: (recipientStats?.sent ?? 0) + (recipientStats?.sent_to_meta ?? 0)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "Delivered",
									value: (recipientStats?.delivered ?? 0) + (recipientStats?.read ?? 0)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "Failed",
									value: (recipientStats?.failed ?? 0) + (recipientStats?.api_failed ?? 0),
									tone: "destructive"
								})
							]
						}),
						campaign.template?.header_type === "IMAGE" && campaign.campaign_media?.[0]?.file_url && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2 border rounded-lg p-3 bg-muted/20",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs font-semibold text-primary uppercase tracking-wider",
								children: "Campaign Header Image Preview"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: campaign.campaign_media[0].file_url,
								alt: "Campaign Header Preview",
								className: "max-h-48 rounded border object-contain w-full bg-background"
							})]
						}),
						audienceDetails && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2 border rounded-lg p-3 bg-muted/20 text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs font-semibold text-primary uppercase tracking-wider",
								children: "Campaign Audience Source"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1 mt-1 font-sans",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["Target Mode: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold capitalize",
									children: audienceDetails.mode.replace("_", " ")
								})] }), audienceDetails.groups.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1.5 font-medium",
									children: "Target Groups:"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "list-disc list-inside space-y-0.5 pl-1 mt-0.5",
									children: audienceDetails.groups.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-semibold",
										children: g.name
									}), g.isShared && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-muted-foreground ml-1.5",
										children: [
											"(Shared by ",
											g.ownerName,
											")"
										]
									})] }, g.id))
								})] })]
							})]
						}),
						(recipientStats?.failed ?? 0) + (recipientStats?.api_failed ?? 0) > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-3 bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 rounded-lg text-xs space-y-1.5 font-sans",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "font-semibold flex items-center gap-1.5 text-amber-700 dark:text-amber-400",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-4 shrink-0" }), "Meta Delivery Failures Explanation"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
									"Messages marked as ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Failed" }),
									" were rejected directly by Meta's WhatsApp Cloud API for the following reasons:"
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
									className: "list-disc list-inside space-y-1 pl-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Error 131049 (Ecosystem Health)" }), ": Meta's anti-spam policy blocked delivery because the recipient's phone number rarely engages with business accounts or reached Meta's marketing message frequency cap."] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Error 130472 (Invalid / Restricted Number)" }), ": The phone number is not registered on WhatsApp or is restricted by Meta from receiving marketing templates."] })]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2 border-t pt-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-semibold text-sm",
								children: "Recipients Delivery Details"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "border rounded-lg overflow-hidden max-h-72 overflow-y-auto",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
									className: "w-full text-left text-xs divide-y",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
										className: "bg-muted/50 text-muted-foreground font-semibold sticky top-0 bg-background z-10",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "p-2",
												children: "Phone"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "p-2",
												children: "Status"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "p-2",
												children: "Message ID"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "p-2",
												children: "Details / Meta Error"
											})
										] })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", {
										className: "divide-y font-mono",
										children: [recipients?.map((r) => {
											const errorText = r.meta_error || r.error || "";
											const isEcoSystemHealth = errorText.includes("131049");
											const isInvalidNumber = errorText.includes("130472");
											return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
													className: "p-2 font-sans font-medium",
													children: ["+", r.phone_number_normalized]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "p-2",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: cn("px-1.5 py-0.5 rounded text-[10px] font-semibold capitalize whitespace-nowrap", r.status === "sent" || r.status === "sent_to_meta" || r.status === "delivered" || r.status === "read" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"),
														children: r.status
													})
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "p-2 text-[11px] truncate max-w-[140px]",
													title: r.meta_message_id ?? "",
													children: r.meta_message_id || "-"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "p-2 font-sans text-xs max-w-[280px]",
													children: errorText ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "space-y-0.5",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
																className: "text-destructive font-mono text-[11px] break-words",
																children: errorText
															}),
															isEcoSystemHealth && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "inline-block bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[10px] px-1.5 py-0.5 rounded font-sans font-medium",
																children: "Meta blocked (Recipient unengaged / frequency capped)"
															}),
															isInvalidNumber && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "inline-block bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 text-[10px] px-1.5 py-0.5 rounded font-sans font-medium",
																children: "Number not on WhatsApp / Restricted by Meta"
															})
														]
													}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-muted-foreground",
														children: "-"
													})
												})
											] }, r.id);
										}), (!recipients || recipients.length === 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											colSpan: 4,
											className: "p-4 text-center text-muted-foreground font-sans",
											children: "No recipients found"
										}) })]
									})]
								})
							})]
						}),
						campaign.scheduled_at && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-sm text-muted-foreground",
							children: ["Scheduled: ", new Date(campaign.scheduled_at).toLocaleString()]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/conversations",
							className: "text-sm text-primary hover:underline inline-block",
							children: "View replies in Conversations →"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [
					canResume && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: () => resumeMut.mutate(),
						disabled: resumeMut.isPending,
						className: "border-emerald-500/30 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10",
						children: resumeMut.isPending ? "Resuming..." : "Resume campaign"
					}),
					canCancel && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: () => cancelMut.mutate(),
						disabled: cancelMut.isPending,
						children: "Cancel campaign"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: onClose,
						children: "Close"
					})
				] })
			]
		})
	});
}
function Stat({ label, value, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "p-3 rounded-lg bg-muted/50",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-2xl font-semibold tabular-nums " + (tone === "destructive" ? "text-destructive" : ""),
			children: value
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-xs text-muted-foreground",
			children: label
		})]
	});
}
//#endregion
export { CampaignsPage as component };
