-- Add last_inbound_at column to conversations table to track numbers that have replied
ALTER TABLE public.conversations 
ADD COLUMN IF NOT EXISTS last_inbound_at TIMESTAMPTZ;

-- Backfill last_inbound_at for existing conversations using conversation_messages
UPDATE public.conversations c
SET last_inbound_at = sub.max_inbound
FROM (
  SELECT conversation_id, MAX(created_at) as max_inbound
  FROM public.conversation_messages
  WHERE direction = 'inbound'
  GROUP BY conversation_id
) sub
WHERE c.id = sub.conversation_id;

-- Create an index to optimize sorting conversations by last_inbound_at
CREATE INDEX IF NOT EXISTS idx_conversations_last_inbound ON public.conversations(tenant_id, last_inbound_at DESC NULLS LAST);

-- Update sync_message_to_conversation_message trigger function to set last_inbound_at on conversations for inbound messages
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
      meta_message_id = EXCLUDED.meta_message_id,
      meta_status = EXCLUDED.meta_status,
      sent_at = EXCLUDED.sent_at,
      delivered_at = EXCLUDED.delivered_at,
      read_at = EXCLUDED.read_at;

    IF NEW.direction = 'in' THEN
      UPDATE public.conversations
      SET last_inbound_at = NEW.created_at
      WHERE id = NEW.conversation_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.conversation_messages SET
      meta_message_id = NEW.meta_message_id,
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
