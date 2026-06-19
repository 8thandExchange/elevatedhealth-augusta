-- Go-live: activate the staged consent v2 versions and retire v1.
-- Physician + legal sign-off: Troy Akers, DO and legal counsel, 2026-06-19.
--   glp1 v2            — adds Section 11A (retatrutide investigational disclosure:
--                        not FDA-approved, not 503A/503B compoundable per FDA, gated).
--   research_peptide v2 — removes the retatrutide carve-out.
-- App serves only rows where is_active = true AND legal_review_status = 'approved'.

-- 1) Retire the active v1 rows first (avoids any single-active collision).
UPDATE public.consent_versions
SET is_active = false,
    effective_to = now(),
    updated_at = now()
WHERE consent_type IN ('glp1', 'research_peptide')
  AND version_label = '2026-05-15-v1'
  AND is_active = true;

-- 2) Approve + activate v2. The enforce_approved_before_active trigger requires
--    legal_review_status = 'approved' whenever is_active = true, so set both together.
UPDATE public.consent_versions
SET legal_review_status = 'approved',
    is_active = true,
    effective_from = now(),
    legal_review_notes = COALESCE(
      NULLIF(TRIM(legal_review_notes), ''),
      'Go-live 2026-06-19: approved by Troy Akers, DO and legal counsel. GLP-1 v2 adds retatrutide investigational Section 11A; research_peptide v2 removes the retatrutide carve-out.'
    ),
    updated_at = now()
WHERE consent_type IN ('glp1', 'research_peptide')
  AND version_label = '2026-06-19-v2'
  AND legal_review_status = 'pending_review';
