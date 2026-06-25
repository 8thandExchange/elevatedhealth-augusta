# Elevated Health Augusta Business Case + Operations Brief

Date: 2026-06-24
Owner: Leadership + Operations
Scope: Updated to current website offerings, Stripe catalog, and live Supabase formulary/cost data.

## Executive Positioning

Elevated Health Augusta is positioned as a physician-owned, cash-pay precision wellness clinic that competes on local clinical access, transparent pricing architecture, and responsibly sourced compounded therapies.

Current value proposition:
- Local in-person care with physician oversight and RN continuity.
- Clear two-lane patient entry (walk-in IV versus consult-gated programs).
- Transparent recurring pricing with differentiated value for members.
- Clinical safety controls (consent gates, protocol pathways, staff triage).

## What Changed Since Earlier Versions

- Program catalog expanded and operationalized (hormones, peptides, GLP-1). ELEVATED METABOLIC RECOMPOSITION slated for retirement (teardown pending sign-off); retatrutide relocated into the GLP-1 lane as a gated, physician-only option (kept, not removed).
- IV screening and blocked-patient safety flow implemented with staff triage states.
- Clinical formulary and clinic formulary now carry structured price + cost fields for operational quoting and margin visibility.
- Lab and consent workflows moved from generic planning to executable in-app pathways.
- Membership communication now requires stricter product-specific clarity to prevent interpretation that non-Rx wellness membership bundles all medications.

## Business Model Snapshot

Revenue engines:
1) Lane A: IV walk-in bookings (`/iv-lounge`), direct cash-pay at booking.
2) Lane B: Consult-gated therapy lanes (`/hormones`, `/peptides`, `/weight-loss`) with front-door assessment, labs, provider plan, then medication/protocol enrollment.
3) Recurring membership and continuity services (messaging, check-ins, lab cadence, protocol follow-ups).

Strategic moat:
- Safer sourcing posture (503A pharmacy workflows, consent governance, protocol gating).
- Better continuity than one-off med-spa transactions.
- Faster local access than national telemedicine-only operators.

## Operating Brief (Current-State)

### Patient Flow

- New patient enters through IV direct booking or wellness assessment front door.
- Intake + consent completion gates treatment progression.
- Lab ordering and result review flows through provider/staff dashboard pathways.
- Provider signs protocol; staff execute scheduling and follow-up.
- Ongoing care uses membership cadence and periodic protocol adjustments.

### Role Responsibilities

- Front office operations: schedule orchestration, patient coordination, billing follow-through.
- RN workflow: intake, ongoing check-ins, administration protocols, escalation triggers.
- Provider workflow: clinical signoff, lab interpretation, medication/protocol decisions.
- Business operations: catalog integrity, margin tracking, vendor fallback/routing.

### Critical Systems

- Frontend storefront + booking UX (Vite/React).
- Supabase backend (RLS, edge functions, operational tables).
- Stripe live pricing catalog.
- Formulary tables (`clinic_formulary`, `clinical_formulary_items`) for quote and margin governance.
- Consent and safety-gate workflows before prescription execution.

## Peptide Cost and Charge Analysis (Quick Snapshot)

Source: Live Supabase query on 2026-06-24, categories `peptide` / `peptide_recovery`.
Interpretation: Gross margin shown before labor, supplies, wastage, card processing, and follow-up overhead.

### Recovery peptide pathway (`clinical_formulary_items`)

- BPC-157: cost $47.00; non-member $329.00 (85.7% gross margin), member $249.00 (81.1%).
- TB-500: cost $47.00; non-member $329.00 (85.7%), member $249.00 (81.1%).
- BPC-157 + TB-500 stack: cost $94.00; non-member $329.00 (71.4%), member $249.00 (62.2%).
- PDA: cost $85.00; non-member $249.00 (65.9%), member $199.00 (57.3%).

### Additional peptide SKUs (`clinic_formulary`)

- 5-Amino-1MQ: cost $79.00; non-member $119.00 (33.6%), member $95.00 (16.8%).
- AOD-9604: cost $90.00; non-member $129.00 (30.2%), member $103.00 (12.6%).
- SLU-PP-332: cost $60.00; non-member $99.00 (39.4%), member $79.00 (24.1%).
- SS-31: cost $45.00; non-member $249.00 (81.9%), member $199.00 (77.4%).
- CJC-1295/Ipamorelin: cost $55.00; non-member $179.00 (69.3%); member price not currently populated.
- Tesamorelin: cost $65.00; non-member $399.00 (83.7%); member price not currently populated.

Operational implication:
- Recovery peptide lanes have healthy gross headroom.
- Some lower-ticket metabolic SKUs have thinner member-side margin and should be watched for labor-adjusted profitability.
- Missing member prices for certain high-volume peptide SKUs can create quoting inconsistency and should be standardized.

## Peptide Pricing Note (Dose Stability)

Peptides are generally dose-stable once a protocol is set, so per-month price volatility is not a major risk. Where a compound's utilization varies materially, a small Low/Standard/High band per compound is acceptable, with the patient's band locked for a defined interval and re-banded only on documented dose change.

## GLP-1 Pricing Analysis (Flat vs Tiered)

Source: FCC FormuConnect Q2 2026 injectable catalog (Semaglutide/B6 2.5mg/mL; Tirzepatide/B6 12.5mg/mL). Monthly mg = weekly dose x 4.33. Drug cost only.

### Key dynamic

GLP-1 dosing is monotonic: patients start low and titrate up, then sit at maintenance for a year or more. Most billed months therefore land at the highest-cost maintenance dose, not the cheap starting dose. A flat price's real margin is governed by maintenance cost; the cheap early months are a CAC-recovery buffer, not the steady state.

### Monthly drug cost by dose

Semaglutide:
- 0.25 mg/wk (start): ~$35
- 1.0 mg/wk: ~$70–105
- 2.4 mg/wk (maintenance): ~$131–150

Tirzepatide:
- 2.5 mg/wk (start): ~$85
- 10 mg/wk: ~$220–240
- 15 mg/wk (maintenance): ~$285–300

### $349 ELEVATED GLP-1 margin at maintenance (materials only)

- Semaglutide @ 2.4 mg: ~$209 gross (~60%).
- Tirzepatide @ 10 mg: ~$119 gross (~34%).
- Tirzepatide @ 15 mg: ~$59 gross (~17%) before labor, labs, and processing.

### Why not per-dose tiers

Per-dose pricing creates a clinical incentive for patients to resist dose escalation to avoid a price increase. For GLP-1s, reaching a therapeutic dose is the point, so tiering by dose is financially self-inflicted harm.

### Recommendation

1) Flat price per molecule (semaglutide vs tirzepatide), never changes as the patient titrates.
2) Set each price to cover that molecule's maintenance cost + overhead + target margin, not the average.
3) Only defensible tier is a single high-dose break (e.g., 12.5–15 mg tirzepatide as a higher tier), not a smooth ladder.
4) The "price never goes up" promise is a real retention moat in a churny GLP-1 market — preserve it.

### LOCKED DECISION — implemented 2026-06-24

Two flat per-molecule prices, both enrolling the same `glp1` membership:

- **ELEVATED GLP-1 · Semaglutide → $349/mo** (existing live price `price_1TWcPLCXbCBPFEeIK7tkeIAM`)
- **ELEVATED GLP-1 · Tirzepatide → $449/mo** (new live price `price_1Tm1BzCXbCBPFEeIkrr2iGcI`, same product `prod_UVdgUmNtkHxr3V`)

No high-dose sub-tier (#3 dropped): a flat $449 covers tirzepatide to its max dose and stays positive even at 15 mg with quarterly labs retained (~+$68 materials), so the single break wasn't needed. **Lab cadence unchanged** (quarterly) — the $449 price alone clears the margin floor, and changing cadence is a clinical decision that needs the medical director's sign-off, so it was deliberately left out of this pricing-only change. The "price never goes up as you titrate within your molecule" promise (#4) is preserved.

Wired consistently across: storefront (`WeightLoss`, `HowGLP1Works`, `MembershipComparison`, home pricing, `Membership`), patient EMR (`MembershipSummary` shows the $349–$449 range since molecule isn't stored on the tier), provider EMR (`QuickPaymentModal`, `MedicalClearanceCard`, `MembershipAssignmentCard`, `PatientDatabase`), checkout (`create-tirzepatide-checkout` → $449 price), webhook (tirz price → `glp1` status), and docs (`stripeConfig`, `live-prices`, source-of-truth, `.cursorrules`).

## Comprehensive Pricing & Margin Sweep

All COGS are drug/material only — exclude RN/provider labor, LabCorp wholesale, consumables, ~3% card fees, and fixed overhead.

### Lab economics (LabCorp client COGS vs price)

Source: live LabCorp client pricing (acct 10084710, eff 2026-06-22), summed over the draft panel composition. Panels repriced 2026-06-23. COGS is LabCorp test cost only (excludes draw labor and supplies).

- Foundation Wellness (8 tests): COGS $53.70; $199 non-member (73.0%) / $159.20 member (66.3%).
- Hormone — Male (16): COGS $170.65; $299 (42.9%) / $239.20 (28.7%).
- Hormone — Female (18): COGS $182.25; $299 (39.0%) / $239.20 (23.8%).
- Weight / Expanded (16): COGS ~$190.10*; $299 (36.4%) / $239.20 (20.5%).
- Sexual Wellness (7): COGS $107.55; $199 (46.0%) / $159.20 (32.4%).

*Weight panel includes Leptin/ApoB/Lp(a)/Insulin priced from estimates (not on the LabCorp client sheet). The 2026-06-23 reprice from $199 to $299 was necessary: at $199 the member price ($159.20) sold the hormone panels below their ~$170–182 cost.

Member quarterly labs are $0 revenue (included in program), so the standalone margins above apply to initial onboarding and non-member/à la carte orders only.

### Active program margins — corrected for included quarterly labs

This corrects the earlier drug-only view. Amortized labs = included quarterly panel COGS ÷ 3.

- ELEVATED TRT ($249): drug ~$37 + labs ~$57/mo = ~$94 COGS → ~$155 gross (~62%). (Was ~85% drug-only.)
- ELEVATED HRT ($229): cream cost missing + labs ~$61/mo — still not fully validated.
- ELEVATED GLP-1 ($349), semaglutide maintenance: drug ~$140 + labs ~$63 = ~$203 → ~$146 gross (~42%).
- ELEVATED GLP-1 ($349), tirzepatide 15 mg: drug ~$290 + labs ~$63 = ~$353 → ~-$4 gross. Underwater before labor.
- ELEVATED WELLNESS ($199): two included Myers IV drips ~$164; no included Rx labs → ~$35 before RN labor.

### Metabolic Recomposition / retatrutide — corrected status

The 2026-06-24 pull corrected my understanding:

- ELEVATED METABOLIC RECOMPOSITION ($1,199): intended for retirement, but still live in code and formulary (no removal migration). Full teardown is held for sign-off.
- Retatrutide: NOT removed. It was relocated into the GLP-1 lane as a gated, physician-only, investigational option, with a new consent (GLP-1 consent Section 11A, go-live 2026-06-21) and removed from the research-peptide consent. Deleting it would tear out current legal/clinical work. Recommendation: keep.
- Metabolic peptides (SS-31, 5-Amino-1MQ, AOD-9604, SLU-PP-332): decision pending — keep as standalone à la carte or remove with the program.

### Peptide / à la carte margins (active)

- Recovery (BPC-157, TB-500, stack, PDA): 57–86% margin. Strong.
- SS-31 / Tesamorelin / CJC-1295: 69–84% non-member. Strong.
- 5-Amino-1MQ, AOD-9604, SLU-PP-332: 12–39% margin, thinnest on member side — likely near break-even after overhead.

### Data integrity & pricing consistency issues

1) Semaglutide cost stale: formulary $65/vial vs FCC catalog $105 (SKU 2490, 3mL). Understates GLP-1 COGS everywhere.
2) Semaglutide price disagreement: stripeConfig fill $299 vs formulary $249/$199 vs source-of-truth $299.
3) Tirzepatide price disagreement: stripeConfig fill $399 vs formulary $499/$399.
4) Weight/expanded panel COGS relies on estimates for Leptin/ApoB/Lp(a)/Insulin — obtain LabCorp client prices.
5) CJC-1295/Ipamorelin and Tesamorelin have null member prices.
6) HRT creams (Bi-Est, Progesterone, Test cream) have null supplier costs — HRT margin unverifiable.

## Next Operational Actions

1) Re-confirm the Metabolic Recomposition teardown scope now that retatrutide is known to be a separate gated GLP-1 option.
2) Decide whether the standalone metabolic peptides (SS-31, 5-Amino, AOD, SLU) survive.
3) Set GLP-1 flat-per-molecule pricing to cover maintenance drug cost PLUS the ~$63/mo amortized expanded-panel labs; consider a high-dose tirzepatide tier given the underwater result.
4) Reconcile semaglutide/tirzepatide cost and price across stripeConfig, clinic_formulary, and pricing source of truth.
5) Obtain LabCorp client prices for the four off-sheet expanded-panel assays.
6) Backfill null member prices (CJC, Tesamorelin) and HRT cream supplier costs.
7) Apply the pending lab_panel_tests mapping migration so margin tooling can sum panel COGS live.
