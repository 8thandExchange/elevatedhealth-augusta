import { INTAKE_QUESTION_BANK } from "@/data/intake/questionBank";
import type { IntakeAnswers } from "@/data/intake/types";
import {
  mapIntakeToAssessment as mapIntakeCore,
  mapPublicIntakeFormToAnswers,
  PATHWAY_SLUG_TO_GOAL,
  type IntakeAssessmentDraft,
} from "../../supabase/functions/_shared/intake-to-assessment.ts";
import { runUniversalSafetyScreen } from "./universalSafetyScreen";
import { evaluateIvScreening, type IvScreeningIntake } from "../../supabase/functions/_shared/iv-screening-engine.ts";

export {
  mapPublicIntakeFormToAnswers,
  PATHWAY_SLUG_TO_GOAL,
  type IntakeAssessmentDraft,
};

export function mapIntakeToAssessment(answers: IntakeAnswers): IntakeAssessmentDraft {
  const draft = mapIntakeCore(answers, INTAKE_QUESTION_BANK as Parameters<typeof mapIntakeCore>[1]);

  const safety = runUniversalSafetyScreen({
    affirmativeAnswers: Object.fromEntries(
      draft.universalSafetyPositive.map((id) => [id, true]),
    ),
  });

  if (safety.forceProviderReview) {
    for (const id of safety.positiveItems) {
      draft.hardStops.push(id);
    }
  }

  return draft;
}

export function mapIntakeWithIvScreening(
  answers: IntakeAnswers,
  ivIntake?: Partial<IvScreeningIntake>,
): IntakeAssessmentDraft {
  const draft = mapIntakeToAssessment(answers);

  if (ivIntake && answers.intake_interest_iv) {
    const iv = evaluateIvScreening(
      {
        has_chf: !!ivIntake.has_chf,
        has_esrd: !!ivIntake.has_esrd,
        is_pregnant: !!ivIntake.is_pregnant,
        has_anaphylaxis_history: !!ivIntake.has_anaphylaxis_history,
        has_g6pd_deficiency: !!ivIntake.has_g6pd_deficiency,
        has_ckd: !!ivIntake.has_ckd,
        on_anticoagulants: !!ivIntake.on_anticoagulants,
        has_hypertension_uncontrolled: !!ivIntake.has_hypertension_uncontrolled,
        has_diabetes: !!ivIntake.has_diabetes,
        has_thyroid_disorder: !!ivIntake.has_thyroid_disorder,
        currently_breastfeeding: !!ivIntake.currently_breastfeeding,
        has_sesame_allergy: !!ivIntake.has_sesame_allergy,
        has_iv_allergies: !!ivIntake.has_iv_allergies,
      },
      { id: "standing-menu", name: "IV Lounge", requires_g6pd_clearance: true, contraindicates_sesame_allergy: false },
    );

    draft.ivScreeningFlags = {
      blocked: iv.screening_result === "blocked",
      blockReasons: iv.block_reasons,
      warnReasons: iv.warn_reasons,
    };

    if (iv.screening_result === "blocked") {
      draft.hardStops.push("iv_screening_blocked");
      for (const tag of ["chf", "esrd", "pregnancy", "anaphylaxis_history", "g6pd_high_dose_vitc"]) {
        draft.preFlaggedContraindications.push(tag);
      }
    } else if (iv.screening_result === "warned") {
      draft.preFlaggedContraindications.push("iv_provider_review");
    }
  }

  return draft;
}

export function intakeDraftForcesProviderReview(draft: IntakeAssessmentDraft): boolean {
  return (
    draft.hardStops.length > 0 ||
    draft.universalSafetyPositive.length > 0 ||
    draft.ivScreeningFlags?.blocked === true
  );
}
