-- Master admin password + confirm Dennis Williams full admin access.
-- Password set per clinic owner request (rotate after first login if desired).

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- admin@elevatedhealthaugusta.com (master admin UUID from 20251210233224)
UPDATE auth.users
SET
  encrypted_password = extensions.crypt('Elevated2026!', extensions.gen_salt('bf')),
  email_confirmed_at = COALESCE(email_confirmed_at, timezone('utc', now())),
  updated_at = timezone('utc', now())
WHERE lower(email) = 'admin@elevatedhealthaugusta.com'
   OR id = '1227a9b3-e319-4c79-a31a-ad17cdc847cc'::uuid;

-- Dennis Williams — full admin (keeps business_admin for dashboard routing)
DO $$
DECLARE
  _uid uuid;
BEGIN
  SELECT id INTO _uid FROM auth.users WHERE lower(email) = 'drdwmd@pmrehab.net' LIMIT 1;

  IF _uid IS NULL THEN
    RAISE EXCEPTION 'drdwmd@pmrehab.net auth user not found — run 20260608130000 first';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  SELECT _uid, 'admin'::public.app_role
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = _uid AND ur.role = 'admin'::public.app_role
  );

  INSERT INTO public.user_roles (user_id, role)
  SELECT _uid, 'business_admin'::public.app_role
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = _uid AND ur.role = 'business_admin'::public.app_role
  );

  DELETE FROM public.user_roles ur
  WHERE ur.user_id = _uid AND ur.role = 'user'::public.app_role;
END;
$$;

COMMIT;
