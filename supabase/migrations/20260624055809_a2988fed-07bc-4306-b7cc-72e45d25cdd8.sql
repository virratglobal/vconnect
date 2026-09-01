
-- 1. Restrict webhook_verify_token column on tenants
REVOKE SELECT (webhook_verify_token) ON public.tenants FROM authenticated, anon;

CREATE OR REPLACE FUNCTION public.get_webhook_verify_token(_tenant uuid)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _token text;
BEGIN
  IF NOT public.has_tenant_role(_tenant, auth.uid(), 'owner'::tenant_role, 'admin'::tenant_role) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  SELECT webhook_verify_token INTO _token FROM public.tenants WHERE id = _tenant;
  RETURN _token;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_webhook_verify_token(uuid) TO authenticated;

-- 2. Restrict campaign_logs SELECT to manager+
DROP POLICY IF EXISTS "Members view campaign logs" ON public.campaign_logs;

CREATE POLICY "Manager+ view campaign logs"
  ON public.campaign_logs
  FOR SELECT
  TO authenticated
  USING (public.has_tenant_role(tenant_id, auth.uid(), 'owner'::tenant_role, 'admin'::tenant_role, 'manager'::tenant_role));

-- 3. Prevent self-role escalation on tenant_members
CREATE OR REPLACE FUNCTION public.prevent_self_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.user_id = auth.uid() AND NEW.role <> 'agent'::tenant_role THEN
      -- Allow the tenant creator trigger (handle_new_tenant) to still insert owner rows
      IF auth.uid() IS NOT NULL THEN
        IF NOT EXISTS (
          SELECT 1 FROM public.tenants 
          WHERE id = NEW.tenant_id AND created_by = NEW.user_id
        ) THEN
          RAISE EXCEPTION 'Users cannot assign elevated roles to themselves';
        END IF;
      END IF;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.user_id = auth.uid() AND NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'Users cannot change their own role';
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.user_id = auth.uid() AND OLD.role = 'owner'::tenant_role THEN
      -- Allow only if another owner exists
      IF (SELECT count(*) FROM public.tenant_members WHERE tenant_id = OLD.tenant_id AND role = 'owner'::tenant_role AND user_id <> OLD.user_id) = 0 THEN
        RAISE EXCEPTION 'Cannot remove the last owner of a tenant';
      END IF;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_self_role_change ON public.tenant_members;
CREATE TRIGGER trg_prevent_self_role_change
  BEFORE INSERT OR UPDATE OR DELETE ON public.tenant_members
  FOR EACH ROW EXECUTE FUNCTION public.prevent_self_role_change();

-- 4. Pin search_path on functions missing it
ALTER FUNCTION public.generate_webhook_verify_token() SET search_path = 'public';
ALTER FUNCTION public.protect_webhook_verify_token() SET search_path = 'public';
ALTER FUNCTION public.sync_message_to_conversation_message() SET search_path = 'public';
