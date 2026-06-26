-- Complete inventory_skus with all clinic-offered medications (2026-06-26).
-- Prior seed (~33 rows) covered protocol starters + supplies only.
-- Adds recovery/metabolic/sexual/hair/peptide SKUs aligned with vendorRouting.ts + stripeConfig.ts.
-- Injectable cypionate TRT SKUs deactivated (cream-only men's TRT per 20260625140000).

BEGIN;

ALTER TABLE public.inventory_skus DROP CONSTRAINT IF EXISTS inventory_skus_vendor_check;

ALTER TABLE public.inventory_skus ADD CONSTRAINT inventory_skus_vendor_check CHECK (
  vendor IN (
    'fcc',
    'henry_schein',
    'empower',
    'stericycle',
    'gc',
    'custom_pharmacy_evans',
    'other'
  )
);

-- Men's testosterone cream (lead TRT product — injectable cyp discontinued)
INSERT INTO public.inventory_skus (
  sku_code, fcc_catalog_sku, display_name, category,
  default_unit, default_quantity_per_unit,
  reorder_threshold, reorder_target,
  vendor, is_controlled_substance, controlled_schedule
) VALUES
  ('TEST-CREAM-MEN-30G', NULL,
   'Testosterone topical cream (men''s dose), 30g UnoDose', 'compounded_medication',
   'tube', 30, 6, 24, 'custom_pharmacy_evans', false, NULL),

  -- Recovery peptides (GC primary; FCC backup where noted)
  ('BPC-157-10MG-03ML', NULL,
   'BPC-157 Injection 10mg lyophilized vial (GC/PATH)', 'peptide',
   'vial', 3, 3, 12, 'gc', false, NULL),
  ('CJC-IPAM-10-10MG-03ML', NULL,
   'CJC-1295 / Ipamorelin blend 10mg/10mg vial (GC)', 'peptide',
   'vial', 3, 3, 12, 'gc', false, NULL),

  -- Growth / metabolic peptides
  ('TESAMORELIN-5MG-6ML', '2897',
   'Tesamorelin 5mg/mL, 6mL vial', 'peptide',
   'vial', 6, 3, 12, 'gc', false, NULL),
  ('SS-31-16MG-5ML', '3811',
   'SS-31 (Elamipretide) 16mg/mL, 5mL vial', 'peptide',
   'vial', 5, 2, 8, 'gc', false, NULL),
  ('AOD-9604-0.5MG-3ML', '3557',
   'AOD-9604 acetate injectable vial (verify strength with pharmacy)', 'peptide',
   'vial', 3, 2, 8, 'gc', false, NULL),
  ('SLU-PP-332-CAPS-30', '3819',
   'SLU-PP-332 capsules, 30 count', 'peptide',
   'bottle', 30, 2, 8, 'gc', false, NULL),
  ('5-AMINO-1MQ-CAPS-30', '3130',
   '5-Amino-1MQ capsules, 30 count', 'peptide',
   'bottle', 30, 2, 8, 'gc', false, NULL),
  ('SELANK-NASAL-6ML', '3675',
   'Selank acetate nasal spray 7.5mg/mL, 6mL', 'peptide',
   'bottle', 6, 2, 8, 'fcc', false, NULL),

  -- Topical / aesthetic
  ('GHK-CU-TOPICAL-30G', '3763',
   'GHK-Cu topical solution 0.25%, 30mL', 'compounded_medication',
   'bottle', 30, 4, 16, 'fcc', false, NULL),
  ('GHK-CU-SCALP-60ML', '3764',
   'GHK-Cu scalp therapy solution 0.25%, 60mL', 'compounded_medication',
   'bottle', 60, 3, 12, 'fcc', false, NULL),

  -- Sexual wellness
  ('TADALAFIL-TROCHE-30', NULL,
   'Tadalafil sublingual troches, 30 count (Empower/FCC per script)', 'compounded_medication',
   'pack', 30, 4, 16, 'empower', false, NULL),
  ('SILDENAFIL-TROCHE-30', NULL,
   'Sildenafil sublingual troches, 30 count (Empower/FCC per script)', 'compounded_medication',
   'pack', 30, 4, 16, 'empower', false, NULL),
  ('OXYTOCIN-NASAL-15ML', '3076',
   'Oxytocin nasal spray 100IU/0.1mL, 15mL bottle', 'compounded_medication',
   'bottle', 15, 3, 12, 'fcc', false, NULL),

  -- Hair restoration
  ('MINOX-FIN-CAPS-30', '3617',
   'Minoxidil + Finasteride vegetable capsules, 30 count', 'compounded_medication',
   'bottle', 30, 4, 16, 'fcc', false, NULL),
  ('DUTASTERIDE-CAPS-30', NULL,
   'Dutasteride capsules, 30 count (Empower backup)', 'compounded_medication',
   'bottle', 30, 3, 12, 'empower', false, NULL),

  -- Gated investigational (provider-selected only — inventory for FEFO if clinic stocks)
  ('RETATRUTIDE-20MG-3ML', '2484',
   'Retatrutide injection — GATED provider-only (investigational)', 'compounded_medication',
   'vial', 3, 0, 2, 'gc', false, NULL)
ON CONFLICT (sku_code) DO UPDATE
  SET fcc_catalog_sku           = EXCLUDED.fcc_catalog_sku,
      display_name              = EXCLUDED.display_name,
      category                  = EXCLUDED.category,
      default_unit              = EXCLUDED.default_unit,
      default_quantity_per_unit = EXCLUDED.default_quantity_per_unit,
      reorder_threshold         = EXCLUDED.reorder_threshold,
      reorder_target            = EXCLUDED.reorder_target,
      vendor                    = EXCLUDED.vendor,
      is_controlled_substance   = EXCLUDED.is_controlled_substance,
      controlled_schedule       = EXCLUDED.controlled_schedule,
      is_active                 = true,
      updated_at                = now();

-- Injectable cypionate TRT — no longer offered (cream only)
UPDATE public.inventory_skus
SET is_active = false,
    updated_at = now()
WHERE sku_code IN ('TEST-CYP-100-5ML', 'TEST-CYP-200-5ML', 'TEST-CYP-200-1ML');

-- Link new peptide rows into clinic_formulary where item codes exist
INSERT INTO public.clinic_formulary (
  item_code, inventory_sku_id, display_name, category, dose_strength,
  supplier, supplier_sku, tracks_inventory, sort_order, internal_notes
)
SELECT
  v.item_code,
  s.id,
  s.display_name,
  v.category,
  v.dose_strength,
  v.supplier,
  s.fcc_catalog_sku,
  true,
  v.sort_order,
  v.internal_notes
FROM (VALUES
  ('PEPTIDE-BPC157', 'BPC-157-10MG-03ML', 'peptide', '10mg lyophilized vial', 'gc', 360, 'Recovery peptide — GC/PATH primary'),
  ('PEPTIDE-CJC-IPAM', 'CJC-IPAM-10-10MG-03ML', 'peptide', 'CJC/Ipamorelin blend vial', 'gc', 351, 'Research peptide consent'),
  ('PEPTIDE-TESAMORELIN', 'TESAMORELIN-5MG-6ML', 'peptide', '5mg/mL, 6mL vial', 'gc', 352, NULL),
  ('PEPTIDE-SS31', 'SS-31-16MG-5ML', 'peptide', '16mg/mL, 5mL vial', 'gc', 354, 'Provider-only metabolic'),
  ('PEPTIDE-AOD9604', 'AOD-9604-0.5MG-3ML', 'peptide', 'Provider-directed vial', 'gc', 355, NULL),
  ('PEPTIDE-SLU-PP332', 'SLU-PP-332-CAPS-30', 'peptide', '30 capsules', 'gc', 356, NULL),
  ('PEPTIDE-5AMINO1MQ', '5-AMINO-1MQ-CAPS-30', 'peptide', '30 capsules', 'gc', 357, NULL),
  ('HORM-TEST-CREAM-MEN', 'TEST-CREAM-MEN-30G', 'hormone', 'Men''s transdermal cream, 30g', 'custom_pharmacy_evans', 120, 'Lead men''s TRT product')
) AS v(item_code, sku_code, category, dose_strength, supplier, sort_order, internal_notes)
JOIN public.inventory_skus s ON s.sku_code = v.sku_code
ON CONFLICT (item_code) DO UPDATE SET
  inventory_sku_id = EXCLUDED.inventory_sku_id,
  tracks_inventory = true,
  dose_strength = COALESCE(EXCLUDED.dose_strength, clinic_formulary.dose_strength),
  updated_at = now();

COMMIT;
