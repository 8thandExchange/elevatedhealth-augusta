-- Discontinue blended BPC-157 / TB-500 recovery stack (pre-blended vial SKU).
--
-- Business decision (2026-06-26): offer BPC-157 and TB-500 as separate à la carte
-- fills ($249 each). The combined "Wolverine" / recovery stack is no longer sold.
-- Individual peptide rows remain active; blended offering rows are deactivated only.
--
-- Idempotent: re-running re-asserts inactive/discontinued state.

BEGIN;

-- Legacy clinic_formulary named stack (STACK-HEALING).
UPDATE public.clinic_formulary
SET is_active = false,
    internal_notes = COALESCE(internal_notes, '') ||
      CASE WHEN internal_notes IS NULL OR internal_notes = '' THEN '' ELSE E'\n' END ||
      'DISCONTINUED 2026-06-26 — blended BPC-157/TB-500 stack no longer offered. Prescribe BPC-157 and TB-500 as separate fills.',
    updated_at = timezone('utc', now())
WHERE item_code = 'STACK-HEALING';

-- Clinical optimization / staff catalog row.
UPDATE public.clinical_formulary_items
SET public_status = 'inactive',
    clinical_status = 'inactive',
    staff_notes = COALESCE(staff_notes, '') ||
      CASE WHEN staff_notes IS NULL OR staff_notes = '' THEN '' ELSE E'\n' END ||
      'DISCONTINUED 2026-06-26 — use individual bpc-157 and tb-500 rows.',
    updated_at = timezone('utc', now())
WHERE slug = 'bpc-157-tb-500-stack'
  AND (public_status IS DISTINCT FROM 'inactive' OR clinical_status IS DISTINCT FROM 'inactive');

-- CDS candidate — keep inactive; document discontinuation.
UPDATE public.cds_candidates
SET active = false,
    clinical_rationale =
      'DISCONTINUED 2026-06-26 — blended BPC-157/TB-500 stack no longer offered. '
      || 'Individual BPC-157 and TB-500 remain available under Research Peptide Consent and Recovery Peptide Review.',
    updated_at = timezone('utc', now())
WHERE candidate_key = 'recovery_wolverine_stack';

-- Clinical policy row — exclude from offered formulary.
UPDATE public.clinical_policy_items
SET eha_status = 'excluded',
    active = false,
    notes = COALESCE(notes, '') ||
      CASE WHEN notes IS NULL OR notes = '' THEN '' ELSE E'\n' END ||
      'DISCONTINUED 2026-06-26 — blended stack retired; individual BPC-157 and TB-500 remain offered.',
    updated_at = timezone('utc', now())
WHERE item_key = 'wolverine_stack'
  AND eha_status IS DISTINCT FROM 'excluded';

COMMIT;
