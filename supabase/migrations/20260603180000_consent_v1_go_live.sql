-- Go-live: mark seeded v1 consent catalog rows as legally approved for patient intake.
-- Application code only serves rows where is_active AND legal_review_status = 'approved'.
-- Future draft versions must stay pending_review with is_active = false until counsel signs off.

UPDATE public.consent_versions
SET
  legal_review_status = 'approved',
  legal_review_notes = COALESCE(
    NULLIF(TRIM(legal_review_notes), ''),
    'Clinic go-live 2026-06-03: v1 catalog approved for patient intake and prescribing workflows.'
  ),
  updated_at = now()
WHERE version_label IN ('2026-05-14-v1', '2026-05-15-v1')
  AND (legal_review_status IS NULL OR legal_review_status = 'pending_review');

COMMENT ON COLUMN public.consent_versions.legal_review_status IS
  'Patient-servable only when approved. Intake/Rx UI filters is_active=true AND legal_review_status=approved.';
