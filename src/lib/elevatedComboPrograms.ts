/**
 * ELEVATED combo programs — anchor + medication-only add-on.
 *
 * One subscription owns the care bundle (RN check-ins, messaging, quarterly labs).
 * Add-ons cover prescribed medication + pharmacy fulfillment only — no duplicate bundle.
 *
 * Pricing analysis: docs/pricing/elevated_combo_programs.md
 * Stripe add-on price IDs: live — see ELEVATED_COMBO_ADDONS in stripeConfig.ts.
 */
import {
  ELEVATED_PROGRAMS,
  GLP1_PROGRAM_VARIANTS,
  CORE_SERVICES,
  ELEVATED_COMBO_ADDONS,
  type ElevatedProgramKey,
} from "./stripeConfig";
import { fmtUsd } from "./pricing";

/** Primary program on the subscription — owns shared clinical bundle. */
export type ComboAnchorKey =
  | "glp1_semaglutide"
  | "glp1_tirzepatide"
  | "trt"
  | "hrt";

/** Medication-only line item stacked on the anchor subscription. */
export type ComboAddonKey = "trt" | "hrt" | "glp1_semaglutide" | "glp1_tirzepatide";

export type ComboGenderRule = "male" | "female" | "any";

/** Overlap removed vs enrolling two full ELEVATED programs (RN + labs + messaging). */
export const COMBO_DUPLICATE_CARE_SAVINGS_CENTS = 10_000;

/** Care included once on the anchor — never duplicated on add-on SKUs. */
export const COMBO_SHARED_CARE_BULLETS = [
  "Monthly RN check-in (both protocols reviewed in one visit)",
  "Unlimited secure messaging",
  "Quarterly in-office labs (Expanded panel when GLP-1 is in the mix)",
  "Physician review and protocol adjustments when clinically indicated",
] as const;

export interface ComboAnchorDefinition {
  key: ComboAnchorKey;
  label: string;
  programKey: ElevatedProgramKey;
  molecule?: "semaglutide" | "tirzepatide";
  monthlyCents: number;
  displayPrice: string;
  /** Live Stripe price for the full anchor program. */
  stripePriceId: string;
  defaultLabSlug: "weight-optimization" | "hormone-male" | "hormone-female";
  consents: string[];
}

export interface ComboAddonDefinition {
  key: ComboAddonKey;
  label: string;
  shortLabel: string;
  /** Medication-only monthly add-on (not a second full program). */
  addOnMonthlyCents: number;
  addOnDisplayPrice: string;
  /** Full standalone program price — used to show savings. */
  fullProgramMonthlyCents: number;
  genderRule: ComboGenderRule;
  medicationsIncluded: string;
  consents: string[];
  /** Estimated drug COGS (materials only) — see business_case_operations_brief. */
  estimatedDrugCogsCents: number;
  /** Live Stripe add-on price — null until bootstrap creates SKUs. */
  stripePriceId: string | null;
}

export interface ComboSelection {
  anchor: ComboAnchorKey;
  addon: ComboAddonKey | null;
}

export interface ComboQuote {
  selection: ComboSelection;
  anchor: ComboAnchorDefinition;
  addon: ComboAddonDefinition | null;
  anchorMonthlyCents: number;
  addonMonthlyCents: number;
  totalMonthlyCents: number;
  totalDisplay: string;
  fullDualMonthlyCents: number;
  savingsVsFullDualCents: number;
  savingsDisplay: string;
  marketingHeadline: string;
  marketingSubline: string;
  comboSlug: string;
  onboardingLabSlug: "weight-optimization" | "hormone-male" | "hormone-female";
  onboardingLabDisplay: string;
  requiredConsents: string[];
}

const ANCHORS: Record<ComboAnchorKey, ComboAnchorDefinition> = {
  glp1_semaglutide: {
    key: "glp1_semaglutide",
    label: "ELEVATED GLP-1 · Semaglutide",
    programKey: "glp1",
    molecule: "semaglutide",
    monthlyCents: GLP1_PROGRAM_VARIANTS.semaglutide.amount,
    displayPrice: GLP1_PROGRAM_VARIANTS.semaglutide.displayPrice,
    stripePriceId: GLP1_PROGRAM_VARIANTS.semaglutide.priceId,
    defaultLabSlug: "weight-optimization",
    consents: ["GLP-1 Consent"],
  },
  glp1_tirzepatide: {
    key: "glp1_tirzepatide",
    label: "ELEVATED GLP-1 · Tirzepatide",
    programKey: "glp1",
    molecule: "tirzepatide",
    monthlyCents: GLP1_PROGRAM_VARIANTS.tirzepatide.amount,
    displayPrice: GLP1_PROGRAM_VARIANTS.tirzepatide.displayPrice,
    stripePriceId: GLP1_PROGRAM_VARIANTS.tirzepatide.priceId,
    defaultLabSlug: "weight-optimization",
    consents: ["GLP-1 Consent"],
  },
  trt: {
    key: "trt",
    label: ELEVATED_PROGRAMS.trt.name,
    programKey: "trt",
    monthlyCents: ELEVATED_PROGRAMS.trt.amount,
    displayPrice: ELEVATED_PROGRAMS.trt.displayPrice,
    stripePriceId: ELEVATED_PROGRAMS.trt.priceId,
    defaultLabSlug: "hormone-male",
    consents: ["Hormone Therapy Consent"],
  },
  hrt: {
    key: "hrt",
    label: ELEVATED_PROGRAMS.hrt.name,
    programKey: "hrt",
    monthlyCents: ELEVATED_PROGRAMS.hrt.amount,
    displayPrice: ELEVATED_PROGRAMS.hrt.displayPrice,
    stripePriceId: ELEVATED_PROGRAMS.hrt.priceId,
    defaultLabSlug: "hormone-female",
    consents: ["Hormone Therapy Consent"],
  },
};

/** Medication-only add-ons — symmetric $100 below full program vs anchor+addon totals. */
export const COMBO_ADDONS: Record<ComboAddonKey, ComboAddonDefinition> = {
  trt: {
    key: "trt",
    label: "TRT medication add-on",
    shortLabel: "Add TRT",
    addOnMonthlyCents: 14_900,
    addOnDisplayPrice: "+$149/mo",
    fullProgramMonthlyCents: ELEVATED_PROGRAMS.trt.amount,
    genderRule: "male",
    medicationsIncluded: "Testosterone cream (men's dose), physician-titrated",
    consents: ["Hormone Therapy Consent"],
    estimatedDrugCogsCents: 3_600,
    stripePriceId: ELEVATED_COMBO_ADDONS.trt.priceId,
  },
  hrt: {
    key: "hrt",
    label: "HRT medication add-on",
    shortLabel: "Add HRT",
    addOnMonthlyCents: 12_900,
    addOnDisplayPrice: ELEVATED_COMBO_ADDONS.hrt.displayPrice,
    fullProgramMonthlyCents: ELEVATED_PROGRAMS.hrt.amount,
    genderRule: "female",
    medicationsIncluded: "Bi-Est cream + progesterone as prescribed",
    consents: ["Hormone Therapy Consent"],
    estimatedDrugCogsCents: 5_800,
    stripePriceId: ELEVATED_COMBO_ADDONS.hrt.priceId,
  },
  glp1_semaglutide: {
    key: "glp1_semaglutide",
    label: "GLP-1 semaglutide medication add-on",
    shortLabel: "Add Semaglutide",
    addOnMonthlyCents: 24_900,
    addOnDisplayPrice: ELEVATED_COMBO_ADDONS.glp1_semaglutide.displayPrice,
    fullProgramMonthlyCents: GLP1_PROGRAM_VARIANTS.semaglutide.amount,
    genderRule: "any",
    medicationsIncluded: "Compounded semaglutide, dose titration included in anchor care",
    consents: ["GLP-1 Consent"],
    estimatedDrugCogsCents: 10_700,
    stripePriceId: ELEVATED_COMBO_ADDONS.glp1_semaglutide.priceId,
  },
  glp1_tirzepatide: {
    key: "glp1_tirzepatide",
    label: "GLP-1 tirzepatide medication add-on",
    shortLabel: "Add Tirzepatide",
    addOnMonthlyCents: 34_900,
    addOnDisplayPrice: ELEVATED_COMBO_ADDONS.glp1_tirzepatide.displayPrice,
    fullProgramMonthlyCents: GLP1_PROGRAM_VARIANTS.tirzepatide.amount,
    genderRule: "any",
    medicationsIncluded: "Compounded tirzepatide, dose titration included in anchor care",
    consents: ["GLP-1 Consent"],
    estimatedDrugCogsCents: 18_500,
    stripePriceId: ELEVATED_COMBO_ADDONS.glp1_tirzepatide.priceId,
  },
};

/** Which add-ons are valid for each anchor (excludes conflicting same-lane stacks). */
const VALID_ADDONS_BY_ANCHOR: Record<ComboAnchorKey, ComboAddonKey[]> = {
  glp1_semaglutide: ["trt", "hrt"],
  glp1_tirzepatide: ["trt", "hrt"],
  trt: ["glp1_semaglutide", "glp1_tirzepatide"],
  hrt: ["glp1_semaglutide", "glp1_tirzepatide"],
};

export function getAnchorDefinition(key: ComboAnchorKey): ComboAnchorDefinition {
  return ANCHORS[key];
}

export function getAddonDefinition(key: ComboAddonKey): ComboAddonDefinition {
  return COMBO_ADDONS[key];
}

export function allComboAnchors(): ComboAnchorDefinition[] {
  return Object.values(ANCHORS);
}

function normalizeGender(gender: string | null | undefined): ComboGenderRule | "unknown" {
  const g = (gender ?? "").toLowerCase();
  if (g === "male" || g === "m") return "male";
  if (g === "female" || g === "f") return "female";
  return "unknown";
}

function genderAllowsAddon(
  gender: string | null | undefined,
  addon: ComboAddonDefinition,
): boolean {
  if (addon.genderRule === "any") return true;
  const g = normalizeGender(gender);
  if (g === "unknown") return true;
  return g === addon.genderRule;
}

/** Add-on keys valid for anchor + patient gender. */
export function getValidAddonsForAnchor(
  anchorKey: ComboAnchorKey,
  gender?: string | null,
): ComboAddonKey[] {
  return VALID_ADDONS_BY_ANCHOR[anchorKey].filter((k) =>
    genderAllowsAddon(gender, COMBO_ADDONS[k]),
  );
}

/** Every anchor-only + anchor+addon quote (gender-filtered). */
export function listComboOptions(gender?: string | null): ComboQuote[] {
  const quotes: ComboQuote[] = [];
  for (const anchor of allComboAnchors()) {
    quotes.push(quoteCombo({ anchor: anchor.key, addon: null }));
    for (const addonKey of getValidAddonsForAnchor(anchor.key, gender)) {
      quotes.push(quoteCombo({ anchor: anchor.key, addon: addonKey }));
    }
  }
  return quotes;
}

export function quoteCombo(selection: ComboSelection): ComboQuote {
  const anchor = ANCHORS[selection.anchor];
  const addon = selection.addon ? COMBO_ADDONS[selection.addon] : null;

  const anchorMonthlyCents = anchor.monthlyCents;
  const addonMonthlyCents = addon?.addOnMonthlyCents ?? 0;
  const totalMonthlyCents = anchorMonthlyCents + addonMonthlyCents;

  const fullDualMonthlyCents = addon
    ? anchor.monthlyCents + addon.fullProgramMonthlyCents
    : anchor.monthlyCents;

  const savingsVsFullDualCents = addon
    ? fullDualMonthlyCents - totalMonthlyCents
    : 0;

  const comboSlug = addon ? `${selection.anchor}+${selection.addon}` : selection.anchor;

  const onboardingLabSlug: ComboQuote["onboardingLabSlug"] =
    anchor.programKey === "glp1" || selection.addon?.startsWith("glp1")
      ? "weight-optimization"
      : anchor.defaultLabSlug;

  const onboardingLabDisplay =
    onboardingLabSlug === "weight-optimization"
      ? CORE_SERVICES.expandedPanel.displayPrice
      : CORE_SERVICES.comprehensivePanel.displayPrice;

  const requiredConsents = [...new Set([...anchor.consents, ...(addon?.consents ?? [])])];

  const marketingHeadline = addon
    ? `${addon.shortLabel} for only ${fmtUsd(addon.addOnMonthlyCents)}/mo`
    : anchor.label;

  const marketingSubline = addon
    ? `${fmtUsd(totalMonthlyCents)}/mo total · save ${fmtUsd(savingsVsFullDualCents)}/mo vs two full programs`
    : `${anchor.displayPrice} · full ELEVATED bundle`;

  return {
    selection,
    anchor,
    addon,
    anchorMonthlyCents,
    addonMonthlyCents,
    totalMonthlyCents,
    totalDisplay: `${fmtUsd(totalMonthlyCents)}/mo`,
    fullDualMonthlyCents,
    savingsVsFullDualCents,
    savingsDisplay: fmtUsd(savingsVsFullDualCents),
    marketingHeadline,
    marketingSubline,
    comboSlug,
    onboardingLabSlug,
    onboardingLabDisplay,
    requiredConsents,
  };
}

/** Parse combo_slug from staff checkout / activation flows. */
export function parseComboSlug(slug: string): ComboSelection {
  const trimmed = slug.trim();
  if (!trimmed) {
    throw new Error("Combo slug is required");
  }
  if (trimmed.includes("+")) {
    const [anchor, addon] = trimmed.split("+", 2);
    return {
      anchor: anchor as ComboAnchorKey,
      addon: addon as ComboAddonKey,
    };
  }
  return { anchor: trimmed as ComboAnchorKey, addon: null };
}

/** Suggest default anchor from patient primary_program / treatment_request. */
export function inferAnchorFromPatient(input: {
  primary_program?: string | null;
  treatment_request?: string | null;
  gender?: string | null;
}): ComboAnchorKey {
  const p = (input.primary_program ?? input.treatment_request ?? "").toLowerCase();
  if (p.includes("tirzepatide")) return "glp1_tirzepatide";
  if (p.includes("semaglutide") || p.includes("glp1") || p.includes("weight")) {
    return "glp1_semaglutide";
  }
  if (p.includes("trt") || (input.gender === "male" && p.includes("hormone"))) {
    return "trt";
  }
  if (p.includes("hrt") || p.includes("hormone")) return "hrt";
  return "glp1_semaglutide";
}

/** Gross margin on add-on line (materials COGS only — excludes labor/labs on anchor). */
export function addonGrossMarginPercent(addonKey: ComboAddonKey): number {
  const a = COMBO_ADDONS[addonKey];
  return Math.round(((a.addOnMonthlyCents - a.estimatedDrugCogsCents) / a.addOnMonthlyCents) * 100);
}

/** Stripe line items for checkout (anchor + optional add-on). */
export function stripeLineItemsForCombo(selection: ComboSelection): Array<{
  price: string;
  quantity: number;
}> {
  const quote = quoteCombo(selection);
  const items: Array<{ price: string; quantity: number }> = [
    { price: quote.anchor.stripePriceId, quantity: 1 },
  ];
  if (quote.addon?.stripePriceId) {
    items.push({ price: quote.addon.stripePriceId, quantity: 1 });
  }
  return items;
}

export function assertComboPricingInvariants(): void {
  for (const anchorKey of Object.keys(VALID_ADDONS_BY_ANCHOR) as ComboAnchorKey[]) {
    for (const addonKey of VALID_ADDONS_BY_ANCHOR[anchorKey]) {
      const q = quoteCombo({ anchor: anchorKey, addon: addonKey });
      if (q.savingsVsFullDualCents !== COMBO_DUPLICATE_CARE_SAVINGS_CENTS) {
        throw new Error(
          `Combo invariant: expected $100 savings for ${q.comboSlug}, got ${q.savingsVsFullDualCents}`,
        );
      }
    }
  }

  for (const addonKey of Object.keys(COMBO_ADDONS) as ComboAddonKey[]) {
    const a = COMBO_ADDONS[addonKey];
    const savings = a.fullProgramMonthlyCents - a.addOnMonthlyCents;
    if (savings !== COMBO_DUPLICATE_CARE_SAVINGS_CENTS) {
      throw new Error(`Add-on ${addonKey}: full−addon should save $100, got ${savings}`);
    }
    const margin = addonGrossMarginPercent(addonKey);
    if (margin < 30) {
      throw new Error(`Add-on ${addonKey}: margin ${margin}% below 30% floor`);
    }
  }

  const semaFromGlp = quoteCombo({ anchor: "glp1_semaglutide", addon: "trt" }).totalMonthlyCents;
  const semaFromTrt = quoteCombo({ anchor: "trt", addon: "glp1_semaglutide" }).totalMonthlyCents;
  if (semaFromGlp !== semaFromTrt) {
    throw new Error("Combo symmetry: GLP-1 sema + TRT must equal TRT + GLP-1 sema");
  }
}
