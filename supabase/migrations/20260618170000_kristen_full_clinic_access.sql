-- Ensure Kristen Covington (office manager) retains full clinic access roles.
-- Idempotent: safe to re-run; does not rotate passwords.

BEGIN;

DO $$
DECLARE
  _uid uuid;
BEGIN
  SELECT id INTO _uid FROM auth.users WHERE lower(email) = 'kcovington@pmrehab.net' LIMIT 1;

  IF _uid IS NULL THEN
    RAISE NOTICE 'kcovington@pmrehab.net not found — invite via Supabase Auth dashboard';
    RETURN;
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  SELECT _uid, r.role::public.app_role
  FROM (VALUES ('admin'), ('staff'), ('business_admin')) AS r(role)
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = _uid AND ur.role = r.role::public.app_role
  );

  DELETE FROM public.user_roles ur
  WHERE ur.user_id = _uid AND ur.role = 'user'::public.app_role;
END;
$$;

COMMIT;
