-- CDS clinical safety corrections (idempotent re-apply for PT-141 consent).
-- Wolverine stack policy is corrected in 20260618150000_recovery_peptide_policy_correction.sql.
-- Does NOT set active=true or signed_off_by — prescriber activation only.

BEGIN;

-- PT-141 (Vyleesi class): FDA-approved; uses off-label disclosure, not Research Peptide Consent.
UPDATE public.cds_candidates
SET
  required_consent_types = ARRAY['off_label']::text[],
  updated_at = timezone('utc', now())
WHERE candidate_key = 'libido_pt141'
  AND required_consent_types IS DISTINCT FROM ARRAY['off_label']::text[];

COMMIT;
