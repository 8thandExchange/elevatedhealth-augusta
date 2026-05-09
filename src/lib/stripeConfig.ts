/**
 * Central Stripe Price & Product Configuration — Elevated Health Augusta
 *
 * Single source of truth for all Stripe price IDs.
 * Last audited: 2026-05-08 (Membership architecture cleanup)
 */

// ============================================================================
// CONSULTATIONS
// ============================================================================

export const CONSULTATION_PRICES = {
  discovery: {
    priceId: null, // Uses price_data for dynamic product naming per service type
    amount: 7900, // $79
    displayPrice: "$79",
    name: "Wellness Assessment",
    description: "45-minute initial consultation. Credited toward your protocol if you proceed.",
    mode: "payment" as const,
    edgeFunction: "create-consultation-checkout",
  },
} as const;

// ============================================================================
// DIAGNOSTIC KITS (legacy ZRT $250 hormone-mapping kit) — DEPRECATED
//
// Kept ONLY as a price-comparison reference for PricingComparison.tsx (which
// shows what the old $349 lab kit would have cost vs. the current Elevated
// pricing). The associated `create-hormone-checkout` edge function and
// provider-side "send kit link" surface were removed in the R-5 audit
// remediation. Do not wire this constant to any new checkout path.
// ============================================================================

export const DIAGNOSTIC_KIT_PRICES = {
  hormone: {
    priceId: "price_1T1AbVEOtKRY99pumPdgj1k3",
    amount: 25000, // $250 — historical reference only, no active checkout
    displayPrice: "$250",
    name: "Hormone Mapping Panel (legacy)",
    description: "Réveil-era ZRT Saliva Profile III. No longer offered.",
    zrtPanel: "saliva_iii",
    mode: "payment" as const,
  },
} as const;

// ============================================================================
// ELEVATED MEMBERSHIP — single tier ($199/mo)
// ============================================================================

/**
 * The one and only membership product.
 *
 * priceId is a placeholder. Create the recurring monthly $199 price in
 * Stripe (test + live) and replace the placeholder string in test/live
 * deploys via `VITE_STRIPE_ELEVATED_MEMBERSHIP_PRICE_ID` before launch.
 */
export const ELEVATED_MEMBERSHIP = {
  priceId:
    (typeof import.meta !== "undefined" &&
      (import.meta as any).env?.VITE_STRIPE_ELEVATED_MEMBERSHIP_PRICE_ID) ||
    "price_1TUs3LEOtKRY99puWfQy8pHj",
  amount: 19900, // $199/mo
  displayPrice: "$199/mo",
  name: "Elevated Membership",
  description:
    "Unlimited weekly visits, all in-office supplies, member-rate labs, quarterly physician check-in, 15% off IV add-ons. Medications billed separately at FCC cost-plus.",
  mode: "subscription" as const,
  interval: "month",
  edgeFunction: "create-elevated-membership-checkout",
} as const;

// ============================================================================
// À LA CARTE MEDICATIONS
// ============================================================================

export const ALACARTE_PRICES = {
  testosterone: {
    priceId: "price_1Sga66EOtKRY99puQgPWACIy",
    amount: 14900,
    displayPrice: "$149",
    name: "Testosterone Cream",
    description: "10-week testosterone cream fill (non-member pricing)",
    mode: "payment" as const,
    edgeFunction: "create-alacarte-checkout",
  },
  biEst: {
    priceId: "price_1Sga67EOtKRY99puoS8b5U6h",
    amount: 8900,
    displayPrice: "$89",
    name: "Bi-Est Cream",
    description: "30-day bi-estrogen cream fill (non-member pricing)",
    mode: "payment" as const,
    edgeFunction: "create-alacarte-checkout",
  },
  progesterone: {
    priceId: "price_1Sga69EOtKRY99puO8NJ5bpx",
    amount: 7900,
    displayPrice: "$79",
    name: "Progesterone",
    description: "30-day progesterone fill (non-member pricing)",
    mode: "payment" as const,
    edgeFunction: "create-alacarte-checkout",
  },
  followUp: {
    priceId: "price_1Sga6AEOtKRY99puEx0mC3jx",
    amount: 9900,
    displayPrice: "$99",
    name: "Follow-up Consultation",
    description: "Provider follow-up consultation (non-member pricing)",
    mode: "payment" as const,
    edgeFunction: "create-alacarte-checkout",
  },
  labPanel: {
    priceId: "price_1T1AbVEOtKRY99pumPdgj1k3",
    amount: 25000,
    displayPrice: "$250",
    name: "Lab Panel",
    description: "Comprehensive hormone lab panel (non-member pricing)",
    mode: "payment" as const,
    edgeFunction: "create-alacarte-checkout",
  },
} as const;

// ============================================================================
// GLP-1 MEDICATION PRICES
// ============================================================================

/**
 * Per-medication, member vs non-member pricing.
 *
 * Replaces the legacy TIERED_GLP1_PRICES (vitality / concierge variants).
 * Edge functions look up the patient's elevated_membership_status and
 * route to .member or .nonmember accordingly.
 *
 * NOTE — Three of these four price IDs do NOT yet exist in Stripe and are
 * marked with `price_TODO_...`. The user must create the corresponding
 * recurring monthly Stripe Products/Prices in test + live mode and
 * replace the placeholder strings, OR provide them via env vars listed
 * in LAUNCH_CHECKLIST.md before publishing.
 *
 * The only Price ID confirmed against Stripe is tirzepatide.nonmember
 * ($499/mo) which reuses the existing `Tirzepatide Membership` product.
 */
export const GLP1_MEDICATION_PRICES = {
  semaglutide: {
    member: {
      priceId: "price_1TUs38EOtKRY99puPpc6SFMs",
      amount: 19900,
      displayPrice: "$199/mo",
    },
    nonmember: {
      priceId: "price_1TUs3AEOtKRY99puDOseqLDZ",
      amount: 24900,
      displayPrice: "$249/mo",
    },
  },
  tirzepatide: {
    member: {
      priceId: "price_1TUs39EOtKRY99puWAF4oZT7",
      amount: 39900,
      displayPrice: "$399/mo",
    },
    nonmember: {
      priceId: "price_1SlZnyEOtKRY99puE9JNOrTR",
      amount: 49900,
      displayPrice: "$499/mo",
    },
  },
} as const;

// ============================================================================
// WEIGHT LOSS / GLP-1 MEMBERSHIPS (legacy — kept as display-only metadata)
// ============================================================================

export const WEIGHT_LOSS_PRICES = {
  semaglutide: {
    priceId: GLP1_MEDICATION_PRICES.semaglutide.nonmember.priceId,
    amount: GLP1_MEDICATION_PRICES.semaglutide.nonmember.amount,
    displayPrice: GLP1_MEDICATION_PRICES.semaglutide.nonmember.displayPrice,
    memberDisplayPrice: GLP1_MEDICATION_PRICES.semaglutide.member.displayPrice,
    name: "Semaglutide Membership",
    description: "Monthly Semaglutide GLP-1 medication with provider support",
    mode: "subscription" as const,
    interval: "month",
    edgeFunction: "create-semaglutide-checkout",
  },
  tirzepatide: {
    priceId: GLP1_MEDICATION_PRICES.tirzepatide.nonmember.priceId,
    amount: GLP1_MEDICATION_PRICES.tirzepatide.nonmember.amount,
    displayPrice: GLP1_MEDICATION_PRICES.tirzepatide.nonmember.displayPrice,
    memberDisplayPrice: GLP1_MEDICATION_PRICES.tirzepatide.member.displayPrice,
    name: "Tirzepatide Membership",
    description: "Monthly Tirzepatide GLP-1/GIP medication with provider support",
    mode: "subscription" as const,
    interval: "month",
    edgeFunction: "create-tirzepatide-checkout",
  },
} as const;

// ============================================================================
// HAIR RESTORATION (Legacy — service sunsetted)
// ============================================================================

export const HAIR_RESTORATION_PRICES = {
  minoxidilFinasteride: { priceId: "price_1SfijTEOtKRY99puE2WxgmrI", amount: 12900, displayPrice: "$129/mo", name: "Minoxidil + Finasteride", description: "Combination topical therapy for hair regrowth", mode: "subscription" as const, interval: "month", productKey: "minoxidil_finasteride", edgeFunction: "create-hair-restoration-checkout" },
  dutasteride: { priceId: "price_1SfijUEOtKRY99puH5TqvFks", amount: 14900, displayPrice: "$149/mo", name: "Dutasteride", description: "Advanced DHT blocker for hair loss", mode: "subscription" as const, interval: "month", productKey: "dutasteride", edgeFunction: "create-hair-restoration-checkout" },
  ghkCuScalp: { priceId: "price_1SfijVEOtKRY99puXq7N3Lp2", amount: 14900, displayPrice: "$149/mo", name: "GHK-Cu Scalp Therapy", description: "Copper peptide serum for scalp health", mode: "subscription" as const, interval: "month", productKey: "ghk_cu_scalp", edgeFunction: "create-hair-restoration-checkout" },
} as const;

// ============================================================================
// SEXUAL WELLNESS (Legacy — service sunsetted)
// ============================================================================

export const SEXUAL_WELLNESS_PRICES = {
  tadalafil: { priceId: "price_1SfijREOtKRY99puq0ITndfC", amount: 9900, displayPrice: "$99/mo", name: "Tadalafil (Cialis)", description: "Daily or as-needed ED medication", mode: "subscription" as const, interval: "month", productKey: "tadalafil", edgeFunction: "create-sexual-wellness-checkout" },
  sildenafil: { priceId: "price_1SfijSEOtKRY99pumi7jjNvs", amount: 7900, displayPrice: "$79/mo", name: "Sildenafil (Viagra)", description: "As-needed ED medication", mode: "subscription" as const, interval: "month", productKey: "sildenafil", edgeFunction: "create-sexual-wellness-checkout" },
  pt141: { priceId: "price_1Sa67YEOtKRY99puQlYCjH4m", amount: 22500, displayPrice: "$225", name: "PT-141 (Bremelanotide)", description: "Peptide therapy for libido enhancement", mode: "payment" as const, productKey: "pt141", edgeFunction: "create-sexual-wellness-checkout" },
  oxytocinNasal: { priceId: "price_1SfijWEOtKRY99puB9Rq4Lm3", amount: 8900, displayPrice: "$89/mo", name: "Oxytocin Nasal Spray", description: "Bonding and intimacy enhancement", mode: "subscription" as const, interval: "month", productKey: "oxytocin_nasal", edgeFunction: "create-sexual-wellness-checkout" },
} as const;

// ============================================================================
// ADMINISTRATIVE / OTHER
// ============================================================================

export const ADMIN_PRICES = {
  rebookingFee: {
    priceId: "price_1Sa5UFEOtKRY99pupEQlaFvN",
    amount: 0,
    displayPrice: "See Stripe",
    name: "Appointment Rebooking Fee",
    description: "Fee for rescheduling a missed appointment",
    mode: "payment" as const,
    edgeFunction: "create-rebooking-checkout",
  },
} as const;

// ============================================================================
// CONSULTATION CREDIT
// ============================================================================

export const CONSULTATION_CREDIT = {
  amount: 7900, // $79 in cents
  displayAmount: "$79",
  description: "Credit toward treatment when consultation is paid first",
} as const;

// ============================================================================
// HELPER TYPES
// ============================================================================

export type ConsultationPriceKey = keyof typeof CONSULTATION_PRICES;
export type DiagnosticKitPriceKey = keyof typeof DIAGNOSTIC_KIT_PRICES;
export type AlacartePriceKey = keyof typeof ALACARTE_PRICES;
export type WeightLossPriceKey = keyof typeof WEIGHT_LOSS_PRICES;
export type HairRestorationPriceKey = keyof typeof HAIR_RESTORATION_PRICES;
export type SexualWellnessPriceKey = keyof typeof SEXUAL_WELLNESS_PRICES;
export type AdminPriceKey = keyof typeof ADMIN_PRICES;

// ============================================================================
// AUDIT HELPER
// ============================================================================

export const getAllPriceIds = (): string[] => {
  const allPrices = [
    ELEVATED_MEMBERSHIP,
    ...Object.values(DIAGNOSTIC_KIT_PRICES),
    ...Object.values(WEIGHT_LOSS_PRICES),
    ...Object.values(ADMIN_PRICES),
  ];
  return allPrices
    .map((p) => p.priceId as string | null)
    .filter((id): id is string => !!id && !id.startsWith("price_TODO_"));
};
