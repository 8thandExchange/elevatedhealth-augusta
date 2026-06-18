-- patients.avatar_url is referenced in provider/patient UI but was never migrated to live.
ALTER TABLE public.patients
  ADD COLUMN IF NOT EXISTS avatar_url text;

COMMENT ON COLUMN public.patients.avatar_url IS
  'Optional profile photo URL (OAuth or patient upload).';
