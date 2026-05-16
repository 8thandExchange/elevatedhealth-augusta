-- PR 6: Re-consent requests + substance addition acknowledgments
-- RLS: staff read both tables; patients read own rows; patients insert/update reconsent fulfillment;
--       patients insert substance acks; staff insert substance acks (in-clinic).

-- ---------------------------------------------------------------------------
-- consent_reconsent_requests
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.consent_reconsent_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  consent_type text NOT NULL,
  prior_consent_record_id uuid NOT NULL REFERENCES public.consent_records(id) ON DELETE CASCADE,
  prior_version_id uuid NOT NULL REFERENCES public.consent_versions(id),
  new_version_id uuid NOT NULL REFERENCES public.consent_versions(id),
  triggered_at timestamptz NOT NULL DEFAULT now(),
  reconsent_deadline timestamptz NOT NULL,
  fulfilled_at timestamptz,
  fulfilled_consent_record_id uuid REFERENCES public.consent_records(id),
  reminders_sent_at jsonb NOT NULL DEFAULT '[]'::jsonb,
  CONSTRAINT consent_reconsent_requests_unique UNIQUE (prior_consent_record_id, new_version_id)
);

CREATE INDEX IF NOT EXISTS idx_consent_reconsent_requests_patient
  ON public.consent_reconsent_requests(patient_id);
CREATE INDEX IF NOT EXISTS idx_consent_reconsent_requests_deadline
  ON public.consent_reconsent_requests(reconsent_deadline)
  WHERE fulfilled_at IS NULL;

ALTER TABLE public.consent_reconsent_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "consent_reconsent_requests_staff_read" ON public.consent_reconsent_requests;
CREATE POLICY "consent_reconsent_requests_staff_read" ON public.consent_reconsent_requests
  FOR SELECT TO authenticated USING (
    public.has_role(auth.uid(), 'admin'::public.app_role) OR
    public.has_role(auth.uid(), 'staff'::public.app_role) OR
    public.has_role(auth.uid(), 'provider'::public.app_role) OR
    public.has_business_admin_role(auth.uid())
  );

DROP POLICY IF EXISTS "consent_reconsent_requests_patient_read" ON public.consent_reconsent_requests;
CREATE POLICY "consent_reconsent_requests_patient_read" ON public.consent_reconsent_requests
  FOR SELECT TO authenticated USING (
    patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "consent_reconsent_requests_patient_update" ON public.consent_reconsent_requests;
CREATE POLICY "consent_reconsent_requests_patient_update" ON public.consent_reconsent_requests
  FOR UPDATE TO authenticated USING (
    patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
  )
  WITH CHECK (
    patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- substance_addition_acknowledgments
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.substance_addition_acknowledgments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  parent_consent_record_id uuid NOT NULL REFERENCES public.consent_records(id) ON DELETE CASCADE,
  substance_id text NOT NULL,
  substance_display_name text NOT NULL,
  substance_added_date timestamptz NOT NULL,
  acknowledgment_body_markdown text NOT NULL,
  acknowledgment_body_hash text NOT NULL,
  acknowledged_at timestamptz NOT NULL DEFAULT now(),
  signed_typed_name text NOT NULL,
  signing_method text NOT NULL DEFAULT 'patient_typed_name'
    CHECK (signing_method IN ('patient_typed_name', 'patient_typed_name_in_clinic', 'staff_verbal_documented')),
  staff_witness_user_id uuid,
  capture_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT substance_addition_acknowledgments_unique UNIQUE (parent_consent_record_id, substance_id)
);

CREATE INDEX IF NOT EXISTS idx_substance_addition_acknowledgments_patient
  ON public.substance_addition_acknowledgments(patient_id);
CREATE INDEX IF NOT EXISTS idx_substance_addition_acknowledgments_substance
  ON public.substance_addition_acknowledgments(substance_id);

ALTER TABLE public.substance_addition_acknowledgments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "substance_addition_acknowledgments_staff_read" ON public.substance_addition_acknowledgments;
CREATE POLICY "substance_addition_acknowledgments_staff_read" ON public.substance_addition_acknowledgments
  FOR SELECT TO authenticated USING (
    public.has_role(auth.uid(), 'admin'::public.app_role) OR
    public.has_role(auth.uid(), 'staff'::public.app_role) OR
    public.has_role(auth.uid(), 'provider'::public.app_role) OR
    public.has_business_admin_role(auth.uid())
  );

DROP POLICY IF EXISTS "substance_addition_acknowledgments_patient_read" ON public.substance_addition_acknowledgments;
CREATE POLICY "substance_addition_acknowledgments_patient_read" ON public.substance_addition_acknowledgments
  FOR SELECT TO authenticated USING (
    patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "substance_addition_acknowledgments_patient_insert" ON public.substance_addition_acknowledgments;
CREATE POLICY "substance_addition_acknowledgments_patient_insert" ON public.substance_addition_acknowledgments
  FOR INSERT TO authenticated WITH CHECK (
    patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "substance_addition_acknowledgments_staff_insert" ON public.substance_addition_acknowledgments;
CREATE POLICY "substance_addition_acknowledgments_staff_insert" ON public.substance_addition_acknowledgments
  FOR INSERT TO authenticated WITH CHECK (
    public.has_role(auth.uid(), 'admin'::public.app_role) OR
    public.has_role(auth.uid(), 'staff'::public.app_role) OR
    public.has_role(auth.uid(), 'provider'::public.app_role)
  );

-- ---------------------------------------------------------------------------
-- Deduped reminder sends for re-consent windows (parallel to expiration reminders)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.consent_reconsent_reminders_sent (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reconsent_request_id uuid NOT NULL REFERENCES public.consent_reconsent_requests(id) ON DELETE CASCADE,
  reminder_window text NOT NULL CHECK (reminder_window IN ('30_day', '14_day', '3_day', 'due_day')),
  sent_at timestamptz NOT NULL DEFAULT now(),
  channels_delivered text[] NOT NULL DEFAULT '{}'::text[],
  CONSTRAINT consent_reconsent_reminders_sent_unique UNIQUE (reconsent_request_id, reminder_window)
);

CREATE INDEX IF NOT EXISTS idx_consent_reconsent_reminders_sent_request
  ON public.consent_reconsent_reminders_sent(reconsent_request_id);

ALTER TABLE public.consent_reconsent_reminders_sent ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "consent_reconsent_reminders_sent_staff_read" ON public.consent_reconsent_reminders_sent;
CREATE POLICY "consent_reconsent_reminders_sent_staff_read" ON public.consent_reconsent_reminders_sent
  FOR SELECT TO authenticated USING (
    public.has_role(auth.uid(), 'admin'::public.app_role) OR
    public.has_role(auth.uid(), 'staff'::public.app_role) OR
    public.has_role(auth.uid(), 'provider'::public.app_role) OR
    public.has_business_admin_role(auth.uid())
  );

-- ---------------------------------------------------------------------------
-- Magic link targets for re-consent + substance acknowledgment flows
-- ---------------------------------------------------------------------------
ALTER TABLE public.intake_magic_links
  ADD COLUMN IF NOT EXISTS pending_reconsent_request_id uuid REFERENCES public.consent_reconsent_requests(id) ON DELETE SET NULL;

ALTER TABLE public.intake_magic_links
  ADD COLUMN IF NOT EXISTS pending_substance_id text;

COMMENT ON COLUMN public.intake_magic_links.pending_reconsent_request_id IS
  'When set, IntakeStart routes patient to /intake/reconsent after auth.';
COMMENT ON COLUMN public.intake_magic_links.pending_substance_id IS
  'When set, IntakeStart routes to /intake/substance-acknowledgment for this formulary substance key.';
