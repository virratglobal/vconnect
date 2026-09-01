
CREATE OR REPLACE FUNCTION public.prevent_super_admin_self_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_super_admin IS DISTINCT FROM OLD.is_super_admin THEN
    IF NOT public.is_super_admin(auth.uid()) THEN
      NEW.is_super_admin := OLD.is_super_admin;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_block_super_admin_self_set ON public.profiles;
CREATE TRIGGER profiles_block_super_admin_self_set
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_super_admin_self_escalation();
