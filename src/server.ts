import fs from "fs";
import path from "path";

// Try to load .env from multiple candidate locations
// Hostinger's working directory may differ from the app root
const ENV_SEARCH_PATHS = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "../.env"),
  path.resolve(process.cwd(), "../../.env"),
  "/home/u152968057/domains/convexa.virratglobal.com/nodejs/.env",
  "/home/u152968057/domains/convexa.virratglobal.com/.env",
];

function loadEnvFile(filePath: string): boolean {
  try {
    if (!fs.existsSync(filePath)) return false;
    const content = fs.readFileSync(filePath, "utf8");
    let loaded = 0;
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const index = trimmed.indexOf("=");
      if (index > 0) {
        const key = trimmed.slice(0, index).trim();
        let val = trimmed.slice(index + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        // Only set if not already set (respect real environment variables)
        if (!process.env[key]) {
          process.env[key] = val;
          loaded++;
        }
      }
    }
    console.log(`[env] Loaded ${loaded} variables from ${filePath}`);
    return true;
  } catch (e) {
    console.error(`[env] Failed to load ${filePath}:`, e);
    return false;
  }
}

// Try each path in order until one succeeds
let envLoaded = false;
for (const envPath of ENV_SEARCH_PATHS) {
  if (loadEnvFile(envPath)) {
    envLoaded = true;
    break;
  }
}

if (!envLoaded) {
  console.warn(`[env] No .env file found. Falling back to system environment variables.`);
}

import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

async function logErrorToDb(error: unknown, request: Request) {
  try {
    const { supabaseAdmin } = await import("./integrations/supabase/client.server");
    const errorStr = error instanceof Error ? `${error.message}\n${error.stack}` : String(error);
    await supabaseAdmin.from("system_errors").insert({
      type: "server_uncaught",
      error: errorStr,
      context: {
        url: request.url,
        method: request.method,
        headers: Object.fromEntries(request.headers.entries()),
      },
    });
  } catch (logErr) {
    console.error("Failed to log error to database:", logErr);
  }
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response, request: Request): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!body.includes('"unhandled":true') || !body.includes('"message":"HTTPError"')) {
    return response;
  }

  const lastError = consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`);
  console.error(lastError);
  await logErrorToDb(lastError, request);

  return new Response(renderErrorPage(lastError), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response, request);
    } catch (error) {
      console.error(error);
      await logErrorToDb(error, request);
      return new Response(renderErrorPage(error), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
