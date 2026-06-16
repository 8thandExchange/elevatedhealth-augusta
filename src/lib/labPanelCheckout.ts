/**
 * Lab panel checkout — maps clinical lab_panels.slug → Stripe CORE_SERVICES SKUs.
 * Patient-facing prices live in stripeConfig.ts ($199 Comprehensive / $299 Expanded).
 * DB lab_panels.non_member_price_cents must stay in sync (migration 20260615120000).
 */
import { CORE_SERVICES } from "./stripeConfig";
import { labMemberCents } from "./pricing";

export type LabCheckoutTier = "comprehensive" | "expanded";

export interface LabPanelCheckoutMeta {
  tier: LabCheckoutTier;
  /** Approximate analyte count for staff reference */
  testCount: number;
  /** Default program association */
  programs: string[];
}

/** Clinical panel slug → Stripe checkout tier (not per-test pricing). */
export const LAB_PANEL_CHECKOUT: Record<string, LabPanelCheckoutMeta> = {
  "foundation-wellness": {
    tier: "comprehensive",
    testCount: 8,
    programs: ["wellness", "general"],
  },
  "hormone-male": {
    tier: "comprehensive",
    testCount: 16,
    programs: ["trt"],
  },
  "hormone-female": {
    tier: "comprehensive",
    testCount: 18,
    programs: ["hrt"],
  },
  "weight-optimization": {
    tier: "expanded",
    testCount: 13,
    programs: ["glp1", "metabolic"],
  },
  "sexual-wellness": {
    tier: "comprehensive",
    testCount: 7,
    programs: [],
  },
};

export function labCheckoutTierForSlug(slug: string): LabCheckoutTier {
  return LAB_PANEL_CHECKOUT[slug]?.tier ?? "comprehensive";
}

export function labPanelNonMemberCents(slug: string): number {
  const tier = labCheckoutTierForSlug(slug);
  return tier === "expanded"
    ? CORE_SERVICES.expandedPanel.amount
    : CORE_SERVICES.comprehensivePanel.amount;
}

export function labPanelMemberCents(slug: string): number {
  return labMemberCents(labPanelNonMemberCents(slug));
}

export function labPanelDisplayPrice(slug: string, isMember: boolean): string {
  const cents = isMember ? labPanelMemberCents(slug) : labPanelNonMemberCents(slug);
  return `$${Math.round(cents / 100)}`;
}

export function stripePriceIdForLabSlug(slug: string): string {
  const tier = labCheckoutTierForSlug(slug);
  return tier === "expanded"
    ? CORE_SERVICES.expandedPanel.priceId
    : CORE_SERVICES.comprehensivePanel.priceId;
}

/** Default clinical panel slug per ELEVATED program at onboarding. */
export const PROGRAM_DEFAULT_LAB_SLUG: Record<string, string> = {
  trt: "hormone-male",
  hrt: "hormone-female",
  glp1: "weight-optimization",
  metabolicRecomposition: "weight-optimization",
  wellness: "foundation-wellness",
};
