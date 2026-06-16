/**
 * Clinical pathway engine — goal → program → labs → compounds → dosing → consents.
 * Staff-facing decision support. Physician signs all prescriptions.
 */
import { CORE_SERVICES, ELEVATED_PROGRAMS, type ElevatedProgramKey } from "./stripeConfig";
import { PROGRAM_DEFAULT_LAB_SLUG, labCheckoutTierForSlug, labPanelNonMemberCents } from "./labPanelCheckout";
import { DOSING_PROTOCOLS, type DosingProtocol } from "./dosingProtocols";
import { fmtUsd, labMemberCents } from "./pricing";

export type PatientGoal =
  | "weight_loss"
  | "metabolic_recomposition"
  | "low_testosterone"
  | "hormone_women"
  | "energy_fatigue"
  | "recovery_injury"
  | "libido"
  | "longevity"
  | "iv_only"
  | "general_wellness";

export type OfferTier = "public" | "program" | "stack" | "escalation" | "excluded";

export interface PathwayStep {
  order: number;
  phase: string;
  action: string;
  if?: string;
  then?: string;
  else?: string;
  charge?: string;
}

export interface PathwayRecommendation {
  goal: PatientGoal;
  goalLabel: string;
  offerTier: OfferTier;
  programKey?: ElevatedProgramKey;
  programName?: string;
  programPriceDisplay?: string;
  labSlug: string;
  labPanelName: string;
  labChargeCents: number;
  labChargeDisplay: string;
  compoundKeys: string[];
  dosing: DosingProtocol[];
  consents: string[];
  patientExplanation: string;
  staffScript: string;
  upsell?: string;
  excludedAlternatives?: string[];
  algorithmSteps: PathwayStep[];
}

export const GOAL_LABELS: Record<PatientGoal, string> = {
  weight_loss: "Weight loss / appetite",
  metabolic_recomposition: "Advanced body recomposition",
  low_testosterone: "Low testosterone / men's vitality",
  hormone_women: "Perimenopause / BHRT",
  energy_fatigue: "Energy / fatigue",
  recovery_injury: "Injury / tissue recovery",
  libido: "Libido / sexual wellness",
  longevity: "Longevity / anti-aging",
  iv_only: "IV hydration only",
  general_wellness: "General optimization",
};

/** Compounds we do NOT offer despite GC catalog availability. */
export const EXCLUDED_COMPOUNDS = [
  { key: "mazdutide", reason: "Not in formulary — insufficient clinical governance vs sema/tirz/reta" },
  { key: "melanotan2", reason: "Cosmetic tanning — reputational/regulatory risk" },
  { key: "cagrilintide", reason: "Not on EHA formulary — use GLP-1 program paths instead" },
  { key: "cagrilintide_retatrutide_blend", reason: "Pre-blended — use supervised metabolic protocol only" },
  { key: "igf1_lr3", reason: "High-risk growth factor — physician exclusion default" },
  { key: "ghk_cu_injectable", reason: "Prefer topical/sublingual per formulary policy" },
  { key: "ketamine", reason: "Legacy — not offered" },
] as const;

function labMeta(slug: string) {
  const tier = labCheckoutTierForSlug(slug);
  const cents = labPanelNonMemberCents(slug);
  const name =
    tier === "expanded" ? CORE_SERVICES.expandedPanel.name : CORE_SERVICES.comprehensivePanel.name;
  return { slug, name, cents, display: fmtUsd(cents), tier };
}

function buildSteps(
  goal: PatientGoal,
  programKey: ElevatedProgramKey | undefined,
  compounds: string[],
): PathwayStep[] {
  const steps: PathwayStep[] = [
    { order: 1, phase: "Discover", action: `Patient goal: ${GOAL_LABELS[goal]}. Use open questions; do not list catalog.` },
    { order: 2, phase: "Assess", action: "Book $79 Wellness Assessment (Stripe C-01).", charge: CORE_SERVICES.wellnessAssessment.displayPrice },
  ];
  if (programKey) {
    const labSlug = PROGRAM_DEFAULT_LAB_SLUG[programKey] ?? "foundation-wellness";
    const lab = labMeta(labSlug);
    steps.push({
      order: 3,
      phase: "Labs",
      action: `Order ${lab.name} (${lab.slug}). Draw same visit if possible.`,
      charge: lab.display,
    });
    steps.push({
      order: 4,
      phase: "Review",
      action: "Provider reviews labs in 5–7 days. Contraindications → phone deferral, no Rx.",
    });
    steps.push({
      order: 5,
      phase: "Enroll",
      action: `Enroll ${ELEVATED_PROGRAMS[programKey].name} (${ELEVATED_PROGRAMS[programKey].displayPrice}).`,
      charge: ELEVATED_PROGRAMS[programKey].displayPrice,
    });
    steps.push({
      order: 6,
      phase: "Consents",
      action: "Portal consents signed before first shipment.",
    });
    steps.push({
      order: 7,
      phase: "Prescribe",
      action: `Route Rx: ${compounds.join(", ")}. GC PATH/STLKS primary; Evans hormones; FCC IV backup.`,
    });
    steps.push({
      order: 8,
      phase: "Teach",
      action: "RN injection teaching + provide dosing card from dosingProtocols.",
    });
    steps.push({
      order: 9,
      phase: "Follow-up",
      action: "Week 2–4 RN check-in; quarterly labs $0 in-program; titrate per protocol.",
    });
  }
  return steps;
}

function recommendWeightLoss(advanced: boolean): PathwayRecommendation {
  const programKey: ElevatedProgramKey = advanced ? "metabolicRecomposition" : "glp1";
  const labSlug = PROGRAM_DEFAULT_LAB_SLUG[programKey];
  const lab = labMeta(labSlug);
  const compoundKeys = advanced
    ? ["retatrutide", "ss31", "nadInjection", "cjcIpamorelin", "tesamorelin"]
    : ["semaglutide"]; // default sema; physician may switch to tirz

  const dosing = compoundKeys
    .map((k) => DOSING_PROTOCOLS[k === "semaglutide" ? "semaglutide" : k])
    .filter(Boolean) as DosingProtocol[];

  return {
    goal: advanced ? "metabolic_recomposition" : "weight_loss",
    goalLabel: GOAL_LABELS[advanced ? "metabolic_recomposition" : "weight_loss"],
    offerTier: "program",
    programKey,
    programName: ELEVATED_PROGRAMS[programKey].name,
    programPriceDisplay: ELEVATED_PROGRAMS[programKey].displayPrice,
    labSlug: lab.slug,
    labPanelName: lab.name,
    labChargeCents: lab.cents,
    labChargeDisplay: lab.display,
    compoundKeys,
    dosing,
    consents: advanced
      ? ["Research Peptide Consent", "GLP-1 Consent", "Off-label Tesamorelin (if prescribed)"]
      : ["GLP-1 Consent"],
    patientExplanation: advanced
      ? "Your labs support our supervised Metabolic Recomposition program — a phased stack anchored on a weekly injection, with mitochondrial and lean-mass support added as you tolerate each layer."
      : "We'll start with a GLP-1 program: one weekly injection, RN check-ins, and labs included while you're enrolled. Semaglutide is our default; tirzepatide if clinically appropriate.",
    staffScript: advanced
      ? "Lead with $1,199/mo all-inclusive metabolic program — not à la carte retatrutide."
      : "Lead with $349/mo GLP-1 program. Quote $79 consult + $299 Expanded labs for month one.",
    upsell: advanced ? undefined : "If BMI >30 or prior GLP failure, flag metabolic program at results review.",
    excludedAlternatives: ["mazdutide", "cagrilintide blends"],
    algorithmSteps: buildSteps(advanced ? "metabolic_recomposition" : "weight_loss", programKey, compoundKeys),
  };
}

const PATHWAY_MAP: Record<PatientGoal, () => PathwayRecommendation> = {
  weight_loss: () => recommendWeightLoss(false),
  metabolic_recomposition: () => recommendWeightLoss(true),
  low_testosterone: () => {
    const programKey = "trt" as const;
    const lab = labMeta(PROGRAM_DEFAULT_LAB_SLUG[programKey]);
    return {
      goal: "low_testosterone",
      goalLabel: GOAL_LABELS.low_testosterone,
      offerTier: "program",
      programKey,
      programName: ELEVATED_PROGRAMS.trt.name,
      programPriceDisplay: ELEVATED_PROGRAMS.trt.displayPrice,
      labSlug: lab.slug,
      labPanelName: lab.name,
      labChargeCents: lab.cents,
      labChargeDisplay: lab.display,
      compoundKeys: ["testosterone_cyp"],
      dosing: [],
      consents: ["Hormone Therapy Consent"],
      patientExplanation:
        "Weekly testosterone injections with RN monitoring and quarterly labs — our standard path for men with low T pattern on labs.",
      staffScript: "Default: test cyp from Custom Pharmacy Evans. GC STLKS backup at $40/10ml if Evans unavailable.",
      upsell: "If visceral fat elevated, discuss GLP-1 or metabolic program at results call.",
      algorithmSteps: buildSteps("low_testosterone", programKey, ["testosterone cyp"]),
    };
  },
  hormone_women: () => {
    const programKey = "hrt" as const;
    const lab = labMeta(PROGRAM_DEFAULT_LAB_SLUG[programKey]);
    return {
      goal: "hormone_women",
      goalLabel: GOAL_LABELS.hormone_women,
      offerTier: "program",
      programKey,
      programName: ELEVATED_PROGRAMS.hrt.name,
      programPriceDisplay: ELEVATED_PROGRAMS.hrt.displayPrice,
      labSlug: lab.slug,
      labPanelName: lab.name,
      labChargeCents: lab.cents,
      labChargeDisplay: lab.display,
      compoundKeys: ["bi_est", "progesterone"],
      dosing: [],
      consents: ["Hormone Therapy Consent"],
      patientExplanation:
        "Bi-Est cream plus oral progesterone at bedtime — our standard BHRT path with quarterly labs and RN check-ins.",
      staffScript: "Custom Pharmacy Evans fax default. DrFirst patch only if patient prefers FDA product.",
      upsell: "Vitality stack (sermorelin + NAD+) after 8–12 weeks stable on BHRT if sleep/recovery goals.",
      algorithmSteps: buildSteps("hormone_women", programKey, ["Bi-Est cream", "progesterone"]),
    };
  },
  energy_fatigue: () => {
    const lab = labMeta("foundation-wellness");
    return {
      goal: "energy_fatigue",
      goalLabel: GOAL_LABELS.energy_fatigue,
      offerTier: "stack",
      programKey: "wellness",
      programName: ELEVATED_PROGRAMS.wellness.name,
      programPriceDisplay: ELEVATED_PROGRAMS.wellness.displayPrice,
      labSlug: lab.slug,
      labPanelName: lab.name,
      labChargeCents: lab.cents,
      labChargeDisplay: lab.display,
      compoundKeys: ["sermorelin", "nadInjection"],
      dosing: [DOSING_PROTOCOLS.sermorelin, DOSING_PROTOCOLS.nadInjection],
      consents: [],
      patientExplanation:
        "Vitality stack: nightly sermorelin plus NAD+ for energy and recovery, bundled in our Wellness membership with IV perks.",
      staffScript: "If ferritin/TSH low on labs, address root cause before peptides. IV Myers add-on same visit.",
      upsell: "ELEVATED Wellness $199/mo includes 2 IV drips.",
      algorithmSteps: buildSteps("energy_fatigue", "wellness", ["sermorelin", "NAD+"]),
    };
  },
  recovery_injury: () => {
    const lab = labMeta("foundation-wellness");
    return {
      goal: "recovery_injury",
      goalLabel: GOAL_LABELS.recovery_injury,
      offerTier: "stack",
      compoundKeys: ["wolverine"],
      dosing: [DOSING_PROTOCOLS.wolverine],
      consents: ["Research Peptide Consent"],
      labSlug: lab.slug,
      labPanelName: lab.name,
      labChargeCents: lab.cents,
      labChargeDisplay: lab.display,
      patientExplanation:
        "Healing stack: daily BPC-157 + TB-500 (Wolverine blend) for tissue repair — 6–12 week course with RN teaching.",
      staffScript: "Quote Healing stack $249/mo non-member / $199 member. Cat 2 consent required.",
      algorithmSteps: buildSteps("recovery_injury", undefined, ["wolverine"]),
    };
  },
  libido: () => {
    const lab = labMeta("foundation-wellness");
    return {
      goal: "libido",
      goalLabel: GOAL_LABELS.libido,
      offerTier: "stack",
      compoundKeys: ["pt141"],
      dosing: [DOSING_PROTOCOLS.pt141],
      consents: ["Research Peptide Consent"],
      labSlug: lab.slug,
      labPanelName: lab.name,
      labChargeCents: lab.cents,
      labChargeDisplay: lab.display,
      patientExplanation:
        "Restore protocol: PT-141 as needed (not daily) — typically 1 mg starting dose 2–4 hours before activity.",
      staffScript: "Launch-hidden sexual wellness line. Check BP/cardiac history. If low T/Low E, route to TRT/HRT first.",
      upsell: "If male + low T symptoms, TRT program may be primary; PT-141 add-on later.",
      algorithmSteps: buildSteps("libido", undefined, ["pt141"]),
    };
  },
  longevity: () => {
    const lab = labMeta("foundation-wellness");
    return {
      goal: "longevity",
      goalLabel: GOAL_LABELS.longevity,
      offerTier: "program",
      programKey: "wellness",
      programName: ELEVATED_PROGRAMS.wellness.name,
      programPriceDisplay: ELEVATED_PROGRAMS.wellness.displayPrice,
      labSlug: lab.slug,
      labPanelName: lab.name,
      labChargeCents: lab.cents,
      labChargeDisplay: lab.display,
      compoundKeys: ["sermorelin", "nadInjection"],
      dosing: [DOSING_PROTOCOLS.sermorelin, DOSING_PROTOCOLS.nadInjection],
      consents: [],
      patientExplanation: "Wellness membership with Vitality peptides, IV lounge access, and quarterly monitoring.",
      staffScript: "Do not recite 104-SKU catalog. Lead with Wellness + Vitality.",
      algorithmSteps: buildSteps("longevity", "wellness", ["sermorelin", "NAD+"]),
    };
  },
  iv_only: () => ({
    goal: "iv_only",
    goalLabel: GOAL_LABELS.iv_only,
    offerTier: "public",
    labSlug: "",
    labPanelName: "None required",
    labChargeCents: 0,
    labChargeDisplay: "$0",
    compoundKeys: [],
    dosing: [],
    consents: [],
    patientExplanation: "IV Lounge walk-in — Myers, NAD+ infusion, or pushes. No consult required.",
    staffScript: "Lane A. Soft mention $79 assessment if hormones/weight interest surfaces.",
    upsell: "Book Wellness Assessment before they leave if any hormone/weight interest.",
    algorithmSteps: [
      { order: 1, phase: "IV Lounge", action: "Present IV menu. Charge at checkout (C-05)." },
      { order: 2, phase: "Upsell", action: "Mention programs only if patient asks about weight/hormones/energy." },
    ],
  }),
  general_wellness: () => {
    const lab = labMeta("foundation-wellness");
    return {
      goal: "general_wellness",
      goalLabel: GOAL_LABELS.general_wellness,
      offerTier: "program",
      programKey: "wellness",
      programName: ELEVATED_PROGRAMS.wellness.name,
      programPriceDisplay: ELEVATED_PROGRAMS.wellness.displayPrice,
      labSlug: lab.slug,
      labPanelName: lab.name,
      labChargeCents: lab.cents,
      labChargeDisplay: lab.display,
      compoundKeys: [],
      dosing: [],
      consents: [],
      patientExplanation: "$79 assessment → baseline labs → Wellness membership or targeted program based on results.",
      staffScript: "Universal front door. Do not guess program until labs back.",
      algorithmSteps: buildSteps("general_wellness", "wellness", []),
    };
  },
};

export function recommendPathway(goal: PatientGoal): PathwayRecommendation {
  return PATHWAY_MAP[goal]();
}

export function recommendPathwayFromSymptoms(symptoms: string[]): PathwayRecommendation {
  const s = symptoms.join(" ").toLowerCase();
  if (/weight|obese|glp|semaglutide|tirzepatide|appetite|bmi/.test(s)) {
    return /recomp|muscle|athletic|stall|plateau/.test(s)
      ? recommendPathway("metabolic_recomposition")
      : recommendPathway("weight_loss");
  }
  if (/testosterone|low t|libido men|erectile|ed\b/.test(s)) return recommendPathway("low_testosterone");
  if (/menopause|perimenopause|hot flash|hrt|estrogen|progesterone/.test(s)) return recommendPathway("hormone_women");
  if (/injury|tendon|recovery|surgery|bpc|wolverine/.test(s)) return recommendPathway("recovery_injury");
  if (/libido|pt-141|bremelanotide|sexual/.test(s)) return recommendPathway("libido");
  if (/iv|hydration|hangover|nad\+?\s*infusion|myers/.test(s)) return recommendPathway("iv_only");
  if (/fatigue|energy|brain fog|sleep/.test(s)) return recommendPathway("energy_fatigue");
  if (/longevity|anti.?aging|age/.test(s)) return recommendPathway("longevity");
  return recommendPathway("general_wellness");
}

export const ALL_PATIENT_GOALS = Object.keys(GOAL_LABELS) as PatientGoal[];

export function firstMonthInvestment(rec: PathwayRecommendation): string {
  if (!rec.programKey) return rec.labChargeDisplay;
  const consult = CORE_SERVICES.wellnessAssessment.amount;
  const lab = rec.labChargeCents;
  const prog = ELEVATED_PROGRAMS[rec.programKey].amount;
  return fmtUsd(consult + lab + prog);
}

export function memberLabChargeDisplay(rec: PathwayRecommendation): string {
  if (rec.labChargeCents === 0) return "$0";
  return fmtUsd(labMemberCents(rec.labChargeCents));
}
