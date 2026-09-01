
-- ============ ENUMS ============
CREATE TYPE public.tenant_role AS ENUM ('owner','admin','manager','agent');
CREATE TYPE public.campaign_status AS ENUM ('draft','scheduled','queued','sending','paused','completed','failed','cancelled');
CREATE TYPE public.recipient_status AS ENUM ('pending','sending','sent','failed','skipped');
CREATE TYPE public.template_sync_status AS ENUM ('draft','pending','approved','rejected','disabled');
CREATE TYPE public.import_source AS ENUM ('csv','bulk_paste','manual','api');
CREATE TYPE public.activity_type AS ENUM ('imported','tag_added','tag_removed','group_added','group_removed','campaign_sent','delivered','read','replied','opted_out');

-- ============ Helper: updated_at trigger ============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ============ TENANTS ============
CREATE TABLE public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tenants TO authenticated;
GRANT ALL ON public.tenants TO service_role;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_tenants_updated BEFORE UPDATE ON public.tenants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ TENANT MEMBERS (RBAC) ============
CREATE TABLE public.tenant_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.tenant_role NOT NULL DEFAULT 'agent',
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tenant_members TO authenticated;
GRANT ALL ON public.tenant_members TO service_role;
ALTER TABLE public.tenant_members ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_members_updated BEFORE UPDATE ON public.tenant_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_members_user ON public.tenant_members(user_id);
CREATE INDEX idx_members_tenant ON public.tenant_members(tenant_id);

-- ============ SECURITY DEFINER HELPERS (avoid recursive RLS) ============
CREATE OR REPLACE FUNCTION public.is_tenant_member(_tenant UUID, _user UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.tenant_members WHERE tenant_id = _tenant AND user_id = _user);
$$;

CREATE OR REPLACE FUNCTION public.tenant_role_of(_tenant UUID, _user UUID)
RETURNS public.tenant_role LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.tenant_members WHERE tenant_id = _tenant AND user_id = _user LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.has_tenant_role(_tenant UUID, _user UUID, VARIADIC _roles public.tenant_role[])
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tenant_members
    WHERE tenant_id = _tenant AND user_id = _user AND role = ANY(_roles)
  );
$$;

-- Tenant policies (now that helper exists)
CREATE POLICY "Members view their tenant" ON public.tenants FOR SELECT TO authenticated
  USING (public.is_tenant_member(id, auth.uid()));
CREATE POLICY "Anyone can create a tenant" ON public.tenants FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Owners update tenant" ON public.tenants FOR UPDATE TO authenticated
  USING (public.has_tenant_role(id, auth.uid(), 'owner'));
CREATE POLICY "Owners delete tenant" ON public.tenants FOR DELETE TO authenticated
  USING (public.has_tenant_role(id, auth.uid(), 'owner'));

-- Auto-make creator an owner
CREATE OR REPLACE FUNCTION public.handle_new_tenant()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.tenant_members (tenant_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'owner')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_new_tenant AFTER INSERT ON public.tenants FOR EACH ROW WHEN (NEW.created_by IS NOT NULL) EXECUTE FUNCTION public.handle_new_tenant();

-- tenant_members policies
CREATE POLICY "Members view co-members" ON public.tenant_members FOR SELECT TO authenticated
  USING (public.is_tenant_member(tenant_id, auth.uid()));
CREATE POLICY "Owners manage members" ON public.tenant_members FOR ALL TO authenticated
  USING (public.has_tenant_role(tenant_id, auth.uid(), 'owner'))
  WITH CHECK (public.has_tenant_role(tenant_id, auth.uid(), 'owner'));

-- ============ Generic tenant-scoped RLS macro via reusable policies ============
-- We'll use a uniform pattern: SELECT/INSERT/UPDATE/DELETE for members, restricted for agents on some tables.

-- ============ WHATSAPP CREDENTIALS ============
CREATE TABLE public.whatsapp_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL UNIQUE REFERENCES public.tenants(id) ON DELETE CASCADE,
  phone_number_id TEXT,
  waba_id TEXT,
  display_phone_number TEXT,
  access_token TEXT,
  webhook_verify_token TEXT,
  status TEXT NOT NULL DEFAULT 'disconnected',
  last_success_at TIMESTAMPTZ,
  last_failure_at TIMESTAMPTZ,
  last_template_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_credentials TO authenticated;
GRANT ALL ON public.whatsapp_credentials TO service_role;
ALTER TABLE public.whatsapp_credentials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage credentials" ON public.whatsapp_credentials FOR ALL TO authenticated
  USING (public.has_tenant_role(tenant_id, auth.uid(), 'owner'))
  WITH CHECK (public.has_tenant_role(tenant_id, auth.uid(), 'owner'));
CREATE TRIGGER trg_wa_updated BEFORE UPDATE ON public.whatsapp_credentials FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ CONTACTS ============
CREATE TABLE public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT,
  phone_number_raw TEXT NOT NULL,
  phone_number_normalized TEXT NOT NULL,
  country_code TEXT,
  email TEXT,
  opt_in_source TEXT,
  opt_in_date TIMESTAMPTZ,
  source_import_id UUID,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, phone_number_normalized)
);
CREATE INDEX idx_contacts_tenant ON public.contacts(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_contacts_phone ON public.contacts(tenant_id, phone_number_normalized);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contacts TO authenticated;
GRANT ALL ON public.contacts TO service_role;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view contacts" ON public.contacts FOR SELECT TO authenticated
  USING (public.is_tenant_member(tenant_id, auth.uid()));
CREATE POLICY "Manager+ manage contacts" ON public.contacts FOR INSERT TO authenticated
  WITH CHECK (public.has_tenant_role(tenant_id, auth.uid(), 'owner','admin','manager'));
CREATE POLICY "Manager+ update contacts" ON public.contacts FOR UPDATE TO authenticated
  USING (public.has_tenant_role(tenant_id, auth.uid(), 'owner','admin','manager'));
CREATE POLICY "Manager+ delete contacts" ON public.contacts FOR DELETE TO authenticated
  USING (public.has_tenant_role(tenant_id, auth.uid(), 'owner','admin','manager'));
CREATE TRIGGER trg_contacts_updated BEFORE UPDATE ON public.contacts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ CONTACT IMPORTS ============
CREATE TABLE public.contact_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  file_name TEXT,
  source_type public.import_source NOT NULL DEFAULT 'bulk_paste',
  total_rows INT NOT NULL DEFAULT 0,
  imported_rows INT NOT NULL DEFAULT 0,
  duplicate_rows INT NOT NULL DEFAULT 0,
  invalid_rows INT NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_imports TO authenticated;
GRANT ALL ON public.contact_imports TO service_role;
ALTER TABLE public.contact_imports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view imports" ON public.contact_imports FOR SELECT TO authenticated
  USING (public.is_tenant_member(tenant_id, auth.uid()));
CREATE POLICY "Manager+ create imports" ON public.contact_imports FOR INSERT TO authenticated
  WITH CHECK (public.has_tenant_role(tenant_id, auth.uid(), 'owner','admin','manager'));

-- ============ CONTACT ACTIVITIES ============
CREATE TABLE public.contact_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  activity_type public.activity_type NOT NULL,
  reference_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_activities_contact ON public.contact_activities(contact_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_activities TO authenticated;
GRANT ALL ON public.contact_activities TO service_role;
ALTER TABLE public.contact_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view activities" ON public.contact_activities FOR SELECT TO authenticated
  USING (public.is_tenant_member(tenant_id, auth.uid()));
CREATE POLICY "Members insert activities" ON public.contact_activities FOR INSERT TO authenticated
  WITH CHECK (public.is_tenant_member(tenant_id, auth.uid()));

-- ============ TAGS & GROUPS ============
CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, name)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tags TO authenticated;
GRANT ALL ON public.tags TO service_role;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view tags" ON public.tags FOR SELECT TO authenticated USING (public.is_tenant_member(tenant_id, auth.uid()));
CREATE POLICY "Manager+ manage tags" ON public.tags FOR ALL TO authenticated
  USING (public.has_tenant_role(tenant_id, auth.uid(), 'owner','admin','manager'))
  WITH CHECK (public.has_tenant_role(tenant_id, auth.uid(), 'owner','admin','manager'));

CREATE TABLE public.contact_tags (
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (contact_id, tag_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_tags TO authenticated;
GRANT ALL ON public.contact_tags TO service_role;
ALTER TABLE public.contact_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view ct" ON public.contact_tags FOR SELECT TO authenticated USING (public.is_tenant_member(tenant_id, auth.uid()));
CREATE POLICY "Manager+ manage ct" ON public.contact_tags FOR ALL TO authenticated
  USING (public.has_tenant_role(tenant_id, auth.uid(), 'owner','admin','manager'))
  WITH CHECK (public.has_tenant_role(tenant_id, auth.uid(), 'owner','admin','manager'));

CREATE TABLE public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, name)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.groups TO authenticated;
GRANT ALL ON public.groups TO service_role;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view groups" ON public.groups FOR SELECT TO authenticated USING (public.is_tenant_member(tenant_id, auth.uid()));
CREATE POLICY "Manager+ manage groups" ON public.groups FOR ALL TO authenticated
  USING (public.has_tenant_role(tenant_id, auth.uid(), 'owner','admin','manager'))
  WITH CHECK (public.has_tenant_role(tenant_id, auth.uid(), 'owner','admin','manager'));

CREATE TABLE public.contact_groups (
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (contact_id, group_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_groups TO authenticated;
GRANT ALL ON public.contact_groups TO service_role;
ALTER TABLE public.contact_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view cg" ON public.contact_groups FOR SELECT TO authenticated USING (public.is_tenant_member(tenant_id, auth.uid()));
CREATE POLICY "Manager+ manage cg" ON public.contact_groups FOR ALL TO authenticated
  USING (public.has_tenant_role(tenant_id, auth.uid(), 'owner','admin','manager'))
  WITH CHECK (public.has_tenant_role(tenant_id, auth.uid(), 'owner','admin','manager'));

-- ============ CUSTOM FIELDS ============
CREATE TABLE public.custom_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  field_key TEXT NOT NULL,
  label TEXT NOT NULL,
  field_type TEXT NOT NULL DEFAULT 'text',
  options JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, field_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_fields TO authenticated;
GRANT ALL ON public.custom_fields TO service_role;
ALTER TABLE public.custom_fields ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view cf" ON public.custom_fields FOR SELECT TO authenticated USING (public.is_tenant_member(tenant_id, auth.uid()));
CREATE POLICY "Admin+ manage cf" ON public.custom_fields FOR ALL TO authenticated
  USING (public.has_tenant_role(tenant_id, auth.uid(), 'owner','admin'))
  WITH CHECK (public.has_tenant_role(tenant_id, auth.uid(), 'owner','admin'));

CREATE TABLE public.custom_field_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  field_id UUID NOT NULL REFERENCES public.custom_fields(id) ON DELETE CASCADE,
  value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (contact_id, field_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_field_values TO authenticated;
GRANT ALL ON public.custom_field_values TO service_role;
ALTER TABLE public.custom_field_values ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view cfv" ON public.custom_field_values FOR SELECT TO authenticated USING (public.is_tenant_member(tenant_id, auth.uid()));
CREATE POLICY "Manager+ manage cfv" ON public.custom_field_values FOR ALL TO authenticated
  USING (public.has_tenant_role(tenant_id, auth.uid(), 'owner','admin','manager'))
  WITH CHECK (public.has_tenant_role(tenant_id, auth.uid(), 'owner','admin','manager'));
CREATE TRIGGER trg_cfv_updated BEFORE UPDATE ON public.custom_field_values FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ MESSAGE TEMPLATES (versioned) ============
CREATE TABLE public.message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  template_name TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'en',
  category TEXT,
  body TEXT NOT NULL,
  header TEXT,
  footer TEXT,
  variables JSONB NOT NULL DEFAULT '[]'::jsonb,
  version INT NOT NULL DEFAULT 1,
  source TEXT NOT NULL DEFAULT 'manual',
  meta_template_id TEXT,
  sync_status public.template_sync_status NOT NULL DEFAULT 'draft',
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, template_name, language, version)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.message_templates TO authenticated;
GRANT ALL ON public.message_templates TO service_role;
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view templates" ON public.message_templates FOR SELECT TO authenticated USING (public.is_tenant_member(tenant_id, auth.uid()));
CREATE POLICY "Admin+ manage templates" ON public.message_templates FOR ALL TO authenticated
  USING (public.has_tenant_role(tenant_id, auth.uid(), 'owner','admin'))
  WITH CHECK (public.has_tenant_role(tenant_id, auth.uid(), 'owner','admin'));
CREATE TRIGGER trg_tpl_updated BEFORE UPDATE ON public.message_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ CAMPAIGNS ============
CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  template_id UUID REFERENCES public.message_templates(id) ON DELETE SET NULL,
  template_snapshot JSONB,
  audience_criteria JSONB,
  variable_mapping JSONB,
  status public.campaign_status NOT NULL DEFAULT 'draft',
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  total_recipients INT NOT NULL DEFAULT 0,
  processed_count INT NOT NULL DEFAULT 0,
  failed_count INT NOT NULL DEFAULT 0,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_campaigns_tenant ON public.campaigns(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_campaigns_status ON public.campaigns(status);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaigns TO authenticated;
GRANT ALL ON public.campaigns TO service_role;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view campaigns" ON public.campaigns FOR SELECT TO authenticated
  USING (
    public.is_tenant_member(tenant_id, auth.uid())
    AND (
      public.has_tenant_role(tenant_id, auth.uid(), 'owner','admin','manager')
      OR assigned_to = auth.uid()
    )
  );
CREATE POLICY "Manager+ insert campaigns" ON public.campaigns FOR INSERT TO authenticated
  WITH CHECK (public.has_tenant_role(tenant_id, auth.uid(), 'owner','admin','manager'));
CREATE POLICY "Manager+ update campaigns" ON public.campaigns FOR UPDATE TO authenticated
  USING (public.has_tenant_role(tenant_id, auth.uid(), 'owner','admin','manager'));
CREATE POLICY "Manager+ delete campaigns" ON public.campaigns FOR DELETE TO authenticated
  USING (public.has_tenant_role(tenant_id, auth.uid(), 'owner','admin','manager'));
CREATE TRIGGER trg_camp_updated BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ CAMPAIGN RECIPIENTS (frozen) ============
CREATE TABLE public.campaign_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  phone_number_normalized TEXT NOT NULL,
  rendered_variables JSONB,
  status public.recipient_status NOT NULL DEFAULT 'pending',
  attempts INT NOT NULL DEFAULT 0,
  error TEXT,
  meta_message_id TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_cr_campaign ON public.campaign_recipients(campaign_id);
CREATE INDEX idx_cr_status ON public.campaign_recipients(campaign_id, status);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaign_recipients TO authenticated;
GRANT ALL ON public.campaign_recipients TO service_role;
ALTER TABLE public.campaign_recipients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view recipients" ON public.campaign_recipients FOR SELECT TO authenticated USING (public.is_tenant_member(tenant_id, auth.uid()));
CREATE POLICY "Manager+ manage recipients" ON public.campaign_recipients FOR ALL TO authenticated
  USING (public.has_tenant_role(tenant_id, auth.uid(), 'owner','admin','manager'))
  WITH CHECK (public.has_tenant_role(tenant_id, auth.uid(), 'owner','admin','manager'));
CREATE TRIGGER trg_cr_updated BEFORE UPDATE ON public.campaign_recipients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ CAMPAIGN JOBS ============
CREATE TABLE public.campaign_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'queued',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  total_recipients INT NOT NULL DEFAULT 0,
  processed_count INT NOT NULL DEFAULT 0,
  failed_count INT NOT NULL DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaign_jobs TO authenticated;
GRANT ALL ON public.campaign_jobs TO service_role;
ALTER TABLE public.campaign_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view jobs" ON public.campaign_jobs FOR SELECT TO authenticated USING (public.is_tenant_member(tenant_id, auth.uid()));
CREATE POLICY "Manager+ manage jobs" ON public.campaign_jobs FOR ALL TO authenticated
  USING (public.has_tenant_role(tenant_id, auth.uid(), 'owner','admin','manager'))
  WITH CHECK (public.has_tenant_role(tenant_id, auth.uid(), 'owner','admin','manager'));
CREATE TRIGGER trg_cj_updated BEFORE UPDATE ON public.campaign_jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ RATE LIMITS ============
CREATE TABLE public.rate_limits (
  tenant_id UUID PRIMARY KEY REFERENCES public.tenants(id) ON DELETE CASCADE,
  messages_per_hour INT NOT NULL DEFAULT 500,
  messages_per_day INT NOT NULL DEFAULT 5000,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rate_limits TO authenticated;
GRANT ALL ON public.rate_limits TO service_role;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view limits" ON public.rate_limits FOR SELECT TO authenticated USING (public.is_tenant_member(tenant_id, auth.uid()));
CREATE POLICY "Owners manage limits" ON public.rate_limits FOR ALL TO authenticated
  USING (public.has_tenant_role(tenant_id, auth.uid(), 'owner'))
  WITH CHECK (public.has_tenant_role(tenant_id, auth.uid(), 'owner'));

-- ============ SYSTEM ERRORS ============
CREATE TABLE public.system_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  error TEXT NOT NULL,
  context JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.system_errors TO authenticated;
GRANT ALL ON public.system_errors TO service_role;
ALTER TABLE public.system_errors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin+ view errors" ON public.system_errors FOR SELECT TO authenticated
  USING (tenant_id IS NOT NULL AND public.has_tenant_role(tenant_id, auth.uid(), 'owner','admin'));

-- ============ AUDIT LOGS ============
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_tenant ON public.audit_logs(tenant_id, created_at DESC);
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin+ view audit" ON public.audit_logs FOR SELECT TO authenticated
  USING (public.has_tenant_role(tenant_id, auth.uid(), 'owner','admin'));
CREATE POLICY "Members write audit" ON public.audit_logs FOR INSERT TO authenticated
  WITH CHECK (public.is_tenant_member(tenant_id, auth.uid()));

-- ============ FUTURE: conversations, messages, webhook_events ============
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'open',
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversations TO authenticated;
GRANT ALL ON public.conversations TO service_role;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view conv" ON public.conversations FOR SELECT TO authenticated USING (public.is_tenant_member(tenant_id, auth.uid()));
CREATE POLICY "Members manage conv" ON public.conversations FOR ALL TO authenticated
  USING (public.is_tenant_member(tenant_id, auth.uid()))
  WITH CHECK (public.is_tenant_member(tenant_id, auth.uid()));

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  direction TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'text',
  body TEXT,
  meta_message_id TEXT,
  status TEXT,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view msg" ON public.messages FOR SELECT TO authenticated USING (public.is_tenant_member(tenant_id, auth.uid()));
CREATE POLICY "Members insert msg" ON public.messages FOR INSERT TO authenticated WITH CHECK (public.is_tenant_member(tenant_id, auth.uid()));

CREATE TABLE public.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  source TEXT NOT NULL DEFAULT 'meta',
  event_type TEXT,
  payload JSONB NOT NULL,
  processed_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.webhook_events TO authenticated;
GRANT ALL ON public.webhook_events TO service_role;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin+ view webhooks" ON public.webhook_events FOR SELECT TO authenticated
  USING (tenant_id IS NOT NULL AND public.has_tenant_role(tenant_id, auth.uid(), 'owner','admin'));

-- ============ Phone normalization helper ============
CREATE OR REPLACE FUNCTION public.normalize_phone(_raw TEXT)
RETURNS TEXT LANGUAGE sql IMMUTABLE AS $$
  SELECT regexp_replace(COALESCE(_raw,''), '\D', '', 'g');
$$;
