
-- 1. Functions: pin search_path
CREATE OR REPLACE FUNCTION public.get_contacts_messages_counts(_contact_ids uuid[])
 RETURNS TABLE(contact_id uuid, count bigint)
 LANGUAGE sql SECURITY DEFINER SET search_path TO 'public'
AS $function$
  SELECT contact_id, COUNT(*) as count
  FROM public.messages
  WHERE contact_id = ANY(_contact_ids)
  GROUP BY contact_id;
$function$;

CREATE OR REPLACE FUNCTION public.set_contact_created_by()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.created_by IS NULL AND auth.uid() IS NOT NULL THEN
    NEW.created_by := auth.uid();
  END IF;
  IF NEW.source IS NULL THEN
    NEW.source := 'manual';
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_conversation_initial_assignee()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.assigned_to IS NULL AND NEW.contact_id IS NOT NULL THEN
    SELECT created_by INTO NEW.assigned_to
    FROM public.contacts
    WHERE id = NEW.contact_id;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_whatsapp_status(_tenant_id uuid)
 RETURNS TABLE(connected boolean, display_phone_number text, status text, last_success_at timestamp with time zone, last_failure_at timestamp with time zone)
 LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.is_tenant_member(_tenant_id, auth.uid()) THEN
    RETURN;
  END IF;
  RETURN QUERY
  SELECT 
    (w.phone_number_id IS NOT NULL AND w.access_token IS NOT NULL) AS connected,
    w.display_phone_number, w.status, w.last_success_at, w.last_failure_at
  FROM public.whatsapp_credentials w
  WHERE w.tenant_id = _tenant_id AND w.is_default = TRUE
  LIMIT 1;
END;
$function$;

-- 2. tenants.webhook_verify_token: revoke column from regular roles
REVOKE SELECT (webhook_verify_token) ON public.tenants FROM anon, authenticated;

-- 3. tenant_branding: restrict SELECT to tenant members / super admin
DROP POLICY IF EXISTS "Allow select of branding for all authenticated users" ON public.tenant_branding;
CREATE POLICY "Members view their tenant branding"
  ON public.tenant_branding FOR SELECT
  USING (is_tenant_member(tenant_id, auth.uid()) OR is_super_admin(auth.uid()));

-- 4. conversations: split overly-broad ALL policy
DROP POLICY IF EXISTS "Conversations manage policy" ON public.conversations;

CREATE POLICY "Conversations insert by tenant members"
  ON public.conversations FOR INSERT
  WITH CHECK (is_tenant_member(tenant_id, auth.uid()));

CREATE POLICY "Conversations update by authorized users"
  ON public.conversations FOR UPDATE
  USING (
    has_tenant_role(tenant_id, auth.uid(), 'owner'::tenant_role, 'admin'::tenant_role, 'manager'::tenant_role)
    OR assigned_to = auth.uid()
  )
  WITH CHECK (
    has_tenant_role(tenant_id, auth.uid(), 'owner'::tenant_role, 'admin'::tenant_role, 'manager'::tenant_role)
    OR assigned_to = auth.uid()
  );

CREATE POLICY "Conversations delete by owner/admin/manager"
  ON public.conversations FOR DELETE
  USING (has_tenant_role(tenant_id, auth.uid(), 'owner'::tenant_role, 'admin'::tenant_role, 'manager'::tenant_role));
