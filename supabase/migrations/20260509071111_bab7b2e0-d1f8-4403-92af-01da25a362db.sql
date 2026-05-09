-- ============================================================================
-- RLS hardening pass — second wave (R-4, R-6, R-8, R-9, R-11 + inventory_skus)
-- ============================================================================

-- R-4
DROP POLICY IF EXISTS "Allow public symptom log insert via intake" ON public.symptom_logs;

-- R-6
CREATE POLICY "Patients can view their own consultation bookings"
  ON public.consultation_bookings FOR SELECT TO authenticated
  USING (customer_email IN (SELECT email FROM public.patients WHERE user_id = auth.uid()));

-- R-8 patients
DROP POLICY IF EXISTS "Staff and admins can manage patients" ON public.patients;
CREATE POLICY "Staff and admins can read all patients" ON public.patients FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'staff'::app_role));
CREATE POLICY "Staff and admins can update patients" ON public.patients FOR UPDATE TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'staff'::app_role))
  WITH CHECK (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'staff'::app_role));
CREATE POLICY "Staff and admins can insert patients" ON public.patients FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'staff'::app_role));

-- R-8 clinical_notes
DROP POLICY IF EXISTS "Staff and admins can manage clinical notes" ON public.clinical_notes;
CREATE POLICY "Staff and admins can read clinical notes" ON public.clinical_notes FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'staff'::app_role));
CREATE POLICY "Staff and admins can insert clinical notes" ON public.clinical_notes FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'staff'::app_role));
CREATE POLICY "Staff and admins can update clinical notes" ON public.clinical_notes FOR UPDATE TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'staff'::app_role))
  WITH CHECK (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'staff'::app_role));
CREATE POLICY "Admins can delete clinical notes" ON public.clinical_notes FOR DELETE TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role));

-- R-8 lab_results
DROP POLICY IF EXISTS "Staff and admins can manage lab results" ON public.lab_results;
CREATE POLICY "Staff and admins can read lab results" ON public.lab_results FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'staff'::app_role));
CREATE POLICY "Staff and admins can insert lab results" ON public.lab_results FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'staff'::app_role));
CREATE POLICY "Staff and admins can update lab results" ON public.lab_results FOR UPDATE TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'staff'::app_role))
  WITH CHECK (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'staff'::app_role));
CREATE POLICY "Admins can delete lab results" ON public.lab_results FOR DELETE TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role));

-- R-8 medications
DROP POLICY IF EXISTS "Staff and admins can manage medications" ON public.medications;
CREATE POLICY "Staff and admins can read medications" ON public.medications FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'staff'::app_role));
CREATE POLICY "Staff and admins can insert medications" ON public.medications FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'staff'::app_role));
CREATE POLICY "Staff and admins can update medications" ON public.medications FOR UPDATE TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'staff'::app_role))
  WITH CHECK (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'staff'::app_role));
CREATE POLICY "Admins can delete medications" ON public.medications FOR DELETE TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role));

-- R-8 treatment_plans
DROP POLICY IF EXISTS "Staff and admins can manage treatment plans" ON public.treatment_plans;
CREATE POLICY "Staff and admins can read treatment plans" ON public.treatment_plans FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'staff'::app_role));
CREATE POLICY "Staff and admins can insert treatment plans" ON public.treatment_plans FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'staff'::app_role));
CREATE POLICY "Staff and admins can update treatment plans" ON public.treatment_plans FOR UPDATE TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'staff'::app_role))
  WITH CHECK (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'staff'::app_role));
CREATE POLICY "Admins can delete treatment plans" ON public.treatment_plans FOR DELETE TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role));

-- R-8 soap_notes
DROP POLICY IF EXISTS "Staff and admins can manage SOAP notes" ON public.soap_notes;
CREATE POLICY "Staff and admins can read SOAP notes" ON public.soap_notes FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'staff'::app_role));
CREATE POLICY "Staff and admins can insert SOAP notes" ON public.soap_notes FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'staff'::app_role));
CREATE POLICY "Staff and admins can update SOAP notes" ON public.soap_notes FOR UPDATE TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'staff'::app_role))
  WITH CHECK (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'staff'::app_role));
CREATE POLICY "Admins can delete SOAP notes" ON public.soap_notes FOR DELETE TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role));

-- R-8 encounter_forms
DROP POLICY IF EXISTS "Staff and admins can manage encounter forms" ON public.encounter_forms;
CREATE POLICY "Staff and admins can read encounter forms" ON public.encounter_forms FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'staff'::app_role));
CREATE POLICY "Staff and admins can insert encounter forms" ON public.encounter_forms FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'staff'::app_role));
CREATE POLICY "Staff and admins can update encounter forms" ON public.encounter_forms FOR UPDATE TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'staff'::app_role))
  WITH CHECK (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'staff'::app_role));
CREATE POLICY "Admins can delete encounter forms" ON public.encounter_forms FOR DELETE TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role));

-- R-8 superbills
DROP POLICY IF EXISTS "Staff and admins can manage superbills" ON public.superbills;
CREATE POLICY "Staff and admins can read superbills" ON public.superbills FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'staff'::app_role));
CREATE POLICY "Staff and admins can insert superbills" ON public.superbills FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'staff'::app_role));
CREATE POLICY "Staff and admins can update superbills" ON public.superbills FOR UPDATE TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'staff'::app_role))
  WITH CHECK (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'staff'::app_role));
CREATE POLICY "Admins can delete superbills" ON public.superbills FOR DELETE TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role));

-- R-9 — drop open public INSERT policies on legacy _payments tables
DROP POLICY IF EXISTS "Anyone can create elevated architecture payment record" ON public.elevated_architecture_payments;
DROP POLICY IF EXISTS "Anyone can create payment record" ON public.hormone_mapping_payments;
DROP POLICY IF EXISTS "Anyone can create metabolic payment record" ON public.metabolic_payments;
DROP POLICY IF EXISTS "Anyone can create neurotransmitter payment record" ON public.neurotransmitter_payments;
DROP POLICY IF EXISTS "Anyone can create toxicity payment record" ON public.toxicity_payments;

-- R-11 — tighten broad authenticated reads
DROP POLICY IF EXISTS "Authenticated can view active clinical protocols" ON public.clinical_protocols;
CREATE POLICY "Staff and admins can view clinical protocols" ON public.clinical_protocols FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'staff'::app_role));

DROP POLICY IF EXISTS "Authenticated users can view protocols" ON public.protocols;
CREATE POLICY "Staff and admins can view protocols" ON public.protocols FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'staff'::app_role));

DROP POLICY IF EXISTS "Authenticated users can view SOAP templates" ON public.soap_templates;
CREATE POLICY "Staff and admins can view SOAP templates" ON public.soap_templates FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'staff'::app_role));

DROP POLICY IF EXISTS "Authenticated users can view clinic settings" ON public.clinic_settings;
CREATE POLICY "Staff and admins can view clinic settings" ON public.clinic_settings FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'staff'::app_role));

-- inventory_skus
DROP POLICY IF EXISTS "Authenticated can read SKU catalog" ON public.inventory_skus;
CREATE POLICY "Staff and admins can read SKU catalog" ON public.inventory_skus FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'staff'::app_role));