DROP POLICY IF EXISTS "campaign-media tenant insert" ON storage.objects;
DROP POLICY IF EXISTS "campaign-media tenant update" ON storage.objects;
DROP POLICY IF EXISTS "campaign-media tenant delete" ON storage.objects;

CREATE POLICY "campaign-media tenant insert"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'campaign-media'
  AND public.has_tenant_role(((storage.foldername(name))[1])::uuid, auth.uid(), 'owner'::tenant_role, 'admin'::tenant_role, 'manager'::tenant_role)
);

CREATE POLICY "campaign-media tenant update"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'campaign-media'
  AND public.has_tenant_role(((storage.foldername(name))[1])::uuid, auth.uid(), 'owner'::tenant_role, 'admin'::tenant_role, 'manager'::tenant_role)
)
WITH CHECK (
  bucket_id = 'campaign-media'
  AND public.has_tenant_role(((storage.foldername(name))[1])::uuid, auth.uid(), 'owner'::tenant_role, 'admin'::tenant_role, 'manager'::tenant_role)
);

CREATE POLICY "campaign-media tenant delete"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'campaign-media'
  AND public.has_tenant_role(((storage.foldername(name))[1])::uuid, auth.uid(), 'owner'::tenant_role, 'admin'::tenant_role, 'manager'::tenant_role)
);