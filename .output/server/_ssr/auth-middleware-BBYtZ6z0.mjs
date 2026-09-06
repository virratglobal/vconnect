import { t as createClient } from "../_libs/supabase__supabase-js.mjs";
import { t as wrapper_default } from "../_libs/ws.mjs";
import { t as createMiddleware } from "./createStart-Dt05N14y.mjs";
import { f as getRequest } from "./esm-9EjmF9OT.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-middleware-BBYtZ6z0.js
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
			"VITE_SUPABASE_PUBLISHABLE_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFld2htb2ppeXlibm54aGJwaXp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3NjA3NjMsImV4cCI6MjA5NzMzNjc2M30.oYWnUNbmJjvkEZbep4cG5MRJJA82RE_F3hZYw4qQiBk"
		}[name]?.trim() : void 0);
		if (value) return value;
	}
}
var requireSupabaseAuth = createMiddleware({ type: "function" }).server(async ({ next }) => {
	const SUPABASE_URL = envValue("SUPABASE_URL", "VITE_SUPABASE_URL");
	const SUPABASE_PUBLISHABLE_KEY = envValue("SUPABASE_PUBLISHABLE_KEY", "VITE_SUPABASE_PUBLISHABLE_KEY", "SUPABASE_ANON_KEY", "VITE_SUPABASE_ANON_KEY");
	if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
		const message = `Missing Supabase environment variable(s): ${[...!SUPABASE_URL ? ["SUPABASE_URL"] : [], ...!SUPABASE_PUBLISHABLE_KEY ? ["SUPABASE_PUBLISHABLE_KEY"] : []].join(", ")}. Please configure Supabase environment variables.`;
		console.error(`[Supabase] ${message}`);
		throw new Error(message);
	}
	const request = getRequest();
	if (!request?.headers) throw new Error("Unauthorized: No request headers available");
	const authHeader = request.headers.get("authorization");
	if (!authHeader) throw new Error("Unauthorized: No authorization header provided");
	if (!authHeader.startsWith("Bearer ")) throw new Error("Unauthorized: Only Bearer tokens are supported");
	const token = authHeader.replace("Bearer ", "");
	if (!token) throw new Error("Unauthorized: No token provided");
	const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
		global: { headers: { Authorization: `Bearer ${token}` } },
		auth: {
			storage: void 0,
			persistSession: false,
			autoRefreshToken: false
		},
		realtime: { transport: wrapper_default }
	});
	const { data, error } = await supabase.auth.getClaims(token);
	if (error || !data?.claims) throw new Error("Unauthorized: Invalid token");
	if (!data.claims.sub) throw new Error("Unauthorized: No user ID found in token");
	return next({ context: {
		supabase,
		userId: data.claims.sub,
		claims: data.claims
	} });
});
//#endregion
export { requireSupabaseAuth as t };
