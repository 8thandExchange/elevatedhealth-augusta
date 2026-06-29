/**
 * Staff Quick Reference Card — desk-friendly overview (process + menu + rules).
 * Pricing detail defers to formularyCheatSheetContent / stripeConfig.
 */
import {
  COMBO_ADDON_ROWS,
  GLP1_ROWS,
  IV_DRIP_ROWS,
  MEMBERSHIP_ROWS,
  NOT_INCLUDED,
  POLICY_BULLETS,
  QUICK_REFERENCE,
  RECOVERY_STACK,
  VISIT_LAB_ROWS,
} from "./formularyCheatSheetContent";
import { MEMBER_DISCOUNT_PERCENT } from "./pricing";
import { PATIENT_JOURNEY_PHASES } from "./sopManualContent";
import {
  LANE_A_IV_STEPS,
  LANE_B_CONSULT_STEPS,
  STAFF_OPENING_SCRIPT,
} from "./staffSystemGuideContent";
import { CORE_SERVICES, ELEVATED_PROGRAMS, GLP1_PROGRAM_VARIANTS } from "./stripeConfig";

export const QUICK_CARD_META = {
  title: "Staff Quick Reference Card",
  subtitle: "Process · Menu · Pricing · Rules",
  version: "1.0.2",
  effectiveDate: "2026-06-28",
  classification: "Internal — print & laminate at front desk",
  clinic: "Elevated Health Augusta",
  address: "7013 Evans Town Center Blvd, Suite 203, Evans, GA 30809",
  phone: "(706) 760-3470",
  domain: "elevatedhealthaugusta.com",
  portal: "elevatedhealthaugusta.com/provider",
} as const;

export const QUICK_CARD_FILENAME_BASE = `EHA-Staff-Quick-Card-v${QUICK_CARD_META.version}-${QUICK_CARD_META.effectiveDate}`;

export const TEAM_ROWS = [
  ["Kristen", "Coordinator", "Scheduling · enrollment · billing verify · patient comms"],
  ["Caroline, RN", "Clinical", "IV · phlebotomy · RN check-ins · standing orders"],
  ["Dr. Dennis Williams", "Physician", "Exams · protocols · Rx sign-off"],
  ["Dr. Troy Akers", "Owner / Physician", "Oversight · sign-off · escalations"],
] as const;

export const DO_SAY = [
  `"Our ELEVATED programs bundle your medication, RN check-ins, quarterly labs, and messaging — one price."`,
  `"Every new patient starts with a ${CORE_SERVICES.wellnessAssessment.displayPrice} Wellness Assessment unless they're IV walk-in only."`,
  `"Active members get ${MEMBER_DISCOUNT_PERCENT}% off à la carte — IV, peptides, extra labs."`,
  `"We are cash-pay; we can provide itemized receipts and superbills on request."`,
  `"IV Lounge is walk-in — no consult required for drips and pushes."`,
] as const;

export const DONT_SAY = [
  `"Plus pharmacy costs" or "medication billed separately" on TRT/HRT/GLP-1.`,
  `Promise a specific drug or dose before labs + physician review.`,
  `Offer ketamine, Spravato, injectable TRT, anastrozole, HCG, or pellets.`,
  `Advertise or lead with retatrutide — physician-gated only.`,
  `Standalone NAD+ infusion or peptide NAD+ — NAD+ is the $50 IV booster only.`,
] as const;

export const CHARGE_CHECKPOINTS = [
  ["C-01", "Wellness Assessment booked", CORE_SERVICES.wellnessAssessment.displayPrice],
  ["C-02", "Lab panel drawn", `${CORE_SERVICES.comprehensivePanel.displayPrice} or ${CORE_SERVICES.expandedPanel.displayPrice}`],
  ["C-03", "Program enrollment", "$199–$449/mo"],
  ["C-04", "À la carte med fill", "Per SKU — $0 if included in their plan"],
  ["C-05", "IV Lounge walk-in", "Drip $139–$169 · boosters $25–$50"],
  ["C-08", "Rebooking fee", CORE_SERVICES.rebookingFee.displayPrice],
] as const;

/** Re-export shared rows used by the HTML builder. */
export {
  COMBO_ADDON_ROWS,
  GLP1_ROWS,
  IV_DRIP_ROWS,
  MEMBERSHIP_ROWS,
  NOT_INCLUDED,
  PATIENT_JOURNEY_PHASES,
  POLICY_BULLETS,
  QUICK_REFERENCE,
  RECOVERY_STACK,
  VISIT_LAB_ROWS,
  LANE_A_IV_STEPS,
  LANE_B_CONSULT_STEPS,
  STAFF_OPENING_SCRIPT,
  ELEVATED_PROGRAMS,
  GLP1_PROGRAM_VARIANTS,
};
