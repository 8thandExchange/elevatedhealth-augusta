/**
 * Central Stripe Price & Product Configuration — Réveil
 * 
 * Single source of truth for all Stripe price IDs.
 * Last audited: 2026-03-22
 */

// ============================================================================
// CONSULTATIONS
// ============================================================================

export const CONSULTATION_PRICES = {
  discovery: {
    priceId: null, // Uses price_data for dynamic product naming per service type
    amount: 14900, // $149
    displayPrice: "$149",
    name: "Clinical Strategy Session",
    description: "30-minute in-person consultation at Réveil. Non-refundable. Applied as credit toward treatment if you proceed.",
    mode: "payment" as const,
    edgeFunction: "create-consultation-checkout",
  },
} as const;

// ============================================================================
// DIAGNOSTIC KITS (ZRT Labs)
// ============================================================================

export const DIAGNOSTIC_KIT_PRICES = {
  hormone: {
    priceId: "price_1T1AbVEOtKRY99pumPdgj1k3",
    amount: 25000, // $250
    displayPrice: "$250",
    name: "Hormone Mapping Panel",
    description: "ZRT Saliva Profile III - Comprehensive at-home saliva test kit covering Cortisol, DHEA-S, Estradiol, Progesterone & Testosterone. Includes follow-up consultation after results return.",
    zrtPanel: "saliva_iii",
    mode: "payment" as const,
    edgeFunction: "create-hormone-checkout",
  },
} as const;

// ============================================================================
// FOUNDING MEMBERSHIP TIERS (Subscription)
// ============================================================================

export const FOUNDING_MEMBERSHIP_TIERS = {
  wellnessPass: {
    priceId: "price_1TDovoEOtKRY99pus14I47X3",
    productId: "prod_UCDMrjQWioTNNT",
    amount: 14900, // $149/mo founding
    standardAmount: 19900, // $199/mo standard
    displayPrice: "$149/mo",
    standardDisplayPrice: "$199/mo",
    name: "Wellness Pass",
    tagline: "Essential IV Access",
    description: "2 IV infusions/month, Glutathione push, priority booking, 10% off add-ons",
    mode: "subscription" as const,
    interval: "month",
    edgeFunction: "create-founding-membership-checkout",
    features: [
      "2 IV infusions per month",
      "1 Glutathione push included",
      "Priority same-day booking",
      "10% off additional IVs and add-ons",
      "Member health portal access",
    ],
  },
  longevityProtocol: {
    priceId: "price_1TDovpEOtKRY99pu8sW2tl9N",
    productId: "prod_UCDMcSRfYNyRCo",
    amount: 29900, // $299/mo founding
    standardAmount: 39900, // $399/mo standard
    displayPrice: "$299/mo",
    standardDisplayPrice: "$399/mo",
    name: "Longevity Protocol",
    tagline: "Most Popular",
    description: "Everything in Wellness Pass + peptide protocol, physician check-ins, quarterly labs, NAD+",
    mode: "subscription" as const,
    interval: "month",
    edgeFunction: "create-founding-membership-checkout",
    features: [
      "Everything in Wellness Pass",
      "1 peptide protocol (Sermorelin or CJC/Ipamorelin)",
      "Monthly physician check-in",
      "Quarterly biomarker panel",
      "NAD+ IV once per quarter",
      "15% off all additional services",
    ],
  },
  executiveConcierge: {
    priceId: "price_1TDovsEOtKRY99puPtteAgOu",
    productId: "prod_UCDM8dfK4drhF1",
    amount: 54900, // $549/mo founding
    standardAmount: 69900, // $699/mo standard
    displayPrice: "$549/mo",
    standardDisplayPrice: "$699/mo",
    name: "Executive Concierge",
    tagline: "Premium",
    description: "Full HRT/BHRT, unlimited IVs, 2 peptide protocols, direct physician access",
    mode: "subscription" as const,
    interval: "month",
    edgeFunction: "create-founding-membership-checkout",
    features: [
      "Everything in Longevity Protocol",
      "Full HRT/BHRT management included",
      "Unlimited IVs (up to 4/month)",
      "2 peptide protocols simultaneously",
      "Direct physician access during business hours",
      "Annual comprehensive longevity panel",
      "2 guest IV visits per quarter",
    ],
  },
} as const;

export type FoundingMembershipTier = keyof typeof FOUNDING_MEMBERSHIP_TIERS;

// ============================================================================
// LEGACY MEMBERSHIPS (Deprecated — kept for existing subscribers)
// ============================================================================

export const MEMBERSHIP_PRICES = {
  vitality: {
    priceId: "price_1Sga64EOtKRY99pu6NpP45Qq",
    amount: 24900,
    displayPrice: "$249/mo",
    name: "Vitality Membership (Legacy)",
    description: "Monthly hormone optimization with provider support",
    mode: "subscription" as const,
    interval: "month",
    edgeFunction: "create-vitality-checkout",
  },
  hormoneAddon: {
    priceId: "price_1SmMlOEOtKRY99puBAxTpw99",
    amount: 14900,
    displayPrice: "$149/mo",
    name: "Hormone Add-On for GLP-1 Members",
    description: "Discounted hormone therapy add-on for Semaglutide or Tirzepatide members.",
    mode: "subscription" as const,
    interval: "month",
    edgeFunction: "create-hormone-addon-checkout",
  },
} as const;

// Legacy hormone tiers — preserved for existing subscribers only
export const HORMONE_MEMBERSHIP_TIERS = {
  access: {
    priceId: "price_1Soo21EOtKRY99pursQ4Vnh3",
    amount: 9900,
    displayPrice: "$99/mo",
    name: "ACCESS",
    tagline: "Entry Point",
    description: "Portal access, secure messaging, 2 provider consults/year",
    mode: "subscription" as const,
    interval: "month",
    edgeFunction: "create-hormone-membership-checkout",
    benefits: {
      consultsPerYear: 2,
      labDiscountPercent: 20,
      labDiscountedPrice: 20000,
      glp1DiscountPercent: 0,
      has90DayRx: false,
      priorityScheduling: false,
      directProviderLine: false,
    },
  },
  vitality: {
    priceId: "price_1Soo23EOtKRY99puIku6s4DU",
    amount: 14900,
    displayPrice: "$149/mo",
    name: "VITALITY",
    tagline: "Most Popular",
    description: "4 consults/year, priority scheduling, 90-day Rx access",
    mode: "subscription" as const,
    interval: "month",
    edgeFunction: "create-hormone-membership-checkout",
    benefits: {
      consultsPerYear: 4,
      labDiscountPercent: 30,
      labDiscountedPrice: 17500,
      glp1DiscountPercent: 10,
      has90DayRx: true,
      priorityScheduling: true,
      directProviderLine: false,
    },
  },
  concierge: {
    priceId: "price_1Soo25EOtKRY99puMndJjRr4",
    amount: 24900,
    displayPrice: "$249/mo",
    name: "CONCIERGE",
    tagline: "Premium",
    description: "Unlimited consults, direct provider line, best discounts",
    mode: "subscription" as const,
    interval: "month",
    edgeFunction: "create-hormone-membership-checkout",
    benefits: {
      consultsPerYear: -1,
      labDiscountPercent: 40,
      labDiscountedPrice: 15000,
      glp1DiscountPercent: 15,
      has90DayRx: true,
      priorityScheduling: true,
      directProviderLine: true,
    },
  },
} as const;

export const TIERED_GLP1_PRICES = {
  semaglutide: {
    full: { priceId: "price_1SlZnwEOtKRY99puaBhrh2iB", amount: 39900, displayPrice: "$399/mo" },
    vitality: { priceId: "price_1Soo27EOtKRY99punKCdKBDe", amount: 35900, displayPrice: "$359/mo" },
    concierge: { priceId: "price_1Soo29EOtKRY99pulu8UKUJt", amount: 33900, displayPrice: "$339/mo" },
  },
  tirzepatide: {
    full: { priceId: "price_1SlZnyEOtKRY99puE9JNOrTR", amount: 49900, displayPrice: "$499/mo" },
    vitality: { priceId: "price_1Soo2AEOtKRY99puMopN9V2Q", amount: 44900, displayPrice: "$449/mo" },
    concierge: { priceId: "price_1Soo2CEOtKRY99puKfwGnQOw", amount: 42400, displayPrice: "$424/mo" },
  },
} as const;

export type HormoneMembershipTier = keyof typeof HORMONE_MEMBERSHIP_TIERS;

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
// KETAMINE THERAPY (Legacy — service sunsetted from public site)
// ============================================================================

export const KETAMINE_PRICES = {
  deposit: {
    priceId: "price_1Sa5jwEOtKRY99puYK2lpDw5",
    amount: 15000,
    displayPrice: "$150",
    name: "Ketamine Therapy Deposit",
    description: "Deposit for ketamine therapy assessment",
    mode: "payment" as const,
    edgeFunction: "create-ketamine-checkout",
  },
  ivInfusion: {
    priceId: "price_1SaYv3EOtKRY99pulkr4H1At",
    amount: 40000,
    displayPrice: "$400",
    name: "IV Ketamine Infusion",
    description: "Single IV ketamine infusion session",
    mode: "payment" as const,
    edgeFunction: "create-iv-ketamine-checkout",
  },
  ivBundle6: {
    priceId: "price_1SwlYrEOtKRY99puuA7PwoYc",
    amount: 220000,
    displayPrice: "$2,200",
    name: "IV Ketamine 6-Session Bundle",
    description: "6 IV Ketamine infusion sessions - Save $200",
    mode: "payment" as const,
    edgeFunction: "create-iv-ketamine-checkout",
  },
} as const;

// ============================================================================
// WEIGHT LOSS / GLP-1 MEMBERSHIPS
// ============================================================================

export const WEIGHT_LOSS_PRICES = {
  semaglutide: {
    priceId: "price_1SlZnwEOtKRY99puaBhrh2iB",
    amount: 39900,
    displayPrice: "$399/mo",
    firstMonthWithCredit: "$399",
    name: "Semaglutide Membership",
    description: "Monthly Semaglutide GLP-1 medication with provider support",
    mode: "subscription" as const,
    interval: "month",
    edgeFunction: "create-semaglutide-checkout",
  },
  tirzepatide: {
    priceId: "price_1SlZnyEOtKRY99puE9JNOrTR",
    amount: 49900,
    displayPrice: "$499/mo",
    firstMonthWithCredit: "$499",
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
// PROVIDER-INITIATED KITS
// ============================================================================

export const PROVIDER_KIT_PRICES = {
  hormone: {
    priceId: "price_1T1AbVEOtKRY99pumPdgj1k3",
    amount: 25000,
    displayPrice: "$250",
    name: "Hormone Mapping Panel",
    description: "ZRT Saliva Profile III - Comprehensive at-home saliva test kit. Includes follow-up consultation after results return.",
    edgeFunction: "send-kit-payment-link",
  },
} as const;

// ============================================================================
// HELPER TYPES
// ============================================================================

export type ConsultationPriceKey = keyof typeof CONSULTATION_PRICES;
export type DiagnosticKitPriceKey = keyof typeof DIAGNOSTIC_KIT_PRICES;
export type MembershipPriceKey = keyof typeof MEMBERSHIP_PRICES;
export type AlacartePriceKey = keyof typeof ALACARTE_PRICES;
export type KetaminePriceKey = keyof typeof KETAMINE_PRICES;
export type WeightLossPriceKey = keyof typeof WEIGHT_LOSS_PRICES;
export type HairRestorationPriceKey = keyof typeof HAIR_RESTORATION_PRICES;
export type SexualWellnessPriceKey = keyof typeof SEXUAL_WELLNESS_PRICES;
export type AdminPriceKey = keyof typeof ADMIN_PRICES;
export type ProviderKitPriceKey = keyof typeof PROVIDER_KIT_PRICES;

// ============================================================================
// CONSULTATION CREDIT
// ============================================================================

export const CONSULTATION_CREDIT = {
  amount: 14900, // $149 in cents
  displayAmount: "$149",
  description: "Credit toward treatment when consultation is paid first",
} as const;

// ============================================================================
// AUDIT HELPER
// ============================================================================

export const getAllPriceIds = (): string[] => {
  const allPrices = [
    ...Object.values(DIAGNOSTIC_KIT_PRICES),
    ...Object.values(MEMBERSHIP_PRICES),
    ...Object.values(WEIGHT_LOSS_PRICES),
    ...Object.values(ADMIN_PRICES),
  ];
  
  return allPrices
    .map((p) => p.priceId as string | null)
    .filter((id): id is string => id !== null);
};

// ============================================================================
// SUMMARY TABLE (for documentation)
// ============================================================================
/*
| Category              | Product                                 | Price      | Price ID                               | Mode         |
|-----------------------|-----------------------------------------|------------|----------------------------------------|--------------|
| Consultations         | Clinical Strategy Session               | $149       | (dynamic)                              | payment      |
| Diagnostic Kits       | Hormone Mapping Panel                   | $250       | price_1T1AbVEOtKRY99pumPdgj1k3         | payment      |
| Founding Membership   | Wellness Pass (founding)                | $149/mo    | price_1TDovoEOtKRY99pus14I47X3         | subscription |
| Founding Membership   | Longevity Protocol (founding)           | $299/mo    | price_1TDovpEOtKRY99pu8sW2tl9N         | subscription |
| Founding Membership   | Executive Concierge (founding)          | $549/mo    | price_1TDovsEOtKRY99puPtteAgOu         | subscription |
| À La Carte            | Testosterone Cream                      | $149       | price_1Sga66EOtKRY99puQgPWACIy         | payment      |
| À La Carte            | Bi-Est Cream                            | $89        | price_1Sga67EOtKRY99puoS8b5U6h         | payment      |
| À La Carte            | Progesterone                            | $79        | price_1Sga69EOtKRY99puO8NJ5bpx         | payment      |
| À La Carte            | Follow-up Consultation                  | $99        | price_1Sga6AEOtKRY99puEx0mC3jx         | payment      |
| À La Carte            | Lab Panel                               | $250       | price_1T1AbVEOtKRY99pumPdgj1k3         | payment      |
| Weight Loss           | Semaglutide                             | $399/mo    | price_1SlZnwEOtKRY99puaBhrh2iB         | subscription |
| Weight Loss           | Tirzepatide                             | $499/mo    | price_1SlZnyEOtKRY99puE9JNOrTR         | subscription |
| Credit                | Consultation Credit                     | $149       | n/a                                    | credit       |
| Admin                 | Rebooking Fee                           | varies     | price_1Sa5UFEOtKRY99pupEQlaFvN         | payment      |
*/
