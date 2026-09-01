CREATE OR REPLACE FUNCTION public.increment_campaign_counters(
  _campaign_id uuid,
  _processed int,
  _failed int
) RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.campaigns
     SET processed_count = COALESCE(processed_count, 0) + COALESCE(_processed, 0),
         failed_count    = COALESCE(failed_count, 0)    + COALESCE(_failed, 0)
   WHERE id = _campaign_id;
$$;

REVOKE ALL ON FUNCTION public.increment_campaign_counters(uuid, int, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_campaign_counters(uuid, int, int) TO service_role;