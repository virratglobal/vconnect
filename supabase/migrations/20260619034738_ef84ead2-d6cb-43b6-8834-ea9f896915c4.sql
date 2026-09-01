ALTER TABLE public.system_errors ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.webhook_events ALTER COLUMN tenant_id SET NOT NULL;