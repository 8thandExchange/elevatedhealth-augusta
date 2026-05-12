// Formulation Compounding Center (FCC) — FormuConnect Q2 2026 Catalog
// Pharmacy: Formulation Compounding Center
// Address: 1511 Justin Rd #106A, Lewisville, TX 75077
// Phone: 844-946-6690 | Email: info@formulationrx.com
// Portal: https://portal.formuconnect.com/login
//
// Data source: docs/pharmacy/fcc_formuconnect_q2_2026.json
// To update: replace the JSON file and regenerate this module (or edit in place if a small change).
// Do NOT hand-edit the FCC_FORMULARY array — it's machine-derived from the JSON.
//
// Hidden SKUs are filtered from UI selection. Currently hidden:
// Retatrutide SKUs (FDA compounding prohibition, May 2026).

import catalogData from "../../docs/pharmacy/fcc_formuconnect_q2_2026.json";

export type FCCCategory =
  | "anti_aging_oral"
  | "anti_aging_injectable"
  | "topical_dermatology"
  | "hair_loss_oral"
  | "hair_loss_injectable_intradermal"
  | "hair_loss_topical"
  | "wellness"
  | "lipotropic_vitamin"
  | "hormone_oral"
  | "hormone_topical_vaginal"
  | "hormone_injectable"
  | "sexual_wellness_nasal"
  | "sexual_wellness_intracavernosal"
  | "sexual_wellness_oral_topical"
  | "weight_management_oral_sublingual"
  | "weight_management_injectable";

export interface FCCItem {
  sku: string;
  name: string;
  strength: string;
  quantity: string;
  price: number;
  category: FCCCategory;
  hidden?: boolean;
  hidden_reason?: string;
  source_note?: string;
  /** Optional UI note (legacy); not present on JSON rows. */
  notes?: string;
}

export const FCC_PORTAL_URL = "https://portal.formuconnect.com/login";

export const FCC_CATEGORY_LABELS: Record<FCCCategory, string> = {
  anti_aging_oral: "Anti-Aging — Oral Peptides",
  anti_aging_injectable: "Anti-Aging — Sterile Injectables & Nasal Sprays",
  topical_dermatology: "Anti-Aging — Topical Dermatology",
  hair_loss_oral: "Hair Loss — Oral",
  hair_loss_injectable_intradermal: "Hair Loss — Sterile Mesotherapy Intradermal",
  hair_loss_topical: "Hair Loss — Topical Solutions & Foams",
  wellness: "Wellness",
  lipotropic_vitamin: "Lipotropic / Vitamin",
  hormone_oral: "Hormone Therapy — Oral",
  hormone_topical_vaginal: "Hormone Therapy — Topical & Vaginal",
  hormone_injectable: "Hormone Therapy — Sterile Injectables",
  sexual_wellness_nasal: "Sexual Wellness — Nasal Sprays",
  sexual_wellness_intracavernosal: "Sexual Wellness — Intracavernosal Injectables",
  sexual_wellness_oral_topical: "Sexual Wellness — Oral & Topical",
  weight_management_oral_sublingual: "Weight Management — Oral & Sublingual",
  weight_management_injectable: "Weight Management — Injectable",
};

// Full catalog including hidden items (UI filters at render time).
export const FCC_FORMULARY: FCCItem[] = (catalogData as any).items as FCCItem[];

// Convenience: visible items only (UI-ready)
export const FCC_FORMULARY_VISIBLE: FCCItem[] = FCC_FORMULARY.filter((item) => !item.hidden);

// Convenience: lookup by SKU
export const FCC_SKU_LOOKUP: Record<string, FCCItem> = Object.fromEntries(
  FCC_FORMULARY.map((item) => [item.sku, item]),
);
