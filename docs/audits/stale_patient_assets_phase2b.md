# Stale Patient & Staff Assets — Phase 2B Audit

**Date:** 2026-07-01

## Regeneratable (safe — driven by TS sources)

| Asset | Path | Stale risk | Action |
|-------|------|------------|--------|
| Formulary cheat sheet | `docs/clinical/EHA-Formulary-Cheat-Sheet-*` | Low — `formularyCheatSheetContent.ts` uses `MEDICATION_FILLS.retatrutide.displayPrice` ($499) | Run `npx tsx scripts/generate-formulary-cheat-sheet.ts` |
| Formulary cheat sheet (public) | `public/downloads/EHA-Formulary-Cheat-Sheet-*` | Same as above | Same generator copies to `public/downloads/` |
| Medication cheat sheet | `scripts/generate-medication-cheat-sheet.ts` (chained) | Low | Runs with formulary generator |

## Static snapshots (not auto-regenerated)

| Asset | Path | What may be stale | Patient-facing? | Recommended action |
|-------|------|-------------------|-----------------|-------------------|
| Clinical Operations Handbook | `public/downloads/EHA-Clinical-Operations-Handbook-v2.0.0-2026-06-26.*` | Frozen 2026-06-26 snapshot; therapy catalog expanded since | Staff/internal PDF | Regenerate from `sopManualContent.ts` when staff doc pipeline is wired to catalog |
| Staff Complete Reference v2.3/v2.4 | `public/downloads/EHA-Staff-Complete-Reference-*` | Retatrutide row correct at $499; catalog entries added Phase 2B not reflected | Staff/internal | Regenerate when staff reference export is catalog-driven |
| Staff Quick Card / Desk Card | `public/downloads/EHA-Staff-*-Card-*` | GLP table correct; peptide outcome groups not in static cards | Staff/internal | Low priority — live staff UI uses TS sources |
| Clinical handbook HTML | `docs/clinical/EHA-Clinical-Operations-Handbook-*.html` | Duplicate of public/downloads handbook | Staff/internal | Same as handbook |

## Patient-facing live surfaces (preferred over PDFs)

| Surface | Source | Status |
|---------|--------|--------|
| `/peptides` | `PeptideOutcomeCards` + `therapy-catalog.ts` | **Updated Phase 2B** |
| `/weight-loss` | `GlpTherapyOverviewCards` + `stripeConfig` | Retatrutide $499 via `MEDICATION_FILLS` |
| `/services` | `treatmentArchitecture.ts` | Catalog-driven |
| `/pricing` | `stripeConfig` + catalog helpers | Live |

## Staff content with hardcoded therapy copy

| File | Drift risk | Phase 2B action |
|------|------------|-----------------|
| `formularyCheatSheetContent.ts` | Low — uses Stripe constants + `therapyStaffPolicyBullets()` | Already catalog-aligned for policy bullets |
| `sopManualContent.ts` | Medium — hardcoded program prices (tirz $449 correct) | TODO: derive GLP counseling strings from catalog |
| `staffSystemGuideContent.ts` | Low — NEVER_SAY list correctly blocks casual retatrutide à la carte | No change |
| `staffMasterGuideContent.ts` | Not audited this pass | TODO: catalog bridge in Phase 2C |

## Generator command

```bash
npx tsx scripts/generate-formulary-cheat-sheet.ts
```

Requires Chrome/Chromium for PDF output; MD/HTML always written.
