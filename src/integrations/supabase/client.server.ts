// Server-side Supabase client with service role key - bypasses RLS.
// Use this for admin operations in server functions and server routes only.
// For user-authenticated queries (with RLS), use the auth middleware instead.
import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";
import type { Database } from "./types";

function envValue(...names: string[]) {
  for (const name of names) {
    const value =
      process.env[name]?.trim() ||
      (typeof import.meta !== "undefined" ? import.meta.env?.[name]?.trim() : undefined);
    if (value) return value;
  }
  return undefined;
}

function createSupabaseAdminClient() {
  const SUPABASE_URL = envValue("SUPABASE_URL", "VITE_SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = envValue("SUPABASE_SERVICE_ROLE_KEY", "SERVICE_ROLE_KEY");

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    const missing = [
      ...(!SUPABASE_URL ? ["SUPABASE_URL"] : []),
      ...(!SUPABASE_SERVICE_ROLE_KEY ? ["SUPABASE_SERVICE_ROLE_KEY"] : []),
    ];
    const message = `Missing Supabase environment variable(s): ${missing.join(", ")}. Please configure Supabase environment variables.`;
    console.error(`[Supabase] ${message}`);
    throw new Error(message);
  }

  // Server-side Supabase client with service role - bypasses RLS
  // SECURITY: Only use this for trusted server-side operations, never expose to client code
  return createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    },
    realtime: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transport: WebSocket as any,
    },
  });
}

type SupabaseAdminClient = ReturnType<typeof createSupabaseAdminClient>;

let supabaseAdminInstance: SupabaseAdminClient | undefined;

function getSupabaseAdminClient() {
  if (!supabaseAdminInstance) supabaseAdminInstance = createSupabaseAdminClient();
  return supabaseAdminInstance;
}

export const supabaseAdmin: SupabaseAdminClient = new Proxy({} as SupabaseAdminClient, {
  get(_, prop) {
    const client = getSupabaseAdminClient();
    const value = Reflect.get(client, prop, client);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

