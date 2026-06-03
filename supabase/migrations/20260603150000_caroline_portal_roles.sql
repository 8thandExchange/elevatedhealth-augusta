-- Caroline Miller (RN): staff portal + own schedule + clinical RLS.
-- Requires auth.users row. If missing, admin creates account via Provider Dashboard → Team
-- (staff + provider roles) or send-provider-invite edge function.

DO $$
DECLARE
  _uid uuid;
  _email constant text := 'caroline@elevatedhealthaugusta.com';
BEGIN
  SELECT id INTO _uid
  FROM auth.users
  WHERE lower(email) = _email
  LIMIT 1;

  IF _uid IS NULL THEN
    RAISE NOTICE '% auth user not found — grant roles after Team invite', _email;
    RETURN;
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  SELECT _uid, r.role::public.app_role
  FROM (VALUES ('staff'), ('provider')) AS r(role)
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = _uid AND ur.role = r.role::public.app_role
  );

  -- Remove mistaken patient-only access if someone registered her on the patient portal first.
  DELETE FROM public.user_roles ur
  WHERE ur.user_id = _uid
    AND ur.role = 'user'::public.app_role;
END;
$$;
