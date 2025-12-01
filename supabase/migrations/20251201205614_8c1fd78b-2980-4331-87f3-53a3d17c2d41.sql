-- Create patients table
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  dob DATE,
  safety_flags JSONB DEFAULT '[]'::jsonb,
  current_protocol TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create protocols table (reference data)
CREATE TABLE public.protocols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  primary_compound TEXT,
  dispenser_type TEXT,
  instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create symptom_logs table
CREATE TABLE public.symptom_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  date_logged TIMESTAMP WITH TIME ZONE DEFAULT now(),
  estrogen_score INTEGER DEFAULT 0,
  progesterone_score INTEGER DEFAULT 0,
  androgen_score INTEGER DEFAULT 0,
  cortisol_score INTEGER DEFAULT 0,
  raw_answers JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create order status enum
CREATE TYPE public.order_status AS ENUM ('pending_review', 'authorized', 'sent_to_pharmacy', 'completed');

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  status order_status DEFAULT 'pending_review',
  protocol_snapshot JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symptom_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Patients table policies
CREATE POLICY "Patients can view their own record"
ON public.patients FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Patients can update their own record"
ON public.patients FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Staff and admins can view all patients"
ON public.patients FOR SELECT
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));

CREATE POLICY "Staff and admins can manage patients"
ON public.patients FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));

-- Protocols table policies (public read, admin write)
CREATE POLICY "Anyone can view protocols"
ON public.protocols FOR SELECT
USING (true);

CREATE POLICY "Admins can manage protocols"
ON public.protocols FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Symptom logs policies
CREATE POLICY "Patients can view their own symptom logs"
ON public.symptom_logs FOR SELECT
USING (patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()));

CREATE POLICY "Patients can insert their own symptom logs"
ON public.symptom_logs FOR INSERT
WITH CHECK (patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()));

CREATE POLICY "Staff and admins can view all symptom logs"
ON public.symptom_logs FOR SELECT
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));

-- Orders policies
CREATE POLICY "Patients can view their own orders"
ON public.orders FOR SELECT
USING (patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()));

CREATE POLICY "Patients can create orders for themselves"
ON public.orders FOR INSERT
WITH CHECK (patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()));

CREATE POLICY "Staff and admins can view all orders"
ON public.orders FOR SELECT
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));

CREATE POLICY "Staff and admins can update orders"
ON public.orders FOR UPDATE
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));

-- Create updated_at triggers
CREATE TRIGGER update_patients_updated_at
BEFORE UPDATE ON public.patients
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insert default protocols
INSERT INTO public.protocols (name, primary_compound, dispenser_type, instructions) VALUES
('Protocol A: Menopause', 'Bi-Est 80/20', 'Pink Topiclick', 'Apply 2 clicks to inner thigh AM/PM'),
('Protocol B: Vitality', 'Testosterone', 'Blue Topiclick', 'Apply 2 clicks to clitoral area daily'),
('Protocol C: Balance', 'Progesterone', 'Cream', 'Apply 1/4 tsp to inner arms at bedtime'),
('Protocol D: Adrenal Support', 'DHEA + Pregnenolone', 'Capsule', 'Take 1 capsule each morning with food');