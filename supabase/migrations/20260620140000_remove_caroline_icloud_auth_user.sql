-- Remove duplicate Caroline Marshall auth account (caroline.marsh1@icloud.com).
-- Canonical clinic login: caroline@elevatedhealthaugusta.com (6d3d8103-e937-4885-beee-297ab31033f7).
-- Provider role and active schedules were removed in 20260619180000.

DO $$
DECLARE
  _icloud uuid := 'e6efa6fd-0766-4dbc-bd8f-5d9a73f88a5d';
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE id = _icloud AND lower(email) = 'caroline.marsh1@icloud.com'
  ) THEN
    RAISE NOTICE 'Caroline iCloud auth user already removed; skipping.';
    RETURN;
  END IF;

  DELETE FROM public.schedule_exceptions WHERE provider_id = _icloud;
  DELETE FROM public.schedule_blocks WHERE provider_id = _icloud;
  DELETE FROM public.provider_schedules WHERE provider_id = _icloud;

  DELETE FROM auth.users WHERE id = _icloud;
END $$;
