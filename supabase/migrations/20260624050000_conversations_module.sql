-- ============ CONVERSATIONS MODULE — ADDITIVE MIGRATION ============
-- Extends conversations table and creates conversation_messages table.
-- Does NOT drop or alter any existing columns/constraints except making phone_number NOT NULL.

-- Extend conversations
ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS phone_number TEXT,
  ADD COLUMN IF NOT EXISTS last_message TEXT,
  ADD COLUMN IF NOT EXISTS unread_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS wa_id TEXT;

-- Backfill phone_number from contacts where linked
UPDATE public.conversations c
  SET phone_number = ct.phone_number_normalized
  FROM public.contacts ct
  WHERE c.contact_id = ct.id
    AND c.phone_number IS NULL;

-- Set conversations.phone_number to NOT NULL (once backfilled/safe)
ALTER TABLE public.conversations ALTER COLUMN phone_number SET NOT NULL;

-- Add check constraint for status on conversations
ALTER TABLE public.conversations DROP CONSTRAINT IF EXISTS check_conversations_status;
ALTER TABLE public.conversations ADD CONSTRAINT check_conversations_status CHECK (status IN ('open', 'pending', 'closed'));

-- Create conversation_messages table
CREATE TABLE IF NOT EXISTS public.conversation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  meta_message_id TEXT,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  message_type TEXT NOT NULL CHECK (message_type IN ('text', 'image', 'document', 'video', 'audio', 'template')),
  message_text TEXT,
  media_url TEXT,
  meta_status TEXT,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_conversations_tenant_last ON public.conversations(tenant_id, last_message_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_conversations_phone ON public.conversations(tenant_id, phone_number);
CREATE INDEX IF NOT EXISTS idx_conv_msgs_conversation ON public.conversation_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conv_msgs_meta_id ON public.conversation_messages(meta_message_id) WHERE meta_message_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_conv_msgs_tenant ON public.conversation_messages(tenant_id);

-- Enable RLS on conversation_messages
ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for conversation_messages
DROP POLICY IF EXISTS "Members view messages" ON public.conversation_messages;
CREATE POLICY "Members view messages" ON public.conversation_messages
  FOR SELECT TO authenticated USING (is_tenant_member(tenant_id, auth.uid()));

DROP POLICY IF EXISTS "Members insert messages" ON public.conversation_messages;
CREATE POLICY "Members insert messages" ON public.conversation_messages
  FOR INSERT TO authenticated WITH CHECK (is_tenant_member(tenant_id, auth.uid()));

DROP POLICY IF EXISTS "Members update messages" ON public.conversation_messages;
CREATE POLICY "Members update messages" ON public.conversation_messages
  FOR UPDATE TO authenticated USING (is_tenant_member(tenant_id, auth.uid())) WITH CHECK (is_tenant_member(tenant_id, auth.uid()));

DROP POLICY IF EXISTS "Members delete messages" ON public.conversation_messages;
CREATE POLICY "Members delete messages" ON public.conversation_messages
  FOR DELETE TO authenticated USING (is_tenant_member(tenant_id, auth.uid()));

-- Migrate data from messages to conversation_messages (if any exist)
INSERT INTO public.conversation_messages (
  id, tenant_id, conversation_id, meta_message_id, direction, message_type, message_text, media_url, meta_status, sent_at, delivered_at, read_at, created_at
)
SELECT 
  id, 
  tenant_id, 
  conversation_id, 
  meta_message_id, 
  CASE WHEN direction = 'in' THEN 'inbound' ELSE 'outbound' END, 
  CASE WHEN type IN ('text', 'image', 'document', 'video', 'audio', 'template') THEN type ELSE 'text' END, 
  body, 
  media_url, 
  status, 
  sent_at, 
  delivered_at, 
  read_at, 
  created_at
FROM public.messages
ON CONFLICT (id) DO NOTHING;

-- Create trigger function to sync messages to conversation_messages automatically
CREATE OR REPLACE FUNCTION public.sync_message_to_conversation_message()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.conversation_messages (
      id,
      tenant_id,
      conversation_id,
      meta_message_id,
      direction,
      message_type,
      message_text,
      media_url,
      meta_status,
      sent_at,
      delivered_at,
      read_at,
      created_at
    ) VALUES (
      NEW.id,
      NEW.tenant_id,
      NEW.conversation_id,
      NEW.meta_message_id,
      CASE WHEN NEW.direction = 'in' THEN 'inbound' ELSE 'outbound' END,
      CASE WHEN NEW.type IN ('text', 'image', 'document', 'video', 'audio', 'template') THEN NEW.type ELSE 'text' END,
      NEW.body,
      NEW.media_url,
      NEW.status,
      NEW.sent_at,
      NEW.delivered_at,
      NEW.read_at,
      NEW.created_at
    )
    ON CONFLICT (id) DO UPDATE SET
      meta_status = EXCLUDED.meta_status,
      sent_at = EXCLUDED.sent_at,
      delivered_at = EXCLUDED.delivered_at,
      read_at = EXCLUDED.read_at;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.conversation_messages SET
      meta_status = NEW.status,
      sent_at = NEW.sent_at,
      delivered_at = NEW.delivered_at,
      read_at = NEW.read_at
    WHERE id = NEW.id;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM public.conversation_messages WHERE id = OLD.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_sync_message_to_conversation_message ON public.messages;
CREATE TRIGGER trigger_sync_message_to_conversation_message
AFTER INSERT OR UPDATE OR DELETE ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.sync_message_to_conversation_message();

-- Add to supabase_realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'conversations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'conversation_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE conversation_messages;
  END IF;
END $$;
