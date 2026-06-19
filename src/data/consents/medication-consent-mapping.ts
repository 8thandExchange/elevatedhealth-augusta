import type { FCCCategory } from "@/lib/fccFormulary";
import type { ConsentType } from "./types";

/** Canonical medication keys → Tier 2 consent requirements */
export interface MedicationConsentRule {
  medication_id: string;
  medication_category: string;
  required_consents: ConsentType[];
  notes?: string;
}

export const MEDICATION_CONSENT_RULES: MedicationConsentRule[] = [
  {
    medication_id: "testosterone_cypionate_injectable",
    medication_category: "trt",
    required_consents: ["hormone_therapy", "off_label"],
  },
  {
    medication_id: "testosterone_cream",
    medication_category: "trt",
    required_consents: ["hormone_therapy", "off_label"],
  },
  {
    medication_id: "hcg",
    medication_category: "trt_adjunct",
    required_consents: ["hormone_therapy", "off_label"],
  },
  {
    medication_id: "anastrozole",
    medication_category: "trt_adjunct",
    required_consents: ["hormone_therapy", "off_label"],
  },
  {
    medication_id: "enclomiphene",
    medication_category: "trt_adjunct",
    required_consents: ["hormone_therapy", "off_label"],
  },
  {
    medication_id: "bi_est_cream",
    medication_category: "bhrt",
    required_consents: ["hormone_therapy", "off_label"],
  },
  {
    medication_id: "estradiol_cream",
    medication_category: "bhrt",
    required_consents: ["hormone_therapy", "off_label"],
  },
  {
    medication_id: "estradiol_patch",
    medication_category: "bhrt",
    required_consents: ["hormone_therapy", "off_label"],
  },
  {
    medication_id: "progesterone",
    medication_category: "bhrt",
    required_consents: ["hormone_therapy", "off_label"],
  },
  {
    medication_id: "testosterone_female_low_dose",
    medication_category: "bhrt",
    required_consents: ["hormone_therapy", "off_label"],
  },
  {
    medication_id: "vaginal_estradiol",
    medication_category: "bhrt",
    required_consents: ["hormone_therapy", "off_label"],
  },
  {
    medication_id: "dhea",
    medication_category: "bhrt",
    required_consents: ["hormone_therapy", "off_label"],
  },
  {
    medication_id: "pregnenolone",
    medication_category: "bhrt",
    required_consents: ["hormone_therapy", "off_label"],
  },
  {
    medication_id: "levothyroxine",
    medication_category: "thyroid",
    required_consents: ["hormone_therapy", "off_label"],
  },
  {
    medication_id: "liothyronine",
    medication_category: "thyroid",
    required_consents: ["hormone_therapy", "off_label"],
  },
  {
    medication_id: "compounded_thyroid",
    medication_category: "thyroid",
    required_consents: ["hormone_therapy", "off_label"],
  },
  {
    medication_id: "compounded_semaglutide",
    medication_category: "glp1",
    required_consents: ["glp1", "off_label"],
  },
  {
    medication_id: "compounded_tirzepatide",
    medication_category: "glp1",
    required_consents: ["glp1", "off_label"],
  },
  {
    medication_id: "commercial_semaglutide",
    medication_category: "glp1",
    required_consents: ["glp1"],
    notes:
      "FDA-approved commercial; off-label only when prescribed for indications outside the FDA label",
  },
  {
    medication_id: "commercial_tirzepatide",
    medication_category: "glp1",
    required_consents: ["glp1"],
    notes:
      "FDA-approved commercial; off-label only when prescribed for indications outside the FDA label",
  },
  {
    medication_id: "liraglutide",
    medication_category: "glp1",
    required_consents: ["glp1"],
  },
  {
    medication_id: "compounded_retatrutide",
    medication_category: "glp1",
    required_consents: ["glp1", "off_label"],
    notes:
      "Investigational triple agonist — gated, provider-selected only, never advertised. GLP-1 consent v2 carries the investigational / not-FDA-approved / not-compoundable (FDA 503A/503B) disclosure (Section 11A). NOT the research-peptide pathway.",
  },
  {
    medication_id: "bpc_157",
    medication_category: "research_peptide",
    required_consents: ["research_peptide"],
  },
  {
    medication_id: "tb_500",
    medication_category: "research_peptide",
    required_consents: ["research_peptide"],
  },
  {
    medication_id: "wolverine_stack",
    medication_category: "research_peptide",
    required_consents: ["research_peptide"],
  },
  {
    medication_id: "cjc_1295",
    medication_category: "research_peptide",
    required_consents: ["research_peptide"],
  },
  {
    medication_id: "ipamorelin",
    medication_category: "research_peptide",
    required_consents: ["research_peptide"],
  },
  {
    medication_id: "cjc_ipamorelin_combo",
    medication_category: "research_peptide",
    required_consents: ["research_peptide"],
  },
  {
    medication_id: "selank",
    medication_category: "research_peptide",
    required_consents: ["research_peptide"],
  },
  {
    medication_id: "thymosin_alpha_1",
    medication_category: "research_peptide",
    required_consents: ["research_peptide"],
  },
  {
    medication_id: "ghk_cu_injectable",
    medication_category: "research_peptide",
    required_consents: ["research_peptide"],
  },
  {
    medication_id: "sermorelin",
    medication_category: "green_light_peptide",
    required_consents: ["off_label"],
  },
  {
    medication_id: "tesamorelin",
    medication_category: "green_light_peptide",
    required_consents: ["off_label"],
    notes: "FDA-approved for HIV-associated lipodystrophy; off-label for other uses",
  },
  {
    medication_id: "pt_141",
    medication_category: "sexual_wellness",
    required_consents: ["off_label"],
    notes:
      "FDA-approved as Vyleesi for HSDD in premenopausal women; off-label for other indications",
  },
  {
    medication_id: "barfield_cream",
    medication_category: "sexual_wellness",
    required_consents: ["off_label"],
    notes:
      "Compounded sexual wellness cream prescribed off-label; recipe by Dr. Holgate, filled by Custom Pharmacy of Evans",
  },
  {
    medication_id: "nad_plus_injection",
    medication_category: "longevity",
    required_consents: [],
    notes: "No Tier 2 consent required",
  },
  {
    medication_id: "iv_hydration",
    medication_category: "iv_therapy",
    required_consents: [],
  },
  {
    medication_id: "myers_cocktail",
    medication_category: "iv_therapy",
    required_consents: [],
  },
  {
    medication_id: "immune_iv",
    medication_category: "iv_therapy",
    required_consents: [],
  },
  {
    medication_id: "athletic_recovery_iv",
    medication_category: "iv_therapy",
    required_consents: [],
  },
  {
    medication_id: "beauty_iv",
    medication_category: "iv_therapy",
    required_consents: [],
  },
  {
    medication_id: "nad_iv_infusion",
    medication_category: "iv_therapy",
    required_consents: [],
  },
  {
    medication_id: "b12_im",
    medication_category: "im_injection",
    required_consents: [],
  },
  {
    medication_id: "lipotropic_mic",
    medication_category: "im_injection",
    required_consents: [],
  },
  {
    medication_id: "glutathione_im",
    medication_category: "im_injection",
    required_consents: [],
  },
];

const RULE_BY_ID: Record<string, MedicationConsentRule> = Object.fromEntries(
  MEDICATION_CONSENT_RULES.map((r) => [r.medication_id, r]),
);

export function getMedicationConsentRule(medicationId: string): MedicationConsentRule | undefined {
  return RULE_BY_ID[medicationId];
}

/** PharmacyOrderCard `FORMULARY[].id` → canonical medication_id */
export const FORMULARY_LINE_ID_TO_CANONICAL: Record<string, string> = {
  male_testosterone_cream: "testosterone_cream",
  male_testosterone_cream_escalation: "testosterone_cream",
  hrt_bi_est: "bi_est_cream",
  hrt_progesterone_cream: "progesterone",
  female_testosterone_cream: "testosterone_female_low_dose",
  male_test_100: "testosterone_cream",
  male_test_150: "testosterone_cream",
  male_test_200: "testosterone_cream",
  female_testosterone: "testosterone_female_low_dose",
  progesterone_sleep: "progesterone",
  biest: "bi_est_cream",
  barfield_cream: "barfield_cream",
};

/** Custom Pharmacy of Evans preparation ids → canonical medication_id */
export const CUSTOM_PHARMACY_PREPARATION_TO_CANONICAL: Record<string, string> = {
  "cpe-bi-est-cream": "bi_est_cream",
  "cpe-progesterone-capsule": "progesterone",
  "cpe-progesterone-cream": "progesterone",
  "cpe-testosterone-cream-women": "testosterone_female_low_dose",
  "cpe-estradiol-pellet-women": "estradiol_patch",
  "cpe-testosterone-pellet-women": "testosterone_female_low_dose",
  "cpe-dhea-women": "dhea",
  "cpe-testosterone-cypionate": "testosterone_cypionate_injectable",
  "cpe-testosterone-cream-men": "testosterone_cream",
  "cpe-testosterone-pellet-men": "testosterone_cream",
  "cpe-anastrozole": "anastrozole",
  "cpe-hcg": "hcg",
  "cpe-enclomiphene": "enclomiphene",
  "cpe-dhea-men": "dhea",
};

export function getRequiredConsentsForMedication(medicationId: string): ConsentType[] {
  const rule = RULE_BY_ID[medicationId];
  return rule ? [...rule.required_consents] : [];
}

export interface RxConsentResolutionInput {
  medicationLineId?: string | null;
  fccSku?: string | null;
  fccName?: string | null;
  fccCategory?: FCCCategory | null;
  routingCategory?: string | null;
}

/**
 * Maps UI / FCC selections to canonical medication_id, then returns required Tier 2 consents.
 */
export function resolveCanonicalMedicationId(input: RxConsentResolutionInput): string | null {
  const { medicationLineId, fccSku, fccName, fccCategory } = input;

  if (medicationLineId) {
    if (FORMULARY_LINE_ID_TO_CANONICAL[medicationLineId]) {
      return FORMULARY_LINE_ID_TO_CANONICAL[medicationLineId];
    }
    if (CUSTOM_PHARMACY_PREPARATION_TO_CANONICAL[medicationLineId]) {
      return CUSTOM_PHARMACY_PREPARATION_TO_CANONICAL[medicationLineId];
    }
    if (RULE_BY_ID[medicationLineId]) return medicationLineId;
  }

  if (fccSku && FCC_SKU_TO_CANONICAL[fccSku]) {
    return FCC_SKU_TO_CANONICAL[fccSku];
  }

  return inferCanonicalFromFccNameAndCategory(fccName, fccCategory);
}

const FCC_SKU_TO_CANONICAL: Record<string, string> = {};

function inferCanonicalFromFccNameAndCategory(
  name: string | null | undefined,
  category: FCCCategory | null | undefined,
): string | null {
  const n = (name || "").toLowerCase();

  if (!n && !category) return null;

  if (n.includes("retatrutide")) return "compounded_retatrutide";
  if (n.includes("semaglutide")) return "compounded_semaglutide";
  if (n.includes("tirzepatide")) return "compounded_tirzepatide";
  if (n.includes("liraglutide")) return "liraglutide";

  if (/wolverine|bpc.*tb|tb.*bpc/.test(n)) return "wolverine_stack";
  if (n.includes("bpc")) return "bpc_157";
  if (n.includes("tb-500") || n.includes("tb 500") || n.includes("thymosin beta")) return "tb_500";
  if (n.includes("cjc") && n.includes("ipamorelin")) return "cjc_ipamorelin_combo";
  if (n.includes("cjc")) return "cjc_1295";
  if (n.includes("ipamorelin")) return "ipamorelin";
  if (n.includes("selank")) return "selank";
  if (n.includes("thymosin alpha") || n.includes("ta1")) return "thymosin_alpha_1";
  if (n.includes("ghk") && (n.includes("inject") || category === "anti_aging_injectable")) {
    return "ghk_cu_injectable";
  }

  if (n.includes("sermorelin")) return "sermorelin";
  if (n.includes("tesamorelin")) return "tesamorelin";
  if (n.includes("pt-141") || n.includes("pt141") || n.includes("bremelanotide")) return "pt_141";

  if (n.includes("nad")) {
    if (
      category === "wellness" ||
      n.includes("infusion") ||
      n.includes("iv") ||
      n.includes("sterile injection solution")
    ) {
      return "nad_iv_infusion";
    }
    return "nad_plus_injection";
  }

  if (n.includes("testosterone") && (n.includes("cypionate") || n.includes("inject"))) {
    return "testosterone_cypionate_injectable";
  }

  if (
    category === "hormone_topical_vaginal" ||
    category === "hormone_oral" ||
    category === "hormone_injectable"
  ) {
    if (n.includes("progesterone")) return "progesterone";
    if (n.includes("estradiol") || n.includes("estrogen") || n.includes("bi-est") || n.includes("biest")) {
      return "estradiol_cream";
    }
    if (n.includes("testosterone") && n.includes("cream")) return "testosterone_cream";
    if (n.includes("thyroid") || n.includes("levothyroxine") || n.includes("liothyronine")) {
      return "levothyroxine";
    }
    if (n.includes("anastrozole")) return "anastrozole";
    if (n.includes("hcg")) return "hcg";
    if (n.includes("enclomiphene")) return "enclomiphene";
    if (n.includes("dhea")) return "dhea";
    if (n.includes("pregnenolone")) return "pregnenolone";
    return "estradiol_cream";
  }

  if (category === "weight_management_oral_sublingual" || category === "weight_management_injectable") {
    return "compounded_semaglutide";
  }

  if (category === "wellness") {
    if (n.includes("myers")) return "myers_cocktail";
    if (n.includes("hydration")) return "iv_hydration";
    return "immune_iv";
  }

  if (category === "lipotropic_vitamin") {
    if (n.includes("b12") || n.includes("methylcobalamin")) return "b12_im";
    if (n.includes("glutathione")) return "glutathione_im";
    return "lipotropic_mic";
  }

  return null;
}

export function getRequiredConsentsForRxContext(input: RxConsentResolutionInput): ConsentType[] {
  const canonical = resolveCanonicalMedicationId(input);
  if (!canonical) {
    const rc = input.routingCategory;
    if (rc === "weight_loss" || rc === "glp1") return ["glp1", "off_label"];
    if (rc === "male_hormone" || rc === "female_hormone" || rc === "hormone") {
      return ["hormone_therapy", "off_label"];
    }
    if (rc === "peptide") return ["research_peptide"];
    return [];
  }
  return getRequiredConsentsForMedication(canonical);
}

export function mergeRequiredConsents(typesList: ConsentType[][]): ConsentType[] {
  const set = new Set<ConsentType>();
  for (const list of typesList) {
    for (const t of list) set.add(t);
  }
  return Array.from(set);
}

export function consentTypeDisplayName(type: ConsentType): string {
  const labels: Partial<Record<ConsentType, string>> = {
    terms_of_service: "Terms of Service",
    hipaa_acknowledgment: "HIPAA Acknowledgment",
    general_medical_treatment: "General Medical Treatment",
    telehealth: "Telehealth",
    communication: "Communication Preferences",
    hormone_therapy: "Hormone Therapy",
    glp1: "GLP-1 / Weight Management",
    off_label: "Off-Label Treatment",
    research_peptide: "Research Peptide",
    notice_of_privacy_practices: "Notice of Privacy Practices",
  };
  return labels[type] || type;
}
