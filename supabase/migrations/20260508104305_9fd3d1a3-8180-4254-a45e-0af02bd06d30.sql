-- Phase 2: Membership architecture cleanup
-- Single Elevated Membership ($199/mo). Add new columns; deprecate old tier columns.

ALTER TABLE public.patients
  ADD COLUMN IF NOT EXISTS elevated_membership_status text
    CHECK (elevated_membership_status IS NULL OR elevated_membership_status IN ('active','paused','cancelled')),
  ADD COLUMN IF NOT EXISTS elevated_membership_started_at timestamptz,
  ADD COLUMN IF NOT EXISTS elevated_membership_paused_until date;

-- stripe_subscription_id column already exists; do not re-add.

-- Backfill from legacy tier columns (no-op on empty data, safe on populated)
UPDATE public.patients
SET elevated_membership_status = 'active',
    elevated_membership_started_at = COALESCE(care_membership_started_at, now())
WHERE elevated_membership_status IS NULL
  AND (membership_tier IS NOT NULL OR care_membership_tier IS NOT NULL);

-- Deprecation comments on the old columns
COMMENT ON COLUMN public.patients.care_membership_tier IS
  'DEPRECATED 2026-05-08: superseded by elevated_membership_status. Do not read or write. Preserved for historical audit only.';
COMMENT ON COLUMN public.patients.membership_tier IS
  'DEPRECATED 2026-05-08: superseded by elevated_membership_status. Do not read or write. Preserved for historical audit only.';
COMMENT ON COLUMN public.patients.care_membership_started_at IS
  'DEPRECATED 2026-05-08: superseded by elevated_membership_started_at.';
COMMENT ON COLUMN public.patients.care_membership_status IS
  'DEPRECATED 2026-05-08: superseded by elevated_membership_status.';

CREATE INDEX IF NOT EXISTS idx_patients_elevated_membership_status
  ON public.patients(elevated_membership_status)
  WHERE elevated_membership_status IS NOT NULL;