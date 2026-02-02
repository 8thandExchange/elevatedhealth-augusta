-- Add intake token columns for secure public intake forms
ALTER TABLE public.patients
ADD COLUMN IF NOT EXISTS intake_token UUID DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS intake_token_expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days');

-- Create index for fast token lookups
CREATE INDEX IF NOT EXISTS idx_patients_intake_token 
ON public.patients(intake_token) 
WHERE intake_token IS NOT NULL;

-- Add comment explaining the purpose
COMMENT ON COLUMN public.patients.intake_token IS 'Secure token for public intake form access (expires after 7 days)';
COMMENT ON COLUMN public.patients.intake_token_expires_at IS 'Expiration timestamp for intake token';