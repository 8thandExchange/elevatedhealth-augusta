-- CDS Task 9 / Priority 3: lab panel operational billing metadata for order workflow

ALTER TABLE public.lab_panels
  ADD COLUMN IF NOT EXISTS included_in_program boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS initial_paid_at_intake boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS validity_days integer NOT NULL DEFAULT 90
    CHECK (validity_days > 0);

COMMENT ON COLUMN public.lab_panels.included_in_program IS
  'When true, enrolled program members receive this panel at $0 on quarterly monitoring.';
COMMENT ON COLUMN public.lab_panels.initial_paid_at_intake IS
  'When true, baseline draw at intake bills patient via Stripe comprehensive/expanded SKU.';
COMMENT ON COLUMN public.lab_panels.validity_days IS
  'Staff reference: how long resulted panel is considered current for therapy decisions.';

-- Sexual wellness remains launch-hidden; still paid if ordered ad hoc
UPDATE public.lab_panels SET included_in_program = false WHERE slug = 'sexual-wellness';
