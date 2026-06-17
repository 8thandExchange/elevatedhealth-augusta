/**
 * Canonical dosing protocols — distilled from GC Compound Consulting dosing guides (104 PDFs).
 * One default SKU + titration per compound family. Staff use these; patients get program-level copy.
 *
 * Standard reconstitution: 2ml bacteriostatic water unless noted.
 * Insulin syringe: 100 units = 1ml.
 */

export interface TitrationStep {
  weeks: string;
  dose: string;
  syringeNote?: string;
}

export interface DosingProtocol {
  compoundKey: string;
  displayName: string;
  gcSku: string;
  vialLabel: string;
  reconstitutionMl: number;
  concentrationNote: string;
  route: string;
  frequency: string;
  timing?: string;
  titration: TitrationStep[];
  maintenanceDose: string;
  cycleWeeks: string;
  patientExplanation: string;
  staffNotes: string[];
  consents: ("research_peptide" | "glp1" | "off_label")[];
}

/** Canonical PATH/STLKS SKUs aligned to GC Partner Catalog 2026-05. */
export const DOSING_PROTOCOLS: Record<string, DosingProtocol> = {
  semaglutide: {
    compoundKey: "semaglutide",
    displayName: "Compounded Semaglutide",
    gcSku: "SEMAGLUTIDE-10MG-03ML",
    vialLabel: "10mg / 3ml",
    reconstitutionMl: 2,
    concentrationNote: "5mg/ml with 2ml BAC",
    route: "SubQ",
    frequency: "Once weekly",
    titration: [
      { weeks: "1–4", dose: "0.25 mg (5 units)", syringeNote: "Tolerance week" },
      { weeks: "5–8", dose: "0.5 mg (10 units)" },
      { weeks: "9+", dose: "1 mg (20 units) maintenance", syringeNote: "Titrate to 1.7–2.4 mg if tolerated" },
    ],
    maintenanceDose: "1 mg weekly (typical program target)",
    cycleWeeks: "12–68 weeks; reassess every 12 weeks",
    patientExplanation:
      "A weekly injection that reduces appetite and improves blood sugar. We start low and increase slowly so nausea stays manageable.",
    staffNotes: ["ELEVATED GLP-1 program includes medication.", "Draw Expanded Panel baseline."],
    consents: ["glp1"],
  },
  tirzepatide: {
    compoundKey: "tirzepatide",
    displayName: "Compounded Tirzepatide",
    gcSku: "TIRZEPATIDE-10MG-03ML",
    vialLabel: "10mg / 3ml",
    reconstitutionMl: 2,
    concentrationNote: "5mg/ml with 2ml BAC",
    route: "SubQ",
    frequency: "Once weekly",
    titration: [
      { weeks: "1–4", dose: "2.5 mg (50 units)" },
      { weeks: "5–8", dose: "5 mg (100 units; may split injection)" },
      { weeks: "9–12", dose: "7.5 mg (150 units; split)" },
      { weeks: "13+", dose: "7.5–15 mg weekly per tolerance" },
    ],
    maintenanceDose: "7.5 mg weekly (common maintenance)",
    cycleWeeks: "12–52 weeks",
    patientExplanation:
      "A dual-action weekly injection for weight and metabolic health. We escalate every four weeks based on how you feel.",
    staffNotes: ["Higher potency than semaglutide — confirm Expanded Panel.", "Split large volumes across two sites if needed."],
    consents: ["glp1"],
  },
  retatrutide: {
    compoundKey: "retatrutide",
    displayName: "Compounded Retatrutide",
    gcSku: "RETATRUTIDE-20MG-03ML",
    vialLabel: "20mg / 3ml",
    reconstitutionMl: 2,
    concentrationNote: "10mg/ml with 2ml BAC",
    route: "SubQ",
    frequency: "Once weekly",
    titration: [
      { weeks: "1–4", dose: "1 mg (10 units)" },
      { weeks: "5–8", dose: "2 mg (20 units)" },
      { weeks: "9–12", dose: "3–4 mg (30–40 units)" },
      { weeks: "13+", dose: "4–8 mg per metabolic protocol", syringeNote: "Physician titration only" },
    ],
    maintenanceDose: "4 mg weekly (EHA metabolic stack anchor)",
    cycleWeeks: "12–24 weeks per 90-day recomposition program",
    patientExplanation:
      "The anchor of our Metabolic Recomposition program — a weekly injection that targets appetite, insulin sensitivity, and fat metabolism. Only offered inside the supervised program with signed consents.",
    staffNotes: [
      "Metabolic Recomposition program only — not à la carte except physician exception.",
      "Research peptide + GLP consents required.",
    ],
    consents: ["research_peptide", "glp1"],
  },
  wolverine: {
    compoundKey: "wolverine",
    displayName: "BPC-157 / TB-500 Recovery Stack",
    gcSku: "BLND-WOLVERINE-BPC157TB500-10X10MG-03ML",
    vialLabel: "BPC 10mg + TB-500 10mg / 3ml",
    reconstitutionMl: 2,
    concentrationNote: "5mg/ml each peptide with 2ml BAC",
    route: "SubQ (near injury site if localized)",
    frequency: "Daily or 5–7 days/week",
    titration: [
      { weeks: "1–2", dose: "250 mcg each (5 units) daily", syringeNote: "Loading optional" },
      { weeks: "3–12", dose: "500 mcg each (10 units) daily" },
    ],
    maintenanceDose: "500 mcg BPC + 500 mcg TB-500 daily",
    cycleWeeks: "6–12 weeks on, 4–6 weeks off",
    patientExplanation:
      "A recovery-focused protocol that supports tissue recovery after injury or intense training when your provider selects the combined stack.",
    staffNotes: ["Cat 2 research peptide consent.", "Recovery Peptide Review lane — quote per membership tier."],
    consents: ["research_peptide"],
  },
  pt141: {
    compoundKey: "pt141",
    displayName: "PT-141 (Bremelanotide)",
    gcSku: "PT141-10MG-03ML",
    vialLabel: "10mg / 3ml",
    reconstitutionMl: 2,
    concentrationNote: "5mg/ml with 2ml BAC",
    route: "SubQ",
    frequency: "As needed, max 1×/day",
    timing: "2–4 hours before anticipated activity",
    titration: [
      { weeks: "1–4", dose: "1 mg (20 units) up to 3×/week" },
      { weeks: "5+", dose: "1–2 mg as needed, max 3×/week" },
    ],
    maintenanceDose: "1–2 mg as needed",
    cycleWeeks: "4–12 weeks, then 2–4 week break",
    patientExplanation:
      "An as-needed injection for libido support — not daily. We start at 1 mg and adjust based on response.",
    staffNotes: ["Restore stack SKU.", "Sexual wellness line launch-hidden."],
    consents: ["research_peptide"],
  },
  sermorelin: {
    compoundKey: "sermorelin",
    displayName: "Sermorelin",
    gcSku: "SERMORELIN-10MG-03ML",
    vialLabel: "10mg / 3ml",
    reconstitutionMl: 2,
    concentrationNote: "5mg/ml with 2ml BAC",
    route: "SubQ",
    frequency: "Daily",
    timing: "At bedtime (aligns with natural GH pulse)",
    titration: [
      { weeks: "1–4", dose: "100–200 mcg (2–4 units)" },
      { weeks: "5–12", dose: "200–300 mcg (4–6 units) daily" },
    ],
    maintenanceDose: "200 mcg at bedtime",
    cycleWeeks: "8–12 weeks on, 4–6 weeks off",
    patientExplanation:
      "A nightly injection that supports your body's natural growth hormone rhythm — often paired with NAD+ in our Vitality stack for sleep and recovery.",
    staffNotes: ["Vitality stack component.", "Green-light peptide (not Cat 2)."],
    consents: [],
  },
  nadInjection: {
    compoundKey: "nadInjection",
    displayName: "NAD+ Injection",
    gcSku: "STLKS-NAD-1000mg",
    vialLabel: "1000mg / 10ml (liquid) or lyophilized per lot",
    reconstitutionMl: 5,
    concentrationNote: "200mg/ml if reconstituted to 5ml",
    route: "SubQ or IM",
    frequency: "Daily",
    titration: [
      { weeks: "1–4", dose: "50 mg (25 units at 200mg/ml)" },
      { weeks: "5–12", dose: "50–100 mg daily" },
    ],
    maintenanceDose: "50–100 mg daily",
    cycleWeeks: "8–16 weeks",
    patientExplanation:
      "Supports cellular energy and recovery. We start low because some patients feel flushing or nausea at higher doses.",
    staffNotes: ["Vitality stack + metabolic phase 2.", "IV NAD+ separate SKU at IV Lounge."],
    consents: [],
  },
  cjcIpamorelin: {
    compoundKey: "cjcIpamorelin",
    displayName: "CJC-1295 / Ipamorelin",
    gcSku: "BLND-CJC1295IPAMORELIN-10X10MG-03ML",
    vialLabel: "10mg + 10mg / 3ml",
    reconstitutionMl: 2,
    concentrationNote: "5mg/ml each with 2ml BAC",
    route: "SubQ",
    frequency: "1–2× daily",
    timing: "Bedtime or post-workout",
    titration: [
      { weeks: "1–4", dose: "100 mcg each (2 units) once daily" },
      { weeks: "5–12", dose: "200 mcg each (4 units) once or twice daily" },
    ],
    maintenanceDose: "200 mcg CJC + 200 mcg Ipamorelin",
    cycleWeeks: "8–16 weeks on, 4–6 weeks off",
    patientExplanation:
      "A combined nightly injection that supports lean mass and recovery during weight loss — used in phase 3 of our metabolic program.",
    staffNotes: ["Cat 2 — research peptide consent.", "Metabolic stack phase 3."],
    consents: ["research_peptide"],
  },
  tesamorelin: {
    compoundKey: "tesamorelin",
    displayName: "Tesamorelin",
    gcSku: "TESAMORELIN-10MG-03ML",
    vialLabel: "10mg / 3ml",
    reconstitutionMl: 2,
    concentrationNote: "5mg/ml with 2ml BAC",
    route: "SubQ",
    frequency: "Daily, 5–7 nights/week",
    timing: "Bedtime",
    titration: [
      { weeks: "1–4", dose: "1 mg (20 units)" },
      { weeks: "5+", dose: "1–2 mg (20–40 units) 5 nights/week" },
    ],
    maintenanceDose: "2 mg nightly × 5 nights/week",
    cycleWeeks: "8–24 weeks",
    patientExplanation:
      "Targets visceral fat and supports lean mass — especially useful when you're losing weight and want to protect muscle.",
    staffNotes: ["Metabolic phase 3.", "Off-label consent for non-HIV use."],
    consents: ["research_peptide", "off_label"],
  },
  ss31: {
    compoundKey: "ss31",
    displayName: "SS-31 (Elamipretide)",
    gcSku: "SS31-10MG-03ML",
    vialLabel: "10mg / 3ml",
    reconstitutionMl: 2,
    concentrationNote: "5mg/ml with 2ml BAC",
    route: "SubQ",
    frequency: "Daily",
    titration: [
      { weeks: "1–2", dose: "2–4 mg daily", syringeNote: "Start low" },
      { weeks: "3+", dose: "4–10 mg daily per tolerance" },
    ],
    maintenanceDose: "4 mg daily (clinical trial reference dose)",
    cycleWeeks: "4–12 weeks",
    patientExplanation:
      "Supports mitochondrial function and energy — added once you've tolerated the anchor GLP injection in the metabolic program.",
    staffNotes: ["Cat 2 research consent.", "Metabolic phase 2."],
    consents: ["research_peptide"],
  },
  aod9604: {
    compoundKey: "aod9604",
    displayName: "AOD-9604",
    gcSku: "AOD9604-05MG-03ML",
    vialLabel: "0.5mg / 3ml",
    reconstitutionMl: 2,
    concentrationNote: "Per guide: 250–500 mcg/day",
    route: "SubQ",
    frequency: "Daily",
    timing: "Morning, empty stomach",
    titration: [{ weeks: "1–12", dose: "250–500 mcg daily" }],
    maintenanceDose: "250–500 mcg daily",
    cycleWeeks: "4–12 weeks on, 4 weeks off",
    patientExplanation: "A fat-metabolism adjunct used in later phases when plateaus occur — physician-directed only.",
    staffNotes: ["Metabolic phase 4 optional.", "Cat 2 consent."],
    consents: ["research_peptide"],
  },
  sluPp332: {
    compoundKey: "sluPp332",
    displayName: "SLU-PP-332",
    gcSku: "SLU-PP-332-5MG-3ML",
    vialLabel: "5mg / 3ml",
    reconstitutionMl: 2,
    concentrationNote: "Per physician protocol",
    route: "SubQ",
    frequency: "Daily",
    titration: [{ weeks: "1+", dose: "Per physician protocol" }],
    maintenanceDose: "Physician-directed",
    cycleWeeks: "Physician-directed",
    patientExplanation: "An optional metabolic adjunct for plateau support — only with physician approval.",
    staffNotes: ["Metabolic phase 4.", "Cat 2 consent."],
    consents: ["research_peptide"],
  },
};

export function getDosingProtocol(key: string): DosingProtocol | undefined {
  return DOSING_PROTOCOLS[key];
}
