-- ELEVATED Metabolic Recomposition Stack — formulary + clinical protocol (draft).
-- Policy override 2026-06-14: retatrutide offered publicly (Dr. Troy Akers).

-- ============================================================================
-- 1. clinic_formulary — stack bundle + line items
-- ============================================================================

INSERT INTO public.clinic_formulary (
  item_code, display_name, category, dose_strength, dose_notes,
  supplier, supplier_sku, supplier_cost_cents, supplier_cost_unit,
  client_price_cents, client_price_member_cents, billing_unit,
  tracks_inventory, sort_order, internal_notes
) VALUES
  (
    'STACK-METABOLIC-FULL',
    'ELEVATED Metabolic Recomposition Stack (90-day phased)',
    'peptide_stack',
    'Phased: retatrutide → SS-31/NAD+ → CJC/Tesamorelin → optional B-tier',
    'Named bundle $1,199/mo. Stripe: STRIPE_METABOLIC_STACK_PRICE_ID when live.',
    'fcc',
    NULL,
    117900,
    'month',
    119900,
    119900,
    'month',
    false,
    280,
    'Wholesale est. at full capacity; phased start lowers early-month COGS. Policy override 2026-06-14.'
  ),
  (
    'PEPTIDE-RETATRUTIDE',
    'Compounded Retatrutide',
    'glp1',
    '10–24 mg/mL per FCC vial',
    'Triple agonist anchor. GLP-1 class consent required.',
    'fcc',
    '2484',
    35000,
    'vial',
    44900,
    0,
    'fill',
    true,
    410,
    'Included in STACK-METABOLIC-FULL for enrolled patients'
  ),
  (
    'PEPTIDE-SS31',
    'SS-31 (Elamipretide)',
    'peptide',
    '16 mg/mL, 5 mL vial',
    'Mitochondrial support — Phase 2',
    'fcc',
    '3811',
    18500,
    'vial',
    24900,
    19900,
    'month',
    false,
    411,
    NULL
  ),
  (
    'PEPTIDE-AOD9604',
    'AOD-9604 Rapid Dissolve',
    'peptide',
    '0.5 mg RDT × 30',
    'Optional Phase 4 adjunct',
    'fcc',
    '3557',
    9000,
    'month',
    12900,
    10300,
    'month',
    false,
    412,
    NULL
  ),
  (
    'PEPTIDE-SLU-PP332',
    'SLU-PP-332 Capsules',
    'peptide',
    '250 mcg × 60',
    'Experimental ERR agonist — Phase 4 optional',
    'fcc',
    '3819',
    6000,
    'month',
    9900,
    7900,
    'month',
    false,
    413,
    NULL
  ),
  (
    'PEPTIDE-5AMINO1MQ',
    '5-Amino-1MQ Capsules',
    'peptide',
    'Per FCC catalog',
    'NNMT inhibitor — Phase 4 optional',
    'fcc',
    '3129',
    7900,
    'month',
    11900,
    9500,
    'month',
    false,
    414,
    NULL
  )
ON CONFLICT (item_code) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  dose_notes = EXCLUDED.dose_notes,
  supplier_cost_cents = EXCLUDED.supplier_cost_cents,
  client_price_cents = EXCLUDED.client_price_cents,
  client_price_member_cents = EXCLUDED.client_price_member_cents,
  internal_notes = EXCLUDED.internal_notes,
  updated_at = now();

-- ============================================================================
-- 2. clinical_protocol — metabolic-recomposition-stack-90d (draft)
-- ============================================================================

DO $proto$
DECLARE
  _protocol_id uuid;
  _version_id uuid;
BEGIN
  INSERT INTO public.clinical_protocols (slug, title, category, service_type, is_active)
  VALUES (
    'metabolic-recomposition-stack-90d',
    'ELEVATED Metabolic Recomposition Stack (90-Day Phased)',
    'weight_loss',
    ARRAY['weight_loss', 'peptide']::text[],
    true
  )
  ON CONFLICT (slug) DO UPDATE
    SET title = EXCLUDED.title,
        category = EXCLUDED.category,
        service_type = EXCLUDED.service_type,
        is_active = EXCLUDED.is_active,
        updated_at = now()
  RETURNING id INTO _protocol_id;

  IF (SELECT current_version_id FROM public.clinical_protocols WHERE id = _protocol_id) IS NULL THEN
    INSERT INTO public.clinical_protocol_versions (
      protocol_id, version_number, status, body_markdown, body_structured, notes_for_reviewer, authored_by
    ) VALUES (
      _protocol_id,
      1,
      'draft',
      $md$# ELEVATED Metabolic Recomposition Stack (90 days)

## Overview

Phased fat-loss protocol combining triple-agonist GLP therapy, mitochondrial support, growth-hormone optimization, and optional research adjuncts. Physician-supervised; all phases require documented tolerance before escalation.

## Phase 1 — Anchor (weeks 1–8)

**Retatrutide** subQ weekly. Start **0.5 mg** week 1. Titrate by 0.5 mg increments every 2–4 weeks based on GI tolerance, glucose, and weight trend. Typical maintenance **3–4 mg/week** (max per individual response).

## Phase 2 — Mitochondrial (weeks 2–8, after retatrutide tolerated)

- **SS-31:** 5 mg subQ daily → maintenance per tolerance
- **NAD+ injection:** per Vitality protocol dosing

## Phase 3 — Lean mass / visceral fat (weeks 8–12)

- **CJC-1295 / Ipamorelin:** combined subQ before bed, 5 nights/week
- **Tesamorelin:** 0.5–1 mg subQ before bed, 5 nights/week (off-label consent)

## Phase 4 — Optional adjuncts (week 8+, physician-directed)

- AOD-9604, SLU-PP-332, 5-Amino-1MQ as clinically indicated

## Baseline labs

Weight Optimization panel + Expanded Panel ($345 + $299 non-member). Quarterly Expanded Panel included in program.

## Monitoring

Weekly weight; BP PRN; CMP week 4; IGF-1 when on GH peptides; MTC/MEN2 screening per GLP-1 standard.

## Contraindications

MTC/MEN2, pregnancy, Type 1 DM without co-management, active eating disorder, uncontrolled psychiatric instability.$md$,
      $js${
        "indication": "Medically supervised 90-day metabolic recomposition with compounded retatrutide anchor.",
        "phases": [
          {"id": "anchor", "weeks": "1-8", "compounds": ["retatrutide"], "start_dose": "0.5 mg subQ weekly"},
          {"id": "mitochondria", "weeks": "2-8", "compounds": ["ss31", "nadInjection"]},
          {"id": "gh", "weeks": "8-12", "compounds": ["cjc1295Ipamorelin", "tesamorelin"]},
          {"id": "experimental", "weeks": "8+", "compounds": ["aod9604", "sluPp332", "fiveAmino1mq"], "optional": true}
        ],
        "contraindications": ["MTC or MEN2", "Pregnancy", "Type 1 DM without endocrine co-management"],
        "pre_administration_checks": ["BMI documentation", "Weight Optimization + Expanded baseline labs", "GLP-1 consent", "Research peptide consent for CJC", "Off-label tesamorelin consent"],
        "monitoring_during": ["Weight weekly", "GI tolerability", "BP", "Glucose if on secretagogues"],
        "monitoring_post": ["Quarterly Expanded Panel", "Week 12 Weight Optimization repeat"],
        "escalation_criteria": ["Severe abdominal pain", "Persistent vomiting", "Hypoglycemia symptoms"],
        "documentation_required": ["Phase progression note", "Pharmacy Rx coordination", "Consent bundle on file"]
      }$js$::jsonb,
      $nt$[
        {"note": "Retatrutide compounding policy override 2026-06-14 — confirm Dr. Akers signature before activating signed status", "resolved": false},
        {"note": "Confirm FCC retatrutide concentration (10 vs 24 mg/mL) maps to titration table", "resolved": false},
        {"note": "Stripe live price ID for STACK-METABOLIC-FULL — set STRIPE_METABOLIC_STACK_PRICE_ID in Supabase secrets", "resolved": false}
      ]$nt$::jsonb,
      NULL
    ) RETURNING id INTO _version_id;

    UPDATE public.clinical_protocols
      SET current_version_id = _version_id, updated_at = now()
      WHERE id = _protocol_id;
  END IF;
END $proto$;
