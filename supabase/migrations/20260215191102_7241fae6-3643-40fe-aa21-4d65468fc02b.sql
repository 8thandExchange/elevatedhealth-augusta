
-- Add insurance fields to patients table for coverage lookup
ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS insurance_type text DEFAULT 'self_pay',
ADD COLUMN IF NOT EXISTS insurance_plan_name text,
ADD COLUMN IF NOT EXISTS insurance_member_id text,
ADD COLUMN IF NOT EXISTS insurance_group_number text;

-- Add comment for clarity
COMMENT ON COLUMN public.patients.insurance_type IS 'Primary insurance: bcbs, tricare, va, self_pay, other';
