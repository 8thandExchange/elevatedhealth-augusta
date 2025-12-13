-- Add Heavy Metals and Nutrients columns to lab_results
ALTER TABLE public.lab_results
ADD COLUMN IF NOT EXISTS mercury NUMERIC,
ADD COLUMN IF NOT EXISTS lead_level NUMERIC,
ADD COLUMN IF NOT EXISTS arsenic NUMERIC,
ADD COLUMN IF NOT EXISTS cadmium NUMERIC,
ADD COLUMN IF NOT EXISTS magnesium NUMERIC,
ADD COLUMN IF NOT EXISTS selenium NUMERIC,
ADD COLUMN IF NOT EXISTS zinc NUMERIC,
ADD COLUMN IF NOT EXISTS copper NUMERIC,
ADD COLUMN IF NOT EXISTS iodine NUMERIC;

-- Create toxicity_payments table
CREATE TABLE public.toxicity_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id),
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  amount_paid INTEGER,
  kit_status TEXT NOT NULL DEFAULT 'not_ordered',
  tracking_number TEXT,
  shipped_at TIMESTAMP WITH TIME ZONE,
  sample_received_at TIMESTAMP WITH TIME ZONE,
  results_ready_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create elevated_architecture_payments table for $999 bundle
CREATE TABLE public.elevated_architecture_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id),
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  amount_paid INTEGER,
  kit_status TEXT NOT NULL DEFAULT 'not_ordered',
  tracking_number TEXT,
  shipped_at TIMESTAMP WITH TIME ZONE,
  sample_received_at TIMESTAMP WITH TIME ZONE,
  results_ready_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.toxicity_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.elevated_architecture_payments ENABLE ROW LEVEL SECURITY;

-- RLS policies for toxicity_payments
CREATE POLICY "Anyone can create toxicity payment record" ON public.toxicity_payments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Patients can view their own toxicity payments" ON public.toxicity_payments
  FOR SELECT USING (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()));

CREATE POLICY "Staff and admins can manage toxicity payments" ON public.toxicity_payments
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

-- RLS policies for elevated_architecture_payments
CREATE POLICY "Anyone can create elevated architecture payment record" ON public.elevated_architecture_payments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Patients can view their own elevated architecture payments" ON public.elevated_architecture_payments
  FOR SELECT USING (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()));

CREATE POLICY "Staff and admins can manage elevated architecture payments" ON public.elevated_architecture_payments
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));