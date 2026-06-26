-- ELEVATED combo programs: medication-only add-on lane (TRT/HRT/GLP-1) on anchor subscription.
ALTER TABLE public.patients
  ADD COLUMN IF NOT EXISTS elevated_program_addon text;

COMMENT ON COLUMN public.patients.elevated_program_addon IS
  'Medication-only add-on on the anchor ELEVATED subscription: trt, hrt, glp1_semaglutide, or glp1_tirzepatide. NULL when anchor-only.';

CREATE INDEX IF NOT EXISTS idx_patients_elevated_program_addon
  ON public.patients (elevated_program_addon)
  WHERE elevated_program_addon IS NOT NULL;
