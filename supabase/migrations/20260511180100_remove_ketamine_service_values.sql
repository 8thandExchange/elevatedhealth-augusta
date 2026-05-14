-- Workstream L: remove legacy ketamine-era rows where service_type / primary_program stored those values.
-- Columns are TEXT (not Postgres enums); no enum migration required.

DO $$
BEGIN
  DELETE FROM public.consultation_bookings
  WHERE service_type IN ('ketamine', 'mental_wellness', 'spravato', 'iv_ketamine');

  UPDATE public.patients
  SET primary_program = 'hormone'
  WHERE primary_program IN ('ketamine', 'mental_wellness', 'spravato', 'iv_ketamine');

  UPDATE public.patients
  SET onboarding_status = 'account_created'
  WHERE onboarding_status = 'ketamine_screening';
END $$;
