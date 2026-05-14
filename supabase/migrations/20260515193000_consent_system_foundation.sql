-- Consent system foundation (schema + storage).
-- RLS uses patients.user_id = auth.uid() for self-access (patients.id is NOT auth.uid()).
-- Privileged roles: has_role(admin|staff|provider) OR has_business_admin_role (matches clinic dashboards).

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.consent_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consent_type text NOT NULL,
  version_label text NOT NULL,
  title text NOT NULL,
  body_markdown text NOT NULL,
  body_hash text NOT NULL,
  effective_from timestamptz NOT NULL,
  effective_to timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  legal_review_status text DEFAULT 'pending_review',
  legal_review_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT consent_versions_type_version_unique UNIQUE (consent_type, version_label)
);

CREATE INDEX IF NOT EXISTS idx_consent_versions_type_active
  ON public.consent_versions(consent_type, is_active)
  WHERE is_active = true;

COMMENT ON COLUMN public.consent_versions.consent_type IS
  'Type of consent: terms_of_service, hipaa_acknowledgment, general_medical_treatment, telehealth, communication, hormone_therapy, glp1, off_label, research_peptide, notice_of_privacy_practices';
COMMENT ON COLUMN public.consent_versions.body_hash IS
  'SHA-256 hash of body_markdown for tamper detection';
COMMENT ON COLUMN public.consent_versions.legal_review_status IS
  'Tracks legal review state: pending_review, reviewed_approved, reviewed_with_changes, etc.';

CREATE TABLE IF NOT EXISTS public.consent_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE RESTRICT,
  consent_version_id uuid NOT NULL REFERENCES public.consent_versions(id) ON DELETE RESTRICT,
  consent_type text NOT NULL,
  document_text_hash text NOT NULL,
  signed_at timestamptz NOT NULL DEFAULT now(),
  signed_typed_name text NOT NULL,
  signed_ip text NOT NULL,
  signed_user_agent text NOT NULL,
  signed_session_id text,
  section_attestations jsonb,
  pdf_storage_path text,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  superseded_by_consent_id uuid REFERENCES public.consent_records(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_consent_records_patient_active
  ON public.consent_records(patient_id, consent_type)
  WHERE revoked_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_consent_records_expiring
  ON public.consent_records(expires_at)
  WHERE revoked_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_consent_records_session
  ON public.consent_records(signed_session_id)
  WHERE signed_session_id IS NOT NULL;

COMMENT ON COLUMN public.consent_records.section_attestations IS
  'JSONB object of per-section attestations e.g. {"section_2": true, "section_3": true}';
COMMENT ON COLUMN public.consent_records.signed_session_id IS
  'Groups consents signed in same session, e.g. all Tier 1 consents at account creation';
COMMENT ON COLUMN public.consent_records.expires_at IS
  'Default 12 months from signed_at; triggers re-consent workflow';

CREATE TABLE IF NOT EXISTS public.consent_acknowledgments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE RESTRICT,
  parent_consent_record_id uuid NOT NULL REFERENCES public.consent_records(id) ON DELETE RESTRICT,
  acknowledgment_type text NOT NULL,
  substance_added text,
  acknowledgment_text text NOT NULL,
  acknowledged_at timestamptz NOT NULL DEFAULT now(),
  acknowledged_ip text NOT NULL,
  acknowledged_user_agent text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_consent_acknowledgments_patient
  ON public.consent_acknowledgments(patient_id, acknowledgment_type);

COMMENT ON COLUMN public.consent_acknowledgments.acknowledgment_type IS
  'Type: substance_addition, protocol_amendment, version_change_minor, etc.';
COMMENT ON COLUMN public.consent_acknowledgments.substance_added IS
  'For substance_addition type: the new substance name added to formulary';

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------

DROP TRIGGER IF EXISTS consent_versions_updated_at ON public.consent_versions;
CREATE TRIGGER consent_versions_updated_at
  BEFORE UPDATE ON public.consent_versions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS consent_records_updated_at ON public.consent_records;
CREATE TRIGGER consent_records_updated_at
  BEFORE UPDATE ON public.consent_records
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE public.consent_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_acknowledgments ENABLE ROW LEVEL SECURITY;

-- consent_versions: all signed-in users may read active catalog; privileged users manage rows
DROP POLICY IF EXISTS "consent_versions_read" ON public.consent_versions;
CREATE POLICY "consent_versions_read"
  ON public.consent_versions
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "consent_versions_privileged_write" ON public.consent_versions;
CREATE POLICY "consent_versions_privileged_write"
  ON public.consent_versions
  FOR ALL
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'staff'::public.app_role)
    OR public.has_role(auth.uid(), 'provider'::public.app_role)
    OR public.has_business_admin_role(auth.uid())
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'staff'::public.app_role)
    OR public.has_role(auth.uid(), 'provider'::public.app_role)
    OR public.has_business_admin_role(auth.uid())
  );

-- consent_records: own patient row OR privileged staff
DROP POLICY IF EXISTS "consent_records_select" ON public.consent_records;
CREATE POLICY "consent_records_select"
  ON public.consent_records
  FOR SELECT
  TO authenticated
  USING (
    patient_id IN (SELECT p.id FROM public.patients p WHERE p.user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'staff'::public.app_role)
    OR public.has_role(auth.uid(), 'provider'::public.app_role)
    OR public.has_business_admin_role(auth.uid())
  );

DROP POLICY IF EXISTS "consent_records_insert" ON public.consent_records;
CREATE POLICY "consent_records_insert"
  ON public.consent_records
  FOR INSERT
  TO authenticated
  WITH CHECK (
    patient_id IN (SELECT p.id FROM public.patients p WHERE p.user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'staff'::public.app_role)
    OR public.has_role(auth.uid(), 'provider'::public.app_role)
    OR public.has_business_admin_role(auth.uid())
  );

DROP POLICY IF EXISTS "consent_records_update" ON public.consent_records;
CREATE POLICY "consent_records_update"
  ON public.consent_records
  FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'staff'::public.app_role)
    OR public.has_role(auth.uid(), 'provider'::public.app_role)
    OR public.has_business_admin_role(auth.uid())
  );

-- consent_acknowledgments
DROP POLICY IF EXISTS "consent_acknowledgments_select" ON public.consent_acknowledgments;
CREATE POLICY "consent_acknowledgments_select"
  ON public.consent_acknowledgments
  FOR SELECT
  TO authenticated
  USING (
    patient_id IN (SELECT p.id FROM public.patients p WHERE p.user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'staff'::public.app_role)
    OR public.has_role(auth.uid(), 'provider'::public.app_role)
    OR public.has_business_admin_role(auth.uid())
  );

DROP POLICY IF EXISTS "consent_acknowledgments_insert" ON public.consent_acknowledgments;
CREATE POLICY "consent_acknowledgments_insert"
  ON public.consent_acknowledgments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    patient_id IN (SELECT p.id FROM public.patients p WHERE p.user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'staff'::public.app_role)
    OR public.has_role(auth.uid(), 'provider'::public.app_role)
    OR public.has_business_admin_role(auth.uid())
  );

-- ---------------------------------------------------------------------------
-- Storage: signed consent PDFs
-- Convention (first path segment = patient_id UUID):
--   {patient_id}/{consent_type}-{version_label}-{timestamp}.pdf
-- ---------------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public)
VALUES ('signed-consents', 'signed-consents', false)
ON CONFLICT (id) DO NOTHING;

UPDATE storage.buckets
SET
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['application/pdf']::text[]
WHERE id = 'signed-consents';

DROP POLICY IF EXISTS "signed_consents_own_read" ON storage.objects;
DROP POLICY IF EXISTS "signed_consents_insert" ON storage.objects;

CREATE POLICY "signed_consents_own_read"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'signed-consents'
    AND (
      split_part(name, '/', 1)::uuid IN (
        SELECT p.id FROM public.patients p WHERE p.user_id = auth.uid()
      )
      OR public.has_role(auth.uid(), 'admin'::public.app_role)
      OR public.has_role(auth.uid(), 'staff'::public.app_role)
      OR public.has_role(auth.uid(), 'provider'::public.app_role)
      OR public.has_business_admin_role(auth.uid())
    )
  );

CREATE POLICY "signed_consents_insert"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'signed-consents'
    AND (
      split_part(name, '/', 1)::uuid IN (
        SELECT p.id FROM public.patients p WHERE p.user_id = auth.uid()
      )
      OR public.has_role(auth.uid(), 'admin'::public.app_role)
      OR public.has_role(auth.uid(), 'staff'::public.app_role)
      OR public.has_role(auth.uid(), 'provider'::public.app_role)
      OR public.has_business_admin_role(auth.uid())
    )
  );
