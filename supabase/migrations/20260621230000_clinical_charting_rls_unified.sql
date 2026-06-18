-- Align legacy charting tables with patient_encounters / encounter_vitals RLS.
-- Provider Dashboard users with provider or business_admin roles were blocked on
-- treatment_plans, medications, clinical_notes, lab_results, and soap_templates
-- even though they can open the chart UI.

BEGIN;

CREATE OR REPLACE FUNCTION public.has_clinical_staff_access(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.has_role(_user_id, 'admin'::public.app_role)
    OR public.has_role(_user_id, 'staff'::public.app_role)
    OR public.has_role(_user_id, 'provider'::public.app_role)
    OR public.has_business_admin_role(_user_id);
$$;

COMMENT ON FUNCTION public.has_clinical_staff_access(uuid) IS
  'Charting access: admin, staff, provider, or business_admin.';

-- ---------------------------------------------------------------------------
-- treatment_plans
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Staff and admins can read treatment plans" ON public.treatment_plans;
DROP POLICY IF EXISTS "Staff and admins can insert treatment plans" ON public.treatment_plans;
DROP POLICY IF EXISTS "Staff and admins can update treatment plans" ON public.treatment_plans;
DROP POLICY IF EXISTS "Clinical staff can read treatment plans" ON public.treatment_plans;
DROP POLICY IF EXISTS "Clinical staff can insert treatment plans" ON public.treatment_plans;
DROP POLICY IF EXISTS "Clinical staff can update treatment plans" ON public.treatment_plans;

CREATE POLICY "Clinical staff can read treatment plans"
  ON public.treatment_plans
  FOR SELECT
  TO authenticated
  USING (public.has_clinical_staff_access(auth.uid()));

CREATE POLICY "Clinical staff can insert treatment plans"
  ON public.treatment_plans
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_clinical_staff_access(auth.uid()));

CREATE POLICY "Clinical staff can update treatment plans"
  ON public.treatment_plans
  FOR UPDATE
  TO authenticated
  USING (public.has_clinical_staff_access(auth.uid()))
  WITH CHECK (public.has_clinical_staff_access(auth.uid()));

-- ---------------------------------------------------------------------------
-- medications
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Staff and admins can read medications" ON public.medications;
DROP POLICY IF EXISTS "Staff and admins can insert medications" ON public.medications;
DROP POLICY IF EXISTS "Staff and admins can update medications" ON public.medications;
DROP POLICY IF EXISTS "Clinical staff can read medications" ON public.medications;
DROP POLICY IF EXISTS "Clinical staff can insert medications" ON public.medications;
DROP POLICY IF EXISTS "Clinical staff can update medications" ON public.medications;

CREATE POLICY "Clinical staff can read medications"
  ON public.medications
  FOR SELECT
  TO authenticated
  USING (public.has_clinical_staff_access(auth.uid()));

CREATE POLICY "Clinical staff can insert medications"
  ON public.medications
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_clinical_staff_access(auth.uid()));

CREATE POLICY "Clinical staff can update medications"
  ON public.medications
  FOR UPDATE
  TO authenticated
  USING (public.has_clinical_staff_access(auth.uid()))
  WITH CHECK (public.has_clinical_staff_access(auth.uid()));

-- ---------------------------------------------------------------------------
-- clinical_notes
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Staff and admins can read clinical notes" ON public.clinical_notes;
DROP POLICY IF EXISTS "Staff and admins can insert clinical notes" ON public.clinical_notes;
DROP POLICY IF EXISTS "Staff and admins can update clinical notes" ON public.clinical_notes;
DROP POLICY IF EXISTS "Clinical staff can read clinical notes" ON public.clinical_notes;
DROP POLICY IF EXISTS "Clinical staff can insert clinical notes" ON public.clinical_notes;
DROP POLICY IF EXISTS "Clinical staff can update clinical notes" ON public.clinical_notes;

CREATE POLICY "Clinical staff can read clinical notes"
  ON public.clinical_notes
  FOR SELECT
  TO authenticated
  USING (public.has_clinical_staff_access(auth.uid()));

CREATE POLICY "Clinical staff can insert clinical notes"
  ON public.clinical_notes
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_clinical_staff_access(auth.uid()));

CREATE POLICY "Clinical staff can update clinical notes"
  ON public.clinical_notes
  FOR UPDATE
  TO authenticated
  USING (public.has_clinical_staff_access(auth.uid()))
  WITH CHECK (public.has_clinical_staff_access(auth.uid()));

-- ---------------------------------------------------------------------------
-- lab_results (full chart access; treated-only provider policy remains extra path)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Staff and admins can read lab results" ON public.lab_results;
DROP POLICY IF EXISTS "Staff and admins can insert lab results" ON public.lab_results;
DROP POLICY IF EXISTS "Staff and admins can update lab results" ON public.lab_results;
DROP POLICY IF EXISTS "Clinical staff can read lab results" ON public.lab_results;
DROP POLICY IF EXISTS "Clinical staff can insert lab results" ON public.lab_results;
DROP POLICY IF EXISTS "Clinical staff can update lab results" ON public.lab_results;

CREATE POLICY "Clinical staff can read lab results"
  ON public.lab_results
  FOR SELECT
  TO authenticated
  USING (public.has_clinical_staff_access(auth.uid()));

CREATE POLICY "Clinical staff can insert lab results"
  ON public.lab_results
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_clinical_staff_access(auth.uid()));

CREATE POLICY "Clinical staff can update lab results"
  ON public.lab_results
  FOR UPDATE
  TO authenticated
  USING (public.has_clinical_staff_access(auth.uid()))
  WITH CHECK (public.has_clinical_staff_access(auth.uid()));

-- ---------------------------------------------------------------------------
-- soap_notes (idempotent refresh via shared helper)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "soap_notes_provider_select_own_treated" ON public.soap_notes;
DROP POLICY IF EXISTS "soap_notes_provider_insert_own_treated" ON public.soap_notes;
DROP POLICY IF EXISTS "soap_notes_provider_update_own_treated" ON public.soap_notes;
DROP POLICY IF EXISTS "Staff and admins can read SOAP notes" ON public.soap_notes;
DROP POLICY IF EXISTS "Staff and admins can insert SOAP notes" ON public.soap_notes;
DROP POLICY IF EXISTS "Staff and admins can update SOAP notes" ON public.soap_notes;
DROP POLICY IF EXISTS "Clinical staff can read SOAP notes" ON public.soap_notes;
DROP POLICY IF EXISTS "Clinical staff can insert SOAP notes" ON public.soap_notes;
DROP POLICY IF EXISTS "Clinical staff can update SOAP notes" ON public.soap_notes;

CREATE POLICY "Clinical staff can read SOAP notes"
  ON public.soap_notes
  FOR SELECT
  TO authenticated
  USING (public.has_clinical_staff_access(auth.uid()));

CREATE POLICY "Clinical staff can insert SOAP notes"
  ON public.soap_notes
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_clinical_staff_access(auth.uid()));

CREATE POLICY "Clinical staff can update SOAP notes"
  ON public.soap_notes
  FOR UPDATE
  TO authenticated
  USING (public.has_clinical_staff_access(auth.uid()))
  WITH CHECK (public.has_clinical_staff_access(auth.uid()));

-- ---------------------------------------------------------------------------
-- soap_templates (read for all clinical staff; write stays admin/staff)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Staff and admins can manage SOAP templates" ON public.soap_templates;
DROP POLICY IF EXISTS "Staff and admins can view SOAP templates" ON public.soap_templates;
DROP POLICY IF EXISTS "Authenticated users can view SOAP templates" ON public.soap_templates;
DROP POLICY IF EXISTS "Clinical staff can view SOAP templates" ON public.soap_templates;
DROP POLICY IF EXISTS "Staff and admins can insert SOAP templates" ON public.soap_templates;
DROP POLICY IF EXISTS "Staff and admins can update SOAP templates" ON public.soap_templates;

CREATE POLICY "Clinical staff can view SOAP templates"
  ON public.soap_templates
  FOR SELECT
  TO authenticated
  USING (public.has_clinical_staff_access(auth.uid()));

CREATE POLICY "Staff and admins can insert SOAP templates"
  ON public.soap_templates
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'staff'::public.app_role)
  );

CREATE POLICY "Staff and admins can update SOAP templates"
  ON public.soap_templates
  FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'staff'::public.app_role)
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'staff'::public.app_role)
  );

-- ---------------------------------------------------------------------------
-- encounter_forms (legacy PDF forms)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Staff and admins can read encounter forms" ON public.encounter_forms;
DROP POLICY IF EXISTS "Staff and admins can insert encounter forms" ON public.encounter_forms;
DROP POLICY IF EXISTS "Staff and admins can update encounter forms" ON public.encounter_forms;
DROP POLICY IF EXISTS "Clinical staff can read encounter forms" ON public.encounter_forms;
DROP POLICY IF EXISTS "Clinical staff can insert encounter forms" ON public.encounter_forms;
DROP POLICY IF EXISTS "Clinical staff can update encounter forms" ON public.encounter_forms;

CREATE POLICY "Clinical staff can read encounter forms"
  ON public.encounter_forms
  FOR SELECT
  TO authenticated
  USING (public.has_clinical_staff_access(auth.uid()));

CREATE POLICY "Clinical staff can insert encounter forms"
  ON public.encounter_forms
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_clinical_staff_access(auth.uid()));

CREATE POLICY "Clinical staff can update encounter forms"
  ON public.encounter_forms
  FOR UPDATE
  TO authenticated
  USING (public.has_clinical_staff_access(auth.uid()))
  WITH CHECK (public.has_clinical_staff_access(auth.uid()));

COMMIT;
