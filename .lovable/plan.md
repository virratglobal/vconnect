## Problem

Saving Meta/WhatsApp credentials fails with:
> Missing Supabase environment variable(s): SUPABASE_SERVICE_ROLE_KEY

The server code (`src/integrations/supabase/client.server.ts`) already reads either `SUPABASE_SERVICE_ROLE_KEY` or `SERVICE_ROLE_KEY`, and both are listed as configured in the project secrets. So the runtime isn't actually receiving the value — most likely the stored secret is empty/corrupted, or the server function is running on a build (published site) that predates the fallback.

## Fix Plan

1. **Reset the service role secret via the secure form**
   Call `update_secret` for `SUPABASE_SERVICE_ROLE_KEY` (and `SERVICE_ROLE_KEY` as backup) so you paste the current `service_role` key from the Supabase dashboard fresh. This eliminates any corrupted/empty stored value.
   - Get the key from: Supabase Dashboard → Project Settings → API → **service_role** (secret) key.

2. **Verify preview picks it up**
   After you submit the form, retry saving credentials on the **preview** URL. The server function reads env at call time, so no rebuild is needed for preview.

3. **Re-publish for production**
   If you were testing on `whats-crm-virrat.lovable.app`, click **Publish → Update** so the deployed bundle also has access to the refreshed env.

4. **If it still fails after step 2**, add a one-line diagnostic log inside `createSupabaseAdminClient` printing which env var names were seen (names only, never values) so we can confirm what the runtime actually receives, then remove it once fixed.

No code changes are required unless step 4 is needed.