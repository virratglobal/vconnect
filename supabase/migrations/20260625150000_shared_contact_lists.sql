-- Migration: 20260625150000_shared_contact_lists.sql
-- Description: Implement a polymorphic group_shares table and adjust RLS policies for strict audience target sharing vs contacts visibility separation.

-- 1. Create polymorphic group_shares table
CREATE TABLE IF NOT EXISTS public.group_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  shared_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  shared_with_user uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  audience_type text NOT NULL CHECK (audience_type IN ('group', 'saved_audience', 'dynamic_audience', 'ai_segment', 'imported_list')),
  group_id uuid REFERENCES public.groups(id) ON DELETE CASCADE,
  saved_audience_id uuid REFERENCES public.saved_audiences(id) ON DELETE CASCADE,
  
  -- Granular Split Permissions
  can_view_contacts boolean DEFAULT false NOT NULL,
  can_use_in_campaigns boolean DEFAULT true NOT NULL,
  can_edit_audience boolean DEFAULT false NOT NULL,
  can_manage_contacts boolean DEFAULT false NOT NULL,
  can_reshare_audience boolean DEFAULT false NOT NULL,
  
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Constraints
  CONSTRAINT group_shares_group_user_unique UNIQUE (tenant_id, shared_with_user, audience_type, group_id, saved_audience_id),
  CONSTRAINT check_group_share CHECK (
    (audience_type = 'group' AND group_id IS NOT NULL AND saved_audience_id IS NULL) OR
    (audience_type = 'saved_audience' AND saved_audience_id IS NOT NULL AND group_id IS NULL)
  )
);

-- 2. Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.group_shares TO authenticated;
GRANT ALL ON public.group_shares TO service_role;

-- 3. Enable RLS on group_shares
ALTER TABLE public.group_shares ENABLE ROW LEVEL SECURITY;

-- 4. RLS policies on group_shares
DROP POLICY IF EXISTS "Group shares select policy" ON public.group_shares;
CREATE POLICY "Group shares select policy" ON public.group_shares
  FOR SELECT TO authenticated
  USING (
    public.has_tenant_role(tenant_id, auth.uid(), VARIADIC ARRAY['owner'::tenant_role, 'admin'::tenant_role, 'manager'::tenant_role])
    OR shared_with_user = auth.uid()
    OR shared_by = auth.uid()
  );

DROP POLICY IF EXISTS "Group shares manage policy" ON public.group_shares;
CREATE POLICY "Group shares manage policy" ON public.group_shares
  FOR ALL TO authenticated
  USING (
    public.has_tenant_role(tenant_id, auth.uid(), VARIADIC ARRAY['owner'::tenant_role, 'admin'::tenant_role, 'manager'::tenant_role])
    OR EXISTS (
      SELECT 1 FROM public.groups g
      WHERE g.id = group_id AND g.created_by = auth.uid()
    )
  );

-- 5. Reconfigure public.contacts RLS Policies (Agent visibility is separate from Campaigns targeting)
DROP POLICY IF EXISTS "Contacts select policy" ON public.contacts;
CREATE POLICY "Contacts select policy" ON public.contacts
  FOR SELECT TO authenticated
  USING (
    public.has_tenant_role(tenant_id, auth.uid(), VARIADIC ARRAY['owner'::tenant_role, 'admin'::tenant_role, 'manager'::tenant_role])
    OR (
      public.is_tenant_member(tenant_id, auth.uid())
      AND created_by = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.contact_groups cg
      JOIN public.group_shares gs ON gs.group_id = cg.group_id
      WHERE cg.contact_id = public.contacts.id
        AND gs.shared_with_user = auth.uid()
        AND (gs.can_view_contacts = true OR gs.can_manage_contacts = true)
    )
  );

DROP POLICY IF EXISTS "Contacts update policy" ON public.contacts;
CREATE POLICY "Contacts update policy" ON public.contacts
  FOR UPDATE TO authenticated
  USING (
    public.has_tenant_role(tenant_id, auth.uid(), VARIADIC ARRAY['owner'::tenant_role, 'admin'::tenant_role, 'manager'::tenant_role])
    OR (
      public.is_tenant_member(tenant_id, auth.uid())
      AND created_by = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.contact_groups cg
      JOIN public.group_shares gs ON gs.group_id = cg.group_id
      WHERE cg.contact_id = public.contacts.id
        AND gs.shared_with_user = auth.uid()
        AND gs.can_manage_contacts = true
    )
  );

DROP POLICY IF EXISTS "Contacts delete policy" ON public.contacts;
CREATE POLICY "Contacts delete policy" ON public.contacts
  FOR DELETE TO authenticated
  USING (
    public.has_tenant_role(tenant_id, auth.uid(), VARIADIC ARRAY['owner'::tenant_role, 'admin'::tenant_role, 'manager'::tenant_role])
    OR (
      public.is_tenant_member(tenant_id, auth.uid())
      AND created_by = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.contact_groups cg
      JOIN public.group_shares gs ON gs.group_id = cg.group_id
      WHERE cg.contact_id = public.contacts.id
        AND gs.shared_with_user = auth.uid()
        AND gs.can_manage_contacts = true
    )
  );

-- 6. Reconfigure public.contact_groups RLS Policies
DROP POLICY IF EXISTS "Contact groups select policy" ON public.contact_groups;
CREATE POLICY "Contact groups select policy" ON public.contact_groups
  FOR SELECT TO authenticated
  USING (
    public.has_tenant_role(tenant_id, auth.uid(), VARIADIC ARRAY['owner'::tenant_role, 'admin'::tenant_role, 'manager'::tenant_role])
    OR EXISTS (
      SELECT 1 FROM public.contacts c
      WHERE c.id = contact_id AND c.created_by = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.group_shares gs
      WHERE gs.group_id = contact_groups.group_id
        AND gs.shared_with_user = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Contact groups manage policy" ON public.contact_groups;
CREATE POLICY "Contact groups manage policy" ON public.contact_groups
  FOR ALL TO authenticated
  USING (
    public.has_tenant_role(tenant_id, auth.uid(), VARIADIC ARRAY['owner'::tenant_role, 'admin'::tenant_role, 'manager'::tenant_role])
    OR EXISTS (
      SELECT 1 FROM public.contacts c
      WHERE c.id = contact_id AND c.created_by = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.group_shares gs
      WHERE gs.group_id = contact_groups.group_id
        AND gs.shared_with_user = auth.uid()
        AND (gs.can_manage_contacts = true OR gs.can_edit_audience = true)
    )
  )
  WITH CHECK (
    public.has_tenant_role(tenant_id, auth.uid(), VARIADIC ARRAY['owner'::tenant_role, 'admin'::tenant_role, 'manager'::tenant_role])
    OR EXISTS (
      SELECT 1 FROM public.contacts c
      WHERE c.id = contact_id AND c.created_by = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.group_shares gs
      WHERE gs.group_id = contact_groups.group_id
        AND gs.shared_with_user = auth.uid()
        AND (gs.can_manage_contacts = true OR gs.can_edit_audience = true)
    )
  );

-- 7. Reconfigure public.groups RLS Policies
DROP POLICY IF EXISTS "Members view groups" ON public.groups;
DROP POLICY IF EXISTS "Manager+ manage groups" ON public.groups;
DROP POLICY IF EXISTS "Groups select policy" ON public.groups;
DROP POLICY IF EXISTS "Groups insert policy" ON public.groups;
DROP POLICY IF EXISTS "Groups update policy" ON public.groups;
DROP POLICY IF EXISTS "Groups delete policy" ON public.groups;

CREATE POLICY "Groups select policy" ON public.groups
  FOR SELECT TO authenticated
  USING (
    public.has_tenant_role(tenant_id, auth.uid(), VARIADIC ARRAY['owner'::tenant_role, 'admin'::tenant_role, 'manager'::tenant_role])
    OR created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.group_shares gs
      WHERE gs.group_id = public.groups.id
        AND gs.shared_with_user = auth.uid()
    )
  );

CREATE POLICY "Groups insert policy" ON public.groups
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_tenant_role(tenant_id, auth.uid(), VARIADIC ARRAY['owner'::tenant_role, 'admin'::tenant_role, 'manager'::tenant_role])
    OR (
      public.is_tenant_member(tenant_id, auth.uid())
      AND (created_by IS NULL OR created_by = auth.uid())
    )
  );

CREATE POLICY "Groups update policy" ON public.groups
  FOR UPDATE TO authenticated
  USING (
    public.has_tenant_role(tenant_id, auth.uid(), VARIADIC ARRAY['owner'::tenant_role, 'admin'::tenant_role, 'manager'::tenant_role])
    OR created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.group_shares gs
      WHERE gs.group_id = public.groups.id
        AND gs.shared_with_user = auth.uid()
        AND gs.can_edit_audience = true
    )
  );

CREATE POLICY "Groups delete policy" ON public.groups
  FOR DELETE TO authenticated
  USING (
    public.has_tenant_role(tenant_id, auth.uid(), VARIADIC ARRAY['owner'::tenant_role, 'admin'::tenant_role, 'manager'::tenant_role])
    OR created_by = auth.uid()
  );
