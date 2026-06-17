/**
 * Universal safety screen — nine pre-gate items before candidate evaluation.
 * Positive answers force provider review (needs_contra_review posture).
 */

export const UNIVERSAL_SAFETY_QUESTION_IDS = [
  "safety_pregnant_or_nursing",
  "safety_nitrates",
  "safety_recent_cardiac_event",
  "safety_uncontrolled_bp",
  "safety_active_cancer",
  "safety_cardiac_conditions",
  "safety_liver_kidney",
  "safety_anaphylaxis",
  "safety_substance_use",
] as const;

export type UniversalSafetyQuestionId = (typeof UNIVERSAL_SAFETY_QUESTION_IDS)[number];

export interface UniversalSafetyInput {
  /** Question id → affirmative when true */
  affirmativeAnswers: Record<string, boolean>;
}

export interface UniversalSafetyResult {
  passed: boolean;
  positiveItems: string[];
  forceProviderReview: boolean;
}

export function runUniversalSafetyScreen(input: UniversalSafetyInput): UniversalSafetyResult {
  const positiveItems = UNIVERSAL_SAFETY_QUESTION_IDS.filter(
    (id) => input.affirmativeAnswers[id] === true,
  );
  return {
    passed: positiveItems.length === 0,
    positiveItems: [...positiveItems],
    forceProviderReview: positiveItems.length > 0,
  };
}
