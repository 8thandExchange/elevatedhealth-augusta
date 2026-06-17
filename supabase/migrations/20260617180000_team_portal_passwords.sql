-- Password randomized for repo safety. Real credentials are set by the clinic owner via Supabase invite or dashboard and are never committed.
-- Staff portal password bootstrap placeholder (randomized on fresh apply).

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

UPDATE auth.users u
SET
  encrypted_password = extensions.crypt(gen_random_uuid()::text, extensions.gen_salt('bf')),
  email_confirmed_at = COALESCE(u.email_confirmed_at, timezone('utc', now())),
  updated_at = timezone('utc', now())
FROM public.user_roles ur
WHERE u.id = ur.user_id
  AND ur.role IN (
    'admin'::public.app_role,
    'staff'::public.app_role,
    'provider'::public.app_role,
    'business_admin'::public.app_role
  );

-- Master admin row (protected UUID) if email differs from lookup above
UPDATE auth.users
SET
  encrypted_password = extensions.crypt(gen_random_uuid()::text, extensions.gen_salt('bf')),
  email_confirmed_at = COALESCE(email_confirmed_at, timezone('utc', now())),
  updated_at = timezone('utc', now())
WHERE id = '1227a9b3-e319-4c79-a31a-ad17cdc847cc'::uuid;

COMMIT;
