import { m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
import { l as createServerFn } from "./esm-9EjmF9OT.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-BBYtZ6z0.mjs";
import { t as createSsrRpc } from "./createSsrRpc-yL5s594f.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-BvZIF22Z.js
var $$splitComponentImporter = () => import("./settings-mhasy2_O.mjs");
var deleteOrganization = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => d).handler(createSsrRpc("6dc32d7f4b92c8e4470ff6be8ad5336162bab4ff415d0e288b4f4f879c74e95f"));
var getWhatsAppConfig = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).inputValidator((d) => d).handler(createSsrRpc("4cbecaef7fbb8557762a9b3ab912600208de5ddb3b4cb35e5b4042800c75fc05"));
var saveWhatsAppConfig = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => d).handler(createSsrRpc("c0ee1c71cd012ba410476afd2d07b1227f9a9ad09cf44b0b97055af0eba56dff"));
var getMetaDiagnostics = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).inputValidator((d) => d).handler(createSsrRpc("61c3f582cdac0a308798c6b257e9376ad59856a8acc668e76d7acb35a572e6dd"));
var getWebhookStats = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).inputValidator((d) => d).handler(createSsrRpc("16b339b55d60c49ef121d8e456281924ec22ba9a53c97b4d5dd76e01637c6b9a"));
createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => d).handler(createSsrRpc("4bee8307c28c32b7730f8c750801efcf2d76c6b5b4f240f075a9057fd8276d99"));
var Route = createFileRoute("/_authenticated/settings")({
	head: () => ({ meta: [{ title: "Settings · Virrat Reach" }] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { getWhatsAppConfig as a, getWebhookStats as i, deleteOrganization as n, saveWhatsAppConfig as o, getMetaDiagnostics as r, Route as t };
