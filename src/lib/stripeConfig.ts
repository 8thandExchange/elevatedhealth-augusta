/**
 * Central Stripe Price & Product Configuration
 * 
 * This file serves as the single source of truth for all Stripe price IDs used across the application.
 * Use this for auditing, maintenance, and ensuring consistency between UI and checkout functions.
 * 
 * IMPORTANT: When updating prices in Stripe, update them here first, then update the corresponding
 * edge functions to reference these same IDs.
 * 
 * Last audited: 2025-12-20
 */

// ============================================================================
// CONSULTATIONS
// ============================================================================

export const CONSULTATION_PRICES = {
  discovery: {
    priceId: null, // Uses price_data for dynamic product naming per service type
    amount: 9900, // $99
    displayPrice: "$99",
    name: "Discovery Consultation",
    description: "30-minute in-person consultation. Non-refundable. Applied as credit toward treatment if you proceed.",
    mode: "payment" as const,
    edgeFunction: "create-consultation-checkout",
  },
} as const;

// ============================================================================
// DIAGNOSTIC KITS (ZRT Labs)
// ============================================================================

export const DIAGNOSTIC_KIT_PRICES = {
  hormone: {
    priceId: "price_1SZiRMEOtKRY99pua6QMu12h",
    amount: 34900, // $349
    displayPrice: "$349",
    name: "Hormone Mapping Kit",
    description: "ZRT Saliva Profile III - Comprehensive at-home saliva test kit covering Cortisol, DHEA-S, Estradiol, Progesterone & Testosterone + lab review consultation",
    zrtPanel: "saliva_iii",
    mode: "payment" as const,
    edgeFunction: "create-hormone-checkout",
  },
  // TEMPORARILY HIDDEN - Only offering Hormone Mapping Kit for now
  // metabolic: {
  //   priceId: "price_1Sa4bNEOtKRY99pulS73hT1V",
  //   amount: 34900, // $349
  //   displayPrice: "$349",
  //   name: "Metabolic Mapping Kit",
  //   description: "ZRT Weight Management Profile - Comprehensive metabolic panel + lab review consultation",
  //   zrtPanel: "weight_management",
  //   mode: "payment" as const,
  //   edgeFunction: "create-hormone-checkout",
  // },
  // neurotransmitter: {
  //   priceId: null, // Uses price_data at $399
  //   amount: 39900, // $399
  //   displayPrice: "$399",
  //   name: "Neurotransmitter Analysis Kit",
  //   description: "ZRT Neurotransmitter Profile - Comprehensive brain chemistry analysis",
  //   zrtPanel: "neurotransmitter",
  //   mode: "payment" as const,
  //   edgeFunction: "create-neurotransmitter-checkout",
  // },
  // toxicity: {
  //   priceId: null, // Uses price_data at $299
  //   amount: 29900, // $299
  //   displayPrice: "$299",
  //   name: "Toxicity Panel Kit",
  //   description: "Heavy metals and environmental toxin analysis",
  //   mode: "payment" as const,
  //   edgeFunction: "create-toxicity-checkout",
  // },
  // totalBody: {
  //   priceId: null, // Uses price_data at $999
  //   amount: 99900, // $999
  //   displayPrice: "$999",
  //   name: "The Elevated Architecture™ Protocol",
  //   description: "Complete diagnostic workup with hormones, metabolic, neurotransmitter, and toxicity panels",
  //   mode: "payment" as const,
  //   edgeFunction: "create-total-body-checkout",
  // },
} as const;

// ============================================================================
// MEMBERSHIPS (Subscriptions)
// ============================================================================

export const MEMBERSHIP_PRICES = {
  // Legacy single-tier (deprecated)
  vitality: {
    priceId: "price_1Sga64EOtKRY99pu6NpP45Qq",
    amount: 24900, // $249/mo
    displayPrice: "$249/mo",
    name: "Vitality Membership (Legacy)",
    description: "Monthly hormone optimization with provider support",
    mode: "subscription" as const,
    interval: "month",
    edgeFunction: "create-vitality-checkout",
  },
  hormoneAddon: {
    priceId: "price_1SmMlOEOtKRY99puBAxTpw99",
    amount: 14900, // $149/mo
    displayPrice: "$149/mo",
    name: "Hormone Add-On for GLP-1 Members",
    description: "Discounted hormone therapy add-on for Semaglutide or Tirzepatide members. Includes Bi-Est, Testosterone, and/or Progesterone as needed.",
    mode: "subscription" as const,
    interval: "month",
    edgeFunction: "create-hormone-addon-checkout",
  },
} as const;

// ============================================================================
// HORMONE MEMBERSHIP TIERS (3-Tier Pricing Psychology)
// ============================================================================

export const HORMONE_MEMBERSHIP_TIERS = {
  access: {
    priceId: "price_1Soo21EOtKRY99pursQ4Vnh3",
    amount: 9900, // $99/mo
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
      labDiscountedPrice: 27900, // $349 - 20% = $279
      glp1DiscountPercent: 0,
      has90DayRx: false,
      priorityScheduling: false,
      directProviderLine: false,
    },
  },
  vitality: {
    priceId: "price_1Soo23EOtKRY99puIku6s4DU",
    amount: 14900, // $149/mo
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
      labDiscountedPrice: 24400, // $349 - 30% = $244
      glp1DiscountPercent: 10,
      has90DayRx: true,
      priorityScheduling: true,
      directProviderLine: false,
    },
  },
  concierge: {
    priceId: "price_1Soo25EOtKRY99puMndJjRr4",
    amount: 24900, // $249/mo
    displayPrice: "$249/mo",
    name: "CONCIERGE",
    tagline: "Premium",
    description: "Unlimited consults, direct provider line, best discounts",
    mode: "subscription" as const,
    interval: "month",
    edgeFunction: "create-hormone-membership-checkout",
    benefits: {
      consultsPerYear: -1, // -1 = unlimited
      labDiscountPercent: 40,
      labDiscountedPrice: 20900, // $349 - 40% = $209
      glp1DiscountPercent: 15,
      has90DayRx: true,
      priorityScheduling: true,
      directProviderLine: true,
    },
  },
} as const;

// Tier-discounted GLP-1 prices
export const TIERED_GLP1_PRICES = {
  semaglutide: {
    full: {
      priceId: "price_1SlZnwEOtKRY99puaBhrh2iB",
      amount: 39900,
      displayPrice: "$399/mo",
    },
    vitality: {
      priceId: "price_1Soo27EOtKRY99punKCdKBDe",
      amount: 35900, // 10% off
      displayPrice: "$359/mo",
    },
    concierge: {
      priceId: "price_1Soo29EOtKRY99pulu8UKUJt",
      amount: 33900, // 15% off
      displayPrice: "$339/mo",
    },
  },
  tirzepatide: {
    full: {
      priceId: "price_1SlZnyEOtKRY99puE9JNOrTR",
      amount: 49900,
      displayPrice: "$499/mo",
    },
    vitality: {
      priceId: "price_1Soo2AEOtKRY99puMopN9V2Q",
      amount: 44900, // 10% off
      displayPrice: "$449/mo",
    },
    concierge: {
      priceId: "price_1Soo2CEOtKRY99puKfwGnQOw",
      amount: 42400, // 15% off
      displayPrice: "$424/mo",
    },
  },
} as const;

export type HormoneMembershipTier = keyof typeof HORMONE_MEMBERSHIP_TIERS;

// ============================================================================
// À LA CARTE MEDICATIONS (One-time payments for non-members)
// ============================================================================

export const ALACARTE_PRICES = {
  testosterone: {
    priceId: "price_1Sga66EOtKRY99puQgPWACIy",
    amount: 14900, // $149
    displayPrice: "$149",
    name: "Testosterone Cream",
    description: "10-week testosterone cream fill (non-member pricing)",
    mode: "payment" as const,
    edgeFunction: "create-alacarte-checkout",
  },
  biEst: {
    priceId: "price_1Sga67EOtKRY99puoS8b5U6h",
    amount: 8900, // $89
    displayPrice: "$89",
    name: "Bi-Est Cream",
    description: "30-day bi-estrogen cream fill (non-member pricing)",
    mode: "payment" as const,
    edgeFunction: "create-alacarte-checkout",
  },
  progesterone: {
    priceId: "price_1Sga69EOtKRY99puO8NJ5bpx",
    amount: 7900, // $79
    displayPrice: "$79",
    name: "Progesterone",
    description: "30-day progesterone fill (non-member pricing)",
    mode: "payment" as const,
    edgeFunction: "create-alacarte-checkout",
  },
  followUp: {
    priceId: "price_1Sga6AEOtKRY99puEx0mC3jx",
    amount: 9900, // $99
    displayPrice: "$99",
    name: "Follow-up Consultation",
    description: "Provider follow-up consultation (non-member pricing)",
    mode: "payment" as const,
    edgeFunction: "create-alacarte-checkout",
  },
  labPanel: {
    priceId: "price_1Sga6CEOtKRY99puOXGAaRwh",
    amount: 14900, // $149
    displayPrice: "$149",
    name: "Lab Panel",
    description: "Comprehensive hormone lab panel (non-member pricing)",
    mode: "payment" as const,
    edgeFunction: "create-alacarte-checkout",
  },
} as const;

// ============================================================================
// KETAMINE THERAPY
// ============================================================================

export const KETAMINE_PRICES = {
  deposit: {
    priceId: "price_1Sa5jwEOtKRY99puYK2lpDw5",
    amount: 15000, // $150
    displayPrice: "$150",
    name: "Ketamine Therapy Deposit",
    description: "Deposit for ketamine therapy assessment",
    mode: "payment" as const,
    edgeFunction: "create-ketamine-checkout",
  },
  ivInfusion: {
    priceId: "price_1SaYv3EOtKRY99pulkr4H1At",
    amount: 40000, // $400
    displayPrice: "$400",
    name: "IV Ketamine Infusion",
    description: "Single IV ketamine infusion session",
    mode: "payment" as const,
    edgeFunction: "create-iv-ketamine-checkout",
  },
  ivBundle6: {
    priceId: "price_1SwlYrEOtKRY99puuA7PwoYc",
    amount: 220000, // $2,200
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
    amount: 39900, // $399/mo
    displayPrice: "$399/mo",
    firstMonthWithCredit: "$300", // $399 - $99 consultation credit
    name: "Semaglutide Membership",
    description: "Monthly Semaglutide GLP-1 medication with provider support",
    mode: "subscription" as const,
    interval: "month",
    edgeFunction: "create-semaglutide-checkout",
  },
  tirzepatide: {
    priceId: "price_1SlZnyEOtKRY99puE9JNOrTR",
    amount: 49900, // $499/mo
    displayPrice: "$499/mo",
    firstMonthWithCredit: "$400", // $499 - $99 consultation credit
    name: "Tirzepatide Membership",
    description: "Monthly Tirzepatide GLP-1/GIP medication with provider support",
    mode: "subscription" as const,
    interval: "month",
    edgeFunction: "create-tirzepatide-checkout",
  },
} as const;

// ============================================================================
// HAIR RESTORATION (Subscriptions)
// ============================================================================

export const HAIR_RESTORATION_PRICES = {
  minoxidilFinasteride: {
    priceId: "price_1SfijTEOtKRY99puE2WxgmrI",
    amount: 12900, // $129/mo
    displayPrice: "$129/mo",
    name: "Minoxidil + Finasteride",
    description: "Combination topical therapy for hair regrowth",
    mode: "subscription" as const,
    interval: "month",
    productKey: "minoxidil_finasteride",
    edgeFunction: "create-hair-restoration-checkout",
  },
  dutasteride: {
    priceId: "price_1SfijUEOtKRY99puH5TqvFks",
    amount: 14900, // $149/mo
    displayPrice: "$149/mo",
    name: "Dutasteride",
    description: "Advanced DHT blocker for hair loss",
    mode: "subscription" as const,
    interval: "month",
    productKey: "dutasteride",
    edgeFunction: "create-hair-restoration-checkout",
  },
  ghkCuScalp: {
    priceId: "price_1SfijVEOtKRY99puXq7N3Lp2",
    amount: 14900, // $149/mo
    displayPrice: "$149/mo",
    name: "GHK-Cu Scalp Therapy",
    description: "Copper peptide serum for scalp health",
    mode: "subscription" as const,
    interval: "month",
    productKey: "ghk_cu_scalp",
    edgeFunction: "create-hair-restoration-checkout",
  },
} as const;

// ============================================================================
// SEXUAL WELLNESS
// ============================================================================

export const SEXUAL_WELLNESS_PRICES = {
  tadalafil: {
    priceId: "price_1SfijREOtKRY99puq0ITndfC",
    amount: 9900, // $99/mo
    displayPrice: "$99/mo",
    name: "Tadalafil (Cialis)",
    description: "Daily or as-needed ED medication",
    mode: "subscription" as const,
    interval: "month",
    productKey: "tadalafil",
    edgeFunction: "create-sexual-wellness-checkout",
  },
  sildenafil: {
    priceId: "price_1SfijSEOtKRY99pumi7jjNvs",
    amount: 7900, // $79/mo
    displayPrice: "$79/mo",
    name: "Sildenafil (Viagra)",
    description: "As-needed ED medication",
    mode: "subscription" as const,
    interval: "month",
    productKey: "sildenafil",
    edgeFunction: "create-sexual-wellness-checkout",
  },
  pt141: {
    priceId: "price_1Sa67YEOtKRY99puQlYCjH4m",
    amount: 22500, // $225
    displayPrice: "$225",
    name: "PT-141 (Bremelanotide)",
    description: "Peptide therapy for libido enhancement",
    mode: "payment" as const,
    productKey: "pt141",
    edgeFunction: "create-sexual-wellness-checkout",
  },
  oxytocinNasal: {
    priceId: "price_1SfijWEOtKRY99puB9Rq4Lm3",
    amount: 8900, // $89/mo
    displayPrice: "$89/mo",
    name: "Oxytocin Nasal Spray",
    description: "Bonding and intimacy enhancement",
    mode: "subscription" as const,
    interval: "month",
    productKey: "oxytocin_nasal",
    edgeFunction: "create-sexual-wellness-checkout",
  },
} as const;

// ============================================================================
// ADMINISTRATIVE / OTHER
// ============================================================================

export const ADMIN_PRICES = {
  rebookingFee: {
    priceId: "price_1Sa5UFEOtKRY99pupEQlaFvN",
    amount: 0, // Variable - check Stripe for actual amount
    displayPrice: "See Stripe",
    name: "Appointment Rebooking Fee",
    description: "Fee for rescheduling a missed appointment",
    mode: "payment" as const,
    edgeFunction: "create-rebooking-checkout",
  },
} as const;

// ============================================================================
// PROVIDER-INITIATED KITS (sent via send-kit-payment-link)
// ============================================================================

export const PROVIDER_KIT_PRICES = {
  hormone: {
    priceId: "price_1SZiRMEOtKRY99pua6QMu12h",
    fullPrice: 34900, // $349
    creditPrice: 25000, // $250 after $99 credit
    displayPrice: "$349 (or $250 with credit)",
    name: "Hormone Mapping Kit",
    description: "ZRT Saliva Profile III - Comprehensive at-home saliva test kit + lab review consultation",
    edgeFunction: "send-kit-payment-link",
  },
  // TEMPORARILY HIDDEN - Only offering Hormone Mapping Kit for now
  // metabolic: {
  //   priceId: "price_1Sa4bNEOtKRY99pulS73hT1V",
  //   fullPrice: 34900, // $349
  //   creditPrice: 25000, // $250 after $99 credit
  //   displayPrice: "$349 (or $250 with credit)",
  //   name: "Metabolic Mapping Kit",
  //   description: "ZRT Weight Management Profile - Comprehensive metabolic panel + lab review consultation",
  //   edgeFunction: "send-kit-payment-link",
  // },
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
// AUDIT HELPER - Get all prices for verification
// ============================================================================

export const getAllPriceIds = (): string[] => {
  const allPrices = [
    ...Object.values(DIAGNOSTIC_KIT_PRICES),
    ...Object.values(MEMBERSHIP_PRICES),
    ...Object.values(KETAMINE_PRICES),
    ...Object.values(WEIGHT_LOSS_PRICES),
    ...Object.values(HAIR_RESTORATION_PRICES),
    ...Object.values(SEXUAL_WELLNESS_PRICES),
    ...Object.values(ADMIN_PRICES),
  ];
  
  return allPrices
    .map((p) => p.priceId as string | null)
    .filter((id): id is string => id !== null);
};

// ============================================================================
// CONSULTATION CREDIT
// ============================================================================

export const CONSULTATION_CREDIT = {
  amount: 9900, // $99 in cents
  displayAmount: "$99",
  description: "Credit toward diagnostic mapping kit when consultation is paid first",
} as const;

// ============================================================================
// SUMMARY TABLE (for documentation)
// ============================================================================
/*
| Category           | Product                          | Price    | Price ID                               | Mode         |
|--------------------|----------------------------------|----------|----------------------------------------|--------------|
| Consultations      | Discovery Consultation           | $99      | (dynamic)                              | payment      |
| Diagnostic Kits    | Hormone Mapping                  | $349     | price_1SZiRMEOtKRY99pua6QMu12h         | payment      |
| Diagnostic Kits    | Metabolic Mapping                | $349     | price_1Sa4bNEOtKRY99pulS73hT1V         | payment      |
| Diagnostic Kits    | Neurotransmitter Analysis        | $399     | (dynamic)                              | payment      |
| Diagnostic Kits    | Toxicity Panel                   | $299     | (dynamic)                              | payment      |
| Diagnostic Kits    | Elevated Architecture Protocol   | $999     | (dynamic)                              | payment      |
| Memberships        | Vitality Membership              | $249/mo  | price_1Sga64EOtKRY99pu6NpP45Qq         | subscription |
| Memberships        | Elevated Concierge               | $399/mo  | price_1SZiXTEOtKRY99puR7PQUExU         | subscription |
| À La Carte         | Testosterone Cream               | $149     | price_1Sga66EOtKRY99puQgPWACIy         | payment      |
| À La Carte         | Bi-Est Cream                     | $89      | price_1Sga67EOtKRY99puoS8b5U6h         | payment      |
| À La Carte         | Progesterone                     | $79      | price_1Sga69EOtKRY99puO8NJ5bpx         | payment      |
| À La Carte         | Follow-up Consultation           | $99      | price_1Sga6AEOtKRY99puEx0mC3jx         | payment      |
| À La Carte         | Lab Panel                        | $149     | price_1Sga6CEOtKRY99puOXGAaRwh         | payment      |
| Ketamine           | Therapy Deposit                  | $150     | price_1Sa5jwEOtKRY99puYK2lpDw5         | payment      |
| Ketamine           | IV Infusion                      | $400     | price_1SaYv3EOtKRY99pulkr4H1At         | payment      |
| Weight Loss        | GLP-1 Continuation               | $449     | price_1Sd8ChEOtKRY99pu7iaAF3Jd         | payment      |
| Hair Restoration   | Minoxidil + Finasteride          | $129/mo  | price_1SfijTEOtKRY99puE2WxgmrI         | subscription |
| Hair Restoration   | Dutasteride                      | $149/mo  | price_1SfijUEOtKRY99puH5TqvFks         | subscription |
| Hair Restoration   | GHK-Cu Scalp                     | $149/mo  | price_1SfijVEOtKRY99puXq7N3Lp2         | subscription |
| Sexual Wellness    | Tadalafil                        | $99/mo   | price_1SfijREOtKRY99puq0ITndfC         | subscription |
| Sexual Wellness    | Sildenafil                       | $79/mo   | price_1SfijSEOtKRY99pumi7jjNvs         | subscription |
| Sexual Wellness    | PT-141                           | $225     | price_1Sa67YEOtKRY99puQlYCjH4m         | payment      |
| Sexual Wellness    | Oxytocin Nasal                   | $89/mo   | price_1SfijWEOtKRY99puB9Rq4Lm3         | subscription |
| Admin              | Rebooking Fee                    | varies   | price_1Sa5UFEOtKRY99pupEQlaFvN         | payment      |
| Credit             | Consultation Credit              | $99      | n/a                                    | credit       |
| Credit Applied     | Hormone/Metabolic Mapping        | $250     | (calculated at checkout)               | payment      |
*/
