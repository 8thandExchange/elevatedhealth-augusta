/**
 * IV clinical protocol seed — mirror of supabase/migrations/20260509140000_seed_clinical_protocol_drafts.sql.
 * Regenerate from scripts/generate_clinical_protocol_seed_sql.py if seed migration changes.
 * Staff cheat sheets MUST import from here — never duplicate doses in export layers.
 */
import type { LegacyReviewerRow } from "./clinicalProtocolDecisionFlags";

export type ClinicalProtocolDosing = {
  medication: string;
  dose: string;
  route: string;
  frequency: string;
  duration: string;
};

export type ClinicalProtocolStructuredBody = {
  indication: string;
  contraindications: string[];
  exclusion_criteria: string[];
  pre_administration_checks: string[];
  dosing: ClinicalProtocolDosing;
  administration: string[];
  monitoring_during: string[];
  monitoring_post: string[];
  patient_education: string[];
  escalation_criteria: string[];
  documentation_required: string[];
  adverse_event_response: {
    mild: string[];
    moderate: string[];
    severe: string[];
  };
};

export type MyersComponentRow = readonly [component: string, amount: string];

export type IvProtocolSeedRecord = {
  slug: string;
  title: string;
  /** Formulation / diluent line from body_markdown (protocol of record). */
  formulation: string;
  /** Myers-only component table (from body_markdown formulation section). */
  myers_components?: readonly MyersComponentRow[];
  body_structured: ClinicalProtocolStructuredBody;
  notes_for_reviewer: LegacyReviewerRow[];
};

/** IV protocols seeded in 20260509140000_seed_clinical_protocol_drafts.sql */
export const IV_CLINICAL_PROTOCOL_SEED: readonly IvProtocolSeedRecord[] = [
  {
    slug: "iv-myers-cocktail",
    title: "IV Myers Cocktail Administration",
    formulation:
      "Magnesium chloride 1g, calcium gluconate 100mg, B-complex 1mL, B12 1mg, B5 250mg, B6 100mg, vitamin C 5g, in 250mL normal saline.",
    myers_components: [
      ["Magnesium chloride", "1 g"],
      ["Calcium gluconate", "100 mg"],
      ["B-complex", "1 mL"],
      ["Vitamin B12", "1 mg"],
      ["Vitamin B5 (dexpanthenol)", "250 mg"],
      ["Vitamin B6 (pyridoxine)", "100 mg"],
      ["Vitamin C (ascorbic acid)", "5 g"],
      ["Base", "250 mL normal saline"],
    ],
    body_structured: {
      indication: "Adult IV wellness / nutrient repletion per standing orders.",
      contraindications: [
        "Known allergy to any component",
        "G6PD deficiency (high-dose IV vitamin C)",
        "Renal failure without nephrology clearance",
      ],
      exclusion_criteria: ["Unstable cardiovascular disease", "Active infection with fever"],
      pre_administration_checks: ["Verify identity", "Two RN checks on bag labeling", "Patent IV access"],
      dosing: {
        medication: "Myers cocktail components as listed",
        dose: "Per formulation above",
        route: "IV infusion",
        frequency: "Per order / membership benefit",
        duration: "30–45 minutes",
      },
      administration: ["Prime line", "Infuse per rate policy", "Dispose sharps per clinic SOP"],
      monitoring_during: ["VS q15min first 30min", "Patient comfort"],
      monitoring_post: ["Discharge instructions", "Adverse event reporting pathway"],
      patient_education: ["Expected warmth/flush", "When to call clinic"],
      escalation_criteria: ["Chest pain", "Severe nausea/vomiting", "Urticaria"],
      documentation_required: ["IV flowsheet", "Lot numbers if applicable"],
      adverse_event_response: {
        mild: ["Slow infusion", "Cool compress"],
        moderate: ["Provider notification", "Extended observation"],
        severe: ["911", "Stop infusion", "Emergency protocol"],
      },
    },
    notes_for_reviewer: [
      {
        note: "Verify Myers formulation matches Henry Schein standard pre-mixed bag if you're using one, vs. compounded in-house",
        resolved: false,
        resolved_at: null,
        resolved_by: null,
      },
      {
        note: "Confirm 30-45 min infusion rate matches your preference; some clinicians push slower for first-time patients",
        resolved: false,
        resolved_at: null,
        resolved_by: null,
      },
      {
        note: "Vitamin C dose of 5g — verify G6PD screening expectation in your intake (high-dose IV C is contraindicated in G6PD deficiency)",
        resolved: false,
        resolved_at: null,
        resolved_by: null,
      },
    ],
  },
  {
    slug: "iv-nad-250mg",
    title: "IV NAD+ 250mg Infusion",
    formulation: "NAD+ 250mg in 500mL normal saline.",
    body_structured: {
      indication: "NAD+ IV therapy 250mg session.",
      contraindications: ["Pregnancy/lactation unless cleared", "Unstable angina"],
      exclusion_criteria: ["Recent MI without clearance"],
      pre_administration_checks: ["Baseline VS", "Pregnancy status if applicable"],
      dosing: {
        medication: "NAD+",
        dose: "250mg",
        route: "IV infusion",
        frequency: "Per order",
        duration: "60–90 min",
      },
      administration: ["Dilute per pharmacy label", "Gradual rate titration per tolerance"],
      monitoring_during: ["VS per IV lounge policy", "Symptom assessment q15–30min"],
      monitoring_post: ["Post-infusion check", "Home instructions"],
      patient_education: ["Flush/warmth common", "Report chest tightness immediately"],
      escalation_criteria: ["Persistent chest pain", "Severe nausea"],
      documentation_required: ["Infusion record", "Compound lot if applicable"],
      adverse_event_response: {
        mild: ["Pause infusion", "Slow rate"],
        moderate: ["Provider eval"],
        severe: ["911", "Stop infusion"],
      },
    },
    notes_for_reviewer: [
      {
        note: "Verify NAD source — FCC compounded vs. commercial. Affects concentration and dilution math",
        resolved: false,
        resolved_at: null,
        resolved_by: null,
      },
      {
        note: "Some clinicians use Glutathione push at end of NAD+ — confirm if you want this in standard protocol or as add-on",
        resolved: false,
        resolved_at: null,
        resolved_by: null,
      },
      {
        note: "First-time patient slower start (90-120 min) — confirm threshold for 'first-time'",
        resolved: false,
        resolved_at: null,
        resolved_by: null,
      },
    ],
  },
  {
    slug: "iv-nad-500mg",
    title: "IV NAD+ 500mg Infusion",
    formulation: "NAD+ 500mg in 500mL normal saline.",
    body_structured: {
      indication: "NAD+ IV therapy 500mg session.",
      contraindications: ["Same as 250mg pathway"],
      exclusion_criteria: ["No prior NAD+ tolerance unless physician-approved exception"],
      pre_administration_checks: ["Review prior NAD+ sessions", "VS baseline"],
      dosing: {
        medication: "NAD+",
        dose: "500mg",
        route: "IV infusion",
        frequency: "Per order",
        duration: "90–120 min",
      },
      administration: ["Longer observation window", "Gradual titration"],
      monitoring_during: ["VS q15min early", "Symptom log"],
      monitoring_post: ["Extended observation if symptoms"],
      patient_education: ["Expect stronger sensations vs 250mg"],
      escalation_criteria: ["Chest pain", "Severe nausea", "Hypertensive response"],
      documentation_required: ["Session note", "Titration details"],
      adverse_event_response: {
        mild: ["Pause/slow"],
        moderate: ["Provider at bedside"],
        severe: ["911"],
      },
    },
    notes_for_reviewer: [
      {
        note: "Confirm step-up requirement — should patients always do 250mg first, or is 500mg first-time acceptable for low-risk patients?",
        resolved: false,
        resolved_at: null,
        resolved_by: null,
      },
      {
        note: "Verify max dose ceiling — some clinicians cap at 500mg per session; others go to 750mg or 1g",
        resolved: false,
        resolved_at: null,
        resolved_by: null,
      },
    ],
  },
  {
    slug: "iv-glutathione-push",
    title: "IV Glutathione Push",
    formulation: "Glutathione 1–2g IV push.",
    body_structured: {
      indication: "IV glutathione push.",
      contraindications: ["Known hypersensitivity to glutathione product"],
      exclusion_criteria: [],
      pre_administration_checks: ["Verify dose on order", "Patent IV"],
      dosing: {
        medication: "Glutathione",
        dose: "1–2g per order",
        route: "IV push",
        frequency: "Per order",
        duration: "5–10 min",
      },
      administration: ["Slow push", "RN at bedside"],
      monitoring_during: ["Continuous observation"],
      monitoring_post: ["Post-push VS"],
      patient_education: ["Metallic taste possible"],
      escalation_criteria: ["Bronchospasm", "Anaphylaxis signs"],
      documentation_required: ["Push time", "Dose"],
      adverse_event_response: {
        mild: ["Pause"],
        moderate: ["Provider"],
        severe: ["911", "epinephrine per ACLS if anaphylaxis"],
      },
    },
    notes_for_reviewer: [
      {
        note: "Confirm dose preference — 1g standard, 2g for higher-need patients, or always 2g?",
        resolved: false,
        resolved_at: null,
        resolved_by: null,
      },
      {
        note: "Some clinicians require sulfa allergy screening (theoretical cross-reactivity, debated). Confirm your stance",
        resolved: false,
        resolved_at: null,
        resolved_by: null,
      },
    ],
  },
] as const;

export const IV_CLINICAL_PROTOCOL_BY_SLUG = Object.fromEntries(
  IV_CLINICAL_PROTOCOL_SEED.map((p) => [p.slug, p]),
) as Record<(typeof IV_CLINICAL_PROTOCOL_SEED)[number]["slug"], IvProtocolSeedRecord>;

export function unresolvedReviewerNotes(protocol: IvProtocolSeedRecord): LegacyReviewerRow[] {
  return protocol.notes_for_reviewer.filter((n) => !n.resolved);
}
