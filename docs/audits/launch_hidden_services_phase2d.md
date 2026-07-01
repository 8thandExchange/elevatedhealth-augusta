# Launch-Hidden Services — Phase 2D Confirmation

**Date:** 2026-07-01

## Flags (source: `src/lib/serviceConfig.ts`)

| Service | `ACTIVE_SERVICES` | Public storefront |
|---------|-------------------|-------------------|
| Sexual wellness | `false` | `/sexual-wellness` → `NotFound` |
| Hair restoration | `false` | `/hair-restoration` → `NotFound` |

## Patient-facing filters

- `PeptideOutcomeCards` — omits therapies with `hiddenAtLaunch: true` (PT-141, tadalafil, sildenafil, oxytocin, hair SKUs)
- `Pricing.tsx` — hair/sexual sections gated by `shouldShow()` + sunsetted categories
- `clinicalOptimizationCatalog` — homepage cards omit Sexual Wellness unless flag on

## Staff / provider

- Sexual wellness and hair SKUs remain in staff formulary cheat sheets (internal quoting when clinically appropriate)
- Provider dashboard retains addon selectors for in-clinic workflows

**Do not enable public routes or remove `hiddenAtLaunch` without flipping `ACTIVE_SERVICES` and clinical sign-off.**
