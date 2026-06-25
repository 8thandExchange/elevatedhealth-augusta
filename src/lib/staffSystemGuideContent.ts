/**
 * Staff system guide — structured content for /staff/system-guide (CDS Task 7).
 * Pulls live pricing and lab routing from shared libs; narrative copy is staff-facing only.
 *
 * Do NOT import LANE_* or PATIENT_JOURNEY_STEPS on public pages — use howClinicWorksContent.ts.
 */
import { ALL_PATIENT_GOALS, GOAL_LABELS } from "./clinicalPathwayEngine";
import {
  GOAL_TO_LAB_PANEL_SLUG,
  LAB_PANEL_DISPLAY_NAMES,
  type LabPanelSlug,
} from "./labPanelRecommendations";
import { labCheckoutTierForSlug, labPanelNonMemberCents } from "./labPanelCheckout";
import { CORE_SERVICES, ELEVATED_PROGRAMS } from "./stripeConfig";
import { fmtUsd } from "./pricing";
import { resolveVendorForLane, type ServiceLane } from "./vendorRouting";

export const STAFF_OPENING_SCRIPT =
  "We start with what you want, but we confirm with labs and a physician review before any prescription. The $79 Wellness Assessment is our front door for hormones, weight loss, and peptides — IV Lounge is walk-in without a consult.";

export const PATIENT_JOURNEY_STEPS = [
  {
    phase: "01",
    title: "Discover",
    detail: "Patient states a goal or symptom. Staff uses open questions — do not recite the full formulary.",
  },
  {
    phase: "02",
    title: "Assess",
    detail: `Book ${CORE_SERVICES.wellnessAssessment.displayPrice} Wellness Assessment (Lane B) or route IV interest to Lane A.`,
  },
  {
    phase: "03",
    title: "Labs",
    detail: `Baseline panel drawn in-office when clinically indicated (${CORE_SERVICES.comprehensivePanel.displayPrice} comprehensive / ${CORE_SERVICES.expandedPanel.displayPrice} expanded).`,
  },
  {
    phase: "04",
    title: "Review",
    detail: "Provider reviews resulted labs (5–7 days). Safety redirects by phone — no Rx if contraindicated.",
  },
  {
    phase: "05",
    title: "Enroll",
    detail: `Program or stack enrollment + ${ELEVATED_PROGRAMS.wellness.displayPrice} Elevated Membership (ELEVATED Wellness tier) when appropriate.`,
  },
  {
    phase: "06",
    title: "Consents",
    detail: "Portal consents and substance acknowledgments before first shipment or injection teaching.",
  },
  {
    phase: "07",
    title: "Prescribe",
    detail: "Physician-signed protocol → vendor routing (GC / Evans / FCC) → RN teaching.",
  },
  {
    phase: "08",
    title: "Follow-up",
    detail: "RN check-ins; quarterly in-program labs; CDS four-gate check before therapy changes.",
  },
] as const;

export const LANE_A_IV_STEPS = [
  "Patient walks in or books IV Lounge online.",
  "IV screening edge function runs hard blocks (CHF, pregnancy, G6PD for high-dose vitamin C, etc.).",
  "Select drip or push; charge at checkout (Myers, NAD+, glutathione, custom build).",
  "Members receive 15% off IV add-ons.",
  "Soft mention $79 Wellness Assessment only if hormone/weight interest surfaces.",
] as const;

export const LANE_B_CONSULT_STEPS = [
  "Patient pays $79 Wellness Assessment via Stripe before or at booking.",
  "In-person visit: history, vitals, goal confirmation.",
  "Order goal-appropriate lab panel; draw same visit when possible.",
  "Run CDS assessment in provider chart (staff) → physician review (prescriber only).",
  "Results call: enroll program, collect consents, schedule RN teaching.",
  "Never promise a specific medication before labs and physician sign-off.",
] as const;

export interface GoalLabRow {
  goalKey: string;
  goalLabel: string;
  panelName: string;
  panelSlug: string | null;
  patientCharge: string;
  checkoutTier: string | null;
}

export function buildGoalLabTable(): GoalLabRow[] {
  return ALL_PATIENT_GOALS.map((goal) => {
    const slug = GOAL_TO_LAB_PANEL_SLUG[goal];
    return {
      goalKey: goal,
      goalLabel: GOAL_LABELS[goal],
      panelName: slug ? LAB_PANEL_DISPLAY_NAMES[slug as LabPanelSlug] : "None — IV Lane A",
      panelSlug: slug,
      patientCharge: slug ? fmtUsd(labPanelNonMemberCents(slug)) : "—",
      checkoutTier: slug ? labCheckoutTierForSlug(slug) : null,
    };
  });
}

export const LAB_REDIRECT_EXAMPLES = [
  {
    goal: "Low testosterone / TRT",
    trigger: "Prolactin elevated, PSA high, hematocrit >54%",
    action: "Stop TRT path; physician phone deferral or referral.",
  },
  {
    goal: "GLP-1 / weight loss",
    trigger: "Diabetic-range A1c, abnormal TSH, pregnancy, MTC/MEN2 history",
    action: "Redirect before GLP-1 enrollment; document in chart.",
  },
  {
    goal: "BHRT",
    trigger: "Unexplained bleeding, estrogen-sensitive cancer history, thromboembolic disease",
    action: "Do not start estrogen pathway; physician review required.",
  },
  {
    goal: "IV Lounge",
    trigger: "CHF, ESRD, pregnancy, anaphylaxis history",
    action: "Hard block at IV screening — no walk-around.",
  },
  {
    goal: "Energy / fatigue",
    trigger: "Low ferritin, abnormal TSH, low B12 on foundational panel",
    action: "Treat root cause before peptide stack upsell.",
  },
] as const;

export const VENDOR_LANE_ROWS: Array<{ lane: string; laneKey: ServiceLane; note: string }> = [
  { lane: "IV Lounge + FCC peptide backup", laneKey: "iv_lounge", note: "Myers premix, NAD+ backup vials" },
  { lane: "Metabolic / GC peptides + GLP-1", laneKey: "peptides_gc", note: "PATH lyophilized + STLKS injectables" },
  { lane: "Sermorelin, NAD+, BPC/TB recovery stack", laneKey: "peptides_fcc", note: "FCC when not on GC catalog line" },
  { lane: "GLP-1 sema/tirz fills", laneKey: "weight_glp1", note: "GC primary; FCC backup" },
  { lane: "All hormones (TRT/BHRT)", laneKey: "hormones", note: "Custom Pharmacy of Evans fax default" },
  { lane: "Lab draws", laneKey: "labs", note: "LabCorp client billing" },
];

export function buildVendorRoutingTable() {
  return VENDOR_LANE_ROWS.map((row) => ({
    ...row,
    vendor: resolveVendorForLane(row.laneKey).displayName,
  }));
}

export const CHARGE_CHECKPOINTS = [
  {
    when: "Lane B intake",
    item: CORE_SERVICES.wellnessAssessment.name,
    amount: CORE_SERVICES.wellnessAssessment.displayPrice,
    note: "Credited toward program if patient enrolls.",
  },
  {
    when: "Baseline labs (non-member)",
    item: CORE_SERVICES.comprehensivePanel.name,
    amount: CORE_SERVICES.comprehensivePanel.displayPrice,
    note: "Hormone + foundational paths.",
  },
  {
    when: "Baseline labs (weight/metabolic)",
    item: CORE_SERVICES.expandedPanel.name,
    amount: CORE_SERVICES.expandedPanel.displayPrice,
    note: "GLP-1 and metabolic recomposition default.",
  },
  {
    when: "Membership",
    item: "Elevated Membership",
    amount: `from ${ELEVATED_PROGRAMS.wellness.displayPrice}`,
    note: "Tier = ELEVATED program: Wellness $199 / HRT $229 / TRT $249 / GLP-1 $349–$449. No legacy concierge/vitality names.",
  },
  {
    when: "In-program monitoring",
    item: "Quarterly labs",
    amount: "$0",
    note: "Included while enrolled in active program.",
  },
  {
    when: "Lane A IV",
    item: "IV menu (walk-in)",
    amount: "Menu pricing",
    note: "Charge at booking/checkout — no consult required.",
  },
] as const;

export const CONSENT_CHECKLIST = [
  { consent: "Hormone Therapy Consent", when: "TRT, BHRT, any hormone protocol" },
  { consent: "GLP-1 Consent", when: "Semaglutide, tirzepatide, metabolic program GLP class" },
  { consent: "Off-label / compounded disclosure", when: "503A compounded therapies" },
  { consent: "Research Peptide Consent", when: "BPC-157, TB-500, Wolverine stack, and other research peptides (not PT-141)" },
  { consent: "Substance acknowledgment (CDS)", when: "Gray-zone candidates before ePrescribe handoff (RUO is hard-blocked)" },
  { consent: "Physician CDS review", when: "Prescriber-only final approval in provider chart" },
] as const;

export const NEVER_SAY = [
  "We can start you on testosterone today without labs.",
  "Retatrutide is available à la carte like semaglutide.",
  "We offer ketamine or Spravato (legacy — not offered).",
  "Here is our full 100+ item peptide catalog — pick anything.",
  "The RN already approved your prescription (only physicians finalize).",
  "Your margin / our wholesale cost on this vial.",
] as const;

export const NEVER_DO = [
  "Recommend CDS candidates when labs are not resulted (order labs first).",
  "Activate a program or send Rx without required consents on file.",
  "Bypass IV screening hard blocks for convenience.",
  "Quote member vs non-member lab COGS to patients.",
  "Turn on CDS pathway/candidate config without prescriber sign-off in database.",
  "Offer Tailor Made or gray-market peptide sources.",
] as const;

export const PRINTABLE_CHECKLIST = [
  "Confirm lane: IV walk-in (A) vs consult-gated (B).",
  "Lane B: $79 Wellness Assessment collected before visit.",
  "Match goal → lab panel (see goal-to-lab table).",
  "Draw labs same visit when possible; Stripe panel tier correct ($199 vs $299).",
  "Run CDS assessment; order labs if gate says needs_labs.",
  "Physician reviews results before enrollment conversation.",
  "Consents signed in portal before first dose/shipment.",
  "Route Rx to correct vendor (GC / Evans / FCC).",
  "RN injection teaching + dosing card provided.",
  "Schedule follow-up / RN check-in.",
] as const;
