-- Update sync_message_to_conversation_message trigger function to copy meta_message_id on update
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
