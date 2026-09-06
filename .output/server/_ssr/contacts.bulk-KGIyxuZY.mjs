import { o as __toESM } from "../_runtime.mjs";
import { y as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as useServerFn } from "./useServerFn-BqzygRuj.mjs";
import { t as supabase } from "./client-DTaxocpy.mjs";
import { n as useAuth } from "./use-auth-BLya4MAJ.mjs";
import { t as Button } from "./button-OuFjfcpS.mjs";
import { t as Input } from "./input-CITjGSX3.mjs";
import { t as Label } from "./label-BPuF5-mq.mjs";
import { t as Card } from "./card-xVPC106M.mjs";
import { i as useQueryClient, n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { Bt as CircleX, Ht as CircleCheck, K as ListChecks, Ut as CircleAlert } from "../_libs/lucide-react.mjs";
import { n as useActiveTenant } from "./use-tenant-DyGfRuCR.mjs";
import { t as Textarea } from "./textarea-1llmCJsE.mjs";
import { a as importContactsBulk } from "./contacts.functions-BFyqMXcx.mjs";
import { n as normalizePhone, t as dedupeNormalized } from "./phone-BQ3n_kyc.mjs";
import { n as CreatorMultiSelect } from "./CreatorMultiSelect-PZQF0l0b.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/contacts.bulk-KGIyxuZY.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function BulkAdd() {
	const { activeId } = useActiveTenant();
	const { user } = useAuth();
	const qc = useQueryClient();
	const importFn = useServerFn(importContactsBulk);
	const [text, setText] = (0, import_react.useState)("");
	const [countryCode, setCountryCode] = (0, import_react.useState)("91");
	const [optInSource, setOptInSource] = (0, import_react.useState)("");
	const [optInDate, setOptInDate] = (0, import_react.useState)((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
	const [tagIds, setTagIds] = (0, import_react.useState)([]);
	const [groupIds, setGroupIds] = (0, import_react.useState)([]);
	const [preview, setPreview] = (0, import_react.useState)(null);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const { data: tags } = useQuery({
		queryKey: ["tags", activeId],
		enabled: !!activeId,
		queryFn: async () => {
			const { data, error } = await supabase.from("tags").select("id, name").eq("tenant_id", activeId).order("name");
			if (error) throw error;
			return data ?? [];
		}
	});
	const { data: groups } = useQuery({
		queryKey: ["groups", activeId],
		enabled: !!activeId,
		queryFn: async () => {
			const { data, error } = await supabase.from("groups").select("id, name").eq("tenant_id", activeId).order("name");
			if (error) throw error;
			return data ?? [];
		}
	});
	async function handleCreateTag(name) {
		if (!activeId) throw new Error("No active tenant");
		const { data, error } = await supabase.from("tags").insert({
			tenant_id: activeId,
			name
		}).select("id").single();
		if (error) {
			toast.error(error.message);
			throw error;
		}
		toast.success(`Tag "${name}" created`);
		qc.invalidateQueries({ queryKey: ["tags"] });
		qc.invalidateQueries({ queryKey: ["tags-with-counts"] });
		return data.id;
	}
	async function handleCreateGroup(name) {
		if (!activeId || !user) throw new Error("No active tenant or user");
		const { data, error } = await supabase.from("groups").insert({
			tenant_id: activeId,
			name,
			created_by: user.id
		}).select("id").single();
		if (error) {
			toast.error(error.message);
			throw error;
		}
		toast.success(`Group "${name}" created`);
		qc.invalidateQueries({ queryKey: ["groups"] });
		qc.invalidateQueries({ queryKey: ["groups-with-counts"] });
		return data.id;
	}
	async function validate() {
		if (!activeId) return;
		const lines = text.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
		if (!lines.length) {
			toast.error("Paste at least one contact");
			return;
		}
		const normalized = lines.map((line) => {
			let name = "";
			let rawPhone = line;
			const sep = line.includes("	") ? "	" : ",";
			const firstSep = line.indexOf(sep);
			if (firstSep !== -1) {
				const part1 = line.slice(0, firstSep).trim();
				const part2 = line.slice(firstSep + 1).trim();
				const looksLikePhone = (s) => /^[\d\s\+\-\(\)]{6,}$/.test(s);
				if (looksLikePhone(part2) && !looksLikePhone(part1)) {
					name = part1;
					rawPhone = part2;
				} else if (looksLikePhone(part1) && !looksLikePhone(part2)) {
					name = part2;
					rawPhone = part1;
				} else if (looksLikePhone(part2)) {
					name = part1;
					rawPhone = part2;
				}
			}
			const normResult = normalizePhone(rawPhone, { defaultCountryCode: countryCode });
			return {
				raw: rawPhone,
				name,
				normalized: normResult.normalized,
				valid: normResult.valid,
				reason: normResult.reason
			};
		});
		const { duplicates } = dedupeNormalized(normalized);
		const dupSet = new Set(duplicates.map((d) => d.normalized));
		const validNumbers = normalized.filter((r) => r.valid && r.normalized).map((r) => r.normalized);
		const existingActive = /* @__PURE__ */ new Set();
		const existingDeleted = /* @__PURE__ */ new Set();
		if (validNumbers.length) {
			const { data } = await supabase.from("contacts").select("phone_number_normalized, deleted_at").eq("tenant_id", activeId).in("phone_number_normalized", validNumbers);
			for (const d of data ?? []) if (d.deleted_at) existingDeleted.add(d.phone_number_normalized);
			else existingActive.add(d.phone_number_normalized);
		}
		setPreview(normalized.map((r) => ({
			...r,
			isDuplicate: r.normalized ? dupSet.has(r.normalized) : false,
			isExisting: r.normalized ? existingActive.has(r.normalized) : false,
			wasDeleted: r.normalized ? existingDeleted.has(r.normalized) : false
		})));
	}
	const summary = (0, import_react.useMemo)(() => {
		if (!preview) return null;
		const seen = /* @__PURE__ */ new Set();
		let valid = 0;
		let invalid = 0;
		let duplicate = 0;
		let willSave = 0;
		let willRestore = 0;
		for (const r of preview) {
			if (!r.valid) {
				invalid++;
				continue;
			}
			valid++;
			if (r.isExisting || r.normalized && seen.has(r.normalized)) duplicate++;
			else {
				if (r.wasDeleted) willRestore++;
				else willSave++;
				if (r.normalized) seen.add(r.normalized);
			}
		}
		return {
			valid,
			invalid,
			duplicate,
			willSave,
			willRestore,
			willTotal: willSave + willRestore
		};
	}, [preview]);
	async function save() {
		if (!preview || !activeId || !user) return;
		setSaving(true);
		try {
			const seen = /* @__PURE__ */ new Set();
			const working = preview.filter((r) => r.valid && r.normalized && !r.isExisting).filter((r) => {
				if (seen.has(r.normalized)) return false;
				seen.add(r.normalized);
				return true;
			});
			if (!(await importFn({ data: {
				tenantId: activeId,
				sourceType: "bulk_paste",
				optInSource: optInSource || null,
				optInDate: optInSource ? optInDate : null,
				tagIds,
				groupIds,
				contacts: working.map((r) => ({
					raw: r.raw,
					normalized: r.normalized,
					name: r.name || null,
					wasDeleted: !!r.wasDeleted
				})),
				totalRows: preview.length,
				duplicateRows: summary?.duplicate ?? 0,
				invalidRows: summary?.invalid ?? 0
			} })).success) throw new Error("Bulk import failed");
			const totalProcessed = preview.length;
			const successfullyAdded = working.length;
			const duplicatesSkipped = summary?.duplicate ?? 0;
			const failedRecords = summary?.invalid ?? 0;
			toast.success("Import completed", { description: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1 mt-1 text-xs",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["• Total Processed: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: totalProcessed })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						"• Successfully Added: ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: successfullyAdded }),
						" (new + restored)"
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["• Duplicates Skipped: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: duplicatesSkipped })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["• Failed Records: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: failedRecords })] })
				]
			}) });
			setText("");
			setPreview(null);
			setTagIds([]);
			setGroupIds([]);
			qc.invalidateQueries({ queryKey: ["contacts"] });
			qc.invalidateQueries({ queryKey: ["dashboard-kpis"] });
			qc.invalidateQueries({ queryKey: ["groups"] });
			qc.invalidateQueries({ queryKey: ["groups-with-counts"] });
			qc.invalidateQueries({ queryKey: ["tags"] });
			qc.invalidateQueries({ queryKey: ["tags-with-counts"] });
		} catch (err) {
			toast.error(err.message || "Failed to save contacts");
		} finally {
			setSaving(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6 max-w-4xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl md:text-3xl font-semibold tracking-tight",
				children: "Bulk Paste Import"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground mt-1",
				children: "Paste contacts in \"Name,Phone\" or \"Phone only\" format, auto-deduplicate, and tag them inline."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "p-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "numbers",
							className: "mb-2 block font-medium",
							children: "Paste Contacts (Name, Phone or Phone only)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							id: "numbers",
							rows: 8,
							placeholder: `Paste contacts here...\nSupports:\nJohn Doe,919876543210\n919876543210,John Doe\n919876543210\nJohn Doe\t919876543210`,
							value: text,
							onChange: (e) => setText(e.target.value),
							className: "font-mono text-sm bg-background"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-1 md:grid-cols-2 gap-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "cc",
									className: "mb-2 block font-medium",
									children: "Default Country Code"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "cc",
									value: countryCode,
									onChange: (e) => setCountryCode(e.target.value.replace(/\D/g, "")),
									placeholder: "91"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "opt",
									className: "mb-2 block font-medium",
									children: "Opt-in Source"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "opt",
									value: optInSource,
									onChange: (e) => setOptInSource(e.target.value),
									placeholder: "e.g. Website checkout, Lead form"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "mb-2 block font-medium",
									children: "Opt-in Date"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "date",
									value: optInDate,
									onChange: (e) => setOptInDate(e.target.value)
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "mb-2 block font-medium",
									children: "Add Tags/Labels"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreatorMultiSelect, {
									options: (tags ?? []).map((t) => ({
										id: t.id,
										label: t.name
									})),
									value: tagIds,
									onChange: setTagIds,
									placeholder: "Select tags...",
									emptyLabel: "No tags yet. Type to create one inline.",
									onCreate: handleCreateTag
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "md:col-span-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "mb-2 block font-medium",
										children: "Add to Folder Groups"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreatorMultiSelect, {
										options: (groups ?? []).map((g) => ({
											id: g.id,
											label: g.name
										})),
										value: groupIds,
										onChange: setGroupIds,
										placeholder: "Select groups...",
										emptyLabel: "No groups yet. Type to create one inline.",
										onCreate: handleCreateGroup
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex justify-end pt-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								onClick: validate,
								disabled: !text.trim(),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListChecks, { className: "size-4 mr-1" }), " Validate Numbers"]
							})
						})
					]
				})
			}),
			preview && summary && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 md:grid-cols-4 gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryCard, {
							label: "Valid",
							value: summary.valid,
							tone: "success",
							icon: CircleCheck
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryCard, {
							label: "Duplicate",
							value: summary.duplicate,
							tone: "warning",
							icon: CircleAlert
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryCard, {
							label: "Invalid",
							value: summary.invalid,
							tone: "destructive",
							icon: CircleX
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryCard, {
							label: "Will Save",
							value: summary.willTotal,
							tone: "primary",
							icon: ListChecks
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "p-0 overflow-hidden border border-border",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "max-h-[300px] overflow-y-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
								className: "bg-muted text-muted-foreground sticky top-0 uppercase text-[10px] font-semibold",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "divide-x divide-border",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "text-left px-4 py-2 font-medium",
											children: "Name"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "text-left px-4 py-2 font-medium",
											children: "Original Raw"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "text-left px-4 py-2 font-medium",
											children: "Cleaned Normal"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "text-left px-4 py-2 font-medium",
											children: "Import Action"
										})
									]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
								className: "divide-y divide-border",
								children: preview.map((r, i) => {
									const status = !r.valid ? {
										label: r.reason ?? "Invalid",
										tone: "destructive"
									} : r.isExisting ? {
										label: "Already exists",
										tone: "warning"
									} : r.isDuplicate ? {
										label: "Duplicate in list",
										tone: "warning"
									} : r.wasDeleted ? {
										label: "Restoring soft-delete",
										tone: "success"
									} : {
										label: "New contact",
										tone: "success"
									};
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										className: "divide-x divide-border hover:bg-muted/10",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-4 py-2 text-foreground font-medium",
												children: r.name || "—"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-4 py-2 font-mono text-muted-foreground",
												children: r.raw
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-4 py-2 font-mono font-medium text-foreground",
												children: r.normalized ? `+${r.normalized}` : "—"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-4 py-2",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
													tone: status.tone,
													children: status.label
												})
											})
										]
									}, i);
								})
							})]
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "sticky bottom-4 flex justify-end gap-2 bg-card border rounded-xl p-4 shadow-lg",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: () => setPreview(null),
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: save,
						disabled: saving || summary.willTotal === 0,
						children: saving ? "Importing…" : `Save ${summary.willTotal} Contact${summary.willTotal === 1 ? "" : "s"}`
					})]
				})
			] })
		]
	});
}
function SummaryCard({ label, value, tone, icon: Icon }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
		className: "p-4 border border-border",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[10px] text-muted-foreground uppercase tracking-wider font-semibold",
				children: label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-2xl font-bold mt-1 tracking-tight",
				children: value
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "size-9 rounded-lg grid place-items-center " + (tone === "success" ? "bg-primary-soft text-primary" : tone === "warning" ? "bg-warning-soft text-warning-foreground" : tone === "destructive" ? "bg-destructive-soft text-destructive" : "bg-info-soft text-info"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4.5" })
			})]
		})
	});
}
function StatusBadge({ tone, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide " + (tone === "success" ? "bg-primary-soft text-primary" : tone === "warning" ? "bg-warning-soft text-warning-foreground" : "bg-destructive-soft text-destructive"),
		children
	});
}
//#endregion
export { BulkAdd as component };
