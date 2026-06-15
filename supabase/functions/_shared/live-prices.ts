/**
 * Live Stripe price IDs — mirrors `src/lib/stripeConfig.ts` for Deno edge functions.
 * Do not import from Vite frontend paths.
 */

export const LIVE_ELEVATED_PROGRAMS = {
  trt: "price_1TWcPICXbCBPFEeInMGSsjDN",
  hrt: "price_1TWcPKCXbCBPFEeIJKBf62b9",
  glp1: "price_1TWcPLCXbCBPFEeIK7tkeIAM",
  wellness: "price_1TWcPNCXbCBPFEeIXo6IDpPf",
  metabolicRecomposition: "price_1TiQlECXbCBPFEeI4vKTyIq4",
} as const;

export type LiveElevatedProgramKey = keyof typeof LIVE_ELEVATED_PROGRAMS;

/** Legacy single-tier Elevated membership — webhook sunset 2026-08-11 */
export const LEGACY_ELEVATED_MEMBERSHIP_PRICE_ID = "price_1TUs3LEOtKRY99puWfQy8pHj";

export const LIVE_CORE_SERVICES = {
  wellnessAssessment: "price_1TWcmaCXbCBPFEeImikpoTPo",
  medicalReview: "price_1TWcn3CXbCBPFEeILKHcCnTR",
  phoneFollowUp: "price_1TWcnXCXbCBPFEeIEojOHJDL",
  rebookingFee: "price_1TWcnsCXbCBPFEeIFltNQdpi",
  comprehensivePanel: "price_1TWcoMCXbCBPFEeIKTLxoYYs",
  expandedPanel: "price_1TWcolCXbCBPFEeI11uF9lyf",
} as const;

export const LIVE_MEDICATION_FILLS = {
  testosterone: "price_1TWcp8CXbCBPFEeI8pQsOIVm",
  biEst: "price_1TWcpTCXbCBPFEeIIt4jKgoR",
  progesterone: "price_1TWcq1CXbCBPFEeI35J50U0I",
  semaglutide: "price_1TWcqTCXbCBPFEeIP1U1HSld",
  tirzepatide: "price_1TWcsCCXbCBPFEeI8iA8kbrx",
  retatrutide: "price_1TiQlECXbCBPFEeIzhCHuRhj",
} as const;

export type LiveMedicationFillKey = keyof typeof LIVE_MEDICATION_FILLS;

export const LIVE_SEXUAL_WELLNESS = {
  tadalafil: "price_1TWcwsCXbCBPFEeI9yGko9k8",
  sildenafil: "price_1TWcxGCXbCBPFEeIezbJUMS1",
  pt141: "price_1TWcxgCXbCBPFEeIVx833x02",
  oxytocin: "price_1TWcyCCXbCBPFEeITwirLO84",
} as const;

export const LIVE_HAIR_RESTORATION = {
  minoxidilFinasteride: "price_1TWcz6CXbCBPFEeI3fWrJOU0",
  dutasteride: "price_1TWczRCXbCBPFEeIGjWNLOYX",
  ghkCuScalp: "price_1TWczwCXbCBPFEeIXCBtnslN",
} as const;
