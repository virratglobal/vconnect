-- ============================================================
-- CONVERSATION ASSIGNMENT SYSTEM — ADDITIVE MIGRATION
-- 20260625100000_conversation_assignment.sql
--
-- ADDITIVE ONLY. Zero modifications to existing tables/columns
-- that could break campaigns, templates, webhooks, contacts,
-- authentication, RBAC, or tenant isolation.
-- ============================================================

-- ─── 1. Extend conversations with assignment + priority + SLA ────────────────

ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS assigned_to  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS assigned_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS assigned_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS priority     TEXT NOT NULL DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS first_response_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS resolved_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sla_breach_at TIMESTAMPTZ;

-- Priority constraint
ALTER TABLE public.conversations DROP CONSTRAINT IF EXISTS check_conversations_priority;
ALTER TABLE public.conversations ADD CONSTRAINT check_conversations_priority
  CHECK (priority IN ('low', 'medium', 'high', 'urgent'));

-- Extend status to include 'resolved' (drop + recreate is safe here — only additive value added)
ALTER TABLE public.conversations DROP CONSTRAINT IF EXISTS check_conversations_status;
ALTER TABLE public.conversations ADD CONSTRAINT check_conversations_status
  CHECK (status IN ('open', 'pending', 'resolved', 'closed'));

-- Indexes for fast assignment + priority lookups
CREATE INDEX IF NOT EXISTS idx_conversations_assigned_to
  ON public.conversations(tenant_id, assigned_to);
CREATE INDEX IF NOT EXISTS idx_conversations_priority
  ON public.conversations(tenant_id, priority);

-- ─── 2. Role-aware RLS on conversations ─────────────────────────────────────

-- Drop the current open-to-all-members SELECT policy
DROP POLICY IF EXISTS "Members view conv" ON public.conversations;

-- Owner / Admin / Manager → see every conversation in the tenant
CREATE POLICY "Manager+ view all conv" ON public.conversations
  FOR SELECT TO authenticated
  USING (
    public.is_tenant_member(tenant_id, auth.uid())
    AND public.has_tenant_role(tenant_id, auth.uid(), 'owner', 'admin', 'manager')
  );

-- Agent → see ONLY conversations explicitly assigned to them
CREATE POLICY "Agent view assigned conv" ON public.conversations
  FOR SELECT TO authenticated
  USING (
    public.is_tenant_member(tenant_id, auth.uid())
    AND public.tenant_role_of(tenant_id, auth.uid()) = 'agent'
    AND assigned_to = auth.uid()
  );

-- ─── 3. Profile visibility for Assign Modal ──────────────────────────────────
-- Workspace members need to read each other's full_name/email to display in
-- the assign picker. The existing policy only allows own-profile reads.

DROP POLICY IF EXISTS "Co-members view profiles" ON public.profiles;
CREATE POLICY "Co-members view profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1
      FROM public.tenant_members tm1
      JOIN public.tenant_members tm2 ON tm1.tenant_id = tm2.tenant_id
      WHERE tm1.user_id = auth.uid()
        AND tm2.user_id = profiles.id
    )
  );

-- ─── 4. Internal Notes ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.conversation_internal_notes (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID        NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  conversation_id UUID        NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  author_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body            TEXT        NOT NULL,
  mentions        JSONB       NOT NULL DEFAULT '[]'::jsonb,  -- array of user_id strings
  deleted_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conv_notes_conversation
  ON public.conversation_internal_notes(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_conv_notes_tenant
  ON public.conversation_internal_notes(tenant_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversation_internal_notes TO authenticated;
GRANT ALL ON public.conversation_internal_notes TO service_role;
ALTER TABLE public.conversation_internal_notes ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trg_conv_notes_updated ON public.conversation_internal_notes;
CREATE TRIGGER trg_conv_notes_updated
  BEFORE UPDATE ON public.conversation_internal_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Members view non-deleted notes
DROP POLICY IF EXISTS "Members view conv notes" ON public.conversation_internal_notes;
CREATE POLICY "Members view conv notes" ON public.conversation_internal_notes
  FOR SELECT TO authenticated
  USING (
    public.is_tenant_member(tenant_id, auth.uid())
    AND deleted_at IS NULL
  );

-- Members insert their own notes
DROP POLICY IF EXISTS "Members insert conv notes" ON public.conversation_internal_notes;
CREATE POLICY "Members insert conv notes" ON public.conversation_internal_notes
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_tenant_member(tenant_id, auth.uid())
    AND author_id = auth.uid()
  );

-- Authors + Admin+ can update notes
DROP POLICY IF EXISTS "Author or admin update conv notes" ON public.conversation_internal_notes;
CREATE POLICY "Author or admin update conv notes" ON public.conversation_internal_notes
  FOR UPDATE TO authenticated
  USING (
    public.is_tenant_member(tenant_id, auth.uid())
    AND (
      author_id = auth.uid()
      OR public.has_tenant_role(tenant_id, auth.uid(), 'owner', 'admin')
    )
  );

-- Owner/Admin can hard-delete notes
DROP POLICY IF EXISTS "Admin+ delete conv notes" ON public.conversation_internal_notes;
CREATE POLICY "Admin+ delete conv notes" ON public.conversation_internal_notes
  FOR DELETE TO authenticated
  USING (public.has_tenant_role(tenant_id, auth.uid(), 'owner', 'admin'));

-- ─── 5. Assignment Logs ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.conversation_assignment_logs (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID        NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  conversation_id   UUID        NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  action            TEXT        NOT NULL CHECK (action IN ('assigned','reassigned','transferred','unassigned')),
  assigned_to       UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_by       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  previous_assignee UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  reason            TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assign_logs_conversation
  ON public.conversation_assignment_logs(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_assign_logs_tenant
  ON public.conversation_assignment_logs(tenant_id, created_at DESC);

GRANT SELECT, INSERT ON public.conversation_assignment_logs TO authenticated;
GRANT ALL ON public.conversation_assignment_logs TO service_role;
ALTER TABLE public.conversation_assignment_logs ENABLE ROW LEVEL SECURITY;

-- Members insert logs
DROP POLICY IF EXISTS "Members insert assign logs" ON public.conversation_assignment_logs;
CREATE POLICY "Members insert assign logs" ON public.conversation_assignment_logs
  FOR INSERT TO authenticated
  WITH CHECK (public.is_tenant_member(tenant_id, auth.uid()));

-- Manager+ view logs
DROP POLICY IF EXISTS "Manager+ view assign logs" ON public.conversation_assignment_logs;
CREATE POLICY "Manager+ view assign logs" ON public.conversation_assignment_logs
  FOR SELECT TO authenticated
  USING (public.has_tenant_role(tenant_id, auth.uid(), 'owner', 'admin', 'manager'));

-- ─── 6. Conversation Activities (unified timeline) ───────────────────────────

CREATE TABLE IF NOT EXISTS public.conversation_activities (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID        NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  conversation_id UUID        NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  actor_id        UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  activity_type   TEXT        NOT NULL,
  -- Types: created | assigned | reassigned | transferred | unassigned
  --        status_changed | priority_changed | note_added
  --        message_sent | message_received | resolved | closed | reopened
  metadata        JSONB       NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conv_activities_conversation
  ON public.conversation_activities(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_conv_activities_tenant
  ON public.conversation_activities(tenant_id, created_at DESC);

GRANT SELECT, INSERT ON public.conversation_activities TO authenticated;
GRANT ALL ON public.conversation_activities TO service_role;
ALTER TABLE public.conversation_activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members view conv activities" ON public.conversation_activities;
CREATE POLICY "Members view conv activities" ON public.conversation_activities
  FOR SELECT TO authenticated
  USING (public.is_tenant_member(tenant_id, auth.uid()));

DROP POLICY IF EXISTS "Members insert conv activities" ON public.conversation_activities;
CREATE POLICY "Members insert conv activities" ON public.conversation_activities
  FOR INSERT TO authenticated
  WITH CHECK (public.is_tenant_member(tenant_id, auth.uid()));

-- ─── 7. Assignment Settings ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.tenant_assignment_settings (
  tenant_id        UUID PRIMARY KEY REFERENCES public.tenants(id) ON DELETE CASCADE,
  strategy         TEXT NOT NULL DEFAULT 'unassigned'
    CHECK (strategy IN ('unassigned','round_robin','least_active','specific_agent','department_based')),
  default_agent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.tenant_assignment_settings TO authenticated;
GRANT ALL ON public.tenant_assignment_settings TO service_role;
ALTER TABLE public.tenant_assignment_settings ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trg_assign_settings_updated ON public.tenant_assignment_settings;
CREATE TRIGGER trg_assign_settings_updated
  BEFORE UPDATE ON public.tenant_assignment_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP POLICY IF EXISTS "Members view assign settings" ON public.tenant_assignment_settings;
CREATE POLICY "Members view assign settings" ON public.tenant_assignment_settings
  FOR SELECT TO authenticated
  USING (public.is_tenant_member(tenant_id, auth.uid()));

DROP POLICY IF EXISTS "Admin+ manage assign settings" ON public.tenant_assignment_settings;
CREATE POLICY "Admin+ manage assign settings" ON public.tenant_assignment_settings
  FOR ALL TO authenticated
  USING (public.has_tenant_role(tenant_id, auth.uid(), 'owner', 'admin'))
  WITH CHECK (public.has_tenant_role(tenant_id, auth.uid(), 'owner', 'admin'));

-- ─── 8. Realtime publication ─────────────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'conversation_internal_notes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE conversation_internal_notes;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'conversation_activities'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE conversation_activities;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'conversation_assignment_logs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE conversation_assignment_logs;
  END IF;
END $$;
