import { fmtUsd } from "./pricing";
import { COMBO_ADDONS, quoteCombo } from "./elevatedComboPrograms";

/** Patient-facing combo upsell — weight-loss led. */
export const COMBO_GLP1_HORMONE_HEADLINE =
  "Need hormones too? Add optimization for as little as $129/mo";

export const COMBO_GLP1_HORMONE_BODY =
  "When clinically appropriate, layer TRT or HRT as a medication-only add-on on your ELEVATED GLP-1 program. One visit, one lab cadence, both medications — save $100/mo vs enrolling in two full programs.";

/** Hormone-led upsell. */
export const COMBO_HORMONE_GLP1_HEADLINE =
  "Also working on weight? Add GLP-1 from $249/mo";

export const COMBO_HORMONE_GLP1_BODY =
  "Your ELEVATED TRT or HRT program includes your care bundle. When weight management is also a goal, add compounded semaglutide or tirzepatide as a medication-only add-on — no duplicate check-ins or quarterly lab fees.";

export const COMBO_SAVINGS_HOOK = "Save $100/month compared to two separate ELEVATED enrollments.";

/** Example totals for marketing tables. */
export const COMBO_EXAMPLE_TOTALS = {
  glp1SemaPlusTrt: quoteCombo({ anchor: "glp1_semaglutide", addon: "trt" }).totalDisplay,
  glp1SemaPlusHrt: quoteCombo({ anchor: "glp1_semaglutide", addon: "hrt" }).totalDisplay,
  trtPlusGlp1Sema: quoteCombo({ anchor: "trt", addon: "glp1_semaglutide" }).totalDisplay,
} as const;

export function comboAddonMarketingLine(addonKey: keyof typeof COMBO_ADDONS): string {
  const a = COMBO_ADDONS[addonKey];
  return `${a.shortLabel} for only ${fmtUsd(a.addOnMonthlyCents)}/mo`;
}
