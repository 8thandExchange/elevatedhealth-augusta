-- Remote Good Faith Exam (Qualiphy) + in-clinic GFE clearance tracking.
-- Staff sends Qualiphy link manually after $79 consult is paid; valid clearance suppresses prompts for 12 months.

CREATE TYPE public.gfe_clearance_status AS ENUM (
  'pending',
  'approved',
  'rejected',
  'deferred',
  'missed',
  'na',
  'cancelled'
);

CREATE TYPE public.gfe_clearance_source AS ENUM ('qualiphy', 'in_clinic');

CREATE TYPE public.gfe_service_category AS ENUM (
  'general',
  'iv_therapy',
  'hormone',
  'weight_loss',
  'peptide'
);

CREATE TABLE public.gfe_clearances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  service_category public.gfe_service_category NOT NULL DEFAULT 'general',
  clearance_source public.gfe_clearance_source NOT NULL DEFAULT 'qualiphy',
  status public.gfe_clearance_status NOT NULL DEFAULT 'pending',
  qualiphy_patient_exam_id text,
  qualiphy_meeting_uuid text,
  qualiphy_exam_id integer,
  meeting_url text,
  exam_name text,
  provider_name text,
  approved_at timestamptz,
  expires_at timestamptz,
  pdf_storage_path text,
  sent_at timestamptz,
  sent_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  consultation_booking_id uuid REFERENCES public.consultation_bookings(id) ON DELETE SET NULL,
  notes text,
  webhook_payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_gfe_clearances_patient_id ON public.gfe_clearances(patient_id);
CREATE INDEX idx_gfe_clearances_patient_status ON public.gfe_clearances(patient_id, status);
CREATE INDEX idx_gfe_clearances_expires_at ON public.gfe_clearances(expires_at)
  WHERE status = 'approved';

CREATE TABLE public.qualiphy_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key text NOT NULL UNIQUE,
  event_type integer,
  patient_exam_id text,
  payload jsonb NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_qualiphy_webhook_events_patient_exam
  ON public.qualiphy_webhook_events(patient_exam_id);

COMMENT ON TABLE public.gfe_clearances IS
  'Good Faith Exam clearance — Qualiphy remote or in-clinic MD/NP. Approved rows include expires_at (typically +12 months).';

ALTER TABLE public.gfe_clearances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qualiphy_webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read gfe clearances"
  ON public.gfe_clearances
  FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'staff'::public.app_role)
    OR public.has_role(auth.uid(), 'provider'::public.app_role)
    OR public.has_business_admin_role(auth.uid())
  );

-- Webhook audit: staff read only; writes via service role edge functions.
CREATE POLICY "Staff can read qualiphy webhook events"
  ON public.qualiphy_webhook_events
  FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'staff'::public.app_role)
    OR public.has_role(auth.uid(), 'provider'::public.app_role)
    OR public.has_business_admin_role(auth.uid())
  );

CREATE TRIGGER update_gfe_clearances_updated_at
  BEFORE UPDATE ON public.gfe_clearances
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
