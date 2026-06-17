/**
 * Recovery Peptide Review — consult-gated care lane (provider/internal).
 * Triggers labs, safety screens, consent, sign-off, economics, and supply checks.
 */
import {
  catalogBySlug,
  canStaffQuote,
  itemGrossProfitCents,
  itemMarginPercent,
  type ClinicalOptimizationItem,
} from "./clinicalOptimizationCatalog";
import { recoveryPeptideSupplyProfile, supplyProfileForItem } from "./supplyReadiness";
import { LAB_PANEL_SLUGS } from "./labPanelRecommendations";

export const RECOVERY_PEPTIDE_CARE_LANE_ID = "recovery_peptide_review" as const;
export const RECOVERY_PEPTIDE_CARE_LANE_LABEL = "Recovery Peptide Review";

export const RECOVERY_PEPTIDE_PUBLIC_LANGUAGE =
  "Recovery peptide protocols for active adults, training recovery, tendon and ligament concerns, soft-tissue recovery, joint support, and inflammation-related recovery goals. Options may include BPC-157, TB-500, BPC-157/TB-500 recovery protocols, or related recovery peptides when clinically appropriate and prescribed by a provider.";

export const RECOVERY_PEPTIDE_PATIENT_PORTAL_MESSAGE =
  "Your provider is reviewing whether a recovery peptide protocol is appropriate based on your history, symptoms, goals, labs, and safety screen.";

export const RECOVERY_PEPTIDE_STAFF_HANDOFF =
  "Patient is in the Recovery Peptide Review pathway. Complete safety screens, labs, and Research Peptide Consent before discussing BPC-157, TB-500, the recovery stack, or PDA. Quote only when economics and supply are ready and the physician has signed the plan.";

export type RecoveryPeptideSlug =
  | "bpc-157"
  | "tb-500"
  | "bpc-157-tb-500-stack"
  | "pda-pentadeca-arginate";

export interface RecoveryPeptideReviewInput {
  injuryRecoveryGoalDocumented: boolean;
  malignancyHistoryScreened: boolean;
  malignancyHistoryClear: boolean;
  pregnancyBreastfeedingScreened: boolean;
  pregnancyBreastfeedingClear: boolean;
  medicationHistoryReviewed: boolean;
  allergyReviewed: boolean;
  autoimmuneInflammatoryReviewed: boolean;
  anticoagulantBleedingRiskReviewed: boolean;
  researchPeptideConsentOnFile: boolean;
  providerSignedOff: boolean;
  selectedCompound?: RecoveryPeptideSlug;
}

export type RecoveryGateStatus = "pending" | "passed" | "blocked" | "needs_review";

export interface RecoveryPeptideGate {
  id: string;
  label: string;
  status: RecoveryGateStatus;
  detail: string;
}

export interface RecoveryPeptideEconomicsView {
  patientPriceCents: number | null;
  memberPriceCents: number | null;
  clinicCostCents: number | null;
  grossProfitCents: number | null;
  marginPercent: number | null;
  warnings: string[];
}

export interface RecoveryPeptideReviewResult {
  laneId: typeof RECOVERY_PEPTIDE_CARE_LANE_ID;
  laneLabel: typeof RECOVERY_PEPTIDE_CARE_LANE_LABEL;
  suggestedLabPanelSlug: string;
  gates: RecoveryPeptideGate[];
  canProceedToQuote: boolean;
  canProceedToOrder: boolean;
  blockers: string[];
  staffActions: string[];
  patientHandoff: string;
  economics?: RecoveryPeptideEconomicsView;
}

const RECOVERY_COMPOUNDS: RecoveryPeptideSlug[] = [
  "bpc-157",
  "tb-500",
  "bpc-157-tb-500-stack",
  "pda-pentadeca-arginate",
];

const RECOVERY_GOAL_KEYWORDS =
  /injur|recovery|tendon|ligament|joint|training|inflamm|athlete|soft.?tissue|performance|active lifestyle/i;

export function recoveryCompoundItems(): ClinicalOptimizationItem[] {
  return RECOVERY_COMPOUNDS.map((s) => catalogBySlug(s)).filter(
    (i): i is ClinicalOptimizationItem => i != null,
  );
}

export function shouldRouteToRecoveryPeptideReview(input: {
  interests?: string[];
  goalText?: string;
  primaryGoal?: string;
}): boolean {
  if (input.interests?.includes("recovery_peptides")) return true;
  const blob = [input.goalText, input.primaryGoal, ...(input.interests ?? [])]
    .filter(Boolean)
    .join(" ");
  return RECOVERY_GOAL_KEYWORDS.test(blob);
}

export function recoveryEconomicsView(
  compound: ClinicalOptimizationItem,
): RecoveryPeptideEconomicsView {
  const warnings: string[] = [];
  if (compound.clinic_cost_cents == null) warnings.push("Missing supplier/clinic cost");
  if (compound.patient_price_cents == null) warnings.push("Missing patient price");
  const margin = itemMarginPercent(compound);
  if (margin != null && margin < compound.margin_threshold_pct) {
    warnings.push(`Low margin: ${margin}% (threshold ${compound.margin_threshold_pct}%)`);
  }
  return {
    patientPriceCents: compound.patient_price_cents,
    memberPriceCents: compound.member_price_cents,
    clinicCostCents: compound.clinic_cost_cents,
    grossProfitCents: itemGrossProfitCents(compound),
    marginPercent: margin,
    warnings,
  };
}

export function evaluateRecoveryPeptideReview(
  input: RecoveryPeptideReviewInput,
): RecoveryPeptideReviewResult {
  const gates: RecoveryPeptideGate[] = [];
  const blockers: string[] = [];
  const staffActions: string[] = [];

  const pushGate = (
    id: string,
    label: string,
    ok: boolean,
    needsReview: boolean,
    passDetail: string,
    failDetail: string,
  ) => {
    gates.push({
      id,
      label,
      status: ok ? "passed" : needsReview ? "needs_review" : "blocked",
      detail: ok ? passDetail : failDetail,
    });
    if (!ok) blockers.push(failDetail);
  };

  pushGate(
    "wellness_assessment",
    "Wellness Assessment",
    true,
    false,
    "Assessment is the front door for Recovery Peptide Review",
    "Book $79 Wellness Assessment before recovery peptide planning",
  );

  pushGate(
    "labs",
    "Foundational or provider-selected labs",
    true,
    false,
    `Default panel: ${LAB_PANEL_SLUGS.foundational} — physician may expand`,
    "Order appropriate baseline labs before recovery peptide discussion",
  );

  pushGate(
    "medication_history",
    "Medication review",
    input.medicationHistoryReviewed,
    false,
    "Current medications reviewed",
    "Complete medication review in chart",
  );

  pushGate(
    "allergy_review",
    "Allergy review",
    input.allergyReviewed,
    false,
    "Allergies reviewed",
    "Document allergy review before Rx",
  );

  pushGate(
    "malignancy_screen",
    "Active / recent malignancy screen",
    input.malignancyHistoryScreened && input.malignancyHistoryClear,
    input.malignancyHistoryScreened && !input.malignancyHistoryClear,
    "No active malignancy concern documented",
    input.malignancyHistoryScreened
      ? "Oncology clearance or physician deferral required before recovery peptides"
      : "Document malignancy history screen",
  );

  pushGate(
    "pregnancy_screen",
    "Pregnancy / breastfeeding screen",
    input.pregnancyBreastfeedingScreened && input.pregnancyBreastfeedingClear,
    input.pregnancyBreastfeedingScreened && !input.pregnancyBreastfeedingClear,
    "Not pregnant or breastfeeding",
    input.pregnancyBreastfeedingScreened
      ? "Recovery peptides deferred during pregnancy/breastfeeding"
      : "Document pregnancy/breastfeeding status",
  );

  pushGate(
    "autoimmune_review",
    "Autoimmune / inflammatory history (if relevant)",
    input.autoimmuneInflammatoryReviewed,
    false,
    "Relevant autoimmune/inflammatory history reviewed",
    "Document autoimmune or inflammatory history when clinically relevant",
  );

  pushGate(
    "bleeding_risk",
    "Anticoagulant / bleeding risk review (if relevant)",
    input.anticoagulantBleedingRiskReviewed,
    false,
    "Bleeding risk reviewed when anticoagulants or bleeding history present",
    "Complete anticoagulant/bleeding risk review when applicable",
  );

  pushGate(
    "recovery_goal",
    "Injury / recovery goal documentation",
    input.injuryRecoveryGoalDocumented,
    false,
    "Recovery indication documented in chart",
    "Document injury, training load, or recovery goal before peptide selection",
  );

  pushGate(
    "consent",
    "Research Peptide Consent",
    input.researchPeptideConsentOnFile,
    false,
    "Consent on file",
    "Collect Research Peptide Consent before first Rx",
  );

  pushGate(
    "provider_signoff",
    "Provider sign-off",
    input.providerSignedOff,
    false,
    "Physician approved recovery peptide plan",
    "Physician must sign protocol before pharmacy order",
  );

  let economics: RecoveryPeptideEconomicsView | undefined;
  const compound = input.selectedCompound ? catalogBySlug(input.selectedCompound) : null;

  if (compound) {
    economics = recoveryEconomicsView(compound);
    const quote = canStaffQuote(compound);
    pushGate(
      "economics",
      "Price / cost / margin",
      quote.ok,
      !quote.ok && quote.blockers.some((b) => b.includes("Margin")),
      economics.marginPercent != null
        ? `Margin ${economics.marginPercent}% — gross profit $${((economics.grossProfitCents ?? 0) / 100).toFixed(2)}`
        : "Economics within threshold or approved",
      quote.blockers.join("; ") || "Complete pricing and COGS before quoting",
    );

    if (compound.ordering_supplies_required) {
      const profile =
        compound.supply_checklist_key === "recovery_peptide"
          ? recoveryPeptideSupplyProfile(compound.display_name)
          : supplyProfileForItem(compound);
      pushGate(
        "supply",
        "Supply / inventory readiness",
        Boolean(compound.supplier),
        false,
        `Supplier: ${compound.supplier}; ${profile.checklist.length} checklist items`,
        "Confirm supplier route and injection supplies before ordering",
      );
    }

    if (!compound.supplier) {
      staffActions.push("Confirm FCC/GC pharmacy availability for selected compound");
    }
  } else {
    staffActions.push("Select BPC-157, TB-500, recovery stack, or PDA after review");
  }

  const clinicalBlockers = blockers.filter(
    (b) =>
      !b.includes("COGS") &&
      !b.includes("Margin") &&
      !b.includes("Missing patient price") &&
      !b.includes("Missing clinic cost") &&
      !b.includes("supplier") &&
      !b.includes("Physician must sign"),
  );
  const canProceedToQuote =
    input.injuryRecoveryGoalDocumented &&
    input.medicationHistoryReviewed &&
    input.allergyReviewed &&
    input.researchPeptideConsentOnFile &&
    clinicalBlockers.length === 0;

  const canProceedToOrder = canProceedToQuote && input.providerSignedOff && blockers.length === 0;

  return {
    laneId: RECOVERY_PEPTIDE_CARE_LANE_ID,
    laneLabel: RECOVERY_PEPTIDE_CARE_LANE_LABEL,
    suggestedLabPanelSlug: LAB_PANEL_SLUGS.foundational,
    gates,
    canProceedToQuote,
    canProceedToOrder,
    blockers,
    staffActions,
    patientHandoff: RECOVERY_PEPTIDE_PATIENT_PORTAL_MESSAGE,
    economics,
  };
}
