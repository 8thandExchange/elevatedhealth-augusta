# Elevated Health Augusta — Membership & Labs Pricing Reference

This document is the single source of truth for membership pricing structure and lab catalog pricing at launch. It exists so that anyone on the team — physician, admin, marketing, or developer — can confirm what we charge and why without reverse-engineering it from the Lovable codebase.

When pricing changes (which it will, once you have real-world data), update this document and update the corresponding rows in the database. Don't change one without the other.

---

## SECTION 1 — MEMBERSHIP

### Single tier — Elevated Membership at $199/month

Decided to launch with one tier. Two-tier and program-tiered structures were considered and rejected for the reasons in `eh-v2-architecture.md`. Add a Concierge tier ($399 with included monthly Myers + quarterly NAD + same-day appointment guarantees) at month 6 once you have member usage data to inform what real differentiation looks like.

### What's included

- Unlimited weekly clinic visits for therapy administration (the routine 15-minute injection visits with Caroline)
- All in-office supplies needed for administration (syringes, alcohol pads, tegaderm, gauze, sharps disposal)
- Member-rate labs — roughly 40% off non-member pricing on à la carte tests, $50 off on each named panel
- Dedicated SMS line to Caroline (responses within business hours; not a 24/7 line)
- Full patient portal access — chart, labs, superbills, refill requests, secure messaging
- 15% off all à la carte IV add-ons (B12, glutathione, magnesium, taurine, etc.)
- Priority booking — members get 24-hour advance access to newly opened appointment slots before they're shown to non-members
- Quarterly 15-minute physician check-in (telehealth via Doxy.me or in-person, member's choice)

### What's NOT included (billed separately)

- The medication itself. Each Rx is billed at member-cost-plus pricing — typically a 30-50% margin to the clinic, well below standalone retail pricing. Patient sees the cost line item and the markup transparency.
- Major IV protocols (Myers Cocktail at $185, NAD+ infusions at $450/$750, custom IV builds). Members get the 15% add-on discount but the base IV is full-priced.
- Specialty procedures or services added later (PRP, microneedling if you ever offer those, etc.)
- Lab tests beyond what's required for protocol monitoring. Members get member-rate pricing; they don't get unlimited free labs.

### Cancellation, pause, billing rules

- Monthly subscription, billed via Stripe on the same day each month
- Cancellable anytime through the Stripe Customer Portal or by contacting admin
- 30-day notice required — you're billed for the next cycle if you cancel within 30 days of the renewal
- No proration on cancellation — service continues through the end of the paid period
- Pause option — 30-90 days, requires admin approval (handles vacation, surgery recovery, financial hardship). Stripe subscription is paused, no charges, no member benefits during pause, all benefits reactivate when unpaused
- Failed payment — first failure triggers retry in 3 days, second failure triggers admin notification SMS, third failure auto-pauses membership and notifies patient

### Why $199 specifically

The number signals concierge without creating a barrier at the entry point. $149 reads as a value tier and undermines the brand positioning; $249+ creates resistance at first decision. At $199, the patient doing the math sees: 4 weekly visits/month × $50/visit standalone = $200, so they're effectively getting the visits at cost and everything else as bonus. That's the right value perception for a membership program.

The clinic's economics: Caroline is salaried; the marginal cost of adding one more 15-minute admin visit to her day is minimal (mostly supplies cost ~$3-5/visit). The clinic makes margin on the medication, the lab markups, the add-on IVs, and the operational stability of recurring revenue. The membership itself is roughly break-even — that's intentional. It's the relationship moat.

### Stripe configuration

Configured as one Stripe Product with one recurring monthly Price.

```
Product: Elevated Membership
Price: $199.00 USD recurring monthly
Billing cycle anchor: enrollment date
Cancel behavior: cancel at end of period
Tax: collect_tax enabled (Stripe Tax for Georgia)
```

Once Stripe is configured, paste the price_id into membership_tiers.stripe_price_id WHERE slug = 'elevated'. The `eh-v2-schema-additions.sql` seeds the tier row but leaves stripe_price_id NULL — that's a deliberate placeholder you fill in after Stripe setup.

### Membership compatibility with multiple programs

A single Elevated Membership covers a patient across all programs. A patient on hormones AND a GLP-1 AND doing peptide recovery is one $199/month, with all weekly visits and supplies covered. Medications are billed separately per program.

This is a deliberate design decision. Tiering by program would force the all-in patient — your most valuable patient — to manage three subscriptions and pay $597/month in membership fees. That's bad UX and worse retention. The medication line items handle the variable economics; membership is consistent across the patient base.

---

## SECTION 2 — LABS

### Pricing model — hybrid panels + à la carte

Five named panels for the common scenarios. Roughly 30 individual à la carte tests for everything else. Members pay roughly 40% less than non-members on à la carte. Each panel has both a member and non-member bundled price.

### The five launch panels

#### Foundation Wellness Panel — $295 / member $245
Recommended as the baseline for any patient. Comprehensive screen covering blood counts, kidneys, liver, electrolytes, glucose control, lipids, vitamin D status, thyroid, iron, and inflammation.

Tests included (8): CBC w/Diff, Comprehensive Metabolic Panel, Lipid Panel, Hemoglobin A1c, Vitamin D 25-OH, TSH, Ferritin, hs-CRP

LabCorp client cost (estimated): ~$80
Margin at non-member pricing: ~73%
Margin at member pricing: ~67%

#### Hormone Optimization Panel — Female — $395 / member $345
For women presenting for BHRT consultation. Foundation panel plus female-specific hormone evaluation and a comprehensive thyroid workup.

Tests included (19): Foundation panel + Estradiol Sensitive, Progesterone, Total Testosterone, Free Testosterone, DHEA-S, FSH, LH, SHBG, Free T3, Free T4, TPO Antibodies

LabCorp client cost: ~$165
Margin at non-member pricing: ~58%
Margin at member pricing: ~52%

#### Hormone Optimization Panel — Male — $395 / member $345
For men presenting for TRT consultation. Foundation panel plus male-specific hormone evaluation. PSA included for patients age 40 or older (clinical safety standard before initiating TRT).

Tests included (17): Foundation panel + Total Testosterone, Free Testosterone, Estradiol Sensitive, DHEA-S, SHBG, PSA Total (≥40), LH, Free T3, Free T4

LabCorp client cost: ~$155
Margin at non-member pricing: ~61%
Margin at member pricing: ~55%

#### Weight Optimization Panel — $345 / member $295
For patients presenting for GLP-1 weight loss. Foundation panel plus the metabolic-specific markers that contextualize GLP-1 therapy and identify patients who need additional intervention beyond medication.

Tests included (13): Foundation panel + Insulin (fasting), Leptin, AM Cortisol, Free T3, Free T4

LabCorp client cost: ~$140
Margin at non-member pricing: ~59%
Margin at member pricing: ~52%

#### Sexual Wellness Panel — $245 / member $195
Focused panel for sexual health evaluation — TRT candidacy, female sexual wellness work-up, PT-141 candidacy. Skips the inflammatory and vitamin markers that aren't directly relevant.

Tests included (7): CBC w/Diff, Comprehensive Metabolic Panel, Total Testosterone, Free Testosterone, Estradiol Sensitive, Prolactin, SHBG

LabCorp client cost: ~$95
Margin at non-member pricing: ~61%
Margin at member pricing: ~51%

### À la carte tests — full menu

Members pay roughly 40% less than non-members. Pricing reflects test complexity and turnaround time.

| Category | Test | Member | Non-Member |
|---|---|---|---|
| CBC | CBC w/Diff | $25 | $45 |
| Metabolic | Comprehensive Metabolic Panel | $35 | $65 |
| Metabolic | Ferritin | $25 | $45 |
| Lipid | Lipid Panel | $35 | $65 |
| Glycemic | HbA1c | $25 | $45 |
| Vitamin | Vitamin D 25-OH | $35 | $65 |
| Thyroid | TSH | $25 | $45 |
| Thyroid | Free T3 | $35 | $65 |
| Thyroid | Free T4 | $35 | $65 |
| Thyroid | TPO Antibodies | $45 | $85 |
| Thyroid | Thyroglobulin Antibodies | $45 | $85 |
| Thyroid | Full Thyroid Panel (TSH/fT3/fT4/TPO/Tg) | $145 | $245 |
| Inflammatory | hs-CRP | $25 | $45 |
| Hormone — male/general | Total Testosterone | $35 | $65 |
| Hormone — male/general | Free Testosterone | $55 | $95 |
| Hormone — male/general | Estradiol Sensitive | $45 | $85 |
| Hormone — female | Progesterone | $35 | $65 |
| Hormone — male/general | DHEA-S | $35 | $65 |
| Hormone — male/general | SHBG | $35 | $65 |
| Hormone — female | FSH | $25 | $45 |
| Hormone — female | LH | $25 | $45 |
| Hormone — male/general | AM Cortisol | $35 | $65 |
| Hormone — male/general | Prolactin | $30 | $55 |
| Tumor marker | PSA Total | $35 | $65 |
| Tumor marker | PSA Free | $55 | $95 |
| Hormone — peptide | IGF-1 | $85 | $145 |
| Cardiovascular | NMR LipoProfile | $145 | $245 |
| Cardiovascular | ApoB | $45 | $85 |
| Cardiovascular | Lp(a) | $45 | $85 |
| Cardiovascular | Homocysteine | $35 | $65 |
| Metabolic advanced | Insulin (fasting) | $35 | $65 |
| Metabolic advanced | Leptin | $45 | $85 |
| Comprehensive | Comprehensive Cardiovascular (NMR + ApoB + Lp(a) + Homocysteine + hs-CRP) | $345 | $545 |

### How prices were set

Each test has a LabCorp client cost (what the clinic pays LabCorp under the client billing agreement — typically 30-60% of LabCorp's published list prices). Pricing was set so that:

- Bundled panel margin lands in the 50-70% range (concierge but not extractive)
- À la carte member pricing lands at 40-60% margin (still profitable, but the member benefit is real)
- À la carte non-member pricing lands at 60-75% margin (matches market for cash-pay specialty labs)
- Member savings vs non-member is consistently ~40% on à la carte and ~$50 on panels (clear value story)

The actual LabCorp client costs are estimates based on industry benchmarks. Once you have your contracted client billing schedule from LabCorp, update `lab_tests.labcorp_cost_cents` with the actual numbers and re-evaluate margins. If actual costs are meaningfully different from estimates, adjust patient pricing accordingly.

### Operational pricing rules

- Lab order pricing is calculated at order time and snapshot into `lab_order_items.charged_cents`. If pricing later changes, existing orders are unaffected.
- Member status is checked at order time, not at result time. If a patient's membership lapses between order and result, they were charged member rate at order — that's fine, the order completes at the locked-in price.
- Bundled panel discount only applies if the patient orders the full panel as configured. Customizing a panel (removing tests) reverts to à la carte pricing for the included tests. The UI shows the savings difference so physicians can advise patients.
- À la carte tests added on top of a panel are charged at à la carte member/non-member rate.

### What's NOT in the launch lab catalog

These are tests we don't offer at launch but the physician may want to add later:

- Genetic testing (BRCA, Lynch syndrome, pharmacogenomic panels) — high cost, niche use case, not central to launch services
- Food sensitivity panels (IgG-based) — clinical evidence is mixed, often considered fringe medicine
- Heavy metals panels (urine or blood) — controversial in non-occupational contexts
- Hormone urinary metabolites (DUTCH test) — popular in functional medicine but expensive and not standardized
- Stool microbiome testing (GI Map, GI Effects) — relevant for gut health workups but high cost and outside our launch scope
- Allergen panels (RAST testing) — not central to our service mix

These can be added in month 3-6 once you see what patients are actually asking for. Adding them to the catalog requires:
1. Determining LabCorp client cost
2. Setting member and non-member prices using the margin framework above
3. Adding the row to `lab_tests` with the appropriate category
4. Updating this document

### LabCorp specimen and turnaround logistics

- Most tests draw on serum (gold-top tube), some on whole blood (lavender), specific cardiovascular markers on plasma (lavender or green), urine for any urine-based tests
- Caroline draws all specimens at the consult visit
- Specimens go into the LabCorp pickup bin in the clinic refrigerator (2-8°C)
- LabCorp courier picks up daily — confirm route timing with your local LabCorp office (typically 4-6pm in Augusta region)
- Turnaround: most tests are 1-2 business days; advanced tests (NMR LipoProfile, antibody panels, IGF-1) are 2-3 business days
- Patient gets SMS notification when results post to their portal: "Your lab results are in. Book your follow-up consultation here: [link]"

---

## SECTION 3 — HOW TO ITERATE THIS PRICING

Pricing is hypothesis until validated. Track these metrics monthly post-launch and revisit pricing at month 3 and month 6:

**For membership:**
- New member enrollments per month
- Member churn rate (cancellations / total members)
- Average member tenure
- Average revenue per member (membership $199 + medication margin + add-on IVs + member-rate labs)
- Member visit utilization (visits/member/month — under 2 means members aren't getting value)

**For labs:**
- Lab orders per month
- Average lab order value
- Panel-to-à-la-carte ratio (target: 70%+ panels for simplicity)
- Member vs non-member lab volume
- Lab gross margin (revenue - LabCorp costs)

If member churn is high (>5%/month), the issue is usually one of: visits aren't perceived as valuable enough, supplies aren't fully covering what patients expect, or the medication pricing on top feels unfair. Survey churned members and adjust.

If panel orders are <50% of lab orders, the panels aren't well-tuned to the consult types — physicians are customizing too much. Look at what tests are most-frequently added or removed and rebuild the panels to match.

If member-rate labs are <30% of lab volume, you have a member education problem — members aren't being told their lab discount. Build the discount visibility into the member dashboard and into the lab order checkout flow.

This document updates whenever pricing or structure changes. Last updated: launch v1.

---

## QUICK REFERENCE CARD

For the team to keep handy:

```
MEMBERSHIP
  Elevated Membership: $199/month
  Includes: weekly visits, supplies, member labs, SMS to Caroline,
    portal access, 15% off IV add-ons, priority booking,
    quarterly physician check-in
  Cancel: anytime via Stripe Customer Portal, 30-day notice

LAB PANELS (non-member / member)
  Foundation Wellness:        $295 / $245
  Hormone Female:             $395 / $345
  Hormone Male:               $395 / $345
  Weight Optimization:        $345 / $295
  Sexual Wellness:            $245 / $195

LAB À LA CARTE (most common)
  CBC w/Diff:                 $45 / $25
  Total Testosterone:         $65 / $35
  Free Testosterone:          $95 / $55
  Estradiol Sensitive:        $85 / $45
  Vitamin D 25-OH:            $65 / $35
  Full Thyroid (5 tests):     $245 / $145
  IGF-1 (peptide patients):   $145 / $85

CONSULT
  Initial consult:            $79 (any program)
  Follow-up (post-labs):      $150 (member: free)

IV MENU
  Myers Cocktail:             $185
  Glutathione Push:           $95
  NAD+ 250mg:                 $450
  NAD+ 500mg:                 $750
  Lipotropic IM:              $45
  B12 IM:                     $30
  Custom IV (base):           from $145
```
