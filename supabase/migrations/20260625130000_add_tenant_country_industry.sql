-- Add country and industry columns to tenants for SaaS onboarding
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS industry TEXT;

-- Update tenant_branding policies to allow owners and admins to manage their branding
DROP POLICY IF EXISTS "Allow insert of branding for super admins" ON public.tenant_branding;
DROP POLICY IF EXISTS "Allow update of branding for super admins" ON public.tenant_branding;
DROP POLICY IF EXISTS "Allow delete of branding for super admins" ON public.tenant_branding;

CREATE POLICY "Allow insert of branding for tenant owners/admins"
  ON public.tenant_branding
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_tenant_role(tenant_id, auth.uid(), 'owner'::tenant_role, 'admin'::tenant_role) OR public.is_super_admin(auth.uid()));

CREATE POLICY "Allow update of branding for tenant owners/admins"
  ON public.tenant_branding
  FOR UPDATE
  TO authenticated
  USING (public.has_tenant_role(tenant_id, auth.uid(), 'owner'::tenant_role, 'admin'::tenant_role) OR public.is_super_admin(auth.uid()));

CREATE POLICY "Allow delete of branding for tenant owners/admins"
  ON public.tenant_branding
  FOR DELETE
  TO authenticated
  USING (public.has_tenant_role(tenant_id, auth.uid(), 'owner'::tenant_role, 'admin'::tenant_role) OR public.is_super_admin(auth.uid()));
