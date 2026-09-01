-- ============================================================
-- ENTERPRISE CONTACTS & AUDIENCE SYSTEM — ADDITIVE MIGRATION
-- 20260625120000_enterprise_contacts_first_class.sql
-- ============================================================

-- 1. Extend contacts with company
ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS company text;

-- 2. Extend groups with first-class fields
ALTER TABLE public.groups
  ADD COLUMN IF NOT EXISTS color text,
  ADD COLUMN IF NOT EXISTS icon text,
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now(),
  ADD COLUMN IF NOT EXISTS is_system_group boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- 3. Extend tags with first-class fields
ALTER TABLE public.tags
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- 4. Extend contact_groups mapping with created_by
ALTER TABLE public.contact_groups
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- 5. Create saved_audiences table
CREATE TABLE IF NOT EXISTS public.saved_audiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  criteria jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security on saved_audiences
ALTER TABLE public.saved_audiences ENABLE ROW LEVEL SECURITY;

-- Select policy
DROP POLICY IF EXISTS "Members view saved audiences" ON public.saved_audiences;
CREATE POLICY "Members view saved audiences" ON public.saved_audiences
  FOR SELECT TO authenticated USING (public.is_tenant_member(tenant_id, auth.uid()));

-- Manage policy
DROP POLICY IF EXISTS "Manager+ manage saved audiences" ON public.saved_audiences;
CREATE POLICY "Manager+ manage saved audiences" ON public.saved_audiences
  FOR ALL TO authenticated
  USING (public.has_tenant_role(tenant_id, auth.uid(), VARIADIC ARRAY['owner'::tenant_role, 'admin'::tenant_role, 'manager'::tenant_role]))
  WITH CHECK (public.has_tenant_role(tenant_id, auth.uid(), VARIADIC ARRAY['owner'::tenant_role, 'admin'::tenant_role, 'manager'::tenant_role]));

-- Triggers for auto-updating updated_at
DROP TRIGGER IF EXISTS trg_groups_updated ON public.groups;
CREATE TRIGGER trg_groups_updated
  BEFORE UPDATE ON public.groups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_tags_updated ON public.tags;
CREATE TRIGGER trg_tags_updated
  BEFORE UPDATE ON public.tags
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_saved_audiences_updated ON public.saved_audiences;
CREATE TRIGGER trg_saved_audiences_updated
  BEFORE UPDATE ON public.saved_audiences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_audiences TO authenticated;
GRANT ALL ON public.saved_audiences TO service_role;

-- 6. Add saved_audiences to real-time publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'saved_audiences'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE saved_audiences;
  END IF;
END $$;
