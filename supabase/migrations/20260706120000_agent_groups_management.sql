-- Drop old policies on groups
DROP POLICY IF EXISTS "Members view groups" ON public.groups;
DROP POLICY IF EXISTS "Manager+ manage groups" ON public.groups;

-- Create new policies on groups to allow all members to manage
CREATE POLICY "Members view groups" ON public.groups
  FOR SELECT TO authenticated
  USING (public.is_tenant_member(tenant_id, auth.uid()));

CREATE POLICY "Members manage groups" ON public.groups
  FOR ALL TO authenticated
  USING (public.is_tenant_member(tenant_id, auth.uid()))
  WITH CHECK (public.is_tenant_member(tenant_id, auth.uid()));

-- Drop old policies on contact_groups
DROP POLICY IF EXISTS "Members view cg" ON public.contact_groups;
DROP POLICY IF EXISTS "Manager+ manage cg" ON public.contact_groups;
DROP POLICY IF EXISTS "Contact groups select policy" ON public.contact_groups;
DROP POLICY IF EXISTS "Contact groups manage policy" ON public.contact_groups;

-- Create new policies on contact_groups to allow all members to select and manage
CREATE POLICY "Contact groups select policy" ON public.contact_groups
  FOR SELECT TO authenticated
  USING (public.is_tenant_member(tenant_id, auth.uid()));

CREATE POLICY "Contact groups manage policy" ON public.contact_groups
  FOR ALL TO authenticated
  USING (public.is_tenant_member(tenant_id, auth.uid()))
  WITH CHECK (public.is_tenant_member(tenant_id, auth.uid()));
