# Phase 2 Fix — Retatrutide / Ketamine CDS Alignment

Date: 2026-07-01

## What changed

- Retatrutide was removed from the CDS engine-level hard exclusion list.
- Ketamine remains engine-level excluded.
- CDS tests were updated to confirm that retatrutide is not hard-blocked by the engine.
- Metabolic recomposition seed language was updated so retatrutide is described as physician-selected and protocol-gated, not engine-blocked.
- The explicit `policy_retatrutide_ala_carte` seed remains excluded because retatrutide should not be offered à la carte.

## Files changed

- `supabase/functions/_shared/cds-engine.ts`
- `src/lib/cdsEngine.test.ts`
- `supabase/migrations/20260616180000_cds_pathway_production_seed.sql`
- `supabase/migrations/20260616200000_cds_production_candidates_seed.sql`

## Notes

- I reviewed the previously flagged `elevated_hrt` issue and did not find an actual duplicate `slug` property for that catalog item in `src/lib/clinicalOptimizationCatalog.ts`.
- I did not run the full test/build suite because the uploaded ZIP does not include `node_modules`, and this environment cannot install dependencies from the internet.
