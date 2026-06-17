/**
 * Maps patient intake answers + question bank tags to CDS draft assessment payload.
 */

export interface IntakeQuestionOption {
  value: string;
  label: string;
}

export interface IntakeQuestionTags {
  symptomKeys?: string[];
  contraindicationTags?: string[];
  labTriggers?: string[];
  hardStop?: boolean;
}

export interface IntakeQuestion {
  id: string;
  text: string;
  type: "yes_no" | "single" | "multi" | "scale";
  options?: IntakeQuestionOption[];
  patientFacing: true;
  tags: IntakeQuestionTags;
  routesToPathways: string[];
}

export type IntakeAnswers = Record<string, string | string[] | number | boolean>;

export const PATHWAY_SLUG_TO_GOAL: Record<string, string> = {
  "weight-loss-glp1": "weight_loss",
  "metabolic-recomposition": "metabolic_recomposition",
  "low-testosterone-trt": "low_testosterone",
  "hormone-women-bhrt": "hormone_women",
  "energy-fatigue-wellness": "energy_fatigue",
  "recovery-injury": "recovery_injury",
  "libido-sexual-wellness": "libido",
  "longevity-wellness": "longevity",
  "general-wellness": "general_wellness",
  "iv-hydration-only": "iv_only",
  "prediabetes-insulin-resistance": "prediabetes_insulin_resistance",
  "male-sexual-function": "male_sexual_function",
  "female-sexual-function": "female_sexual_function",
  "thyroid-optimization": "thyroid_optimization",
  "anemia-iron": "anemia_iron",
  aesthetics: "aesthetics",
};

export interface IntakeAssessmentDraft {
  goalKey: string | null;
  symptomsSelected: string[];
  preFlaggedContraindications: string[];
  labNeeds: string[];
  hardStops: string[];
  inferredPathwaySlugs: string[];
  universalSafetyPositive: string[];
  ivScreeningFlags?: {
    blocked: boolean;
    blockReasons: string[];
    warnReasons: string[];
  };
}

function isAffirmative(value: unknown): boolean {
  if (value === true || value === 1) return true;
  if (typeof value === "string") {
    const v = value.toLowerCase().trim();
    return v === "yes" || v === "true" || v === "1";
  }
  return false;
}

function questionMatchesAnswer(question: IntakeQuestion, answers: IntakeAnswers): boolean {
  const raw = answers[question.id];
  if (raw === undefined || raw === null) return false;

  if (question.type === "multi" && Array.isArray(raw)) {
    return raw.length > 0;
  }
  if (question.type === "scale" && typeof raw === "number") {
    return raw >= 7;
  }
  return isAffirmative(raw);
}

export function mapIntakeToAssessment(
  answers: IntakeAnswers,
  questionBank: IntakeQuestion[],
): IntakeAssessmentDraft {
  const symptomsSelected = new Set<string>();
  const preFlaggedContraindications = new Set<string>();
  const labNeeds = new Set<string>();
  const hardStops = new Set<string>();
  const pathwayCounts = new Map<string, number>();
  const universalSafetyPositive: string[] = [];

  for (const question of questionBank) {
    if (!questionMatchesAnswer(question, answers)) continue;

    if (question.type === "multi" && Array.isArray(answers[question.id])) {
      for (const value of answers[question.id] as string[]) {
        symptomsSelected.add(value);
      }
    }

    for (const key of question.tags.symptomKeys ?? []) {
      symptomsSelected.add(key);
    }
    for (const tag of question.tags.contraindicationTags ?? []) {
      preFlaggedContraindications.add(tag);
    }
    for (const analyte of question.tags.labTriggers ?? []) {
      labNeeds.add(analyte);
    }
    if (question.tags.hardStop) {
      hardStops.add(question.id);
    }

    for (const slug of question.routesToPathways) {
      pathwayCounts.set(slug, (pathwayCounts.get(slug) ?? 0) + 1);
    }

    if (question.id.startsWith("safety_") && isAffirmative(answers[question.id])) {
      universalSafetyPositive.push(question.id);
    }
  }

  const inferredPathwaySlugs = [...pathwayCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([slug]) => slug);

  const topSlug = inferredPathwaySlugs[0] ?? null;
  const goalKey = topSlug ? (PATHWAY_SLUG_TO_GOAL[topSlug] ?? null) : null;

  return {
    goalKey,
    symptomsSelected: [...symptomsSelected],
    preFlaggedContraindications: [...preFlaggedContraindications],
    labNeeds: [...labNeeds],
    hardStops: [...hardStops],
    inferredPathwaySlugs,
    universalSafetyPositive,
  };
}

/** Maps public intake form safety + interest fields to question-bank answer keys. */
export function mapPublicIntakeFormToAnswers(form: {
  safety_screening?: {
    pregnant_or_nursing?: boolean;
    cardiac_conditions?: boolean;
    liver_kidney_disease?: boolean;
    substance_use_history?: boolean;
  };
  intake_interests?: string[];
  treatment_goals?: string;
}): IntakeAnswers {
  const answers: IntakeAnswers = {};
  const safety = form.safety_screening ?? {};

  if (safety.pregnant_or_nursing) answers.safety_pregnant_or_nursing = true;
  if (safety.cardiac_conditions) {
    answers.safety_cardiac_conditions = true;
  }
  if (safety.liver_kidney_disease) {
    answers.safety_liver_kidney = true;
  }
  if (safety.substance_use_history) {
    answers.safety_substance_use = true;
  }

  for (const interest of form.intake_interests ?? []) {
    if (interest === "glp1") answers.intake_interest_glp1 = true;
    if (interest === "hormones") answers.intake_interest_hormones = true;
    if (interest === "sexual_wellness") answers.intake_interest_sexual_wellness = true;
    if (interest === "iv") answers.intake_interest_iv = true;
    if (interest === "peptides" || interest === "recovery_peptides") {
      answers.recovery_injury = true;
    }
  }

  const goals = (form.treatment_goals ?? "").toLowerCase();
  if (/erectile| ed\b|male sexual/.test(goals)) answers.male_ed_onset = true;
  if (/libido|sexual/.test(goals)) answers.female_libido_low = true;
  if (/thyroid|tsh/.test(goals)) answers.thyroid_symptoms = true;
  if (/anemia|iron|fatigue/.test(goals)) answers.anemia_symptoms = true;
  if (/prediabetes|insulin/.test(goals)) answers.prediabetes_known_diagnosis = true;

  return answers;
}
