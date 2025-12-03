-- Create neurotransmitter_payments table for tracking neurotransmitter kit orders
CREATE TABLE public.neurotransmitter_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id),
  customer_email TEXT NOT NULL,
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

-- Enable RLS
ALTER TABLE public.neurotransmitter_payments ENABLE ROW LEVEL SECURITY;

-- Patients can view their own payments
CREATE POLICY "Patients can view their own neurotransmitter payments"
ON public.neurotransmitter_payments
FOR SELECT
USING (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()));

-- Anyone can create payment record (for checkout flow)
CREATE POLICY "Anyone can create neurotransmitter payment record"
ON public.neurotransmitter_payments
FOR INSERT
WITH CHECK (true);

-- Staff and admins can manage all payments
CREATE POLICY "Staff and admins can manage neurotransmitter payments"
ON public.neurotransmitter_payments
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_neurotransmitter_payments_updated_at
BEFORE UPDATE ON public.neurotransmitter_payments
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Add index for faster lookups
CREATE INDEX idx_neurotransmitter_payments_patient_id ON public.neurotransmitter_payments(patient_id);
CREATE INDEX idx_neurotransmitter_payments_kit_status ON public.neurotransmitter_payments(kit_status);