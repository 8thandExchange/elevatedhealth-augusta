-- 2026-06-25 leadership decisions + IV add-on COGS backfill.
--
-- 1. Deactivate SLU-PP-332 and AOD-9604 (not offered for now) in both the ops
--    formulary (clinic_formulary) and the clinical catalog (clinical_formulary_items).
-- 2. Backfill IV add-on supplier_cost_cents from the FCC Provider Catalog
--    (Fall/Winter V25). Per-dose cost = FCC vial price / doses-per-vial; doses
--    flagged as clinical estimates where the booster dose is not fixed.
--
-- NOTE: IV add-ons intentionally have NO fixed Stripe price IDs. The entire IV
-- lane (therapies + add-ons) charges via dynamic price_data in
-- create-iv-drip-checkout, using the `price` column. This is the established,
-- working pattern — no Stripe price objects are created here.
--
-- Internal cost / active-flag fields only. No client prices, Stripe IDs, RLS,
-- or routing changed. Idempotent.

BEGIN;

-- ===========================================================================
-- 1. Deactivate SLU-PP-332 and AOD-9604
-- ===========================================================================
UPDATE public.clinic_formulary SET is_active = false, updated_at = now()
  WHERE item_code IN ('PEPTIDE-SLU-PP332', 'PEPTIDE-AOD9604')
    AND is_active IS DISTINCT FROM false;

UPDATE public.clinical_formulary_items SET active = false, updated_at = now()
  WHERE slug IN ('slu-pp-332-provider-only', 'aod-9604')
    AND active IS DISTINCT FROM false;

-- ===========================================================================
-- 2. Backfill IV add-on COGS (FCC Provider Catalog Fall/Winter V25)
-- ===========================================================================

-- B12 Shot — FCC Methylcobalamin 1mg/mL 10mL $28 → 1mg (1mL) dose ≈ $2.80
UPDATE public.clinic_formulary
  SET supplier_cost_cents = 280, supplier_cost_unit = 'dose',
      internal_notes = 'FCC Methylcobalamin 1mg/mL $28/10mL; 1mg (1mL) dose = $2.80.'
  WHERE item_code = 'IV-ADDON-B12-SHOT';

-- Glutathione Push — FCC Glutathione 200mg/mL 10mL $33 → ~600mg (3mL) ≈ $9.90 (confirm dose)
UPDATE public.clinic_formulary
  SET supplier_cost_cents = 990, supplier_cost_unit = 'dose',
      internal_notes = 'FCC Glutathione 200mg/mL $33/10mL; ~600mg (3mL) push = $9.90. Confirm clinical push dose.'
  WHERE item_code = 'IV-ADDON-GLUTATHIONE-PUSH';

-- NAD+ Booster — FCC NAD+ 100mg/mL 10mL $70 → ~100mg (1mL) booster ≈ $7.00 (confirm dose)
UPDATE public.clinic_formulary
  SET supplier_cost_cents = 700, supplier_cost_unit = 'dose',
      internal_notes = 'FCC NAD+ 100mg/mL $70/10mL; ~100mg (1mL) booster = $7.00. Confirm clinical booster dose.'
  WHERE item_code = 'IV-ADDON-NADPLUS-BOOSTER';

-- Toradol Push — ketorolac 30mg, commercial (NOT FCC); Henry Schein est. ≈ $2.50
UPDATE public.clinic_formulary
  SET supplier_cost_cents = 250, supplier_cost_unit = 'dose',
      internal_notes = 'Ketorolac 30mg — commercial drug (not FCC compound). Henry Schein est. $2.50.'
  WHERE item_code = 'IV-ADDON-TORADOL-PUSH';

-- Vitamin C Push — FCC Ascorbic Acid 500mg/mL 30mL $21 → ~1g (2mL) push ≈ $1.40
UPDATE public.clinic_formulary
  SET supplier_cost_cents = 140, supplier_cost_unit = 'dose',
      internal_notes = 'FCC Ascorbic Acid 500mg/mL $21/30mL; ~1g (2mL) push = $1.40.'
  WHERE item_code = 'IV-ADDON-VITAMIN-C-PUSH';

-- Zofran Push — ondansetron 4mg IV, commercial est. ≈ $1.50 (FCC carries oral tabs $1/tab)
UPDATE public.clinic_formulary
  SET supplier_cost_cents = 150, supplier_cost_unit = 'dose',
      internal_notes = 'Ondansetron 4mg IV — commercial est. $1.50. FCC lists oral tabs $10/10.'
  WHERE item_code = 'IV-ADDON-ZOFRAN-PUSH';

COMMIT;
