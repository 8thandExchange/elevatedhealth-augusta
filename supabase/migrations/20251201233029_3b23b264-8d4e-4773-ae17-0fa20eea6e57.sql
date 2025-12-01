-- Create lab_results table for storing ZRT lab values
CREATE TABLE public.lab_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  collection_date DATE NOT NULL,
  estradiol_e2 DECIMAL(10,2),  -- pg/mL, range 0-10
  progesterone_pg DECIMAL(10,2),  -- pg/mL, range 0-500
  testosterone_t DECIMAL(10,2),  -- ng/dL, range 0-60
  cortisol_morning DECIMAL(10,2),  -- Morning cortisol value
  notes TEXT,
  correlation_alert TEXT,  -- Auto-generated correlation with symptoms
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.lab_results ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Staff and admins can manage lab results"
ON public.lab_results
FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));

CREATE POLICY "Patients can view their own lab results"
ON public.lab_results
FOR SELECT
USING (patient_id IN (
  SELECT id FROM patients WHERE user_id = auth.uid()
));

-- Index for fast patient lookups
CREATE INDEX idx_lab_results_patient_id ON public.lab_results(patient_id);
CREATE INDEX idx_lab_results_collection_date ON public.lab_results(collection_date DESC);