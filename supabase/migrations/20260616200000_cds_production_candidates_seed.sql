-- CDS Task 6: production therapy candidate seed (inactive until prescriber sign-off)
-- Pairs with Task 4 pathways. Engine hard-blocks ketamine/retatrutide keys regardless of rows here.

ALTER TABLE public.cds_candidates
  ADD COLUMN IF NOT EXISTS contraindication_tags text[] NOT NULL DEFAULT ARRAY[]::text[];

COMMENT ON COLUMN public.cds_candidates.contraindication_tags IS
  'Tags matched against patient chart contra flags in canOfferTherapy() gate 1.';

-- ---------------------------------------------------------------------------
-- GLP-1 / weight loss
-- ---------------------------------------------------------------------------

INSERT INTO public.cds_candidates (
  pathway_id, candidate_key, display_name, regulatory_status,
  requires_labs, required_lab_slugs, required_consent_types,
  rank_weight, clinical_rationale, contraindication_tags, active, is_sample
)
SELECT
  p.id,
  'glp1_semaglutide',
  'Compounded semaglutide (GLP-1 program)',
  'COMPOUNDABLE_503A',
  true,
  ARRAY['weight-optimization']::text[],
  ARRAY['glp1', 'off_label']::text[],
  1.000,
  'Default GLP-1 path. Titrate per clinic semaglutide protocol; tirzepatide if clinically appropriate.',
  ARRAY['pregnancy', 'mtc_men2', 'pancreatitis_history']::text[],
  false, false
FROM public.cds_pathways p WHERE p.slug = 'weight-loss-glp1'
ON CONFLICT (candidate_key) DO NOTHING;

INSERT INTO public.cds_candidates (
  pathway_id, candidate_key, display_name, regulatory_status,
  requires_labs, required_lab_slugs, required_consent_types,
  rank_weight, clinical_rationale, contraindication_tags, active, is_sample
)
SELECT
  p.id,
  'glp1_tirzepatide',
  'Compounded tirzepatide (GLP-1 program)',
  'COMPOUNDABLE_503A',
  true,
  ARRAY['weight-optimization']::text[],
  ARRAY['glp1', 'off_label']::text[],
  0.850,
  'Escalation when semaglutide inadequate or clinically indicated at intake review.',
  ARRAY['pregnancy', 'mtc_men2', 'pancreatitis_history']::text[],
  false, false
FROM public.cds_pathways p WHERE p.slug = 'weight-loss-glp1'
ON CONFLICT (candidate_key) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Metabolic recomposition — program bundle only (no à la carte retatrutide candidate)
-- ---------------------------------------------------------------------------

INSERT INTO public.cds_candidates (
  pathway_id, candidate_key, display_name, regulatory_status,
  requires_labs, required_lab_slugs, required_consent_types,
  rank_weight, clinical_rationale, contraindication_tags, active, is_sample
)
SELECT
  p.id,
  'elevated_metabolic_program',
  'ELEVATED Metabolic Recomposition (program enrollment)',
  'COMPOUNDABLE_503A',
  true,
  ARRAY['weight-optimization']::text[],
  ARRAY['glp1', 'off_label', 'research_peptide']::text[],
  1.000,
  'All-inclusive supervised program. Retatrutide is program-anchored only — engine blocks standalone retatrutide CDS candidates.',
  ARRAY['pregnancy', 'uncontrolled_diabetes']::text[],
  false, false
FROM public.cds_pathways p WHERE p.slug = 'metabolic-recomposition'
ON CONFLICT (candidate_key) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Men's TRT
-- ---------------------------------------------------------------------------

INSERT INTO public.cds_candidates (
  pathway_id, candidate_key, display_name, regulatory_status,
  requires_labs, required_lab_slugs, required_consent_types,
  rank_weight, clinical_rationale, contraindication_tags, active, is_sample
)
SELECT
  p.id,
  'trt_testosterone_cypionate',
  'Testosterone cypionate (injectable TRT)',
  'COMPOUNDABLE_503A',
  true,
  ARRAY['hormone-male']::text[],
  ARRAY['hormone_therapy', 'off_label']::text[],
  1.000,
  'Injectable-first TRT per SOT. Custom Pharmacy of Evans primary; GC STLKS backup.',
  ARRAY['active_prostate_cancer', 'fertility_desire', 'untreated_severe_osa', 'uncontrolled_heart_failure']::text[],
  false, false
FROM public.cds_pathways p WHERE p.slug = 'low-testosterone-trt'
ON CONFLICT (candidate_key) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Women's BHRT
-- ---------------------------------------------------------------------------

INSERT INTO public.cds_candidates (
  pathway_id, candidate_key, display_name, regulatory_status,
  requires_labs, required_lab_slugs, required_consent_types,
  rank_weight, clinical_rationale, contraindication_tags, active, is_sample
)
SELECT
  p.id,
  'hrt_bi_est_cream',
  'Bi-Est transdermal cream (BHRT)',
  'COMPOUNDABLE_503A',
  true,
  ARRAY['hormone-female']::text[],
  ARRAY['hormone_therapy', 'off_label']::text[],
  1.000,
  'Lead female HRT product per clinic SOT. Progesterone at bedtime when uterus intact.',
  ARRAY['estrogen_sensitive_cancer', 'thromboembolic_disease', 'pregnancy', 'unexplained_vaginal_bleeding']::text[],
  false, false
FROM public.cds_pathways p WHERE p.slug = 'hormone-women-bhrt'
ON CONFLICT (candidate_key) DO NOTHING;

INSERT INTO public.cds_candidates (
  pathway_id, candidate_key, display_name, regulatory_status,
  requires_labs, required_lab_slugs, required_consent_types,
  rank_weight, clinical_rationale, contraindication_tags, active, is_sample
)
SELECT
  p.id,
  'hrt_progesterone_oral',
  'Oral micronized progesterone (BHRT)',
  'COMPOUNDABLE_503A',
  true,
  ARRAY['hormone-female']::text[],
  ARRAY['hormone_therapy', 'off_label']::text[],
  0.900,
  'Bedtime progesterone when clinically indicated with estrogen therapy.',
  ARRAY['progesterone_allergy']::text[],
  false, false
FROM public.cds_pathways p WHERE p.slug = 'hormone-women-bhrt'
ON CONFLICT (candidate_key) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Energy / longevity — Vitality stack components
-- ---------------------------------------------------------------------------

INSERT INTO public.cds_candidates (
  pathway_id, candidate_key, display_name, regulatory_status,
  requires_labs, required_lab_slugs, required_consent_types,
  rank_weight, clinical_rationale, contraindication_tags, active, is_sample
)
SELECT
  p.id,
  v.candidate_key,
  v.display_name,
  'COMPOUNDABLE_503A',
  true,
  ARRAY['foundation-wellness']::text[],
  ARRAY[]::text[],
  v.rank_weight,
  v.clinical_rationale,
  ARRAY[]::text[],
  false, false
FROM public.cds_pathways p
JOIN (VALUES
  ('energy-fatigue-wellness', 'energy_sermorelin', 'Sermorelin (Vitality stack)', 1.000,
   'Nightly growth-hormone secretagogue; address thyroid/iron deficiency on labs first.'),
  ('energy-fatigue-wellness', 'energy_nad_injection', 'NAD+ injection (Vitality stack)', 0.900,
   'SubQ NAD+ for energy/recovery support within Wellness membership.'),
  ('longevity-wellness', 'longevity_sermorelin', 'Sermorelin (longevity path)', 1.000,
   'Vitality stack anchor for longevity enrollment after baseline labs.'),
  ('longevity-wellness', 'longevity_nad_injection', 'NAD+ injection (longevity path)', 0.900,
   'Mitochondrial support layer on Wellness / longevity path.')
) AS v(pathway_slug, candidate_key, display_name, rank_weight, clinical_rationale)
  ON p.slug = v.pathway_slug
ON CONFLICT (candidate_key) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Recovery / injury — research peptide stack
-- ---------------------------------------------------------------------------

INSERT INTO public.cds_candidates (
  pathway_id, candidate_key, display_name, regulatory_status,
  requires_labs, required_lab_slugs, required_consent_types,
  rank_weight, clinical_rationale, contraindication_tags, active, is_sample
)
SELECT
  p.id,
  'recovery_wolverine_stack',
  'Wolverine stack (BPC-157 + TB-500)',
  'RESEARCH_USE_ONLY',
  true,
  ARRAY['foundation-wellness']::text[],
  ARRAY['research_peptide']::text[],
  1.000,
  'Cat 2 research peptides under signed Research Peptide Consent. 6–12 week course.',
  ARRAY['active_malignancy']::text[],
  false, false
FROM public.cds_pathways p WHERE p.slug = 'recovery-injury'
ON CONFLICT (candidate_key) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Libido / sexual wellness
-- ---------------------------------------------------------------------------

INSERT INTO public.cds_candidates (
  pathway_id, candidate_key, display_name, regulatory_status,
  requires_labs, required_lab_slugs, required_consent_types,
  rank_weight, clinical_rationale, contraindication_tags, active, is_sample
)
SELECT
  p.id,
  'libido_pt141',
  'PT-141 (bremelanotide / Vyleesi class)',
  'FDA_APPROVED',
  true,
  ARRAY['sexual-wellness']::text[],
  ARRAY['research_peptide']::text[],
  1.000,
  'On-demand libido support. Route to TRT/HRT first if hormonal pattern on labs.',
  ARRAY['uncontrolled_hypertension', 'cardiovascular_disease', 'nitrates']::text[],
  false, false
FROM public.cds_pathways p WHERE p.slug = 'libido-sexual-wellness'
ON CONFLICT (candidate_key) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Policy documentation rows (EXCLUDED — engine also hard-blocks by key)
-- ---------------------------------------------------------------------------

INSERT INTO public.cds_candidates (
  pathway_id, candidate_key, display_name, regulatory_status,
  requires_labs, required_lab_slugs, required_consent_types,
  rank_weight, clinical_rationale, active, is_sample
)
SELECT
  p.id,
  'policy_ketamine',
  'Ketamine (legacy — not offered)',
  'EXCLUDED',
  false,
  ARRAY[]::text[],
  ARRAY[]::text[],
  0.000,
  'Clinic policy: ketamine/Spravato not offered. Retained for CDS audit trail only.',
  false, false
FROM public.cds_pathways p WHERE p.slug = 'iv-hydration-only'
ON CONFLICT (candidate_key) DO NOTHING;

INSERT INTO public.cds_candidates (
  pathway_id, candidate_key, display_name, regulatory_status,
  requires_labs, required_lab_slugs, required_consent_types,
  rank_weight, clinical_rationale, active, is_sample
)
SELECT
  p.id,
  'policy_retatrutide_ala_carte',
  'Retatrutide à la carte (not offered)',
  'EXCLUDED',
  false,
  ARRAY[]::text[],
  ARRAY[]::text[],
  0.000,
  'Retatrutide is not offered à la carte. It is physician-selected only within the supervised metabolic program with signed protocol and consent.',
  false, false
FROM public.cds_pathways p WHERE p.slug = 'metabolic-recomposition'
ON CONFLICT (candidate_key) DO NOTHING;
