-- Add super admin flag to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_super_admin boolean NOT NULL DEFAULT false;

-- Add suspended status to tenants
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS suspended boolean NOT NULL DEFAULT false;

-- Enable Super Admin ONLY for mail@virratglobal.com
UPDATE public.profiles SET is_super_admin = (email = 'mail@virratglobal.com');

-- Helper to check if a user is a super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN COALESCE((SELECT is_super_admin FROM public.profiles WHERE id = _user_id), false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- RPC: Get all tenants with statistics
CREATE OR REPLACE FUNCTION public.super_admin_get_tenants()
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  suspended boolean,
  created_at timestamptz,
  member_count bigint,
  contact_count bigint,
  campaign_count bigint
) AS $$
BEGIN
  IF NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Forbidden: Only super admins can list tenants';
  END IF;

  RETURN QUERY
  SELECT 
    t.id,
    t.name,
    t.slug,
    t.suspended,
    t.created_at,
    (SELECT count(*) FROM public.tenant_members tm WHERE tm.tenant_id = t.id) AS member_count,
    (SELECT count(*) FROM public.contacts c WHERE c.tenant_id = t.id AND c.deleted_at IS NULL) AS contact_count,
    (SELECT count(*) FROM public.campaigns cmp WHERE cmp.tenant_id = t.id) AS campaign_count
  FROM public.tenants t
  ORDER BY t.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- RPC: Get platform analytics KPIs
CREATE OR REPLACE FUNCTION public.super_admin_get_analytics()
RETURNS jsonb AS $$
DECLARE
  _total_tenants bigint;
  _active_tenants bigint;
  _total_contacts bigint;
  _total_campaigns bigint;
  _total_messages_sent bigint;
BEGIN
  IF NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Forbidden: Only super admins can view analytics';
  END IF;

  SELECT count(*) INTO _total_tenants FROM public.tenants;
  SELECT count(*) INTO _active_tenants FROM public.tenants WHERE NOT suspended;
  SELECT count(*) INTO _total_contacts FROM public.contacts WHERE deleted_at IS NULL;
  SELECT count(*) INTO _total_campaigns FROM public.campaigns;
  SELECT COALESCE(sum(processed_count), 0) INTO _total_messages_sent FROM public.campaigns;

  RETURN jsonb_build_object(
    'total_tenants', _total_tenants,
    'active_tenants', _active_tenants,
    'total_contacts', _total_contacts,
    'total_campaigns', _total_campaigns,
    'total_messages_sent', _total_messages_sent
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- RPC: Get consolidated error logs
CREATE OR REPLACE FUNCTION public.super_admin_get_system_errors()
RETURNS TABLE (
  id uuid,
  tenant_name text,
  type text,
  error text,
  context jsonb,
  created_at timestamptz
) AS $$
BEGIN
  IF NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Forbidden: Only super admins can read error logs';
  END IF;

  RETURN QUERY
  SELECT 
    se.id,
    t.name AS tenant_name,
    se.type,
    se.error,
    se.context,
    se.created_at
  FROM public.system_errors se
  LEFT JOIN public.tenants t ON se.tenant_id = t.id
  ORDER BY se.created_at DESC
  LIMIT 100;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- RPC: Suspend or activate a tenant
CREATE OR REPLACE FUNCTION public.super_admin_toggle_tenant_status(_tenant_id uuid, _suspended boolean)
RETURNS boolean AS $$
BEGIN
  IF NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Forbidden: Only super admins can change tenant status';
  END IF;

  UPDATE public.tenants
  SET suspended = _suspended, updated_at = now()
  WHERE id = _tenant_id;

  INSERT INTO public.audit_logs (tenant_id, user_id, action, entity_type, entity_id, metadata)
  VALUES (
    _tenant_id, 
    auth.uid(), 
    CASE WHEN _suspended THEN 'tenant_suspend' ELSE 'tenant_activate' END, 
    'tenant', 
    _tenant_id, 
    jsonb_build_object('suspended', _suspended)
  );

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- RPC: Start tenant impersonation session
CREATE OR REPLACE FUNCTION public.start_impersonating_tenant(_tenant_id uuid)
RETURNS boolean AS $$
DECLARE
  _caller_id uuid;
  _caller_email text;
BEGIN
  _caller_id := auth.uid();
  
  IF NOT public.is_super_admin(_caller_id) THEN
    RAISE EXCEPTION 'Forbidden: Only super admins can impersonate';
  END IF;
  
  SELECT email INTO _caller_email FROM public.profiles WHERE id = _caller_id;

  -- Add caller as 'owner' of target tenant
  INSERT INTO public.tenant_members (tenant_id, user_id, role)
  VALUES (_tenant_id, _caller_id, 'owner')
  ON CONFLICT (tenant_id, user_id) DO UPDATE SET role = 'owner';

  -- Log action
  INSERT INTO public.audit_logs (tenant_id, user_id, action, entity_type, entity_id, metadata)
  VALUES (_tenant_id, _caller_id, 'impersonation_start', 'tenant', _tenant_id, jsonb_build_object('impersonator_email', _caller_email));

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- RPC: Stop impersonating
CREATE OR REPLACE FUNCTION public.stop_impersonating_tenant(_tenant_id uuid)
RETURNS boolean AS $$
DECLARE
  _caller_id uuid;
  _caller_email text;
BEGIN
  _caller_id := auth.uid();
  
  IF NOT public.is_super_admin(_caller_id) THEN
    RAISE EXCEPTION 'Forbidden: Only super admins can stop impersonating';
  END IF;

  SELECT email INTO _caller_email FROM public.profiles WHERE id = _caller_id;

  -- Remove caller from target tenant members
  DELETE FROM public.tenant_members
  WHERE tenant_id = _tenant_id AND user_id = _caller_id;

  -- Log action
  INSERT INTO public.audit_logs (tenant_id, user_id, action, entity_type, entity_id, metadata)
  VALUES (_tenant_id, _caller_id, 'impersonation_stop', 'tenant', _tenant_id, jsonb_build_object('impersonator_email', _caller_email));

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant permissions to authenticated users to invoke the RPCs
GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.super_admin_get_tenants() TO authenticated;
GRANT EXECUTE ON FUNCTION public.super_admin_get_analytics() TO authenticated;
GRANT EXECUTE ON FUNCTION public.super_admin_get_system_errors() TO authenticated;
GRANT EXECUTE ON FUNCTION public.super_admin_toggle_tenant_status(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.start_impersonating_tenant(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.stop_impersonating_tenant(uuid) TO authenticated;
