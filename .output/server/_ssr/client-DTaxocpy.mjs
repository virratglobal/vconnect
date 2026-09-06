import { t as createClient } from "../_libs/supabase__supabase-js.mjs";
import { t as wrapper_default } from "../_libs/ws.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/client-DTaxocpy.js
function envValue(...values) {
	for (const value of values) {
		const trimmed = value?.trim();
		if (trimmed) return trimmed;
	}
}
function createSupabaseClient() {
	const SUPABASE_URL = envValue(typeof import.meta !== "undefined" ? void 0 : void 0, typeof process !== "undefined" ? process.env?.SUPABASE_URL : void 0, typeof process !== "undefined" ? process.env?.VITE_SUPABASE_URL : void 0);
	const SUPABASE_PUBLISHABLE_KEY = envValue(typeof import.meta !== "undefined" ? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFld2htb2ppeXlibm54aGJwaXp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3NjA3NjMsImV4cCI6MjA5NzMzNjc2M30.oYWnUNbmJjvkEZbep4cG5MRJJA82RE_F3hZYw4qQiBk" : void 0, typeof process !== "undefined" ? process.env?.SUPABASE_PUBLISHABLE_KEY : void 0, typeof process !== "undefined" ? process.env?.VITE_SUPABASE_PUBLISHABLE_KEY : void 0, typeof process !== "undefined" ? process.env?.SUPABASE_ANON_KEY : void 0, typeof process !== "undefined" ? process.env?.VITE_SUPABASE_ANON_KEY : void 0);
	if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
		const message = `Missing Supabase environment variable(s): ${[...!SUPABASE_URL ? ["SUPABASE_URL"] : [], ...!SUPABASE_PUBLISHABLE_KEY ? ["SUPABASE_PUBLISHABLE_KEY"] : []].join(", ")}. Please configure Supabase environment variables.`;
		console.error(`[Supabase] ${message}`);
		throw new Error(message);
	}
	return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
		auth: {
			storage: typeof window !== "undefined" ? localStorage : void 0,
			persistSession: true,
			autoRefreshToken: true
		},
		realtime: { transport: typeof window === "undefined" ? wrapper_default : void 0 }
	});
}
var _supabase;
function getSupabaseClient() {
	if (!_supabase) _supabase = createSupabaseClient();
	return _supabase;
}
var supabase = new Proxy({}, { get(_, prop) {
	const client = getSupabaseClient();
	const value = Reflect.get(client, prop, client);
	return typeof value === "function" ? value.bind(client) : value;
} });
//#endregion
export { supabase as t };
