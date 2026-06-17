/**
 * Shared lab-redirect thresholds (cross-pathway safety gates).
 * Pathway-specific triggers remain on cds_pathway_lab_triggers rows.
 */

export type LabComparator = "gt" | "lt" | "eq";

export interface LabRedirectRule {
  analyteKey: string;
  comparator: LabComparator;
  threshold: number;
  unit: string;
  redirectMessage: string;
}

export const SHARED_LAB_REDIRECT_RULES: LabRedirectRule[] = [
  {
    analyteKey: "hba1c",
    comparator: "gt",
    threshold: 6.4,
    unit: "%",
    redirectMessage: "A1c over 6.4 — diabetes referral before GLP-1 or metformin path.",
  },
  {
    analyteKey: "tsh",
    comparator: "gt",
    threshold: 4.5,
    unit: "mIU/L",
    redirectMessage: "TSH over 4.5 — thyroid optimization or endocrine review.",
  },
  {
    analyteKey: "tsh_suppressed",
    comparator: "lt",
    threshold: 0.4,
    unit: "mIU/L",
    redirectMessage: "TSH under 0.4 — hyperthyroid workup before replacement.",
  },
  {
    analyteKey: "prolactin",
    comparator: "gt",
    threshold: 20,
    unit: "ng/mL",
    redirectMessage: "Prolactin over 20 — pituitary workup before hormone or libido therapy.",
  },
  {
    analyteKey: "hematocrit",
    comparator: "gt",
    threshold: 54,
    unit: "%",
    redirectMessage: "Hematocrit over 54 — TRT hold or phlebotomy review.",
  },
  {
    analyteKey: "psa",
    comparator: "gt",
    threshold: 4,
    unit: "ng/mL",
    redirectMessage: "PSA over 4 — urology review before TRT.",
  },
  {
    analyteKey: "egfr",
    comparator: "lt",
    threshold: 60,
    unit: "mL/min/1.73m2",
    redirectMessage: "eGFR under 60 — metformin caution and dose adjustment review.",
  },
  {
    analyteKey: "ferritin",
    comparator: "lt",
    threshold: 30,
    unit: "ng/mL",
    redirectMessage: "Ferritin under 30 — iron deficiency workup.",
  },
  {
    analyteKey: "hemoglobin",
    comparator: "lt",
    threshold: 12,
    unit: "g/dL",
    redirectMessage: "Hemoglobin under 12 — anemia workup before therapy.",
  },
  {
    analyteKey: "hemoglobin_male",
    comparator: "lt",
    threshold: 13,
    unit: "g/dL",
    redirectMessage: "Hemoglobin under 13 (male) — anemia workup before therapy.",
  },
];

export interface LabValueInput {
  analyteKey: string;
  value: number;
}

export interface LabRedirectHit {
  analyteKey: string;
  rule: LabRedirectRule;
  value: number;
}

function compare(comparator: LabComparator, value: number, threshold: number): boolean {
  if (comparator === "gt") return value > threshold;
  if (comparator === "lt") return value < threshold;
  return value === threshold;
}

export function evaluateSharedLabRedirects(values: LabValueInput[]): LabRedirectHit[] {
  const hits: LabRedirectHit[] = [];
  for (const sample of values) {
    for (const rule of SHARED_LAB_REDIRECT_RULES) {
      if (rule.analyteKey !== sample.analyteKey) continue;
      if (compare(rule.comparator, sample.value, rule.threshold)) {
        hits.push({ analyteKey: sample.analyteKey, rule, value: sample.value });
      }
    }
  }
  return hits;
}

export function hasSharedLabRedirect(values: LabValueInput[]): boolean {
  return evaluateSharedLabRedirects(values).length > 0;
}
