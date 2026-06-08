-- Lab workflow glue + patient protocol assignment records.

BEGIN;

ALTER TABLE public.lab_results
  ADD COLUMN IF NOT EXISTS lab_order_id uuid REFERENCES public.lab_orders(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_lab_results_lab_order ON public.lab_results(lab_order_id);

COMMENT ON COLUMN public.lab_results.lab_order_id IS
  'Optional link to the lab_orders row that prompted this draw.';

CREATE TABLE IF NOT EXISTS public.patient_protocol_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  protocol_id uuid NOT NULL REFERENCES public.clinical_protocols(id) ON DELETE RESTRICT,
  protocol_version_id uuid NOT NULL REFERENCES public.clinical_protocol_versions(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'approved' CHECK (
    status IN ('proposed', 'approved', 'active', 'superseded', 'cancelled')
  ),
  approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_patient_protocol_assignments_patient
  ON public.patient_protocol_assignments(patient_id, created_at DESC);

DROP TRIGGER IF EXISTS trg_patient_protocol_assignments_updated_at ON public.patient_protocol_assignments;
CREATE TRIGGER trg_patient_protocol_assignments_updated_at
  BEFORE UPDATE ON public.patient_protocol_assignments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.patient_protocol_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff and admins manage protocol assignments" ON public.patient_protocol_assignments;
CREATE POLICY "Staff and admins manage protocol assignments"
  ON public.patient_protocol_assignments FOR ALL
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'staff'::public.app_role)
    OR public.has_role(auth.uid(), 'provider'::public.app_role)
    OR public.has_business_admin_role(auth.uid())
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'staff'::public.app_role)
    OR public.has_role(auth.uid(), 'provider'::public.app_role)
    OR public.has_business_admin_role(auth.uid())
  );

-- Catalog → requisition template mapping
UPDATE public.lab_panels SET labcorp_requisition_key = 'safety_cmp'
  WHERE slug IN ('foundation-wellness', 'weight-optimization', 'sexual-wellness')
    AND (labcorp_requisition_key IS NULL OR labcorp_requisition_key = '');

UPDATE public.lab_panels SET labcorp_requisition_key = 'thyroid'
  WHERE slug = 'hormone-female'
    AND (labcorp_requisition_key IS NULL OR labcorp_requisition_key = '');

COMMIT;
