-- Add api_failed to recipient_status enum
ALTER TYPE public.recipient_status ADD VALUE IF NOT EXISTS 'api_failed';

-- Add delivery tracking fields to campaign_recipients
ALTER TABLE public.campaign_recipients ADD COLUMN IF NOT EXISTS meta_status TEXT;
ALTER TABLE public.campaign_recipients ADD COLUMN IF NOT EXISTS meta_error TEXT;
ALTER TABLE public.campaign_recipients ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;
ALTER TABLE public.campaign_recipients ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

-- Create campaign_logs table
CREATE TABLE IF NOT EXISTS public.campaign_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES public.campaign_recipients(id) ON DELETE SET NULL,
  log_type TEXT NOT NULL,
  request_payload JSONB,
  response_payload JSONB,
  http_status INTEGER,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on campaign_logs
ALTER TABLE public.campaign_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for campaign_logs (Owners, Admins, and Managers)
CREATE POLICY "Members view campaign logs" ON public.campaign_logs 
  FOR SELECT TO authenticated 
  USING (public.is_tenant_member(tenant_id, auth.uid()));

CREATE POLICY "Manager+ manage campaign logs" ON public.campaign_logs 
  FOR ALL TO authenticated
  USING (public.has_tenant_role(tenant_id, auth.uid(), 'owner','admin','manager'))
  WITH CHECK (public.has_tenant_role(tenant_id, auth.uid(), 'owner','admin','manager'));

-- Grant table access
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaign_logs TO authenticated;
GRANT ALL ON public.campaign_logs TO service_role;
