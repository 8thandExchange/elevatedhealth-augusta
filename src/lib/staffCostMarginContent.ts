/**
 * Staff Cost & Margin Reference — INTERNAL / STAFF-FACING ONLY.
 *
 * Wholesale cost basis for gross-margin analysis on the staff guide.
 * Every cost is traced to a named supplier and confidence-flagged.
 *
 * PRICING (revenue) is imported from stripeConfig via formularyCheatSheetContent —
 * never hardcoded here. This module only adds the COST column the guide was missing.
 *
 * SUPPLIER DECISIONS (locked 2026-06-28 by Troy):
 *  - Creams (T cream, Bi-Est, progesterone) ........ Custom Pharmacy of Evans
 *  - IV / injectable nutrients (NAD+, gluta, MIC,
 *    amino, vitamins) ............................... GC network (HYBRID / STLKS, 503A/503B)
 *  - TRT is CREAM-ONLY — no injectable testosterone cost line.
 *  - GLP-1 monthly cost = vial cost / months-of-supply-at-dose (physician-owned divisor).
 *
 * EXCLUDED AS COST SOURCES (do not reintroduce):
 *  - PATH: physician-use research lab, "research use only / not for human consumption,"
 *    not 503A/503B. Cheapest peptide numbers in the catalogs — and unusable. Never a cost basis.
 *  - VTLGENICS: stem cells / exosomes / Wharton's Jelly — unapproved biologics, out of scope.
 *
 * CONFIDENCE FLAGS:
 *  - "contract"  = formal sheet / catalog price
 *  - "verbal"    = quoted by phone/email, no formal sheet yet (e.g. Custom Pharmacy Dec 2025)
 *  - "estimate"  = derived (e.g. monthly = vial / supply); divisor pending physician input
 */

import {
  ELEVATED_PROGRAMS,
  GLP1_PROGRAM_VARIANTS,
  ELEVATED_COMBO_ADDONS,
} from "./stripeConfig";

export const COST_MARGIN_META = {
  classification: "INTERNAL — STAFF ONLY. Contains wholesale cost. Never shown to patients.",
  costEffectiveDate: "2026-06-28",
  reviewTrigger:
    "Re-cost when Custom Pharmacy formal sheet lands (Heather Taylor, PharmD — expected new year) " +
    "and when LabCorp client-bill costs return from Kristen.",
} as const;

export type Confidence = "contract" | "verbal" | "estimate";

export interface CostLine {
  item: string;
  supplier: string;
  unitCost: string;       // human-readable wholesale cost
  basis: string;          // what the cost covers (supply, size)
  monthlyCost: string;    // cost attributable per member-month (creams: recurs monthly)
  confidence: Confidence;
  note?: string;
}

const conf: Record<Confidence, string> = {
  contract: "Contract / catalog",
  verbal: "Verbal — pending formal sheet",
  estimate: "Estimate — see note",
};
export const confidenceLabel = (c: Confidence) => conf[c];

/* ---------------------------------------------------------------------------
 * MEMBERSHIP MEDICATION COSTS (the lines that drive program margin)
 * Revenue pulled live from stripeConfig; cost from locked supplier decisions.
 * ------------------------------------------------------------------------- */

export const MEMBERSHIP_COST_LINES: CostLine[] = [
  {
    item: "TRT — Testosterone cream (daily)",
    supplier: "Custom Pharmacy of Evans",
    unitCost: "~$50",
    basis: "Testosterone 5mg/0.2 — monthly script",
    monthlyCost: "~$50/mo",
    confidence: "verbal",
    note: "Heather Taylor PharmD verbal quote (Dec 2025). Cream-only program — NO injectable T cost line.",
  },
  {
    item: "HRT — Bi-Est cream",
    supplier: "Custom Pharmacy of Evans",
    unitCost: "~$50",
    basis: "Bi-est 2mg — monthly script",
    monthlyCost: "~$50/mo",
    confidence: "verbal",
    note: "Verbal quote $50 EACH (Bi-Est and progesterone priced separately).",
  },
  {
    item: "HRT — Progesterone",
    supplier: "Custom Pharmacy of Evans",
    unitCost: "~$50",
    basis: "Progesterone 40mg/ml — monthly script",
    monthlyCost: "~$50/mo",
    confidence: "verbal",
    note: "Verbal quote $50. Combined HRT med cost ≈ $100/mo (Bi-Est + progesterone).",
  },
  {
    item: "GLP-1 — Compounded semaglutide",
    supplier: "GC network (STLKS / KDX, 503A)",
    unitCost: "~$110 (10mg vial) – $180 (20mg vial)",
    basis: "Multi-month vial — NOT a monthly cost",
    monthlyCost: "= vial ÷ months-at-dose",
    confidence: "estimate",
    note:
      "Use ADDITIVE version (glycine/pyridoxine/B12) — plain copy-compounding is the FDA exposure. " +
      "Monthly divisor is physician-owned (Troy/Dennis); do not infer dose here.",
  },
  {
    item: "GLP-1 — Compounded tirzepatide",
    supplier: "GC network (HYBRID 503B / APRX 503B / STLKS)",
    unitCost: "~$200–$230 (50mg vial)",
    basis: "Multi-month vial — NOT a monthly cost",
    monthlyCost: "= vial ÷ months-at-dose",
    confidence: "estimate",
    note: "503B options: HYBRID $200, APRX $216. Additive (niacinamide) version. Divisor physician-owned.",
  },
  {
    item: "IV membership — 2 signature drips/mo",
    supplier: "GC network (STLKS / HYBRID)",
    unitCost: "Nutrient cost only (see IV table)",
    basis: "Base hydration + 2 drips/mo",
    monthlyCost: "Low — nutrients $10–$65/component",
    confidence: "contract",
    note: "No Rx med in IV membership. Glutathione ~$10, NAD+ 1000mg ~$65 (per-bag, not per-dose).",
  },
];

/* ---------------------------------------------------------------------------
 * GROSS-MARGIN SNAPSHOT (membership medication line only)
 * Gross = membership revenue − monthly med cost.
 * This is GROSS, before labs, RN time, physician time, Stripe fees, overhead.
 * ------------------------------------------------------------------------- */

export interface MarginRow {
  program: string;
  revenue: string;
  medCost: string;
  grossOnMed: string;
  confidence: Confidence;
  note?: string;
}

export const MEMBERSHIP_MARGIN_ROWS: MarginRow[] = [
  {
    program: ELEVATED_PROGRAMS.trt.name,
    revenue: ELEVATED_PROGRAMS.trt.displayPrice,
    medCost: "~$50/mo (cream)",
    grossOnMed: "~$199/mo",
    confidence: "verbal",
    note: "Cream-only. Strongest med-line margin of the hormone programs.",
  },
  {
    program: ELEVATED_PROGRAMS.hrt.name,
    revenue: ELEVATED_PROGRAMS.hrt.displayPrice,
    medCost: "~$100/mo (Bi-Est $50 + Prog $50)",
    grossOnMed: "~$129/mo",
    confidence: "verbal",
    note: "Two creams at $50 each — confirm against formal sheet. Lower than TRT because two compounds.",
  },
  {
    program: "ELEVATED GLP-1 · Semaglutide",
    revenue: GLP1_PROGRAM_VARIANTS.semaglutide.displayPrice,
    medCost: "vial ÷ months (physician divisor)",
    grossOnMed: "Pending dose/supply",
    confidence: "estimate",
    note: "Cannot finalize without months-of-supply-at-dose. Vial $110–$180. Additive version only.",
  },
  {
    program: "ELEVATED GLP-1 · Tirzepatide",
    revenue: GLP1_PROGRAM_VARIANTS.tirzepatide.displayPrice,
    medCost: "vial ÷ months (physician divisor)",
    grossOnMed: "Pending dose/supply",
    confidence: "estimate",
    note: "Vial $200–$230 (503B). Additive version only.",
  },
];

/* ---------------------------------------------------------------------------
 * IV / INJECTABLE NUTRIENT COST TABLE — GC network (HYBRID / STLKS)
 * Per-container wholesale cost. Per-dose cost depends on draw volume per bag.
 * ------------------------------------------------------------------------- */

export const IV_NUTRIENT_COST_ROWS: CostLine[] = [
  { item: "NAD+ 1000mg", supplier: "STLKS / KDX", unitCost: "~$65", basis: "1000mg vial", monthlyCost: "per-bag", confidence: "contract" },
  { item: "Glutathione 2000mg", supplier: "STLKS", unitCost: "~$10", basis: "2000mg / 10mL vial", monthlyCost: "per-bag", confidence: "contract", note: "Very low cost — high-margin add-on." },
  { item: "Ascorbic acid 5500mg", supplier: "STLKS", unitCost: "~$10", basis: "10mL vial", monthlyCost: "per-bag", confidence: "contract" },
  { item: "L-Carnitine 5000mg", supplier: "STLKS", unitCost: "~$10", basis: "10mL vial", monthlyCost: "per-bag", confidence: "contract" },
  { item: "Amino complex (BCAAs)", supplier: "STLKS", unitCost: "~$10", basis: "10mL vial", monthlyCost: "per-bag", confidence: "contract" },
  { item: "Lipo-C / MIC", supplier: "STLKS", unitCost: "~$25", basis: "10mL vial", monthlyCost: "per-dose", confidence: "contract" },
  { item: "MIC + B12", supplier: "STLKS", unitCost: "~$25", basis: "10mL vial", monthlyCost: "per-dose", confidence: "contract" },
  { item: "B-Complex injection", supplier: "STLKS", unitCost: "~$25", basis: "10mL vial", monthlyCost: "per-dose", confidence: "contract" },
  { item: "B12 Methylcobalamin", supplier: "STLKS", unitCost: "~$25", basis: "50,000mcg / 10mL", monthlyCost: "per-dose", confidence: "contract" },
];

/* ---------------------------------------------------------------------------
 * SEXUAL WELLNESS COST TABLE — GC network (STLKS / KDX, 503A)
 * Finally gives the "being finalized" à la carte bucket a real cost basis.
 * ------------------------------------------------------------------------- */

export const SEXUAL_WELLNESS_COST_ROWS: CostLine[] = [
  { item: "PT-141 (Bremelanotide)", supplier: "KDX / STLKS", unitCost: "~$65 (10mg vial) – $80 (nasal)", basis: "per vial / spray", monthlyCost: "per-fill", confidence: "contract" },
  { item: "Sildenafil", supplier: "STLKS", unitCost: "~$1.00/cap", basis: "50–100mg cap", monthlyCost: "per-fill", confidence: "contract" },
  { item: "Tadalafil", supplier: "STLKS", unitCost: "~$2.00–$3.00/cap", basis: "5–25mg cap", monthlyCost: "per-fill", confidence: "contract" },
  { item: "Sildenafil/Tadalafil troche", supplier: "STLKS", unitCost: "~$3.00–$4.00/unit", basis: "combo troche", monthlyCost: "per-fill", confidence: "contract" },
  { item: "Scream cream", supplier: "STLKS", unitCost: "~$35", basis: "30gm", monthlyCost: "per-fill", confidence: "contract" },
];

/* ---------------------------------------------------------------------------
 * COMPLIANCE FLAGS the staff guide must surface alongside cost
 * ------------------------------------------------------------------------- */

export const COST_COMPLIANCE_FLAGS: string[] = [
  "PATH pricing is NEVER a patient-care cost basis — research-use-only lab, not 503A/503B. Cheapest numbers in the catalog, unusable.",
  "VTLGENICS (stem cells / exosomes / Wharton's Jelly) — unapproved biologics, out of EHA scope. Not in formulary, not in this guide.",
  "GLP-1: dispense ADDITIVE compound (glycine/niacinamide/pyridoxine/B12) — plain copy-compounding of semaglutide/tirzepatide is the FDA exposure.",
  "Gray-zone peptides (BPC-157, TB-500, MOTS-C, CJC-1295, Ipamorelin) — post-Apr-2026 503A status under review. Physician-gated; not a casual add-on.",
  "Retatrutide remains physician-gated, GLP-1 lane only. A 503A partner listing it does not change the compounding analysis.",
  "Verify GA shipping before banking any GC partner price. ALMD = 28 states (verify). SPRX / HYBRID / APRX = 'licensed states' (confirm GA).",
  "All creams source from Custom Pharmacy of Evans (in-state, existing relationship). Costs are VERBAL until the formal sheet lands.",
] as const as string[];

/* ---------------------------------------------------------------------------
 * SUPPLIER DIRECTORY (staff reference — who fills what)
 * ------------------------------------------------------------------------- */

export const SUPPLIER_DIRECTORY = [
  { name: "Custom Pharmacy of Evans", type: "503A compounding (in-state)", fills: "All creams: T cream, Bi-Est, progesterone", status: "Active — verbal pricing, formal sheet pending" },
  { name: "GC network — STLKS", type: "503A pharmacy", fills: "IV nutrients, sexual wellness, sermorelin", status: "49 states — confirm GA" },
  { name: "GC network — HYBRID", type: "503B outsourcing", fills: "Injectable nutrients, GLP-1 (tirz)", status: "Licensed states — confirm GA" },
  { name: "GC network — APRX", type: "503B outsourcing", fills: "GLP-1 tirzepatide (bulk)", status: "Licensed states — confirm GA" },
  { name: "GC network — KDX", type: "503A pharmacy", fills: "GLP-1, single peptides, blends", status: "49 states — confirm GA" },
  { name: "Empower", type: "503B outsourcing", fills: "Reference-only (not selected for IV cost basis)", status: "Verified sane vs GC; GC chosen as basis" },
  { name: "PATH", type: "Physician-use research lab", fills: "EXCLUDED — research use only, never patient cost basis", status: "Do not use for pricing" },
] as const;
