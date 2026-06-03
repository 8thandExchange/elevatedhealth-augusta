-- ============================================================================
-- Lab orders: track LabCorp panel orders per patient (ops workflow).
-- Links to lab_panels.slug; optional requisition_key for send-labcorp-requisition.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.lab_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  panel_slug text NOT NULL,
  requisition_key text CHECK (
    requisition_key IS NULL OR requisition_key IN ('mens_safety', 'thyroid', 'safety_cmp')
  ),
  status text NOT NULL DEFAULT 'ordered' CHECK (
    status IN (
      'ordered',
      'requisition_sent',
      'awaiting_draw',
      'sample_collected',
      'results_pending',
      'results_received',
      'reviewed',
      'cancelled'
    )
  ),
  clinical_reason text,
  document_url text,
  ordered_at timestamptz NOT NULL DEFAULT now(),
  ordered_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lab_orders_patient ON public.lab_orders(patient_id, ordered_at DESC);
CREATE INDEX IF NOT EXISTS idx_lab_orders_status ON public.lab_orders(status, ordered_at DESC);

DROP TRIGGER IF EXISTS trg_lab_orders_updated_at ON public.lab_orders;
CREATE TRIGGER trg_lab_orders_updated_at
  BEFORE UPDATE ON public.lab_orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

COMMENT ON TABLE public.lab_orders IS
  'Operational LabCorp order tracking. panel_slug references lab_panels.slug.';

-- Map catalog panels to edge-function requisition templates where applicable
ALTER TABLE public.lab_panels
  ADD COLUMN IF NOT EXISTS labcorp_requisition_key text CHECK (
    labcorp_requisition_key IS NULL OR labcorp_requisition_key IN ('mens_safety', 'thyroid', 'safety_cmp')
  );

UPDATE public.lab_panels SET labcorp_requisition_key = 'mens_safety' WHERE slug = 'hormone-male' AND labcorp_requisition_key IS NULL;

COMMENT ON COLUMN public.lab_panels.labcorp_requisition_key IS
  'When set, send-labcorp-requisition can use this template for the panel.';

ALTER TABLE public.lab_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff and admins read lab orders" ON public.lab_orders;
CREATE POLICY "Staff and admins read lab orders"
  ON public.lab_orders FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'staff'::app_role)
    OR public.has_role(auth.uid(), 'business_admin'::app_role)
    OR public.has_role(auth.uid(), 'provider'::app_role)
  );

DROP POLICY IF EXISTS "Staff and admins manage lab orders" ON public.lab_orders;
CREATE POLICY "Staff and admins manage lab orders"
  ON public.lab_orders FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'staff'::app_role)
    OR public.has_role(auth.uid(), 'business_admin'::app_role)
    OR public.has_role(auth.uid(), 'provider'::app_role)
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'staff'::app_role)
    OR public.has_role(auth.uid(), 'business_admin'::app_role)
    OR public.has_role(auth.uid(), 'provider'::app_role)
  );
