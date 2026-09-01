import { o as __toESM } from "../_runtime.mjs";
import { y as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { n as CheckboxIndicator, t as Checkbox$1 } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { It as LoaderCircle, n as X, pt as ChevronsUpDown, vt as Check } from "../_libs/lucide-react.mjs";
import { n as PopoverContent, r as PopoverTrigger, t as Popover } from "./popover-C4q8I-xJ.mjs";
import { a as CommandItem, i as CommandInput, o as CommandList, r as CommandGroup, t as Command$1 } from "./command-CX5OQ8y4.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/CreatorMultiSelect-PZQF0l0b.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Checkbox = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox$1, {
	ref,
	className: cn("grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckboxIndicator, {
		className: cn("grid place-content-center text-current"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" })
	})
}));
Checkbox.displayName = Checkbox$1.displayName;
function CreatorMultiSelect({ options, value, onChange, placeholder = "Select…", emptyLabel = "No options", onCreate }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [search, setSearch] = (0, import_react.useState)("");
	const [creating, setCreating] = (0, import_react.useState)(false);
	const selectedSet = new Set(value);
	const selected = options.filter((o) => selectedSet.has(o.id));
	const hasExactMatch = options.some((o) => o.label.toLowerCase() === search.trim().toLowerCase());
	async function handleCreate() {
		if (!onCreate || !search.trim()) return;
		setCreating(true);
		try {
			const newId = await onCreate(search.trim());
			onChange([...value, newId]);
			setSearch("");
		} catch {} finally {
			setCreating(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, {
		open,
		onOpenChange: setOpen,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				className: "w-full flex items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm min-h-10 text-left",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-1 flex-1",
					children: selected.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-muted-foreground",
						children: placeholder
					}) : selected.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "inline-flex items-center gap-1 rounded-full bg-primary-soft text-primary px-2 py-0.5 text-xs font-medium",
						children: [s.label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							role: "button",
							onClick: (e) => {
								e.stopPropagation();
								onChange(value.filter((v) => v !== s.id));
							},
							className: "hover:opacity-70 ml-0.5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3" })
						})]
					}, s.id))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronsUpDown, { className: "size-4 text-muted-foreground shrink-0" })]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverContent, {
			className: "w-[--radix-popover-trigger-width] p-0",
			align: "start",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Command$1, {
				shouldFilter: true,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandInput, {
					placeholder: "Search or type to create…",
					value: search,
					onValueChange: setSearch
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandList, { children: [search.trim() && !hasExactMatch && onCreate && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandGroup, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
					onSelect: handleCreate,
					disabled: creating,
					className: "text-primary font-medium cursor-pointer",
					children: [
						creating ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3 animate-spin mr-2" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mr-2 font-bold",
							children: "+"
						}),
						"Create new \"",
						search.trim(),
						"\""
					]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandGroup, { children: [options.length === 0 && !search.trim() && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "py-6 text-center text-sm text-muted-foreground",
					children: emptyLabel
				}), options.map((o) => {
					const isSel = selectedSet.has(o.id);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
						value: o.label,
						onSelect: () => {
							if (isSel) onChange(value.filter((v) => v !== o.id));
							else onChange([...value, o.id]);
						},
						className: "flex items-center gap-2 cursor-pointer",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
							checked: isSel,
							onCheckedChange: () => {},
							className: "pointer-events-none"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: o.label })]
					}, o.id);
				})] })] })]
			})
		})]
	});
}
//#endregion
export { CreatorMultiSelect as n, Checkbox as t };
