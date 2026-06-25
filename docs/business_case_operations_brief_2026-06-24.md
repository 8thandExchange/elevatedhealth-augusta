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

- Program catalog expanded and operationalized (hormones, peptides, GLP-1). ELEVATED METABOLIC RECOMPOSITION teardown was shipped in code (migration `20260624190000`) **but that migration is not yet applied to the live DB — `STACK-METABOLIC-FULL` is still active ($1,199, 38% margin)**. Standalone metabolic peptides kept à la carte.
- **Formulary cost backfill applied to the live DB** (migration `20260625000000`, commit `83d5257`): peptide/GLP-1 supplier costs corrected to the GC Partner Catalog (05-23-26), men's testosterone **cream** row added ($30/30g; injectable flagged non-standard), and `clinical_formulary_items` clinic costs backfilled on the dispensed form (oral caps for metabolic peptides — so 5-Amino-1MQ is **not** underwater at $79/mo). Internal cost fields only; no client prices, Stripe IDs, RLS, or primary routing changed.
- **Empower Pharmacy documented as the 503A backup vendor** across `vendorRouting.ts`, the Staff Vendor Guide, SOP `ALGO-003`, and `.cursorrules`. Empower carries NO research/recovery/metabolic peptides (GC/PATH stays primary); it is for hormone-cream/GLP-1 backup and unique modalities (ODT/oral GLP-1, nasal, troches, dermatology).
- **Open compliance flag:** Retatrutide is still active and sellable in `clinic_formulary` ($449), which conflicts with `.cursorrules` ("DO NOT OFFER — FDA prohibits compounding"). Needs a deactivate-or-keep decision.
- GLP-1 repriced flat-per-molecule: semaglutide $349/mo, tirzepatide $449/mo (new live price), wired storefront→EMR→checkout→webhook. TRT margin basis corrected from injectable to men's cream; women's HRT creams confirmed costed in `clinic_formulary`.
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

### Active program margins — built on the GC Partner Catalog 05-23-26 (rebuilt 2026-06-24)

Drug COGS below is sourced from the GC Compound Consulting Partner Catalog (05-23-26), citing the
SKU/price used, NOT the stale in-app formulary or earlier estimates. Monthly cost = clinical
maintenance dose × catalog price. Amortized labs = included quarterly panel COGS ÷ 3.

- ELEVATED TRT ($249): testosterone cream $30/30g (catalog "Testosterone Cream/Gel <200mg/gm" @
  $1.00/gm) + anastrozole ~$6 = ~$36 drug + labs ~$57 = ~$93 COGS → ~$156 gross (~63%). The earlier
  `~$37` was injectable cypionate (catalog Test Cyp 10mL = $40), which we don't do. Cream cost is now
  a real catalog line, not an estimate.
- ELEVATED HRT ($229): Bi-Est cream ~$33 (catalog "Hormone Cream/Gel 1–4 ingr" $25–$40/30g) +
  progesterone caps ~$25 (catalog Progesterone 50–250mg cap $0.70–$1.00/unit) = ~$58 drug + labs ~$61
  = ~$119 COGS → ~$110 gross (~48%).
- ELEVATED GLP-1 — Semaglutide ($349): drug ~$107 (catalog PATH SEMAGLUTIDE-10MG-03ML $107 at 2.4mg/wk
  ≈ 10mg/mo; ~$56 if dispensed from a 30mg $161 vial) + labs ~$63 = ~$170 COGS → ~$179 gross (~51%).
  NOTE: the app formulary's $65/vial is stale and understated this by ~40%.
- ELEVATED GLP-1 — Tirzepatide ($449): at 15mg/wk (~65mg/mo) drug ~$240 (catalog STLKS Tirz 60mg $240)
  + labs ~$63 = ~$303 → ~$146 gross (~33%); at 10mg/wk (~43mg/mo) drug ~$185 → ~$201 gross (~45%). The
  $449 price clears margin at every maintenance dose — it was only "underwater" under my prior inflated
  ~$290 cost.
- ELEVATED WELLNESS ($199): 2 Myers drips at clinic_formulary premix $45/bag = ~$90 drug (not in GC
  catalog) → ~$109 gross (~55%) before consumables/RN time; no included Rx labs.

### Metabolic Recomposition / retatrutide — final status (shipped)

- ELEVATED METABOLIC RECOMPOSITION: RETIRED. Migration `20260624190000_retire_metabolic_recomposition_program.sql`
  deactivated `STACK-METABOLIC-FULL` and the associated CDS entries; program code/pages removed.
- Retatrutide: KEPT. Relocated into the GLP-1 lane as a gated, physician-only, investigational option
  (GLP-1 consent Section 11A, go-live 2026-06-21).
- Metabolic peptides (SS-31, 5-Amino-1MQ, AOD-9604, SLU-PP-332): KEPT as standalone à la carte SKUs.

### Catalog vs in-app formulary — costs the app has wrong

The GC Partner Catalog 05-23-26 is the real wholesale source. Where the app/DB disagrees, the app is wrong:

| Item | App / DB has | Catalog (05-23-26) says | Impact |
| --- | --- | --- | --- |
| Semaglutide | formulary $65/vial | 10 mg = $107 (PATH) / $110 (STLKS) | App understates GLP-1 COGS ~40% |
| BPC-157 | DB clinic_cost $47 | 10 mg = $66 (PATH) | Recovery margin overstated |
| Tirzepatide | vendorRouting $75 (10 mg vial) | 15 mg/wk needs ~65 mg/mo ≈ $240 | Per-vial ≠ monthly cost |
| Men's test cream | no costed row in DB | $1.00/gm → $30 / 30 g | Add costed row to formulary |
| 5-Amino-1MQ | sells $149 / $119 | 50 mg vial = $220 | Loses money unless vial spans multiple months |

### Peptide / à la carte margins (catalog-costed)

- Recovery (BPC-157 $66/mo, TB-500 $66/mo, Wolverine $94/mo, PDA $85): 62–80% margin at catalog cost. Strong.
- Standalone metabolic: catalog vial prices are SS-31 50 mg $150, 5-Amino-1MQ 50 mg $220, AOD-9604 10 mg $90 (KDX), SLU-PP-332 5 mg $60. Monthly margin depends on vial duration; 5-Amino-1MQ is underwater at current pricing if a 50 mg vial is a single month.

### Data integrity & pricing consistency issues

1) Semaglutide cost stale in app: formulary $65/vial vs catalog $107 (10 mg). Fix everywhere it drives quoting.
2) BPC-157 DB cost $47 vs catalog $66 — recovery margins were overstated (still strong after fix).
3) TRT copy still describes "testosterone cypionate + self-injection supplies" (source-of-truth + Stripe) while the clinical direction is cream — needs an operational copy/routing decision.
4) 5-Amino-1MQ sell price ($149) is below the catalog 50 mg vial ($220) — confirm monthly dose or reprice.
5) Metabolic peptide `clinic_cost_cents` is NULL in `clinical_formulary_items` — backfill from catalog.
6) Weight/expanded panel COGS relies on estimates for Leptin/ApoB/Lp(a)/Insulin — obtain LabCorp client prices.
7) `lab_panel_tests` mapping not applied to live DB — panel COGS can't be summed live in margin tooling.

### Second source: Empower Pharmacy (Patient-Specific Bill-Clinic, 06-16-26)

Empower (PCAB-accredited 503A, our secondary supplier) was evaluated as a peptide alternative. Finding: it does NOT carry the recovery or metabolic research peptides — no BPC-157, TB-500, Wolverine, SS-31, CJC-1295, Ipamorelin, Tesamorelin, 5-Amino-1MQ, SLU-PP-332, or AOD-9604. Its peptide-adjacent stock is Sermorelin, Gonadorelin, Oxytocin, topical GHK-Cu, and NAD+. So Empower complements GC; it cannot replace the peptide line.

On overlapping items, GC is cheaper across the board:

| Item | GC | Empower | Cheaper |
| --- | --- | --- | --- |
| Semaglutide @ 2.4 mg/wk | ~$107 (PATH 10 mg) | ~$134 (12.5 mg, 5mg/mL) | GC |
| Tirzepatide @ 15 mg/wk | ~$240 (STLKS 60 mg) | ~$391 (68 mg, 17mg/mL) | GC |
| Men's testosterone cream | $30 / 30 g | $52.80 / 30 mL | GC |
| Bi-Est cream | $25–$40 / 30 g | $58.10 / 30 mL | GC |
| NAD+ 1,000 mg injectable | $68 | ~$101 (2×500 mg) | GC |
| Sermorelin 15 mg injectable | $65 (10 mg) | $127.53 (15 mg) | GC |

Empower's value is therefore regulatory posture (clean 503A, no Cat-2 peptides), backup supply, and unique modalities not in GC: ODT/oral GLP-1 (semaglutide ODT 12 mg ~$115/mo, tirzepatide ODT 5 mg ~$131/mo — needle-free, daily, distinct modality not a dose-equivalent swap), nasal (oxytocin, NAD+), troches, and dermatology (GHK-Cu serums, rapamycin anti-aging gels). Recommendation: keep GC primary for injectable GLP-1 and all peptides; use Empower for hormone-cream backup, ancillary/commercial products, and the optional ODT/nasal modalities.

## Next Operational Actions

1) Backfill `clinic_formulary` / `clinical_formulary_items` cost fields from the GC catalog: semaglutide $107, BPC-157 $66, men's testosterone cream $30/30g, and the metabolic peptide vial prices.
2) Decide whether ELEVATED TRT copy + the DB "EHA Standard TRT" row + Stripe product description should flip from injectable cypionate to cream-only.
3) Confirm 5-Amino-1MQ monthly dosing (vials/month) and reprice if a vial is a single month.
4) Obtain LabCorp client prices for the four off-sheet expanded-panel assays.
5) Apply the pending `lab_panel_tests` mapping migration so margin tooling can sum panel COGS live.
