# Hostinger Deployment Guide

This project is configured to build a standard **Node.js HTTP server** so it runs on Hostinger's Node.js hosting (Premium / Business / Cloud / VPS plans). Shared hosting without Node.js support (PHP-only) is **not** compatible — TanStack Start is a server-rendered React app and requires a Node runtime.

## Requirements

- Hostinger plan with **Node.js application** support (hPanel → Advanced → Node.js, or VPS).
- Node.js **20 or newer**.
- npm.

## Build locally, upload artifacts

The most reliable flow on shared Node.js hosting:

```bash
npm install
npm run build        # produces .output/ (Node server + static assets)
```

Upload to your Hostinger Node.js app root:

- `.output/` (entire folder)
- `package.json`
- `.npmrc`

Then on the server:

```bash
npm install --omit=dev
npm start                 # runs: node .output/server/index.mjs
```

## Hostinger hPanel — Node.js app settings

| Setting              | Value                                  |
| -------------------- | -------------------------------------- |
| Node.js version      | 20.x or 22.x                           |
| Application root     | path to the uploaded folder            |
| Application URL      | your domain / subdomain                |
| Application startup file | `.output/server/index.mjs`         |
| Startup command      | `node .output/server/index.mjs`        |

The Nitro Node server reads `PORT` and `HOST` from the environment — Hostinger sets these automatically. No code changes needed.

## Environment variables

Set all required secrets in **hPanel → Node.js → Environment variables** (not in a committed `.env`):

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (and/or `SERVICE_ROLE_KEY`)
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (needed at **build time**, so set them before running `npm run build` locally — these are inlined into the client bundle)
- any provider keys (Meta WhatsApp tokens, etc.)

## Building on the server (alternative)

If your plan allows running build commands over SSH:

```bash
npm install
npm run build
npm start
```

## Notes & limitations

- **Static-only hosting will not work.** This app does SSR + has server functions and webhook routes — it needs a live Node process.
- **Cron / webhooks**: `pg_cron` (Supabase) calls `/api/public/hooks/process-campaigns` on your public URL — make sure the Hostinger domain is reachable and update the cron URL in the migration if needed.
- **Persistent process**: Hostinger's Node.js manager restarts the app automatically; you do **not** need PM2 on managed plans. On VPS, use PM2 or systemd.
- **Build preset override**: the default preset is `node-server` (see `vite.config.ts`). To target a different platform without editing the file, run `NITRO_PRESET=<preset> npm run build`.
