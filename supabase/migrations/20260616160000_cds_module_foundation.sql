-- ============================================================================
-- Clinical Decision Support (CDS) — Task 1: schema + RLS foundation
--
-- Probe-confirmed FK targets (2026-06-16, jiiparpfkjytdcuelcns):
--   patients.id, patient_encounters.id (no public.encounters table),
--   iv_therapies.id, iv_addons.id, treatment_plans.id,
--   consent_versions / consent_records / consent_acknowledgments,
--   lab_results (resulted labs — do not duplicate).
--
-- Roles: public.user_roles (app_role enum). Prescriber is derived via
-- public.is_prescriber() — true when user holds provider role (covers
-- admin+provider multi-role accounts; pure admin is not a prescriber).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_clinic_staff(_user_id uuid)
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

COMMENT ON FUNCTION public.is_clinic_staff(uuid) IS
  'Clinic staff+ gate for CDS read paths (admin, staff, provider, business_admin).';

CREATE OR REPLACE FUNCTION public.is_prescriber(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'provider'::public.app_role);
$$;

COMMENT ON FUNCTION public.is_prescriber(uuid) IS
  'Physician prescriber gate derived from user_roles. True when provider role is held (includes admin+provider).';

-- ---------------------------------------------------------------------------
-- Active catalog invariant: active=true requires physician sign-off
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.enforce_cds_active_requires_signoff()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.active = true AND NEW.signed_off_by IS NULL THEN
    RAISE EXCEPTION
      '%: active=true requires signed_off_by to be set (id=%)',
      TG_TABLE_NAME, NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- cds_pathways — authored clinical pathway definitions (seed config)
-- ---------------------------------------------------------------------------

CREATE TABLE public.cds_pathways (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  name text NOT NULL,
  description text,
  goal_key text NOT NULL,
  active boolean NOT NULL DEFAULT false,
  signed_off_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  signed_off_at timestamptz,
  authored_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  is_sample boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT cds_pathways_slug_unique UNIQUE (slug),
  CONSTRAINT cds_pathways_active_requires_signoff
    CHECK (active = false OR signed_off_by IS NOT NULL)
);

CREATE INDEX idx_cds_pathways_active ON public.cds_pathways(active) WHERE active = true;
CREATE INDEX idx_cds_pathways_goal_key ON public.cds_pathways(goal_key);

DROP TRIGGER IF EXISTS trg_cds_pathways_updated_at ON public.cds_pathways;
CREATE TRIGGER trg_cds_pathways_updated_at
  BEFORE UPDATE ON public.cds_pathways
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_cds_pathways_active_signoff ON public.cds_pathways;
CREATE TRIGGER trg_cds_pathways_active_signoff
  BEFORE INSERT OR UPDATE ON public.cds_pathways
  FOR EACH ROW EXECUTE FUNCTION public.enforce_cds_active_requires_signoff();

-- ---------------------------------------------------------------------------
-- cds_pathway_symptoms — symptom → pathway mapping rows
-- ---------------------------------------------------------------------------

CREATE TABLE public.cds_pathway_symptoms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pathway_id uuid NOT NULL REFERENCES public.cds_pathways(id) ON DELETE CASCADE,
  symptom_key text NOT NULL,
  symptom_label text NOT NULL,
  weight numeric(6, 3) NOT NULL DEFAULT 1.000,
  is_sample boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT cds_pathway_symptoms_pathway_symptom_unique UNIQUE (pathway_id, symptom_key)
);

CREATE INDEX idx_cds_pathway_symptoms_pathway ON public.cds_pathway_symptoms(pathway_id);

-- ---------------------------------------------------------------------------
-- cds_pathway_lab_triggers — lab analyte triggers for pathways
-- ---------------------------------------------------------------------------

CREATE TABLE public.cds_pathway_lab_triggers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pathway_id uuid NOT NULL REFERENCES public.cds_pathways(id) ON DELETE CASCADE,
  analyte_key text NOT NULL,
  comparator text NOT NULL,
  threshold_low numeric,
  threshold_high numeric,
  unit text,
  is_sample boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT cds_pathway_lab_triggers_comparator_check
    CHECK (comparator IN ('lt', 'lte', 'gt', 'gte', 'eq', 'between')),
  CONSTRAINT cds_pathway_lab_triggers_pathway_analyte_unique UNIQUE (pathway_id, analyte_key)
);

CREATE INDEX idx_cds_pathway_lab_triggers_pathway ON public.cds_pathway_lab_triggers(pathway_id);

-- ---------------------------------------------------------------------------
-- cds_candidates — recommendable therapy candidates (seed config)
-- ---------------------------------------------------------------------------

CREATE TABLE public.cds_candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pathway_id uuid REFERENCES public.cds_pathways(id) ON DELETE SET NULL,
  candidate_key text NOT NULL,
  display_name text NOT NULL,
  regulatory_status text NOT NULL,
  requires_labs boolean NOT NULL DEFAULT true,
  required_lab_slugs text[] NOT NULL DEFAULT ARRAY[]::text[],
  required_consent_types text[] NOT NULL DEFAULT ARRAY[]::text[],
  therapy_ref_type text,
  therapy_ref_id uuid,
  rank_weight numeric(6, 3) NOT NULL DEFAULT 1.000,
  clinical_rationale text,
  active boolean NOT NULL DEFAULT false,
  signed_off_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  signed_off_at timestamptz,
  is_sample boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT cds_candidates_key_unique UNIQUE (candidate_key),
  CONSTRAINT cds_candidates_regulatory_status_check
    CHECK (regulatory_status IN (
      'FDA_APPROVED',
      'COMPOUNDABLE_503A',
      'GRAY_ZONE',
      'RESEARCH_USE_ONLY',
      'EXCLUDED'
    )),
  CONSTRAINT cds_candidates_therapy_ref_type_check
    CHECK (therapy_ref_type IS NULL OR therapy_ref_type IN ('iv_therapy', 'iv_addon')),
  CONSTRAINT cds_candidates_active_requires_signoff
    CHECK (active = false OR signed_off_by IS NOT NULL)
);

CREATE INDEX idx_cds_candidates_pathway ON public.cds_candidates(pathway_id);
CREATE INDEX idx_cds_candidates_active ON public.cds_candidates(active) WHERE active = true;
CREATE INDEX idx_cds_candidates_regulatory_status ON public.cds_candidates(regulatory_status);

DROP TRIGGER IF EXISTS trg_cds_candidates_updated_at ON public.cds_candidates;
CREATE TRIGGER trg_cds_candidates_updated_at
  BEFORE UPDATE ON public.cds_candidates
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_cds_candidates_active_signoff ON public.cds_candidates;
CREATE TRIGGER trg_cds_candidates_active_signoff
  BEFORE INSERT OR UPDATE ON public.cds_candidates
  FOR EACH ROW EXECUTE FUNCTION public.enforce_cds_active_requires_signoff();

-- ---------------------------------------------------------------------------
-- cds_assessments — per-patient assessment runs (staff-authored drafts)
-- ---------------------------------------------------------------------------

CREATE TABLE public.cds_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE RESTRICT,
  encounter_id uuid REFERENCES public.patient_encounters(id) ON DELETE SET NULL,
  pathway_id uuid REFERENCES public.cds_pathways(id) ON DELETE SET NULL,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'draft',
  goal_key text,
  symptoms_selected jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT cds_assessments_status_check
    CHECK (status IN ('draft', 'awaiting_labs', 'awaiting_provider', 'reviewed'))
);

CREATE INDEX idx_cds_assessments_patient ON public.cds_assessments(patient_id, created_at DESC);
CREATE INDEX idx_cds_assessments_encounter ON public.cds_assessments(encounter_id);
CREATE INDEX idx_cds_assessments_created_by ON public.cds_assessments(created_by, status);

DROP TRIGGER IF EXISTS trg_cds_assessments_updated_at ON public.cds_assessments;
CREATE TRIGGER trg_cds_assessments_updated_at
  BEFORE UPDATE ON public.cds_assessments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE FUNCTION public.cds_assessment_readable(_assessment_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.cds_assessments a
    WHERE a.id = _assessment_id
      AND (
        a.created_by = _user_id
        OR public.is_prescriber(_user_id)
      )
  );
$$;

-- ---------------------------------------------------------------------------
-- cds_assessment_results — engine output (service-role writes in Task 2+)
-- ---------------------------------------------------------------------------

CREATE TABLE public.cds_assessment_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES public.cds_assessments(id) ON DELETE CASCADE,
  candidate_id uuid REFERENCES public.cds_candidates(id) ON DELETE SET NULL,
  candidate_key text NOT NULL,
  display_name text NOT NULL,
  regulatory_status text NOT NULL,
  gate_state text NOT NULL,
  requires_labs boolean NOT NULL DEFAULT false,
  blocked_reason text,
  rank_score numeric(10, 4),
  engine_version text,
  surfaced_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT cds_assessment_results_regulatory_status_check
    CHECK (regulatory_status IN (
      'FDA_APPROVED',
      'COMPOUNDABLE_503A',
      'GRAY_ZONE',
      'RESEARCH_USE_ONLY',
      'EXCLUDED'
    )),
  CONSTRAINT cds_assessment_results_gate_state_check
    CHECK (gate_state IN (
      'ready',
      'blocked_excluded',
      'blocked_ruo',
      'needs_labs',
      'needs_ack',
      'needs_contra_review'
    ))
);

CREATE INDEX idx_cds_assessment_results_assessment
  ON public.cds_assessment_results(assessment_id, rank_score DESC NULLS LAST);

-- ---------------------------------------------------------------------------
-- cds_provider_review — prescriber approval gate (hard finalize boundary)
-- ---------------------------------------------------------------------------

CREATE TABLE public.cds_provider_review (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL UNIQUE REFERENCES public.cds_assessments(id) ON DELETE CASCADE,
  prescriber_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  decision text NOT NULL,
  notes text,
  modified_payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT cds_provider_review_decision_check
    CHECK (decision IN ('approved', 'modified', 'rejected'))
);

CREATE INDEX idx_cds_provider_review_prescriber
  ON public.cds_provider_review(prescriber_id, created_at DESC);

DROP TRIGGER IF EXISTS trg_cds_provider_review_updated_at ON public.cds_provider_review;
CREATE TRIGGER trg_cds_provider_review_updated_at
  BEFORE UPDATE ON public.cds_provider_review
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- RLS — all CDS tables; authenticated clinic staff only; no anon/public
-- ---------------------------------------------------------------------------

ALTER TABLE public.cds_pathways ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cds_pathway_symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cds_pathway_lab_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cds_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cds_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cds_assessment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cds_provider_review ENABLE ROW LEVEL SECURITY;

-- cds_pathways ---------------------------------------------------------------

DROP POLICY IF EXISTS "cds_pathways_staff_select_active" ON public.cds_pathways;
CREATE POLICY "cds_pathways_staff_select_active"
  ON public.cds_pathways
  FOR SELECT
  TO authenticated
  USING (
    public.is_clinic_staff(auth.uid())
    AND (active = true OR public.is_prescriber(auth.uid()))
  );

DROP POLICY IF EXISTS "cds_pathways_prescriber_insert" ON public.cds_pathways;
CREATE POLICY "cds_pathways_prescriber_insert"
  ON public.cds_pathways
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_prescriber(auth.uid()));

DROP POLICY IF EXISTS "cds_pathways_prescriber_update" ON public.cds_pathways;
CREATE POLICY "cds_pathways_prescriber_update"
  ON public.cds_pathways
  FOR UPDATE
  TO authenticated
  USING (public.is_prescriber(auth.uid()))
  WITH CHECK (public.is_prescriber(auth.uid()));

DROP POLICY IF EXISTS "cds_pathways_prescriber_delete" ON public.cds_pathways;
CREATE POLICY "cds_pathways_prescriber_delete"
  ON public.cds_pathways
  FOR DELETE
  TO authenticated
  USING (public.is_prescriber(auth.uid()));

-- cds_pathway_symptoms -------------------------------------------------------

DROP POLICY IF EXISTS "cds_pathway_symptoms_staff_select_active" ON public.cds_pathway_symptoms;
CREATE POLICY "cds_pathway_symptoms_staff_select_active"
  ON public.cds_pathway_symptoms
  FOR SELECT
  TO authenticated
  USING (
    public.is_clinic_staff(auth.uid())
    AND (
      public.is_prescriber(auth.uid())
      OR EXISTS (
        SELECT 1
        FROM public.cds_pathways p
        WHERE p.id = pathway_id
          AND p.active = true
      )
    )
  );

DROP POLICY IF EXISTS "cds_pathway_symptoms_prescriber_insert" ON public.cds_pathway_symptoms;
CREATE POLICY "cds_pathway_symptoms_prescriber_insert"
  ON public.cds_pathway_symptoms
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_prescriber(auth.uid()));

DROP POLICY IF EXISTS "cds_pathway_symptoms_prescriber_update" ON public.cds_pathway_symptoms;
CREATE POLICY "cds_pathway_symptoms_prescriber_update"
  ON public.cds_pathway_symptoms
  FOR UPDATE
  TO authenticated
  USING (public.is_prescriber(auth.uid()))
  WITH CHECK (public.is_prescriber(auth.uid()));

DROP POLICY IF EXISTS "cds_pathway_symptoms_prescriber_delete" ON public.cds_pathway_symptoms;
CREATE POLICY "cds_pathway_symptoms_prescriber_delete"
  ON public.cds_pathway_symptoms
  FOR DELETE
  TO authenticated
  USING (public.is_prescriber(auth.uid()));

-- cds_pathway_lab_triggers ---------------------------------------------------

DROP POLICY IF EXISTS "cds_pathway_lab_triggers_staff_select_active" ON public.cds_pathway_lab_triggers;
CREATE POLICY "cds_pathway_lab_triggers_staff_select_active"
  ON public.cds_pathway_lab_triggers
  FOR SELECT
  TO authenticated
  USING (
    public.is_clinic_staff(auth.uid())
    AND (
      public.is_prescriber(auth.uid())
      OR EXISTS (
        SELECT 1
        FROM public.cds_pathways p
        WHERE p.id = pathway_id
          AND p.active = true
      )
    )
  );

DROP POLICY IF EXISTS "cds_pathway_lab_triggers_prescriber_insert" ON public.cds_pathway_lab_triggers;
CREATE POLICY "cds_pathway_lab_triggers_prescriber_insert"
  ON public.cds_pathway_lab_triggers
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_prescriber(auth.uid()));

DROP POLICY IF EXISTS "cds_pathway_lab_triggers_prescriber_update" ON public.cds_pathway_lab_triggers;
CREATE POLICY "cds_pathway_lab_triggers_prescriber_update"
  ON public.cds_pathway_lab_triggers
  FOR UPDATE
  TO authenticated
  USING (public.is_prescriber(auth.uid()))
  WITH CHECK (public.is_prescriber(auth.uid()));

DROP POLICY IF EXISTS "cds_pathway_lab_triggers_prescriber_delete" ON public.cds_pathway_lab_triggers;
CREATE POLICY "cds_pathway_lab_triggers_prescriber_delete"
  ON public.cds_pathway_lab_triggers
  FOR DELETE
  TO authenticated
  USING (public.is_prescriber(auth.uid()));

-- cds_candidates -------------------------------------------------------------

DROP POLICY IF EXISTS "cds_candidates_staff_select_active" ON public.cds_candidates;
CREATE POLICY "cds_candidates_staff_select_active"
  ON public.cds_candidates
  FOR SELECT
  TO authenticated
  USING (
    public.is_clinic_staff(auth.uid())
    AND (active = true OR public.is_prescriber(auth.uid()))
  );

DROP POLICY IF EXISTS "cds_candidates_prescriber_insert" ON public.cds_candidates;
CREATE POLICY "cds_candidates_prescriber_insert"
  ON public.cds_candidates
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_prescriber(auth.uid()));

DROP POLICY IF EXISTS "cds_candidates_prescriber_update" ON public.cds_candidates;
CREATE POLICY "cds_candidates_prescriber_update"
  ON public.cds_candidates
  FOR UPDATE
  TO authenticated
  USING (public.is_prescriber(auth.uid()))
  WITH CHECK (public.is_prescriber(auth.uid()));

DROP POLICY IF EXISTS "cds_candidates_prescriber_delete" ON public.cds_candidates;
CREATE POLICY "cds_candidates_prescriber_delete"
  ON public.cds_candidates
  FOR DELETE
  TO authenticated
  USING (public.is_prescriber(auth.uid()));

-- cds_assessments ------------------------------------------------------------

DROP POLICY IF EXISTS "cds_assessments_creator_or_prescriber_select" ON public.cds_assessments;
CREATE POLICY "cds_assessments_creator_or_prescriber_select"
  ON public.cds_assessments
  FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid()
    OR public.is_prescriber(auth.uid())
  );

DROP POLICY IF EXISTS "cds_assessments_staff_insert_own" ON public.cds_assessments;
CREATE POLICY "cds_assessments_staff_insert_own"
  ON public.cds_assessments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_clinic_staff(auth.uid())
    AND created_by = auth.uid()
  );

DROP POLICY IF EXISTS "cds_assessments_staff_update_own_draft" ON public.cds_assessments;
CREATE POLICY "cds_assessments_staff_update_own_draft"
  ON public.cds_assessments
  FOR UPDATE
  TO authenticated
  USING (
    (
      public.is_clinic_staff(auth.uid())
      AND created_by = auth.uid()
      AND status = 'draft'
    )
    OR public.is_prescriber(auth.uid())
  )
  WITH CHECK (
    (
      public.is_clinic_staff(auth.uid())
      AND created_by = auth.uid()
      AND status = 'draft'
    )
    OR public.is_prescriber(auth.uid())
  );

-- cds_assessment_results — SELECT only for authenticated; writes via service role

DROP POLICY IF EXISTS "cds_assessment_results_creator_or_prescriber_select" ON public.cds_assessment_results;
CREATE POLICY "cds_assessment_results_creator_or_prescriber_select"
  ON public.cds_assessment_results
  FOR SELECT
  TO authenticated
  USING (public.cds_assessment_readable(assessment_id, auth.uid()));

-- cds_provider_review --------------------------------------------------------

DROP POLICY IF EXISTS "cds_provider_review_staff_select" ON public.cds_provider_review;
CREATE POLICY "cds_provider_review_staff_select"
  ON public.cds_provider_review
  FOR SELECT
  TO authenticated
  USING (public.is_clinic_staff(auth.uid()));

DROP POLICY IF EXISTS "cds_provider_review_prescriber_insert" ON public.cds_provider_review;
CREATE POLICY "cds_provider_review_prescriber_insert"
  ON public.cds_provider_review
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_prescriber(auth.uid())
    AND prescriber_id = auth.uid()
  );

DROP POLICY IF EXISTS "cds_provider_review_prescriber_update" ON public.cds_provider_review;
CREATE POLICY "cds_provider_review_prescriber_update"
  ON public.cds_provider_review
  FOR UPDATE
  TO authenticated
  USING (
    public.is_prescriber(auth.uid())
    AND prescriber_id = auth.uid()
  )
  WITH CHECK (
    public.is_prescriber(auth.uid())
    AND prescriber_id = auth.uid()
  );

-- ---------------------------------------------------------------------------
-- SAMPLE ROWS (is_sample=true) — shape reference only; not clinically active
-- ---------------------------------------------------------------------------

INSERT INTO public.cds_pathways (
  slug,
  name,
  description,
  goal_key,
  active,
  is_sample
) VALUES (
  'sample-recovery-injury',
  '[SAMPLE] Tissue recovery pathway',
  'Example row showing CDS pathway shape. Set signed_off_by before activating.',
  'recovery_injury',
  false,
  true
);

INSERT INTO public.cds_pathway_symptoms (
  pathway_id,
  symptom_key,
  symptom_label,
  weight,
  is_sample
)
SELECT
  p.id,
  'joint_pain',
  'Persistent joint or tendon pain',
  1.500,
  true
FROM public.cds_pathways p
WHERE p.slug = 'sample-recovery-injury'
  AND p.is_sample = true;

INSERT INTO public.cds_pathway_lab_triggers (
  pathway_id,
  analyte_key,
  comparator,
  threshold_low,
  unit,
  is_sample
)
SELECT
  p.id,
  'crp',
  'gt',
  3.0,
  'mg/L',
  true
FROM public.cds_pathways p
WHERE p.slug = 'sample-recovery-injury'
  AND p.is_sample = true;

INSERT INTO public.cds_candidates (
  pathway_id,
  candidate_key,
  display_name,
  regulatory_status,
  requires_labs,
  required_lab_slugs,
  required_consent_types,
  therapy_ref_type,
  clinical_rationale,
  active,
  is_sample
)
SELECT
  p.id,
  'sample_bpc_157',
  '[SAMPLE] BPC-157 (research peptide)',
  'RESEARCH_USE_ONLY',
  true,
  ARRAY['foundation-wellness']::text[],
  ARRAY['research_peptide']::text[],
  NULL,
  'Example candidate row. Engine must gate RESEARCH_USE_ONLY via needs_ack before ePrescribe handoff.',
  false,
  true
FROM public.cds_pathways p
WHERE p.slug = 'sample-recovery-injury'
  AND p.is_sample = true;
