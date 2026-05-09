-- ============================================================================
-- Seed inventory_skus with the items used by the 13 seeded clinical protocols
-- plus core IV-lounge and medical-supply consumables.
--
-- This is a starter catalog (~25 SKUs), NOT the full 51 "core stocked" list.
-- Reasons:
--   - The original Réveil-era 51-SKU spreadsheet is not present in this
--     codebase; only the FCC FormuConnect 2026 formulary (~190 items) lives
--     in src/lib/fccFormulary.ts.
--   - These 25 SKUs cover everything used by the 13 seeded clinical protocols
--     (TRT, BHRT, peptides, GLP-1s, IV essentials) plus standard medical
--     supplies (syringes, sharps, prep, IV start kits).
--
-- Follow-up: reconcile remaining catalog items against FCC + Henry Schein
-- order history once the clinic has been live long enough to know real volume
-- (see TODOs in supabase/functions/send-rx-fax/index.ts).
--
-- Each row is upserted by sku_code so this migration is safe to re-run.
-- fcc_catalog_sku is filled where the FCC SKU is unambiguous; multi-SKU and
-- VARY rows leave it null with a note in the upstream catalog file.
-- ============================================================================

BEGIN;

INSERT INTO public.inventory_skus (
  sku_code, fcc_catalog_sku, display_name, category,
  default_unit, default_quantity_per_unit,
  reorder_threshold, reorder_target,
  vendor, is_controlled_substance, controlled_schedule
) VALUES
  -- ───────── Compounded — Schedule III (testosterone) ─────────
  ('TEST-CYP-100-5ML',  '3801',  'Testosterone Cypionate (MCT) 100mg/mL, 5mL vial', 'compounded_medication',
   'vial', 5,  4, 16, 'fcc', true,  'III'),
  ('TEST-CYP-200-5ML',  '3804',  'Testosterone Cypionate (MCT) 200mg/mL, 5mL vial', 'compounded_medication',
   'vial', 5,  6, 24, 'fcc', true,  'III'),
  ('TEST-CYP-200-1ML',  '3532',  'Testosterone Cypionate (Grapeseed) 200mg/mL, 1mL vial', 'compounded_medication',
   'vial', 1,  4, 12, 'fcc', true,  'III'),

  -- ───────── Compounded — BHRT topicals ─────────
  ('BIEST-80-20-30G',   NULL,    'Bi-Est (E2/E3) 80:20 Topical Cream, 30g UnoDose',   'compounded_medication',
   'tube', 30, 5, 20, 'fcc', false, NULL),
  ('PROG-CREAM-100-30G', NULL,   'Progesterone 100mg/g Topical Cream, 30g UnoDose',    'compounded_medication',
   'tube', 30, 5, 20, 'fcc', false, NULL),
  ('TEST-CREAM-1-30G',  NULL,    'Testosterone 1mg/g Topical Cream (female dose), 30g UnoDose', 'compounded_medication',
   'tube', 30, 4, 16, 'fcc', false, NULL),

  -- ───────── Compounded — peptides ─────────
  ('SERMORELIN-1-6ML',     '2884', 'Sermorelin Acetate Injection 1mg/mL, 6mL vial',   'peptide',
   'vial', 6,  4, 16, 'fcc', false, NULL),
  ('PT141-2-10ML',         '3502', 'PT-141 (Bremelanotide) Injection 2mg/mL, 10mL vial', 'peptide',
   'vial', 10, 3, 12, 'fcc', false, NULL),
  ('PDA-CAP-500MCG-30',    '2901', 'Pentadeca Arginate (PDA) Capsules 500mcg, 30 caps', 'peptide',
   'bottle', 30, 4, 16, 'fcc', false, NULL),
  ('TB500-2.5-4ML',        '3812', 'Thymosin Beta-4 (TB-500) Injection 2.5mg/mL, 4mL vial — VERIFY FCC SUPPLY', 'peptide',
   'vial', 4,  2, 8,  'fcc', false, NULL),
  ('PDA-INJ-2-7.5ML',      '3511', 'Pentadeca Arginate Injection 2mg/mL, 7.5mL vial', 'peptide',
   'vial', 7.5, 3, 12, 'fcc', false, NULL),

  -- ───────── Compounded — GLP-1 weight loss ─────────
  ('SEMAG-2.5-3ML',        '2490', 'Semaglutide / B6 Injection 2.5mg/mL, 3mL vial',   'compounded_medication',
   'vial', 3,  6, 24, 'fcc', false, NULL),
  ('SEMAG-2.5-6ML',        '2493', 'Semaglutide / B6 Injection 2.5mg/mL, 6mL vial',   'compounded_medication',
   'vial', 6,  4, 16, 'fcc', false, NULL),
  ('TIRZ-12.5-3ML',        '2500', 'Tirzepatide / B6 Injection 12.5mg/mL, 3mL vial',  'compounded_medication',
   'vial', 3,  6, 24, 'fcc', false, NULL),
  ('TIRZ-12.5-5ML',        '2502', 'Tirzepatide / B6 Injection 12.5mg/mL, 5mL vial',  'compounded_medication',
   'vial', 5,  4, 16, 'fcc', false, NULL),

  -- ───────── Compounded — IV essentials ─────────
  ('GLUTA-200-10ML',       '2837', 'Glutathione Injection 200mg/mL, 10mL vial',       'compounded_medication',
   'vial', 10, 4, 16, 'fcc', false, NULL),
  ('NAD-100-10ML',         '3119', 'NAD+ Injection 100mg/mL, 10mL vial',              'compounded_medication',
   'vial', 10, 4, 16, 'fcc', false, NULL),
  ('NAD-200-10ML',         '3839', 'NAD+ Injection 200mg/mL, 10mL vial',              'compounded_medication',
   'vial', 10, 3, 12, 'fcc', false, NULL),
  ('METHYL-B12-1-10ML',    '2867', 'Methylcobalamin (B12) Injection 1mg/mL, 10mL vial', 'compounded_medication',
   'vial', 10, 3, 12, 'fcc', false, NULL),
  ('MAG-CL-200-30ML',      '3729', 'Magnesium Chloride IV Injection 200mg/mL, 30mL vial', 'compounded_medication',
   'vial', 30, 3, 12, 'fcc', false, NULL),
  ('MYERS-FULL-10ML',      '3735', 'Myers Cocktail (full) IV Injection, 10mL vial',   'compounded_medication',
   'vial', 10, 4, 16, 'fcc', false, NULL),

  -- ───────── IV supplies (Henry Schein) ─────────
  ('NS-250ML-BAG',         NULL, 'Normal Saline 0.9%, 250mL IV bag',                  'iv_supply',
   'bag', 250, 24, 96, 'henry_schein', false, NULL),
  ('NS-500ML-BAG',         NULL, 'Normal Saline 0.9%, 500mL IV bag',                  'iv_supply',
   'bag', 500, 12, 48, 'henry_schein', false, NULL),
  ('IV-START-KIT',         NULL, 'IV start kit (catheter, tegaderm, alcohol prep)',   'iv_supply',
   'kit', 1,  20, 80, 'henry_schein', false, NULL),
  ('SALINE-FLUSH-10ML',    NULL, 'Saline flush 10mL prefilled syringe',               'iv_supply',
   'syringe', 10, 30, 100, 'henry_schein', false, NULL),

  -- ───────── Medical supplies (Henry Schein) ─────────
  ('SYR-INSULIN-0.5-27G',  NULL, 'Insulin syringe 0.5mL / 27g (SubQ TRT, peptide self-admin)', 'medical_supply',
   'syringe', 1,  100, 500, 'henry_schein', false, NULL),
  ('SYR-INSULIN-1-27G',    NULL, 'Insulin syringe 1mL / 27g',                         'medical_supply',
   'syringe', 1,  100, 500, 'henry_schein', false, NULL),
  ('SYR-IM-3-22G',         NULL, 'IM syringe 3mL / 22g',                              'medical_supply',
   'syringe', 1,   60, 240, 'henry_schein', false, NULL),
  ('NDL-DRAW-18G',         NULL, 'Drawing needle 18g',                                'medical_supply',
   'needle', 1,  60, 240, 'henry_schein', false, NULL),
  ('PREP-ALC-PAD',         NULL, 'Alcohol prep pads (box of 200)',                    'consumable',
   'box', 200, 4, 16, 'henry_schein', false, NULL),
  ('GAUZE-2X2',            NULL, 'Gauze 2x2 (sleeve)',                                'consumable',
   'sleeve', 100, 4, 16, 'henry_schein', false, NULL),
  ('TEGADERM-2375',        NULL, 'Tegaderm transparent dressing (box of 100)',        'consumable',
   'box', 100, 2, 8,  'henry_schein', false, NULL),
  ('SHARPS-1QT',           NULL, 'Sharps container, 1 quart',                         'consumable',
   'each', 1,  4, 12, 'stericycle', false, NULL),
  ('SHARPS-2QT',           NULL, 'Sharps container, 2 quart',                         'consumable',
   'each', 1,  3, 8,  'stericycle', false, NULL)
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
      updated_at                = now();

-- Verification: counts by category and vendor
-- SELECT category, count(*) FROM public.inventory_skus GROUP BY category ORDER BY category;
-- SELECT vendor,   count(*) FROM public.inventory_skus GROUP BY vendor   ORDER BY vendor;
-- SELECT count(*) FILTER (WHERE is_controlled_substance) AS controlled,
--        count(*) FILTER (WHERE NOT is_controlled_substance) AS non_controlled
-- FROM public.inventory_skus;

COMMIT;
