# Phase 2 Fix — Retatrutide / Ketamine CDS Alignment

Date: 2026-07-01  
Expanded audit: 2026-07-01 (therapy truth-source pass)

## What changed

- Retatrutide was removed from the CDS engine-level hard exclusion list.
- Ketamine remains engine-level excluded.
- CDS tests were updated to confirm that retatrutide is not hard-blocked by the engine.
- Metabolic recomposition seed language was updated so retatrutide is described as physician-selected and protocol-gated, not engine-blocked.
- The explicit `policy_retatrutide_ala_carte` seed remains excluded because retatrutide should not be offered à la carte.
- Added `src/lib/therapyCatalog.ts` as the canonical therapy availability truth source.
- Stale migration header comment corrected (ketamine-only engine block).
- `docs/CLINIC_OPERATING_RUNBOOK.md` retatrutide line updated (GLP-1 lane, not retired ELEVATED METABOLIC anchor).
- Retatrutide `clinical_status` set to `active` in `clinicalOptimizationCatalog.ts` (still `provider_only` public).

## Files changed

- `supabase/functions/_shared/cds-engine.ts`
- `src/lib/cdsEngine.test.ts`
- `src/lib/canOfferTherapy.test.ts`
- `src/lib/therapyCatalog.ts` (new)
- `src/lib/therapyCatalog.test.ts` (new)
- `src/lib/clinicalOptimizationCatalog.ts`
- `supabase/migrations/20260616180000_cds_pathway_production_seed.sql`
- `supabase/migrations/20260616200000_cds_production_candidates_seed.sql`
- `docs/CLINIC_OPERATING_RUNBOOK.md`

## Verification checklist

| Requirement | Status |
|-------------|--------|
| Ketamine excluded patient-facing | Pass — redirects, inactive catalog, engine block |
| Retatrutide NOT engine-hard-blocked | Pass — cds-engine + tests |
| Retatrutide provider-gated | Pass — provider_only, GLP-1 consent, staff guardrails |
| BPC-157 / TB-500 available provider-reviewed | Pass — public storefront + Stripe fills |
| No patient pages say active peptides "not offered" | Pass — PeptideTherapy uses consult-gated language |

## Remaining risks

- Static HTML/PDF staff downloads under `public/downloads/` and `docs/clinical/` are generated artifacts — source is TypeScript export scripts; regenerate when staff materials next ship.
- Live DB `cds_candidates` seed copy differs from repo if forward migration not applied.
- `docs/business_case_operations_brief_2026-06-24.md` contains historical notes — not patient-facing.

## Notes

- I reviewed the previously flagged `elevated_hrt` issue and did not find an actual duplicate `slug` property for that catalog item in `src/lib/clinicalOptimizationCatalog.ts`.
