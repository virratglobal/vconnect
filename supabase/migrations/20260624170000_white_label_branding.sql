-- Add branding_level and custom_domain to tenants table if not exists
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS branding_level text NOT NULL DEFAULT 'default';
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS custom_domain text UNIQUE;

-- Create tenant_branding table
CREATE TABLE IF NOT EXISTS public.tenant_branding (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE UNIQUE,
  company_name text,
  company_logo text,
  favicon text,
  primary_color text,
  secondary_color text,
  support_email text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on tenant_branding
ALTER TABLE public.tenant_branding ENABLE ROW LEVEL SECURITY;

-- RLS policies for tenant_branding
CREATE POLICY "Allow select of branding for tenant members" ON public.tenant_branding
  FOR SELECT TO authenticated USING (is_tenant_member(tenant_id, auth.uid()));

CREATE POLICY "Allow insert of branding for tenant owners" ON public.tenant_branding
  FOR INSERT TO authenticated WITH CHECK (has_tenant_role(tenant_id, auth.uid(), VARIADIC ARRAY['owner'::tenant_role]));

CREATE POLICY "Allow update of branding for tenant owners" ON public.tenant_branding
  FOR UPDATE TO authenticated USING (has_tenant_role(tenant_id, auth.uid(), VARIADIC ARRAY['owner'::tenant_role]));

CREATE POLICY "Allow delete of branding for tenant owners" ON public.tenant_branding
  FOR DELETE TO authenticated USING (has_tenant_role(tenant_id, auth.uid(), VARIADIC ARRAY['owner'::tenant_role]));

-- Create dedicated bucket for branding assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('branding-assets', 'branding-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Define storage policies for branding-assets bucket
-- SELECT policy (authenticated tenant members can read)
CREATE POLICY "Allow select of branding assets for members" ON storage.objects
  FOR SELECT TO authenticated USING (
    bucket_id = 'branding-assets' AND 
    is_tenant_member(((storage.foldername(name))[1])::uuid, auth.uid())
  );

-- INSERT/UPDATE/DELETE policies (owners/admins/managers can write)
CREATE POLICY "Allow insert of branding assets for managers" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'branding-assets' AND 
    has_tenant_role(((storage.foldername(name))[1])::uuid, auth.uid(), VARIADIC ARRAY['owner'::tenant_role, 'admin'::tenant_role, 'manager'::tenant_role])
  );

CREATE POLICY "Allow update of branding assets for managers" ON storage.objects
  FOR UPDATE TO authenticated USING (
    bucket_id = 'branding-assets' AND 
    has_tenant_role(((storage.foldername(name))[1])::uuid, auth.uid(), VARIADIC ARRAY['owner'::tenant_role, 'admin'::tenant_role, 'manager'::tenant_role])
  );

CREATE POLICY "Allow delete of branding assets for managers" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'branding-assets' AND 
    has_tenant_role(((storage.foldername(name))[1])::uuid, auth.uid(), VARIADIC ARRAY['owner'::tenant_role, 'admin'::tenant_role, 'manager'::tenant_role])
  );
