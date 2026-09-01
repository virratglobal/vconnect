-- Alter message_templates to support image headers and metadata
ALTER TABLE public.message_templates 
ADD COLUMN IF NOT EXISTS header_type TEXT DEFAULT 'NONE',
ADD COLUMN IF NOT EXISTS header_format TEXT DEFAULT 'NONE',
ADD COLUMN IF NOT EXISTS approval_status TEXT,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS example_media_url TEXT;

-- Create campaign_media table for tracking uploaded assets
CREATE TABLE IF NOT EXISTS public.campaign_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    uploaded_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on campaign_media
ALTER TABLE public.campaign_media ENABLE ROW LEVEL SECURITY;

-- Drop policies if they exist (to ensure script is re-runnable)
DROP POLICY IF EXISTS "Members view own tenant media" ON public.campaign_media;
DROP POLICY IF EXISTS "Manager+ manage tenant media" ON public.campaign_media;

-- Create policies for campaign_media
CREATE POLICY "Members view own tenant media" ON public.campaign_media
    FOR SELECT TO authenticated 
    USING (public.is_tenant_member(tenant_id, auth.uid()));

CREATE POLICY "Manager+ manage tenant media" ON public.campaign_media
    FOR ALL TO authenticated 
    USING (
        public.has_tenant_role(tenant_id, auth.uid(), 'owner', 'admin', 'manager')
    );

-- Initialize storage bucket campaign-media if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'campaign-media',
    'campaign-media',
    true,
    5242880, -- 5 MB
    ARRAY['image/jpeg', 'image/png', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- Storage object policies for campaign-media
DROP POLICY IF EXISTS "Allow authenticated read campaign-media" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated insert campaign-media" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete campaign-media" ON storage.objects;

CREATE POLICY "Allow authenticated read campaign-media" ON storage.objects
    FOR SELECT TO authenticated 
    USING (bucket_id = 'campaign-media');

CREATE POLICY "Allow authenticated insert campaign-media" ON storage.objects
    FOR INSERT TO authenticated 
    WITH CHECK (bucket_id = 'campaign-media');

CREATE POLICY "Allow authenticated delete campaign-media" ON storage.objects
    FOR DELETE TO authenticated 
    USING (bucket_id = 'campaign-media');
