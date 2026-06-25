-- Discontinue injectable (cypionate) TRT as an offering.
--
-- Business/clinical decision (Dr. Akers, 2026-06-25): men's TRT is testosterone
-- CREAM only. Injectable cypionate is no longer offered. The cream offering
-- (HORM-TEST-CREAM-MEN) is already the active standard; here we deactivate the
-- injectable offering row so it stops surfacing as a sellable/quotable line.
--
-- NOTE: This deactivates the OFFERING only. The cypionate compounded-medication
-- inventory SKUs (TEST-CYP-*) are left intact as inventory definitions. The
-- clinical CDS protocol/provider-algorithm for injectable TRT
-- ('male-trt-initiation-compounded-cypionate') is NOT altered here — replacing it
-- with a cream protocol requires physician-specified cream dosing/titration and
-- should land in a dedicated clinical migration with sign-off.
--
-- Idempotent: re-running only re-asserts is_active = false on the offering row.

-- Deactivate the injectable TRT offering.
UPDATE public.clinic_formulary
SET is_active = false,
    internal_notes = 'Injectable cypionate TRT — DISCONTINUED 2026-06-25 (not offered). Men''s TRT is cream only, see HORM-TEST-CREAM-MEN. Row kept inactive for historical reference.',
    updated_at = now()
WHERE item_code = 'HORM-TEST-CYP';

-- Defensive: ensure the cream offering remains the active standard.
UPDATE public.clinic_formulary
SET is_active = true,
    updated_at = now()
WHERE item_code = 'HORM-TEST-CREAM-MEN';
