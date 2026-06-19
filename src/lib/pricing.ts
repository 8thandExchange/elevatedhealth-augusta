// src/lib/pricing.ts
// SINGLE SOURCE OF TRUTH for member vs non-member pricing.
// Nothing else in the app may compute a member price independently.
import {
  ELEVATED_PROGRAMS,
  type ElevatedProgramKey,
  CORE_SERVICES,
  IV_WALKIN_EXAMPLES,
  MEDICATION_FILLS,
  METABOLIC_STACK_ALACARTE,
  PEPTIDE_PRODUCTS,
  RECOVERY_PEPTIDE_PRODUCTS,
  SEXUAL_WELLNESS_PRODUCTS,
  HAIR_RESTORATION_PRODUCTS,
} from "./stripeConfig";
import { metabolicStackAlacarteNonMemberCents } from "./metabolicStackPricing";

export const MEMBER_DISCOUNT_PERCENT = 20;
const factor = (100 - MEMBER_DISCOUNT_PERCENT) / 100;

// How a sellable item is priced for members.
export type MemberPricing =
  | { kind: "discount" } // 20% off non-member
  | { kind: "included"; program: ElevatedProgramKey } // free for that program's members
  | { kind: "flat" }; // no member benefit (member == non-member)

export interface CatalogItem {
  key: string;
  label: string;
  nonMemberCents: number;
  member: MemberPricing;
  interval: "month" | "one_time";
}

// Build the catalog from existing config. Add memberPricing rules in ONE place.
function fromGroup(
  group: Record<string, { name: string; amount: number; interval?: string }>,
  rule: (key: string) => MemberPricing,
  interval: "month" | "one_time",
): Record<string, CatalogItem> {
  return Object.fromEntries(
    Object.entries(group).map(([key, v]) => [
      key,
      { key, label: v.name, nonMemberCents: v.amount, member: rule(key), interval },
    ]),
  );
}

export const CATALOG: Record<string, CatalogItem> = {
  // À la carte products that earn the standard member discount.
  ...fromGroup(PEPTIDE_PRODUCTS, () => ({ kind: "discount" }), "month"),
  // Recovery peptides are one-time à la carte fills with the standard member discount.
  ...fromGroup(RECOVERY_PEPTIDE_PRODUCTS, () => ({ kind: "discount" }), "one_time"),
  ...fromGroup(SEXUAL_WELLNESS_PRODUCTS, () => ({ kind: "discount" }), "month"),
  ...fromGroup(HAIR_RESTORATION_PRODUCTS, () => ({ kind: "discount" }), "month"),
  ...fromGroup(METABOLIC_STACK_ALACARTE, () => ({ kind: "discount" }), "month"),
  // Single medication fills: included for the matching program's members.
  ...fromGroup(
    MEDICATION_FILLS,
    (key) => {
      const map: Record<string, ElevatedProgramKey> = {
        testosterone: "trt",
        biEst: "hrt",
        progesterone: "hrt",
        semaglutide: "glp1",
        tirzepatide: "glp1",
        retatrutide: "metabolicRecomposition",
      };
      return { kind: "included", program: map[key] };
    },
    "one_time",
  ),
  // Core services: flat (intake is the same price for everyone).
  ...fromGroup(CORE_SERVICES, () => ({ kind: "flat" }), "one_time"),
  // IV Lounge walk-in reference (SOT with /iv-lounge NAD+ 250mg pricing).
  nadIv250Lounge: {
    key: "nadIv250Lounge",
    label: "NAD+ Infusion 250mg (IV Lounge)",
    nonMemberCents: 45000,
    member: { kind: "discount" },
    interval: "one_time",
  },
};

export function nonMemberPriceCents(item: CatalogItem): number {
  return item.nonMemberCents;
}

export function memberPriceCents(item: CatalogItem): number {
  switch (item.member.kind) {
    case "discount":
      return Math.round(item.nonMemberCents * factor);
    case "included":
      return 0;
    case "flat":
      return item.nonMemberCents;
  }
}

export function memberSavingsCents(item: CatalogItem): number {
  return nonMemberPriceCents(item) - memberPriceCents(item);
}

// Labs come from the DB. Derive the member price the SAME way; never trust a stale DB column.
export function labMemberCents(nonMemberCents: number): number {
  return Math.round(nonMemberCents * factor);
}

export const fmtUsd = (cents: number): string =>
  `$${Math.round(cents / 100).toLocaleString("en-US")}`;

const quarterlyVisitCents = () => Math.round(CORE_SERVICES.wellnessAssessment.amount / 3);

// Honest non-member steady monthly cost = medication + amortized quarterly labs + amortized check-in.
// Used by MembershipComparison. Guaranteed (by Task 4 test) to exceed the membership price.
export function nonMemberSteadyMonthlyCents(program: ElevatedProgramKey): number {
  const visit = quarterlyVisitCents();
  switch (program) {
    case "trt":
      return (
        MEDICATION_FILLS.testosterone.amount +
        Math.round(CORE_SERVICES.comprehensivePanel.amount / 3) +
        visit
      );
    case "hrt":
      return (
        MEDICATION_FILLS.biEst.amount +
        MEDICATION_FILLS.progesterone.amount +
        Math.round(CORE_SERVICES.comprehensivePanel.amount / 3) +
        visit
      );
    case "glp1":
      // default to semaglutide baseline; use nonMemberSteadyMonthlyCentsGlp1 for tirzepatide
      return (
        MEDICATION_FILLS.semaglutide.amount +
        Math.round(CORE_SERVICES.expandedPanel.amount / 3) +
        visit
      );
    case "wellness":
      // Matches MembershipComparison wellness IV baseline (2 Myers-equivalent drips + check-in).
      return IV_WALKIN_EXAMPLES.myersCocktailCents * 2 + CORE_SERVICES.wellnessAssessment.amount;
  }
}

/** GLP-1 non-member steady monthly when comparing a specific single-fill drug. */
export function nonMemberSteadyMonthlyCentsGlp1(drug: "semaglutide" | "tirzepatide"): number {
  const visit = quarterlyVisitCents();
  const fill = drug === "semaglutide" ? MEDICATION_FILLS.semaglutide : MEDICATION_FILLS.tirzepatide;
  return fill.amount + Math.round(CORE_SERVICES.expandedPanel.amount / 3) + visit;
}

export function assertPricingInvariants(): void {
  for (const item of Object.values(CATALOG)) {
    if (memberPriceCents(item) > nonMemberPriceCents(item)) {
      throw new Error(`Pricing invariant: member > non-member for ${item.key}`);
    }
  }
  (["trt", "hrt", "glp1", "wellness", "metabolicRecomposition"] as const).forEach((p) => {
    const steady =
      p === "metabolicRecomposition"
        ? metabolicStackAlacarteNonMemberCents()
        : nonMemberSteadyMonthlyCents(p);
    if (ELEVATED_PROGRAMS[p].amount >= steady) {
      throw new Error(
        `Pricing invariant: ${p} membership is not cheaper than à la carte steady cost`,
      );
    }
  });
}
