import { o as __toESM } from "../_runtime.mjs";
import { y as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { l as createServerFn } from "./esm-9EjmF9OT.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-wPl4xYQJ.mjs";
import { t as useServerFn } from "./useServerFn-BqzygRuj.mjs";
import { t as supabase } from "./client-Cx80Vihe.mjs";
import { t as createSsrRpc } from "./createSsrRpc-TuEXL4wz.mjs";
import { t as Button } from "./button-OuFjfcpS.mjs";
import { t as Input } from "./input-CITjGSX3.mjs";
import { t as Label } from "./label-BPuF5-mq.mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, t as Card } from "./card-xVPC106M.mjs";
import { i as TabsTrigger, r as TabsList, t as Tabs } from "./tabs-BgKcOzjx.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { C as Send, F as Pencil, It as LoaderCircle, O as RefreshCcw, it as Eye, j as Plus, m as Trash2, nt as FileText, w as Search } from "../_libs/lucide-react.mjs";
import { n as useActiveTenant, t as canManage } from "./use-tenant-B3bhUKig.mjs";
import { t as Textarea } from "./textarea-1llmCJsE.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-B5SRUUUO.mjs";
import { c as stringType, o as objectType } from "../_libs/zod.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-BHv1JhlL.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { t as EmptyState } from "./EmptyState-CgQAnAgP.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, i as AlertDialogContent, n as AlertDialogAction, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog } from "./alert-dialog-BCrgGGf7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/templates-DNav3JS_.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var syncMetaTemplates = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({ tenantId: stringType().uuid() }).parse(input)).handler(createSsrRpc("1795372c99b893fdf679c1908ba274ead0cea34cbba15b66f1dcb09b2c3a2a88"));
var submitTemplateToMeta = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
	tenantId: stringType().uuid(),
	templateId: stringType().uuid()
}).parse(input)).handler(createSsrRpc("2e9c4384af068a6efcefefaf410ce57be036cabb26f5622f6e2437bc4166ca52"));
function extractVariables(body) {
	const set = /* @__PURE__ */ new Set();
	const re = /\{\{\s*(\d+)\s*\}\}/g;
	let m;
	while ((m = re.exec(body)) !== null) set.add(m[1]);
	return Array.from(set).sort((a, b) => Number(a) - Number(b));
}
var STATUS_LABEL = {
	draft: "Draft (local)",
	pending: "Pending review",
	approved: "Approved",
	rejected: "Rejected",
	disabled: "Disabled"
};
function statusVariant(s) {
	switch (s) {
		case "approved": return "default";
		case "pending": return "secondary";
		case "rejected":
		case "disabled": return "destructive";
		default: return "outline";
	}
}
function TemplatesPage() {
	const { activeId, membership } = useActiveTenant();
	const allowed = canManage(membership?.role, "admin");
	const qc = useQueryClient();
	const navigate = useNavigate();
	(0, import_react.useEffect)(() => {
		if (membership?.role === "agent") navigate({
			to: "/dashboard",
			replace: true
		});
	}, [membership?.role, navigate]);
	const [search, setSearch] = (0, import_react.useState)("");
	const [tab, setTab] = (0, import_react.useState)("all");
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [creating, setCreating] = (0, import_react.useState)(false);
	const [previewing, setPreviewing] = (0, import_react.useState)(null);
	const [deleting, setDeleting] = (0, import_react.useState)(null);
	const { data: templates, isLoading } = useQuery({
		queryKey: ["templates", activeId],
		enabled: !!activeId,
		queryFn: async () => {
			const { data, error } = await supabase.from("message_templates").select("*").eq("tenant_id", activeId).is("deleted_at", null).order("updated_at", { ascending: false });
			if (error) throw error;
			return data ?? [];
		}
	});
	const filtered = (0, import_react.useMemo)(() => {
		let list = templates ?? [];
		if (tab !== "all") list = list.filter((t) => t.source === tab);
		if (search.trim()) {
			const q = search.toLowerCase();
			list = list.filter((t) => t.template_name.toLowerCase().includes(q) || (t.category ?? "").toLowerCase().includes(q) || t.body.toLowerCase().includes(q));
		}
		return list;
	}, [
		templates,
		search,
		tab
	]);
	const syncFn = useServerFn(syncMetaTemplates);
	const sync = useMutation({
		mutationFn: async () => syncFn({ data: { tenantId: activeId } }),
		onSuccess: (r) => {
			const removed = r.removed ?? 0;
			const removedMsg = removed ? ` · ${removed} marked rejected (no longer on Meta)` : "";
			toast.success(`Synced ${r.count} template${r.count === 1 ? "" : "s"} from Meta${removedMsg}`);
			qc.invalidateQueries({ queryKey: ["templates", activeId] });
		},
		onError: (e) => toast.error(e.message)
	});
	const submitFn = useServerFn(submitTemplateToMeta);
	const submit = useMutation({
		mutationFn: async (id) => submitFn({ data: {
			tenantId: activeId,
			templateId: id
		} }),
		onSuccess: (r) => {
			toast.success(r.status === "approved" ? "Template approved by Meta" : r.status === "rejected" ? "Meta rejected the template — see status for details" : "Submitted to Meta — pending review");
			qc.invalidateQueries({ queryKey: ["templates", activeId] });
		},
		onError: (e) => toast.error(e.message)
	});
	const softDelete = useMutation({
		mutationFn: async (id) => {
			const { error } = await supabase.from("message_templates").update({ deleted_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Template deleted");
			qc.invalidateQueries({ queryKey: ["templates", activeId] });
			setDeleting(null);
		},
		onError: (e) => toast.error(e.message)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-4 md:flex-row md:items-end md:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl md:text-3xl font-semibold tracking-tight",
					children: "Templates"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground mt-1",
					children: "Manage WhatsApp message templates. Sync approved templates from Meta or author internal drafts."
				})] }), allowed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						onClick: () => sync.mutate(),
						disabled: sync.isPending,
						children: [sync.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCcw, { className: "size-4" }), "Sync from Meta"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: () => setCreating(true),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), " New Template"]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tabs, {
					value: tab,
					onValueChange: (v) => setTab(v),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "all",
							children: "All"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "meta",
							children: "Meta"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "manual",
							children: "Manual"
						})
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative sm:w-72",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-2.5 top-2.5 size-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: search,
						onChange: (e) => setSearch(e.target.value),
						placeholder: "Search by name, category, body…",
						className: "pl-8"
					})]
				})]
			}),
			isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid place-items-center py-16 text-muted-foreground",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-6 animate-spin" })
			}) : filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
				icon: FileText,
				title: search ? "No matching templates" : "No templates yet",
				description: search ? "Try a different search term." : "Click \"Sync from Meta\" to pull approved templates, or create a manual draft."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4",
				children: filtered.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "flex flex-col",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
						className: "space-y-2 pb-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
									className: "text-base font-semibold leading-tight break-all",
									children: t.template_name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: statusVariant(t.sync_status),
									className: "shrink-0",
									children: STATUS_LABEL[t.sync_status]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap gap-1.5 text-xs",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "outline",
										children: t.language
									}),
									t.category && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "outline",
										children: t.category
									}),
									t.header_type === "IMAGE" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "outline",
										className: "bg-emerald-50 text-emerald-700 border-emerald-200",
										children: "IMAGE"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "outline",
										className: "capitalize",
										children: t.source
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
										variant: "outline",
										children: ["v", t.version]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
										variant: "outline",
										children: [
											(t.variables ?? []).length,
											" var",
											(t.variables ?? []).length === 1 ? "" : "s"
										]
									})
								]
							}),
							(t.submitted_at || t.last_sync_at) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-[11px] text-muted-foreground",
								children: [t.submitted_at && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
									"Submitted ",
									new Date(t.submitted_at).toLocaleDateString(),
									" · "
								] }), t.last_sync_at && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: ["Synced ", new Date(t.last_sync_at).toLocaleDateString()] })]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "flex-1 flex flex-col justify-between gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground line-clamp-4 whitespace-pre-wrap",
							children: t.body
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "ghost",
									onClick: () => setPreviewing(t),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-4" }), " Preview"]
								}),
								allowed && t.source === "manual" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "ghost",
									onClick: () => setEditing(t),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-4" }), " Edit"]
								}),
								allowed && t.source === "manual" && (t.sync_status === "draft" || t.sync_status === "rejected") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "secondary",
									disabled: submit.isPending,
									onClick: () => submit.mutate(t.id),
									children: [submit.isPending && submit.variables === t.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-4" }), "Submit to Meta"]
								}),
								allowed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "ghost",
									className: "text-destructive hover:text-destructive",
									onClick: () => setDeleting(t),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" }), " Delete"]
								})
							]
						})]
					})]
				}, t.id))
			}),
			(creating || editing) && activeId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TemplateEditor, {
				tenantId: activeId,
				template: editing,
				onClose: () => {
					setCreating(false);
					setEditing(null);
				},
				onSaved: () => qc.invalidateQueries({ queryKey: ["templates", activeId] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: !!previewing,
				onOpenChange: (o) => !o && setPreviewing(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-md",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
						className: "break-all",
						children: previewing?.template_name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: [
						previewing?.language,
						" · ",
						previewing?.category,
						" · v",
						previewing?.version
					] })] }), previewing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg bg-[#e7f3df] dark:bg-emerald-950/40 p-4 space-y-2 max-h-[60vh] overflow-y-auto",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg bg-background shadow-sm p-3 space-y-2 text-sm",
							children: [
								previewing.header_type === "IMAGE" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2 pb-2 border-b",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-xs font-semibold text-primary uppercase tracking-wider",
										children: "Header Type: IMAGE"
									}), previewing.example_media_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: previewing.example_media_url,
										alt: "Header Example",
										className: "max-h-40 rounded object-contain w-full bg-muted/20"
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-xs text-muted-foreground bg-muted p-2 rounded text-center",
										children: "Image required during campaign creation."
									})]
								}) : previewing.header && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-semibold",
									children: previewing.header
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "whitespace-pre-wrap",
									children: previewing.body
								}),
								previewing.footer && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs text-muted-foreground",
									children: previewing.footer
								})
							]
						}), (previewing.variables ?? []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-xs text-muted-foreground pt-2",
							children: ["Variables: ", (previewing.variables ?? []).map((v) => `{{${v}}}`).join(", ")]
						})]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
				open: !!deleting,
				onOpenChange: (o) => !o && setDeleting(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: "Delete this template?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogDescription, { children: [
					"\"",
					deleting?.template_name,
					"\" will be hidden from this workspace. Meta-sourced templates can be re-synced from Meta later."
				] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Cancel" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
					onClick: () => deleting && softDelete.mutate(deleting.id),
					className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
					children: "Delete"
				})] })] })
			})
		]
	});
}
function TemplateEditor({ tenantId, template, onClose, onSaved }) {
	const [name, setName] = (0, import_react.useState)(template?.template_name ?? "");
	const [language, setLanguage] = (0, import_react.useState)(template?.language ?? "en");
	const [category, setCategory] = (0, import_react.useState)(template?.category ?? "UTILITY");
	const [header, setHeader] = (0, import_react.useState)(template?.header ?? "");
	const [body, setBody] = (0, import_react.useState)(template?.body ?? "");
	const [footer, setFooter] = (0, import_react.useState)(template?.footer ?? "");
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [headerType, setHeaderType] = (0, import_react.useState)(template?.header_type ?? (template?.header ? "TEXT" : "NONE"));
	const [imageFile, setImageFile] = (0, import_react.useState)(null);
	const [imageUrl, setImageUrl] = (0, import_react.useState)(template?.example_media_url ?? "");
	const variables = (0, import_react.useMemo)(() => extractVariables(body), [body]);
	const save = async () => {
		if (!name.trim() || !body.trim()) {
			toast.error("Name and body are required");
			return;
		}
		if (!/^[a-z0-9_]+$/.test(name)) {
			toast.error("Name must be lowercase letters, numbers, or underscores");
			return;
		}
		if (headerType === "IMAGE" && !imageUrl) {
			toast.error("An example image is required for Image header templates");
			return;
		}
		setSaving(true);
		try {
			let uploadedUrl = imageUrl;
			if (headerType === "IMAGE" && imageFile) {
				const fileExt = imageFile.name.split(".").pop()?.toLowerCase();
				const filePath = `${tenantId}/templates/${`${Date.now()}.${fileExt}`}`;
				const { error: uploadError } = await supabase.storage.from("campaign-media").upload(filePath, imageFile);
				if (uploadError) throw uploadError;
				const { data: { publicUrl } } = supabase.storage.from("campaign-media").getPublicUrl(filePath);
				uploadedUrl = publicUrl;
			}
			const templatePayload = {
				template_name: name,
				language,
				category,
				header: headerType === "TEXT" ? header || null : null,
				body,
				footer: footer || null,
				variables,
				header_type: headerType,
				header_format: headerType,
				example_media_url: headerType === "IMAGE" ? uploadedUrl || null : null
			};
			if (template) {
				const versionBump = template.body !== body ? template.version + 1 : template.version;
				const { error } = await supabase.from("message_templates").update({
					...templatePayload,
					version: versionBump
				}).eq("id", template.id);
				if (error) throw error;
			} else {
				const { error } = await supabase.from("message_templates").insert({
					...templatePayload,
					tenant_id: tenantId,
					version: 1,
					source: "manual",
					sync_status: "draft"
				});
				if (error) throw error;
			}
			toast.success(template ? "Template updated" : "Template created");
			onSaved();
			onClose();
		} catch (e) {
			toast.error(e.message);
		} finally {
			setSaving(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: true,
		onOpenChange: (o) => !o && onClose(),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-2xl max-h-[90vh] overflow-y-auto",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: template ? "Edit template" : "New template" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: [
					"Use ",
					"{{1}}",
					", ",
					"{{2}}",
					"… in the body for variables. They map to contact fields when building a campaign."
				] })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-1 sm:grid-cols-3 gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "sm:col-span-2 space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "t-name",
									children: "Name"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "t-name",
									value: name,
									onChange: (e) => setName(e.target.value.toLowerCase()),
									placeholder: "order_confirmation",
									disabled: !!template
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "t-lang",
									children: "Language"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "t-lang",
									value: language,
									onChange: (e) => setLanguage(e.target.value),
									placeholder: "en"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Category" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: category,
								onValueChange: setCategory,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "MARKETING",
										children: "Marketing"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "UTILITY",
										children: "Utility"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "AUTHENTICATION",
										children: "Authentication"
									})
								] })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Header Type" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: headerType,
								onValueChange: (v) => setHeaderType(v),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select header type" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "NONE",
										children: "None"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "TEXT",
										children: "Text"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "IMAGE",
										children: "Image"
									})
								] })]
							})]
						}),
						headerType === "TEXT" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "t-header",
								children: "Header text (optional)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "t-header",
								value: header,
								onChange: (e) => setHeader(e.target.value)
							})]
						}),
						headerType === "IMAGE" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2 border rounded-lg p-3 bg-muted/20",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Header Image Example" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground",
									children: "Required for Meta template approval. (Max 5MB, JPG/JPEG/PNG only)."
								}),
								imageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: imageUrl,
										alt: "Template Header Preview",
										className: "max-h-40 rounded border object-contain bg-background"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "outline",
										className: "text-destructive border-destructive",
										onClick: () => {
											setImageUrl("");
											setImageFile(null);
										},
										children: "Remove Image"
									})]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex flex-col gap-2",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "file",
										accept: ".jpg,.jpeg,.png",
										onChange: async (e) => {
											const file = e.target.files?.[0];
											if (!file) return;
											if (file.size > 5 * 1024 * 1024) {
												toast.error("File exceeds maximum size of 5MB");
												return;
											}
											setImageFile(file);
											setImageUrl(URL.createObjectURL(file));
										}
									})
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "t-body",
									children: "Body"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									id: "t-body",
									value: body,
									onChange: (e) => setBody(e.target.value),
									rows: 6,
									placeholder: "Hello {{1}}, your order {{2}} is confirmed."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted-foreground",
									children: [
										"Detected variables:",
										" ",
										variables.length ? variables.map((v) => `{{${v}}}`).join(", ") : "none"
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "t-footer",
								children: "Footer (optional)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "t-footer",
								value: footer,
								onChange: (e) => setFooter(e.target.value)
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					onClick: onClose,
					disabled: saving,
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: save,
					disabled: saving,
					children: [saving && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }), template ? "Save changes" : "Create template"]
				})] })
			]
		})
	});
}
//#endregion
export { TemplatesPage as component };
