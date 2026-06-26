# ELEVATED Combo Programs — Pricing Analysis

**Status:** Live (Stripe bootstrapped 2026-06-26)  
**Owner:** Leadership + Dr. Akers  
**Effective:** 2026-06-26  
**Code source of truth:** `src/lib/elevatedComboPrograms.ts`

---

## Problem

Patients who want **weight loss + hormones** today face two bad options:

1. **Two full ELEVATED memberships** ($578–$698/mo) — double-pays for the same RN visit, messaging, and quarterly labs.
2. **Legacy $149 hormone add-on** — test-mode Stripe SKU, ignored at checkout, not in pricing SOT.

---

## Solution: Anchor + Medication-Only Add-On

| Layer | What patient pays for |
|-------|----------------------|
| **Anchor program** | Full ELEVATED bundle: primary medication + RN check-ins + messaging + quarterly labs + physician review |
| **Add-on** | Second-lane **medication + pharmacy fulfillment only** — no duplicate care bundle |

**Overlap removed:** ~**$100/mo** (amortized quarterly labs ~$63, RN touch ~$26, messaging/review overhead).

---

## Complete option matrix (all click choices)

### Anchor programs (pick one — owns the care bundle)

| Anchor | Monthly | Stripe (live) | Default onboarding labs |
|--------|---------|---------------|-------------------------|
| ELEVATED GLP-1 · Semaglutide | $349/mo | `price_1TWcPL…` | Expanded $299 |
| ELEVATED GLP-1 · Tirzepatide | $449/mo | `price_1Tm1Bz…` | Expanded $299 |
| ELEVATED TRT | $249/mo | `price_1TWcPI…` | Comprehensive $199* |
| ELEVATED HRT | $229/mo | `price_1TWcPK…` | Comprehensive $199* |

\*If GLP-1 add-on is selected at enrollment, use **Expanded $299 once** instead — covers both lanes.

### Add-ons (optional — medication only)

| Add-on | Price | Gender | Full program | Savings vs full |
|--------|-------|--------|--------------|-----------------|
| TRT medication | **+$149/mo** | Male | $249 | $100 |
| HRT medication | **+$129/mo** | Female | $229 | $100 |
| GLP-1 semaglutide medication | **+$249/mo** | Any | $349 | $100 |
| GLP-1 tirzepatide medication | **+$349/mo** | Any | $449 | $100 |

### Every valid combo (8 dual-lane + 4 anchor-only)

| Combo | Total/mo | vs two full programs | Marketing line |
|-------|----------|----------------------|----------------|
| GLP-1 sema only | $349 | — | ELEVATED GLP-1 · Semaglutide |
| GLP-1 sema + TRT | **$498** | save $100 | **Add TRT for only $149/mo** |
| GLP-1 sema + HRT | **$478** | save $100 | **Add HRT for only $129/mo** |
| GLP-1 tirz only | $449 | — | ELEVATED GLP-1 · Tirzepatide |
| GLP-1 tirz + TRT | **$598** | save $100 | **Add TRT for only $149/mo** |
| GLP-1 tirz + HRT | **$578** | save $100 | **Add HRT for only $129/mo** |
| TRT only | $249 | — | ELEVATED TRT |
| TRT + GLP-1 sema | **$498** | save $100 | **Add Semaglutide for only $249/mo** |
| TRT + GLP-1 tirz | **$598** | save $100 | **Add Tirzepatide for only $349/mo** |
| HRT only | $229 | — | ELEVATED HRT |
| HRT + GLP-1 sema | **$478** | save $100 | **Add Semaglutide for only $249/mo** |
| HRT + GLP-1 tirz | **$578** | save $100 | **Add Tirzepatide for only $349/mo** |

Totals are **symmetric** — anchor order does not change the monthly bill.

---

## Margin analysis (materials COGS only)

Source: `docs/business_case_operations_brief_2026-06-24.md` (GC Partner Catalog 05-23-26).

| Add-on | Price | Est. drug COGS | Gross margin (materials) |
|--------|-------|----------------|--------------------------|
| TRT med | $149 | ~$36 | ~76% |
| HRT med | $129 | ~$58 | ~55% |
| GLP-1 sema med | $249 | ~$107 | ~57% |
| GLP-1 tirz med | $349 | ~$185 | ~47% |

Anchor programs retain their existing margin profiles (labs + labor absorbed in anchor price, not duplicated on add-on).

**Tirzepatide add-on at $349** clears margin at 10 mg/wk maintenance; thinnest line but acceptable because anchor already carries quarterly Expanded lab overhead.

---

## Onboarding economics (first month)

Example: weight + hormones, GLP-1 sema anchor + TRT add-on:

| Item | Charge |
|------|--------|
| Wellness Assessment | $79 |
| Expanded baseline labs | $299 |
| First month combo | $498 |
| **Month 1 total** | **~$876** |

Steady state: **$498/mo** — vs **$598/mo** if two full programs.

---

## Operational rules (no overlap)

1. **One RN visit/month** — review both protocols in the same touchpoint.
2. **One quarterly lab draw** — Expanded panel when GLP-1 is in the mix; satisfies hormone monitoring.
3. **One Stripe subscription** — two line items (anchor price + add-on price).
4. **Consents** — union of anchor + add-on (GLP-1 + Hormone Therapy when both lanes active).
5. **Staging** — physician may start anchor only, add medication add-on after 8–12 weeks stable (clinical discretion).
6. **Chart fields** — `elevated_program` = anchor program key; `elevated_program_addon` = add-on key (migration pending).

---

## Stripe implementation checklist

Create **four live recurring prices** (medication-only products):

| `elevated_addon_trt` | $149/mo | ELEVATED TRT Medication Add-On | `price_1TmedJCXbCBPFEeIPJlH1Yq1` |
| `elevated_addon_hrt` | $129/mo | ELEVATED HRT Medication Add-On | `price_1TmedKCXbCBPFEeImjKoYNoS` |
| `elevated_addon_glp1_sema` | $249/mo | ELEVATED GLP-1 Semaglutide Medication Add-On | `price_1TmedKCXbCBPFEeITDtxayx4` |
| `elevated_addon_glp1_tirz` | $349/mo | ELEVATED GLP-1 Tirzepatide Medication Add-On | `price_1TmedLCXbCBPFEeIgzXJt0Lz` |

Wire into:

- `bootstrap-elevated-combo-prices` edge function (new)
- `create-*-checkout` / shared combo checkout
- `stripe-webhook` — set `elevated_program` + `elevated_program_addon`
- `update-subscription-addon` — replace legacy test price with live add-on IDs

---

## Marketing copy (approved substance)

**Weight-loss led (default):**

> ELEVATED GLP-1 from $349/mo — everything included.  
> **Add hormone optimization for as little as $129/mo** when clinically appropriate.  
> One visit. One lab cadence. Both medications. No duplicate fees.

**Hormone led:**

> ELEVATED TRT $249/mo or ELEVATED HRT $229/mo — full bundle.  
> **Add GLP-1 for as little as $249/mo** when weight management is also a goal.

**Savings hook:**

> Save **$100/month** compared to enrolling in two separate ELEVATED programs.

---

## What is NOT a combo

- **ELEVATED IV ($199)** — non-Rx; no hormone/GLP-1 combo SKUs in v1.
- **À la carte peptide fills** — member 20% off; separate from program combo.
- **Two full programs** — deprecated path for new enrollments; existing dual subscribers may be migrated at renewal.

---

## Next build steps

1. Bootstrap four Stripe add-on prices → fill `COMBO_ADDONS[].stripePriceId` in code.
2. Combo checkout edge function (single subscription, 1–2 line items).
3. Webhook + patient column `elevated_program_addon`.
4. Storefront FAQ + Weight Loss page combo strip.
5. Retire legacy `HormoneAddonSelector` test price path.
