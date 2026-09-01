-- ============ Campaign Diagnostics Helper ============
-- Returns full diagnostic data for a given campaign: failed recipients
-- with their error messages, system error log entries, and status breakdown.
-- Usage: SELECT * FROM public.diagnose_campaign('<campaign_id>'::uuid);

CREATE OR REPLACE FUNCTION public.diagnose_campaign(_campaign_id uuid)
RETURNS TABLE (
  section          text,
  recipient_id     uuid,
  phone            text,
  status           text,
  error            text,
  meta_message_id  text,
  rendered_vars    jsonb,
  created_at       timestamptz
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  -- Failed recipients with full detail
  SELECT
    'failed_recipient'::text           AS section,
    cr.id                              AS recipient_id,
    cr.phone_number_normalized         AS phone,
    cr.status::text                    AS status,
    cr.error                           AS error,
    cr.meta_message_id                 AS meta_message_id,
    cr.rendered_variables              AS rendered_vars,
    cr.created_at                      AS created_at
  FROM public.campaign_recipients cr
  WHERE cr.campaign_id = _campaign_id
    AND cr.status = 'failed'

  UNION ALL

  -- Sent recipients for comparison
  SELECT
    'sent_recipient'::text,
    cr.id,
    cr.phone_number_normalized,
    cr.status::text,
    NULL,
    cr.meta_message_id,
    cr.rendered_variables,
    cr.created_at
  FROM public.campaign_recipients cr
  WHERE cr.campaign_id = _campaign_id
    AND cr.status = 'sent'

  UNION ALL

  -- System error log entries related to this campaign
  SELECT
    'system_error'::text,
    NULL,
    NULL,
    se.type,
    se.error,
    NULL,
    se.context,
    se.created_at
  FROM public.system_errors se
  WHERE se.context->>'campaign_id' = _campaign_id::text

  ORDER BY created_at DESC;
$$;

REVOKE ALL ON FUNCTION public.diagnose_campaign(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.diagnose_campaign(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.diagnose_campaign(uuid) TO authenticated;

-- ============ Ensure system_errors allows NULL tenant_id ============
-- Migration 20260619034738 set tenant_id NOT NULL which blocks logging
-- errors that occur before tenant context is known.
ALTER TABLE public.system_errors ALTER COLUMN tenant_id DROP NOT NULL;
ALTER TABLE public.webhook_events ALTER COLUMN tenant_id DROP NOT NULL;
