import fs from "fs";
import path from "path";
//#region node_modules/.nitro/vite/services/ssr/index.js
var lastCapturedError;
var TTL_MS = 5e3;
function record(error) {
	lastCapturedError = {
		error,
		at: Date.now()
	};
}
if (typeof process !== "undefined" && typeof process.on === "function") {
	process.on("uncaughtException", (error) => record(error));
	process.on("unhandledRejection", (reason) => record(reason));
} else if (typeof globalThis.addEventListener === "function") {
	globalThis.addEventListener("error", (event) => record(event.error ?? event));
	globalThis.addEventListener("unhandledrejection", (event) => record(event.reason));
}
function consumeLastCapturedError() {
	if (!lastCapturedError) return void 0;
	if (Date.now() - lastCapturedError.at > TTL_MS) {
		lastCapturedError = void 0;
		return;
	}
	const { error } = lastCapturedError;
	lastCapturedError = void 0;
	return error;
}
function renderErrorPage(error) {
	const errorStr = error instanceof Error ? `${error.message}\n${error.stack}` : error ? String(error) : "";
	return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>This page didn't load</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font: 15px/1.5 system-ui, -apple-system, sans-serif; background: #fafafa; color: #111; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 32rem; width: 100%; text-align: center; padding: 2rem; }
      h1 { font-size: 1.25rem; margin: 0 0 0.5rem; }
      p { color: #4b5563; margin: 0 0 1.5rem; }
      .actions { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
      a, button { padding: 0.5rem 1rem; border-radius: 0.375rem; font: inherit; cursor: pointer; text-decoration: none; border: 1px solid transparent; }
      .primary { background: #111; color: #fff; }
      .secondary { background: #fff; color: #111; border-color: #d1d5db; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>This page didn't load</h1>
      ${errorStr ? `<pre style="text-align: left; background: #fee2e2; border: 1px solid #fca5a5; color: #991b1b; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 11px; font-family: monospace; margin-bottom: 1.5rem; white-space: pre-wrap; word-break: break-all;">${errorStr}</pre>` : ""}
      <p>Something went wrong on our end. You can try refreshing or head back home.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Try again</button>
        <a class="secondary" href="/">Go home</a>
      </div>
    </div>
  </body>
</html>`;
}
var ENV_SEARCH_PATHS = [
	path.resolve(process.cwd(), ".env"),
	path.resolve(process.cwd(), "../.env"),
	path.resolve(process.cwd(), "../../.env"),
	"/home/u152968057/domains/convexa.virratglobal.com/nodejs/.env",
	"/home/u152968057/domains/convexa.virratglobal.com/.env"
];
function loadEnvFile(filePath) {
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
				if (val.startsWith("\"") && val.endsWith("\"") || val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
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
var envLoaded = false;
for (const envPath of ENV_SEARCH_PATHS) if (loadEnvFile(envPath)) {
	envLoaded = true;
	break;
}
if (!envLoaded) console.warn(`[env] No .env file found. Falling back to system environment variables.`);
var serverEntryPromise;
async function getServerEntry() {
	if (!serverEntryPromise) serverEntryPromise = import("./server-CgHyxlLp.mjs").then((m) => m.default ?? m);
	return serverEntryPromise;
}
async function logErrorToDb(error, request) {
	try {
		const { supabaseAdmin } = await import("./client.server-Ck2b02Cx.mjs").then((n) => n.t).then((n) => n.t);
		const errorStr = error instanceof Error ? `${error.message}\n${error.stack}` : String(error);
		await supabaseAdmin.from("system_errors").insert({
			type: "server_uncaught",
			error: errorStr,
			context: {
				url: request.url,
				method: request.method,
				headers: Object.fromEntries(request.headers.entries())
			}
		});
	} catch (logErr) {
		console.error("Failed to log error to database:", logErr);
	}
}
async function normalizeCatastrophicSsrResponse(response, request) {
	if (response.status < 500) return response;
	if (!(response.headers.get("content-type") ?? "").includes("application/json")) return response;
	const body = await response.clone().text();
	if (!body.includes("\"unhandled\":true") || !body.includes("\"message\":\"HTTPError\"")) return response;
	const lastError = consumeLastCapturedError() ?? /* @__PURE__ */ new Error(`h3 swallowed SSR error: ${body}`);
	console.error(lastError);
	await logErrorToDb(lastError, request);
	return new Response(renderErrorPage(lastError), {
		status: 500,
		headers: { "content-type": "text/html; charset=utf-8" }
	});
}
var server_default = { async fetch(request, env, ctx) {
	try {
		return await normalizeCatastrophicSsrResponse(await (await getServerEntry()).fetch(request, env, ctx), request);
	} catch (error) {
		console.error(error);
		await logErrorToDb(error, request);
		return new Response(renderErrorPage(error), {
			status: 500,
			headers: { "content-type": "text/html; charset=utf-8" }
		});
	}
} };
//#endregion
export { server_default as default, renderErrorPage as t };
