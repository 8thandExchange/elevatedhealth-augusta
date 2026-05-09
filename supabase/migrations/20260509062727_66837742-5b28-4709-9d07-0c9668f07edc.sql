-- ============================================================================
-- eligibility_review_requests (verbatim from 20260510020000)
-- ============================================================================

CREATE TYPE public.eligibility_review_status AS ENUM (
  'pending',
  'contacted',
  'scheduled',
  'declined',
  'referred_out'
);

CREATE TYPE public.callback_window AS ENUM (
  'morning',
  'afternoon',
  'evening',
  'no_preference'
);

CREATE TABLE public.eligibility_review_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES public.patients(id) ON DELETE SET NULL,
  patient_name text NOT NULL,
  patient_email text,
  preferred_phone text NOT NULL,
  preferred_callback_window public.callback_window NOT NULL DEFAULT 'no_preference',
  intake_id uuid,
  flag_reasons jsonb NOT NULL DEFAULT '[]'::jsonb,
  treatment_type text,
  status public.eligibility_review_status NOT NULL DEFAULT 'pending',
  reviewed_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  notes text,
  resolved_booking_id uuid REFERENCES public.consultation_bookings(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_eligibility_review_status
  ON public.eligibility_review_requests(status, created_at DESC);
CREATE INDEX idx_eligibility_review_patient
  ON public.eligibility_review_requests(patient_id)
  WHERE patient_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_eligibility_review_requests_touch
  ON public.eligibility_review_requests;
CREATE TRIGGER trg_eligibility_review_requests_touch
  BEFORE UPDATE ON public.eligibility_review_requests
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE public.eligibility_review_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY eligibility_review_select_staff
  ON public.eligibility_review_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role IN ('admin', 'staff')
    )
  );

CREATE POLICY eligibility_review_update_staff
  ON public.eligibility_review_requests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role IN ('admin', 'staff')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role IN ('admin', 'staff')
    )
  );

COMMENT ON TABLE public.eligibility_review_requests IS
  'Queue of patients who tripped the SafetyGate during intake. Resolves into one of: scheduled (consult booked), declined (medically inappropriate), referred_out (better served elsewhere), contacted (under discussion).';
COMMENT ON COLUMN public.eligibility_review_requests.flag_reasons IS
  'JSON array of flag identifiers from the safety screen, e.g. ["pregnancy","heart_condition","blood_pressure"]. Treat as PHI.';
COMMENT ON COLUMN public.eligibility_review_requests.resolved_booking_id IS
  'When status=scheduled, the consultation_bookings row created by the admin queue Schedule Consult action.';