-- ============================================================================
-- RLS hardening pass — second wave
--
-- Applies remediations R-4, R-6, R-8, R-9, R-11 plus the unnumbered table
-- concerns from §2 of docs/security/rls-audit-2026-05-08.md.
--
-- Deliberately excluded from this migration:
--   R-5  — edge function auth posture (needs coordinated function changes)
--   R-10 — patient self-INSERT on orders (needs frontend audit first)
--   search_path hardening on existing SECURITY DEFINER functions
--   Anything that touches frontend behaviour
--
-- Pre-flight verification done at write time:
--   R-4  : submit-public-intake/index.ts:212 confirmed using supabaseAdmin
--          (service role client created at line 64). Drop is safe.
--   R-6  : consultation_bookings has NO patient_id FK column. customer_email
--          is the natural join key, matching the audit recommendation.
--   R-9  : grep of src/ for `.from("<payments_table>").insert(` returns
--          ZERO matches. All inserts to the five _payments tables happen
--          from edge functions which use service_role and bypass RLS.
--          Dropping the open public INSERT policies is non-breaking.
--   R-11 : the four broad-read policies all exist with the names referenced
--          here.
--   Unnumbered (inventory_skus): the 20260509221500 migration is the latest
--          touch on inventory_skus policies; this migration drops and
--          replaces the SELECT policy named there.
--
-- Rollback recipe at the bottom of the file (commented out).
-- ============================================================================


-- ============================================================================
-- R-4 — symptom_logs: drop the open INSERT policy
--
-- "Allow public symptom log insert via intake" was added to support the
-- public intake flow but the implementation always uses the service role
-- inside submit-public-intake (verified at index.ts:212). The policy is
-- a no-op for the legitimate path and an exploit for everyone else.
-- ============================================================================

DROP POLICY IF EXISTS "Allow public symptom log insert via intake"
  ON public.symptom_logs;


-- ============================================================================
-- R-6 — consultation_bookings: add patient self-view
--
-- Patients have no SELECT policy on consultation_bookings today, so the
-- patient portal cannot show "your upcoming consult" without going through
-- a staff-role API. Add a self-view keyed on customer_email matching the
-- patient's email (no patient_id FK exists on this table).
-- ============================================================================

CREATE POLICY "Patients can view their own consultation bookings"
  ON public.consultation_bookings
  FOR SELECT
  TO authenticated
  USING (
    customer_email IN (
      SELECT email FROM public.patients WHERE user_id = auth.uid()
    )
  );


-- ============================================================================
-- R-8 — split "Staff and admins can manage X" ALL policies into
-- SELECT / INSERT / UPDATE policies, leaving DELETE admin-only.
--
-- Tables affected: patients, clinical_notes, lab_results, medications,
-- treatment_plans, soap_notes, encounter_forms, superbills.
--
-- For tables without an existing admin-only DELETE policy, this migration
-- adds one. Without it, dropping the ALL policy would lock staff AND
-- admins out of DELETE, which is worse than the current state.
--
-- patients already has an explicit "Admins can delete patients" policy
-- (created in 20251203022732). The other tables' ALL policy was the only
-- DELETE permission, so we add explicit "Admins can delete X" for each.
-- ============================================================================

-- patients ------------------------------------------------------------------
DROP POLICY IF EXISTS "Staff and admins can manage patients"
  ON public.patients;

CREATE POLICY "Staff and admins can read all patients"
  ON public.patients
  FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'staff'::app_role)
  );

CREATE POLICY "Staff and admins can update patients"
  ON public.patients
  FOR UPDATE
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'staff'::app_role)
  )
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'staff'::app_role)
  );

CREATE POLICY "Staff and admins can insert patients"
  ON public.patients
  FOR INSERT
  TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'staff'::app_role)
  );
-- DELETE: existing "Admins can delete patients" policy remains the only
-- DELETE permission. Verified present in 20251203022732.


-- clinical_notes ------------------------------------------------------------
DROP POLICY IF EXISTS "Staff and admins can manage clinical notes"
  ON public.clinical_notes;

CREATE POLICY "Staff and admins can read clinical notes"
  ON public.clinical_notes
  FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'staff'::app_role)
  );

CREATE POLICY "Staff and admins can insert clinical notes"
  ON public.clinical_notes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'staff'::app_role)
  );

CREATE POLICY "Staff and admins can update clinical notes"
  ON public.clinical_notes
  FOR UPDATE
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'staff'::app_role)
  )
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'staff'::app_role)
  );

CREATE POLICY "Admins can delete clinical notes"
  ON public.clinical_notes
  FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));


-- lab_results ---------------------------------------------------------------
DROP POLICY IF EXISTS "Staff and admins can manage lab results"
  ON public.lab_results;

CREATE POLICY "Staff and admins can read lab results"
  ON public.lab_results
  FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'staff'::app_role)
  );

CREATE POLICY "Staff and admins can insert lab results"
  ON public.lab_results
  FOR INSERT
  TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'staff'::app_role)
  );

CREATE POLICY "Staff and admins can update lab results"
  ON public.lab_results
  FOR UPDATE
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'staff'::app_role)
  )
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'staff'::app_role)
  );

CREATE POLICY "Admins can delete lab results"
  ON public.lab_results
  FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));


-- medications ---------------------------------------------------------------
DROP POLICY IF EXISTS "Staff and admins can manage medications"
  ON public.medications;

CREATE POLICY "Staff and admins can read medications"
  ON public.medications
  FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'staff'::app_role)
  );

CREATE POLICY "Staff and admins can insert medications"
  ON public.medications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'staff'::app_role)
  );

CREATE POLICY "Staff and admins can update medications"
  ON public.medications
  FOR UPDATE
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'staff'::app_role)
  )
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'staff'::app_role)
  );

CREATE POLICY "Admins can delete medications"
  ON public.medications
  FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));


-- treatment_plans -----------------------------------------------------------
DROP POLICY IF EXISTS "Staff and admins can manage treatment plans"
  ON public.treatment_plans;

CREATE POLICY "Staff and admins can read treatment plans"
  ON public.treatment_plans
  FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'staff'::app_role)
  );

CREATE POLICY "Staff and admins can insert treatment plans"
  ON public.treatment_plans
  FOR INSERT
  TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'staff'::app_role)
  );

CREATE POLICY "Staff and admins can update treatment plans"
  ON public.treatment_plans
  FOR UPDATE
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'staff'::app_role)
  )
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'staff'::app_role)
  );

CREATE POLICY "Admins can delete treatment plans"
  ON public.treatment_plans
  FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));


-- soap_notes ----------------------------------------------------------------
DROP POLICY IF EXISTS "Staff and admins can manage SOAP notes"
  ON public.soap_notes;

CREATE POLICY "Staff and admins can read SOAP notes"
  ON public.soap_notes
  FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'staff'::app_role)
  );

CREATE POLICY "Staff and admins can insert SOAP notes"
  ON public.soap_notes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'staff'::app_role)
  );

CREATE POLICY "Staff and admins can update SOAP notes"
  ON public.soap_notes
  FOR UPDATE
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'staff'::app_role)
  )
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'staff'::app_role)
  );

CREATE POLICY "Admins can delete SOAP notes"
  ON public.soap_notes
  FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));


-- encounter_forms -----------------------------------------------------------
DROP POLICY IF EXISTS "Staff and admins can manage encounter forms"
  ON public.encounter_forms;

CREATE POLICY "Staff and admins can read encounter forms"
  ON public.encounter_forms
  FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'staff'::app_role)
  );

CREATE POLICY "Staff and admins can insert encounter forms"
  ON public.encounter_forms
  FOR INSERT
  TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'staff'::app_role)
  );

CREATE POLICY "Staff and admins can update encounter forms"
  ON public.encounter_forms
  FOR UPDATE
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'staff'::app_role)
  )
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'staff'::app_role)
  );

CREATE POLICY "Admins can delete encounter forms"
  ON public.encounter_forms
  FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));


-- superbills ----------------------------------------------------------------
DROP POLICY IF EXISTS "Staff and admins can manage superbills"
  ON public.superbills;

CREATE POLICY "Staff and admins can read superbills"
  ON public.superbills
  FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'staff'::app_role)
  );

CREATE POLICY "Staff and admins can insert superbills"
  ON public.superbills
  FOR INSERT
  TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'staff'::app_role)
  );

CREATE POLICY "Staff and admins can update superbills"
  ON public.superbills
  FOR UPDATE
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'staff'::app_role)
  )
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'staff'::app_role)
  );

CREATE POLICY "Admins can delete superbills"
  ON public.superbills
  FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));


-- ============================================================================
-- R-9 — drop open public INSERT policies on legacy _payments tables
--
-- Verified there are zero `.from("<table>").insert(` calls in src/ for any
-- of the five payment tables. All writes happen from edge functions
-- (create-*-checkout / verify-*-payment) which use the service role and
-- bypass RLS, so dropping these policies does not affect the live writers.
-- The patient self-view SELECT policies and staff/admin manage policies on
-- each table remain intact.
-- ============================================================================

DROP POLICY IF EXISTS "Anyone can create elevated architecture payment record"
  ON public.elevated_architecture_payments;

DROP POLICY IF EXISTS "Anyone can create payment record"
  ON public.hormone_mapping_payments;

DROP POLICY IF EXISTS "Anyone can create metabolic payment record"
  ON public.metabolic_payments;

DROP POLICY IF EXISTS "Anyone can create neurotransmitter payment record"
  ON public.neurotransmitter_payments;

DROP POLICY IF EXISTS "Anyone can create toxicity payment record"
  ON public.toxicity_payments;


-- ============================================================================
-- R-11 — tighten broad authenticated reads on internal-only tables
--
-- clinical_protocols, protocols, soap_templates, clinic_settings all let
-- ANY authenticated user (including patients) read every row. None of
-- these tables surface to the patient portal today. Restrict to staff/admin.
-- ============================================================================

DROP POLICY IF EXISTS "Authenticated can view active clinical protocols"
  ON public.clinical_protocols;

CREATE POLICY "Staff and admins can view clinical protocols"
  ON public.clinical_protocols
  FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'staff'::app_role)
  );

DROP POLICY IF EXISTS "Authenticated users can view protocols"
  ON public.protocols;

CREATE POLICY "Staff and admins can view protocols"
  ON public.protocols
  FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'staff'::app_role)
  );

DROP POLICY IF EXISTS "Authenticated users can view SOAP templates"
  ON public.soap_templates;

CREATE POLICY "Staff and admins can view SOAP templates"
  ON public.soap_templates
  FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'staff'::app_role)
  );

DROP POLICY IF EXISTS "Authenticated users can view clinic settings"
  ON public.clinic_settings;

CREATE POLICY "Staff and admins can view clinic settings"
  ON public.clinic_settings
  FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'staff'::app_role)
  );


-- ============================================================================
-- Unnumbered — inventory_skus: tighten read to staff/admin only
--
-- The current policy "Authenticated can read SKU catalog" lets any logged-in
-- user (including patients) read the SKU catalog including wholesale cost
-- and vendor data. The catalog is internal-only operational data; nothing
-- patient-facing reads it.
-- ============================================================================

DROP POLICY IF EXISTS "Authenticated can read SKU catalog"
  ON public.inventory_skus;

CREATE POLICY "Staff and admins can read SKU catalog"
  ON public.inventory_skus
  FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'staff'::app_role)
  );


-- ============================================================================
-- TODO (separate migration) — provider_schedules / schedule_blocks /
-- schedule_exceptions public-readability cleanup
--
-- Audit findings on schedule tables:
--   - provider_schedules: NO `notes` column. Has `provider_id`, `location`,
--     `service_lines`, day/time. Provider identity leaks via provider_id
--     when read anonymously by SlotPicker.
--   - schedule_blocks: HAS `reason` column (free text). Anyone can read
--     reasons like "Dr X surgery day" or "Caroline personal day" — that
--     leaks operational info.
--   - schedule_exceptions: HAS `reason` column. Currently no PUBLIC SELECT
--     policy (only ALL policies for staff/admin/own-provider), so this
--     table does not leak today.
--
-- We are NOT changing public read policies on these tables in this
-- migration. SlotPicker depends on them. The follow-up should be a
-- dedicated, public-readable view that exposes ONLY what SlotPicker needs:
--   - day, start_time, end_time, slot_minutes, service_lines
--   - an opaque provider_token (not the raw provider_id) when patient-side
--     provider choice matters
--   - count of available slots per day (computed)
--
-- Then drop the "Anyone can view active schedules" / "Anyone can view
-- schedule blocks" SELECT policies and route the booking surface through
-- the view. Tracked as audit finding follow-up; see
-- docs/security/rls-audit-2026-05-08.md §2 (provider_schedules,
-- schedule_blocks).
-- ============================================================================


-- ============================================================================
-- Rollback recipe (do not uncomment in this migration)
--
-- BEGIN;
--   -- Unnumbered: inventory_skus
--   DROP POLICY IF EXISTS "Staff and admins can read SKU catalog" ON public.inventory_skus;
--   CREATE POLICY "Authenticated can read SKU catalog"
--     ON public.inventory_skus FOR SELECT
--     USING (auth.uid() IS NOT NULL);
--
--   -- R-11
--   DROP POLICY IF EXISTS "Staff and admins can view clinic settings" ON public.clinic_settings;
--   CREATE POLICY "Authenticated users can view clinic settings"
--     ON public.clinic_settings FOR SELECT TO authenticated USING (true);
--
--   DROP POLICY IF EXISTS "Staff and admins can view SOAP templates" ON public.soap_templates;
--   CREATE POLICY "Authenticated users can view SOAP templates"
--     ON public.soap_templates FOR SELECT USING (true);
--
--   DROP POLICY IF EXISTS "Staff and admins can view protocols" ON public.protocols;
--   CREATE POLICY "Authenticated users can view protocols"
--     ON public.protocols FOR SELECT TO authenticated USING (true);
--
--   DROP POLICY IF EXISTS "Staff and admins can view clinical protocols" ON public.clinical_protocols;
--   CREATE POLICY "Authenticated can view active clinical protocols"
--     ON public.clinical_protocols FOR SELECT TO authenticated
--     USING (
--       is_active = true
--       OR has_role(auth.uid(), 'admin'::app_role)
--       OR has_role(auth.uid(), 'staff'::app_role)
--     );
--
--   -- R-9 (recreate the open INSERT policies)
--   CREATE POLICY "Anyone can create toxicity payment record"
--     ON public.toxicity_payments FOR INSERT WITH CHECK (true);
--   CREATE POLICY "Anyone can create neurotransmitter payment record"
--     ON public.neurotransmitter_payments FOR INSERT WITH CHECK (true);
--   CREATE POLICY "Anyone can create metabolic payment record"
--     ON public.metabolic_payments FOR INSERT WITH CHECK (true);
--   CREATE POLICY "Anyone can create payment record"
--     ON public.hormone_mapping_payments FOR INSERT WITH CHECK (true);
--   CREATE POLICY "Anyone can create elevated architecture payment record"
--     ON public.elevated_architecture_payments FOR INSERT WITH CHECK (true);
--
--   -- R-8 (drop the split policies, restore each ALL policy)
--   -- For each of patients, clinical_notes, lab_results, medications,
--   -- treatment_plans, soap_notes, encounter_forms, superbills:
--   --   DROP POLICY IF EXISTS "Staff and admins can read X" ON public.X;
--   --   DROP POLICY IF EXISTS "Staff and admins can insert X" ON public.X;
--   --   DROP POLICY IF EXISTS "Staff and admins can update X" ON public.X;
--   --   DROP POLICY IF EXISTS "Admins can delete X" ON public.X;  -- only on tables we added it to
--   --   CREATE POLICY "Staff and admins can manage X"
--   --     ON public.X FOR ALL
--   --     USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'staff'));
--
--   -- R-6
--   DROP POLICY IF EXISTS "Patients can view their own consultation bookings"
--     ON public.consultation_bookings;
--
--   -- R-4
--   CREATE POLICY "Allow public symptom log insert via intake"
--     ON public.symptom_logs FOR INSERT WITH CHECK (true);
-- COMMIT;
-- ============================================================================
