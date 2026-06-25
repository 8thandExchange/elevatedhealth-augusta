/**
 * Simplified public menu vs staff escalation — how boutique clinics reduce choice overload.
 *
 * Industry pattern (Tactus, local med-spas, DTC hormone clinics):
 * - 4 program memberships, not 40 à la carte SKUs on the homepage
 * - One default delivery route per sex (cream women / inject men)
 * - Named peptide stacks (3–4), not full FCC catalog
 * - IV menu capped at ~5 drips + pushes
 * - Everything else: "discuss with your physician" / staff escalation
 */

export interface PublicMenuItem {
  id: string;
  label: string;
  priceDisplay: string;
  vendor: "gc" | "fcc" | "custom_pharmacy_evans" | "mixed";
  notes?: string;
}

export interface MenuTier {
  id: string;
  title: string;
  description: string;
  items: PublicMenuItem[];
}

/** What patients see on storefronts and should be quoted first. */
export const PUBLIC_MENU: MenuTier[] = [
  {
    id: "programs",
    title: "ELEVATED programs (lead with these)",
    description: "All-inclusive monthly — medication when prescribed in-program, RN check-ins, quarterly labs, messaging.",
    items: [
      { id: "trt", label: "ELEVATED TRT", priceDisplay: "$249/mo", vendor: "custom_pharmacy_evans" },
      { id: "hrt", label: "ELEVATED HRT", priceDisplay: "$229/mo", vendor: "custom_pharmacy_evans" },
      { id: "glp1", label: "ELEVATED GLP-1", priceDisplay: "$349–$449/mo", vendor: "gc" },
      { id: "wellness", label: "ELEVATED IV", priceDisplay: "$199/mo", vendor: "mixed" },
    ],
  },
  {
    id: "iv",
    title: "IV Lounge (walk-in)",
    description: "Five signature drips + six pushes. Custom build from menu add-ons only.",
    items: [
      { id: "myers", label: "Myers / Meyers-style drip", priceDisplay: "from $159–185", vendor: "fcc" },
      { id: "pushes", label: "Glutathione, B12, Vit C, Toradol, Zofran, NAD+ booster push", priceDisplay: "$25–50 each", vendor: "fcc" },
    ],
  },
  {
    id: "peptide-stacks",
    title: "Named peptide stacks (not à la carte catalog)",
    description: "Three named stacks. Do not recite full peptide list to prospects.",
    items: [
      { id: "restore", label: "Restore (PT-141 weekly)", priceDisplay: "$129–179/mo", vendor: "gc" },
      { id: "healing", label: "BPC-157 / TB-500 recovery stack", priceDisplay: "$249–329/mo", vendor: "gc" },
      { id: "vitality", label: "Vitality (Sermorelin + NAD+)", priceDisplay: "$299–399/mo", vendor: "gc" },
    ],
  },
  {
    id: "hormones-defaults",
    title: "Hormone defaults (one path per sex)",
    description: "Quote the standard protocol; offer escalations only when patient asks or clinically needed.",
    items: [
      {
        id: "bhrt-default",
        label: "Women: Bi-Est cream + progesterone capsules",
        priceDisplay: "via ELEVATED HRT",
        vendor: "custom_pharmacy_evans",
      },
      {
        id: "trt-default",
        label: "Men: Testosterone cypionate weekly injection",
        priceDisplay: "via ELEVATED TRT",
        vendor: "custom_pharmacy_evans",
      },
    ],
  },
];

/** Staff-only — available but not marketed. Reduces patient paralysis. */
export const STAFF_ESCALATION_MENU: PublicMenuItem[] = [
  { id: "pellets", label: "Hormone pellets (men/women)", priceDisplay: "Quote at consult", vendor: "custom_pharmacy_evans" },
  { id: "trt-cream", label: "Men's testosterone cream", priceDisplay: "À la carte / program", vendor: "custom_pharmacy_evans" },
  { id: "enclomiphene", label: "Enclomiphene (fertility-sparing)", priceDisplay: "Physician-directed", vendor: "custom_pharmacy_evans" },
  { id: "fda-patch", label: "FDA patches/gels", priceDisplay: "DrFirst → retail", vendor: "custom_pharmacy_evans", notes: "Via DrFirst Rcopia" },
  { id: "motsc", label: "MOTS-c", priceDisplay: "GC only — research consent", vendor: "gc" },
  { id: "peptide-alacarte", label: "Individual peptides (CJC, tesamorelin, GHK, etc.)", priceDisplay: "See cheatsheet", vendor: "mixed" },
  { id: "sexual-wellness", label: "Sexual wellness SKUs", priceDisplay: "Launch-hidden", vendor: "fcc" },
  { id: "hair", label: "Hair restoration SKUs", priceDisplay: "Launch-hidden", vendor: "fcc" },
];

export const MENU_SIMPLIFICATION_RATIONALE = [
  "Prospects convert on programs, not SKUs — lead with ELEVATED tiers.",
  "One default hormone route per sex reduces 'which cream vs shot vs pellet?' at intake.",
  "GC handles advanced/metabolic peptides and GLP-1 via PATH/STLKS network; FCC remains IV premix backup; Custom Pharmacy Evans for local hormone fax.",
  "Full FCC catalog (~780 SKUs) stays in Formulary for ops — never print it for front desk.",
];

export function publicMenuItemCount(): number {
  return PUBLIC_MENU.reduce((n, tier) => n + tier.items.length, 0);
}
