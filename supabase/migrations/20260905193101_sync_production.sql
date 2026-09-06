-- Sync missing production schema changes

-- 1. Add branding_level to tenant_branding
ALTER TABLE public.tenant_branding ADD COLUMN IF NOT EXISTS branding_level text;

-- 2. Add missing values to campaign_status enum
ALTER TYPE public.campaign_status ADD VALUE IF NOT EXISTS 'processing';
ALTER TYPE public.campaign_status ADD VALUE IF NOT EXISTS 'partial';

-- 3. Add foreign keys for conversation activities and notes
ALTER TABLE public.conversation_internal_notes 
  DROP CONSTRAINT IF EXISTS conversation_internal_notes_author_id_fkey,
  DROP CONSTRAINT IF EXISTS conversation_internal_notes_author_fkey,
  ADD CONSTRAINT conversation_internal_notes_author_id_fkey 
  FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.conversation_activities 
  DROP CONSTRAINT IF EXISTS conversation_activities_actor_id_fkey,
  DROP CONSTRAINT IF EXISTS conversation_activities_actor_fkey,
  ADD CONSTRAINT conversation_activities_actor_id_fkey 
  FOREIGN KEY (actor_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
