-- 1. Drop the unique constraint on tenant_id on whatsapp_credentials
ALTER TABLE public.whatsapp_credentials DROP CONSTRAINT IF EXISTS whatsapp_credentials_tenant_id_key;

-- 2. Add allowance setting for admins to public.tenants
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS allow_admin_whatsapp_config BOOLEAN NOT NULL DEFAULT TRUE;

-- 3. Add is_default and account_name columns to whatsapp_credentials
ALTER TABLE public.whatsapp_credentials ADD COLUMN IF NOT EXISTS is_default BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.whatsapp_credentials ADD COLUMN IF NOT EXISTS account_name TEXT NOT NULL DEFAULT 'Primary Number';

-- 4. Backfill existing credentials to set is_default to true
UPDATE public.whatsapp_credentials SET is_default = TRUE WHERE is_default = FALSE;

-- 5. Create unique index to guarantee at most one default credentials row per tenant
CREATE UNIQUE INDEX IF NOT EXISTS idx_whatsapp_credentials_tenant_default 
  ON public.whatsapp_credentials (tenant_id) 
  WHERE (is_default = true);

-- 6. Add connection health columns to whatsapp_credentials
ALTER TABLE public.whatsapp_credentials 
  ADD COLUMN IF NOT EXISTS last_successful_message_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_incoming_webhook_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS graph_api_version TEXT NOT NULL DEFAULT 'v20.0',
  ADD COLUMN IF NOT EXISTS token_expiry_at TIMESTAMPTZ;

-- 7. Secure connection status checking function (RPC)
CREATE OR REPLACE FUNCTION public.get_whatsapp_status(_tenant_id UUID)
RETURNS TABLE (
  connected BOOLEAN,
  display_phone_number TEXT,
  status TEXT,
  last_success_at TIMESTAMPTZ,
  last_failure_at TIMESTAMPTZ
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Check if user is a member of the tenant
  IF NOT public.is_tenant_member(_tenant_id, auth.uid()) THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT 
    (w.phone_number_id IS NOT NULL AND w.access_token IS NOT NULL) AS connected,
    w.display_phone_number,
    w.status,
    w.last_success_at,
    w.last_failure_at
  FROM public.whatsapp_credentials w
  WHERE w.tenant_id = _tenant_id AND w.is_default = TRUE
  LIMIT 1;
END; $$;

GRANT EXECUTE ON FUNCTION public.get_whatsapp_status(UUID) TO authenticated;

-- 8. Revise RLS policies on public.whatsapp_credentials
DROP POLICY IF EXISTS "Owners manage credentials" ON public.whatsapp_credentials;
DROP POLICY IF EXISTS "Owner/Admin manage credentials" ON public.whatsapp_credentials;
DROP POLICY IF EXISTS "Owner/Admin/Manager view credentials" ON public.whatsapp_credentials;

-- Owners can always manage (ALL). Admins can manage if allow_admin_whatsapp_config is true.
CREATE POLICY "Owner/Admin manage credentials" ON public.whatsapp_credentials
  FOR ALL TO authenticated
  USING (
    public.has_tenant_role(tenant_id, auth.uid(), 'owner')
    OR (
      public.has_tenant_role(tenant_id, auth.uid(), 'admin')
      AND EXISTS (
        SELECT 1 FROM public.tenants t
        WHERE t.id = tenant_id AND t.allow_admin_whatsapp_config = TRUE
      )
    )
  )
  WITH CHECK (
    public.has_tenant_role(tenant_id, auth.uid(), 'owner')
    OR (
      public.has_tenant_role(tenant_id, auth.uid(), 'admin')
      AND EXISTS (
        SELECT 1 FROM public.tenants t
        WHERE t.id = tenant_id AND t.allow_admin_whatsapp_config = TRUE
      )
    )
  );

-- Owner, Admin, and Manager can SELECT credentials (masked on frontend)
CREATE POLICY "Owner/Admin/Manager view credentials" ON public.whatsapp_credentials
  FOR SELECT TO authenticated
  USING (public.has_tenant_role(tenant_id, auth.uid(), 'owner', 'admin', 'manager'));
