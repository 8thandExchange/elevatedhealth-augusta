-- Create consultation_bookings table for tracking $99 consultations
CREATE TABLE public.consultation_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  amount_paid INTEGER DEFAULT 99,
  status TEXT NOT NULL DEFAULT 'pending',
  booked_for TIMESTAMP WITH TIME ZONE,
  credit_code TEXT UNIQUE,
  credit_used_at TIMESTAMP WITH TIME ZONE,
  follow_up_date DATE,
  notes TEXT,
  service_type TEXT DEFAULT 'hormone',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add mapping_completed flag to patients table
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS mapping_completed BOOLEAN DEFAULT false;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS consultation_booking_id UUID REFERENCES public.consultation_bookings(id);

-- Enable RLS
ALTER TABLE public.consultation_bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for consultation_bookings
CREATE POLICY "Anyone can create consultation booking"
  ON public.consultation_bookings
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Staff and admins can view all bookings"
  ON public.consultation_bookings
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

CREATE POLICY "Staff and admins can update bookings"
  ON public.consultation_bookings
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

-- Create index for credit code lookups
CREATE INDEX idx_consultation_bookings_credit_code ON public.consultation_bookings(credit_code);
CREATE INDEX idx_consultation_bookings_status ON public.consultation_bookings(status);
CREATE INDEX idx_consultation_bookings_email ON public.consultation_bookings(customer_email);

-- Add trigger for updated_at
CREATE TRIGGER update_consultation_bookings_updated_at
  BEFORE UPDATE ON public.consultation_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();