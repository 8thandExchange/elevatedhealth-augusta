-- Add membership tier tracking to patients table
ALTER TABLE public.patients 
ADD COLUMN membership_tier text DEFAULT NULL;

-- Add membership renewal date tracking
ALTER TABLE public.patients 
ADD COLUMN membership_renewal_date date DEFAULT NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.patients.membership_tier IS 'Active membership tier: vitality, concierge, or null for no membership';
COMMENT ON COLUMN public.patients.membership_renewal_date IS 'Next billing date for the membership';