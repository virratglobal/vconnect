-- Fix can_view_contact and can_manage_contact so agents assigned to a conversation can view and manage contact details (matching by contact_id OR phone_number)

CREATE OR REPLACE FUNCTION public.can_view_contact(_contact_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _tenant_id UUID;
  _created_by UUID;
  _phone TEXT;
BEGIN
  -- Fetch the contact's tenant, creator, and phone (bypassing RLS)
  SELECT tenant_id, created_by, phone_number_normalized INTO _tenant_id, _created_by, _phone
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

  -- 3. Assigned Agent: User assigned to any conversation associated with this contact (by contact_id or matching phone_number)
  IF EXISTS (
    SELECT 1 FROM public.conversations conv
    WHERE conv.assigned_to = _user_id
      AND (
        conv.contact_id = _contact_id
        OR (_phone IS NOT NULL AND conv.phone_number = _phone)
        OR (_phone IS NOT NULL AND regexp_replace(conv.phone_number, '\D', '', 'g') = regexp_replace(_phone, '\D', '', 'g'))
      )
  ) THEN
    RETURN TRUE;
  END IF;

  -- 4. Users shared via group_shares with view or manage permission
  RETURN EXISTS (
    SELECT 1 FROM public.contact_groups cg
    JOIN public.group_shares gs ON gs.group_id = cg.group_id
    WHERE cg.contact_id = _contact_id
      AND gs.shared_with_user = _user_id
      AND (gs.can_view_contacts = TRUE OR gs.can_manage_contacts = TRUE)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.can_manage_contact(_contact_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _tenant_id UUID;
  _created_by UUID;
  _phone TEXT;
BEGIN
  -- Fetch the contact's tenant, creator, and phone (bypassing RLS)
  SELECT tenant_id, created_by, phone_number_normalized INTO _tenant_id, _created_by, _phone
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

  -- 3. Assigned Agent: User assigned to any conversation associated with this contact (by contact_id or matching phone_number)
  IF EXISTS (
    SELECT 1 FROM public.conversations conv
    WHERE conv.assigned_to = _user_id
      AND (
        conv.contact_id = _contact_id
        OR (_phone IS NOT NULL AND conv.phone_number = _phone)
        OR (_phone IS NOT NULL AND regexp_replace(conv.phone_number, '\D', '', 'g') = regexp_replace(_phone, '\D', '', 'g'))
      )
  ) THEN
    RETURN TRUE;
  END IF;

  -- 4. Users shared via group_shares with manage permission
  RETURN EXISTS (
    SELECT 1 FROM public.contact_groups cg
    JOIN public.group_shares gs ON gs.group_id = cg.group_id
    WHERE cg.contact_id = _contact_id
      AND gs.shared_with_user = _user_id
      AND gs.can_manage_contacts = TRUE
  );
END;
$$;
