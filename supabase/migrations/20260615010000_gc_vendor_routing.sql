-- GC Scientific vendor routing + formulary economics columns (2026-06-15).
-- Peptide partner: GC network. Hormones: Custom Pharmacy of Evans. IV/core: FCC.

-- ============================================================================
-- 1. Expand clinic_formulary.supplier enum
-- ============================================================================

ALTER TABLE public.clinic_formulary DROP CONSTRAINT IF EXISTS clinic_formulary_supplier_check;

ALTER TABLE public.clinic_formulary ADD CONSTRAINT clinic_formulary_supplier_check CHECK (
  supplier IN (
    'gc',
    'fcc',
    'custom_pharmacy_evans',
    'drfirst',
    'henry_schein',
    'empower',
    'stericycle',
    'labcorp',
    'other'
  )
);

-- ============================================================================
-- 2. Economics / routing columns
-- ============================================================================

ALTER TABLE public.clinic_formulary
  ADD COLUMN IF NOT EXISTS fulfillment_pharmacy_slug text,
  ADD COLUMN IF NOT EXISTS alternate_supplier text,
  ADD COLUMN IF NOT EXISTS alternate_supplier_cost_cents integer
    CHECK (alternate_supplier_cost_cents IS NULL OR alternate_supplier_cost_cents >= 0);

COMMENT ON COLUMN public.clinic_formulary.fulfillment_pharmacy_slug IS
  'Pharmacies.slug for Rx routing (gc-scientific-network, fcc, custom-pharmacy-evans).';
COMMENT ON COLUMN public.clinic_formulary.alternate_supplier IS
  'Secondary vendor for COGS comparison (e.g. fcc when primary is gc).';
COMMENT ON COLUMN public.clinic_formulary.alternate_supplier_cost_cents IS
  'Wholesale cents from alternate_supplier for margin analysis.';

-- ============================================================================
-- 3. GC Scientific partner pharmacy (peptide network)
-- ============================================================================

INSERT INTO public.pharmacies (
  slug, name, display_name, fulfillment_method,
  portal_url, phone_number,
  address, city, state, zip,
  default_for_categories, sort_order, notes
) VALUES (
  'gc-scientific-network',
  'GC Scientific Partner Network',
  'GC Partner 503A',
  'online_portal',
  'https://gcscientific.com/',
  NULL,
  'Via GC Scientific account manager',
  'Evans',
  'GA',
  '30809',
  ARRAY['peptide_stack', 'metabolic_peptide', 'advanced_peptide', 'glp1_retatrutide'],
  15,
  'Peptide sourcing via GC Scientific vetted 503A network. Confirm fulfilling pharmacy name + COA on each batch. Not for hormones or IV.'
)
ON CONFLICT (slug) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  default_for_categories = EXCLUDED.default_for_categories,
  notes = EXCLUDED.notes,
  updated_at = now();

-- ============================================================================
-- 4. Sync metabolic stack + GC-routed peptide COGS (mirrors src/lib/vendorRouting.ts)
-- ============================================================================

UPDATE public.clinic_formulary SET
  supplier = 'gc',
  supplier_cost_cents = 74800,
  supplier_cost_unit = 'month',
  alternate_supplier = 'fcc',
  alternate_supplier_cost_cents = 117900,
  fulfillment_pharmacy_slug = 'gc-scientific-network',
  internal_notes = 'Primary COGS via GC network (phased avg). Alternate = FCC full-capacity model.',
  updated_at = now()
WHERE item_code = 'STACK-METABOLIC-FULL';

UPDATE public.clinic_formulary SET
  supplier = 'gc',
  supplier_cost_cents = 25000,
  supplier_cost_unit = 'fill',
  alternate_supplier = 'fcc',
  alternate_supplier_cost_cents = 35000,
  fulfillment_pharmacy_slug = 'gc-scientific-network',
  supplier_sku = 'GLP1-R-20',
  updated_at = now()
WHERE item_code = 'PEPTIDE-RETATRUTIDE';

UPDATE public.clinic_formulary SET
  supplier = 'gc',
  supplier_cost_cents = 4500,
  supplier_cost_unit = 'vial',
  alternate_supplier = 'fcc',
  alternate_supplier_cost_cents = 18500,
  fulfillment_pharmacy_slug = 'gc-scientific-network',
  supplier_sku = 'SS-31-50',
  updated_at = now()
WHERE item_code = 'PEPTIDE-SS31';

UPDATE public.clinic_formulary SET
  supplier = 'gc',
  supplier_cost_cents = 6500,
  supplier_cost_unit = 'vial',
  alternate_supplier = 'fcc',
  alternate_supplier_cost_cents = 32500,
  fulfillment_pharmacy_slug = 'gc-scientific-network',
  updated_at = now()
WHERE item_code = 'PEPTIDE-TESAMORELIN';

INSERT INTO public.clinic_formulary (
  item_code, display_name, category, dose_strength, dose_notes,
  supplier, supplier_sku, supplier_cost_cents, supplier_cost_unit,
  client_price_cents, billing_unit, tracks_inventory, sort_order,
  fulfillment_pharmacy_slug, alternate_supplier, alternate_supplier_cost_cents,
  internal_notes, is_active
) VALUES (
  'PEPTIDE-TESAMORELIN',
  'Tesamorelin',
  'peptide',
  '10 mg vial (GC) / 30 mg (FCC)',
  'Phase 3 metabolic stack — GH optimization',
  'gc',
  'TES-10',
  6500,
  'vial',
  39900,
  'month',
  false,
  409,
  'gc-scientific-network',
  'fcc',
  32500,
  'GC primary when on metabolic stack; FCC for à la carte legacy rows.',
  true
)
ON CONFLICT (item_code) DO NOTHING;

UPDATE public.clinic_formulary SET
  supplier = 'gc',
  supplier_cost_cents = 5500,
  supplier_cost_unit = 'vial',
  alternate_supplier = 'fcc',
  alternate_supplier_cost_cents = 9000,
  fulfillment_pharmacy_slug = 'gc-scientific-network',
  updated_at = now()
WHERE item_code = 'PEPTIDE-CJC-IPAM';

INSERT INTO public.clinic_formulary (
  item_code, display_name, category, dose_strength,
  supplier, supplier_sku, supplier_cost_cents, supplier_cost_unit,
  client_price_cents, billing_unit, tracks_inventory, sort_order,
  fulfillment_pharmacy_slug, alternate_supplier, alternate_supplier_cost_cents,
  is_active
) VALUES (
  'PEPTIDE-MOTSC',
  'MOTS-c',
  'peptide',
  '10 mg vial',
  'gc',
  'MOTS-c-10',
  5200,
  'vial',
  NULL,
  'vial',
  false,
  415,
  'gc-scientific-network',
  NULL,
  NULL,
  true
)
ON CONFLICT (item_code) DO UPDATE SET
  supplier = EXCLUDED.supplier,
  supplier_cost_cents = EXCLUDED.supplier_cost_cents,
  fulfillment_pharmacy_slug = EXCLUDED.fulfillment_pharmacy_slug,
  updated_at = now();

-- FCC-primary lines: set alternate GC cost where relevant
UPDATE public.clinic_formulary SET
  alternate_supplier = 'gc',
  alternate_supplier_cost_cents = 8500,
  fulfillment_pharmacy_slug = 'fcc',
  updated_at = now()
WHERE item_code = 'PEPTIDE-NAD-INJ';

UPDATE public.clinic_formulary SET
  fulfillment_pharmacy_slug = 'fcc',
  updated_at = now()
WHERE item_code IN ('PEPTIDE-AOD9604', 'PEPTIDE-SLU-PP332', 'PEPTIDE-5AMINO1MQ', 'PEPTIDE-SERMORELIN');

-- Hormone routing defaults
INSERT INTO public.clinic_formulary (
  item_code, display_name, category, dose_strength, dose_notes,
  supplier, supplier_cost_cents, supplier_cost_unit,
  client_price_cents, billing_unit, tracks_inventory, sort_order,
  fulfillment_pharmacy_slug, internal_notes, is_active
) VALUES
  (
    'HORM-BI-EST-CREAM',
    'Bi-Est cream (EHA Standard BHRT)',
    'hormone',
    '80:20 or 50:50',
    'Default estrogen delivery — Custom Pharmacy of Evans',
    'custom_pharmacy_evans',
    2700,
    '30g',
    NULL,
    'month',
    false,
    500,
    'custom-pharmacy-evans',
    'Included in ELEVATED HRT. Public default.',
    true
  ),
  (
    'HORM-PROG-CAPS',
    'Progesterone capsules oral micronized',
    'hormone',
    '100–200 mg',
    'Bedtime — default, not progesterone cream',
    'custom_pharmacy_evans',
    3500,
    '30 caps',
    NULL,
    'month',
    false,
    501,
    'custom-pharmacy-evans',
    'Included in ELEVATED HRT when prescribed.',
    true
  ),
  (
    'HORM-TEST-CYP',
    'Testosterone cypionate injectable (EHA Standard TRT)',
    'hormone',
    '200 mg/mL',
    'Weekly IM or subQ — men default',
    'custom_pharmacy_evans',
    4200,
    '10mL vial',
    NULL,
    'month',
    false,
    502,
    'custom-pharmacy-evans',
    'Included in ELEVATED TRT. FCC backup SKU 3804.',
    true
  )
ON CONFLICT (item_code) DO UPDATE SET
  supplier = EXCLUDED.supplier,
  supplier_cost_cents = EXCLUDED.supplier_cost_cents,
  fulfillment_pharmacy_slug = EXCLUDED.fulfillment_pharmacy_slug,
  internal_notes = EXCLUDED.internal_notes,
  updated_at = now();
