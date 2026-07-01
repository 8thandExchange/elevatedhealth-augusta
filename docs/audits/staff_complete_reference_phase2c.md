# Staff Complete Reference — Phase 2C Audit

**Date:** 2026-07-01

## Regenerated in Phase 2C

The staff complete reference export pipeline **is catalog/Stripe-driven**:

- `staffMasterGuideContent.ts` → imports `formularyCheatSheetContent` (Stripe + `therapyStaffPolicyBullets()`)
- `staffMasterGuideExport.ts` → renders HTML/PDF
- `scripts/generate-staff-quick-card.ts` → writes `docs/clinical/` + `public/downloads/`

**Action taken:** Regenerated via `npx tsx scripts/generate-staff-quick-card.ts` and `npx tsx scripts/generate-ops-handbook.ts` after wiring `staffTherapyCounseling.ts`.

## Source of truth hierarchy

1. `supabase/functions/_shared/therapy-catalog.ts` — availability, gating, policy bullets
2. `src/lib/stripeConfig.ts` — live prices
3. `src/lib/staffTherapyCounseling.ts` — staff GLP/retatrutide counseling strings
4. `src/lib/formularyCheatSheetContent.ts` — formulary tables (Stripe-driven)
5. `src/lib/sopManualContent.ts` — SOP algorithms (imports staffTherapyCounseling)

## Still frozen (low priority)

| Asset | Why stale | Rebuild when |
|-------|-----------|--------------|
| `EHA-Clinical-Operations-Handbook-v2.0.0-2026-06-26.*` | Dated filename; content now flows from `sopManualContent` via `generate-ops-handbook.ts` | Re-run generator; bump version in `SOP_MANUAL_META` if leadership wants new PDF stamp |

Live staff UI (`/staff-*` routes) always reflects TS sources — prefer portal over static PDF when in doubt.
