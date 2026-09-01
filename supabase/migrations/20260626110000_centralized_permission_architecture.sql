-- ============================================================
-- CENTRALIZED PERMISSION ARCHITECTURE & PERFORMANCE INDEXES
-- 20260626110000_centralized_permission_architecture.sql
-- ============================================================

-- ─── 1. Reusable SECURITY DEFINER permission helper functions ───

-- Helper: Check if user is the direct creator of a contact
CREATE OR REPLACE FUNCTION public.is_contact_creator(_contact_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.contacts
    WHERE id = _contact_id AND created_by = _user_id
  );
$$;

-- Helper: Check if user can view a contact
CREATE OR REPLACE FUNCTION public.can_view_contact(_contact_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _tenant_id UUID;
  _created_by UUID;
BEGIN
  -- Fetch the contact's tenant and creator (bypassing RLS)
  SELECT tenant_id, created_by INTO _tenant_id, _created_by
  FROM public.contacts
  WHERE id = _contact_id;

  IF _tenant_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- 1. Owners, Admins, and Managers of the tenant can view
  IF public.has_tenant_role(_tenant_id, _user_id, 'owner', 'admin', 'manager') THEN
    RETURN TRUE;
  END IF;

  -- 2. Creator of the contact can view if they are still a member of the tenant
  IF _created_by = _user_id AND public.is_tenant_member(_tenant_id, _user_id) THEN
    RETURN TRUE;
  END IF;

  -- 3. Users shared via group_shares with view or manage permission
  RETURN EXISTS (
    SELECT 1 FROM public.contact_groups cg
    JOIN public.group_shares gs ON gs.group_id = cg.group_id
    WHERE cg.contact_id = _contact_id
      AND gs.shared_with_user = _user_id
      AND (gs.can_view_contacts = TRUE OR gs.can_manage_contacts = TRUE)
  );
END;
$$;

-- Helper: Check if user can manage (update/delete) a contact
CREATE OR REPLACE FUNCTION public.can_manage_contact(_contact_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _tenant_id UUID;
  _created_by UUID;
BEGIN
  -- Fetch the contact's tenant and creator (bypassing RLS)
  SELECT tenant_id, created_by INTO _tenant_id, _created_by
  FROM public.contacts
  WHERE id = _contact_id;

  IF _tenant_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- 1. Owners, Admins, and Managers of the tenant can manage
  IF public.has_tenant_role(_tenant_id, _user_id, 'owner', 'admin', 'manager') THEN
    RETURN TRUE;
  END IF;

  -- 2. Creator of the contact can manage if they are still a member of the tenant
  IF _created_by = _user_id AND public.is_tenant_member(_tenant_id, _user_id) THEN
    RETURN TRUE;
  END IF;

  -- 3. Users shared via group_shares with manage permission
  RETURN EXISTS (
    SELECT 1 FROM public.contact_groups cg
    JOIN public.group_shares gs ON gs.group_id = cg.group_id
    WHERE cg.contact_id = _contact_id
      AND gs.shared_with_user = _user_id
      AND gs.can_manage_contacts = TRUE
  );
END;
$$;

-- Helper: Check if user can view a conversation
CREATE OR REPLACE FUNCTION public.can_view_conversation(_conversation_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _tenant_id UUID;
  _assigned_to UUID;
BEGIN
  -- Fetch conversation data (bypassing RLS)
  SELECT tenant_id, assigned_to INTO _tenant_id, _assigned_to
  FROM public.conversations
  WHERE id = _conversation_id;

  IF _tenant_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- 1. Owners, Admins, and Managers can view all conversations
  IF public.has_tenant_role(_tenant_id, _user_id, 'owner', 'admin', 'manager') THEN
    RETURN TRUE;
  END IF;

  -- 2. Assigned Agent can view
  RETURN _assigned_to = _user_id;
END;
$$;

-- Helper: Check if user can view a group
CREATE OR REPLACE FUNCTION public.can_view_group(_group_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _tenant_id UUID;
  _created_by UUID;
  _is_system BOOLEAN;
BEGIN
  -- Fetch group data (bypassing RLS)
  SELECT tenant_id, created_by, is_system_group INTO _tenant_id, _created_by, _is_system
  FROM public.groups
  WHERE id = _group_id;

  IF _tenant_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- 1. System groups visible to all tenant members
  IF _is_system AND public.is_tenant_member(_tenant_id, _user_id) THEN
    RETURN TRUE;
  END IF;

  -- 2. Owners, Admins, Managers visible
  IF public.has_tenant_role(_tenant_id, _user_id, 'owner', 'admin', 'manager') THEN
    RETURN TRUE;
  END IF;

  -- 3. Creator visible
  IF _created_by = _user_id AND public.is_tenant_member(_tenant_id, _user_id) THEN
    RETURN TRUE;
  END IF;

  -- 4. Shared with user (any share exists)
  RETURN EXISTS (
    SELECT 1 FROM public.group_shares
    WHERE group_id = _group_id
      AND shared_with_user = _user_id
  );
END;
$$;

-- Helper: Check if user can edit a group
CREATE OR REPLACE FUNCTION public.can_edit_group(_group_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _tenant_id UUID;
  _created_by UUID;
BEGIN
  -- Fetch group data (bypassing RLS)
  SELECT tenant_id, created_by INTO _tenant_id, _created_by
  FROM public.groups
  WHERE id = _group_id;

  IF _tenant_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- 1. Owners, Admins, Managers can edit
  IF public.has_tenant_role(_tenant_id, _user_id, 'owner', 'admin', 'manager') THEN
    RETURN TRUE;
  END IF;

  -- 2. Creator can edit
  IF _created_by = _user_id AND public.is_tenant_member(_tenant_id, _user_id) THEN
    RETURN TRUE;
  END IF;

  -- 3. Shared with user with can_edit_audience = true
  RETURN EXISTS (
    SELECT 1 FROM public.group_shares
    WHERE group_id = _group_id
      AND shared_with_user = _user_id
      AND can_edit_audience = TRUE
  );
END;
$$;

-- Helper: Check if user can use a group/audience in campaigns
CREATE OR REPLACE FUNCTION public.can_use_shared_audience(_group_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _tenant_id UUID;
  _created_by UUID;
  _is_system BOOLEAN;
BEGIN
  -- Fetch group details (bypassing RLS)
  SELECT tenant_id, created_by, is_system_group INTO _tenant_id, _created_by, _is_system
  FROM public.groups
  WHERE id = _group_id;

  IF _tenant_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- 1. System groups are available to all members of the tenant
  IF _is_system AND public.is_tenant_member(_tenant_id, _user_id) THEN
    RETURN TRUE;
  END IF;

  -- 2. Owners, Admins, Managers of the tenant can use
  IF public.has_tenant_role(_tenant_id, _user_id, 'owner', 'admin', 'manager') THEN
    RETURN TRUE;
  END IF;

  -- 3. Creator can use if still a member of the tenant
  IF _created_by = _user_id AND public.is_tenant_member(_tenant_id, _user_id) THEN
    RETURN TRUE;
  END IF;

  -- 4. Shared with user with can_use_in_campaigns = true
  RETURN EXISTS (
    SELECT 1 FROM public.group_shares
    WHERE group_id = _group_id
      AND shared_with_user = _user_id
      AND can_use_in_campaigns = TRUE
  );
END;
$$;

-- Helper: Check if user can view a campaign
CREATE OR REPLACE FUNCTION public.can_view_campaign(_campaign_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _tenant_id UUID;
  _created_by UUID;
  _assigned_to UUID;
BEGIN
  -- Fetch campaign details (bypassing RLS)
  SELECT tenant_id, created_by, assigned_to INTO _tenant_id, _created_by, _assigned_to
  FROM public.campaigns
  WHERE id = _campaign_id;

  IF _tenant_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- 1. Owners, Admins, Managers can view all campaigns
  IF public.has_tenant_role(_tenant_id, _user_id, 'owner', 'admin', 'manager') THEN
    RETURN TRUE;
  END IF;

  -- 2. Creator or assignee can view
  RETURN _created_by = _user_id OR _assigned_to = _user_id;
END;
$$;


-- ─── 2. Apply Helper Functions to RLS Policies (Dropping old & creating new) ───

-- Contacts table policies
DROP POLICY IF EXISTS "Contacts select policy" ON public.contacts;
CREATE POLICY "Contacts select policy" ON public.contacts
  FOR SELECT TO authenticated
  USING (public.can_view_contact(id, auth.uid()));

DROP POLICY IF EXISTS "Contacts update policy" ON public.contacts;
CREATE POLICY "Contacts update policy" ON public.contacts
  FOR UPDATE TO authenticated
  USING (public.can_manage_contact(id, auth.uid()));

DROP POLICY IF EXISTS "Contacts delete policy" ON public.contacts;
CREATE POLICY "Contacts delete policy" ON public.contacts
  FOR DELETE TO authenticated
  USING (public.can_manage_contact(id, auth.uid()));


-- Contact Groups table policies
DROP POLICY IF EXISTS "Contact groups select policy" ON public.contact_groups;
CREATE POLICY "Contact groups select policy" ON public.contact_groups
  FOR SELECT TO authenticated
  USING (
    public.has_tenant_role(tenant_id, auth.uid(), VARIADIC ARRAY['owner'::tenant_role, 'admin'::tenant_role, 'manager'::tenant_role])
    OR public.is_contact_creator(contact_id, auth.uid())
    OR public.can_view_group(group_id, auth.uid())
  );

DROP POLICY IF EXISTS "Contact groups manage policy" ON public.contact_groups;
CREATE POLICY "Contact groups manage policy" ON public.contact_groups
  FOR ALL TO authenticated
  USING (
    public.has_tenant_role(tenant_id, auth.uid(), VARIADIC ARRAY['owner'::tenant_role, 'admin'::tenant_role, 'manager'::tenant_role])
    OR public.is_contact_creator(contact_id, auth.uid())
    OR public.can_edit_group(group_id, auth.uid())
  )
  WITH CHECK (
    public.has_tenant_role(tenant_id, auth.uid(), VARIADIC ARRAY['owner'::tenant_role, 'admin'::tenant_role, 'manager'::tenant_role])
    OR public.is_contact_creator(contact_id, auth.uid())
    OR public.can_edit_group(group_id, auth.uid())
  );


-- Contact Tags table policies
DROP POLICY IF EXISTS "Contact tags select policy" ON public.contact_tags;
CREATE POLICY "Contact tags select policy" ON public.contact_tags
  FOR SELECT TO authenticated
  USING (
    public.has_tenant_role(tenant_id, auth.uid(), VARIADIC ARRAY['owner'::tenant_role, 'admin'::tenant_role, 'manager'::tenant_role])
    OR public.is_contact_creator(contact_id, auth.uid())
  );

DROP POLICY IF EXISTS "Contact tags manage policy" ON public.contact_tags;
CREATE POLICY "Contact tags manage policy" ON public.contact_tags
  FOR ALL TO authenticated
  USING (
    public.has_tenant_role(tenant_id, auth.uid(), VARIADIC ARRAY['owner'::tenant_role, 'admin'::tenant_role, 'manager'::tenant_role])
    OR public.is_contact_creator(contact_id, auth.uid())
  )
  WITH CHECK (
    public.has_tenant_role(tenant_id, auth.uid(), VARIADIC ARRAY['owner'::tenant_role, 'admin'::tenant_role, 'manager'::tenant_role])
    OR public.is_contact_creator(contact_id, auth.uid())
  );


-- Conversations table policies
DROP POLICY IF EXISTS "Conversations select policy" ON public.conversations;
CREATE POLICY "Conversations select policy" ON public.conversations
  FOR SELECT TO authenticated
  USING (public.can_view_conversation(id, auth.uid()));

DROP POLICY IF EXISTS "Conversations manage policy" ON public.conversations;
CREATE POLICY "Conversations manage policy" ON public.conversations
  FOR ALL TO authenticated
  USING (public.can_view_conversation(id, auth.uid()))
  WITH CHECK (public.can_view_conversation(id, auth.uid()));


-- Messages table policies
DROP POLICY IF EXISTS "Messages select policy" ON public.messages;
CREATE POLICY "Messages select policy" ON public.messages
  FOR SELECT TO authenticated
  USING (public.can_view_conversation(conversation_id, auth.uid()));

DROP POLICY IF EXISTS "Messages insert policy" ON public.messages;
CREATE POLICY "Messages insert policy" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (public.can_view_conversation(conversation_id, auth.uid()));

DROP POLICY IF EXISTS "Messages update policy" ON public.messages;
CREATE POLICY "Messages update policy" ON public.messages
  FOR UPDATE TO authenticated
  USING (public.can_view_conversation(conversation_id, auth.uid()));


-- Conversation Messages table policies (view)
DROP POLICY IF EXISTS "Conv messages select policy" ON public.conversation_messages;
CREATE POLICY "Conv messages select policy" ON public.conversation_messages
  FOR SELECT TO authenticated
  USING (public.can_view_conversation(conversation_id, auth.uid()));

DROP POLICY IF EXISTS "Conv messages manage policy" ON public.conversation_messages;
CREATE POLICY "Conv messages manage policy" ON public.conversation_messages
  FOR ALL TO authenticated
  USING (public.can_view_conversation(conversation_id, auth.uid()))
  WITH CHECK (public.can_view_conversation(conversation_id, auth.uid()));


-- Conversation Internal Notes table policies
DROP POLICY IF EXISTS "Members view conv notes" ON public.conversation_internal_notes;
CREATE POLICY "Members view conv notes" ON public.conversation_internal_notes
  FOR SELECT TO authenticated
  USING (
    public.can_view_conversation(conversation_id, auth.uid())
    AND deleted_at IS NULL
  );


-- Groups table policies
DROP POLICY IF EXISTS "Groups select policy" ON public.groups;
CREATE POLICY "Groups select policy" ON public.groups
  FOR SELECT TO authenticated
  USING (public.can_view_group(id, auth.uid()));

DROP POLICY IF EXISTS "Groups update policy" ON public.groups;
CREATE POLICY "Groups update policy" ON public.groups
  FOR UPDATE TO authenticated
  USING (public.can_edit_group(id, auth.uid()));


-- Group Shares table policies
DROP POLICY IF EXISTS "Group shares manage policy" ON public.group_shares;
CREATE POLICY "Group shares manage policy" ON public.group_shares
  FOR ALL TO authenticated
  USING (
    public.has_tenant_role(tenant_id, auth.uid(), VARIADIC ARRAY['owner'::tenant_role, 'admin'::tenant_role, 'manager'::tenant_role])
    OR public.can_edit_group(group_id, auth.uid())
  )
  WITH CHECK (
    public.has_tenant_role(tenant_id, auth.uid(), VARIADIC ARRAY['owner'::tenant_role, 'admin'::tenant_role, 'manager'::tenant_role])
    OR public.can_edit_group(group_id, auth.uid())
  );


-- Campaigns table policies
DROP POLICY IF EXISTS "Campaigns select policy" ON public.campaigns;
CREATE POLICY "Campaigns select policy" ON public.campaigns
  FOR SELECT TO authenticated
  USING (public.can_view_campaign(id, auth.uid()));


-- Campaign Recipients table policies
DROP POLICY IF EXISTS "Campaign recipients select policy" ON public.campaign_recipients;
CREATE POLICY "Campaign recipients select policy" ON public.campaign_recipients
  FOR SELECT TO authenticated
  USING (public.can_view_campaign(campaign_id, auth.uid()));

DROP POLICY IF EXISTS "Campaign recipients manage policy" ON public.campaign_recipients;
CREATE POLICY "Campaign recipients manage policy" ON public.campaign_recipients
  FOR ALL TO authenticated
  USING (public.can_view_campaign(campaign_id, auth.uid()))
  WITH CHECK (public.can_view_campaign(campaign_id, auth.uid()));


-- ─── 3. Database Performance Indexes ───

CREATE INDEX IF NOT EXISTS idx_contacts_tenant_creator ON public.contacts(tenant_id, created_by);
CREATE INDEX IF NOT EXISTS idx_contacts_tenant_phone ON public.contacts(tenant_id, phone_number_normalized);
CREATE INDEX IF NOT EXISTS idx_conversations_tenant ON public.conversations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_conversations_contact ON public.conversations(contact_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_contact_groups_contact ON public.contact_groups(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_tags_contact ON public.contact_tags(contact_id);
CREATE INDEX IF NOT EXISTS idx_group_shares_group_user ON public.group_shares(group_id, shared_with_user);
