
DROP POLICY IF EXISTS "Members view recipients" ON public.campaign_recipients;
CREATE POLICY "Manager+ view recipients" ON public.campaign_recipients
  FOR SELECT TO authenticated
  USING (public.has_tenant_role(tenant_id, auth.uid(), 'owner'::tenant_role, 'admin'::tenant_role, 'manager'::tenant_role));

DROP POLICY IF EXISTS "Members write audit" ON public.audit_logs;

REVOKE EXECUTE ON FUNCTION public.lookup_user_id_by_email(uuid, text) FROM PUBLIC, anon;

CREATE OR REPLACE FUNCTION public.normalize_phone(_raw text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
  SELECT regexp_replace(COALESCE(_raw,''), '\D', '', 'g');
$function$;
