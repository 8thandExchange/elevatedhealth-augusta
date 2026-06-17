-- Dennis Williams portal password bootstrap.
-- He can change it anytime via Forgot password on /admin/login or /calendar/login.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

UPDATE auth.users
SET
  encrypted_password = extensions.crypt('Elevated2026!', extensions.gen_salt('bf')),
  email_confirmed_at = COALESCE(email_confirmed_at, timezone('utc', now())),
  updated_at = timezone('utc', now())
WHERE lower(email) = 'drdwmd@pmrehab.net';

COMMIT;
