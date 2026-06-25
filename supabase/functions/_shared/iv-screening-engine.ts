/**
 * IV screening catalog + deterministic evaluator (Priority 5).
 * Shared by evaluate-iv-screening edge function, frontend tests, and staff guide.
 */

export const IV_SCREENING_ENGINE_VERSION = "iv-screening/1.0.0";

export type IvScreeningIntake = {
  has_chf: boolean;
  has_esrd: boolean;
  is_pregnant: boolean;
  has_anaphylaxis_history: boolean;
  has_g6pd_deficiency: boolean;
  has_ckd: boolean;
  on_anticoagulants: boolean;
  has_hypertension_uncontrolled: boolean;
  has_diabetes: boolean;
  has_thyroid_disorder: boolean;
  currently_breastfeeding: boolean;
  has_sesame_allergy: boolean;
  has_iv_allergies: boolean;
};

export type IvTherapyContext = {
  id: string;
  name: string;
  requires_g6pd_clearance: boolean;
  contraindicates_sesame_allergy: boolean;
};

export type IvScreeningOutcome = "blocked" | "warned" | "cleared";

export type IvBlockSeverity = "hard" | "service_specific" | null;

export interface IvScreeningEvaluation {
  screening_result: IvScreeningOutcome;
  block_reasons: string[];
  warn_reasons: string[];
  block_severity: IvBlockSeverity;
  staff_actions: string[];
}

export interface IvIngredientRule {
  ingredientKey: string;
  displayName: string;
  servicesContaining: string[];
  hardContraindications: string[];
  softWarnings: string[];
  requiresG6pdClearance?: boolean;
  staffAction: string;
}

/** Catalog of high-risk IV ingredients — staff reference; therapy flags in DB are authoritative at runtime. */
export const IV_INGREDIENT_RULES: IvIngredientRule[] = [
  {
    ingredientKey: "vitamin_c_high_dose",
    displayName: "Vitamin C (high-dose infusion)",
    servicesContaining: ["Custom IV Build", "Immunity"],
    hardContraindications: ["g6pd_deficiency"],
    softWarnings: ["ckd"],
    requiresG6pdClearance: true,
    staffAction: "Confirm G6PD status before high-dose vitamin C; use lower dose or alternate drip if unclear.",
  },
  {
    ingredientKey: "glutathione_push",
    displayName: "Glutathione IV push",
    servicesContaining: ["Glutathione IV Push", "Myers Cocktail"],
    hardContraindications: [],
    softWarnings: ["asthma_sensitive"],
    staffAction: "Observe 15 min post-push; have bronchodilator protocol available per standing order.",
  },
  {
    // Standalone NAD+ infusions discontinued 2026-06-25; NAD+ now only as the
    // $50 IV "NAD+ Booster" add-on, which still warrants the same titration care.
    ingredientKey: "nad_booster",
    displayName: "NAD+",
    servicesContaining: ["NAD+ Booster"],
    hardContraindications: [],
    softWarnings: ["hypertension_uncontrolled", "pregnancy"],
    staffAction: "Slow titration; vitals q15min first 30 minutes.",
  },
  {
    ingredientKey: "meyers_magnesium",
    displayName: "Magnesium (Myers)",
    servicesContaining: ["Myers Cocktail"],
    hardContraindications: ["esrd"],
    softWarnings: ["ckd", "anticoagulants"],
    staffAction: "Reduce rate if flushing or hypotension; renal caution.",
  },
  {
    ingredientKey: "selank_addon",
    displayName: "Selank (peptide add-on)",
    servicesContaining: ["Custom IV Build"],
    hardContraindications: [],
    softWarnings: ["research_peptide_consent"],
    staffAction: "Research peptide consent on file before compounding add-on.",
  },
];

export const IV_HARD_BLOCK_RULES: Array<{
  intakeKey: keyof IvScreeningIntake;
  message: string;
  severity: "hard";
}> = [
  { intakeKey: "has_chf", message: "Active CHF is a contraindication for IV hydration therapy.", severity: "hard" },
  { intakeKey: "has_esrd", message: "End-stage renal disease is a contraindication.", severity: "hard" },
  { intakeKey: "is_pregnant", message: "We do not provide IV therapy during pregnancy at this clinic.", severity: "hard" },
  {
    intakeKey: "has_anaphylaxis_history",
    message: "History of anaphylaxis requires in-person physician consultation prior to any IV therapy.",
    severity: "hard",
  },
];

export const IV_WARNING_RULES: Array<{
  intakeKey: keyof IvScreeningIntake;
  message: string;
  staffAction: string;
}> = [
  { intakeKey: "has_ckd", message: "Chronic kidney disease — reduced fluid volume recommended.", staffAction: "Use conservative volume; physician review if eGFR <30." },
  { intakeKey: "on_anticoagulants", message: "Anticoagulant use — careful venipuncture required.", staffAction: "Apply pressure protocol; document bruising risk." },
  { intakeKey: "has_hypertension_uncontrolled", message: "Uncontrolled HTN — vitals must be checked before infusion.", staffAction: "BP must be <160/100 or defer to physician." },
  { intakeKey: "has_diabetes", message: "Diabetes — monitor if dextrose-containing service.", staffAction: "Check glucose if symptomatic during infusion." },
  { intakeKey: "has_thyroid_disorder", message: "Thyroid disorder noted.", staffAction: "No automatic block — document in chart." },
  { intakeKey: "currently_breastfeeding", message: "Breastfeeding — some ingredients pass into breast milk.", staffAction: "Discuss timing of feedings; defer elective peptides." },
  { intakeKey: "has_iv_allergies", message: "Reported IV allergies require staff review pre-infusion.", staffAction: "RN must acknowledge warnings screen before infusion." },
];

export function evaluateIvScreening(
  intake: IvScreeningIntake,
  therapy: IvTherapyContext,
): IvScreeningEvaluation {
  const blockReasons: string[] = [];
  const warnReasons: string[] = [];
  const staffActions: string[] = [];

  for (const rule of IV_HARD_BLOCK_RULES) {
    if (intake[rule.intakeKey]) blockReasons.push(rule.message);
  }

  if (therapy.requires_g6pd_clearance && intake.has_g6pd_deficiency) {
    blockReasons.push("G6PD deficiency contraindicates the selected service.");
    staffActions.push("Offer Myers without high-dose vitamin C or refer for G6PD lab.");
  }

  if (therapy.contraindicates_sesame_allergy && intake.has_sesame_allergy) {
    blockReasons.push(
      "Selected service is formulated in sesame oil and you reported a sesame allergy.",
    );
    staffActions.push("Select alternate formulation or different drip.");
  }

  for (const rule of IV_WARNING_RULES) {
    if (intake[rule.intakeKey]) {
      warnReasons.push(rule.message);
      staffActions.push(rule.staffAction);
    }
  }

  const screening_result: IvScreeningOutcome =
    blockReasons.length > 0 ? "blocked" : warnReasons.length > 0 ? "warned" : "cleared";

  const block_severity: IvBlockSeverity =
    screening_result === "blocked"
      ? intake.has_chf || intake.has_esrd || intake.is_pregnant || intake.has_anaphylaxis_history
        ? "hard"
        : "service_specific"
      : null;

  return {
    screening_result,
    block_reasons: blockReasons,
    warn_reasons: warnReasons,
    block_severity,
    staff_actions: [...new Set(staffActions)],
  };
}

export function isHardBlockSeverity(severity: IvBlockSeverity): boolean {
  return severity === "hard";
}
