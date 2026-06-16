/**
 * Lab catalog — panel slugs, goal routing, and workbook panel names.
 * Clinical test composition lives in DB (lab_tests + panel_tests); this file
 * only maps goals/programs to panel slugs and Stripe checkout tiers.
 */
import type { PatientGoal } from "./clinicalPathwayEngine";

export const LAB_PANEL_SLUGS = {
  foundational: "foundation-wellness",
  maleHormone: "hormone-male",
  femaleHormone: "hormone-female",
  expandedWeight: "weight-optimization",
  sexualWellness: "sexual-wellness",
} as const;

export type LabPanelSlug = (typeof LAB_PANEL_SLUGS)[keyof typeof LAB_PANEL_SLUGS];

/** Workbook panel display names keyed by slug */
export const LAB_PANEL_DISPLAY_NAMES: Record<LabPanelSlug, string> = {
  [LAB_PANEL_SLUGS.foundational]: "Foundational Labs",
  [LAB_PANEL_SLUGS.maleHormone]: "Male Hormone Panel",
  [LAB_PANEL_SLUGS.femaleHormone]: "Female Hormone Panel",
  [LAB_PANEL_SLUGS.expandedWeight]: "Expanded Panel / Weight Optimization",
  [LAB_PANEL_SLUGS.sexualWellness]: "Sexual Wellness Labs",
};

/** Patient goal / program interest → default lab panel slug (clinical guide §3) */
export const GOAL_TO_LAB_PANEL_SLUG: Record<PatientGoal, LabPanelSlug | null> = {
  weight_loss: LAB_PANEL_SLUGS.expandedWeight,
  metabolic_recomposition: LAB_PANEL_SLUGS.expandedWeight,
  low_testosterone: LAB_PANEL_SLUGS.maleHormone,
  hormone_women: LAB_PANEL_SLUGS.femaleHormone,
  energy_fatigue: LAB_PANEL_SLUGS.foundational,
  recovery_injury: LAB_PANEL_SLUGS.foundational,
  libido: LAB_PANEL_SLUGS.sexualWellness,
  longevity: LAB_PANEL_SLUGS.foundational,
  iv_only: null,
  general_wellness: LAB_PANEL_SLUGS.foundational,
};

export function recommendLabPanelSlug(
  goal: PatientGoal,
  options?: { patientSex?: "male" | "female" | null },
): LabPanelSlug | null {
  if (goal === "low_testosterone" && options?.patientSex === "female") {
    return LAB_PANEL_SLUGS.femaleHormone;
  }
  if (goal in GOAL_TO_LAB_PANEL_SLUG) {
    return GOAL_TO_LAB_PANEL_SLUG[goal];
  }
  return LAB_PANEL_SLUGS.foundational;
}

export function recommendLabPanelSlugFromSymptoms(symptoms: string[]): LabPanelSlug {
  const s = symptoms.map((x) => x.toLowerCase());
  if (s.some((x) => x.includes("weight") || x.includes("metabolic"))) {
    return LAB_PANEL_SLUGS.expandedWeight;
  }
  if (s.some((x) => x.includes("testosterone") || x.includes("low t"))) {
    return LAB_PANEL_SLUGS.maleHormone;
  }
  if (s.some((x) => x.includes("menopause") || x.includes("hormone") && x.includes("women"))) {
    return LAB_PANEL_SLUGS.femaleHormone;
  }
  if (s.some((x) => x.includes("libido") || x.includes("sexual"))) {
    return LAB_PANEL_SLUGS.sexualWellness;
  }
  return LAB_PANEL_SLUGS.foundational;
}
