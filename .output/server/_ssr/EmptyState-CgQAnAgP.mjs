import { y as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { t as Card } from "./card-xVPC106M.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/EmptyState-CgQAnAgP.js
var import_jsx_runtime = require_jsx_runtime();
function EmptyState({ icon: Icon, title, description, action }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "p-16 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "size-14 rounded-2xl bg-primary-soft text-primary grid place-items-center mx-auto mb-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-7" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-semibold text-lg",
				children: title
			}),
			description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground mt-1 max-w-md mx-auto",
				children: description
			}),
			action && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4",
				children: action
			})
		]
	});
}
//#endregion
export { EmptyState as t };
