-- Backfill formulary COGS from the GC Compound Consulting Partner Catalog (05-23-26),
-- and document Empower Pharmacy (Patient-Specific Bill-Clinic catalog, 06-16-26) as the
-- backup vendor via alternate_supplier fields. INTERNAL COST FIELDS ONLY — this migration
-- does NOT touch client_price_cents, Stripe price IDs, RLS, or routing (primary supplier).
--
-- Idempotent: pure UPDATEs + one INSERT ... ON CONFLICT. Safe to re-run.
--
-- Catalog SKU citations are in inline comments. Costs are in cents.
-- GC = GC Compound Consulting (PATH lyophilized / STLKS 503A / KDX / GSTR).
-- Empower = Empower Pharmacy patient-specific bill-clinic.

BEGIN;

-- ===========================================================================
-- 1. clinic_formulary — GC-sourced peptide & GLP-1 costs corrected to catalog
-- ===========================================================================

-- SS-31 (Elamipretide) injectable — GC PATH SS31-10MG-03ML $50
UPDATE public.clinic_formulary SET supplier_cost_cents = 5000, supplier = 'gc'
  WHERE item_code = 'PEPTIDE-SS31';

-- Tesamorelin — GC PATH TESAMORELIN-10MG-03ML $72
UPDATE public.clinic_formulary SET supplier_cost_cents = 7200, supplier = 'gc'
  WHERE item_code = 'PEPTIDE-TESAMORELIN';

-- CJC-1295 / Ipamorelin blend — GC PATH BLND-CJC1295IPAMORELIN-10X10MG-03ML $79
UPDATE public.clinic_formulary SET supplier_cost_cents = 7900, supplier = 'gc'
  WHERE item_code = 'PEPTIDE-CJC-IPAM';

-- MOTS-c — GC PATH MOTSC-10MG-03ML $60
UPDATE public.clinic_formulary SET supplier_cost_cents = 6000, supplier = 'gc'
  WHERE item_code = 'PEPTIDE-MOTSC';

-- NAD+ injection — GC PATH NAD+-1000MG-10ML $68
UPDATE public.clinic_formulary SET supplier_cost_cents = 6800, supplier = 'gc'
  WHERE item_code = 'PEPTIDE-NAD-INJ';

-- Sermorelin injection — GC PATH SERMORELIN-10MG-03ML $65
UPDATE public.clinic_formulary SET supplier_cost_cents = 6500, supplier = 'gc'
  WHERE item_code = 'PEPTIDE-SERMORELIN';

-- PT-141 — GC PATH PT141-10MG-03ML $49
UPDATE public.clinic_formulary SET supplier_cost_cents = 4900, supplier = 'gc'
  WHERE item_code = 'PEPTIDE-PT141';

-- Healing/Wolverine stack (BPC-157 + TB-500) — GC PATH BLND-WOLVERINE-BPC157TB500-10X10MG-03ML $94
UPDATE public.clinic_formulary SET supplier_cost_cents = 9400, supplier = 'gc'
  WHERE item_code = 'STACK-HEALING';

-- GLP-1 program fills — match to nearest GC/KDX catalog vial for the SKU size.
-- Semaglutide 2.5mg/mL 3mL = 7.5mg → KDX Semaglutide 2.5mg/mL 3mL (7.5mg) $75
UPDATE public.clinic_formulary SET supplier_cost_cents = 7500
  WHERE item_code IN ('GLP1-SEMAG-2.5-3ML', 'SEMAG-2.5-3ML');
-- Semaglutide 2.5mg/mL 6mL = 15mg → GC PATH SEMAGLUTIDE-15MG-03ML $128
UPDATE public.clinic_formulary SET supplier_cost_cents = 12800
  WHERE item_code = 'SEMAG-2.5-6ML';
-- Tirzepatide 12.5mg/mL 3mL = 37.5mg → STLKS Tirz/Niacinamide 40mg $185 (nearest purchasable unit)
UPDATE public.clinic_formulary SET supplier_cost_cents = 18500
  WHERE item_code IN ('GLP1-TIRZ-12.5-3ML', 'TIRZ-12.5-3ML');
-- Tirzepatide 12.5mg/mL 5mL = 62.5mg (≈ one month @ 15mg/wk) → STLKS Tirz/Niacinamide 60mg $240
UPDATE public.clinic_formulary SET supplier_cost_cents = 24000
  WHERE item_code = 'TIRZ-12.5-5ML';

-- ===========================================================================
-- 2. clinic_formulary — Empower documented as backup (alternate_supplier) on
--    the items Empower actually carries (hormones/creams). Empower does NOT
--    carry research/recovery/metabolic peptides, so none are added there.
-- ===========================================================================

-- Bi-Est cream — Empower "Bi-Est Cream (Estriol/Estradiol) 1-10mg/mL 30mL" $58.10
UPDATE public.clinic_formulary
  SET alternate_supplier = 'empower', alternate_supplier_cost_cents = 5810
  WHERE item_code = 'HORM-BI-EST-CREAM';

-- Progesterone — Empower "Progesterone 100mg capsule" $0.80/ea × 30 = $24.00
UPDATE public.clinic_formulary
  SET alternate_supplier = 'empower', alternate_supplier_cost_cents = 2400
  WHERE item_code = 'HORM-PROG-CAPS';

-- ===========================================================================
-- 3. clinic_formulary — ADD men's testosterone CREAM (the cream-based TRT
--    reality; injectable cypionate is no longer the standard). Cost benchmarked
--    to GC catalog (Testosterone Cream/Gel <200mg/gm $1.00/gm × 30g = $30);
--    confirm Custom Pharmacy of Evans local price. Empower alt $52.80 (30mL).
-- ===========================================================================
INSERT INTO public.clinic_formulary (
  item_code, display_name, category, supplier, supplier_cost_cents, supplier_cost_unit,
  alternate_supplier, alternate_supplier_cost_cents, fulfillment_pharmacy_slug,
  is_active, internal_notes
) VALUES (
  'HORM-TEST-CREAM-MEN',
  'Testosterone cream (men''s dose, EHA Standard TRT)',
  'hormone',
  'custom_pharmacy_evans',
  3000,
  '30g',
  'empower',
  5280,
  'custom-pharmacy-evans',
  true,
  'Cream-based men''s TRT (replaces injectable as standard). Cost benchmarked to GC Testosterone Cream/Gel <200mg/gm $1.00/gm x 30g = $30; confirm Custom Pharmacy of Evans local price. Empower alt: Testosterone Cream 1-20mg/mL 30mL $52.80.'
)
ON CONFLICT (item_code) DO UPDATE SET
  supplier_cost_cents = EXCLUDED.supplier_cost_cents,
  alternate_supplier = EXCLUDED.alternate_supplier,
  alternate_supplier_cost_cents = EXCLUDED.alternate_supplier_cost_cents,
  internal_notes = EXCLUDED.internal_notes,
  is_active = true;

-- Flag the injectable cypionate row as non-standard (kept for reference, not the default TRT).
UPDATE public.clinic_formulary
  SET internal_notes = 'Injectable cypionate — NOT the standard TRT (cream is standard, see HORM-TEST-CREAM-MEN). Kept for reference only.'
  WHERE item_code = 'HORM-TEST-CYP';

-- ===========================================================================
-- 4. clinical_formulary_items — backfill clinic_cost_cents (was NULL for
--    metabolic; corrected for recovery). Mirrors clinic_formulary form/cost so
--    margins are computed on the form we actually dispense (oral caps for the
--    metabolic peptides, not the GC injectable vial).
-- ===========================================================================

-- Recovery (GC PATH injectable 10mg = $66)
UPDATE public.clinical_formulary_items SET clinic_cost_cents = 6600 WHERE slug = 'bpc-157';
UPDATE public.clinical_formulary_items SET clinic_cost_cents = 6600 WHERE slug = 'tb-500';

-- Metabolic (dispensed as oral caps/RDT per clinic_formulary; NOT the GC injectable vial)
UPDATE public.clinical_formulary_items SET clinic_cost_cents = 5000 WHERE slug = 'ss-31-provider-only';     -- SS-31 inj 10mg $50
UPDATE public.clinical_formulary_items SET clinic_cost_cents = 7900 WHERE slug = '5-amino-1mq-provider-only'; -- 5-Amino-1MQ caps $79 (oral)
UPDATE public.clinical_formulary_items SET clinic_cost_cents = 9000 WHERE slug = 'aod-9604';                  -- AOD-9604 RDT $90 (oral)
UPDATE public.clinical_formulary_items SET clinic_cost_cents = 6000 WHERE slug = 'slu-pp-332-provider-only';  -- SLU-PP-332 caps $60 (oral)

COMMIT;
