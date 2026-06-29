# Pricing Source of Truth — Elevated Health Augusta
**Effective date:** 2026-05-13
**Owner:** Troy Akers, DO
**Status:** Active
This document is the single canonical reference for all pricing at Elevated Health Augusta. Every price quoted in code, marketing copy, email templates, SMS scripts, AI prompts, database seeds, and staff scripts must match this document. When this document changes, all dependent surfaces must be updated within the same sprint.
## Core Services (Non-Member / À La Carte)
| Product | Price | Delivered by | What patient gets |
|---|---|---|---|
| Wellness Assessment | $79 | RN (Caroline) | 30-45 min intake visit. Health history, vitals, body composition, goal discussion, treatment plan recommendation. Performed in-office at Evans GA. |
| Maintenance Visit | $79 | RN | 15-30 min RN follow-up. Dose review, side effect check, vitals, lab follow-up under standing orders. |
| Medical Review | $149 | Dr. Akers (telehealth, primarily phone) | 15-30 min review by physician. Used for: complex initial cases triaged out of standing orders, lab review consults, protocol changes requiring physician decision. Patient initiates by request, or staff escalates. Members do NOT pay this for staff-initiated escalations. |
| Physician Phone Follow-Up | $99 | Dr. Akers (phone) | 10-15 min phone call for non-members. Dose adjustment, side effect questions, scripted dose changes. Members do NOT pay this for staff-initiated escalations. |
| Rebooking Fee | $99 | Auto-charged | Triggered when patient no-shows or late-cancels (cancel within 24 hours of appointment). Stated in patient terms of service. |
## Lab Services
| Product | Price | What's included |
|---|---|---|
| Comprehensive Wellness Panel | $199 | Standard hormone panel + CBC + CMP + lipid panel + thyroid + A1C. Blood drawn in-office by Caroline. Sent to LabCorp. Results back within 5-7 business days. |
| Expanded Panel | $299 | Comprehensive markers plus fasting insulin, leptin, AM cortisol, full thyroid (Free T3/T4), ApoB, Lp(a), homocysteine, iron studies, B12, folate. For GLP-1, metabolic, and weight-loss baselines. |
### Lab panel checkout mapping (clinical slug → Stripe SKU)
Staff order clinical panels by slug in `lab_panels`; patients pay via **two Stripe checkouts only**:
| Clinical panel (`lab_panels.slug`) | Stripe checkout | Patient charge | Default program |
|---|---|---|---|
| `hormone-male` | Comprehensive | $199 | ELEVATED TRT |
| `hormone-female` | Comprehensive | $199 | ELEVATED HRT |
| `foundation-wellness` | Comprehensive | $199 | General / Wellness |
| `weight-optimization` | Expanded | $299 | ELEVATED GLP-1 |
| `sexual-wellness` | Comprehensive | $199 | Launch-hidden (inactive in staff UI) |
Quarterly in-program labs use the same clinical panel but **$0 patient charge** (included in membership).
Labs are billed separately from visits. Lab fees include the in-office blood draw, LabCorp processing, and posting of results to the patient portal. Lab fees do NOT include physician review — review of abnormal results requiring Medical Review is billed separately for non-members; included for members.
## Program Memberships (All-Inclusive Monthly)
These are the flagship offerings. Each bundles medication + monitoring + check-ins into one monthly price. Modeled on the Tactus Health "no hidden fees" structure.
| Program | Price | Inclusions |
|---|---|---|
| ELEVATED TRT (men) | $249/month | Testosterone **cream** (men's dose) from Custom Pharmacy of Evans — daily, physician-titrated; **injectable (cypionate) TRT is not offered** (discontinued 2026-06-25). Monthly RN check-in, unlimited messaging, free quarterly Comprehensive Wellness Panel, all Caroline-initiated physician oversight. **Anastrozole and HCG are not offered.** |
| ELEVATED HRT (women) | $229/month | Bi-Est cream, progesterone, testosterone cream when prescribed, monthly RN check-in, unlimited messaging, free quarterly Comprehensive Wellness Panel, all Caroline-initiated physician oversight. (Troches are not offered.) |
| ELEVATED GLP-1 | Semaglutide $349/month · Tirzepatide $449/month | Compounded semaglutide OR tirzepatide from GC/STLKS network (FCC backup), monthly dose titration, monthly RN check-in, unlimited messaging, free quarterly Expanded Panel, anti-nausea support when clinically indicated, all Caroline-initiated physician oversight. Molecule-specific monthly price (tirzepatide costs ~2x compounded); a patient's price never changes as they titrate within their molecule. Both enroll the same `glp1` membership. |
| ~~ELEVATED Metabolic~~ | ~~$599/month~~ | **DISCONTINUED 2026-06-24.** The standalone metabolic-recomposition bundle was retired. Advanced recomposition support now lives inside the GLP-1 lane (provider-directed à la carte peptides + gated retatrutide). The four metabolic peptides (SS-31, AOD-9604, SLU-PP-332, 5-Amino-1MQ) remain available à la carte. |
| ELEVATED IV (non-Rx) | $199/month | 2 complimentary signature IV drips per month (any menu drip), 20% off boosters + à la carte IV/peptide/injectable services, monthly RN check-in, unlimited messaging, priority booking. **No bundled medication or labs** — this is the non-Rx IV membership (renamed from "ELEVATED WELLNESS" 2026-06-25; internal program key remains `wellness`). |
### ELEVATED Combo Programs (Anchor + Medication Add-On)
When a patient needs **two lanes** (e.g. GLP-1 + hormones), enroll **one anchor program** (full bundle above) plus a **medication-only add-on** on the same Stripe subscription. Add-ons do NOT duplicate RN check-ins, messaging, or quarterly labs ($100/mo savings vs two full programs).
| Add-on (medication only) | Price | Stripe Price ID |
|---|---|---|
| TRT medication add-on | +$149/mo | `price_1TmedJCXbCBPFEeIPJlH1Yq1` |
| HRT medication add-on | +$129/mo | `price_1TmedKCXbCBPFEeImjKoYNoS` |
| GLP-1 semaglutide medication add-on | +$249/mo | `price_1TmedKCXbCBPFEeITDtxayx4` |
| GLP-1 tirzepatide medication add-on | +$349/mo | `price_1TmedLCXbCBPFEeIgzXJt0Lz` |
Example totals: GLP-1 semaglutide ($349) + TRT add-on ($149) = **$498/mo**. Full matrix: `docs/pricing/elevated_combo_programs.md`.
### What Every Membership Includes
- Your monthly medication is included (where applicable to the program)
- Monthly RN check-in with Caroline
- Free quarterly labs at the Evans office (TRT / HRT / GLP-1 tiers only; ELEVATED IV is non-Rx and does NOT include labs)
- Lab review and protocol adjustments by Dr. Akers when needed
- Unlimited messaging with the practice
- Supportive medications (e.g., anti-nausea support for GLP-1) when clinically indicated — anastrozole and HCG are not offered
- All clinical care needed to keep treatment on track
### What's NOT Included
- Initial Wellness Assessment ($79) and initial baseline labs ($199) — one-time onboarding
- Patient-requested extended physician consults beyond standard care ($149)
- Out-of-program à la carte services (members receive 20% off)
### Membership Terms
- Month-to-month, cancel anytime with 30 days notice
- First charge pro-rates to align with calendar billing
- Existing members keep their price for the duration of continuous membership
- Future price changes only affect new enrollments
- **Benefits are contingent on an active membership.** The free quarterly expanded panel (TRT / HRT / GLP-1) and the 20% à la carte discount are member-only and continue only while the membership is active. On cancellation or lapse, both end: the next quarterly panel is billed at full à la carte lab pricing, and every other service reverts to standard non-member à la carte rates. Re-enrolling restores the included quarterly panel and the 20% immediately.
## À La Carte Services (Non-Member)
IV Hydration, IM Injections, NAD+, Peptide Therapy, Sexual Wellness à la carte pricing is currently being finalized. Existing pricing on /iv-lounge is canonical for IV walk-in until updated. Peptide therapy à la carte continues to use FCC catalog pricing with practice markup.
## Discontinued / Eliminated
- Standalone NAD+ products (2026-06-25): IV NAD+ infusion ($450/$750) AND peptide NAD+ injection/troche/nasal ($199/$99/$99). NAD+ now survives ONLY as the $50 IV "NAD+ Booster" add-on. The 3 peptide Stripe products are archived. Legacy "Vitality" stacks (Sermorelin + NAD+) deactivated in the ops formulary.
- ELEVATED Peptides membership — considered and declined (2026-06-25). Peptides stay à la carte; any ELEVATED tier already unlocks the 20% member discount, and bundling peptides recreates the retired Metabolic-stack complexity.
- ACCESS Membership ($99/month) — replaced by program-specific ELEVATED tiers
- Vitality Membership branding — replaced everywhere by ELEVATED branding
- "$99 Strategy Session" — never offered, dead text from legacy
- "$149 Strategy Session" — never offered, dead text from legacy
- "$99 Discovery Consultation" — replaced by $79 Wellness Assessment with RN
- "Consultation fee credits toward treatment" — discontinued claim, patient pays per service
- Ketamine therapy / SPRAVATO pricing — not offered at Elevated Health Augusta
- "Hormone Mapping Kit ($250)" / ZRT Saliva — replaced by in-office LabCorp draws
- All "Billed separately at FCC cost-plus" / "pass through at cost" language for membership medications — medications are INCLUDED in program memberships
## Pricing Principles
1. Cash pay only. No insurance billing. No HSA/FSA direct billing (patient may submit superbill independently).
2. All prices USD and final. No additional fees beyond what is stated.
3. Medications are INCLUDED in program memberships. This is the practice's primary competitive differentiator. The site must NEVER imply that membership medications are billed separately or at cost.
4. Initial labs are NOT included in any membership. Patient pays $199 Comprehensive Wellness Panel at onboarding. Quarterly labs are bundled into ongoing memberships.
5. The $79 Wellness Assessment is the universal front door. Every new patient starts here unless booking an existing-patient à la carte service.
6. The Medical Review at $149 is the escalation path for non-members and for patient-initiated extended consults. Members do NOT pay for staff-initiated physician escalations.
7. Subscriptions auto-renew monthly. Patient receives 7-day notice before each renewal. Cancellation requires 30-day notice via patient portal or phone.
8. Refunds are at practice discretion. Generally yes for undelivered services and unshipped medications; prorated for partial-month cancellations; no for delivered services.
## Required Marketing Copy — "Everything Included" Promise
This messaging is mandatory on the following surfaces:
1. Homepage (hero or secondary hero section)
2. /pricing (banner above program cards)
3. Every program detail page (/hormones, /hormones-men, /hormones-women, /weightloss, /peptides)
4. /membership (the entire page should center this message)
5. Patient portal post-login dashboard
6. Consultation invitation emails
### Required language substance
The following four pillars must be communicated wherever the "Everything Included" message appears. Exact wording may be adapted to page voice, but substance must be preserved:
- Your monthly medication is included
- Lab review and protocol adjustments are included
- Unlimited messaging is included
- One price, no hidden fees
### Forbidden language on patient-facing surfaces
The following phrasing is prohibited everywhere except where explicitly noted:
- "Plus pharmacy costs"
- "Plus consultation fees"
- "Billed separately at FCC cost-plus"
- "Billed separately by FCC"
- "Pass through at cost"
- Vague "Additional charges may apply" without itemization
- "Starting at" without showing the full price adjacent
- "$X/month then $Y for [thing]" — the hidden-fees model
## Competitive Positioning
What we are: Real medicine, real local care. Cash-pay wellness with transparent prices, modern compounded medications, and a relationship with a real RN and a board-certified physician.
What we are not: Not the cheapest online TRT clinic. Not a med-spa. Not an insurance-driven primary care office. Not a "free consult then upsell" scheme.
What patients pay first time: Most patients spend $79 (intake) + $199 (labs) + first month of program ($249-$449) for a total first-month investment of $527-$727. Predictable monthly thereafter.
## Operational Contact
Clinic phone: (706) 760-3470
Note: This number must appear consistently on every patient-facing surface. Any other phone number found in the codebase (e.g. 706-973-3866 on /affordability) is incorrect and must be corrected to (706) 760-3470.
## Live Stripe Price IDs (Production)
**Stripe Account:** acct_1SQrM7CXbCBPFEeI (live mode)  
**Last verified:** 2026-06-14
All price IDs below are in LIVE Stripe mode. Test mode price IDs from the legacy codebase (those prefixed with `…EOtKRY99pu…`) are deprecated and must not be referenced in any patient-facing code path.
### Program Memberships (Recurring Monthly)
| Product | Price | Stripe Product ID | Stripe Price ID |
|---|---|---|---|
| ELEVATED TRT | $249/mo | prod_UVdgaw0SyMI2jz | price_1TWcPICXbCBPFEeInMGSsjDN |
| ELEVATED HRT | $229/mo | prod_UVdgH1SlumTl5O | price_1TWcPKCXbCBPFEeIJKBf62b9 |
| ELEVATED GLP-1 (Semaglutide) | $349/mo | prod_UVdgUmNtkHxr3V | price_1TWcPLCXbCBPFEeIK7tkeIAM |
| ELEVATED GLP-1 (Tirzepatide) | $449/mo | prod_UVdgUmNtkHxr3V | price_1Tm1BzCXbCBPFEeIkrr2iGcI |
| ~~ELEVATED Metabolic (tirzepatide-anchored)~~ | ~~$599/mo~~ | prod_Ujd0CnRYCe6Ukh | price_1Tk9kDCXbCBPFEeIKmQI5tOZ — **RETIRED 2026-06-24, not sold** |
| ~~ELEVATED METABOLIC RECOMPOSITION ($1,199, retatrutide stack)~~ | ARCHIVED 2026-06-19 | prod_UhqS2sWj7JenEp (inactive) | price_1TiQlECXbCBPFEeI4vKTyIq4 (inactive) |
| ELEVATED IV | $199/mo | prod_UVdg37MnW1puuK | price_1TWcPNCXbCBPFEeIXo6IDpPf |
### Core Services (One-Time)
| Product | Price | Stripe Product ID | Stripe Price ID |
|---|---|---|---|
| Wellness Assessment | $79 | prod_UVe4fac4EOfgDG | price_1TWcmaCXbCBPFEeImikpoTPo |
| Medical Review | $149 | prod_UVe5QPpWNyYLpU | price_1TWcn3CXbCBPFEeILKHcCnTR |
| Physician Phone Follow-Up | $99 | prod_UVe5hSb451qkZ4 | price_1TWcnXCXbCBPFEeIEojOHJDL |
| Rebooking Fee | $99 | prod_UVe6AiMtx1xDO0 | price_1TWcnsCXbCBPFEeIFltNQdpi |
| Comprehensive Wellness Panel | $199 | prod_UVe6QvjqrmgbXa | price_1TWcoMCXbCBPFEeIKTLxoYYs |
| Expanded Panel | $299 | prod_UVe64hyL4IIMt6 | price_1TWcolCXbCBPFEeI11uF9lyf |
### À La Carte Medication Fills (Non-Member, One-Time)
| Product | Price | Stripe Product ID | Stripe Price ID |
|---|---|---|---|
| Testosterone Fill | $179 | prod_UVe7nW7JJ1xuC6 | price_1TWcp8CXbCBPFEeI8pQsOIVm |
| Bi-Est Cream Fill | $109 | prod_UVe7Ntu4xUg72s | price_1TWcpTCXbCBPFEeIIt4jKgoR |
| Progesterone Fill | $99 | prod_UVe8jVlaypTCLy | price_1TWcq1CXbCBPFEeI35J50U0I |
| Semaglutide Single Fill | $299 | prod_UVe8LmywoayLOE | price_1TWcqTCXbCBPFEeIP1U1HSld |
| Tirzepatide Single Fill | $399 | prod_UVeAmnWt8FMQCf | price_1TWcsCCXbCBPFEeI8iA8kbrx |
| Retatrutide Monthly (Gated) | $499/mo | prod_UhqSeeHiiHdqHr | price_1TnTAnCXbCBPFEeIyA7hRE1V |
### À La Carte Peptide Therapy (Recurring Monthly)
| Product | Price | Stripe Product ID | Stripe Price ID |
|---|---|---|---|
| Sermorelin Injection | $149/mo | prod_UVeBkWZPGxLdmc | price_1TWcskCXbCBPFEeIBSytC63Q |
| CJC-1295/Ipamorelin | $179/mo | prod_UVeB6yGA5Sy73e | price_1TWct7CXbCBPFEeIXT7Mv0A3 |
| Tesamorelin | $399/mo | prod_UVeCDgLGVJ04hm | price_1TWctuCXbCBPFEeI4rpKGThG |
| ~~NAD+ Troches~~ | ~~$99/mo~~ | prod_UVeDctVXwIySHX | price_1TWcujCXbCBPFEeIgLXiONWC — **DISCONTINUED 2026-06-25, product archived** |
| ~~NAD+ Injection~~ | ~~$199/mo~~ | prod_UVeDVPf2YZCceL | price_1TWcv4CXbCBPFEeIqJILZWQY — **DISCONTINUED 2026-06-25, product archived** |
| ~~NAD+ Nasal Spray~~ | ~~$99/mo~~ | prod_UVeDO4N214JNkQ | price_1TWcvUCXbCBPFEeILsUFp0tq — **DISCONTINUED 2026-06-25, product archived** |
| GHK-Cu Topical | $149/mo | prod_UVeEx971R0NYhK | price_1TWcwJCXbCBPFEeIL3UgXgTu |

GHK-Cu Sublingual is NOT offered (removed 2026-06-19). Topical is the only GHK-Cu form sold.
### À La Carte Recovery Peptides (Non-Member, One-Time fills — consult-gated)
Created 2026-06-19 via `bootstrap-recovery-peptide-prices`. One-time per-fill pricing from the Launch Offer Order System; members get 20% off via the checkout coupon. Consult-gated under Research Peptide Consent.
| Product | Price | Stripe Product ID | Stripe Price ID |
|---|---|---|---|
| BPC-157 | $249 | prod_UjcGzVhmET6qGt | price_1Tk924CXbCBPFEeI2RkxZwch |
| TB-500 (Thymosin Beta-4) | $249 | prod_UjcGW4gXuzgmUM | price_1Tk925CXbCBPFEeIJROSQX2t |
| BPC-157 / TB-500 Recovery Stack | $349 | prod_UjcGhDI27g3tXo | price_1Tk926CXbCBPFEeILIT0UuQF |
### Metabolic Recomposition Stack — À La Carte (Recurring Monthly)
| Product | Price | Stripe Product ID | Stripe Price ID |
|---|---|---|---|
| SS-31 (Elamipretide) | $249/mo | prod_UhqS0eCjYBvB17 | price_1TiQlFCXbCBPFEeIPKdKzUiU |
| AOD-9604 | $129/mo | prod_UhqSyrc4RGtLoX | price_1TiQlGCXbCBPFEeIsx9Dk0z1 |
| SLU-PP-332 | $99/mo | prod_UhqSXKYcScueXq | price_1TiQlGCXbCBPFEeIA3NVzqXV |
| 5-Amino-1MQ | $119/mo | prod_UhqSgJgtKNDVAF | price_1TiQlHCXbCBPFEeIDNFp83oo |
### À La Carte Sexual Wellness
| Product | Price | Type | Stripe Product ID | Stripe Price ID |
|---|---|---|---|---|
| Tadalafil | $99/mo | Recurring | prod_UVeFMp6Re5QcwP | price_1TWcwsCXbCBPFEeI9yGko9k8 |
| Sildenafil | $79/mo | Recurring | prod_UVeFzuXMRsbfR3 | price_1TWcxGCXbCBPFEeIezbJUMS1 |
| PT-141 (Bremelanotide) | $225 | One-time | prod_UVeGVXyl1tyGGx | price_1TWcxgCXbCBPFEeIVx833x02 |
| Oxytocin Nasal Spray | $89/mo | Recurring | prod_UVeGd7W941z5zi | price_1TWcyCCXbCBPFEeITwirLO84 |
### À La Carte Hair Restoration (Recurring Monthly)
| Product | Price | Stripe Product ID | Stripe Price ID |
|---|---|---|---|
| Minoxidil + Finasteride | $129/mo | prod_UVeHUF34WxfW2b | price_1TWcz6CXbCBPFEeI3fWrJOU0 |
| Dutasteride Protocol | $149/mo | prod_UVeIHluYVIXexo | price_1TWczRCXbCBPFEeIGjWNLOYX |
| GHK-Cu Scalp Therapy | $149/mo | prod_UVeIyhp13vmLLw | price_1TWczwCXbCBPFEeIXCBtnslN |
### Member Pricing on À La Carte
Members of any ELEVATED tier (TRT, HRT, GLP-1, or IV) receive **20% off** all à la carte services and products. Member discount logic must be applied in the checkout layer; no separate member-pricing Stripe products exist.
### Deprecated Stripe Price IDs (Do Not Use)
The following test-mode price IDs are deprecated. They appear in legacy code that will be replaced by the live IDs above. Any code referencing these must be updated:
- `price_1TUs3LEOtKRY99puWfQy8pHj` (legacy single-tier Elevated $199/mo) → use ELEVATED IV or program-specific tier
- `price_1TUs38EOtKRY99puPpc6SFMs` (Semaglutide member $199) → use ELEVATED GLP-1
- `price_1TUs3AEOtKRY99puDOseqLDZ` (Semaglutide non-member $249) → use ELEVATED GLP-1 or Semaglutide Single Fill
- `price_1TUs39EOtKRY99puWAF4oZT7` (Tirzepatide member $399) → use ELEVATED GLP-1
- `price_1SlZnyEOtKRY99puE9JNOrTR` (Tirzepatide non-member $499) → use ELEVATED GLP-1 or Tirzepatide Single Fill
- `price_1SlZnwEOtKRY99puaBhrh2iB` (semaglutide $399 keyed) → use ELEVATED GLP-1
- `price_1Sga64EOtKRY99pu6NpP45Qq` (Vitality membership) → DELETE all references; Vitality is discontinued
- `price_1Sga66EOtKRY99puQgPWACIy` (legacy Testosterone fill) → use new Testosterone Fill ID
- `price_1Sga67EOtKRY99puoS8b5U6h` (legacy Bi-Est fill) → use new Bi-Est Cream Fill ID
- `price_1Sga69EOtKRY99puO8NJ5bpx` (legacy Progesterone fill) → use new Progesterone Fill ID
- `price_1Sga6AEOtKRY99puEx0mC3jx` (legacy follow-up consult $99) → use Physician Phone Follow-Up ID
- `price_1Sa5UFEOtKRY99pupEQlaFvN` (legacy rebooking) → use new Rebooking Fee ID
- `price_1Sa3oyEOtKRY99puGS2t9EZv` (legacy Sermorelin) → use new Sermorelin Injection ID
- `price_1Sfm0oEOtKRY99puEurPSCU6` (legacy CJC-1295/Ipamorelin) → use new ID
- `price_1SfibZEOtKRY99pud5SNVeXI` (legacy Tesamorelin) → use new ID
- `price_1Sa3x1EOtKRY99pufL3wEyIN` (legacy NAD+ Troches) → DISCONTINUED 2026-06-25 (NAD+ peptide products retired; NAD+ only as $50 IV booster)
- `price_1Sa3waEOtKRY99puCB267VpA` (legacy NAD+ Injection) → DISCONTINUED 2026-06-25 (see above)
- `price_1SfibeEOtKRY99puUPRACDHQ` (legacy NAD+ Nasal Spray) → DISCONTINUED 2026-06-25 (see above)
- `price_1Sa3xIEOtKRY99puIXSB3L31` (legacy peptide/sexual) → use PT-141 or correct peptide
- `price_1SfibXEOtKRY99puuRkJc5g3` (legacy GHK-Cu) → use new GHK-Cu Sublingual or Topical
- `price_1SfibXEOtKRY99puDbZKu1zw` (legacy GHK-Cu) → use new GHK-Cu Topical or Scalp Therapy
- `price_1SfibUEOtKRY99pujkcHdFLc` (legacy Oxytocin staff) → use new Oxytocin Nasal Spray ID
- `price_1SfijTEOtKRY99puE2WxgmrI` (legacy Minoxidil/Finasteride) → use new ID
- `price_1SfijUEOtKRY99puH5TqvFks` (legacy Dutasteride) → use new ID
- `price_1SfijUEOtKRY99pubB9WRUs1` (legacy Dutasteride duplicate) → use new ID (deduplicate)
- `price_1SfijVEOtKRY99puXq7N3Lp2` (legacy GHK-Cu Scalp) → use new GHK-Cu Scalp Therapy ID
- `price_1SfijREOtKRY99puq0ITndfC` (legacy Tadalafil) → use new ID
- `price_1SfijSEOtKRY99pumi7jjNvs` (legacy Sildenafil) → use new ID
- `price_1Sa67YEOtKRY99puQlYCjH4m` (legacy PT-141) → use new PT-141 ID
- `price_1SfijWEOtKRY99puB9Rq4Lm3` (legacy Oxytocin) → use new Oxytocin Nasal Spray ID
- `price_1SmMlOEOtKRY99puBAxTpw99` (legacy hormone add-on subscription) → DELETE; rolled into ELEVATED TRT/HRT
- `price_1TDovoEOtKRY99pus14I47X3` (Founding Wellness Pass) → DELETE; Founding tiers discontinued
- `price_1TDovpEOtKRY99pu8sW2tl9N` (Founding Longevity) → DELETE
- `price_1TDovsEOtKRY99puPtteAgOu` (Founding Concierge) → DELETE
- `price_1SZiRMEOtKRY99pua6QMu12h` (Hormone Mapping $299) → DELETE; ZRT discontinued
- `price_1T1AbVEOtKRY99pumPdgj1k3` (legacy ZRT diagnostic) → DELETE
- `price_1SgcM9EOtKRY99puXlVr5s6o` (GLP-1 starter) → DELETE; rolled into ELEVATED GLP-1
- `price_1Sd8ChEOtKRY99pu7iaAF3Jd` (GLP-1 continuation) → DELETE; rolled into ELEVATED GLP-1
---
End of Pricing Source of Truth. Last updated 2026-06-28 (retatrutide $499/mo).
