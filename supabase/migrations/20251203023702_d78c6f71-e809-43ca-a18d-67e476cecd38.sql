-- Add primary_program column to patients table
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS primary_program text DEFAULT 'hormone';

-- Add comment for documentation
COMMENT ON COLUMN public.patients.primary_program IS 'Patient treatment track: hormone or ketamine';