/**
 * Clinical pathway engine — goal → program → labs → compounds → dosing → consents.
 * Staff-facing decision support. Physician signs all prescriptions.
 */
import {
  CORE_SERVICES,
  ELEVATED_PROGRAMS,
  GLP1_DISPLAY_PRICE_RANGE,
  type ElevatedProgramKey,
} from "./stripeConfig";

/** GLP-1 is molecule-priced; show the range when the molecule isn't fixed. */
function programPriceDisplay(programKey: ElevatedProgramKey): string {
  return programKey === "glp1" ? GLP1_DISPLAY_PRICE_RANGE : ELEVATED_PROGRAMS[programKey].displayPrice;
}
import { PROGRAM_DEFAULT_LAB_SLUG, labCheckoutTierForSlug, labPanelNonMemberCents } from "./labPanelCheckout";
import {
  LAB_PANEL_DISPLAY_NAMES,
  type LabPanelSlug,
  recommendLabPanelSlug,
} from "./labPanelRecommendations";
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
  | "general_wellness"
  | "prediabetes_insulin_resistance"
  | "male_sexual_function"
  | "female_sexual_function"
  | "thyroid_optimization"
  | "anemia_iron"
  | "aesthetics";

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
  prediabetes_insulin_resistance: "Pre-diabetes / insulin resistance",
  male_sexual_function: "Erectile / male sexual function",
  female_sexual_function: "Female libido / testosterone",
  thyroid_optimization: "Thyroid optimization",
  anemia_iron: "Anemia / iron",
  aesthetics: "Aesthetics",
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
  const name = LAB_PANEL_DISPLAY_NAMES[slug as LabPanelSlug] ?? slug;
  return { slug, name, cents, display: fmtUsd(cents), tier };
}

function labMetaForGoal(goal: PatientGoal, programKey?: ElevatedProgramKey) {
  const fromProgram = programKey ? PROGRAM_DEFAULT_LAB_SLUG[programKey] : undefined;
  const slug = fromProgram ?? recommendLabPanelSlug(goal) ?? "foundation-wellness";
  return labMeta(slug);
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
      action: `Enroll ${ELEVATED_PROGRAMS[programKey].name} (${programPriceDisplay(programKey)}).`,
      charge: programPriceDisplay(programKey),
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
  // The standalone ELEVATED Metabolic program was retired 2026-06-24. Advanced
  // recomposition now lives inside the GLP-1 lane: physician may layer additional
  // metabolic support and, in gated cases, an investigational option per consent.
  const programKey: ElevatedProgramKey = "glp1";
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
    programPriceDisplay: programPriceDisplay(programKey),
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
      ? "Your labs support advanced, physician-directed weight management within our GLP-1 program — your physician may layer lean-mass and metabolic support, and in select cases an investigational option, only as your labs and tolerance support each step, under close oversight."
      : "We'll start with a GLP-1 program: one weekly injection, RN check-ins, and labs included while you're enrolled. Semaglutide is our default; tirzepatide if clinically appropriate.",
    staffScript: advanced
      ? "Lead with the GLP-1 program (semaglutide $349/mo, tirzepatide $449/mo). Advanced recomposition support — including gated, physician-selected retatrutide — is reviewed in person under the GLP-1 consent. Never the lead, never advertised."
      : "Lead with the GLP-1 program (semaglutide $349/mo, tirzepatide $449/mo). Quote $79 consult + $299 Expanded labs for month one.",
    upsell: advanced ? undefined : "If BMI >30 or prior GLP failure, flag advanced recomposition support at results review.",
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
        "Daily testosterone cream with RN monitoring and quarterly labs — our standard path for men with low T pattern on labs. We do not offer injectable TRT.",
      staffScript: "Default: men's testosterone cream from Custom Pharmacy Evans (no injectable TRT). Empower backup for cream supply.",
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
      upsell: "Optional sermorelin à la carte ($149/mo) or IV NAD+ add-ons after 8–12 weeks stable on BHRT if sleep/recovery goals.",
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
      compoundKeys: ["sermorelin"],
      dosing: [DOSING_PROTOCOLS.sermorelin],
      consents: [],
      patientExplanation:
        "ELEVATED IV membership includes signature IV drips. Sermorelin may be added à la carte when your provider selects it for sleep and recovery support.",
      staffScript: "If ferritin/TSH low on labs, address root cause before peptides. IV NAD+ booster add-on same visit — standalone peptide NAD+ SKUs are not sold.",
      upsell: "ELEVATED IV $199/mo includes 2 IV drips; sermorelin $149/mo à la carte when indicated.",
      algorithmSteps: buildSteps("energy_fatigue", "wellness", ["sermorelin", "IV NAD+ booster"]),
    };
  },
  recovery_injury: () => {
    const lab = labMeta("foundation-wellness");
    return {
      goal: "recovery_injury",
      goalLabel: GOAL_LABELS.recovery_injury,
      offerTier: "stack",
      compoundKeys: ["bpc157", "tb500"],
      dosing: [DOSING_PROTOCOLS.bpc157, DOSING_PROTOCOLS.tb500],
      consents: ["Research Peptide Consent"],
      labSlug: lab.slug,
      labPanelName: lab.name,
      labChargeCents: lab.cents,
      labChargeDisplay: lab.display,
      patientExplanation:
        "Recovery protocol: BPC-157 and/or TB-500 when your provider selects them for tissue recovery support — 6–12 week course with RN teaching when clinically appropriate.",
      staffScript: "Recovery Peptide Review required. Quote BPC-157 and/or TB-500 per membership tier. Cat 2 consent required.",
      algorithmSteps: buildSteps("recovery_injury", undefined, ["bpc157", "tb500"]),
    };
  },
  libido: () => {
    const lab = labMetaForGoal("libido");
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
      compoundKeys: ["sermorelin"],
      dosing: [DOSING_PROTOCOLS.sermorelin],
      consents: [],
      patientExplanation: "ELEVATED IV membership with optional sermorelin à la carte and IV lounge access when clinically appropriate.",
      staffScript: "Lead with ELEVATED IV — do not recite full peptide catalog. NAD+ is IV Lounge only (not standalone peptide SKUs).",
      algorithmSteps: buildSteps("longevity", "wellness", ["sermorelin", "IV NAD+"]),
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
    patientExplanation: "IV Lounge walk-in — signature drips, boosters, or pushes. No consult required.",
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
  prediabetes_insulin_resistance: () => {
    const lab = labMetaForGoal("prediabetes_insulin_resistance");
    return {
      goal: "prediabetes_insulin_resistance",
      goalLabel: GOAL_LABELS.prediabetes_insulin_resistance,
      offerTier: "program",
      programKey: "glp1",
      programName: ELEVATED_PROGRAMS.glp1.name,
      programPriceDisplay: GLP1_DISPLAY_PRICE_RANGE,
      labSlug: lab.slug,
      labPanelName: lab.name,
      labChargeCents: lab.cents,
      labChargeDisplay: lab.display,
      compoundKeys: [],
      dosing: [],
      consents: ["GLP-1 Consent"],
      patientExplanation:
        "We start with expanded metabolic labs and a Wellness Assessment. Metformin or GLP-1 paths depend on your labs and history.",
      staffScript: "A1c over 6.4 routes to diabetes referral. eGFR under 60 metformin caution. Confirm pregnancy status.",
      algorithmSteps: buildSteps("prediabetes_insulin_resistance", "glp1", []),
    };
  },
  male_sexual_function: () => {
    const lab = labMetaForGoal("male_sexual_function");
    return {
      goal: "male_sexual_function",
      goalLabel: GOAL_LABELS.male_sexual_function,
      offerTier: "stack",
      labSlug: lab.slug,
      labPanelName: lab.name,
      labChargeCents: lab.cents,
      labChargeDisplay: lab.display,
      compoundKeys: [],
      dosing: [],
      consents: ["General Medical Treatment Consent"],
      patientExplanation:
        "Sexual wellness labs and history review first. PDE5 options or PT-141 only after contraindication screen. Low testosterone routes to TRT.",
      staffScript: "Nitrates absolute stop. Recent cardiac event or uncontrolled BP defer to physician.",
      algorithmSteps: buildSteps("male_sexual_function", undefined, []),
    };
  },
  female_sexual_function: () => {
    const lab = labMetaForGoal("female_sexual_function");
    return {
      goal: "female_sexual_function",
      goalLabel: GOAL_LABELS.female_sexual_function,
      offerTier: "stack",
      labSlug: lab.slug,
      labPanelName: lab.name,
      labChargeCents: lab.cents,
      labChargeDisplay: lab.display,
      compoundKeys: [],
      dosing: [],
      consents: ["Hormone Therapy Consent"],
      patientExplanation:
        "Female hormone and libido workup with labs. Testosterone or DHEA only when clinically appropriate after gynecologic red flags are cleared.",
      staffScript: "Unexplained bleeding to gyn. Estrogen-sensitive cancer history requires oncology clearance.",
      algorithmSteps: buildSteps("female_sexual_function", undefined, []),
    };
  },
  thyroid_optimization: () => {
    const lab = labMetaForGoal("thyroid_optimization");
    return {
      goal: "thyroid_optimization",
      goalLabel: GOAL_LABELS.thyroid_optimization,
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
      consents: ["General Medical Treatment Consent"],
      patientExplanation:
        "Foundational labs include thyroid markers. Therapy options follow provider review of TSH, free T4, and symptoms.",
      staffScript: "Palpitations or AF urgent. Thyroid nodule to endocrine. Pregnancy requires specialized care.",
      algorithmSteps: buildSteps("thyroid_optimization", "wellness", []),
    };
  },
  anemia_iron: () => {
    const lab = labMetaForGoal("anemia_iron");
    return {
      goal: "anemia_iron",
      goalLabel: GOAL_LABELS.anemia_iron,
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
      consents: ["General Medical Treatment Consent"],
      patientExplanation:
        "CBC, ferritin, and iron studies on foundational panel. Oral or IV iron only after source workup when appropriate.",
      staffScript: "GI bleed signs to workup. Severe anemia to ED. Hemochromatosis no iron repletion.",
      algorithmSteps: buildSteps("anemia_iron", "wellness", []),
    };
  },
  aesthetics: () => ({
    goal: "aesthetics",
    goalLabel: GOAL_LABELS.aesthetics,
    offerTier: "public",
    labSlug: "",
    labPanelName: "None required",
    labChargeCents: 0,
    labChargeDisplay: "$0",
    compoundKeys: [],
    dosing: [],
    consents: ["General Medical Treatment Consent"],
    patientExplanation: "Cosmetic neuromodulator and filler services when contractor prerequisites and procedure consent are on file.",
    staffScript: "Procedural lane. Do not schedule until aesthetics vendor prerequisites documented.",
    algorithmSteps: [
      { order: 1, phase: "Screen", action: "Confirm procedure consent, allergies, pregnancy status, and active infection screen." },
      { order: 2, phase: "Consult", action: "Physician or contracted injector assessment before treatment." },
    ],
  }),
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
  if (/testosterone|low t|libido men/.test(s) && !/erectile|ed\b|male sexual/.test(s)) {
    return recommendPathway("low_testosterone");
  }
  if (/erectile|ed\b|male sexual|performance/.test(s)) return recommendPathway("male_sexual_function");
  if (/female libido|libido.*women|women.*libido|low libido.*female/.test(s)) {
    return recommendPathway("female_sexual_function");
  }
  if (/prediabetes|insulin resistance|a1c|blood sugar/.test(s)) {
    return recommendPathway("prediabetes_insulin_resistance");
  }
  if (/thyroid|tsh|hypothyroid|hyperthyroid|cold intolerance/.test(s)) {
    return recommendPathway("thyroid_optimization");
  }
  if (/anemia|iron deficiency|low iron|ferritin|shortness of breath.*fatigue/.test(s)) {
    return recommendPathway("anemia_iron");
  }
  if (/aesthetic|botox|filler|wrinkle|neuromodulator/.test(s)) return recommendPathway("aesthetics");
  if (/menopause|perimenopause|hot flash|hrt|estrogen|progesterone/.test(s)) return recommendPathway("hormone_women");
  if (/injury|tendon|recovery|surgery|bpc/.test(s)) return recommendPathway("recovery_injury");
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
