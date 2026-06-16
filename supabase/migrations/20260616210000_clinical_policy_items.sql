-- CDS Task 8: clinical_policy_items — canonical therapy/program policy (Priority 1)
-- Drives CDS gates, staff menus, and pathway engine alignment. Production rows ship
-- inactive until prescriber sign-off (active=true + signed_off_by).

CREATE TABLE IF NOT EXISTS public.clinical_policy_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_key text NOT NULL,
  display_name text NOT NULL,
  category text,
  regulatory_tier text NOT NULL,
  eha_status text NOT NULL,
  required_consents text[] NOT NULL DEFAULT ARRAY[]::text[],
  required_lab_slugs text[] NOT NULL DEFAULT ARRAY[]::text[],
  monitoring_lab_slugs text[] NOT NULL DEFAULT ARRAY[]::text[],
  contraindication_tags text[] NOT NULL DEFAULT ARRAY[]::text[],
  allowed_vendor_slugs text[] NOT NULL DEFAULT ARRAY[]::text[],
  policy_owner text,
  last_reviewed_at date,
  next_review_at date,
  signed_protocol_version_id uuid REFERENCES public.clinical_protocol_versions(id) ON DELETE SET NULL,
  notes text,
  active boolean NOT NULL DEFAULT false,
  signed_off_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  signed_off_at timestamptz,
  is_sample boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT clinical_policy_items_key_unique UNIQUE (item_key),
  CONSTRAINT clinical_policy_items_regulatory_tier_check
    CHECK (regulatory_tier IN (
      'FDA_APPROVED',
      'COMPOUNDABLE_503A',
      'GRAY_ZONE',
      'RESEARCH_USE_ONLY',
      'EXCLUDED'
    )),
  CONSTRAINT clinical_policy_items_eha_status_check
    CHECK (eha_status IN (
      'offered',
      'program_only',
      'hidden',
      'blocked',
      'excluded'
    )),
  CONSTRAINT clinical_policy_items_active_requires_signoff
    CHECK (active = false OR signed_off_by IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_clinical_policy_items_active
  ON public.clinical_policy_items(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_clinical_policy_items_category
  ON public.clinical_policy_items(category, eha_status);
CREATE INDEX IF NOT EXISTS idx_clinical_policy_items_eha_status
  ON public.clinical_policy_items(eha_status);

DROP TRIGGER IF EXISTS trg_clinical_policy_items_updated_at ON public.clinical_policy_items;
CREATE TRIGGER trg_clinical_policy_items_updated_at
  BEFORE UPDATE ON public.clinical_policy_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_clinical_policy_items_active_signoff ON public.clinical_policy_items;
CREATE TRIGGER trg_clinical_policy_items_active_signoff
  BEFORE INSERT OR UPDATE ON public.clinical_policy_items
  FOR EACH ROW EXECUTE FUNCTION public.enforce_cds_active_requires_signoff();

COMMENT ON TABLE public.clinical_policy_items IS
  'Canonical clinic policy per therapy/program key — regulatory tier, EHA status, consents, labs, vendors.';

ALTER TABLE public.clinical_policy_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "clinical_policy_staff_select" ON public.clinical_policy_items;
CREATE POLICY "clinical_policy_staff_select"
  ON public.clinical_policy_items
  FOR SELECT
  TO authenticated
  USING (
    public.is_clinic_staff(auth.uid())
    AND (active = true OR public.is_prescriber(auth.uid()) OR is_sample = true)
  );

DROP POLICY IF EXISTS "clinical_policy_prescriber_insert" ON public.clinical_policy_items;
CREATE POLICY "clinical_policy_prescriber_insert"
  ON public.clinical_policy_items
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_prescriber(auth.uid()));

DROP POLICY IF EXISTS "clinical_policy_prescriber_update" ON public.clinical_policy_items;
CREATE POLICY "clinical_policy_prescriber_update"
  ON public.clinical_policy_items
  FOR UPDATE
  TO authenticated
  USING (public.is_prescriber(auth.uid()))
  WITH CHECK (public.is_prescriber(auth.uid()));

DROP POLICY IF EXISTS "clinical_policy_prescriber_delete" ON public.clinical_policy_items;
CREATE POLICY "clinical_policy_prescriber_delete"
  ON public.clinical_policy_items
  FOR DELETE
  TO authenticated
  USING (public.is_prescriber(auth.uid()));

-- ---------------------------------------------------------------------------
-- Sample row (shape reference)
-- ---------------------------------------------------------------------------

INSERT INTO public.clinical_policy_items (
  item_key, display_name, category, regulatory_tier, eha_status,
  required_consents, required_lab_slugs, notes, active, is_sample
) VALUES (
  'sample_bpc_157_policy',
  '[SAMPLE] BPC-157 policy row',
  'peptide',
  'RESEARCH_USE_ONLY',
  'offered',
  ARRAY['research_peptide']::text[],
  ARRAY['foundation-wellness']::text[],
  'Example policy shape. Cat 2 peptide under Research Peptide Consent.',
  false,
  true
) ON CONFLICT (item_key) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Production policy seed (inactive until physician sign-off)
-- ---------------------------------------------------------------------------

INSERT INTO public.clinical_policy_items (
  item_key, display_name, category, regulatory_tier, eha_status,
  required_consents, required_lab_slugs, monitoring_lab_slugs,
  contraindication_tags, allowed_vendor_slugs, policy_owner, notes, active, is_sample
) VALUES
(
  'semaglutide',
  'Compounded semaglutide',
  'glp1',
  'COMPOUNDABLE_503A',
  'offered',
  ARRAY['glp1', 'off_label']::text[],
  ARRAY['weight-optimization']::text[],
  ARRAY['weight-optimization']::text[],
  ARRAY['pregnancy', 'mtc_men2', 'pancreatitis_history']::text[],
  ARRAY['gc-scientific-network', 'fcc']::text[],
  'Medical Director',
  'Default GLP-1 program agent. GC primary; FCC backup.',
  false, false
),
(
  'tirzepatide',
  'Compounded tirzepatide',
  'glp1',
  'COMPOUNDABLE_503A',
  'offered',
  ARRAY['glp1', 'off_label']::text[],
  ARRAY['weight-optimization']::text[],
  ARRAY['weight-optimization']::text[],
  ARRAY['pregnancy', 'mtc_men2', 'pancreatitis_history']::text[],
  ARRAY['gc-scientific-network', 'fcc']::text[],
  'Medical Director',
  'Escalation GLP-1 when clinically appropriate.',
  false, false
),
(
  'retatrutide',
  'Retatrutide',
  'glp1',
  'COMPOUNDABLE_503A',
  'program_only',
  ARRAY['glp1', 'off_label', 'research_peptide']::text[],
  ARRAY['weight-optimization']::text[],
  ARRAY['weight-optimization']::text[],
  ARRAY['pregnancy']::text[],
  ARRAY['gc-scientific-network']::text[],
  'Medical Director',
  'June 14 policy override: program-only anchor for ELEVATED METABOLIC RECOMPOSITION. CDS engine blocks à la carte candidate keys.',
  false, false
),
(
  'elevated_metabolic_program',
  'ELEVATED Metabolic Recomposition program',
  'program',
  'COMPOUNDABLE_503A',
  'program_only',
  ARRAY['glp1', 'off_label', 'research_peptide']::text[],
  ARRAY['weight-optimization']::text[],
  ARRAY['weight-optimization']::text[],
  ARRAY['pregnancy', 'uncontrolled_diabetes']::text[],
  ARRAY['gc-scientific-network']::text[],
  'Medical Director',
  'All-inclusive supervised stack — not sold as individual retatrutide SKU at intake.',
  false, false
),
(
  'testosterone_cypionate',
  'Testosterone cypionate (injectable TRT)',
  'hormone',
  'COMPOUNDABLE_503A',
  'offered',
  ARRAY['hormone_therapy', 'off_label']::text[],
  ARRAY['hormone-male']::text[],
  ARRAY['hormone-male']::text[],
  ARRAY['active_prostate_cancer', 'fertility_desire', 'untreated_severe_osa']::text[],
  ARRAY['custom-pharmacy-evans', 'gc-scientific-network']::text[],
  'Medical Director',
  'Injectable-first TRT. Evans fax default.',
  false, false
),
(
  'bi_est_cream',
  'Bi-Est transdermal cream',
  'hormone',
  'COMPOUNDABLE_503A',
  'offered',
  ARRAY['hormone_therapy', 'off_label']::text[],
  ARRAY['hormone-female']::text[],
  ARRAY['hormone-female']::text[],
  ARRAY['estrogen_sensitive_cancer', 'thromboembolic_disease', 'pregnancy']::text[],
  ARRAY['custom-pharmacy-evans']::text[],
  'Medical Director',
  'Lead female HRT product per SOT.',
  false, false
),
(
  'progesterone_oral',
  'Oral micronized progesterone',
  'hormone',
  'COMPOUNDABLE_503A',
  'offered',
  ARRAY['hormone_therapy', 'off_label']::text[],
  ARRAY['hormone-female']::text[],
  ARRAY['hormone-female']::text[],
  ARRAY[]::text[],
  ARRAY['custom-pharmacy-evans']::text[],
  'Medical Director',
  'Bedtime progesterone with estrogen therapy when indicated.',
  false, false
),
(
  'wolverine_stack',
  'Wolverine stack (BPC-157 + TB-500)',
  'peptide',
  'RESEARCH_USE_ONLY',
  'offered',
  ARRAY['research_peptide']::text[],
  ARRAY['foundation-wellness']::text[],
  ARRAY['foundation-wellness']::text[],
  ARRAY['active_malignancy']::text[],
  ARRAY['gc-scientific-network', 'fcc']::text[],
  'Medical Director',
  'Cat 2 research peptides — annual re-consent.',
  false, false
),
(
  'pt_141',
  'PT-141 (bremelanotide)',
  'sexual_wellness',
  'FDA_APPROVED',
  'hidden',
  ARRAY['research_peptide']::text[],
  ARRAY['sexual-wellness']::text[],
  ARRAY['sexual-wellness']::text[],
  ARRAY['uncontrolled_hypertension', 'nitrates']::text[],
  ARRAY['gc-scientific-network']::text[],
  'Medical Director',
  'Launch-hidden sexual wellness line. Route hormones first if lab pattern indicates.',
  false, false
),
(
  'ketamine',
  'Ketamine / Spravato',
  'legacy',
  'EXCLUDED',
  'excluded',
  ARRAY[]::text[],
  ARRAY[]::text[],
  ARRAY[]::text[],
  ARRAY[]::text[],
  ARRAY[]::text[],
  'Medical Director',
  'Legacy Réveil era — not offered. Hard-blocked in CDS engine.',
  false, false
),
(
  'mazdutide',
  'Mazdutide',
  'glp1',
  'EXCLUDED',
  'excluded',
  ARRAY[]::text[],
  ARRAY[]::text[],
  ARRAY[]::text[],
  ARRAY[]::text[],
  ARRAY[]::text[],
  'Medical Director',
  'Not in formulary — insufficient clinical governance vs sema/tirz/reta program path.',
  false, false
)
ON CONFLICT (item_key) DO NOTHING;
