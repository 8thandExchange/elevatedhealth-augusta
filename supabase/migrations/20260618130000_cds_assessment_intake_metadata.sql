-- CDS intake-sourced assessment drafts: metadata column + nullable created_by for patient intake.
BEGIN;

ALTER TABLE public.cds_assessments
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'staff',
  ADD COLUMN IF NOT EXISTS intake_metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.cds_assessments
  DROP CONSTRAINT IF EXISTS cds_assessments_source_check;

ALTER TABLE public.cds_assessments
  ADD CONSTRAINT cds_assessments_source_check
  CHECK (source IN ('staff', 'intake'));

ALTER TABLE public.cds_assessments
  DROP CONSTRAINT IF EXISTS cds_assessments_intake_created_by_check;

ALTER TABLE public.cds_assessments
  ALTER COLUMN created_by DROP NOT NULL;

ALTER TABLE public.cds_assessments
  ADD CONSTRAINT cds_assessments_intake_created_by_check
  CHECK (
    (source = 'staff' AND created_by IS NOT NULL)
    OR (source = 'intake' AND created_by IS NULL)
  );

COMMENT ON COLUMN public.cds_assessments.intake_metadata IS
  'Pre-filled intake tags: contraindications, lab needs, hard stops, IV screening flags. Staff confirms in CDS panel.';

-- Staff may read/update intake-sourced drafts (created_by IS NULL).
DROP POLICY IF EXISTS "cds_assessments_staff_select_intake_drafts" ON public.cds_assessments;
CREATE POLICY "cds_assessments_staff_select_intake_drafts"
  ON public.cds_assessments
  FOR SELECT
  TO authenticated
  USING (
    public.is_clinic_staff(auth.uid())
    AND source = 'intake'
  );

DROP POLICY IF EXISTS "cds_assessments_staff_update_intake_drafts" ON public.cds_assessments;
CREATE POLICY "cds_assessments_staff_update_intake_drafts"
  ON public.cds_assessments
  FOR UPDATE
  TO authenticated
  USING (
    public.is_clinic_staff(auth.uid())
    AND source = 'intake'
    AND status = 'draft'
  )
  WITH CHECK (
    public.is_clinic_staff(auth.uid())
    AND source = 'intake'
    AND status IN ('draft', 'awaiting_provider', 'awaiting_labs')
  );

COMMIT;
