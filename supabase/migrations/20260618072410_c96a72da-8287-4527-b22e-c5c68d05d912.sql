
-- Allow tenant members to view profiles of co-members (so member list can show emails)
CREATE OR REPLACE FUNCTION public.shares_tenant_with(_other uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.tenant_members a
    JOIN public.tenant_members b ON a.tenant_id = b.tenant_id
    WHERE a.user_id = auth.uid() AND b.user_id = _other
  );
$$;

DROP POLICY IF EXISTS "View co-member profiles" ON public.profiles;
CREATE POLICY "View co-member profiles" ON public.profiles
FOR SELECT TO authenticated
USING (public.shares_tenant_with(id));

-- Secure invite-by-email lookup. Only owners of the given tenant may resolve
-- another user's id from their email. Returns NULL if no match.
CREATE OR REPLACE FUNCTION public.lookup_user_id_by_email(_tenant uuid, _email text)
RETURNS uuid
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid;
BEGIN
  IF NOT public.has_tenant_role(_tenant, auth.uid(), 'owner'::tenant_role) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  SELECT id INTO _uid FROM public.profiles WHERE lower(email) = lower(_email) LIMIT 1;
  RETURN _uid;
END;
$$;

REVOKE ALL ON FUNCTION public.lookup_user_id_by_email(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.lookup_user_id_by_email(uuid, text) TO authenticated;
