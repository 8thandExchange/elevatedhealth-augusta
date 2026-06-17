/**
 * Expected CDS expansion seed (mirrors 20260618120000_seed_cds_pathways_expansion.sql).
 * Used by unit tests to catch drift before migration apply.
 */
import type { RegulatoryStatus } from "./cdsEngine";

export interface CdsExpansionCandidateSpec {
  candidateKey: string;
  pathwaySlug: string;
  regulatoryStatus: RegulatoryStatus;
  requiredConsentTypes: string[];
  contraindicationTags: string[];
}

export const CDS_EXPANSION_PATHWAY_SLUGS = [
  "prediabetes-insulin-resistance",
  "male-sexual-function",
  "female-sexual-function",
  "thyroid-optimization",
  "anemia-iron",
  "aesthetics",
] as const;

/** IV lane extended in place on iv-hydration-only (no duplicate iv-therapy-nad slug). */
export const CDS_IV_PATHWAY_SLUG = "iv-hydration-only";

export const CDS_EXPANSION_CANDIDATES: CdsExpansionCandidateSpec[] = [
  {
    candidateKey: "prediabetes_metformin",
    pathwaySlug: "prediabetes-insulin-resistance",
    regulatoryStatus: "FDA_APPROVED",
    requiredConsentTypes: ["general_medical_treatment"],
    contraindicationTags: ["egfr_below_30", "acute_illness", "contrast_48h"],
  },
  {
    candidateKey: "prediabetes_glp1_referral",
    pathwaySlug: "prediabetes-insulin-resistance",
    regulatoryStatus: "COMPOUNDABLE_503A",
    requiredConsentTypes: ["glp1", "off_label"],
    contraindicationTags: ["pregnancy", "mtc_men2", "pancreatitis_history"],
  },
  {
    candidateKey: "ed_sildenafil",
    pathwaySlug: "male-sexual-function",
    regulatoryStatus: "FDA_APPROVED",
    requiredConsentTypes: ["general_medical_treatment", "off_label"],
    contraindicationTags: ["nitrates", "recent_cardiac_event", "severe_hypotension"],
  },
  {
    candidateKey: "ed_tadalafil",
    pathwaySlug: "male-sexual-function",
    regulatoryStatus: "FDA_APPROVED",
    requiredConsentTypes: ["general_medical_treatment", "off_label"],
    contraindicationTags: ["nitrates", "recent_cardiac_event", "severe_hypotension"],
  },
  {
    candidateKey: "ed_pt141",
    pathwaySlug: "male-sexual-function",
    regulatoryStatus: "FDA_APPROVED",
    requiredConsentTypes: ["off_label"],
    contraindicationTags: ["uncontrolled_hypertension", "cardiovascular_disease", "nitrates"],
  },
  {
    candidateKey: "female_testosterone",
    pathwaySlug: "female-sexual-function",
    regulatoryStatus: "COMPOUNDABLE_503A",
    requiredConsentTypes: ["hormone_therapy", "off_label"],
    contraindicationTags: ["estrogen_sensitive_cancer", "pregnancy"],
  },
  {
    candidateKey: "female_dhea",
    pathwaySlug: "female-sexual-function",
    regulatoryStatus: "COMPOUNDABLE_503A",
    requiredConsentTypes: ["off_label"],
    contraindicationTags: ["hormone_sensitive_cancer"],
  },
  {
    candidateKey: "female_pt141",
    pathwaySlug: "female-sexual-function",
    regulatoryStatus: "FDA_APPROVED",
    requiredConsentTypes: ["off_label"],
    contraindicationTags: ["uncontrolled_hypertension", "cardiovascular_disease"],
  },
  {
    candidateKey: "thyroid_levothyroxine",
    pathwaySlug: "thyroid-optimization",
    regulatoryStatus: "FDA_APPROVED",
    requiredConsentTypes: ["general_medical_treatment"],
    contraindicationTags: ["untreated_adrenal_insufficiency", "thyrotoxicosis"],
  },
  {
    candidateKey: "thyroid_lt4_lt3_ndt",
    pathwaySlug: "thyroid-optimization",
    regulatoryStatus: "COMPOUNDABLE_503A",
    requiredConsentTypes: ["off_label"],
    contraindicationTags: ["cardiac_caution", "elderly_caution"],
  },
  {
    candidateKey: "anemia_oral_iron",
    pathwaySlug: "anemia-iron",
    regulatoryStatus: "FDA_APPROVED",
    requiredConsentTypes: ["general_medical_treatment"],
    contraindicationTags: ["hemochromatosis", "active_gi_bleed"],
  },
  {
    candidateKey: "anemia_iv_iron",
    pathwaySlug: "anemia-iron",
    regulatoryStatus: "FDA_APPROVED",
    requiredConsentTypes: ["general_medical_treatment"],
    contraindicationTags: ["hemochromatosis", "active_gi_bleed"],
  },
  {
    candidateKey: "anemia_b12",
    pathwaySlug: "anemia-iron",
    regulatoryStatus: "FDA_APPROVED",
    requiredConsentTypes: ["general_medical_treatment"],
    contraindicationTags: [],
  },
  {
    candidateKey: "aesthetic_neuromodulator",
    pathwaySlug: "aesthetics",
    regulatoryStatus: "FDA_APPROVED",
    requiredConsentTypes: ["general_medical_treatment"],
    contraindicationTags: [
      "active_infection",
      "product_allergy",
      "pregnancy_breastfeeding",
      "neuromuscular_disorder",
    ],
  },
  {
    candidateKey: "aesthetic_filler",
    pathwaySlug: "aesthetics",
    regulatoryStatus: "FDA_APPROVED",
    requiredConsentTypes: ["general_medical_treatment"],
    contraindicationTags: ["active_infection", "product_allergy", "pregnancy_breastfeeding"],
  },
  {
    candidateKey: "iv_standing_menu",
    pathwaySlug: CDS_IV_PATHWAY_SLUG,
    regulatoryStatus: "FDA_APPROVED",
    requiredConsentTypes: ["general_medical_treatment"],
    contraindicationTags: ["chf", "esrd", "pregnancy", "anaphylaxis_history", "g6pd_high_dose_vitc"],
  },
];

/** Prescriber sign-off CHECK: active=true requires signed_off_by and signed_off_at. */
export function pathwayActivationAllowed(row: {
  active: boolean;
  signed_off_by: string | null;
  signed_off_at: string | null;
}): boolean {
  if (!row.active) return true;
  return Boolean(row.signed_off_by && row.signed_off_at);
}
