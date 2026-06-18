-- Reset "Elevated Test" patient(s) for end-to-end portal flow re-testing.
-- Preserves consultation_bookings with status=paid so $79 is not charged again.
-- Keeps patient row + auth user_id link intact.

BEGIN;

-- Target patients by display name (Elevated Test)
CREATE TEMP TABLE _reset_patients AS
SELECT id, email, user_id
FROM public.patients
WHERE full_name ILIKE 'Elevated Test'
  AND (is_archived IS NOT TRUE OR is_archived IS NULL);

-- Child tables (delete clinical / intake / consent artifacts)
DELETE FROM public.consent_acknowledgments WHERE patient_id IN (SELECT id FROM _reset_patients);
DELETE FROM public.consent_records WHERE patient_id IN (SELECT id FROM _reset_patients);
DELETE FROM public.consent_overrides WHERE patient_id IN (SELECT id FROM _reset_patients);
DELETE FROM public.consent_reconsent_requests WHERE patient_id IN (SELECT id FROM _reset_patients);
DELETE FROM public.substance_addition_acknowledgments WHERE patient_id IN (SELECT id FROM _reset_patients);
DELETE FROM public.symptom_logs WHERE patient_id IN (SELECT id FROM _reset_patients);
DELETE FROM public.intake_magic_links WHERE patient_id IN (SELECT id FROM _reset_patients);
DELETE FROM public.consult_prequal_sessions WHERE patient_id IN (SELECT id FROM _reset_patients);
DELETE FROM public.gfe_clearances WHERE patient_id IN (SELECT id FROM _reset_patients);
DELETE FROM public.appointments WHERE patient_id IN (SELECT id FROM _reset_patients);
DELETE FROM public.lab_orders WHERE patient_id IN (SELECT id FROM _reset_patients);
DELETE FROM public.lab_results WHERE patient_id IN (SELECT id FROM _reset_patients);
DELETE FROM public.orders WHERE patient_id IN (SELECT id FROM _reset_patients);
DELETE FROM public.iv_intake_responses WHERE patient_id IN (SELECT id FROM _reset_patients);
DELETE FROM public.eligibility_review_requests WHERE patient_id IN (SELECT id FROM _reset_patients);
DELETE FROM public.patient_encounters WHERE patient_id IN (SELECT id FROM _reset_patients);
DELETE FROM public.soap_notes WHERE patient_id IN (SELECT id FROM _reset_patients);
DELETE FROM public.treatment_plans WHERE patient_id IN (SELECT id FROM _reset_patients);
DELETE FROM public.medications WHERE patient_id IN (SELECT id FROM _reset_patients);
DELETE FROM public.clinical_notes WHERE patient_id IN (SELECT id FROM _reset_patients);
DELETE FROM public.cds_assessments WHERE patient_id IN (SELECT id FROM _reset_patients);
DELETE FROM public.patient_protocol_assignments WHERE patient_id IN (SELECT id FROM _reset_patients);
DELETE FROM public.patient_allergies WHERE patient_id IN (SELECT id FROM _reset_patients);
DELETE FROM public.patient_current_medications WHERE patient_id IN (SELECT id FROM _reset_patients);
DELETE FROM public.patient_problem_list WHERE patient_id IN (SELECT id FROM _reset_patients);
DELETE FROM public.patient_documents WHERE patient_id IN (SELECT id FROM _reset_patients);
DELETE FROM public.encounter_forms WHERE patient_id IN (SELECT id FROM _reset_patients);
DELETE FROM public.encounter_attachments WHERE patient_id IN (SELECT id FROM _reset_patients);
DELETE FROM public.superbills WHERE patient_id IN (SELECT id FROM _reset_patients);
DELETE FROM public.conversations WHERE patient_id IN (SELECT id FROM _reset_patients);

-- Reset patient profile to post-payment, pre-intake state
UPDATE public.patients p
SET
  onboarding_status = CASE
    WHEN EXISTS (
      SELECT 1 FROM public.consultation_bookings cb
      WHERE lower(trim(cb.customer_email)) = lower(trim(p.email))
        AND cb.status = 'paid'
    ) THEN 'consultation_paid'
    ELSE 'account_created'
  END,
  intake_completed = false,
  intake_consents_completed_at = null,
  dob = null,
  gender = null,
  street_address = null,
  city = null,
  state = null,
  zip_code = null,
  allergies = null,
  medical_history = null,
  safety_flags = null,
  risk_status = 'standard',
  treatment_request = null,
  consent_signature = null,
  consent_signature_date = null,
  consent_completed_at = null,
  consent_method = null,
  intake_token = null,
  intake_token_expires_at = null,
  updated_at = now()
WHERE p.id IN (SELECT id FROM _reset_patients);

-- Summary for operator
SELECT
  p.id,
  p.full_name,
  p.email,
  p.onboarding_status,
  p.intake_completed,
  p.dob,
  p.user_id IS NOT NULL AS portal_linked,
  (
    SELECT cb.status
    FROM public.consultation_bookings cb
    WHERE lower(trim(cb.customer_email)) = lower(trim(p.email))
      AND cb.status = 'paid'
    ORDER BY cb.created_at DESC
    LIMIT 1
  ) AS paid_consult_status
FROM public.patients p
WHERE p.id IN (SELECT id FROM _reset_patients);

COMMIT;
