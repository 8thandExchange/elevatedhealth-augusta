/**
 * Staff-facing therapy counseling strings — derived from canonical catalog + Stripe.
 * @see supabase/functions/_shared/therapy-catalog.ts
 * @see src/lib/stripeConfig.ts
 */
import { IV_ADDONS_CATALOG } from "./ivAddonsCatalog";
import { ELEVATED_PROGRAMS_PRICE_RANGE } from "./membershipCopy";
import { fmtUsd } from "./pricing";
import {
  CORE_SERVICES,
  ELEVATED_COMBO_ADDONS,
  ELEVATED_PROGRAMS,
  GLP1_PROGRAM_VARIANTS,
  IV_WALKIN_EXAMPLES,
  MEDICATION_FILLS,
  PEPTIDE_PRODUCTS,
  RECOVERY_PEPTIDE_PRODUCTS,
} from "./stripeConfig";
import { ketamineNotOfferedPatientCopy, therapyByKey } from "./therapyCatalog";

const WA = CORE_SERVICES.wellnessAssessment.displayPrice;
const COMPREHENSIVE = CORE_SERVICES.comprehensivePanel.displayPrice;
const EXPANDED = CORE_SERVICES.expandedPanel.displayPrice;

export const WELLNESS_ASSESSMENT_PRICE = WA;

export const LAB_PANEL_CHARGE_RANGE = `${COMPREHENSIVE} Comprehensive vs ${EXPANDED} Expanded`;

export const C01_WELLNESS_AMOUNT = WA;

export const C02_LAB_AMOUNT = `${COMPREHENSIVE} or ${EXPANDED}`;

export const HORMONE_PROGRAM_COUNSELING = `${ELEVATED_PROGRAMS.trt.name} (${ELEVATED_PROGRAMS.trt.displayPrice}) or ${ELEVATED_PROGRAMS.hrt.name} (${ELEVATED_PROGRAMS.hrt.displayPrice})`;

export const HORMONE_COUNSEL_THEN = `Counsel: ${HORMONE_PROGRAM_COUNSELING}. Path starts with ${WA} Wellness Assessment.`;

export const TRT_ENROLL_THEN = `Enroll ${ELEVATED_PROGRAMS.trt.name} (${ELEVATED_PROGRAMS.trt.displayPrice}) — create-trt-checkout or membership flow.`;

export const HRT_ENROLL_THEN = `Enroll ${ELEVATED_PROGRAMS.hrt.name} (${ELEVATED_PROGRAMS.hrt.displayPrice}) — hormone protocol ALGO-004.`;

export const ELEVATED_IV_PROGRAM = `${ELEVATED_PROGRAMS.wellness.name} (${ELEVATED_PROGRAMS.wellness.displayPrice})`;

export const PEPTIDE_IV_COUNSEL_THEN = `Counsel: peptide options or ${ELEVATED_IV_PROGRAM}. Requires consult-gated path.`;

export const ELEVATED_IV_OFFER_THEN = `Offer ${ELEVATED_IV_PROGRAM} or retest in 3–6 months. Schedule follow-up.`;

export const HRT_SERMORELIN_CHARGE = `${ELEVATED_PROGRAMS.hrt.displayPrice} HRT; ${PEPTIDE_PRODUCTS.sermorelin.displayPrice} sermorelin if added`;

export const RECOVERY_FILL_CHARGE = `${RECOVERY_PEPTIDE_PRODUCTS.bpc157.displayPrice}/fill each`;

const pushPrices = IV_ADDONS_CATALOG.map((a) => a.price);
const minPush = Math.min(...pushPrices);
const maxPush = Math.max(...pushPrices);
const myersDisplay = fmtUsd(IV_WALKIN_EXAMPLES.myersCocktailCents);

export const IV_LOUNGE_ADDON_CHARGE = `Myers ${myersDisplay}, pushes $${minPush}–$${maxPush}`;

const glp1SemaComboTotal = GLP1_PROGRAM_VARIANTS.semaglutide.amount + ELEVATED_COMBO_ADDONS.trt.amount;
const trtGlp1ComboTotal = ELEVATED_PROGRAMS.trt.amount + ELEVATED_COMBO_ADDONS.glp1_semaglutide.amount;

export const COMBO_ENROLL_EXAMPLE = `Anchor program + medication add-on via ElevatedComboSelector — e.g. GLP-1 + TRT add-on ${ELEVATED_COMBO_ADDONS.trt.displayPrice} (${fmtUsd(glp1SemaComboTotal)}/mo total sema) or TRT + GLP-1 sema add-on ${ELEVATED_COMBO_ADDONS.glp1_semaglutide.displayPrice} (${fmtUsd(trtGlp1ComboTotal)}/mo). One RN visit, one quarterly lab draw.`;

export const WELLNESS_ASSESSMENT_BOOK_THEN = `→ Lane B: Book ${WA} Wellness Assessment (create-consultation-checkout).`;

export const WELLNESS_ASSESSMENT_IV_MENTION = `Lane A IV menu. No consult required. Mention ${WA} assessment if they ask about hormones/weight later.`;

export const WELLNESS_ASSESSMENT_COMPLETED = `Wellness Assessment completed in-office (${WA} charged via Stripe).`;

export const BASELINE_LABS_DRAW = `Draw baseline labs (Comprehensive ${COMPREHENSIVE} or Expanded ${EXPANDED} per protocol).`;

export const COMPREHENSIVE_LAB_ORDER = `Order Comprehensive Wellness Panel (${COMPREHENSIVE}). LabCorp requisition in-office draw.`;

export const EXPANDED_LAB_ORDER = `Order Expanded Panel (${EXPANDED}) — metabolic + safety markers.`;

export const EXPANDED_LAB_WEIGHT_SLUG = `Order Expanded Panel (${EXPANDED}). LabCorp requisition — weight-optimization slug.`;

export const COMPREHENSIVE_LAB_DEFAULT = `Comprehensive (${COMPREHENSIVE}) unless provider orders Expanded for specific markers.`;

export const C01_CHARGE_VERIFY = `C-01: ${WA} via Stripe before or at check-in`;

export const C02_COMPREHENSIVE_CHARGE = `C-02: ${COMPREHENSIVE} Comprehensive`;

export const C02_EXPANDED_CHARGE = `C-02: ${EXPANDED} Expanded`;

export const ALGO006_BASELINE_LABS = `Baseline Expanded Panel (${EXPANDED}) drawn in-office — weight-optimization slug.`;

export const IV_WALKIN_ASSESSMENT_UPSELL = `Book ${WA} Wellness Assessment before they leave if any hormone/weight interest surfaced`;

export const IV_WALKIN_ASSESSMENT_SCRIPT = `Many IV guests eventually join a program once they see their labs — we can start with today's drip and book a ${WA} assessment when you're ready.`;

export const CONSULT_CREDIT_NOTE = `Collect intake: contact, pharmacy, emergency contact, consent links (portal). Credit ${WA} toward program if they enroll within 30 days.`;

export const BOOK_WELLNESS_ASSESSMENT_THEN = `Book appointment. Run create-consultation-checkout → ${WA} Wellness Assessment.`;

export const JOURNEY_CONSULT_GOAL = `Charge ${WA}; intake + lane lock`;

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
