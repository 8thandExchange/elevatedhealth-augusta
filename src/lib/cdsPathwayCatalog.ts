/**
 * CDS pathway display helpers — reads engine/API fields; does not duplicate formulary medicine.
 */
import { GOAL_LABELS, type PatientGoal } from "./clinicalPathwayEngine";
import { labPanelDisplayPrice, labPanelNonMemberCents } from "./labPanelCheckout";
import { LAB_PANEL_DISPLAY_NAMES, type LabPanelSlug } from "./labPanelRecommendations";
import { ELEVATED_PROGRAMS, type ElevatedProgramKey } from "./stripeConfig";

export interface CdsPathwaySummary {
  id?: string;
  pathway_id?: string;
  slug: string;
  name: string;
  goal_key: string;
  recommended_lab_slug: string | null;
  elevated_program_key: string | null;
  staff_redirect_notes: string | null;
  active?: boolean;
}

export function formatRecommendedLabPanel(
  labSlug: string | null | undefined,
  isMember = false,
): { label: string; displayPrice: string | null; cents: number | null } {
  if (!labSlug) {
    return { label: "No default panel (IV screening or workup first)", displayPrice: null, cents: null };
  }
  return {
    label: LAB_PANEL_DISPLAY_NAMES[labSlug as LabPanelSlug] ?? labSlug,
    displayPrice: labPanelDisplayPrice(labSlug, isMember),
    cents: labPanelNonMemberCents(labSlug),
  };
}

export function formatElevatedProgram(programKey: string | null | undefined): string | null {
  if (!programKey) return null;
  const key = programKey as ElevatedProgramKey;
  if (key in ELEVATED_PROGRAMS) {
    return `${ELEVATED_PROGRAMS[key].name} (${ELEVATED_PROGRAMS[key].displayPrice})`;
  }
  return programKey;
}

export function goalLabel(goalKey: string | null | undefined): string {
  if (!goalKey) return "Not set";
  if (goalKey in GOAL_LABELS) return GOAL_LABELS[goalKey as PatientGoal];
  return goalKey;
}
