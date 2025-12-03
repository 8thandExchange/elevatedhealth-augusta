-- Create CPT Codes table
CREATE TABLE public.cpt_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  description text NOT NULL,
  panel_group text,
  default_charge numeric(10,2),
  quantity integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cpt_codes ENABLE ROW LEVEL SECURITY;

-- Anyone can view CPT codes
CREATE POLICY "Anyone can view CPT codes" ON public.cpt_codes
  FOR SELECT USING (true);

-- Only admins can manage CPT codes
CREATE POLICY "Admins can manage CPT codes" ON public.cpt_codes
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert ZRT Saliva Profile III codes
INSERT INTO public.cpt_codes (code, description, panel_group, default_charge, quantity) VALUES
  ('82670', 'Estradiol', 'saliva_profile_iii', 0, 1),
  ('84144', 'Progesterone', 'saliva_profile_iii', 0, 1),
  ('84402', 'Testosterone', 'saliva_profile_iii', 0, 1),
  ('82627', 'DHEA-S', 'saliva_profile_iii', 0, 1),
  ('82530', 'Cortisol', 'saliva_profile_iii', 0, 4);

-- Insert ZRT Weight Management Profile additional codes
INSERT INTO public.cpt_codes (code, description, panel_group, default_charge, quantity) VALUES
  ('84443', 'TSH (Thyroid Stimulating Hormone)', 'weight_management', 0, 1),
  ('83525', 'Insulin', 'weight_management', 0, 1),
  ('83036', 'HbA1c (Hemoglobin A1c)', 'weight_management', 0, 1),
  ('82306', 'Vitamin D', 'weight_management', 0, 1);

-- Insert Ketamine/Consult codes
INSERT INTO public.cpt_codes (code, description, panel_group, default_charge, quantity) VALUES
  ('99204', 'New Patient Visit (45 min)', 'consult', 250, 1),
  ('99214', 'Established Visit (30 min)', 'consult', 175, 1),
  ('99354', 'Prolonged Service', 'consult', 125, 1);

-- Insert Neurotransmitter codes
INSERT INTO public.cpt_codes (code, description, panel_group, default_charge, quantity) VALUES
  ('82384', 'Catecholamines - Dopamine', 'neurotransmitter', 0, 1),
  ('84260', 'Serotonin', 'neurotransmitter', 0, 1),
  ('82542', 'GABA', 'neurotransmitter', 0, 1);

-- Create ICD-10 Diagnosis Codes table
CREATE TABLE public.icd10_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  description text NOT NULL,
  category text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.icd10_codes ENABLE ROW LEVEL SECURITY;

-- Anyone can view ICD-10 codes
CREATE POLICY "Anyone can view ICD10 codes" ON public.icd10_codes
  FOR SELECT USING (true);

-- Only admins can manage ICD-10 codes
CREATE POLICY "Admins can manage ICD10 codes" ON public.icd10_codes
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert common ICD-10 codes
INSERT INTO public.icd10_codes (code, description, category) VALUES
  ('E29.1', 'Testicular Hypofunction', 'hormone'),
  ('E28.2', 'Polycystic Ovarian Syndrome (PCOS)', 'hormone'),
  ('E28.9', 'Ovarian Dysfunction, Unspecified', 'hormone'),
  ('E34.9', 'Endocrine Disorder, Unspecified', 'hormone'),
  ('E66.9', 'Obesity, Unspecified', 'metabolic'),
  ('R53.83', 'Fatigue', 'general'),
  ('R63.5', 'Abnormal Weight Gain', 'metabolic'),
  ('F32.9', 'Major Depressive Disorder (Single Episode)', 'mental_health'),
  ('F41.9', 'Anxiety Disorder, Unspecified', 'mental_health'),
  ('G47.00', 'Insomnia', 'general'),
  ('N95.1', 'Menopausal and Female Climacteric States', 'hormone');

-- Create Superbills table
CREATE TABLE public.superbills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  date_of_service date NOT NULL,
  diagnosis_codes text[] NOT NULL,
  cpt_codes jsonb NOT NULL,
  total_charge numeric(10,2) NOT NULL,
  notes text,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.superbills ENABLE ROW LEVEL SECURITY;

-- Staff and admins can manage superbills
CREATE POLICY "Staff and admins can manage superbills" ON public.superbills
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

-- Patients can view their own superbills
CREATE POLICY "Patients can view their own superbills" ON public.superbills
  FOR SELECT USING (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

-- Create Clinic Settings table
CREATE TABLE public.clinic_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text NOT NULL,
  description text,
  updated_at timestamp with time zone DEFAULT now(),
  updated_by uuid
);

-- Enable RLS
ALTER TABLE public.clinic_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can view settings
CREATE POLICY "Anyone can view clinic settings" ON public.clinic_settings
  FOR SELECT USING (true);

-- Only admins can manage settings
CREATE POLICY "Admins can manage clinic settings" ON public.clinic_settings
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default clinic settings
INSERT INTO public.clinic_settings (key, value, description) VALUES
  ('clinic_legal_name', 'Wilkers Group LLC', 'Legal business name'),
  ('clinic_tax_id', '99-0830253', 'Employer Identification Number (EIN)'),
  ('provider_npi', '1578971552', 'Lauren Bursey NPI Number'),
  ('clinic_address', '3654 Wheeler Road, Suite 103, Augusta, GA 30909', 'Clinic address'),
  ('clinic_phone', '(706) 250-9855', 'Clinic phone number');