# Retatrutide Pricing Audit — Phase 2B

**Date:** 2026-07-01  
**Confirmed price:** **$499/mo** (gated, physician-selected within GLP-1 lane)

## Source of truth

| Layer | Location | Value |
|-------|----------|-------|
| Stripe live | `MEDICATION_FILLS.retatrutide` in `src/lib/stripeConfig.ts` | `$499/mo` · `price_1TnTAnCXbCBPFEeIyA7hRE1V` |
| Pricing doc | `docs/pricing/pricing_source_of_truth.md` | `$499/mo` (updated 2026-06-28) |
| Therapy catalog | `supabase/functions/_shared/therapy-catalog.ts` | `displayPrice: "$499/mo"` |
| Bootstrap | `supabase/functions/bootstrap-retatrutide-price/index.ts` | Retires superseded **$449** price |

## Corrections in Phase 2B

- `.cursorrules` — retatrutide fill references updated from $449 to **$499/mo**
- `therapy-catalog.ts` — `displayPrice`, `staffPolicyBullet`, and `clinicalNotes` aligned to $499/mo
- `clinicalPathwayEngine.ts` — staff counseling copy notes retatrutide at $499/mo when selected

## Intentionally unchanged $449 references

**Tirzepatide ELEVATED GLP-1 program** remains **$449/mo** — not retatrutide.

Program range copy such as `$199–$449/mo` refers to ELEVATED program tiers (IV $199 through GLP-1 tirz $449), not retatrutide.

## Stale static assets

Staff PDFs/HTML in `public/downloads/` and `docs/clinical/` already list Retatrutide at **$499/mo** in GLP-1 tables. Regenerate via `npx tsx scripts/generate-formulary-cheat-sheet.ts` after formulary content changes.
