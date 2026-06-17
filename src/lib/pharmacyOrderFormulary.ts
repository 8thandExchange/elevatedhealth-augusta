/**
 * Provider pharmacy order formulary — category tabs per clinical guide Priority 4.
 * Injectable-first TRT; BHRT creams as lead for women; GLP-1/metabolic/peptides separated.
 * Aligns with hormoneProtocolDefaults + clinical_policy item keys.
 */

export type PharmacyCategoryId =
  | "male_trt"
  | "female_bhrt"
  | "glp1"
  | "metabolic"
  | "peptides"
  | "sexual_wellness"
  | "retail_erx";

export interface PharmacyCategory {
  id: PharmacyCategoryId;
  label: string;
  description: string;
  /** Hide tab when patient sex conflicts (null = always show) */
  genderFilter?: "male" | "female";
}

export interface PharmacyFormularyItem {
  id: string;
  name: string;
  strength: string;
  sig: string;
  category: PharmacyCategoryId;
  policyKey?: string;
  vendor: string;
  defaultCadence: "30" | "90";
  publicDefault: boolean;
  escalationOnly?: boolean;
  genderFilter?: "male" | "female";
  programOnly?: boolean;
}

export const PHARMACY_CATEGORIES: PharmacyCategory[] = [
  {
    id: "male_trt",
    label: "Men's TRT",
    description: "Injectable-first testosterone — Custom Pharmacy of Evans",
    genderFilter: "male",
  },
  {
    id: "female_bhrt",
    label: "Women's BHRT",
    description: "Bi-Est cream + oral progesterone default",
    genderFilter: "female",
  },
  {
    id: "glp1",
    label: "GLP-1",
    description: "Semaglutide / tirzepatide program fills",
  },
  {
    id: "metabolic",
    label: "Metabolic program",
    description: "ELEVATED Metabolic Recomposition — program-only enrollment",
  },
  {
    id: "peptides",
    label: "Peptide stacks",
    description: "Named stacks under Research Peptide Consent",
  },
  {
    id: "sexual_wellness",
    label: "Sexual wellness",
    description: "Launch-hidden — route hormones first when indicated",
  },
  {
    id: "retail_erx",
    label: "Retail eRx",
    description: "FDA-approved patches/gels via DrFirst Rcopia",
  },
];

export const PHARMACY_FORMULARY: PharmacyFormularyItem[] = [
  {
    id: "trt_testosterone_cyp",
    name: "Testosterone cypionate",
    strength: "200 mg/mL vial",
    sig: "Inject 80–120 mg weekly IM or subQ per signed TRT protocol. RN teaching required.",
    category: "male_trt",
    policyKey: "testosterone_cypionate",
    vendor: "Custom Pharmacy of Evans",
    defaultCadence: "30",
    publicDefault: true,
    genderFilter: "male",
  },
  {
    id: "trt_anastrozole",
    name: "Anastrozole",
    strength: "0.5 mg capsule",
    sig: "0.25–0.5 mg twice weekly when estradiol elevated per protocol.",
    category: "male_trt",
    vendor: "Custom Pharmacy of Evans",
    defaultCadence: "30",
    publicDefault: false,
    escalationOnly: true,
    genderFilter: "male",
  },
  {
    id: "male_test_100",
    name: "Testosterone cream (escalation)",
    strength: "100 mg/g liposomal",
    sig: "Apply to shoulder/thigh each morning — only when injection not feasible.",
    category: "male_trt",
    vendor: "Custom Pharmacy of Evans",
    defaultCadence: "30",
    publicDefault: false,
    escalationOnly: true,
    genderFilter: "male",
  },
  {
    id: "hrt_bi_est",
    name: "Bi-Est transdermal cream",
    strength: "80:20 E3/E2 2.5 mg/g",
    sig: "Apply 1–2 clicks to inner thigh each morning. Titrate per BHRT protocol.",
    category: "female_bhrt",
    policyKey: "bi_est_cream",
    vendor: "Custom Pharmacy of Evans",
    defaultCadence: "30",
    publicDefault: true,
    genderFilter: "female",
  },
  {
    id: "hrt_progesterone",
    name: "Oral micronized progesterone",
    strength: "100–200 mg capsule",
    sig: "Take at bedtime when uterus intact.",
    category: "female_bhrt",
    policyKey: "progesterone_oral",
    vendor: "Custom Pharmacy of Evans",
    defaultCadence: "30",
    publicDefault: true,
    genderFilter: "female",
  },
  {
    id: "female_testosterone",
    name: "Testosterone cream (women)",
    strength: "10 mg/g Topiclick",
    sig: "Micro-dose only if labs support — escalation add-on.",
    category: "female_bhrt",
    vendor: "Custom Pharmacy of Evans",
    defaultCadence: "30",
    publicDefault: false,
    escalationOnly: true,
    genderFilter: "female",
  },
  {
    id: "glp1_semaglutide",
    name: "Compounded semaglutide",
    strength: "Per GLP-1 protocol titration",
    sig: "Weekly subQ injection per signed weight-loss protocol.",
    category: "glp1",
    policyKey: "semaglutide",
    vendor: "GC Scientific / FCC",
    defaultCadence: "30",
    publicDefault: true,
  },
  {
    id: "glp1_tirzepatide",
    name: "Compounded tirzepatide",
    strength: "Per GLP-1 protocol titration",
    sig: "Weekly subQ when clinically indicated.",
    category: "glp1",
    policyKey: "tirzepatide",
    vendor: "GC Scientific / FCC",
    defaultCadence: "30",
    publicDefault: false,
  },
  {
    id: "metabolic_program",
    name: "ELEVATED Metabolic Recomposition",
    strength: "Program enrollment",
    sig: "Enroll via program checkout — not à la carte retatrutide Rx.",
    category: "metabolic",
    policyKey: "elevated_metabolic_program",
    vendor: "GC Scientific",
    defaultCadence: "30",
    publicDefault: true,
    programOnly: true,
  },
  {
    id: "peptide_wolverine",
    name: "BPC-157 + TB-500 recovery stack",
    strength: "Per healing protocol",
    sig: "Research peptide consent required. 6–12 week course.",
    category: "peptides",
    policyKey: "wolverine_stack",
    vendor: "GC Scientific / FCC",
    defaultCadence: "30",
    publicDefault: true,
  },
  {
    id: "peptide_sermorelin",
    name: "Sermorelin",
    strength: "Per Vitality protocol",
    sig: "Nightly subQ per signed protocol.",
    category: "peptides",
    vendor: "FCC",
    defaultCadence: "30",
    publicDefault: true,
  },
  {
    id: "libido_pt141",
    name: "PT-141 (bremelanotide)",
    strength: "1 mg starting dose",
    sig: "On-demand 2–4 hours before activity. Hidden line — hormones first.",
    category: "sexual_wellness",
    policyKey: "pt_141",
    vendor: "GC Scientific",
    defaultCadence: "30",
    publicDefault: true,
  },
  {
    id: "retail_estrogen_patch",
    name: "Estradiol patch (retail)",
    strength: "FDA-approved product",
    sig: "DrFirst eRx when patient prefers retail patch over compound.",
    category: "retail_erx",
    vendor: "DrFirst Rcopia",
    defaultCadence: "30",
    publicDefault: false,
    genderFilter: "female",
  },
  {
    id: "retail_androgel",
    name: "Testosterone gel (retail)",
    strength: "FDA-approved product",
    sig: "DrFirst eRx — patient prefers gel over injectable.",
    category: "retail_erx",
    vendor: "DrFirst Rcopia",
    defaultCadence: "30",
    publicDefault: false,
    escalationOnly: true,
    genderFilter: "male",
  },
];

export function visiblePharmacyCategories(
  patientGender?: string | null,
): PharmacyCategory[] {
  return PHARMACY_CATEGORIES.filter((cat) => {
    if (!cat.genderFilter) return true;
    if (!patientGender) return true;
    return cat.genderFilter === patientGender;
  });
}

export function defaultPharmacyCategory(patientGender?: string | null): PharmacyCategoryId {
  if (patientGender === "male") return "male_trt";
  if (patientGender === "female") return "female_bhrt";
  return "glp1";
}

export function formularyItemsForCategory(
  categoryId: PharmacyCategoryId,
  options?: { patientGender?: string | null; includeEscalation?: boolean },
): PharmacyFormularyItem[] {
  const includeEscalation = options?.includeEscalation ?? false;
  return PHARMACY_FORMULARY.filter((item) => {
    if (item.category !== categoryId) return false;
    if (!includeEscalation && item.escalationOnly) return false;
    if (item.genderFilter && options?.patientGender && item.genderFilter !== options.patientGender) {
      return false;
    }
    return true;
  });
}

export function findFormularyItem(id: string): PharmacyFormularyItem | undefined {
  return PHARMACY_FORMULARY.find((item) => item.id === id);
}

/** Legacy medication mapping IDs → new formulary ids */
export const FORMULARY_ID_ALIASES: Record<string, string> = {
  male_test_100: "male_test_100",
  male_test_150: "male_test_100",
  male_test_200: "male_test_100",
  biest: "hrt_bi_est",
  progesterone_sleep: "hrt_progesterone",
};

export function resolveFormularyId(id: string): string {
  return FORMULARY_ID_ALIASES[id] ?? id;
}

/** Maps new category tabs → PrescriptionPortalModal routing / diagnosis keys */
export function portalRoutingCategory(category: PharmacyCategoryId): string {
  switch (category) {
    case "male_trt":
      return "male_hormone";
    case "female_bhrt":
      return "female_hormone";
    case "glp1":
    case "metabolic":
      return "weight_loss";
    case "peptides":
      return "peptide";
    case "sexual_wellness":
      return "sexual_wellness";
    case "retail_erx":
      return "male_hormone";
    default:
      return category;
  }
}
