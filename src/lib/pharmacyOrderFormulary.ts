/**
 * Provider pharmacy order formulary — Custom Pharmacy of Evans, transdermal creams only.
 * Pricing display constants from stripeConfig / pricing_source_of_truth.md.
 */

import { ELEVATED_PROGRAMS, MEDICATION_FILLS } from "@/lib/stripeConfig";

export type PharmacyCategoryId = "male_creams" | "female_creams";

export interface PharmacyCategory {
  id: PharmacyCategoryId;
  label: string;
  description: string;
  genderFilter?: "male" | "female";
}

export interface PharmacyFormularyItem {
  id: string;
  name: string;
  strength: string;
  sig: string;
  category: PharmacyCategoryId;
  /** Custom Pharmacy preparation id (creams) */
  customPreparationId: string;
  policyKey?: string;
  /** À la carte fill (non-member) */
  fillDisplayPrice: string;
  /** Included in program membership when enrolled */
  programDisplayPrice: string;
  programLabel: string;
  defaultCadence: "30" | "90";
  publicDefault: boolean;
  escalationOnly?: boolean;
  genderFilter?: "male" | "female";
}

export const CUSTOM_PHARMACY_VENDOR = "Custom Pharmacy of Evans";

export const PHARMACY_CATEGORIES: PharmacyCategory[] = [
  {
    id: "male_creams",
    label: "Men's hormone creams",
    description: "Transdermal testosterone — fax to Custom Pharmacy of Evans",
    genderFilter: "male",
  },
  {
    id: "female_creams",
    label: "Women's BHRT creams",
    description: "Bi-Est, progesterone, and micro-dose testosterone creams",
    genderFilter: "female",
  },
];

export const PHARMACY_FORMULARY: PharmacyFormularyItem[] = [
  {
    id: "male_testosterone_cream",
    name: "Testosterone cream (men's dose)",
    strength: "100 mg/g liposomal",
    sig: "Apply to inner forearm or shoulder each morning per signed TRT protocol.",
    category: "male_creams",
    customPreparationId: "cpe-testosterone-cream-men",
    policyKey: "testosterone_cypionate",
    fillDisplayPrice: MEDICATION_FILLS.testosterone.displayPrice,
    programDisplayPrice: ELEVATED_PROGRAMS.trt.displayPrice,
    programLabel: ELEVATED_PROGRAMS.trt.name,
    defaultCadence: "30",
    publicDefault: true,
    genderFilter: "male",
  },
  {
    id: "male_testosterone_cream_escalation",
    name: "Testosterone cream — higher strength",
    strength: "150–200 mg/g liposomal",
    sig: "Apply per signed protocol when lower strength insufficient.",
    category: "male_creams",
    customPreparationId: "cpe-testosterone-cream-men",
    fillDisplayPrice: MEDICATION_FILLS.testosterone.displayPrice,
    programDisplayPrice: ELEVATED_PROGRAMS.trt.displayPrice,
    programLabel: ELEVATED_PROGRAMS.trt.name,
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
    category: "female_creams",
    customPreparationId: "cpe-bi-est-cream",
    policyKey: "bi_est_cream",
    fillDisplayPrice: MEDICATION_FILLS.biEst.displayPrice,
    programDisplayPrice: ELEVATED_PROGRAMS.hrt.displayPrice,
    programLabel: ELEVATED_PROGRAMS.hrt.name,
    defaultCadence: "30",
    publicDefault: true,
    genderFilter: "female",
  },
  {
    id: "hrt_progesterone_cream",
    name: "Progesterone transdermal cream",
    strength: "50 mg/g",
    sig: "Apply at bedtime when oral micronized not tolerated.",
    category: "female_creams",
    customPreparationId: "cpe-progesterone-cream",
    policyKey: "progesterone_oral",
    fillDisplayPrice: MEDICATION_FILLS.progesterone.displayPrice,
    programDisplayPrice: ELEVATED_PROGRAMS.hrt.displayPrice,
    programLabel: ELEVATED_PROGRAMS.hrt.name,
    defaultCadence: "30",
    publicDefault: false,
    genderFilter: "female",
  },
  {
    id: "female_testosterone_cream",
    name: "Testosterone cream (women's dose)",
    strength: "1 mg/g Topiclick",
    sig: "Micro-dose only if labs support — escalation add-on per protocol.",
    category: "female_creams",
    customPreparationId: "cpe-testosterone-cream-women",
    fillDisplayPrice: MEDICATION_FILLS.biEst.displayPrice,
    programDisplayPrice: ELEVATED_PROGRAMS.hrt.displayPrice,
    programLabel: ELEVATED_PROGRAMS.hrt.name,
    defaultCadence: "30",
    publicDefault: false,
    escalationOnly: true,
    genderFilter: "female",
  },
];

export function visiblePharmacyCategories(patientGender?: string | null): PharmacyCategory[] {
  return PHARMACY_CATEGORIES.filter((cat) => {
    if (!cat.genderFilter) return true;
    if (!patientGender) return true;
    return cat.genderFilter === patientGender;
  });
}

export function defaultPharmacyCategory(patientGender?: string | null): PharmacyCategoryId {
  if (patientGender === "male") return "male_creams";
  if (patientGender === "female") return "female_creams";
  return "female_creams";
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

/** Legacy lab-recommendation IDs → current cream formulary ids */
export const FORMULARY_ID_ALIASES: Record<string, string> = {
  male_test_100: "male_testosterone_cream",
  male_test_150: "male_testosterone_cream_escalation",
  male_test_200: "male_testosterone_cream_escalation",
  biest: "hrt_bi_est",
  progesterone_sleep: "hrt_progesterone_cream",
  female_testosterone: "female_testosterone_cream",
  trt_testosterone_cyp: "male_testosterone_cream",
  hrt_progesterone: "hrt_progesterone_cream",
};

export function resolveFormularyId(id: string): string {
  return FORMULARY_ID_ALIASES[id] ?? id;
}

/** True when a recommendation maps to a Custom Pharmacy hormone cream line. */
export function isCustomPharmacyHormoneCream(formularyId: string): boolean {
  return !!findFormularyItem(resolveFormularyId(formularyId));
}

export function portalRoutingCategory(category: PharmacyCategoryId): string {
  return category === "male_creams" ? "male_hormone" : "female_hormone";
}
