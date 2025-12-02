-- Fix symptom_logs RLS policies to be PERMISSIVE
DROP POLICY IF EXISTS "Patients can view their own symptom logs" ON public.symptom_logs;
DROP POLICY IF EXISTS "Staff and admins can view all symptom logs" ON public.symptom_logs;
DROP POLICY IF EXISTS "Patients can insert their own symptom logs" ON public.symptom_logs;

CREATE POLICY "Patients can view their own symptom logs" 
ON public.symptom_logs 
FOR SELECT 
USING (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()));

CREATE POLICY "Staff and admins can view all symptom logs" 
ON public.symptom_logs 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

CREATE POLICY "Patients can insert their own symptom logs" 
ON public.symptom_logs 
FOR INSERT 
WITH CHECK (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()));

-- Fix orders RLS policies to be PERMISSIVE
DROP POLICY IF EXISTS "Patients can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Staff and admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Staff and admins can update orders" ON public.orders;
DROP POLICY IF EXISTS "Patients can create orders for themselves" ON public.orders;

CREATE POLICY "Patients can view their own orders" 
ON public.orders 
FOR SELECT 
USING (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()));

CREATE POLICY "Staff and admins can view all orders" 
ON public.orders 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

CREATE POLICY "Staff and admins can update orders" 
ON public.orders 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

CREATE POLICY "Patients can create orders for themselves" 
ON public.orders 
FOR INSERT 
WITH CHECK (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()));