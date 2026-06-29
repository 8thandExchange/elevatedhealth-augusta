/**
 * Staff-only cost & margin reference — NEVER patient-facing.
 * Sources: businessOpsGuideContent, vendorRouting GC/Empower catalogs, formulary economics.
 */
import { PROGRAM_ECONOMICS_ROWS, IV_ADDON_ROWS, HORMONE_SOURCING_ROWS } from "./businessOpsGuideContent";
import { VENDORS } from "./vendorRouting";

export type CostConfidence = "confirmed" | "vendor_quote" | "estimated" | "hybrid";

export function confidenceLabel(c: CostConfidence): string {
  switch (c) {
    case "confirmed":
      return "Confirmed";
    case "vendor_quote":
      return "Vendor quote";
    case "estimated":
      return "Estimated";
    case "hybrid":
      return "HYBRID / STLKS";
    default:
      return c;
  }
}

export const COST_MARGIN_META = {
  version: "1.0.0",
  effectiveDate: "2026-06-29",
  classification:
    "STAFF ONLY — internal cost & margin reference. Never print for patients, never quote COGS at the front desk, never email or text these figures.",
  reviewTrigger:
    "Review monthly or when GC/FCC/Empower catalog updates, LabCorp fee schedule changes, or Stripe program prices change. Flag any SKU below 15% gross margin to Dennis before discounting.",
} as const;

/** Program-level gross on medication line (excludes bundled care/labs in headline margin). */
export const MEMBERSHIP_MARGIN_ROWS: readonly {
  program: string;
  revenueMo: string;
  medCostMo: string;
  grossOnMed: string;
  confidence: CostConfidence;
  note: string;
}[] = PROGRAM_ECONOMICS_ROWS.map(([program, price, med, _labs, total, gross, margin]) => ({
  program,
  revenueMo: price,
  medCostMo: med,
  grossOnMed: gross,
  confidence: program.includes("Retatrutide")
    ? ("estimated" as const)
    : program.includes("Tirzepatide")
      ? ("vendor_quote" as const)
      : ("confirmed" as const),
  note: `Product margin ${margin} (med + labs COGS ${total}) — not net after rent/staff/fees`,
}));

export const MEMBERSHIP_COST_LINES: readonly {
  item: string;
  supplier: string;
  unitCost: string;
  basis: string;
  monthly: string;
  confidence: CostConfidence;
}[] = [
  ...HORMONE_SOURCING_ROWS.map(([item, source, cost, backup]) => ({
    item,
    supplier: source,
    unitCost: cost,
    basis: "30-day fill",
    monthly: cost,
    confidence: "vendor_quote" as const,
  })),
  {
    item: "Semaglutide (program vial)",
    supplier: "GC STLKS",
    unitCost: "$107",
    basis: "10mg injectable vial / mo",
    monthly: "$107",
    confidence: "hybrid",
  },
  {
    item: "Tirzepatide (program vial)",
    supplier: "GC STLKS",
    unitCost: "$185–240",
    basis: "10mg injectable vial / mo",
    monthly: "$185–240",
    confidence: "hybrid",
  },
  {
    item: "Retatrutide (gated fill)",
    supplier: "GC PATH",
    unitCost: "$250",
    basis: "20mg fill",
    monthly: "$250",
    confidence: "estimated",
  },
  {
    item: "ELEVATED IV — 2 drips/mo",
    supplier: "FCC + supplies",
    unitCost: "~$45/bag",
    basis: "2 signature drips",
    monthly: "~$90",
    confidence: "estimated",
  },
];

/** IV injectable nutrients — GC HYBRID / STLKS network wholesale (staff routing). */
export const IV_NUTRIENT_COST_ROWS: readonly {
  nutrient: string;
  supplier: string;
  wholesale: string;
  basis: string;
  confidence: CostConfidence;
}[] = [
  ...IV_ADDON_ROWS.map(([name, cost, _price, _margin]) => ({
    nutrient: name,
    supplier: name.includes("NAD") ? "GC STLKS" : "HYBRID premix / McKesson",
    wholesale: cost,
    basis: "Per push / dose",
    confidence: (name.includes("NAD") ? "hybrid" : "estimated") as CostConfidence,
  })),
  {
    nutrient: "Myers premix bag",
    supplier: "FCC",
    wholesale: "$45",
    basis: "503A premix bag",
    confidence: "vendor_quote",
  },
  {
    nutrient: "Saline + B-complex base",
    supplier: "McKesson / Henry Schein",
    wholesale: "varies",
    basis: "Per drip build",
    confidence: "estimated",
  },
];

/** Sexual wellness — GC 503A network (launch-hidden storefront). */
export const SEXUAL_WELLNESS_COST_ROWS: readonly {
  product: string;
  supplier: string;
  wholesale: string;
  basis: string;
  confidence: CostConfidence;
}[] = [
  {
    product: "PT-141 (Bremelanotide)",
    supplier: "GC PATH",
    wholesale: "$49",
    basis: "10mg vial",
    confidence: "hybrid",
  },
  {
    product: "Oxytocin nasal",
    supplier: "Empower 503A",
    wholesale: "$77",
    basis: "10mL spray",
    confidence: "vendor_quote",
  },
  {
    product: "Tadalafil (monthly)",
    supplier: "Empower 503A",
    wholesale: "catalog",
    basis: "30-day supply",
    confidence: "vendor_quote",
  },
  {
    product: "Sildenafil (monthly)",
    supplier: "Empower 503A",
    wholesale: "catalog",
    basis: "30-day supply",
    confidence: "vendor_quote",
  },
];

export const SUPPLIER_DIRECTORY: readonly {
  supplier: string;
  type: string;
  fills: string;
  status: string;
}[] = [
  {
    supplier: VENDORS.gc.displayName,
    type: "503A network (PATH + STLKS)",
    fills: "GLP-1 injectable · recovery/metabolic peptides · PT-141 · IV STLKS vials",
    status: "Primary peptides + GLP-1",
  },
  {
    supplier: VENDORS.fcc.displayName,
    type: "503A",
    fills: "IV Myers premix · legacy peptide backup",
    status: "Backup / IV premix",
  },
  {
    supplier: VENDORS.customPharmacy.displayName,
    type: "503A local",
    fills: "BHRT/TRT creams · progesterone caps",
    status: "Primary hormones",
  },
  {
    supplier: VENDORS.empower.displayName,
    type: "503A PCAB backup",
    fills: "Hormone creams · GLP-1 ODT · sexual wellness · NAD+ (not recovery peptides)",
    status: "Backup — no BPC/TB/SS-31",
  },
  {
    supplier: VENDORS.drfirst.displayName,
    type: "Retail eRx",
    fills: "FDA-approved patches/gels when patient prefers retail",
    status: "Patient preference path",
  },
  {
    supplier: "LabCorp",
    type: "Lab billing",
    fills: "All in-office draws — client billing account",
    status: "Pending full activation",
  },
  {
    supplier: "McKesson / Henry Schein",
    type: "Wholesale supplies",
    fills: "IV supplies · syringes · clinic consumables",
    status: "Active",
  },
];

export const COST_COMPLIANCE_FLAGS: readonly string[] = [
  "Never quote wholesale COGS, margin %, or supplier names to patients.",
  "Retatrutide: physician-gated only — full GLP-1 investigational consent; do not advertise.",
  "Cat 2 research peptides (BPC-157, TB-500, CJC/Ipamorelin, etc.): Research Peptide Consent required.",
  "Empower does NOT carry recovery/metabolic peptides — route BPC/TB/SS-31 through GC/PATH only.",
  "Do not discount any SKU below 15% gross margin without Dennis + physician approval.",
  "Margins shown are product margins — not take-home profit after staff time, rent, and payment fees.",
  "If GC or FCC discontinues a compound, notify affected patients and update this sheet.",
];
