-- Recovery peptide + formulary policy correction (physician-authoritative).
-- BPC-157, TB-500, and Wolverine stack ARE offered under Research Peptide Consent.
-- PDA is an optional alternate, not the preferred recovery path.
-- Idempotent. Does not rotate credentials or set active=true on CDS rows.

BEGIN;

UPDATE public.cds_candidates
SET
  regulatory_status = 'COMPOUNDABLE_503A',
  required_consent_types = ARRAY['research_peptide']::text[],
  clinical_rationale =
    'Wolverine stack (BPC-157 daily + TB-500 weekly) is an active recovery offering under signed Research Peptide Consent and Recovery Peptide Review. '
    || 'Compounded via FCC under 503A patient-specific authority. April 2026 FDA Category 2 list changes are disclosed in consent. '
    || 'CDS row stays inactive until prescriber pathway sign-off. This is not a formulary exclusion.',
  active = false,
  signed_off_by = NULL,
  signed_off_at = NULL,
  updated_at = timezone('utc', now())
WHERE candidate_key = 'recovery_wolverine_stack'
  AND (
    regulatory_status IS DISTINCT FROM 'COMPOUNDABLE_503A'
    OR required_consent_types IS DISTINCT FROM ARRAY['research_peptide']::text[]
    OR clinical_rationale IS NULL
    OR clinical_rationale ILIKE '%PDA is the preferred%'
    OR clinical_rationale ILIKE '%does not offer BPC%'
    OR clinical_rationale ILIKE '%not lawfully compoundable%'
  );

UPDATE public.clinic_formulary
SET
  display_name = 'Healing Protocol (BPC-157 + TB-500 Wolverine Stack)',
  dose_strength = 'BPC-157 daily + TB-500 weekly per signed recovery protocol',
  dose_notes = 'Primary recovery stack. PDA is an optional alternate when physician selects oral route.',
  updated_at = timezone('utc', now())
WHERE item_code = 'STACK-HEALING'
  AND (
    dose_notes ILIKE '%BPC-157 not compounded%'
    OR display_name ILIKE '%PDA + TB-500%'
  );

COMMIT;
