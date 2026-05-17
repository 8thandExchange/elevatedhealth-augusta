
CREATE OR REPLACE FUNCTION public.trigger_cron_job_manual(_jobid bigint)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, vault, net, pg_temp
AS $$
DECLARE
  v_url text;
  v_secret text;
  v_req_id bigint;
BEGIN
  IF _jobid = 1 THEN
    v_url := 'https://eserdstrggzfremnsvrf.supabase.co/functions/v1/send-intake-reminder';
  ELSIF _jobid = 2 THEN
    v_url := 'https://eserdstrggzfremnsvrf.supabase.co/functions/v1/send-stale-intake-alert';
  ELSE
    RAISE EXCEPTION 'unsupported jobid %', _jobid;
  END IF;

  SELECT decrypted_secret INTO v_secret FROM vault.decrypted_secrets WHERE name='cron_secret' LIMIT 1;
  IF v_secret IS NULL THEN
    RAISE EXCEPTION 'cron_secret not present in vault';
  END IF;

  SELECT net.http_post(
    url := v_url,
    headers := jsonb_build_object('Content-Type','application/json','X-Cron-Secret', v_secret),
    body := '{}'::jsonb
  ) INTO v_req_id;

  RETURN v_req_id;
END;
$$;

REVOKE ALL ON FUNCTION public.trigger_cron_job_manual(bigint) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.trigger_cron_job_manual(bigint) TO service_role;
