-- Master admin login email is admin@elevatedhealthaugusta.com (was troy@elevatedhealthaugusta.com).
-- Password remains Elevated2026! (re-applied here for certainty).

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  _uid constant uuid := '1227a9b3-e319-4c79-a31a-ad17cdc847cc';
  _email constant text := 'admin@elevatedhealthaugusta.com';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = _uid) THEN
    RAISE EXCEPTION 'Master admin user % not found', _uid;
  END IF;

  IF EXISTS (
    SELECT 1 FROM auth.users
    WHERE lower(email) = lower(_email) AND id <> _uid
  ) THEN
    RAISE EXCEPTION 'Email % already belongs to another user', _email;
  END IF;

  UPDATE auth.users
  SET
    email = _email,
    encrypted_password = extensions.crypt('Elevated2026!', extensions.gen_salt('bf')),
    email_confirmed_at = COALESCE(email_confirmed_at, timezone('utc', now())),
    updated_at = timezone('utc', now())
  WHERE id = _uid;

  UPDATE auth.identities
  SET
    identity_data = jsonb_set(
      jsonb_set(identity_data, '{email}', to_jsonb(_email), true),
      '{email_verified}', 'true'::jsonb,
      true
    ),
    updated_at = timezone('utc', now())
  WHERE user_id = _uid AND provider = 'email';
END;
$$;

COMMIT;
