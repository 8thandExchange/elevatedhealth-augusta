-- CDS clinical safety corrections (idempotent re-apply for PT-141 consent + wolverine stack).
-- Does NOT set active=true or signed_off_by — prescriber activation only.
-- No live credential changes.

BEGIN;

-- PT-141 (Vyleesi class): FDA-approved; uses off-label disclosure, not Research Peptide Consent.
UPDATE public.cds_candidates
SET
  required_consent_types = ARRAY['off_label']::text[],
  updated_at = timezone('utc', now())
WHERE candidate_key = 'libido_pt141'
  AND required_consent_types IS DISTINCT FROM ARRAY['off_label']::text[];

-- BPC-157 + TB-500 stack: removed from FDA Category 2 (April 2026); gray zone, not lawfully compoundable today.
UPDATE public.cds_candidates
SET
  regulatory_status = 'GRAY_ZONE',
  clinical_rationale =
    'BPC-157 and TB-500 were removed from FDA Category 2 in April 2026. Both are gray-zone substances — not lawfully compoundable under current 503A enforcement posture. '
    || 'Clinic policy (.cursorrules) does not offer BPC-157; Pentadeca Arginate (PDA) is the preferred recovery alternative. '
    || 'This candidate row remains inactive until Dr. Akers and Dr. Williams explicitly authorize a pathway posture.',
  active = false,
  signed_off_by = NULL,
  signed_off_at = NULL,
  updated_at = timezone('utc', now())
WHERE candidate_key = 'recovery_wolverine_stack'
  AND (
    regulatory_status IS DISTINCT FROM 'GRAY_ZONE'
    OR clinical_rationale IS NULL
    OR clinical_rationale NOT ILIKE '%April 2026%'
  );

COMMIT;
