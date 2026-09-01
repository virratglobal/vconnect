-- Add sent_to_meta as a valid recipient status enum value
ALTER TYPE public.recipient_status ADD VALUE IF NOT EXISTS 'sent_to_meta';
