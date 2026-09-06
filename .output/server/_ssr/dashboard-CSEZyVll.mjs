import { m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
import { l as createServerFn } from "./esm-9EjmF9OT.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-BBYtZ6z0.mjs";
import { t as createSsrRpc } from "./createSsrRpc-yL5s594f.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard-CSEZyVll.js
var $$splitComponentImporter = () => import("./dashboard-CX33Pioo.mjs");
var getOrganizationHealth = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).inputValidator((d) => d).handler(createSsrRpc("84426d3d35133b0a3cca6f6e7c2fdc5ea35b9d50f9d59c04d5ca784f49a9e9d2"));
var Route = createFileRoute("/_authenticated/dashboard")({
	head: () => ({ meta: [{ title: "Dashboard · Virrat Reach" }] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { getOrganizationHealth as n, Route as t };
