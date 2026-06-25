/**
 * Central Stripe Price & Product Configuration — Elevated Health Augusta
 *
 * Live production IDs mirror `docs/pricing/pricing_source_of_truth.md`.
 * Legacy test-mode IDs remain in the DEPRECATED section until PR #12.
 */

// =============================================================================
// LIVE STRIPE PRICE IDS — SOURCE OF TRUTH
// =============================================================================
// Stripe Account: acct_1SQrM7CXbCBPFEeI (live mode)
// All IDs in this section are LIVE production. Do not introduce test mode IDs.
// =============================================================================

// ELEVATED Memberships (recurring monthly)
export const ELEVATED_PROGRAMS = {
  trt: {
    name: "ELEVATED TRT",
    priceId: "price_1TWcPICXbCBPFEeInMGSsjDN",
    productId: "prod_UVdgaw0SyMI2jz",
    amount: 24900, // cents
    displayPrice: "$249/mo",
    interval: "month",
  },
  hrt: {
    name: "ELEVATED HRT",
    priceId: "price_1TWcPKCXbCBPFEeIJKBf62b9",
    productId: "prod_UVdgH1SlumTl5O",
    amount: 22900,
    displayPrice: "$229/mo",
    interval: "month",
  },
  glp1: {
    name: "ELEVATED GLP-1",
    priceId: "price_1TWcPLCXbCBPFEeIK7tkeIAM",
    productId: "prod_UVdgUmNtkHxr3V",
    amount: 34900,
    displayPrice: "$349/mo",
    interval: "month",
  },
  wellness: {
    name: "ELEVATED WELLNESS",
    priceId: "price_1TWcPNCXbCBPFEeIXo6IDpPf",
    productId: "prod_UVdg37MnW1puuK",
    amount: 19900,
    displayPrice: "$199/mo",
    interval: "month",
  },
} as const;

export type ElevatedProgramKey = keyof typeof ELEVATED_PROGRAMS;

/**
 * ELEVATED GLP-1 molecule pricing. Both variants enroll the patient in the
 * SAME `glp1` membership (identical elevated_program status, labs, oversight);
 * only the monthly price differs because compounded tirzepatide costs ~2x
 * compounded semaglutide. A patient's price never changes as they titrate
 * within their molecule.
 *
 * Display values — actual charge from these live Stripe price IDs. Both prices
 * live on the same ELEVATED GLP-1 product (prod_UVdgUmNtkHxr3V).
 */
export const GLP1_PROGRAM_VARIANTS = {
  semaglutide: {
    name: "ELEVATED GLP-1 · Semaglutide",
    priceId: ELEVATED_PROGRAMS.glp1.priceId,
    productId: ELEVATED_PROGRAMS.glp1.productId,
    amount: 34900,
    displayPrice: "$349/mo",
    molecule: "semaglutide",
  },
  tirzepatide: {
    name: "ELEVATED GLP-1 · Tirzepatide",
    priceId: "price_1Tm1BzCXbCBPFEeIkrr2iGcI",
    productId: "prod_UVdgUmNtkHxr3V",
    amount: 44900,
    displayPrice: "$449/mo",
    molecule: "tirzepatide",
  },
} as const;

export type Glp1Molecule = keyof typeof GLP1_PROGRAM_VARIANTS;

/**
 * GLP-1 price display for generic contexts where the molecule isn't yet known
 * (membership badges, program lists). Use GLP1_PROGRAM_VARIANTS[molecule] when
 * the molecule IS known (storefront molecule cards, provider charge modals).
 */
export const GLP1_DISPLAY_PRICE_RANGE = "$349–$449/mo";
export const GLP1_DISPLAY_PRICE_FROM = "from $349/mo";

// Core services (one-time)
export const CORE_SERVICES = {
  wellnessAssessment: {
    name: "Wellness Assessment",
    priceId: "price_1TWcmaCXbCBPFEeImikpoTPo",
    productId: "prod_UVe4fac4EOfgDG",
    amount: 7900,
    displayPrice: "$79",
  },
  medicalReview: {
    name: "Medical Review",
    priceId: "price_1TWcn3CXbCBPFEeILKHcCnTR",
    productId: "prod_UVe5QPpWNyYLpU",
    amount: 14900,
    displayPrice: "$149",
  },
  phoneFollowUp: {
    name: "Physician Phone Follow-Up",
    priceId: "price_1TWcnXCXbCBPFEeIEojOHJDL",
    productId: "prod_UVe5hSb451qkZ4",
    amount: 9900,
    displayPrice: "$99",
  },
  rebookingFee: {
    name: "Rebooking Fee",
    priceId: "price_1TWcnsCXbCBPFEeIFltNQdpi",
    productId: "prod_UVe6AiMtx1xDO0",
    amount: 9900,
    displayPrice: "$99",
  },
  comprehensivePanel: {
    name: "Comprehensive Wellness Panel",
    priceId: "price_1TWcoMCXbCBPFEeIKTLxoYYs",
    productId: "prod_UVe6QvjqrmgbXa",
    amount: 19900,
    displayPrice: "$199",
  },
  expandedPanel: {
    name: "Expanded Panel",
    priceId: "price_1TWcolCXbCBPFEeI11uF9lyf",
    productId: "prod_UVe64hyL4IIMt6",
    amount: 29900,
    displayPrice: "$299",
  },
  advancedLabAddon: {
    name: "Advanced Lab Markers Add-On",
    priceId: "price_1TlwOqCXbCBPFEeIggO2VWdQ",
    productId: "prod_UlTLU0llI864qo",
    amount: 12900,
    displayPrice: "$129",
  },
} as const;

// À la carte medication fills (non-member, one-time)
export const MEDICATION_FILLS = {
  testosterone: {
    name: "Testosterone Fill",
    priceId: "price_1TWcp8CXbCBPFEeI8pQsOIVm",
    productId: "prod_UVe7nW7JJ1xuC6",
    amount: 17900,
    displayPrice: "$179",
    memberAlternative: "trt" satisfies ElevatedProgramKey,
  },
  biEst: {
    name: "Bi-Est Cream Fill",
    priceId: "price_1TWcpTCXbCBPFEeIIt4jKgoR",
    productId: "prod_UVe7Ntu4xUg72s",
    amount: 10900,
    displayPrice: "$109",
    memberAlternative: "hrt" satisfies ElevatedProgramKey,
  },
  progesterone: {
    name: "Progesterone Fill",
    priceId: "price_1TWcq1CXbCBPFEeI35J50U0I",
    productId: "prod_UVe8jVlaypTCLy",
    amount: 9900,
    displayPrice: "$99",
    memberAlternative: "hrt" satisfies ElevatedProgramKey,
  },
  semaglutide: {
    name: "Semaglutide Single Fill",
    priceId: "price_1TWcqTCXbCBPFEeIP1U1HSld",
    productId: "prod_UVe8LmywoayLOE",
    amount: 29900,
    displayPrice: "$299",
    memberAlternative: "glp1" satisfies ElevatedProgramKey,
  },
  tirzepatide: {
    name: "Tirzepatide Single Fill",
    priceId: "price_1TWcsCCXbCBPFEeI8iA8kbrx",
    productId: "prod_UVeAmnWt8FMQCf",
    amount: 39900,
    displayPrice: "$399",
    memberAlternative: "glp1" satisfies ElevatedProgramKey,
  },
  retatrutide: {
    name: "Retatrutide Single Fill",
    priceId: "price_1TiQlECXbCBPFEeIzhCHuRhj",
    productId: "prod_UhqSeeHiiHdqHr",
    amount: 44900,
    displayPrice: "$449",
    // Gated, physician-only investigational option within the GLP-1 lane
    // (consent Section 11A, go-live 2026-06-21). Not a routine/advertised SKU.
    memberAlternative: "glp1" satisfies ElevatedProgramKey,
  },
} as const;

// Peptide therapy (recurring monthly)
export const PEPTIDE_PRODUCTS = {
  sermorelin: {
    name: "Sermorelin Injection",
    priceId: "price_1TWcskCXbCBPFEeIBSytC63Q",
    productId: "prod_UVeBkWZPGxLdmc",
    amount: 14900,
    displayPrice: "$149/mo",
  },
  cjc1295Ipamorelin: {
    name: "CJC-1295/Ipamorelin",
    priceId: "price_1TWct7CXbCBPFEeIXT7Mv0A3",
    productId: "prod_UVeB6yGA5Sy73e",
    amount: 17900,
    displayPrice: "$179/mo",
  },
  tesamorelin: {
    name: "Tesamorelin",
    priceId: "price_1TWctuCXbCBPFEeI4rpKGThG",
    productId: "prod_UVeCDgLGVJ04hm",
    amount: 39900,
    displayPrice: "$399/mo",
  },
  nadTroches: {
    name: "NAD+ Troches",
    priceId: "price_1TWcujCXbCBPFEeIgLXiONWC",
    productId: "prod_UVeDctVXwIySHX",
    amount: 9900,
    displayPrice: "$99/mo",
  },
  nadInjection: {
    name: "NAD+ Injection",
    priceId: "price_1TWcv4CXbCBPFEeIqJILZWQY",
    productId: "prod_UVeDVPf2YZCceL",
    amount: 19900,
    displayPrice: "$199/mo",
  },
  nadNasal: {
    name: "NAD+ Nasal Spray",
    priceId: "price_1TWcvUCXbCBPFEeILsUFp0tq",
    productId: "prod_UVeDO4N214JNkQ",
    amount: 9900,
    displayPrice: "$99/mo",
  },
  ghkCuTopical: {
    name: "GHK-Cu Topical",
    priceId: "price_1TWcwJCXbCBPFEeIL3UgXgTu",
    productId: "prod_UVeEx971R0NYhK",
    amount: 14900,
    displayPrice: "$149/mo",
  },
} as const;

/**
 * Recovery peptides — one-time à la carte fills (per Launch Offer Order System
 * per-vial pricing). Consult-gated under Research Peptide Consent; 20% member
 * discount applies via the checkout layer (pricing.ts). Created via
 * bootstrap-recovery-peptide-prices (live Stripe).
 */
export const RECOVERY_PEPTIDE_PRODUCTS = {
  bpc157: {
    name: "BPC-157",
    priceId: "price_1Tk924CXbCBPFEeI2RkxZwch",
    productId: "prod_UjcGzVhmET6qGt",
    amount: 24900,
    displayPrice: "$249",
    interval: "one_time",
  },
  tb500: {
    name: "TB-500 (Thymosin Beta-4)",
    priceId: "price_1Tk925CXbCBPFEeIJROSQX2t",
    productId: "prod_UjcGW4gXuzgmUM",
    amount: 24900,
    displayPrice: "$249",
    interval: "one_time",
  },
  wolverineStack: {
    name: "BPC-157 / TB-500 Recovery Stack",
    priceId: "price_1Tk926CXbCBPFEeILIT0UuQF",
    productId: "prod_UjcGhDI27g3tXo",
    amount: 34900,
    displayPrice: "$349",
    interval: "one_time",
  },
} as const;

/**
 * Provider-directed metabolic peptides — standalone à la carte (monthly).
 * The bundled "ELEVATED Metabolic Recomposition" program was retired 2026-06-24;
 * these molecules remain available individually, provider-directed.
 */
export const METABOLIC_STACK_ALACARTE = {
  ss31: {
    name: "SS-31 (Elamipretide)",
    priceId: "price_1TiQlFCXbCBPFEeIPKdKzUiU",
    productId: "prod_UhqS0eCjYBvB17",
    amount: 24900,
    displayPrice: "$249/mo",
  },
  aod9604: {
    name: "AOD-9604",
    priceId: "price_1TiQlGCXbCBPFEeIsx9Dk0z1",
    productId: "prod_UhqSyrc4RGtLoX",
    amount: 12900,
    displayPrice: "$129/mo",
  },
  sluPp332: {
    name: "SLU-PP-332",
    priceId: "price_1TiQlGCXbCBPFEeIA3NVzqXV",
    productId: "prod_UhqSXKYcScueXq",
    amount: 9900,
    displayPrice: "$99/mo",
  },
  fiveAmino1mq: {
    name: "5-Amino-1MQ",
    priceId: "price_1TiQlHCXbCBPFEeIDNFp83oo",
    productId: "prod_UhqSgJgtKNDVAF",
    amount: 11900,
    displayPrice: "$119/mo",
  },
} as const;

// Sexual wellness
export const SEXUAL_WELLNESS_PRODUCTS = {
  tadalafil: {
    name: "Tadalafil",
    priceId: "price_1TWcwsCXbCBPFEeI9yGko9k8",
    productId: "prod_UVeFMp6Re5QcwP",
    amount: 9900,
    displayPrice: "$99/mo",
    interval: "month",
  },
  sildenafil: {
    name: "Sildenafil",
    priceId: "price_1TWcxGCXbCBPFEeIezbJUMS1",
    productId: "prod_UVeFzuXMRsbfR3",
    amount: 7900,
    displayPrice: "$79/mo",
    interval: "month",
  },
  pt141: {
    name: "PT-141 (Bremelanotide)",
    priceId: "price_1TWcxgCXbCBPFEeIVx833x02",
    productId: "prod_UVeGVXyl1tyGGx",
    amount: 22500,
    displayPrice: "$225",
    interval: "one_time",
  },
  oxytocin: {
    name: "Oxytocin Nasal Spray",
    priceId: "price_1TWcyCCXbCBPFEeITwirLO84",
    productId: "prod_UVeGd7W941z5zi",
    amount: 8900,
    displayPrice: "$89/mo",
    interval: "month",
  },
} as const;

// Hair restoration
export const HAIR_RESTORATION_PRODUCTS = {
  minoxidilFinasteride: {
    name: "Minoxidil + Finasteride",
    priceId: "price_1TWcz6CXbCBPFEeI3fWrJOU0",
    productId: "prod_UVeHUF34WxfW2b",
    amount: 12900,
    displayPrice: "$129/mo",
  },
  dutasteride: {
    name: "Dutasteride Protocol",
    priceId: "price_1TWczRCXbCBPFEeIGjWNLOYX",
    productId: "prod_UVeIHluYVIXexo",
    amount: 14900,
    displayPrice: "$149/mo",
  },
  ghkCuScalp: {
    name: "GHK-Cu Scalp Therapy",
    priceId: "price_1TWczwCXbCBPFEeIXCBtnslN",
    productId: "prod_UVeIyhp13vmLLw",
    amount: 14900,
    displayPrice: "$149/mo",
  },
} as const;

/**
 * Walk-in IV example used in marketing comparisons until IV drip SKUs live
 * in this config. Canonical with `/iv-lounge` Myers Cocktail display.
 */
export const IV_WALKIN_EXAMPLES = {
  myersCocktailCents: 18500,
} as const;

// Aggregate helpers
export const ALL_LIVE_PRICE_IDS = [
  ...Object.values(ELEVATED_PROGRAMS).map((p) => p.priceId),
  GLP1_PROGRAM_VARIANTS.tirzepatide.priceId,
  ...Object.values(CORE_SERVICES).map((p) => p.priceId),
  ...Object.values(MEDICATION_FILLS).map((p) => p.priceId),
  ...Object.values(PEPTIDE_PRODUCTS).map((p) => p.priceId),
  ...Object.values(RECOVERY_PEPTIDE_PRODUCTS).map((p) => p.priceId),
  ...Object.values(SEXUAL_WELLNESS_PRODUCTS).map((p) => p.priceId),
  ...Object.values(HAIR_RESTORATION_PRODUCTS).map((p) => p.priceId),
];

// Both GLP-1 molecule prices count as ELEVATED program prices (same membership).
export const ELEVATED_PROGRAM_PRICE_IDS: string[] = [
  ...Object.values(ELEVATED_PROGRAMS).map((p) => p.priceId),
  GLP1_PROGRAM_VARIANTS.tirzepatide.priceId,
];

export function isElevatedProgramPrice(priceId: string): boolean {
  return ELEVATED_PROGRAM_PRICE_IDS.includes(priceId);
}

export function getProgramFromPriceId(priceId: string): ElevatedProgramKey | null {
  for (const [key, program] of Object.entries(ELEVATED_PROGRAMS)) {
    if (program.priceId === priceId) return key as ElevatedProgramKey;
  }
  // Tirzepatide GLP-1 variant maps to the same `glp1` membership status.
  if (priceId === GLP1_PROGRAM_VARIANTS.tirzepatide.priceId) return "glp1";
  return null;
}

// =============================================================================
// DEPRECATED — TEST MODE PRICE IDS
// =============================================================================
// The following references exist only to keep legacy callers compiling.
// All must be removed by PR #12 (Edge functions sweep). Any new code that
// references these constants is a bug — use the LIVE constants above.
// =============================================================================

/**
 * @deprecated Legacy consultation catalog. Use {@link CORE_SERVICES.wellnessAssessment} for live Stripe catalog.
 */
export const CONSULTATION_PRICES = {
  /**
   * @deprecated Use {@link CORE_SERVICES.wellnessAssessment}
   */
  discovery: {
    priceId: null, // Uses price_data for dynamic product naming per service type
    amount: 7900, // $79
    displayPrice: "$79",
    name: "Wellness Assessment",
    description: "In-office RN Wellness Assessment. Paid at booking; program and labs quoted separately if you enroll.",
    mode: "payment" as const,
    edgeFunction: "create-consultation-checkout",
  },
} as const;

/**
 * @deprecated Legacy ZRT kit reference. Use {@link CORE_SERVICES.comprehensivePanel} / {@link CORE_SERVICES.expandedPanel} for live LabCorp panels.
 */
export const DIAGNOSTIC_KIT_PRICES = {
  hormone: {
    priceId: "price_1T1AbVEOtKRY99pumPdgj1k3",
    amount: 25000, // $250 — historical reference only, no active checkout
    displayPrice: "$250",
    name: "Hormone Mapping Panel (legacy)",
    description: "Legacy third-party saliva panel. Deprecated — use LabCorp panels in CORE_SERVICES.",
    zrtPanel: "saliva_iii",
    mode: "payment" as const,
  },
} as const;

/**
 * @deprecated Single-tier $199 membership price ID. Use {@link ELEVATED_PROGRAMS.wellness} or a program-specific tier (trt / hrt / glp1).
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
    "Deprecated single-tier membership copy. Prefer ELEVATED_PROGRAMS — medications are included in program tiers per live catalog.",
  mode: "subscription" as const,
  interval: "month",
  edgeFunction: "create-elevated-membership-checkout",
} as const;

/**
 * @deprecated Legacy à la carte medication keys (test Stripe account). Use {@link MEDICATION_FILLS}.
 */
export const ALACARTE_PRICES = {
  /**
   * @deprecated Use {@link MEDICATION_FILLS.testosterone}
   */
  testosterone: {
    priceId: "price_1Sga66EOtKRY99puQgPWACIy",
    amount: 14900,
    displayPrice: "$149",
    name: "Testosterone Cream",
    description: "10-week testosterone cream fill (non-member pricing)",
    mode: "payment" as const,
    edgeFunction: "create-alacarte-checkout",
  },
  /**
   * @deprecated Use {@link MEDICATION_FILLS.biEst}
   */
  biEst: {
    priceId: "price_1Sga67EOtKRY99puoS8b5U6h",
    amount: 8900,
    displayPrice: "$89",
    name: "Bi-Est Cream",
    description: "30-day bi-estrogen cream fill (non-member pricing)",
    mode: "payment" as const,
    edgeFunction: "create-alacarte-checkout",
  },
  /**
   * @deprecated Use {@link MEDICATION_FILLS.progesterone}
   */
  progesterone: {
    priceId: "price_1Sga69EOtKRY99puO8NJ5bpx",
    amount: 7900,
    displayPrice: "$79",
    name: "Progesterone",
    description: "30-day progesterone fill (non-member pricing)",
    mode: "payment" as const,
    edgeFunction: "create-alacarte-checkout",
  },
  /**
   * @deprecated Use {@link CORE_SERVICES.phoneFollowUp}
   */
  followUp: {
    priceId: "price_1Sga6AEOtKRY99puEx0mC3jx",
    amount: 9900,
    displayPrice: "$99",
    name: "Follow-up Consultation",
    description: "Provider follow-up consultation (non-member pricing)",
    mode: "payment" as const,
    edgeFunction: "create-alacarte-checkout",
  },
  /**
   * @deprecated Use {@link CORE_SERVICES.comprehensivePanel}
   */
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

/**
 * @deprecated Legacy GLP-1 member/non-member split SKUs. Use {@link ELEVATED_PROGRAMS.glp1} and {@link MEDICATION_FILLS.semaglutide} / {@link MEDICATION_FILLS.tirzepatide}.
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

/**
 * @deprecated Legacy weight-loss subscription metadata. Use {@link ELEVATED_PROGRAMS.glp1} / {@link MEDICATION_FILLS.semaglutide} / {@link MEDICATION_FILLS.tirzepatide}.
 */
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

/**
 * @deprecated Legacy hair restoration Stripe account. Use {@link HAIR_RESTORATION_PRODUCTS}.
 */
export const HAIR_RESTORATION_PRICES = {
  minoxidilFinasteride: {
    priceId: "price_1SfijTEOtKRY99puE2WxgmrI",
    amount: 12900,
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
    amount: 14900,
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
    amount: 14900,
    displayPrice: "$149/mo",
    name: "GHK-Cu Scalp Therapy",
    description: "Copper peptide serum for scalp health",
    mode: "subscription" as const,
    interval: "month",
    productKey: "ghk_cu_scalp",
    edgeFunction: "create-hair-restoration-checkout",
  },
} as const;

/**
 * @deprecated Legacy sexual wellness Stripe account. Use {@link SEXUAL_WELLNESS_PRODUCTS}.
 */
export const SEXUAL_WELLNESS_PRICES = {
  tadalafil: {
    priceId: "price_1SfijREOtKRY99puq0ITndfC",
    amount: 9900,
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
    amount: 7900,
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
    amount: 22500,
    displayPrice: "$225",
    name: "PT-141 (Bremelanotide)",
    description: "Peptide therapy for libido enhancement",
    mode: "payment" as const,
    productKey: "pt141",
    edgeFunction: "create-sexual-wellness-checkout",
  },
  oxytocinNasal: {
    priceId: "price_1SfijWEOtKRY99puB9Rq4Lm3",
    amount: 8900,
    displayPrice: "$89/mo",
    name: "Oxytocin Nasal Spray",
    description: "Bonding and intimacy enhancement",
    mode: "subscription" as const,
    interval: "month",
    productKey: "oxytocin_nasal",
    edgeFunction: "create-sexual-wellness-checkout",
  },
} as const;

/**
 * @deprecated Legacy rebooking Stripe reference. Use {@link CORE_SERVICES.rebookingFee}.
 */
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

function legacyPriceIdStrings(): string[] {
  const legacyObjects = [
    ELEVATED_MEMBERSHIP,
    ...Object.values(DIAGNOSTIC_KIT_PRICES),
    ...Object.values(WEIGHT_LOSS_PRICES),
    ...Object.values(ADMIN_PRICES),
    ...Object.values(ALACARTE_PRICES),
    ...Object.values(GLP1_MEDICATION_PRICES).flatMap((m) => [m.member, m.nonmember]),
    ...Object.values(HAIR_RESTORATION_PRICES),
    ...Object.values(SEXUAL_WELLNESS_PRICES),
  ];
  return legacyObjects
    .map((p) => (p as { priceId?: string | null }).priceId as string | null | undefined)
    .filter((id): id is string => !!id && !id.startsWith("price_TODO_"));
}

/** All known price IDs (live catalog + deprecated legacy) for audits and tooling. */
export const getAllPriceIds = (): string[] => {
  const merged = [...ALL_LIVE_PRICE_IDS, ...legacyPriceIdStrings()];
  return [...new Set(merged)];
};
