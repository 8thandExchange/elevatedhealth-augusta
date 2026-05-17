
-- Bootstrap helpers + cron command rewrite for vault-backed CRON_SECRET.

CREATE OR REPLACE FUNCTION public.bootstrap_vault_create_cron_secret(_value text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, vault, pg_temp
AS $$
DECLARE
  v_id uuid;
BEGIN
  v_id := vault.create_secret(_value, 'cron_secret', 'CRON_SECRET used by scheduled edge functions (X-Cron-Secret header)');
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.bootstrap_vault_update_cron_secret(_value text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, vault, pg_temp
AS $$
DECLARE
  v_id uuid;
BEGIN
  SELECT id INTO v_id FROM vault.secrets WHERE name = 'cron_secret';
  IF v_id IS NULL THEN
    PERFORM vault.create_secret(_value, 'cron_secret', 'CRON_SECRET used by scheduled edge functions (X-Cron-Secret header)');
  ELSE
    PERFORM vault.update_secret(v_id, _value, 'cron_secret', 'CRON_SECRET used by scheduled edge functions (X-Cron-Secret header)');
  END IF;
END;
$$;

-- Restrict EXECUTE: only service_role (used by edge function with service key) may invoke.
REVOKE ALL ON FUNCTION public.bootstrap_vault_create_cron_secret(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.bootstrap_vault_update_cron_secret(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.bootstrap_vault_create_cron_secret(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.bootstrap_vault_update_cron_secret(text) TO service_role;

-- Rewrite cron jobs 1 and 2 to read X-Cron-Secret from vault at execution time.
SELECT cron.alter_job(
  job_id := 1,
  command := $cmd$
    SELECT net.http_post(
      url := 'https://eserdstrggzfremnsvrf.supabase.co/functions/v1/send-intake-reminder',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'X-Cron-Secret', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'cron_secret' LIMIT 1)
      ),
      body := '{}'::jsonb
    ) AS request_id;
  $cmd$
);

SELECT cron.alter_job(
  job_id := 2,
  command := $cmd$
    SELECT net.http_post(
      url := 'https://eserdstrggzfremnsvrf.supabase.co/functions/v1/send-stale-intake-alert',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'X-Cron-Secret', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'cron_secret' LIMIT 1)
      ),
      body := '{}'::jsonb
    ) AS request_id;
  $cmd$
);
