/**
 * Public treatment architecture — goal-first paths for storefronts.
 * Therapy availability truth: supabase/functions/_shared/therapy-catalog.ts
 */
import { therapyByKey } from "./therapyCatalog";

export interface TreatmentGoalPath {
  id: string;
  goal: string;
  summary: string;
  href: string;
  therapyKeys: string[];
  cta: string;
  providerNote: string;
}

/** Goal-first navigation for /services and intake — not a full formulary list. */
export const TREATMENT_GOAL_PATHS: TreatmentGoalPath[] = [
  {
    id: "weight_loss",
    goal: "Medical weight loss & metabolic health",
    summary:
      "Physician-guided GLP-1 programs with labs, titration, and ongoing monitoring — individualized to your history.",
    href: "/weight-loss",
    therapyKeys: ["semaglutide", "tirzepatide", "retatrutide"],
    cta: "Wellness Assessment",
    providerNote: "Program-only options; retatrutide is physician-selected within the GLP-1 lane when appropriate.",
  },
  {
    id: "peptides",
    goal: "Peptide therapy & recovery",
    summary:
      "Recovery, longevity, and transformation support — provider-reviewed after assessment, never self-selected online.",
    href: "/peptides",
    therapyKeys: ["bpc-157", "tb-500", "sermorelin", "tesamorelin", "cjc-ipamorelin", "ghk-cu"],
    cta: "Wellness Assessment",
    providerNote: "Recovery Peptide Review for BPC-157 and TB-500; other peptides layered when clinically appropriate.",
  },
  {
    id: "hormones",
    goal: "Hormone optimization",
    summary:
      "Men's TRT and women's BHRT with LabCorp labs and compounded transdermal protocols when prescribed.",
    href: "/hormones",
    therapyKeys: [],
    cta: "Wellness Assessment",
    providerNote: "Cream-based protocols; labs required before treatment plans.",
  },
  {
    id: "iv",
    goal: "IV hydration & NAD+ booster",
    summary: "Walk-in IV Lounge — book online, complete a safety screen, pay at checkout. No $79 consult required.",
    href: "/iv-lounge",
    therapyKeys: [],
    cta: "Book IV",
    providerNote: "Lane A — direct booking only; do not route through the Wellness Assessment modal.",
  },
];

export function therapyLabelsForGoal(path: TreatmentGoalPath): string[] {
  return path.therapyKeys
    .map((key) => therapyByKey(key)?.name.replace(/\s*\(.+\)$/, ""))
    .filter((name): name is string => Boolean(name));
}
