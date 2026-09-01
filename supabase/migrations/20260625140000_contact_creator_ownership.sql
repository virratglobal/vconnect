-- ============================================================
-- CONTACT CREATOR OWNERSHIP SYSTEM — ADDITIVE MIGRATION
-- 20260625140000_contact_creator_ownership.sql
-- ============================================================

-- 1. Extend contacts with source column and check constraint
ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS source text DEFAULT 'manual';

ALTER TABLE public.contacts DROP CONSTRAINT IF EXISTS check_contacts_source;
ALTER TABLE public.contacts ADD CONSTRAINT check_contacts_source
  CHECK (source IN ('manual', 'csv_import', 'api', 'webhook', 'landing_page', 'campaign_reply', 'automation', 'future'));

-- 2. Trigger to set created_by and source on contacts
CREATE OR REPLACE FUNCTION public.set_contact_created_by()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.created_by IS NULL AND auth.uid() IS NOT NULL THEN
    NEW.created_by := auth.uid();
  END IF;
  IF NEW.source IS NULL THEN
    NEW.source := 'manual';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_contacts_created_by ON public.contacts;
CREATE TRIGGER trg_contacts_created_by
  BEFORE INSERT ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION public.set_contact_created_by();

-- 3. Trigger to set conversation assigned_to to contact creator
CREATE OR REPLACE FUNCTION public.set_conversation_initial_assignee()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.assigned_to IS NULL AND NEW.contact_id IS NOT NULL THEN
    SELECT created_by INTO NEW.assigned_to
    FROM public.contacts
    WHERE id = NEW.contact_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_conversations_initial_assignee ON public.conversations;
CREATE TRIGGER trg_conversations_initial_assignee
  BEFORE INSERT OR UPDATE OF contact_id, assigned_to ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.set_conversation_initial_assignee();

-- 4. Re-configure Row Level Security on contacts
DROP POLICY IF EXISTS "Members view contacts" ON public.contacts;
DROP POLICY IF EXISTS "Manager+ manage contacts" ON public.contacts;
DROP POLICY IF EXISTS "Manager+ update contacts" ON public.contacts;
DROP POLICY IF EXISTS "Manager+ delete contacts" ON public.contacts;

-- Select: Manager+ see all; Agents see only their own
CREATE POLICY "Contacts select policy" ON public.contacts
  FOR SELECT TO authenticated
  USING (
    public.has_tenant_role(tenant_id, auth.uid(), VARIADIC ARRAY['owner'::tenant_role, 'admin'::tenant_role, 'manager'::tenant_role])
    OR (
      public.is_tenant_member(tenant_id, auth.uid())
      AND created_by = auth.uid()
    )
  );

-- Insert: Manager+ manage all; Agents insert their own
CREATE POLICY "Contacts insert policy" ON public.contacts
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_tenant_role(tenant_id, auth.uid(), VARIADIC ARRAY['owner'::tenant_role, 'admin'::tenant_role, 'manager'::tenant_role])
    OR (
      public.is_tenant_member(tenant_id, auth.uid())
      AND (created_by IS NULL OR created_by = auth.uid())
    )
  );

-- Update: Manager+ manage all; Agents update their own
CREATE POLICY "Contacts update policy" ON public.contacts
  FOR UPDATE TO authenticated
  USING (
    public.has_tenant_role(tenant_id, auth.uid(), VARIADIC ARRAY['owner'::tenant_role, 'admin'::tenant_role, 'manager'::tenant_role])
    OR (
      public.is_tenant_member(tenant_id, auth.uid())
      AND created_by = auth.uid()
    )
  );

-- Delete: Manager+ delete all; Agents delete their own
CREATE POLICY "Contacts delete policy" ON public.contacts
  FOR DELETE TO authenticated
  USING (
    public.has_tenant_role(tenant_id, auth.uid(), VARIADIC ARRAY['owner'::tenant_role, 'admin'::tenant_role, 'manager'::tenant_role])
    OR (
      public.is_tenant_member(tenant_id, auth.uid())
      AND created_by = auth.uid()
    )
  );

-- 5. Re-configure RLS on contact_tags
DROP POLICY IF EXISTS "Members view ct" ON public.contact_tags;
DROP POLICY IF EXISTS "Manager+ manage ct" ON public.contact_tags;

CREATE POLICY "Contact tags select policy" ON public.contact_tags
  FOR SELECT TO authenticated
  USING (
    public.has_tenant_role(tenant_id, auth.uid(), VARIADIC ARRAY['owner'::tenant_role, 'admin'::tenant_role, 'manager'::tenant_role])
    OR EXISTS (
      SELECT 1 FROM public.contacts c
      WHERE c.id = contact_id AND c.created_by = auth.uid()
    )
  );

CREATE POLICY "Contact tags manage policy" ON public.contact_tags
  FOR ALL TO authenticated
  USING (
    public.has_tenant_role(tenant_id, auth.uid(), VARIADIC ARRAY['owner'::tenant_role, 'admin'::tenant_role, 'manager'::tenant_role])
    OR EXISTS (
      SELECT 1 FROM public.contacts c
      WHERE c.id = contact_id AND c.created_by = auth.uid()
    )
  )
  WITH CHECK (
    public.has_tenant_role(tenant_id, auth.uid(), VARIADIC ARRAY['owner'::tenant_role, 'admin'::tenant_role, 'manager'::tenant_role])
    OR EXISTS (
      SELECT 1 FROM public.contacts c
      WHERE c.id = contact_id AND c.created_by = auth.uid()
    )
  );

-- 6. Re-configure RLS on contact_groups
DROP POLICY IF EXISTS "Members view cg" ON public.contact_groups;
DROP POLICY IF EXISTS "Manager+ manage cg" ON public.contact_groups;

CREATE POLICY "Contact groups select policy" ON public.contact_groups
  FOR SELECT TO authenticated
  USING (
    public.has_tenant_role(tenant_id, auth.uid(), VARIADIC ARRAY['owner'::tenant_role, 'admin'::tenant_role, 'manager'::tenant_role])
    OR EXISTS (
      SELECT 1 FROM public.contacts c
      WHERE c.id = contact_id AND c.created_by = auth.uid()
    )
  );

CREATE POLICY "Contact groups manage policy" ON public.contact_groups
  FOR ALL TO authenticated
  USING (
    public.has_tenant_role(tenant_id, auth.uid(), VARIADIC ARRAY['owner'::tenant_role, 'admin'::tenant_role, 'manager'::tenant_role])
    OR EXISTS (
      SELECT 1 FROM public.contacts c
      WHERE c.id = contact_id AND c.created_by = auth.uid()
    )
  )
  WITH CHECK (
    public.has_tenant_role(tenant_id, auth.uid(), VARIADIC ARRAY['owner'::tenant_role, 'admin'::tenant_role, 'manager'::tenant_role])
    OR EXISTS (
      SELECT 1 FROM public.contacts c
      WHERE c.id = contact_id AND c.created_by = auth.uid()
    )
  );

-- 7. Re-configure RLS on conversations
DROP POLICY IF EXISTS "Manager+ view all conv" ON public.conversations;
DROP POLICY IF EXISTS "Agent view assigned conv" ON public.conversations;
DROP POLICY IF EXISTS "Members manage conv" ON public.conversations;

CREATE POLICY "Conversations select policy" ON public.conversations
  FOR SELECT TO authenticated
  USING (
    public.has_tenant_role(tenant_id, auth.uid(), VARIADIC ARRAY['owner'::tenant_role, 'admin'::tenant_role, 'manager'::tenant_role])
    OR assigned_to = auth.uid()
  );

CREATE POLICY "Conversations manage policy" ON public.conversations
  FOR ALL TO authenticated
  USING (
    public.has_tenant_role(tenant_id, auth.uid(), VARIADIC ARRAY['owner'::tenant_role, 'admin'::tenant_role, 'manager'::tenant_role])
    OR assigned_to = auth.uid()
  )
  WITH CHECK (
    public.has_tenant_role(tenant_id, auth.uid(), VARIADIC ARRAY['owner'::tenant_role, 'admin'::tenant_role, 'manager'::tenant_role])
    OR assigned_to = auth.uid()
  );

-- 8. Re-configure RLS on messages
DROP POLICY IF EXISTS "Members view msg" ON public.messages;
DROP POLICY IF EXISTS "Members insert msg" ON public.messages;
DROP POLICY IF EXISTS "Members update msg" ON public.messages;

CREATE POLICY "Messages select policy" ON public.messages
  FOR SELECT TO authenticated
  USING (
    public.has_tenant_role(tenant_id, auth.uid(), VARIADIC ARRAY['owner'::tenant_role, 'admin'::tenant_role, 'manager'::tenant_role])
    OR EXISTS (
      SELECT 1 FROM public.conversations conv
      WHERE conv.id = messages.conversation_id AND conv.assigned_to = auth.uid()
    )
  );

CREATE POLICY "Messages insert policy" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_tenant_role(tenant_id, auth.uid(), VARIADIC ARRAY['owner'::tenant_role, 'admin'::tenant_role, 'manager'::tenant_role])
    OR EXISTS (
      SELECT 1 FROM public.conversations conv
      WHERE conv.id = messages.conversation_id AND conv.assigned_to = auth.uid()
    )
  );

CREATE POLICY "Messages update policy" ON public.messages
  FOR UPDATE TO authenticated
  USING (
    public.has_tenant_role(tenant_id, auth.uid(), VARIADIC ARRAY['owner'::tenant_role, 'admin'::tenant_role, 'manager'::tenant_role])
    OR EXISTS (
      SELECT 1 FROM public.conversations conv
      WHERE conv.id = messages.conversation_id AND conv.assigned_to = auth.uid()
    )
  );

-- 9. Re-configure RLS on conversation_messages
DROP POLICY IF EXISTS "Members view messages" ON public.conversation_messages;
DROP POLICY IF EXISTS "Members insert messages" ON public.conversation_messages;
DROP POLICY IF EXISTS "Members update messages" ON public.conversation_messages;
DROP POLICY IF EXISTS "Members delete messages" ON public.conversation_messages;

CREATE POLICY "Conv messages select policy" ON public.conversation_messages
  FOR SELECT TO authenticated
  USING (
    public.has_tenant_role(tenant_id, auth.uid(), VARIADIC ARRAY['owner'::tenant_role, 'admin'::tenant_role, 'manager'::tenant_role])
    OR EXISTS (
      SELECT 1 FROM public.conversations conv
      WHERE conv.id = conversation_messages.conversation_id AND conv.assigned_to = auth.uid()
    )
  );

CREATE POLICY "Conv messages manage policy" ON public.conversation_messages
  FOR ALL TO authenticated
  USING (
    public.has_tenant_role(tenant_id, auth.uid(), VARIADIC ARRAY['owner'::tenant_role, 'admin'::tenant_role, 'manager'::tenant_role])
    OR EXISTS (
      SELECT 1 FROM public.conversations conv
      WHERE conv.id = conversation_messages.conversation_id AND conv.assigned_to = auth.uid()
    )
  )
  WITH CHECK (
    public.has_tenant_role(tenant_id, auth.uid(), VARIADIC ARRAY['owner'::tenant_role, 'admin'::tenant_role, 'manager'::tenant_role])
    OR EXISTS (
      SELECT 1 FROM public.conversations conv
      WHERE conv.id = conversation_messages.conversation_id AND conv.assigned_to = auth.uid()
    )
  );

-- 10. Re-configure RLS on campaigns
DROP POLICY IF EXISTS "Members view campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Manager+ insert campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Manager+ update campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Manager+ delete campaigns" ON public.campaigns;

CREATE POLICY "Campaigns select policy" ON public.campaigns
  FOR SELECT TO authenticated
  USING (
    public.has_tenant_role(tenant_id, auth.uid(), VARIADIC ARRAY['owner'::tenant_role, 'admin'::tenant_role, 'manager'::tenant_role])
    OR created_by = auth.uid()
    OR assigned_to = auth.uid()
  );

CREATE POLICY "Campaigns insert policy" ON public.campaigns
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_tenant_role(tenant_id, auth.uid(), VARIADIC ARRAY['owner'::tenant_role, 'admin'::tenant_role, 'manager'::tenant_role])
    OR (
      public.is_tenant_member(tenant_id, auth.uid())
      AND (created_by IS NULL OR created_by = auth.uid())
    )
  );

CREATE POLICY "Campaigns update policy" ON public.campaigns
  FOR UPDATE TO authenticated
  USING (
    public.has_tenant_role(tenant_id, auth.uid(), VARIADIC ARRAY['owner'::tenant_role, 'admin'::tenant_role, 'manager'::tenant_role])
    OR (
      public.is_tenant_member(tenant_id, auth.uid())
      AND created_by = auth.uid()
    )
  );

CREATE POLICY "Campaigns delete policy" ON public.campaigns
  FOR DELETE TO authenticated
  USING (
    public.has_tenant_role(tenant_id, auth.uid(), VARIADIC ARRAY['owner'::tenant_role, 'admin'::tenant_role, 'manager'::tenant_role])
    OR (
      public.is_tenant_member(tenant_id, auth.uid())
      AND created_by = auth.uid()
    )
  );

-- 11. Re-configure RLS on campaign_recipients
DROP POLICY IF EXISTS "Manager+ view recipients" ON public.campaign_recipients;
DROP POLICY IF EXISTS "Manager+ manage recipients" ON public.campaign_recipients;

CREATE POLICY "Campaign recipients select policy" ON public.campaign_recipients
  FOR SELECT TO authenticated
  USING (
    public.has_tenant_role(tenant_id, auth.uid(), VARIADIC ARRAY['owner'::tenant_role, 'admin'::tenant_role, 'manager'::tenant_role])
    OR EXISTS (
      SELECT 1 FROM public.campaigns camp
      WHERE camp.id = campaign_recipients.campaign_id AND camp.created_by = auth.uid()
    )
  );

CREATE POLICY "Campaign recipients manage policy" ON public.campaign_recipients
  FOR ALL TO authenticated
  USING (
    public.has_tenant_role(tenant_id, auth.uid(), VARIADIC ARRAY['owner'::tenant_role, 'admin'::tenant_role, 'manager'::tenant_role])
    OR EXISTS (
      SELECT 1 FROM public.campaigns camp
      WHERE camp.id = campaign_recipients.campaign_id AND camp.created_by = auth.uid()
    )
  )
  WITH CHECK (
    public.has_tenant_role(tenant_id, auth.uid(), VARIADIC ARRAY['owner'::tenant_role, 'admin'::tenant_role, 'manager'::tenant_role])
    OR EXISTS (
      SELECT 1 FROM public.campaigns camp
      WHERE camp.id = campaign_recipients.campaign_id AND camp.created_by = auth.uid()
    )
  );
