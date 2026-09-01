DROP POLICY IF EXISTS "Members view jobs" ON public.campaign_jobs;

CREATE POLICY "Managers view jobs"
ON public.campaign_jobs
FOR SELECT
TO authenticated
USING (
  public.has_tenant_role(tenant_id, auth.uid(), 'owner'::tenant_role, 'admin'::tenant_role, 'manager'::tenant_role)
);