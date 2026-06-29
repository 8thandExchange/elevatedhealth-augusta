-- Hourly sweep: flip expired issued onboarding credits to expired for reporting.
-- Redemption already enforces the window live via get_redeemable_credit / redeem_onboarding_credit.
-- Idempotent: unschedule by name first, then schedule.

DO $$
BEGIN
  PERFORM cron.unschedule(jobid)
  FROM cron.job
  WHERE jobname = 'expire-onboarding-credits-hourly';
EXCEPTION
  WHEN undefined_table THEN NULL;
  WHEN undefined_function THEN NULL;
  WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule(
  'expire-onboarding-credits-hourly',
  '17 * * * *',
  $$ SELECT public.expire_onboarding_credits(); $$
);
