# Hormone & Peptide Care Membership

## The model (yes, this matches industry norm)

Most reputable hormone/peptide clinics use exactly this structure: a flat monthly **care fee** that bundles the *clinical service* (visits, injections, supplies, draw fees), with **medication and lab panels billed at cost** as pass-throughs. It keeps the membership margin predictable, avoids prescribing pressure, and stays clean for compliance (you're not "selling drugs by subscription").

### What's included in the base monthly fee
- **Unlimited in-clinic injection visits** (RN administered — testosterone, peptides, B12, lipo, etc.)
- All in-visit **supplies** (syringes, needles, alcohol, sharps disposal, bandages)
- **Lab draw / specimen collection fee** (phlebotomy in-house)
- Provider messaging + dose adjustments
- Home delivery coordination for take-home items (creams, oral peptides)

### What's billed separately (pass-through, transparent)
- **Medication cost** — itemized per refill (compound cream, GLP-1 pen, peptide vial)
- **Lab panel cost** — LabCorp/ZRT invoice forwarded at cost or +small handling
- MD escalation visits (if needed beyond RN scope) — $149

### Administration rules
- **In-clinic primary** for injectables (T cypionate, peptides, B12). Bulk vial sourcing → better unit cost, weekly touchpoint = upsell opportunity (IV add-on, supplement, etc.)
- **Home delivery** for transdermal creams and oral protocols only — shipped from compounding pharmacy
- No take-home injectables in standard membership (keeps liability/sharps clean). Travel exception handled case-by-case.

## Proposed tiers

| Tier | Monthly | Best for | Includes |
|---|---|---|---|
| **Hormone Care** | $149/mo | T cream or estradiol/progesterone patients | Unlimited visits, draws, supplies, cream delivery |
| **Hormone + Injection** | $249/mo | Men on testosterone cypionate, women on injectable estradiol | Above + weekly injection visits |
| **Peptide Performance** | $299/mo | BPC-157, CJC/Ipa, GHK-Cu, Tesamorelin patients | Above + peptide-specific titration & weekly admin |
| **Full Optimization** | $449/mo | Hormone + Peptide stacked | Both programs combined, priority scheduling |

Founding-rate slots (25 per tier) consistent with existing Réveil founding model.

## Patient experience

```text
Enroll  →  Hormone Mapping Kit ($250 one-time) or LabCorp panel
       →  MD protocol set ($149 if not already established)
       →  Membership starts → schedule weekly injection slot
       →  Cream/oral refills auto-ship monthly
       →  Lab + Rx invoices itemized in patient portal
```

## What to build

### 1. Public marketing
- New `/care-membership` page (or section on `/membership`) explaining the 4 tiers, what's included vs separate, FAQ on med/lab pass-through
- Update `Hormones.tsx`, `PeptideTherapy.tsx`, `WeightLoss.tsx` with "Join Care Membership" CTA replacing one-off pricing emphasis
- Update homepage `MembershipTierSelector` / `FoundingMemberBanner` to surface the new tiers

### 2. Stripe products
Create 4 new recurring prices:
- `care_hormone` $149/mo
- `care_hormone_injection` $249/mo
- `care_peptide` $299/mo
- `care_full` $449/mo

Reuse existing `create-founding-membership-checkout` pattern; extend `stripeConfig.ts` tier map.

### 3. Database
Migration to add membership tracking to `patients`:
- `care_membership_tier` text (null | hormone | hormone_injection | peptide | full)
- `care_membership_started_at` timestamptz
- `care_membership_status` text (active | paused | cancelled)
- `stripe_subscription_id` text

New table `membership_visit_log` to track unlimited-visit usage for ops reporting:
- patient_id, visit_date, service (injection type), administered_by, supplies_used jsonb

### 4. Provider/admin UI
- Patient chart badge showing active care tier + "weekly visit due" indicator
- "Quick log injection" button on appointment check-in → writes to `membership_visit_log`, no charge
- Office manager dashboard: weekly visit count per patient, med refill due list

### 5. Patient portal
- "My Membership" card showing tier, next billing, this-month visit count, upcoming refill ship dates
- Itemized invoice section separating membership fee / med charges / lab charges

### 6. Booking flow
- Members see free in-clinic injection slots (no checkout) vs non-members see paid slot
- `book-consult-appointment` edge function checks `care_membership_status='active'` and skips Stripe charge for injection appointments

## Open considerations (flag, don't block)
- **Bulk vial sourcing** — pharmacy contract for testosterone cypionate 10mL vials needs to be in place before "Hormone + Injection" tier launches
- **Sharps & supply cost** at unlimited cadence — model assumes ~4 visits/mo avg; review after 60 days
- **GLP-1** — currently routed through compounding pharmacy direct-pay; recommend keeping out of bundled tier (margin too volatile) and offering as add-on med pass-through
