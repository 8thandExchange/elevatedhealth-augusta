-- Password randomized for repo safety. Real credentials are set by the clinic owner via Supabase invite or dashboard and are never committed.
-- Front-desk calendar kiosk + full admin for clinic leadership.
-- Kiosk auth email: calendar@elevatedhealthaugusta.com (username "calendar" in UI).

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- Helper: ensure auth.users row exists (random password if newly created).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public._bootstrap_staff_auth_user(
  _email text,
  _full_name text,
  _invited_roles jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  _uid uuid;
  _instance constant uuid := '00000000-0000-0000-0000-000000000000';
BEGIN
  SELECT id INTO _uid FROM auth.users WHERE lower(email) = lower(_email) LIMIT 1;

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
      lower(_email),
      extensions.crypt(gen_random_uuid()::text, extensions.gen_salt('bf')),
      timezone('utc', now()),
      timezone('utc', now()),
      timezone('utc', now()),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', _full_name, 'invited_roles', _invited_roles),
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
      jsonb_build_object('sub', _uid::text, 'email', lower(_email), 'email_verified', true),
      'email',
      timezone('utc', now()),
      timezone('utc', now()),
      timezone('utc', now())
    );

    RAISE NOTICE 'Created auth user for % — use Forgot password on /admin/login', _email;
  END IF;

  RETURN _uid;
END;
$$;

REVOKE ALL ON FUNCTION public._bootstrap_staff_auth_user(text, text, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public._bootstrap_staff_auth_user(text, text, jsonb) TO service_role;

-- ---------------------------------------------------------------------------
-- Kristen (office manager) — account may never have been bootstrapped.
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  _uid uuid;
BEGIN
  _uid := public._bootstrap_staff_auth_user(
    'kcovington@pmrehab.net',
    'Kristen Covington',
    '["staff","admin"]'::jsonb
  );

  INSERT INTO public.user_roles (user_id, role)
  SELECT _uid, r.role::public.app_role
  FROM (VALUES ('staff'), ('admin')) AS r(role)
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = _uid AND ur.role = r.role::public.app_role
  );

  DELETE FROM public.user_roles ur
  WHERE ur.user_id = _uid AND ur.role = 'user'::public.app_role;
END;
$$;

-- ---------------------------------------------------------------------------
-- Full admin for leadership (keeps existing roles; adds admin where missing).
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  _email text;
  _uid uuid;
BEGIN
  FOREACH _email IN ARRAY ARRAY[
    'drdwmd@pmrehab.net',
    'kcovington@pmrehab.net',
    'caroline@elevatedhealthaugusta.com',
    'troy.w.akers@gmail.com'
  ] LOOP
    SELECT id INTO _uid FROM auth.users WHERE lower(email) = lower(_email) LIMIT 1;
    IF _uid IS NULL THEN
      RAISE NOTICE 'Skipping admin grant — no auth user for %', _email;
      CONTINUE;
    END IF;

    INSERT INTO public.user_roles (user_id, role)
    SELECT _uid, 'admin'::public.app_role
    WHERE NOT EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = _uid AND ur.role = 'admin'::public.app_role
    );
  END LOOP;
END;
$$;

-- Dennis: ensure admin (migration above) + keep business_admin for routing.
DO $$
DECLARE
  _uid uuid;
BEGIN
  SELECT id INTO _uid FROM auth.users WHERE lower(email) = 'drdwmd@pmrehab.net' LIMIT 1;
  IF _uid IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    SELECT _uid, 'business_admin'::public.app_role
    WHERE NOT EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = _uid AND ur.role = 'business_admin'::public.app_role
    );
  END IF;
END;
$$;

-- ---------------------------------------------------------------------------
-- Shared front-desk calendar kiosk account (staff role for schedule RLS).
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  _email constant text := 'calendar@elevatedhealthaugusta.com';
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
      extensions.crypt(gen_random_uuid()::text, extensions.gen_salt('bf')),
      timezone('utc', now()),
      timezone('utc', now()),
      timezone('utc', now()),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Front Desk Calendar","kiosk":true}'::jsonb,
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
  ELSE
    UPDATE auth.users
    SET
      encrypted_password = extensions.crypt(gen_random_uuid()::text, extensions.gen_salt('bf')),
      updated_at = timezone('utc', now())
    WHERE id = _uid;
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  SELECT _uid, 'staff'::public.app_role
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = _uid AND ur.role = 'staff'::public.app_role
  );

  DELETE FROM public.user_roles ur
  WHERE ur.user_id = _uid AND ur.role = 'user'::public.app_role;
END;
$$;

DROP FUNCTION IF EXISTS public._bootstrap_staff_auth_user(text, text, jsonb);

COMMIT;
