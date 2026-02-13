
-- ===========================================
-- Treatment Plans Table
-- ===========================================
CREATE TABLE public.treatment_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL,
  title TEXT NOT NULL,
  service_line TEXT NOT NULL DEFAULT 'hormone',
  status TEXT NOT NULL DEFAULT 'active',
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  target_end_date DATE,
  goals JSONB NOT NULL DEFAULT '[]'::jsonb,
  interventions JSONB NOT NULL DEFAULT '[]'::jsonb,
  progress_notes JSONB NOT NULL DEFAULT '[]'::jsonb,
  review_frequency TEXT DEFAULT 'monthly',
  last_reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.treatment_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff and admins can manage treatment plans"
  ON public.treatment_plans FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

CREATE POLICY "Patients can view their own treatment plans"
  ON public.treatment_plans FOR SELECT
  USING (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()));

CREATE TRIGGER update_treatment_plans_updated_at
  BEFORE UPDATE ON public.treatment_plans
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ===========================================
-- Medications Table
-- ===========================================
CREATE TABLE public.medications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  prescribed_by UUID,
  medication_name TEXT NOT NULL,
  generic_name TEXT,
  dosage TEXT NOT NULL,
  route TEXT NOT NULL DEFAULT 'topical',
  frequency TEXT NOT NULL DEFAULT 'daily',
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'active',
  pharmacy TEXT,
  refills_remaining INTEGER DEFAULT 0,
  last_refill_date DATE,
  next_refill_date DATE,
  side_effects TEXT,
  notes TEXT,
  is_prn BOOLEAN DEFAULT false,
  service_line TEXT DEFAULT 'hormone',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff and admins can manage medications"
  ON public.medications FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

CREATE POLICY "Patients can view their own medications"
  ON public.medications FOR SELECT
  USING (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()));

CREATE TRIGGER update_medications_updated_at
  BEFORE UPDATE ON public.medications
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ===========================================
-- Appointments Table
-- ===========================================
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  provider_id UUID,
  appointment_type TEXT NOT NULL DEFAULT 'follow_up',
  service_line TEXT NOT NULL DEFAULT 'hormone',
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'scheduled',
  check_in_at TIMESTAMPTZ,
  check_out_at TIMESTAMPTZ,
  reason TEXT,
  notes TEXT,
  room TEXT,
  is_telehealth BOOLEAN DEFAULT false,
  reminder_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff and admins can manage appointments"
  ON public.appointments FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

CREATE POLICY "Patients can view their own appointments"
  ON public.appointments FOR SELECT
  USING (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()));

CREATE POLICY "Patients can create their own appointments"
  ON public.appointments FOR INSERT
  WITH CHECK (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()));

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
