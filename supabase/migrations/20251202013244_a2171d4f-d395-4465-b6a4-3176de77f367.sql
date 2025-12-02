-- Create hormone_mapping_payments table to track payment and ZRT kit status
CREATE TABLE public.hormone_mapping_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id),
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  customer_email TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  zrt_kit_status TEXT NOT NULL DEFAULT 'not_ordered' CHECK (zrt_kit_status IN ('not_ordered', 'ready_to_ship', 'shipped', 'received')),
  kit_shipped_at TIMESTAMP WITH TIME ZONE,
  lab_review_scheduled_at TIMESTAMP WITH TIME ZONE,
  amount_paid INTEGER, -- in cents
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hormone_mapping_payments ENABLE ROW LEVEL SECURITY;

-- Policies: Staff/admin can manage all, patients can view their own
CREATE POLICY "Staff and admins can manage payments" 
ON public.hormone_mapping_payments 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

CREATE POLICY "Patients can view their own payments" 
ON public.hormone_mapping_payments 
FOR SELECT 
USING (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()));

-- Anyone can insert (for guest checkout)
CREATE POLICY "Anyone can create payment record" 
ON public.hormone_mapping_payments 
FOR INSERT 
WITH CHECK (true);

-- Trigger for updated_at
CREATE TRIGGER update_hormone_mapping_payments_updated_at
BEFORE UPDATE ON public.hormone_mapping_payments
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();