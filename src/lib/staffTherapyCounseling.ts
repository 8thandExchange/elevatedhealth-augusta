/**
 * Staff-facing therapy counseling strings — derived from canonical catalog + Stripe.
 * @see supabase/functions/_shared/therapy-catalog.ts
 * @see src/lib/stripeConfig.ts
 */
import { ELEVATED_PROGRAMS_PRICE_RANGE } from "./membershipCopy";
import {
  CORE_SERVICES,
  ELEVATED_PROGRAMS,
  GLP1_PROGRAM_VARIANTS,
  MEDICATION_FILLS,
} from "./stripeConfig";
import { ketamineNotOfferedPatientCopy, therapyByKey } from "./therapyCatalog";

export const GLP1_PROGRAM_COUNSELING = `ELEVATED GLP-1 (semaglutide ${GLP1_PROGRAM_VARIANTS.semaglutide.displayPrice} · tirzepatide ${GLP1_PROGRAM_VARIANTS.tirzepatide.displayPrice})`;

export const GLP1_COUNSEL_THEN = `Counsel: ${GLP1_PROGRAM_COUNSELING}. ${CORE_SERVICES.wellnessAssessment.displayPrice} consult first.`;

export const GLP1_ENROLL_THEN = `Enroll ${GLP1_PROGRAM_COUNSELING}. Use combo enrollment if hormones also indicated (medication-only add-on on same subscription).`;

export const GLP1_ALGO006_ENROLL = `Enroll ${GLP1_PROGRAM_COUNSELING} via Stripe. Advanced support is à la carte / gated, not a separate program SKU.`;

export const GLP1_RECOMPOSITION_UPSELL = `Advanced recomposition support (lean-mass/metabolic peptides; gated retatrutide at ${MEDICATION_FILLS.retatrutide.displayPrice} when physician-selected) is layered inside the GLP-1 program at the physician's discretion — reviewed in person.`;

export const GLP1_RECOMPOSITION_REVIEW_THEN = `Approve advanced recomposition support within ELEVATED GLP-1 (gated retatrutide at ${MEDICATION_FILLS.retatrutide.displayPrice} per GLP-1 consent Section 11A) → ALGO-006.`;

export const GLP1_RECOMPOSITION_ANCHOR_STEP = `Anchor: semaglutide or tirzepatide per GLP-1 protocol. Retatrutide ONLY if gated/physician-selected (${MEDICATION_FILLS.retatrutide.displayPrice}) — titrate from 0.5 mg/wk.`;

export const LANE_B_CONSULT_CHARGE = `$79 consult → program ${ELEVATED_PROGRAMS_PRICE_RANGE}`;

export const RESULTS_REVIEW_HORMONE_GLP_CHARGE = `${ELEVATED_PROGRAMS.trt.displayPrice} TRT or ${GLP1_PROGRAM_VARIANTS.semaglutide.displayPrice}–${GLP1_PROGRAM_VARIANTS.tirzepatide.displayPrice} GLP-1`;

export const C03_PROGRAM_AMOUNT = ELEVATED_PROGRAMS_PRICE_RANGE;

export const C06_RETATRUTIDE_VERIFY = `Provider-directed à la carte; retatrutide ${MEDICATION_FILLS.retatrutide.displayPrice} gated/physician-selected under GLP-1 consent`;

export const RETATRUTIDE_PEPTIDE_LAYER_RULE = `Retatrutide is NOT a casual peptide add-on — GLP-1 lane only, physician-gated at ${MEDICATION_FILLS.retatrutide.displayPrice}.`;

export const NAD_IV_BOOSTER_ONLY_RULE =
  "Standalone NAD+ peptide SKUs discontinued; NAD+ is the $50 IV booster add-on only.";

export const REVENUE_LANE_BULLETS: readonly string[] = [
  "Lane A — IV Lounge: open booking, Stripe prepay at checkout; staff may use pay-at-visit for walk-ins.",
  `Lane B — Consult-gated: ${CORE_SERVICES.wellnessAssessment.displayPrice} consult → labs → ELEVATED program (${ELEVATED_PROGRAMS_PRICE_RANGE}).`,
  "Hidden at launch: sexual wellness, hair restoration.",
  `${ketamineNotOfferedPatientCopy()} Retatrutide is gated/physician-only within the GLP-1 consent (${MEDICATION_FILLS.retatrutide.displayPrice} when selected) — never advertised, never the lead.`,
];

/** Confirmed retatrutide monthly price for audits and staff reference. */
export function retatrutideMonthlyDisplayPrice(): string {
  return therapyByKey("retatrutide")?.displayPrice ?? MEDICATION_FILLS.retatrutide.displayPrice;
}
