import { r as __exportAll$1 } from "../_runtime.mjs";
import { t as createClient } from "../_libs/supabase__supabase-js.mjs";
import { t as wrapper_default } from "../_libs/ws.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/client.server-Bs0W82-x.js
var client_server_Bs0W82_x_exports = /* @__PURE__ */ __exportAll$1({
	n: () => supabaseAdmin,
	t: () => client_server_exports
});
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var client_server_exports = /* @__PURE__ */ __exportAll({ supabaseAdmin: () => supabaseAdmin });
function envValue(...names) {
	for (const name of names) {
		const value = process.env[name]?.trim() || (typeof import.meta !== "undefined" ? {
			"BASE_URL": "/",
			"DEV": false,
			"MODE": "production",
			"PROD": true,
			"SSR": true,
			"TSS_DEV_SERVER": "false",
			"TSS_DEV_SSR_STYLES_BASEPATH": "/",
			"TSS_DEV_SSR_STYLES_ENABLED": "true",
			"TSS_DISABLE_CSRF_MIDDLEWARE_WARNING": "false",
			"TSS_INLINE_CSS_ENABLED": "false",
			"TSS_ROUTER_BASEPATH": "",
			"TSS_SERVER_FN_BASE": "/_serverFn/",
			"VITE_SUPABASE_PROJECT_ID": "aewhmojiyybnnxhbpizt",
			"VITE_SUPABASE_PUBLISHABLE_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFld2htb2ppeXlibm54aGJwaXp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3NjA3NjMsImV4cCI6MjA5NzMzNjc2M30.oYWnUNbmJjvkEZbep4cG5MRJJA82RE_F3hZYw4qQiBk",
			"VITE_SUPABASE_URL": "https://aewhmojiyybnnxhbpizt.supabase.co"
		}[name]?.trim() : void 0);
		if (value) return value;
	}
}
function createSupabaseAdminClient() {
	const SUPABASE_URL = envValue("SUPABASE_URL", "VITE_SUPABASE_URL");
	const SUPABASE_SERVICE_ROLE_KEY = envValue("SUPABASE_SERVICE_ROLE_KEY", "SERVICE_ROLE_KEY");
	if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
		const message = `Missing Supabase environment variable(s): ${[...!SUPABASE_URL ? ["SUPABASE_URL"] : [], ...!SUPABASE_SERVICE_ROLE_KEY ? ["SUPABASE_SERVICE_ROLE_KEY"] : []].join(", ")}. Please configure Supabase environment variables.`;
		console.error(`[Supabase] ${message}`);
		throw new Error(message);
	}
	return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
		auth: {
			storage: void 0,
			persistSession: false,
			autoRefreshToken: false
		},
		realtime: { transport: wrapper_default }
	});
}
var supabaseAdminInstance;
function getSupabaseAdminClient() {
	if (!supabaseAdminInstance) supabaseAdminInstance = createSupabaseAdminClient();
	return supabaseAdminInstance;
}
var supabaseAdmin = new Proxy({}, { get(_, prop) {
	const client = getSupabaseAdminClient();
	const value = Reflect.get(client, prop, client);
	return typeof value === "function" ? value.bind(client) : value;
} });
//#endregion
export { supabaseAdmin as n, client_server_Bs0W82_x_exports as t };
