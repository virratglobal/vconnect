import { m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
import { l as createServerFn } from "./esm-9EjmF9OT.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-BBYtZ6z0.mjs";
import { t as createSsrRpc } from "./createSsrRpc-yL5s594f.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/account-settings-BSXiW5JP.js
var $$splitComponentImporter = () => import("./account-settings--lhBM_uj.mjs");
var deleteUserAccount = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("35592131e0d2acf66b6bb2b63b9f56aae11d40b0999708f5c33803c1b5648373"));
var Route = createFileRoute("/_authenticated/account-settings")({
	head: () => ({ meta: [{ title: "Account Settings · Virrat Reach" }] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { deleteUserAccount as n, Route as t };
