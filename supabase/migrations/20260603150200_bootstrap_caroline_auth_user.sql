-- Bootstrap Caroline Miller staff portal account (email login).
-- Password is random; she sets a new one via Forgot password on /admin/login.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  _email constant text := 'caroline@elevatedhealthaugusta.com';
  _uid uuid;
  _instance constant uuid := '00000000-0000-0000-0000-000000000000';
BEGIN
  SELECT id INTO _uid FROM auth.users WHERE lower(email) = _email LIMIT 1;

  IF _uid IS NULL THEN
    _uid := gen_random_uuid();

    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      _instance,
      _uid,
      'authenticated',
      'authenticated',
      _email,
      crypt(gen_random_uuid()::text, gen_salt('bf')),
      timezone('utc', now()),
      timezone('utc', now()),
      timezone('utc', now()),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Caroline Miller","invited_roles":["staff","provider"]}'::jsonb,
      timezone('utc', now()),
      timezone('utc', now()),
      '',
      '',
      '',
      ''
    );

    INSERT INTO auth.identities (
      id,
      user_id,
      provider_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      _uid,
      _uid,
      _uid::text,
      jsonb_build_object('sub', _uid::text, 'email', _email, 'email_verified', true),
      'email',
      timezone('utc', now()),
      timezone('utc', now()),
      timezone('utc', now())
    );

    RAISE NOTICE 'Created auth user for % — use Forgot password on /admin/login', _email;
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  SELECT _uid, r.role::public.app_role
  FROM (VALUES ('staff'), ('provider')) AS r(role)
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = _uid AND ur.role = r.role::public.app_role
  );

  DELETE FROM public.user_roles ur
  WHERE ur.user_id = _uid AND ur.role = 'user'::public.app_role;
END;
$$;
