-- Retire ZRT / saliva-kit lab path in live patient rows (UI is LabCorp-only).

UPDATE public.patients
SET lab_path = 'labcorp'
WHERE lab_path IS NULL OR lab_path = 'zrt';

UPDATE public.patients
SET onboarding_status = 'awaiting_blood_work'
WHERE onboarding_status IN ('labs_paid', 'kit_link_sent', 'kit_shipped');

UPDATE public.patients
SET onboarding_status = 'labs_in_progress'
WHERE onboarding_status = 'sample_received';

COMMENT ON COLUMN public.patients.lab_path IS
  'Clinic lab lane: labcorp (in-office). Legacy value zrt is migrated to labcorp.';
