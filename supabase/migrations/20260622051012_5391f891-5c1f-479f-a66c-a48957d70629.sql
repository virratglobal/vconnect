
DROP POLICY IF EXISTS "Allow authenticated delete campaign-media" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated insert campaign-media" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated read campaign-media" ON storage.objects;

CREATE POLICY "campaign-media tenant read"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'campaign-media'
  AND public.is_tenant_member(((storage.foldername(name))[1])::uuid, auth.uid())
);

CREATE POLICY "campaign-media tenant insert"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'campaign-media'
  AND public.is_tenant_member(((storage.foldername(name))[1])::uuid, auth.uid())
);

CREATE POLICY "campaign-media tenant update"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'campaign-media'
  AND public.is_tenant_member(((storage.foldername(name))[1])::uuid, auth.uid())
)
WITH CHECK (
  bucket_id = 'campaign-media'
  AND public.is_tenant_member(((storage.foldername(name))[1])::uuid, auth.uid())
);

CREATE POLICY "campaign-media tenant delete"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'campaign-media'
  AND public.is_tenant_member(((storage.foldername(name))[1])::uuid, auth.uid())
);
