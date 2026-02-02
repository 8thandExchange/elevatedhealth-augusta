-- Create encounter_forms table for internal billing tracking
CREATE TABLE public.encounter_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id),
  service_type TEXT NOT NULL,
  insurance_type TEXT,
  cpt_codes JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_charges NUMERIC,
  payment_amount NUMERIC,
  payment_method TEXT,
  check_number TEXT,
  follow_up_date DATE,
  provider_id UUID,
  provider_name TEXT,
  date_of_service DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  sent_to_office_manager_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.encounter_forms ENABLE ROW LEVEL SECURITY;

-- Staff and admins can manage encounter forms
CREATE POLICY "Staff and admins can manage encounter forms"
ON public.encounter_forms
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

-- Patients can view their own encounter forms
CREATE POLICY "Patients can view their own encounter forms"
ON public.encounter_forms
FOR SELECT
USING (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()));

-- Insert missing CPT codes for IV Ketamine
INSERT INTO public.cpt_codes (code, description, panel_group, default_charge) VALUES
('96365', 'IV Infusion - 1st hour', 'iv_ketamine', 200),
('96366', 'IV Infusion - 2nd hour monitoring', 'iv_ketamine', 100),
('96360', 'IV Hydration - initial 30min-1hr', 'iv_ketamine', 75),
('96361', 'IV Hydration - past initial hour', 'iv_ketamine', 50),
('J3490', 'Ketamine Medication', 'iv_ketamine', 150)
ON CONFLICT (code) DO NOTHING;

-- Insert missing CPT codes for Spravato
INSERT INTO public.cpt_codes (code, description, panel_group, default_charge) VALUES
('99205', 'Office Visit - Comprehensive/High (New Patient)', 'spravato', 300),
('99215', 'Office Visit - Comprehensive/High (Established)', 'spravato', 200),
('G2212', 'Prolonged Service - 15 min beyond 1hr', 'spravato', 75),
('G2082', 'Spravato 56mg', 'spravato', 850),
('G2083', 'Spravato 84mg', 'spravato', 1200)
ON CONFLICT (code) DO NOTHING;

-- Insert missing CPT codes for Supplies/Medications
INSERT INTO public.cpt_codes (code, description, panel_group, default_charge) VALUES
('J2405', 'Zofran (Ondansetron) x 4', 'supplies', 40),
('J7120', 'LR 1000ml (no dextrose)', 'supplies', 25),
('A4222', 'Infusion Supplies', 'supplies', 35),
('A4215', 'Sterile Needle for IV', 'supplies', 10)
ON CONFLICT (code) DO NOTHING;

-- Insert missing CPT codes for Urine Drug Screens
INSERT INTO public.cpt_codes (code, description, panel_group, default_charge) VALUES
('80305', 'UDS 10 Panel (In Office)', 'drug_screen', 50),
('G0434', 'UDS 10 Panel (Medicare)', 'drug_screen', 50),
('84703', 'HCG Urine Test', 'drug_screen', 25)
ON CONFLICT (code) DO NOTHING;