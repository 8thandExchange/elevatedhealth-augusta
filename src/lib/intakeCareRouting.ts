/**
 * Patient intake → care lane routing (plain-language outputs only).
 */
import { recommendLabPanelSlug, LAB_PANEL_DISPLAY_NAMES, type LabPanelSlug } from "./labPanelRecommendations";
import type { PatientGoal } from "./clinicalPathwayEngine";
import {
  RECOVERY_PEPTIDE_CARE_LANE_ID,
  RECOVERY_PEPTIDE_CARE_LANE_LABEL,
  RECOVERY_PEPTIDE_PATIENT_PORTAL_MESSAGE,
  shouldRouteToRecoveryPeptideReview,
} from "./recoveryPeptideCareLane";
import { filterVisibleVisitReasons } from "./serviceConfig";

export type IntakeInterest =
  | "iv"
  | "hormones"
  | "glp1"
  | "peptides"
  | "recovery_peptides"
  | "sexual_wellness"
  | "general_optimization";

export interface IntakeRoutingInput {
  primaryGoal: PatientGoal;
  secondaryGoals?: PatientGoal[];
  interests: IntakeInterest[];
  patientSex?: "male" | "female" | null;
  isPregnant?: boolean;
  isBreastfeeding?: boolean;
}

export type CareLane = "lane_a_iv" | "lane_b_consult";

export interface IntakeRoutingResult {
  lane: CareLane;
  careLaneId?: string;
  careLaneLabel?: string;
  suggestedLabPanel: LabPanelSlug | null;
  labPanelLabel: string | null;
  ivScreenRequired: boolean;
  providerPeptideReview: boolean;
  recoveryPeptideReview: boolean;
  patientHeadline: string;
  patientBody: string;
  staffNotes: string[];
}

const INTEREST_TO_GOAL: Partial<Record<IntakeInterest, PatientGoal>> = {
  iv: "iv_only",
  hormones: "low_testosterone",
  glp1: "weight_loss",
  peptides: "recovery_injury",
  recovery_peptides: "recovery_injury",
  sexual_wellness: "libido",
  general_optimization: "general_wellness",
};

export function routeIntakeCare(input: IntakeRoutingInput): IntakeRoutingResult {
  const staffNotes: string[] = [];
  const ivOnly =
    input.interests.length === 1 && input.interests[0] === "iv" && input.primaryGoal === "iv_only";

  if (ivOnly) {
    return {
      lane: "lane_a_iv",
      suggestedLabPanel: null,
      labPanelLabel: null,
      ivScreenRequired: true,
      providerPeptideReview: false,
      recoveryPeptideReview: false,
      patientHeadline: "Your next step: IV Lounge booking",
      patientBody:
        "Complete the IV safety screen, then book your drip. If you're also interested in hormones, weight loss, or peptides, we recommend starting with a Wellness Assessment.",
      staffNotes: ["Lane A — IV screen before infusion"],
    };
  }

  if (input.isPregnant || input.isBreastfeeding) {
    staffNotes.push("Pregnancy/breastfeeding flagged — physician review before any Rx");
  }

  const goal =
    input.primaryGoal ||
    INTEREST_TO_GOAL[input.interests[0] ?? "general_optimization"] ||
    "general_wellness";

  const panel = recommendLabPanelSlug(goal, { patientSex: input.patientSex });
  const panelLabel = panel ? LAB_PANEL_DISPLAY_NAMES[panel] : null;

  const recoveryInterest = shouldRouteToRecoveryPeptideReview({
    interests: input.interests,
    primaryGoal: goal,
  });

  if (input.interests.includes("peptides") && !recoveryInterest) {
    staffNotes.push("General peptide interest — route to Wellness Assessment; narrow menu at provider review");
  }
  if (recoveryInterest) {
    staffNotes.push(`${RECOVERY_PEPTIDE_CARE_LANE_LABEL}: foundational labs, malignancy screen, pregnancy screen, Research Peptide Consent, provider sign-off`);
    staffNotes.push("Do not quote BPC-157 / TB-500 / stack until Recovery Peptide Review gates pass");
  }
  if (input.interests.includes("glp1")) {
    staffNotes.push("Expanded panel preferred for GLP-1 baseline");
  }
  if (input.interests.includes("sexual_wellness")) {
    staffNotes.push("Sexual wellness labs when clinically indicated");
  }

  return {
    lane: "lane_b_consult",
    careLaneId: recoveryInterest ? RECOVERY_PEPTIDE_CARE_LANE_ID : undefined,
    careLaneLabel: recoveryInterest ? RECOVERY_PEPTIDE_CARE_LANE_LABEL : undefined,
    suggestedLabPanel: panel,
    labPanelLabel: panelLabel,
    ivScreenRequired: input.interests.includes("iv"),
    providerPeptideReview:
      input.interests.includes("peptides") || input.interests.includes("recovery_peptides"),
    recoveryPeptideReview: recoveryInterest,
    patientHeadline: "Your next step is the Wellness Assessment",
    patientBody: recoveryInterest
      ? "Recovery peptides such as BPC-157 and TB-500 may be discussed when clinically appropriate — after your Wellness Assessment, safety screens, labs, and provider review. They are not walk-in or self-selected products."
      : "Your provider will review your history and decide which labs and treatment options are appropriate. We do not prescribe from symptoms alone — care is lab-guided and individualized.",
    staffNotes,
  };
}

export const INTAKE_INTEREST_OPTIONS: { id: IntakeInterest; label: string }[] = [
  { id: "iv", label: "IV hydration / NAD+" },
  { id: "hormones", label: "Hormone optimization (TRT / BHRT)" },
  { id: "glp1", label: "Medical weight loss (GLP-1)" },
  { id: "recovery_peptides", label: "Recovery Peptide Review (BPC-157 / TB-500 / tissue recovery)" },
  { id: "peptides", label: "Other peptide therapy (vitality, longevity, aesthetic)" },
  { id: "sexual_wellness", label: "Sexual wellness" },
  { id: "general_optimization", label: "General health optimization" },
];

export function getIntakeInterestOptions() {
  return filterVisibleVisitReasons(INTAKE_INTEREST_OPTIONS);
}
