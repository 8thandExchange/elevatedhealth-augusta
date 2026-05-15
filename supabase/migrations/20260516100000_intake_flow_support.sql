-- Tier 1 intake flow: staff override audit trail + consent_records signing metadata.

-- ---------------------------------------------------------------------------
-- consent_overrides (Position 2 staff verbal consent audit)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.consent_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consent_record_id uuid NOT NULL REFERENCES public.consent_records(id) ON DELETE RESTRICT,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE RESTRICT,
  override_reason text NOT NULL,
  override_reason_category text NOT NULL,
  staff_member_user_id uuid NOT NULL,
  witness_staff_user_id uuid,
  patient_identity_verification_method text NOT NULL,
  staff_attestation text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_consent_overrides_patient
  ON public.consent_overrides(patient_id);

CREATE INDEX IF NOT EXISTS idx_consent_overrides_staff
  ON public.consent_overrides(staff_member_user_id);

CREATE INDEX IF NOT EXISTS idx_consent_overrides_created
  ON public.consent_overrides(created_at);

COMMENT ON COLUMN public.consent_overrides.override_reason_category IS
  'Category: visual_impairment, motor_impairment, cognitive_impairment, language_barrier, technical_failure, other';

COMMENT ON COLUMN public.consent_overrides.patient_identity_verification_method IS
  'How identity was verified: photo_id, dob_verbal_match, family_member_attestation, other';

COMMENT ON COLUMN public.consent_overrides.staff_attestation IS
  'Free-text attestation by staff describing the override circumstances';

ALTER TABLE public.consent_overrides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "consent_overrides_staff_read" ON public.consent_overrides;
CREATE POLICY "consent_overrides_staff_read" ON public.consent_overrides
  FOR SELECT TO authenticated USING (
    public.has_role(auth.uid(), 'admin'::public.app_role) OR
    public.has_role(auth.uid(), 'staff'::public.app_role) OR
    public.has_role(auth.uid(), 'provider'::public.app_role) OR
    public.has_business_admin_role(auth.uid())
  );

DROP POLICY IF EXISTS "consent_overrides_staff_insert" ON public.consent_overrides;
CREATE POLICY "consent_overrides_staff_insert" ON public.consent_overrides
  FOR INSERT TO authenticated WITH CHECK (
    public.has_role(auth.uid(), 'admin'::public.app_role) OR
    public.has_role(auth.uid(), 'staff'::public.app_role) OR
    public.has_role(auth.uid(), 'provider'::public.app_role) OR
    public.has_business_admin_role(auth.uid())
  );

-- ---------------------------------------------------------------------------
-- consent_records extensions
-- ---------------------------------------------------------------------------

ALTER TABLE public.consent_records
  ADD COLUMN IF NOT EXISTS signing_method text NOT NULL DEFAULT 'patient_typed_name';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'consent_records_signing_method_check'
      AND conrelid = 'public.consent_records'::regclass
  ) THEN
    ALTER TABLE public.consent_records
      ADD CONSTRAINT consent_records_signing_method_check
      CHECK (signing_method IN (
        'patient_typed_name',
        'staff_verbal_documented',
        'patient_typed_name_in_clinic'
      ));
  END IF;
END $$;

COMMENT ON COLUMN public.consent_records.signing_method IS
  'patient_typed_name: standard self-signed; staff_verbal_documented: staff override (Position 2); patient_typed_name_in_clinic: patient self-signed with staff present (Decision 7 / Option 7B)';

ALTER TABLE public.consent_records
  ADD COLUMN IF NOT EXISTS staff_witness_user_id uuid;

COMMENT ON COLUMN public.consent_records.staff_witness_user_id IS
  'For in-clinic signing: staff member present when patient signed';

-- ---------------------------------------------------------------------------
-- patients: Tier 1 bundle completion timestamp
-- ---------------------------------------------------------------------------

ALTER TABLE public.patients
  ADD COLUMN IF NOT EXISTS intake_consents_completed_at timestamptz;

COMMENT ON COLUMN public.patients.intake_consents_completed_at IS
  'When patient completed all 5 Tier 1 consents in the intake bundle';
