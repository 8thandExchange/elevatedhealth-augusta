-- Remove standalone NAD+ as a sold product, keeping ONLY the $50 IV "NAD+ Booster"
-- add-on. Decision (2026-06-25, Dr. Akers): the IV-lounge NAD+ infusion ($450/$750)
-- and the standalone peptide NAD+ injection are discontinued to reduce menu
-- confusion. NAD+ remains available solely as the small IV booster push.
--
-- Scope of this migration (data only; sellable catalog + clinical SOPs):
--   1. Deactivate the IV NAD+ infusion clinical protocols (250mg / 500mg).
--   2. Deactivate the standalone peptide NAD+ injection sell-row.
--   3. Deactivate the legacy "Vitality" stacks, which bundle the now-removed
--      NAD+ subQ / NAD+ IV components (Vitality branding was already discontinued).
--
-- KEPT ACTIVE (intentionally):
--   - clinic_formulary IV-ADDON-NADPLUS-BOOSTER ($50 NAD+ Booster IV add-on)
--   - clinic_formulary NAD-100-10ML / NAD-200-10ML (compounded NAD+ supply vials
--     that fulfill the booster add-on)
--   - NAD+ references inside the clinical decision engine / dosing protocols remain
--     (provider-directed use is a separate clinical-governance decision).

-- 1. IV NAD+ infusion protocols (no longer a bookable infusion)
UPDATE public.clinical_protocols
SET is_active = false,
    updated_at = now()
WHERE slug IN ('iv-nad-250mg', 'iv-nad-500mg');

-- 2. Standalone peptide NAD+ injection — stop selling
UPDATE public.clinic_formulary
SET is_active = false,
    updated_at = now()
WHERE item_code = 'PEPTIDE-NAD-INJ';

-- 3. Legacy Vitality stacks (bundle the removed NAD+ subQ / NAD+ IV components)
UPDATE public.clinic_formulary
SET is_active = false,
    updated_at = now()
WHERE item_code IN ('STACK-VITALITY-SUBQ', 'STACK-VITALITY-IV');
