// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Hostinger compatibility:
// - Inside the Lovable sandbox, the plugin force-pins the Cloudflare preset (ignored below).
// - Outside the sandbox (your own `npm run build` for Hostinger), Nitro emits a standard
//   Node.js HTTP server at `.output/server/index.mjs`, with static assets in `.output/public`.
// - The preset can also be overridden at build time via the `NITRO_PRESET` env var
//   (e.g. `NITRO_PRESET=node-server npm run build`) without editing this file.
export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  nitro: {
    preset: process.env.VERCEL ? "vercel" : "node-server",
  },
});
