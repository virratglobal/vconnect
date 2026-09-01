-- ============ AUTO WEBHOOK VERIFY TOKEN ============
-- Adds a cryptographically secure, immutable webhook_verify_token to every tenant.
-- Tokens are auto-generated on tenant creation and never entered manually.

-- Step 1: Add the column
ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS webhook_verify_token TEXT;

-- Step 2: Token generation helper
CREATE OR REPLACE FUNCTION public.generate_webhook_verify_token()
RETURNS TEXT LANGUAGE sql AS $$
  SELECT 'wcrm_' || lower(replace(encode(gen_random_bytes(8), 'hex'), '-', ''));
$$;

-- Step 3: Backfill existing tenants
UPDATE public.tenants
SET webhook_verify_token = public.generate_webhook_verify_token()
WHERE webhook_verify_token IS NULL;

-- Step 4: Enforce NOT NULL + UNIQUE
ALTER TABLE public.tenants
  ALTER COLUMN webhook_verify_token SET NOT NULL,
  ADD CONSTRAINT tenants_webhook_verify_token_unique UNIQUE (webhook_verify_token);

-- Step 5: Update handle_new_tenant trigger to auto-generate token for new tenants
CREATE OR REPLACE FUNCTION public.handle_new_tenant()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.tenant_members (tenant_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'owner')
  ON CONFLICT DO NOTHING;

  IF NEW.webhook_verify_token IS NULL THEN
    UPDATE public.tenants
    SET webhook_verify_token = public.generate_webhook_verify_token()
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END; $$;

-- Step 6: Protect token from being changed via UPDATE (immutable after creation)
CREATE OR REPLACE FUNCTION public.protect_webhook_verify_token()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.webhook_verify_token := OLD.webhook_verify_token;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_protect_webhook_token ON public.tenants;
CREATE TRIGGER trg_protect_webhook_token
  BEFORE UPDATE OF webhook_verify_token ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.protect_webhook_verify_token();
