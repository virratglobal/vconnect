import { m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
import { l as createServerFn } from "./esm-9EjmF9OT.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-BBYtZ6z0.mjs";
import { t as createSsrRpc } from "./createSsrRpc-yL5s594f.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/super-admin-CMW5zTCN.js
var $$splitComponentImporter = () => import("./super-admin-Cdiir1em.mjs");
var superAdminGetUsers = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("52c0b988083b7c6e12ef841728698d151f34246c99e3ce72d1390286ba571a5c"));
var superAdminDeleteUser = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => d).handler(createSsrRpc("f485651a715e735897b2eb4c2006ce690023b9207b587c922565ec6a3d7f187d"));
var Route = createFileRoute("/_authenticated/super-admin")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
//#endregion
export { superAdminDeleteUser as n, superAdminGetUsers as r, Route as t };
