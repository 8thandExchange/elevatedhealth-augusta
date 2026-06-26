// Custom Pharmacy of Evans — Bioidentical Hormone Replacement Therapy (BHRT) preparations
// Pharmacy: Custom Pharmacy of Evans
// Pharmacist: Eric Holgate, RPh
// Address: 1202 Town Park Lane, Suite 200, Evans, GA 30809
// Phone: (706) 760-7956 | Fax: (706) 993-3772
//
// This is a curated list of BHRT preparations our practice routinely orders.
// Custom Pharmacy fills
// patient-specific compounded prescriptions — the provider picks a preparation
// and a strength, fills the sig, and faxes the order.
//
// To add a preparation: append to CUSTOM_PHARMACY_PREPARATIONS below.
// All preparations require both a category (for default-pharmacy routing) and
// a preparation_type (for UI grouping).
export type CustomPharmacyCategory = "male_hormone" | "female_hormone";
export type CustomPharmacyPreparationType =
  | "cream"
  | "capsule"
  | "injection"
  | "pellet"
  | "troche"
  | "sublingual";
export interface CustomPharmacyPreparation {
  id: string;
  name: string;
  category: CustomPharmacyCategory;
  preparation_type: CustomPharmacyPreparationType;
  strength_options: string[];
  default_strength: string;
  default_sig: string;
  default_quantity: string;
  notes?: string;
}
export const CUSTOM_PHARMACY_PREPARATIONS: CustomPharmacyPreparation[] = [
  // ==========================================================
  // WOMEN'S BHRT
  // ==========================================================
  {
    id: "cpe-bi-est-cream",
    name: "Bi-Est (E2/E3) Cream",
    category: "female_hormone",
    preparation_type: "cream",
    strength_options: ["1mg/g", "2mg/g", "2.5mg/g", "5mg/g", "10mg/g"],
    default_strength: "2.5mg/g",
    default_sig: "Apply ___ mL to inner forearm or thigh once daily",
    default_quantity: "30g pump",
    notes: "Specify E2:E3 ratio (typically 80:20 or 50:50) in compounding instructions.",
  },
  {
    id: "cpe-progesterone-capsule",
    name: "Progesterone Capsules (Oral Micronized)",
    category: "female_hormone",
    preparation_type: "capsule",
    strength_options: ["25mg", "50mg", "75mg", "100mg", "150mg", "200mg"],
    default_strength: "100mg",
    default_sig: "Take 1 capsule by mouth at bedtime",
    default_quantity: "30 capsules",
  },
  {
    id: "cpe-progesterone-cream",
    name: "Progesterone Cream",
    category: "female_hormone",
    preparation_type: "cream",
    strength_options: ["25mg/g", "50mg/g", "75mg/g", "100mg/g"],
    default_strength: "50mg/g",
    default_sig: "Apply ___ mL to inner forearm once daily at bedtime",
    default_quantity: "30g pump",
  },
  {
    id: "cpe-testosterone-cream-women",
    name: "Testosterone Cream (Women's Dose)",
    category: "female_hormone",
    preparation_type: "cream",
    strength_options: ["0.5mg/g", "1mg/g", "2mg/g"],
    default_strength: "1mg/g",
    default_sig: "Apply ___ mL to clitoris/labia once daily",
    default_quantity: "30g pump",
  },
  {
    id: "cpe-estradiol-pellet-women",
    name: "Estradiol Pellets (Women)",
    category: "female_hormone",
    preparation_type: "pellet",
    strength_options: ["12.5mg", "25mg"],
    default_strength: "12.5mg",
    default_sig: "Insert subcutaneously per protocol; replace every 3-4 months",
    default_quantity: "1 pellet",
  },
  {
    id: "cpe-testosterone-pellet-women",
    name: "Testosterone Pellets (Women)",
    category: "female_hormone",
    preparation_type: "pellet",
    strength_options: ["50mg", "75mg", "100mg", "150mg", "200mg"],
    default_strength: "100mg",
    default_sig: "Insert subcutaneously per protocol; replace every 3-4 months",
    default_quantity: "1-3 pellets per protocol",
  },
  {
    id: "cpe-dhea-women",
    name: "DHEA Capsules",
    category: "female_hormone",
    preparation_type: "capsule",
    strength_options: ["5mg", "10mg", "25mg", "50mg"],
    default_strength: "25mg",
    default_sig: "Take 1 capsule by mouth once daily in the morning",
    default_quantity: "30 capsules",
  },
  // ==========================================================
  // MEN'S BHRT / ANDROPAUSE
  // ==========================================================
  {
    id: "cpe-testosterone-cream-men",
    name: "Testosterone Cream (Men's Dose)",
    category: "male_hormone",
    preparation_type: "cream",
    strength_options: ["50mg/g", "100mg/g", "150mg/g", "200mg/g"],
    default_strength: "100mg/g",
    default_sig: "Apply ___ mL to inner forearm once daily",
    default_quantity: "30g pump",
  },
  {
    id: "cpe-testosterone-pellet-men",
    name: "Testosterone Pellets (Men)",
    category: "male_hormone",
    preparation_type: "pellet",
    strength_options: ["100mg", "150mg", "200mg"],
    default_strength: "200mg",
    default_sig: "Insert subcutaneously per protocol; replace every 3-4 months",
    default_quantity: "4-10 pellets per protocol",
  },
  {
    id: "cpe-enclomiphene",
    name: "Enclomiphene Capsules",
    category: "male_hormone",
    preparation_type: "capsule",
    strength_options: ["6.25mg", "12.5mg", "25mg"],
    default_strength: "12.5mg",
    default_sig: "Take 1 capsule by mouth daily",
    default_quantity: "30 capsules",
    notes: "Fertility-preserving alternative to traditional TRT for select patients.",
  },
  {
    id: "cpe-dhea-men",
    name: "DHEA Capsules (Men)",
    category: "male_hormone",
    preparation_type: "capsule",
    strength_options: ["10mg", "25mg", "50mg", "100mg"],
    default_strength: "50mg",
    default_sig: "Take 1 capsule by mouth once daily in the morning",
    default_quantity: "30 capsules",
  },
];
// Convenience lookups
export const CUSTOM_PHARMACY_PREPARATIONS_BY_ID: Record<string, CustomPharmacyPreparation> =
  Object.fromEntries(CUSTOM_PHARMACY_PREPARATIONS.map((p) => [p.id, p]));
export function getCustomPharmacyPreparationsForCategory(
  category: CustomPharmacyCategory,
): CustomPharmacyPreparation[] {
  return CUSTOM_PHARMACY_PREPARATIONS.filter((p) => p.category === category);
}

/** Creams only — used by Provider Dashboard pharmacy order flow. */
export function getCustomPharmacyCreamPreparationsForCategory(
  category: CustomPharmacyCategory,
): CustomPharmacyPreparation[] {
  return CUSTOM_PHARMACY_PREPARATIONS.filter(
    (p) => p.category === category && p.preparation_type === "cream",
  );
}
export const CUSTOM_PHARMACY_CATEGORY_LABELS: Record<CustomPharmacyCategory, string> = {
  male_hormone: "Men's BHRT",
  female_hormone: "Women's BHRT",
};
