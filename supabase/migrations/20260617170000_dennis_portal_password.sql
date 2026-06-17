-- Password randomized for repo safety. Real credentials are set by the clinic owner via Supabase invite or dashboard and are never committed.
-- Dennis Williams portal password bootstrap placeholder (randomized on fresh apply).

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

UPDATE auth.users
SET
  encrypted_password = extensions.crypt(gen_random_uuid()::text, extensions.gen_salt('bf')),
  email_confirmed_at = COALESCE(email_confirmed_at, timezone('utc', now())),
  updated_at = timezone('utc', now())
WHERE lower(email) = 'drdwmd@pmrehab.net';

COMMIT;
