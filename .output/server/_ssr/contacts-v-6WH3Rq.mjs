import { y as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { f as Outlet, g as Link, l as useLocation } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/contacts-v-6WH3Rq.js
var import_jsx_runtime = require_jsx_runtime();
var tabs = [
	{
		to: "/contacts",
		label: "All Contacts",
		exact: true
	},
	{
		to: "/contacts/bulk",
		label: "Bulk Add"
	},
	{
		to: "/contacts/import",
		label: "CSV Import"
	},
	{
		to: "/contacts/tags",
		label: "Tags & Groups"
	}
];
function ContactsLayout() {
	const location = useLocation();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl md:text-3xl font-semibold tracking-tight",
				children: "Contacts"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground mt-1",
				children: "Manage your WhatsApp audience — add, import, tag, and group."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border-b border-border",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "flex gap-1 -mb-px overflow-x-auto",
					children: tabs.map((t) => {
						const isActive = t.exact ? location.pathname === t.to : location.pathname === t.to || location.pathname.startsWith(t.to + "/");
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: t.to,
							className: cn("px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap", isActive ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"),
							children: t.label
						}, t.to);
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
		]
	});
}
//#endregion
export { ContactsLayout as component };
