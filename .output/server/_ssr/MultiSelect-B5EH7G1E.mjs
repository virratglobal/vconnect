import { o as __toESM } from "../_runtime.mjs";
import { y as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { n as X, pt as ChevronsUpDown, vt as Check } from "../_libs/lucide-react.mjs";
import { n as PopoverContent, r as PopoverTrigger, t as Popover } from "./popover-C4q8I-xJ.mjs";
import { a as CommandItem, i as CommandInput, n as CommandEmpty, o as CommandList, r as CommandGroup, t as Command$1 } from "./command-CX5OQ8y4.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/MultiSelect-B5EH7G1E.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function MultiSelect({ options, value, onChange, placeholder = "Select…", emptyLabel = "No options" }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const selectedSet = new Set(value);
	const selected = options.filter((o) => selectedSet.has(o.id));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, {
		open,
		onOpenChange: setOpen,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				className: "w-full flex items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm min-h-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-1 flex-1 text-left",
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
							className: "hover:opacity-70",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3" })
						})]
					}, s.id))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronsUpDown, { className: "size-4 text-muted-foreground shrink-0" })]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverContent, {
			className: "w-[--radix-popover-trigger-width] p-0",
			align: "start",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Command$1, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandInput, { placeholder: "Search…" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandList, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandEmpty, { children: emptyLabel }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandGroup, { children: options.map((o) => {
				const isSel = selectedSet.has(o.id);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
					onSelect: () => {
						if (isSel) onChange(value.filter((v) => v !== o.id));
						else onChange([...value, o.id]);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: cn("size-4 mr-2", isSel ? "opacity-100 text-primary" : "opacity-0") }), o.label]
				}, o.id);
			}) })] })] })
		})]
	});
}
//#endregion
export { MultiSelect as t };
