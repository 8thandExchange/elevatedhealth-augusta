/**
 * Provider-only dosing algorithms — internal reference for clinical_protocol_versions.body_structured.
 * Never import on public marketing pages.
 */
export interface ProviderProtocolAlgorithm {
  slug: string;
  displayName: string;
  candidateGoals?: string[];
  contraindications?: string[];
  cautionFlags?: string[];
  startDose: string;
  escalationSchedule: string;
  frequency: string;
  route: string;
  cycleLength?: string;
  holdRules: string[];
  stopRules: string[];
  monitoringLabs: string[];
  adverseEffectMonitoring: string[];
  refillRules: string;
  followUpInterval: string;
  supplierVialOption?: string;
  unitConversionNotes?: string;
  documentationRequired: string[];
}

export const PROVIDER_PROTOCOL_ALGORITHMS: ProviderProtocolAlgorithm[] = [
  {
    slug: "compounded-semaglutide-initiation",
    displayName: "Compounded Semaglutide",
    startDose: "0.25 mg subQ weekly × 4 weeks",
    escalationSchedule: "Increase 0.25 mg q4 weeks per tolerance to maintenance 1–2.4 mg weekly",
    frequency: "Weekly",
    route: "Subcutaneous",
    holdRules: ["Hold for persistent vomiting", "Hold if eGFR <30 without nephrology clearance"],
    stopRules: ["Discontinue if pancreatitis suspected", "Pregnancy"],
    monitoringLabs: ["Expanded panel baseline", "Quarterly CMP", "A1C"],
    adverseEffectMonitoring: ["Nausea", "Constipation", "Injection site"],
    refillRules: "Monthly program fill after RN check-in",
    followUpInterval: "Monthly RN; physician per escalation",
    supplierVialOption: "GC/FCC compounded semaglutide",
    documentationRequired: ["GLP-1 consent", "Dose log", "Weight vitals"],
  },
  {
    slug: "compounded-tirzepatide-initiation",
    displayName: "Compounded Tirzepatide",
    startDose: "2.5 mg subQ weekly × 4 weeks",
    escalationSchedule: "Increase 2.5 mg q4 weeks to max tolerated dose per protocol",
    frequency: "Weekly",
    route: "Subcutaneous",
    holdRules: ["Hold for severe GI intolerance", "Hold if gallbladder symptoms acute"],
    stopRules: ["Suspected pancreatitis", "Pregnancy"],
    monitoringLabs: ["Expanded panel baseline", "Quarterly CMP", "Lipids"],
    adverseEffectMonitoring: ["GI tolerance", "Hypoglycemia symptoms if on insulin"],
    refillRules: "Monthly after documented tolerance",
    followUpInterval: "Monthly RN",
    supplierVialOption: "GC/FCC compounded tirzepatide",
    documentationRequired: ["GLP-1 consent", "Dose titration record"],
  },
  {
    slug: "metabolic-recomposition-stack",
    displayName: "Advanced Metabolic Protocol (retatrutide, provider-only)",
    startDose: "Retatrutide 0.5 mg weekly phase 1",
    escalationSchedule: "90-day phased stack per metabolicStackConfig — physician-only",
    frequency: "Per phase",
    route: "Subcutaneous / IV adjuncts",
    cycleLength: "90 days initial; reassess",
    holdRules: ["Hold retatrutide for uncontrolled nausea", "Hold GH peptides if IGF-1 supraphysiologic"],
    stopRules: ["Program discontinuation per physician", "Pregnancy"],
    monitoringLabs: ["Expanded panel", "Quarterly metabolic panel", "IGF-1 when GH axis active"],
    adverseEffectMonitoring: ["GI", "Injection site", "Sleep", "BP during NAD+ IV"],
    refillRules: "Program enrollment only — no casual à la carte retatrutide",
    followUpInterval: "Biweekly weeks 1–4, then monthly",
    supplierVialOption: "FCC SKUs 2478–2485 stack",
    documentationRequired: ["GLP-1 consent", "Program enrollment", "Phase checklist"],
  },
  {
    slug: "sermorelin-initiation",
    displayName: "Sermorelin",
    startDose: "100–200 mcg subQ nightly",
    escalationSchedule: "Titrate to 300 mcg nightly over 2–4 weeks if tolerated",
    frequency: "Nightly",
    route: "Subcutaneous",
    holdRules: ["Hold for edema or joint pain worsening"],
    stopRules: ["Pregnancy", "Active malignancy untreated"],
    monitoringLabs: ["IGF-1 baseline and q12 weeks"],
    adverseEffectMonitoring: ["Flushing", "Injection site"],
    refillRules: "Monthly after IGF-1 review",
    followUpInterval: "Monthly RN first 3 months",
    documentationRequired: ["Research peptide consent if applicable", "Injection teaching"],
  },
  {
    slug: "pt141-bremelanotide-initiation",
    displayName: "PT-141",
    startDose: "1 mg subQ PRN libido event; max 2 doses per 24h",
    escalationSchedule: "May increase to 1.75 mg per Vyleesi labeling equivalent with tolerance review",
    frequency: "PRN",
    route: "Subcutaneous",
    holdRules: ["Hold if uncontrolled hypertension"],
    stopRules: ["Persistent nausea", "Pregnancy"],
    monitoringLabs: ["Sexual wellness panel when indicated", "BP log"],
    adverseEffectMonitoring: ["Flushing", "Nausea", "BP"],
    refillRules: "Per prescription; not unlimited PRN without review",
    followUpInterval: "30-day review first refill",
    documentationRequired: ["Sexual wellness consent", "BP baseline"],
  },
  {
    slug: "recovery-bpc157",
    displayName: "BPC-157",
    candidateGoals: [
      "Training recovery",
      "Tendon/ligament support",
      "Soft-tissue recovery",
      "Post-injury support when clinically appropriate",
    ],
    contraindications: [
      "Active untreated malignancy",
      "Pregnancy or breastfeeding",
      "Uncontrolled infection at injection site",
    ],
    cautionFlags: ["Personal/family cancer history", "Competitive athlete — document plan"],
    startDose: "250–500 mcg subQ daily (injury phase)",
    escalationSchedule: "May increase to 500 mcg BID × 2–4 weeks per tolerance; physician adjusts",
    frequency: "Daily during active recovery phase",
    route: "Subcutaneous (local or systemic per protocol)",
    cycleLength: "4–8 weeks active phase; reassess",
    holdRules: [
      "Hold for active malignancy without oncology clearance",
      "Hold for uncontrolled infection at injection site",
      "Hold if pregnancy suspected",
    ],
    stopRules: [
      "Stop at end of signed cycle unless physician extends",
      "Stop for adverse reaction or new cancer diagnosis",
    ],
    monitoringLabs: ["Foundational panel baseline", "CRP if clinically indicated"],
    adverseEffectMonitoring: ["Injection site reaction", "GI symptoms", "Dizziness"],
    refillRules: "No refill without follow-up and signed protocol",
    followUpInterval: "2–4 weeks during active phase",
    supplierVialOption: "FCC BPC-157 vial per formulary",
    unitConversionNotes: "Reconstitute per pharmacy label; insulin syringe U-100",
    documentationRequired: [
      "Research Peptide Consent",
      "Recovery goal / injury documentation",
      "Malignancy screen",
      "Recovery Peptide Review checklist",
    ],
  },
  {
    slug: "recovery-tb500",
    displayName: "TB-500",
    candidateGoals: ["Tissue mobility support", "Training recovery", "Joint/tendon recovery goals"],
    contraindications: ["Active malignancy without clearance", "Pregnancy"],
    cautionFlags: ["WADA prohibited — competitive athletes", "Bleeding risk / anticoagulant use"],
    startDose: "2–2.5 mg subQ weekly (loading)",
    escalationSchedule: "Loading 4–6 weeks then 2 mg weekly maintenance if extended",
    frequency: "Weekly subQ",
    route: "Subcutaneous",
    cycleLength: "6–12 weeks typical; physician-defined",
    holdRules: ["Hold for active infection", "Hold pending oncology clearance if cancer history"],
    stopRules: ["WADA disclosure documented for competitive athletes", "Stop at cycle end"],
    monitoringLabs: ["Foundational panel", "Follow symptom trajectory"],
    adverseEffectMonitoring: ["Injection site", "Fatigue", "Headache"],
    refillRules: "Monthly after RN check-in during program",
    followUpInterval: "4 weeks",
    supplierVialOption: "FCC TB-500 / Thymosin Beta-4",
    documentationRequired: ["Research Peptide Consent", "Athlete/WADA disclosure if applicable"],
  },
  {
    slug: "recovery-bpc-tb-stack",
    displayName: "BPC-157 / TB-500 Recovery Stack",
    candidateGoals: [
      "Combined recovery protocol after provider review",
      "Active adults with multi-site soft-tissue goals",
    ],
    contraindications: ["Either component contraindicated", "Active malignancy", "Pregnancy"],
    cautionFlags: ["Athlete/WADA disclosure", "Malignancy history"],
    startDose: "Per blended vial sig — typically BPC daily + TB weekly component",
    escalationSchedule: "Physician titrates per combined protocol; no patient self-titration",
    frequency: "BPC daily + TB weekly (typical combined course)",
    route: "Subcutaneous",
    cycleLength: "6–12 weeks; reassess at week 6",
    holdRules: ["Same as individual agents", "Hold entire stack if either component contraindicated"],
    stopRules: ["End of signed stack cycle", "Adverse event"],
    monitoringLabs: ["Foundational labs", "Optional repeat inflammatory markers"],
    adverseEffectMonitoring: ["Injection site", "Systemic tolerance"],
    refillRules: "Program pricing via named stack — quote only after Recovery Peptide Review",
    followUpInterval: "2–4 weeks",
    supplierVialOption: "GC/FCC pre-blended recovery stack SKU",
    unitConversionNotes: "Use pharmacy-provided concentration only",
    documentationRequired: [
      "Research Peptide Consent",
      "Stack protocol sign-off",
      "Recovery Peptide Review complete",
    ],
  },
  {
    slug: "recovery-pda",
    displayName: "PDA (Pentadeca Arginate) — optional oral alternate",
    candidateGoals: [
      "Oral recovery support when physician selects PDA",
      "Patient preference for non-injectable recovery support",
    ],
    contraindications: ["Pregnancy", "Active malignancy without clearance"],
    cautionFlags: ["TB-500 component only if policy-active", "Athlete/WADA if TB-500 added"],
    startDose: "PDA oral per FCC sig; TB-500 weekly only if policy-active",
    escalationSchedule: "No dose escalation without physician order",
    frequency: "PDA daily; TB-500 weekly if active",
    route: "Oral / subQ",
    holdRules: ["Hold TB-500 for active infection uncontrolled"],
    stopRules: ["Athlete WADA disclosure if TB-500 used"],
    monitoringLabs: ["Foundational panel", "CRP if indicated"],
    adverseEffectMonitoring: ["GI tolerance oral PDA", "Injection site TB-500"],
    refillRules: "30-day supply per signed protocol",
    followUpInterval: "4–6 week review",
    documentationRequired: ["Research peptide consent", "Recovery Peptide Review complete"],
  },
  {
    slug: "male-trt-initiation-compounded-cypionate",
    displayName: "TRT Testosterone Cypionate",
    startDose: "80–120 mg weekly IM or subQ",
    escalationSchedule: "Adjust q6–8 weeks per total T, E2, hematocrit",
    frequency: "Weekly",
    route: "IM or subQ",
    holdRules: ["Hold if HCT >54%", "Hold if severe sleep apnea untreated"],
    stopRules: ["Active prostate cancer", "Pregnancy exposure risk counseling"],
    monitoringLabs: ["Male hormone panel q6–12 weeks initially"],
    adverseEffectMonitoring: ["HCT", "E2", "Acne", "Mood"],
    refillRules: "Included in ELEVATED TRT or single fill",
    followUpInterval: "6–8 weeks early; quarterly stable",
    supplierVialOption: "Custom Pharmacy of Evans 200 mg/mL",
    documentationRequired: ["Hormone therapy consent", "Injection teaching"],
  },
  {
    slug: "bhrt-female-initiation-transdermal",
    displayName: "Female BHRT Bi-Est",
    startDose: "Bi-Est 0.5–1.5 mg daily transdermal",
    escalationSchedule: "Titrate per symptoms and labs q8–12 weeks",
    frequency: "Daily",
    route: "Transdermal cream",
    holdRules: ["Hold for unexplained bleeding — evaluate"],
    stopRules: ["Pregnancy", "Estrogen-sensitive malignancy untreated"],
    monitoringLabs: ["Female hormone panel", "Annual mammography per age"],
    adverseEffectMonitoring: ["Breast tenderness", "Mood", "Bleeding pattern"],
    refillRules: "30-day cream supply",
    followUpInterval: "8–12 weeks initial",
    supplierVialOption: "Custom Pharmacy of Evans Bi-Est",
    documentationRequired: ["Hormone therapy consent", "Application teaching"],
  },
];

export function algorithmBySlug(slug: string): ProviderProtocolAlgorithm | undefined {
  return PROVIDER_PROTOCOL_ALGORITHMS.find((a) => a.slug === slug);
}

export function algorithmToStructuredJson(algo: ProviderProtocolAlgorithm): Record<string, unknown> {
  return {
    provider_algorithm: {
      start_dose: algo.startDose,
      escalation_schedule: algo.escalationSchedule,
      frequency: algo.frequency,
      route: algo.route,
      cycle_length: algo.cycleLength ?? null,
      hold_rules: algo.holdRules,
      stop_rules: algo.stopRules,
      monitoring_labs: algo.monitoringLabs,
      adverse_effect_monitoring: algo.adverseEffectMonitoring,
      refill_rules: algo.refillRules,
      follow_up_interval: algo.followUpInterval,
      supplier_vial_option: algo.supplierVialOption ?? null,
      unit_conversion_notes: algo.unitConversionNotes ?? null,
      documentation_required: algo.documentationRequired,
    },
  };
}
