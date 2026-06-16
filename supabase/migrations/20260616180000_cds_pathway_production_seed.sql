-- CDS Task 4: production pathway seed (goal → lab panel algorithm, Section 3 clinic guide)
-- All rows ship inactive until a prescriber sets signed_off_by and active=true.
-- Does NOT seed individual medication candidates — program/pathway routing only.

ALTER TABLE public.cds_pathways
  ADD COLUMN IF NOT EXISTS recommended_lab_slug text,
  ADD COLUMN IF NOT EXISTS elevated_program_key text,
  ADD COLUMN IF NOT EXISTS staff_redirect_notes text;

COMMENT ON COLUMN public.cds_pathways.recommended_lab_slug IS
  'Clinical lab_panels.slug for baseline draw (maps to Stripe comprehensive/expanded checkout).';
COMMENT ON COLUMN public.cds_pathways.elevated_program_key IS
  'ELEVATED program key when path enrolls in a program (stripeConfig), null for IV-only or wellness-first.';
COMMENT ON COLUMN public.cds_pathways.staff_redirect_notes IS
  'Staff training: safety redirects and lab-review stop flags for this goal.';

-- ---------------------------------------------------------------------------
-- Production pathway rows (is_sample=false, active=false until physician sign-off)
-- ---------------------------------------------------------------------------

INSERT INTO public.cds_pathways (
  slug, name, description, goal_key,
  recommended_lab_slug, elevated_program_key, staff_redirect_notes,
  active, is_sample
) VALUES
(
  'weight-loss-glp1',
  'Weight loss / GLP-1',
  'Lane B default for appetite and medical weight management.',
  'weight_loss',
  'weight-optimization',
  'glp1',
  'Redirect: diabetic-range A1c, abnormal TSH, liver/kidney abnormalities, pregnancy, MTC/MEN2 history, pancreatitis/gallbladder caution.',
  false, false
),
(
  'metabolic-recomposition',
  'Advanced metabolic recomposition',
  'ELEVATED METABOLIC RECOMPOSITION — program-only; requires signed metabolic protocol. CDS engine hard-blocks retatrutide at candidate level; enrollment is protocol-gated.',
  'metabolic_recomposition',
  'weight-optimization',
  'metabolicRecomposition',
  'Same GLP-1 safety gates plus peptide/regulatory gate and signed metabolic protocol requirement. Not à la carte.',
  false, false
),
(
  'low-testosterone-trt',
  'Low testosterone / men''s vitality',
  'Injectable-first TRT path per SOT; Custom Pharmacy of Evans primary.',
  'low_testosterone',
  'hormone-male',
  'trt',
  'Stop/refer: high prolactin, elevated PSA, hematocrit >54%, untreated severe OSA, uncontrolled HF, active fertility goals.',
  false, false
),
(
  'hormone-women-bhrt',
  'Perimenopause / BHRT',
  'Female hormone optimization path.',
  'hormone_women',
  'hormone-female',
  'hrt',
  'Stop/refer: unexplained bleeding, estrogen-sensitive cancer history, thromboembolic disease, pregnancy, abnormal thyroid/prolactin.',
  false, false
),
(
  'energy-fatigue-wellness',
  'Energy / fatigue / brain fog',
  'Wellness-first; redirect by labs to thyroid, anemia, metabolic, hormone, or sleep paths.',
  'energy_fatigue',
  'foundation-wellness',
  'wellness',
  'Review: thyroid, anemia, B12/folate/vitamin D, metabolic panel, hormones, sleep, inflammatory markers.',
  false, false
),
(
  'recovery-injury',
  'Recovery / injury',
  'Healing-oriented path; peptide stacks only when signed peptide policy allows.',
  'recovery_injury',
  'foundation-wellness',
  NULL,
  'Stop/refer: active/recent malignancy, abnormal CMP/CBC, regulatory tier conflict.',
  false, false
),
(
  'libido-sexual-wellness',
  'Libido / sexual wellness',
  'Sexual wellness or hormone path after labs.',
  'libido',
  'sexual-wellness',
  NULL,
  'Stop/refer: nitrates, uncontrolled BP, cardiac risk, high prolactin, abnormal testosterone/estradiol.',
  false, false
),
(
  'longevity-wellness',
  'Longevity / anti-aging',
  'General optimization with lab-directed redirects.',
  'longevity',
  'foundation-wellness',
  'wellness',
  'Any abnormal screen redirects to the appropriate clinical path before stack enrollment.',
  false, false
),
(
  'general-wellness',
  'General optimization',
  'Broad wellness assessment path.',
  'general_wellness',
  'foundation-wellness',
  'wellness',
  'Redirect abnormal findings to the appropriate specialty path.',
  false, false
),
(
  'iv-hydration-only',
  'IV hydration only',
  'Lane A — IV Lounge; no default lab panel. IV screening edge function is the gate.',
  'iv_only',
  NULL,
  NULL,
  'Route to /iv-lounge. Hard blocks: CHF, ESRD, pregnancy, anaphylaxis. G6PD for high-dose vitamin C services.',
  false, false
)
ON CONFLICT (slug) DO NOTHING;

-- Symptom mappings (staff chip keys → pathway)
INSERT INTO public.cds_pathway_symptoms (pathway_id, symptom_key, symptom_label, weight, is_sample)
SELECT p.id, v.symptom_key, v.symptom_label, v.weight, false
FROM public.cds_pathways p
JOIN (VALUES
  ('weight-loss-glp1', 'weight_gain', 'Weight gain / appetite', 2.0),
  ('metabolic-recomposition', 'weight_gain', 'Weight / body composition', 1.5),
  ('low-testosterone-trt', 'low_libido', 'Low libido / vitality', 1.0),
  ('energy-fatigue-wellness', 'fatigue', 'Fatigue', 2.0),
  ('energy-fatigue-wellness', 'brain_fog', 'Brain fog', 1.5),
  ('recovery-injury', 'joint_pain', 'Joint / tendon pain', 2.0),
  ('recovery-injury', 'poor_recovery', 'Poor recovery', 1.5),
  ('libido-sexual-wellness', 'low_libido', 'Low libido', 2.0)
) AS v(pathway_slug, symptom_key, symptom_label, weight) ON p.slug = v.pathway_slug
ON CONFLICT (pathway_id, symptom_key) DO NOTHING;

-- Lab review redirect markers (documentation + future canOfferTherapy hooks)
-- analyte_key uses LabCorp-style tokens; comparator/thresholds are staff-review hints.
INSERT INTO public.cds_pathway_lab_triggers (
  pathway_id, analyte_key, comparator, threshold_low, threshold_high, unit, is_sample
)
SELECT p.id, v.analyte_key, v.comparator, v.threshold_low, v.threshold_high, v.unit, false
FROM public.cds_pathways p
JOIN (VALUES
  ('low-testosterone-trt', 'prolactin', 'gt', 20::numeric, NULL::numeric, 'ng/mL'),
  ('low-testosterone-trt', 'hematocrit', 'gt', 54::numeric, NULL::numeric, '%'),
  ('low-testosterone-trt', 'psa', 'gt', 4::numeric, NULL::numeric, 'ng/mL'),
  ('weight-loss-glp1', 'hba1c', 'gt', 6.4::numeric, NULL::numeric, '%'),
  ('metabolic-recomposition', 'hba1c', 'gt', 6.4::numeric, NULL::numeric, '%'),
  ('energy-fatigue-wellness', 'tsh', 'gt', 4.5::numeric, NULL::numeric, 'mIU/L'),
  ('libido-sexual-wellness', 'prolactin', 'gt', 20::numeric, NULL::numeric, 'ng/mL')
) AS v(pathway_slug, analyte_key, comparator, threshold_low, threshold_high, unit)
  ON p.slug = v.pathway_slug
ON CONFLICT (pathway_id, analyte_key) DO NOTHING;

-- Panel slug markers (engine/UI reads recommended_lab_slug on pathway; these document required panel)
INSERT INTO public.cds_pathway_lab_triggers (
  pathway_id, analyte_key, comparator, unit, is_sample
)
SELECT p.id, 'required_panel_slug', 'eq', p.recommended_lab_slug, false
FROM public.cds_pathways p
WHERE p.recommended_lab_slug IS NOT NULL
  AND p.is_sample = false
ON CONFLICT (pathway_id, analyte_key) DO NOTHING;
