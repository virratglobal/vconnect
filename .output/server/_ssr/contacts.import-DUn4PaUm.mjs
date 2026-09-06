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
import { t as Switch } from "./switch-C_mzcXif.mjs";
import { i as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { N as Phone, U as Mail, bt as Building, ct as Database, d as Upload, h as Tag, o as Users, rt as FileSpreadsheet, s as User } from "../_libs/lucide-react.mjs";
import { n as useActiveTenant } from "./use-tenant-DyGfRuCR.mjs";
import { a as importContactsBulk } from "./contacts.functions-BFyqMXcx.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-BHv1JhlL.mjs";
import { n as normalizePhone } from "./phone-BQ3n_kyc.mjs";
import { t as require_papaparse } from "../_libs/papaparse.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/contacts.import-DUn4PaUm.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_papaparse = /* @__PURE__ */ __toESM(require_papaparse());
function ImportPage() {
	const { activeId } = useActiveTenant();
	const { user } = useAuth();
	const qc = useQueryClient();
	const importFn = useServerFn(importContactsBulk);
	const [file, setFile] = (0, import_react.useState)(null);
	const [csvHeaders, setCsvHeaders] = (0, import_react.useState)([]);
	const [csvData, setCsvData] = (0, import_react.useState)(null);
	const [countryCode, setCountryCode] = (0, import_react.useState)("91");
	const [importing, setImporting] = (0, import_react.useState)(false);
	const [autoCreate, setAutoCreate] = (0, import_react.useState)(true);
	const [mappings, setMappings] = (0, import_react.useState)({
		name: "",
		phone: "",
		email: "",
		company: "",
		tags: "",
		groups: ""
	});
	function detectAndSetMappings(headers) {
		const nextMappings = {
			name: "",
			phone: "",
			email: "",
			company: "",
			tags: "",
			groups: ""
		};
		const normalized = headers.map((h) => h.toLowerCase().trim());
		const nameIdx = normalized.findIndex((h) => [
			"name",
			"full name",
			"contact name",
			"customer name"
		].includes(h));
		if (nameIdx !== -1) nextMappings.name = headers[nameIdx];
		const phoneIdx = normalized.findIndex((h) => [
			"phone",
			"mobile",
			"number",
			"whatsapp",
			"phone number",
			"normalized phone"
		].some((p) => h.includes(p)));
		if (phoneIdx !== -1) nextMappings.phone = headers[phoneIdx];
		const emailIdx = normalized.findIndex((h) => [
			"email",
			"mail",
			"email address"
		].includes(h));
		if (emailIdx !== -1) nextMappings.email = headers[emailIdx];
		const companyIdx = normalized.findIndex((h) => [
			"company",
			"org",
			"organization",
			"firm",
			"business"
		].includes(h));
		if (companyIdx !== -1) nextMappings.company = headers[companyIdx];
		const tagsIdx = normalized.findIndex((h) => [
			"tags",
			"tag",
			"labels",
			"label"
		].includes(h));
		if (tagsIdx !== -1) nextMappings.tags = headers[tagsIdx];
		const groupsIdx = normalized.findIndex((h) => [
			"groups",
			"group",
			"lists",
			"list"
		].includes(h));
		if (groupsIdx !== -1) nextMappings.groups = headers[groupsIdx];
		setMappings(nextMappings);
	}
	function handleFile(f) {
		setFile(f);
		import_papaparse.default.parse(f, {
			header: true,
			skipEmptyLines: true,
			complete: (result) => {
				const data = result.data;
				if (!data.length) {
					toast.error("CSV file is empty");
					return;
				}
				const headers = Object.keys(data[0]);
				setCsvHeaders(headers);
				setCsvData(data);
				detectAndSetMappings(headers);
			},
			error: (err) => toast.error(err.message)
		});
	}
	async function runImport() {
		if (!csvData || !activeId || !user) return;
		if (!mappings.phone) {
			toast.error("Please map the required Phone column.");
			return;
		}
		setImporting(true);
		try {
			const parsedRows = csvData.map((row) => {
				return {
					row,
					tags: mappings.tags && row[mappings.tags] ? row[mappings.tags].split(",").map((t) => t.trim()).filter(Boolean) : [],
					groups: mappings.groups && row[mappings.groups] ? row[mappings.groups].split(",").map((g) => g.trim()).filter(Boolean) : []
				};
			});
			const [existingTagsRes, existingGroupsRes] = await Promise.all([supabase.from("tags").select("id, name").eq("tenant_id", activeId), supabase.from("groups").select("id, name").eq("tenant_id", activeId)]);
			const tagsMap = /* @__PURE__ */ new Map();
			const groupsMap = /* @__PURE__ */ new Map();
			existingTagsRes.data?.forEach((t) => tagsMap.set(t.name.toLowerCase(), t.id));
			existingGroupsRes.data?.forEach((g) => groupsMap.set(g.name.toLowerCase(), g.id));
			const allTagNames = Array.from(new Set(parsedRows.flatMap((r) => r.tags)));
			const allGroupNames = Array.from(new Set(parsedRows.flatMap((r) => r.groups)));
			if (autoCreate) {
				const missingTags = allTagNames.filter((t) => !tagsMap.has(t.toLowerCase()));
				if (missingTags.length) {
					const { data: newTags, error: tagErr } = await supabase.from("tags").insert(missingTags.map((name) => ({
						tenant_id: activeId,
						name
					}))).select("id, name");
					if (tagErr) throw tagErr;
					newTags?.forEach((t) => tagsMap.set(t.name.toLowerCase(), t.id));
				}
				const missingGroups = allGroupNames.filter((g) => !groupsMap.has(g.toLowerCase()));
				if (missingGroups.length) {
					const { data: newGroups, error: groupErr } = await supabase.from("groups").insert(missingGroups.map((name) => ({
						tenant_id: activeId,
						name,
						created_by: user.id
					}))).select("id, name");
					if (groupErr) throw groupErr;
					newGroups?.forEach((g) => groupsMap.set(g.name.toLowerCase(), g.id));
				}
			}
			const seen = /* @__PURE__ */ new Set();
			const valid = [];
			let invalid = 0;
			let duplicate = 0;
			for (const item of parsedRows) {
				const rawPhone = item.row[mappings.phone];
				if (!rawPhone) {
					invalid++;
					continue;
				}
				const n = normalizePhone(rawPhone, { defaultCountryCode: countryCode });
				if (!n.valid || !n.normalized) {
					invalid++;
					continue;
				}
				if (seen.has(n.normalized)) {
					duplicate++;
					continue;
				}
				seen.add(n.normalized);
				const mappedTags = item.tags.map((name) => tagsMap.get(name.toLowerCase())).filter(Boolean);
				const mappedGroups = item.groups.map((name) => groupsMap.get(name.toLowerCase())).filter(Boolean);
				valid.push({
					raw: n.raw,
					normalized: n.normalized,
					name: mappings.name ? item.row[mappings.name]?.trim() : void 0,
					email: mappings.email ? item.row[mappings.email]?.trim() : void 0,
					company: mappings.company ? item.row[mappings.company]?.trim() : void 0,
					tags: mappedTags,
					groups: mappedGroups
				});
			}
			const existingActive = /* @__PURE__ */ new Set();
			const existingDeleted = /* @__PURE__ */ new Map();
			if (valid.length) {
				const { data } = await supabase.from("contacts").select("id, phone_number_normalized, deleted_at").eq("tenant_id", activeId).in("phone_number_normalized", valid.map((v) => v.normalized));
				for (const d of data ?? []) if (d.deleted_at) existingDeleted.set(d.phone_number_normalized, d.id);
				else existingActive.add(d.phone_number_normalized);
			}
			const toInsert = valid.filter((v) => !existingActive.has(v.normalized) && !existingDeleted.has(v.normalized));
			const toRestore = valid.filter((v) => existingDeleted.has(v.normalized));
			duplicate += valid.length - toInsert.length - toRestore.length;
			if (!(await importFn({ data: {
				tenantId: activeId,
				sourceType: "csv",
				optInSource: null,
				optInDate: null,
				tagIds: [],
				groupIds: [],
				contacts: valid.map((v) => ({
					raw: v.raw,
					normalized: v.normalized,
					name: v.name ?? null,
					email: v.email ?? null,
					company: v.company ?? null,
					wasDeleted: existingDeleted.has(v.normalized),
					tags: v.tags,
					groups: v.groups
				})),
				totalRows: csvData.length,
				duplicateRows: duplicate,
				invalidRows: invalid
			} })).success) throw new Error("CSV import failed");
			const successfullyAdded = toInsert.length + toRestore.length;
			toast.success("Import completed", { description: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1 mt-1 text-xs",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["• Total Processed: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: csvData.length })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["• Successfully Added: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: successfullyAdded })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["• Duplicates Skipped: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: duplicate })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["• Invalid Records: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: invalid })] })
				]
			}) });
			setFile(null);
			setCsvData(null);
			setCsvHeaders([]);
			setMappings({
				name: "",
				phone: "",
				email: "",
				company: "",
				tags: "",
				groups: ""
			});
			qc.invalidateQueries({ queryKey: ["contacts"] });
			qc.invalidateQueries({ queryKey: ["dashboard-kpis"] });
			qc.invalidateQueries({ queryKey: ["groups"] });
			qc.invalidateQueries({ queryKey: ["groups-with-counts"] });
			qc.invalidateQueries({ queryKey: ["tags"] });
			qc.invalidateQueries({ queryKey: ["tags-with-counts"] });
		} catch (err) {
			toast.error(err.message || "Import failed");
		} finally {
			setImporting(false);
		}
	}
	function downloadTemplate() {
		const blob = new Blob(["name,phone\nJohn Doe,919876543210\nJane Smith,918888888888\nRahul Patil,917777777777\n"], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.setAttribute("download", "contacts_template.csv");
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6 max-w-4xl",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-2xl md:text-3xl font-semibold tracking-tight",
			children: "Import Contacts"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground mt-1",
			children: "Upload bulk lists via CSV. Maps columns directly to contact fields."
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-1 lg:grid-cols-3 gap-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "lg:col-span-2 space-y-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "p-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "mb-2 block font-medium",
							children: "CSV Upload File"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "border-2 border-dashed border-border rounded-xl p-10 text-center cursor-pointer hover:border-primary block transition hover:bg-muted/10",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "size-8 mx-auto text-muted-foreground mb-2" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-semibold text-sm",
									children: file ? file.name : "Click to select CSV file"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs text-muted-foreground mt-1 mb-2",
									children: "Select a comma-separated file to map headers. Name and Phone columns are recommended."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "link",
									size: "sm",
									className: "text-primary hover:text-primary/80 font-medium h-auto p-0",
									onClick: (e) => {
										e.preventDefault();
										e.stopPropagation();
										downloadTemplate();
									},
									children: "Download CSV Template (name, phone)"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "file",
									accept: ".csv,text/csv",
									className: "hidden",
									onChange: (e) => e.target.files?.[0] && handleFile(e.target.files[0])
								})
							]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "cc",
									className: "font-medium text-xs",
									children: "Default Country Code"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "cc",
									value: countryCode,
									onChange: (e) => setCountryCode(e.target.value.replace(/\D/g, "")),
									placeholder: "91"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-col justify-end pb-1.5",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center space-x-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
										id: "autoCreate",
										checked: autoCreate,
										onCheckedChange: setAutoCreate
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "autoCreate",
										className: "cursor-pointer text-xs",
										children: "Auto-create tags & groups"
									})]
								})
							})]
						})]
					})
				}), csvData && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between mb-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
							className: "font-semibold text-sm flex items-center gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileSpreadsheet, { className: "size-4 text-primary" }), " Map Preview (First 5 Rows)"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground mt-0.5",
							children: [
								"Verifying ",
								csvData.length,
								" records. Inspect mapped values below."
							]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: runImport,
							disabled: importing || !mappings.phone,
							children: importing ? "Processing…" : `Run Import (${csvData.length} rows)`
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "overflow-x-auto border border-border rounded-lg",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
								className: "bg-muted text-muted-foreground sticky top-0 text-[10px] uppercase font-semibold",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "divide-x divide-border",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-3 py-2 text-left",
											children: "Name"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-3 py-2 text-left",
											children: "Phone (Req)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-3 py-2 text-left",
											children: "Email"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-3 py-2 text-left",
											children: "Company"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-3 py-2 text-left",
											children: "Tags"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-3 py-2 text-left",
											children: "Groups"
										})
									]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
								className: "divide-y divide-border",
								children: csvData.slice(0, 5).map((row, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "divide-x divide-border hover:bg-muted/10",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-3 py-2",
											children: mappings.name ? row[mappings.name] || "—" : "—"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-3 py-2 font-mono text-primary font-medium",
											children: mappings.phone ? row[mappings.phone] || "—" : "—"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-3 py-2",
											children: mappings.email ? row[mappings.email] || "—" : "—"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-3 py-2",
											children: mappings.company ? row[mappings.company] || "—" : "—"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-3 py-2 font-mono text-[10px] max-w-[150px] truncate",
											children: mappings.tags ? row[mappings.tags] || "—" : "—"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-3 py-2 font-mono text-[10px] max-w-[150px] truncate",
											children: mappings.groups ? row[mappings.groups] || "—" : "—"
										})
									]
								}, i))
							})]
						})
					})]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-5 space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
					className: "font-semibold text-sm flex items-center gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Database, { className: "size-4 text-primary" }), " Column Mappings"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground mt-0.5",
					children: "Link spreadsheet headers to your CRM fields."
				})] }), !csvHeaders.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-xs text-muted-foreground py-6 text-center",
					children: "Upload a CSV file to configure header mapping."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3.5 pt-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
								className: "text-xs font-semibold flex items-center gap-1.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "size-3 text-primary" }),
									" Phone Number",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-destructive",
										children: "*"
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: mappings.phone,
								onValueChange: (val) => setMappings((prev) => ({
									...prev,
									phone: val
								})),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									className: "h-9 text-xs",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select column…" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: csvHeaders.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: h,
									className: "text-xs",
									children: h
								}, h)) })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
								className: "text-xs font-semibold flex items-center gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "size-3" }), " Full Name"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: mappings.name,
								onValueChange: (val) => setMappings((prev) => ({
									...prev,
									name: val
								})),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									className: "h-9 text-xs",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Skip mapping" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "",
									className: "text-xs",
									children: "Skip mapping"
								}), csvHeaders.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: h,
									className: "text-xs",
									children: h
								}, h))] })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
								className: "text-xs font-semibold flex items-center gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "size-3" }), " Email Address"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: mappings.email,
								onValueChange: (val) => setMappings((prev) => ({
									...prev,
									email: val
								})),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									className: "h-9 text-xs",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Skip mapping" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "",
									className: "text-xs",
									children: "Skip mapping"
								}), csvHeaders.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: h,
									className: "text-xs",
									children: h
								}, h))] })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
								className: "text-xs font-semibold flex items-center gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building, { className: "size-3" }), " Company"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: mappings.company,
								onValueChange: (val) => setMappings((prev) => ({
									...prev,
									company: val
								})),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									className: "h-9 text-xs",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Skip mapping" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "",
									className: "text-xs",
									children: "Skip mapping"
								}), csvHeaders.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: h,
									className: "text-xs",
									children: h
								}, h))] })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
								className: "text-xs font-semibold flex items-center gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { className: "size-3" }), " Labels/Tags (Comma list)"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: mappings.tags,
								onValueChange: (val) => setMappings((prev) => ({
									...prev,
									tags: val
								})),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									className: "h-9 text-xs",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Skip mapping" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "",
									className: "text-xs",
									children: "Skip mapping"
								}), csvHeaders.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: h,
									className: "text-xs",
									children: h
								}, h))] })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
								className: "text-xs font-semibold flex items-center gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-3" }), " Groups/Folders (Comma list)"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: mappings.groups,
								onValueChange: (val) => setMappings((prev) => ({
									...prev,
									groups: val
								})),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									className: "h-9 text-xs",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Skip mapping" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "",
									className: "text-xs",
									children: "Skip mapping"
								}), csvHeaders.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: h,
									className: "text-xs",
									children: h
								}, h))] })]
							})]
						})
					]
				})]
			}) })]
		})]
	});
}
//#endregion
export { ImportPage as component };
