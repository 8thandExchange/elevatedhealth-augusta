/** Pre-payment wellness consult safety screening (Lane B). */

export type ConsultScreeningResult = "cleared" | "blocked" | "flagged";

export interface ConsultScreeningInput {
  gender: "female" | "male" | "other";
  pregnant_or_breastfeeding?: boolean;
  breast_cancer_history?: boolean;
  uterine_cancer_history?: boolean;
  prostate_cancer_history?: boolean;
  active_blood_clot?: boolean;
  polycythemia?: boolean;
  active_cancer_treatment?: boolean;
  severe_heart_failure?: boolean;
  acknowledged_disclaimer: boolean;
}

export interface ConsultScreeningOutcome {
  result: ConsultScreeningResult;
  blockReasons: string[];
  flagReasons: string[];
}

const BLOCK_LABELS: Record<string, string> = {
  pregnant_or_breastfeeding: "Pregnant or breastfeeding",
  breast_cancer_history: "Personal history of breast cancer",
  uterine_cancer_history: "Personal history of uterine/endometrial cancer",
  prostate_cancer_history: "Personal history of prostate cancer",
  active_blood_clot: "Active blood clot (DVT/PE)",
  polycythemia: "Polycythemia (elevated red blood cell count)",
  active_cancer_treatment: "Active cancer treatment",
  severe_heart_failure: "Severe or uncontrolled heart failure",
};

export function evaluateConsultPrequalScreening(
  input: ConsultScreeningInput,
): ConsultScreeningOutcome {
  const blockReasons: string[] = [];
  const flagReasons: string[] = [];

  if (!input.acknowledged_disclaimer) {
    blockReasons.push("Medical disclaimer not acknowledged");
  }

  if (input.gender === "female" && input.pregnant_or_breastfeeding) {
    blockReasons.push(BLOCK_LABELS.pregnant_or_breastfeeding);
  }

  if (input.breast_cancer_history) blockReasons.push(BLOCK_LABELS.breast_cancer_history);
  if (input.gender === "female" && input.uterine_cancer_history) {
    blockReasons.push(BLOCK_LABELS.uterine_cancer_history);
  }
  if (input.gender === "male" && input.prostate_cancer_history) {
    blockReasons.push(BLOCK_LABELS.prostate_cancer_history);
  }
  if (input.active_blood_clot) blockReasons.push(BLOCK_LABELS.active_blood_clot);
  if (input.gender === "male" && input.polycythemia) {
    blockReasons.push(BLOCK_LABELS.polycythemia);
  }
  if (input.active_cancer_treatment) blockReasons.push(BLOCK_LABELS.active_cancer_treatment);
  if (input.severe_heart_failure) blockReasons.push(BLOCK_LABELS.severe_heart_failure);

  if (blockReasons.length > 0) {
    return { result: "blocked", blockReasons, flagReasons };
  }

  return { result: "cleared", blockReasons: [], flagReasons };
}

export function consultScreeningBlockMessage(reasons: string[]): string {
  if (reasons.length === 0) {
    return "Based on your answers, we cannot proceed with online enrollment. Please call the clinic to discuss options.";
  }
  return `Based on your answers (${reasons.join("; ")}), we cannot proceed with online enrollment. Please call (706) 760-3470 so our care team can guide you.`;
}
