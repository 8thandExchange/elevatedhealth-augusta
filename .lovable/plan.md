

## Analysis: Booking, Communication, and Stripe Consolidation

### Current State (Problems Found)

**1. Booking Flow Issues**
- The Google Calendar link in `siteConfig.ts` still says "Elevated Health Augusta" when patients see it
- The `ConsultationModal` still lists "Peptide Protocols" with a description mentioning "SPRAVATO® for depression, PTSD, and anxiety" — completely wrong for the rebrand
- The `Consult.tsx` page has a service card labeled "Ketamine Therapy" with the old description
- The consultation checkout edge function (`create-consultation-checkout`) still has service configs for "ketamine", "hair", and "sexual" with old descriptions referencing Elevated Health

**2. Stripe Pricing Mismatches**
- `CONSULTATION_PRICES.discovery` still shows `$99` / `$9900` — should be `$149` / `$14900`
- `CONSULTATION_CREDIT` still references `$99` — should be `$149`
- The summary table at the bottom of `stripeConfig.ts` is completely stale (references $99 consultations, $349 kits, "Elevated Architecture Protocol", etc.)
- The `create-consultation-checkout` edge function uses `price_data` with `unit_amount: 14900` (correct) but the config file says 9900
- `KETAMINE_PRICES` section is still fully defined — should be deprecated/hidden
- Old hormone membership tiers (Access $99/Vitality $149/Concierge $249) don't match the new founding member tiers (Wellness Pass $149→$199, Longevity $299→$399, Executive Concierge $549→$699)

**3. Membership Model Conflict**
- Two completely different membership models coexist:
  - **Old model** (in `HORMONE_MEMBERSHIP_TIERS`): Access/Vitality/Concierge at $99/$149/$249 — hormone-specific
  - **New model** (on Membership page): Wellness Pass/Longevity Protocol/Executive Concierge at $149/$299/$549 founding → $199/$399/$699 standard — comprehensive longevity bundles
- The Membership page has no Stripe checkout integration — the "Claim your founding rate" button calls `openBooking()` which opens the old consultation modal
- No Stripe products exist for the new membership tiers

### Recommendation

Rather than patching the Google Calendar (which still shows old branding), I recommend a **Stripe-gated booking flow** that you already partially have:

```text
Patient Journey:
┌─────────────────────────────────────────┐
│  1. Patient clicks "Book Now"           │
│  2. Consultation Modal opens            │
│     → 4 service cards (Hormones,        │
│       Weight Loss, IV Therapy, Peptides)│
│  3. Stripe checkout → $149 payment      │
│  4. Payment success page embeds         │
│     Google Calendar for scheduling      │
│  5. Patient picks a time slot           │
└─────────────────────────────────────────┘
```

This is already mostly built — we just need to fix the content and pricing.

### Implementation Plan

**Step 1: Fix `stripeConfig.ts` — Single Source of Truth**
- Update `CONSULTATION_PRICES.discovery` to $149
- Update `CONSULTATION_CREDIT` to $149
- Create new `FOUNDING_MEMBERSHIP_PRICES` section with 3 tiers matching the Membership page
- Comment out or deprecate `KETAMINE_PRICES`
- Update the summary table
- Clean up stale references to "Elevated"

**Step 2: Fix `ConsultationModal.tsx` — Service Selection**
- Replace the 3 current options with 4 aligned to active services:
  - Hormone Optimization (replaces "Hormone Replacement")
  - Medical Weight Loss (keep, fix description)
  - IV Therapy (new)
  - Peptide Protocols (fix description — remove SPRAVATO reference)
- All point to `create-consultation-checkout` with correct service types

**Step 3: Fix `create-consultation-checkout` Edge Function**
- Remove ketamine/hair/sexual service configs
- Add IV therapy service config
- Update all descriptions to Réveil branding
- Ensure `unit_amount: 14900` ($149) is used
- Change credit code prefix from `EH-` to `RV-`

**Step 4: Create Stripe Products for New Membership Tiers**
- Create 3 new Stripe products + prices:
  - Wellness Pass: $149/mo (founding) 
  - Longevity Protocol: $299/mo (founding)
  - Executive Concierge: $549/mo (founding)

**Step 5: Create `create-founding-membership-checkout` Edge Function**
- New edge function that accepts tier selection and creates Stripe subscription checkout
- No auth required (guest checkout supported for new patients)

**Step 6: Wire Membership Page to Stripe**
- Replace `openBooking()` on "Claim your founding rate" buttons with actual Stripe checkout calls per tier

**Step 7: Fix Remaining Booking Links**
- `Consult.tsx` — remove ketamine card, add IV and Peptide cards
- `BookingWidget.tsx` — verify $149 pricing text
- `FoundingMemberBanner.tsx` — wire "Claim your founding rate" to Membership page or checkout
- Update `PaymentSuccess.tsx`, `ConsultationConfirmed.tsx` to use Réveil branding in post-payment flow

**Step 8: Clean Up Edge Functions**
- Update product descriptions in `create-semaglutide-checkout` and `create-tirzepatide-checkout` to remove "Elevated Health" refs (already done in prior pass, verify)
- Ensure all success/cancel URLs point to correct Réveil routes

### Technical Details

**New Stripe products needed:**
| Tier | Founding Price | Standard Price | Mode |
|------|---------------|----------------|------|
| Wellness Pass | $149/mo | $199/mo | subscription |
| Longevity Protocol | $299/mo | $399/mo | subscription |
| Executive Concierge | $549/mo | $699/mo | subscription |

We'll create founding prices first (launch pricing). Standard prices can be created later when founding slots fill.

**Files to modify:**
- `src/lib/stripeConfig.ts` — pricing constants
- `src/components/ConsultationModal.tsx` — service cards
- `src/pages/Consult.tsx` — standalone consult page
- `src/pages/Membership.tsx` — wire to Stripe
- `src/components/FoundingMemberBanner.tsx` — CTA link
- `supabase/functions/create-consultation-checkout/index.ts` — service configs
- New: `supabase/functions/create-founding-membership-checkout/index.ts`
- `src/pages/PaymentSuccess.tsx` — post-payment branding

