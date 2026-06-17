-- CDS pathway expansion: prediabetes, sexual function (M/F), thyroid, anemia, aesthetics, IV+NAD.
-- All rows ship inactive (active=false, is_sample=false) until prescriber sign-off.
-- Clinical content aligned to EHA_New_Clinical_Algorithm_Sheets_DRAFT.pdf (authoritative).
-- IV lane: extends existing iv-hydration-only row (same goal_key iv_only) rather than duplicate pathway.

BEGIN;

-- Extend IV hydration pathway to cover NAD+ standing menu (supersedes iv-therapy-nad slug proposal).
UPDATE public.cds_pathways
SET
  name = 'IV therapy and NAD+',
  description = 'Lane A IV Lounge and NAD+ infusions. IV screening engine is the hard gate.',
  staff_redirect_notes =
    'Route to /iv-lounge. Hard blocks: CHF, ESRD, pregnancy, anaphylaxis. G6PD for high-dose vitamin C services. Reuse evaluate-iv-screening before infusion.',
  updated_at = timezone('utc', now())
WHERE slug = 'iv-hydration-only'
  AND goal_key = 'iv_only';

INSERT INTO public.cds_pathways (
  slug, name, description, goal_key,
  recommended_lab_slug, elevated_program_key, staff_redirect_notes,
  active, is_sample
) VALUES
(
  'prediabetes-insulin-resistance',
  'Pre-diabetes and insulin resistance',
  'Metabolic screening and therapy path for insulin resistance and prediabetes range A1c.',
  'prediabetes_insulin_resistance',
  'weight-optimization',
  'glp1',
  'A1c over 6.4 to diabetes referral. eGFR under 60 metformin caution. Pregnancy.',
  false, false
),
(
  'male-sexual-function',
  'Male erectile and sexual function',
  'ED and male sexual wellness after labs and cardiovascular screen.',
  'male_sexual_function',
  'sexual-wellness',
  NULL,
  'Nitrates absolute stop. Recent cardiac event. Uncontrolled BP. Low testosterone routes to TRT.',
  false, false
),
(
  'female-sexual-function',
  'Female low libido and testosterone',
  'Female libido and androgen support after gynecologic red-flag screen.',
  'female_sexual_function',
  'hormone-female',
  NULL,
  'Unexplained bleeding to gyn. Estrogen-sensitive cancer. Psychological primary to counseling.',
  false, false
),
(
  'thyroid-optimization',
  'Thyroid optimization',
  'Hypo- and hyperthyroid symptom workup on foundational panel.',
  'thyroid_optimization',
  'foundation-wellness',
  'wellness',
  'Palpitations or AF urgent. Nodule to endocrine. Pregnancy specialized.',
  false, false
),
(
  'anemia-iron',
  'Anemia and iron',
  'Iron deficiency and anemia repletion after source workup.',
  'anemia_iron',
  'foundation-wellness',
  'wellness',
  'GI bleed signs to workup. Severe anemia to ED. Hemochromatosis no iron.',
  false, false
),
(
  'aesthetics',
  'Aesthetics',
  'Cosmetic neuromodulator and filler procedures when prerequisites on file.',
  'aesthetics',
  NULL,
  NULL,
  'Procedural. Does not open until contractor prerequisites are on file.',
  false, false
)
ON CONFLICT (slug) DO NOTHING;

-- Symptom chips
INSERT INTO public.cds_pathway_symptoms (pathway_id, symptom_key, symptom_label, weight, is_sample)
SELECT p.id, v.symptom_key, v.symptom_label, v.weight, false
FROM public.cds_pathways p
JOIN (VALUES
  ('prediabetes-insulin-resistance', 'weight_gain', 'Weight gain / central adiposity', 2.0),
  ('prediabetes-insulin-resistance', 'fatigue', 'Fatigue', 1.5),
  ('prediabetes-insulin-resistance', 'increased_thirst', 'Increased thirst / urination', 1.5),
  ('prediabetes-insulin-resistance', 'blurred_vision', 'Blurred vision', 1.0),
  ('prediabetes-insulin-resistance', 'insulin_resistance', 'Known insulin resistance', 2.0),
  ('male-sexual-function', 'erectile_dysfunction', 'Erectile dysfunction', 2.0),
  ('male-sexual-function', 'low_libido', 'Low libido', 1.5),
  ('male-sexual-function', 'reduced_morning_erections', 'Reduced morning erections', 1.5),
  ('female-sexual-function', 'low_libido', 'Low libido', 2.0),
  ('female-sexual-function', 'vaginal_dryness', 'Vaginal dryness', 1.5),
  ('female-sexual-function', 'reduced_arousal', 'Reduced arousal', 1.5),
  ('thyroid-optimization', 'fatigue', 'Fatigue', 2.0),
  ('thyroid-optimization', 'weight_gain', 'Unexplained weight change', 1.5),
  ('thyroid-optimization', 'cold_intolerance', 'Cold intolerance', 1.5),
  ('thyroid-optimization', 'hair_loss', 'Hair loss / brittle hair', 1.0),
  ('thyroid-optimization', 'constipation', 'Constipation', 1.0),
  ('anemia-iron', 'fatigue', 'Fatigue', 2.0),
  ('anemia-iron', 'shortness_of_breath', 'Shortness of breath on exertion', 1.5),
  ('anemia-iron', 'pallor', 'Pallor / looking washed out', 1.0),
  ('anemia-iron', 'heavy_menses', 'Heavy menstrual bleeding', 1.5),
  ('aesthetics', 'facial_wrinkles', 'Facial wrinkles / lines', 2.0),
  ('aesthetics', 'volume_loss', 'Facial volume loss', 1.5),
  ('aesthetics', 'skin_laxity', 'Skin laxity', 1.0),
  ('iv-hydration-only', 'fatigue', 'Fatigue / low energy', 1.5),
  ('iv-hydration-only', 'dehydration', 'Dehydration', 2.0),
  ('iv-hydration-only', 'hangover_recovery', 'Hangover / recovery', 1.5),
  ('iv-hydration-only', 'nad_interest', 'NAD+ infusion interest', 2.0)
) AS v(pathway_slug, symptom_key, symptom_label, weight) ON p.slug = v.pathway_slug
ON CONFLICT (pathway_id, symptom_key) DO NOTHING;

-- Pathway lab triggers (pathway-specific plus shared redirect documentation rows)
INSERT INTO public.cds_pathway_lab_triggers (
  pathway_id, analyte_key, comparator, threshold_low, threshold_high, unit, is_sample
)
SELECT p.id, v.analyte_key, v.comparator, v.threshold_low, v.threshold_high, v.unit, false
FROM public.cds_pathways p
JOIN (VALUES
  ('prediabetes-insulin-resistance', 'hba1c', 'gt', 6.4::numeric, NULL::numeric, '%'),
  ('prediabetes-insulin-resistance', 'egfr', 'lt', NULL::numeric, 60::numeric, 'mL/min/1.73m2'),
  ('prediabetes-insulin-resistance', 'alt', 'gt', NULL::numeric, NULL::numeric, 'x ULN'),
  ('prediabetes-insulin-resistance', 'ast', 'gt', NULL::numeric, NULL::numeric, 'x ULN'),
  ('male-sexual-function', 'prolactin', 'gt', 20::numeric, NULL::numeric, 'ng/mL'),
  ('male-sexual-function', 'psa', 'gt', 4::numeric, NULL::numeric, 'ng/mL'),
  ('male-sexual-function', 'hematocrit', 'gt', 54::numeric, NULL::numeric, '%'),
  ('female-sexual-function', 'prolactin', 'gt', 20::numeric, NULL::numeric, 'ng/mL'),
  ('thyroid-optimization', 'tsh', 'gt', 4.5::numeric, NULL::numeric, 'mIU/L'),
  ('thyroid-optimization', 'tsh_suppressed', 'lt', NULL::numeric, 0.4::numeric, 'mIU/L'),
  ('anemia-iron', 'ferritin', 'lt', NULL::numeric, 30::numeric, 'ng/mL'),
  ('anemia-iron', 'hemoglobin', 'lt', NULL::numeric, 12::numeric, 'g/dL'),
  ('anemia-iron', 'hemoglobin_male', 'lt', NULL::numeric, 13::numeric, 'g/dL')
) AS v(pathway_slug, analyte_key, comparator, threshold_low, threshold_high, unit)
  ON p.slug = v.pathway_slug
ON CONFLICT (pathway_id, analyte_key) DO NOTHING;

-- Shared lab-redirect documentation rows on general-wellness (cross-pathway reference)
INSERT INTO public.cds_pathway_lab_triggers (
  pathway_id, analyte_key, comparator, threshold_low, threshold_high, unit, is_sample
)
SELECT p.id, v.analyte_key, v.comparator, v.threshold_low, v.threshold_high, v.unit, false
FROM public.cds_pathways p
JOIN (VALUES
  ('general-wellness', 'hba1c', 'gt', 6.4::numeric, NULL::numeric, '%'),
  ('general-wellness', 'tsh', 'gt', 4.5::numeric, NULL::numeric, 'mIU/L'),
  ('general-wellness', 'tsh_suppressed', 'lt', NULL::numeric, 0.4::numeric, 'mIU/L'),
  ('general-wellness', 'prolactin', 'gt', 20::numeric, NULL::numeric, 'ng/mL'),
  ('general-wellness', 'hematocrit', 'gt', 54::numeric, NULL::numeric, '%'),
  ('general-wellness', 'psa', 'gt', 4::numeric, NULL::numeric, 'ng/mL'),
  ('general-wellness', 'egfr', 'lt', NULL::numeric, 60::numeric, 'mL/min/1.73m2'),
  ('general-wellness', 'ferritin', 'lt', NULL::numeric, 30::numeric, 'ng/mL'),
  ('general-wellness', 'hemoglobin', 'lt', NULL::numeric, 12::numeric, 'g/dL')
) AS v(pathway_slug, analyte_key, comparator, threshold_low, threshold_high, unit)
  ON p.slug = v.pathway_slug
ON CONFLICT (pathway_id, analyte_key) DO NOTHING;

-- Candidates (inactive until prescriber sign-off)
INSERT INTO public.cds_candidates (
  pathway_id, candidate_key, display_name, regulatory_status,
  requires_labs, required_lab_slugs, required_consent_types,
  rank_weight, clinical_rationale, contraindication_tags, active, is_sample
)
SELECT
  p.id,
  v.candidate_key,
  v.display_name,
  v.regulatory_status::text,
  v.requires_labs,
  v.required_lab_slugs,
  v.required_consent_types,
  v.rank_weight,
  v.clinical_rationale,
  v.contraindication_tags,
  false,
  false
FROM public.cds_pathways p
JOIN (VALUES
  (
    'prediabetes-insulin-resistance', 'prediabetes_metformin', 'Metformin (prediabetes / insulin resistance)',
    'FDA_APPROVED', true, ARRAY['weight-optimization']::text[], ARRAY['general_medical_treatment']::text[],
    1.000, 'First-line when eGFR adequate and no acute contraindication.',
    ARRAY['egfr_below_30', 'acute_illness', 'contrast_48h']::text[]
  ),
  (
    'prediabetes-insulin-resistance', 'prediabetes_glp1_referral', 'GLP-1 program referral (prediabetes)',
    'COMPOUNDABLE_503A', true, ARRAY['weight-optimization']::text[], ARRAY['glp1', 'off_label']::text[],
    0.850, 'Escalation to supervised GLP-1 program when metformin inadequate or BMI criteria met.',
    ARRAY['pregnancy', 'mtc_men2', 'pancreatitis_history']::text[]
  ),
  (
    'male-sexual-function', 'ed_sildenafil', 'Sildenafil (ED)',
    'FDA_APPROVED', true, ARRAY['sexual-wellness']::text[], ARRAY['general_medical_treatment', 'off_label']::text[],
    1.000, 'PDE5 inhibitor for erectile dysfunction after cardiovascular and medication review.',
    ARRAY['nitrates', 'recent_cardiac_event', 'severe_hypotension']::text[]
  ),
  (
    'male-sexual-function', 'ed_tadalafil', 'Tadalafil (ED)',
    'FDA_APPROVED', true, ARRAY['sexual-wellness']::text[], ARRAY['general_medical_treatment', 'off_label']::text[],
    0.950, 'Longer-acting PDE5 option when clinically appropriate.',
    ARRAY['nitrates', 'recent_cardiac_event', 'severe_hypotension']::text[]
  ),
  (
    'male-sexual-function', 'ed_pt141', 'PT-141 / bremelanotide (ED adjunct)',
    'FDA_APPROVED', true, ARRAY['sexual-wellness']::text[], ARRAY['off_label']::text[],
    0.800, 'On-demand libido support when PDE5 inadequate or contraindicated.',
    ARRAY['uncontrolled_hypertension', 'cardiovascular_disease', 'nitrates']::text[]
  ),
  (
    'female-sexual-function', 'female_testosterone', 'Testosterone (female libido)',
    'COMPOUNDABLE_503A', true, ARRAY['hormone-female']::text[], ARRAY['hormone_therapy', 'off_label']::text[],
    1.000, 'Low-dose transdermal testosterone when labs and history support.',
    ARRAY['estrogen_sensitive_cancer', 'pregnancy']::text[]
  ),
  (
    'female-sexual-function', 'female_dhea', 'DHEA (female libido support)',
    'COMPOUNDABLE_503A', true, ARRAY['hormone-female']::text[], ARRAY['off_label']::text[],
    0.850, 'Adjunct when DHEA-S low and no hormone-sensitive malignancy.',
    ARRAY['hormone_sensitive_cancer']::text[]
  ),
  (
    'female-sexual-function', 'female_pt141', 'PT-141 / bremelanotide (female libido)',
    'FDA_APPROVED', true, ARRAY['hormone-female']::text[], ARRAY['off_label']::text[],
    0.800, 'On-demand option after hormone causes addressed.',
    ARRAY['uncontrolled_hypertension', 'cardiovascular_disease']::text[]
  ),
  (
    'thyroid-optimization', 'thyroid_levothyroxine', 'Levothyroxine (hypothyroidism)',
    'FDA_APPROVED', true, ARRAY['foundation-wellness']::text[], ARRAY['general_medical_treatment']::text[],
    1.000, 'Standard LT4 replacement when hypothyroid pattern confirmed.',
    ARRAY['untreated_adrenal_insufficiency', 'thyrotoxicosis']::text[]
  ),
  (
    'thyroid-optimization', 'thyroid_lt4_lt3_ndt', 'LT4/LT3 or NDT (compounded thyroid)',
    'COMPOUNDABLE_503A', true, ARRAY['foundation-wellness']::text[], ARRAY['off_label']::text[],
    0.750, 'Compounded options only when patient intolerant of standard LT4 and physician documents rationale.',
    ARRAY['cardiac_caution', 'elderly_caution']::text[]
  ),
  (
    'anemia-iron', 'anemia_oral_iron', 'Oral iron repletion',
    'FDA_APPROVED', true, ARRAY['foundation-wellness']::text[], ARRAY['general_medical_treatment']::text[],
    1.000, 'First-line when iron deficiency confirmed and GI tolerance expected.',
    ARRAY['hemochromatosis', 'active_gi_bleed']::text[]
  ),
  (
    'anemia-iron', 'anemia_iv_iron', 'IV iron repletion',
    'FDA_APPROVED', true, ARRAY['foundation-wellness']::text[], ARRAY['general_medical_treatment']::text[],
    0.900, 'When oral iron failed or malabsorption documented.',
    ARRAY['hemochromatosis', 'active_gi_bleed']::text[]
  ),
  (
    'anemia-iron', 'anemia_b12', 'B12 repletion (macrocytic / deficiency)',
    'FDA_APPROVED', true, ARRAY['foundation-wellness']::text[], ARRAY['general_medical_treatment']::text[],
    0.850, 'When B12 low on foundational panel.',
    ARRAY[]::text[]
  ),
  (
    'aesthetics', 'aesthetic_neuromodulator', 'Neuromodulator (Botox-class)',
    'FDA_APPROVED', false, ARRAY[]::text[], ARRAY['general_medical_treatment']::text[],
    1.000, 'Cosmetic neuromodulator when procedure prerequisites and injector contract on file.',
    ARRAY['active_infection', 'product_allergy', 'pregnancy_breastfeeding', 'neuromuscular_disorder']::text[]
  ),
  (
    'aesthetics', 'aesthetic_filler', 'Dermal filler',
    'FDA_APPROVED', false, ARRAY[]::text[], ARRAY['general_medical_treatment']::text[],
    0.900, 'Volume restoration when no active infection or allergy to product class.',
    ARRAY['active_infection', 'product_allergy', 'pregnancy_breastfeeding']::text[]
  ),
  (
    'iv-hydration-only', 'iv_standing_menu', 'IV Lounge standing menu (Myers, NAD+, pushes)',
    'FDA_APPROVED', false, ARRAY[]::text[], ARRAY['general_medical_treatment']::text[],
    1.000, 'Walk-in IV services gated by evaluate-iv-screening hard blocks and warnings.',
    ARRAY['chf', 'esrd', 'pregnancy', 'anaphylaxis_history', 'g6pd_high_dose_vitc']::text[]
  )
) AS v(
  pathway_slug, candidate_key, display_name, regulatory_status,
  requires_labs, required_lab_slugs, required_consent_types,
  rank_weight, clinical_rationale, contraindication_tags
) ON p.slug = v.pathway_slug
ON CONFLICT (candidate_key) DO NOTHING;

COMMIT;
