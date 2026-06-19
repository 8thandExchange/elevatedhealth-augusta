/**
 * Vendor routing — single source of truth for who fulfills what.
 * GC Scientific = peptide + GLP-1 sourcing partner (PATH lyophilized + STLKS 503A injectables).
 * FCC = IV premix backup, legacy peptide backup.
 * Custom Pharmacy of Evans = all hormone compounds (local fax; GC STLKS available as backup).
 * DrFirst Rcopia = FDA-approved retail patches/gels when patient prefers.
 */

export const VENDOR_SLUGS = {
  gc: "gc-scientific-network",
  fcc: "fcc",
  customPharmacyEvans: "custom-pharmacy-evans",
  drfirst: "drfirst-rcopia",
  henrySchein: "henry-schein",
  labcorp: "labcorp",
} as const;

export type VendorSlug = (typeof VENDOR_SLUGS)[keyof typeof VENDOR_SLUGS];

export type FormularySupplier =
  | "gc"
  | "fcc"
  | "custom_pharmacy_evans"
  | "drfirst"
  | "henry_schein"
  | "empower"
  | "stericycle"
  | "labcorp"
  | "other";

export interface VendorProfile {
  slug: VendorSlug | string;
  displayName: string;
  supplierKey: FormularySupplier;
  role: string;
  fulfillment: "fax" | "portal" | "retail_eprescribe" | "wholesale_supply" | "lab_billing";
  /** Staff-facing routing note */
  routingNote: string;
}

export const VENDORS: Record<string, VendorProfile> = {
  gc: {
    slug: VENDOR_SLUGS.gc,
    displayName: "GC Scientific (503A network)",
    supplierKey: "gc",
    role: "Primary — metabolic stack, GLP-1, named peptide stacks (PATH + STLKS network)",
    fulfillment: "portal",
    routingNote:
      "Route via GC account (contact@gccompounds.com). PATH for lyophilized peptides; STLKS for injectable GLP-1/hormones/IV vials. Confirm fulfilling 503A + COA per batch.",
  },
  fcc: {
    slug: VENDOR_SLUGS.fcc,
    displayName: "FCC (Formulation Compounding Center)",
    supplierKey: "fcc",
    role: "Backup — IV Myers premix, legacy peptide SKUs if GC unavailable",
    fulfillment: "portal",
    routingNote: "FormuConnect portal. Use when GC line is backordered or for FCC-only IV premix bags.",
  },
  customPharmacy: {
    slug: VENDOR_SLUGS.customPharmacyEvans,
    displayName: "Custom Pharmacy of Evans",
    supplierKey: "custom_pharmacy_evans",
    role: "All BHRT/TRT — creams, injectables, capsules, pellets",
    fulfillment: "fax",
    routingNote: "Default fax destination for hormone Rx. Local pickup available.",
  },
  drfirst: {
    slug: VENDOR_SLUGS.drfirst,
    displayName: "DrFirst Rcopia (retail)",
    supplierKey: "drfirst",
    role: "FDA-approved patches, gels, brand TRT when patient prefers retail",
    fulfillment: "retail_eprescribe",
    routingNote: "Use when patient wants Vivelle/Climara/AndroGel instead of compound.",
  },
};

/** GC wholesale — cents. Source: GC Compound Consulting Partner Catalog 2026-05-23 (PATH + STLKS). */
export const GC_WHOLESALE_CENTS = {
  retatrutide10mg: 13000,
  retatrutide20mg: 22000,
  retatrutide40mg: 33000,
  semaglutide10mg: 10700,
  semaglutide10mgInjectable: 11000,
  tirzepatide10mg: 6000,
  tirzepatide10mgInjectable: 7500,
  ss3110mg: 5000,
  ss3150mg: 15000,
  tesamorelin10mg: 7200,
  cjcIpamorelinBlend10_10: 7900,
  wolverineBlend10_10: 9400,
  pt14110mg: 4900,
  nadLyophilized1000mg: 6800,
  nadInjectable1000mg: 6500,
  sermorelin10mg: 6500,
  motsc10mg: 6000,
  ghkCu50mg: 4600,
  bpc15710mg: 6600,
  tb50010mg: 6600,
  aod9604HalfMg: 6500,
  sluPp3325mg: 6000,
  fiveAmino1mq50mg: 22000,
  hcg10000iu: 7500,
  testCyp10ml: 4000,
} as const;

/** FCC catalog reference costs (cents) — mirrors FormuConnect Q2 2026 / metabolic migration. */
export const FCC_WHOLESALE_CENTS = {
  retatrutide10mg3ml: 35000,
  ss3180mg: 18500,
  tesamorelin30mg: 32500,
  nad1000mg: 7000,
  cjcIpamorelinMo: 9000,
  aod9604Mo: 9000,
  sluPp332Mo: 6000,
  fiveAmino1mqMo: 9600,
  sermorelinMo: 3800,
} as const;

export type EconomicsLineKey = keyof typeof GC_WHOLESALE_CENTS | keyof typeof FCC_WHOLESALE_CENTS | string;

export interface FormularyEconomicsLine {
  itemCode: string;
  label: string;
  category: "peptide_stack" | "glp1" | "peptide" | "hormone" | "iv_additive" | "program";
  primarySupplier: FormularySupplier;
  primaryCostCents: number;
  primaryCostUnit: string;
  alternateSupplier?: FormularySupplier;
  alternateCostCents?: number;
  clientPriceCents: number;
  fulfillmentPharmacySlug: string;
  gcSku?: string;
  fccSku?: string;
  /** Estimated monthly units at full protocol dose (for stack rollups). */
  monthlyUnitsAtCapacity?: number;
  publicMenu: boolean;
  notes?: string;
}

/** Backend catalog for margin analysis — sync to clinic_formulary via migration. */
export const FORMULARY_ECONOMICS_CATALOG: FormularyEconomicsLine[] = [
  {
    itemCode: "STACK-METABOLIC-FULL",
    label: "ELEVATED Metabolic (tirzepatide-anchored)",
    category: "peptide_stack",
    primarySupplier: "gc",
    primaryCostCents: 30500,
    primaryCostUnit: "month",
    alternateSupplier: "fcc",
    alternateCostCents: 36000,
    clientPriceCents: 59900,
    fulfillmentPharmacySlug: VENDOR_SLUGS.gc,
    publicMenu: true,
    notes: "Re-modeled 2026-06-19 for the $599/mo ELEVATED Metabolic program (tirzepatide anchor ~$185 + lean-mass/metabolic support). Replaced the retired $1,199 retatrutide stack. COGS is a modeled estimate — confirm final program composition with the clinic.",
  },
  {
    itemCode: "GLP1-SEMAGLUTIDE",
    label: "Semaglutide (program fill)",
    category: "glp1",
    primarySupplier: "gc",
    primaryCostCents: GC_WHOLESALE_CENTS.semaglutide10mgInjectable,
    primaryCostUnit: "10mg vial",
    alternateSupplier: "fcc",
    alternateCostCents: 11000,
    clientPriceCents: 0,
    fulfillmentPharmacySlug: VENDOR_SLUGS.gc,
    gcSku: "STLKS-Sema-10mg",
    publicMenu: false,
    notes: "Included in ELEVATED GLP-1. STLKS injectable primary.",
  },
  {
    itemCode: "GLP1-TIRZEPATIDE",
    label: "Tirzepatide (program fill)",
    category: "glp1",
    primarySupplier: "gc",
    primaryCostCents: GC_WHOLESALE_CENTS.tirzepatide10mgInjectable,
    primaryCostUnit: "10mg vial",
    alternateSupplier: "fcc",
    alternateCostCents: 20000,
    clientPriceCents: 0,
    fulfillmentPharmacySlug: VENDOR_SLUGS.gc,
    gcSku: "STLKS-Tirz-10mg",
    publicMenu: false,
    notes: "Included in ELEVATED GLP-1. STLKS injectable primary.",
  },
  {
    itemCode: "PEPTIDE-HEALING-STACK",
    label: "BPC-157 / TB-500 recovery stack",
    category: "peptide_stack",
    primarySupplier: "gc",
    primaryCostCents: GC_WHOLESALE_CENTS.wolverineBlend10_10,
    primaryCostUnit: "vial",
    alternateSupplier: "fcc",
    alternateCostCents: 18000,
    clientPriceCents: 24900,
    fulfillmentPharmacySlug: VENDOR_SLUGS.gc,
    gcSku: "PATH-Wolverine-10x10",
    publicMenu: true,
    notes: "PATH pre-blended recovery stack. Member $199/mo via 20% discount on $249.",
  },
  {
    itemCode: "PEPTIDE-RETATRUTIDE",
    label: "Retatrutide fill",
    category: "glp1",
    primarySupplier: "gc",
    primaryCostCents: GC_WHOLESALE_CENTS.retatrutide20mg,
    primaryCostUnit: "fill",
    alternateSupplier: "fcc",
    alternateCostCents: FCC_WHOLESALE_CENTS.retatrutide10mg3ml,
    clientPriceCents: 44900,
    fulfillmentPharmacySlug: VENDOR_SLUGS.gc,
    gcSku: "RETATRUTIDE-20MG-03ML",
    fccSku: "2484",
    publicMenu: true,
  },
  {
    itemCode: "PEPTIDE-SS31",
    label: "SS-31 (Elamipretide)",
    category: "peptide",
    primarySupplier: "gc",
    primaryCostCents: GC_WHOLESALE_CENTS.ss3110mg,
    primaryCostUnit: "vial",
    alternateSupplier: "fcc",
    alternateCostCents: FCC_WHOLESALE_CENTS.ss3180mg,
    clientPriceCents: 24900,
    fulfillmentPharmacySlug: VENDOR_SLUGS.gc,
    gcSku: "SS31-10MG-03ML",
    fccSku: "3811",
    monthlyUnitsAtCapacity: 3,
    publicMenu: true,
  },
  {
    itemCode: "PEPTIDE-TESAMORELIN",
    label: "Tesamorelin",
    category: "peptide",
    primarySupplier: "gc",
    primaryCostCents: GC_WHOLESALE_CENTS.tesamorelin10mg,
    primaryCostUnit: "vial",
    alternateSupplier: "fcc",
    alternateCostCents: FCC_WHOLESALE_CENTS.tesamorelin30mg,
    clientPriceCents: 39900,
    fulfillmentPharmacySlug: VENDOR_SLUGS.gc,
    gcSku: "TES-10",
    fccSku: "2897",
    monthlyUnitsAtCapacity: 2,
    publicMenu: true,
  },
  {
    itemCode: "PEPTIDE-CJC-IPAM",
    label: "CJC-1295 / Ipamorelin",
    category: "peptide",
    primarySupplier: "gc",
    primaryCostCents: GC_WHOLESALE_CENTS.cjcIpamorelinBlend10_10,
    primaryCostUnit: "vial",
    alternateSupplier: "fcc",
    alternateCostCents: FCC_WHOLESALE_CENTS.cjcIpamorelinMo,
    clientPriceCents: 17900,
    fulfillmentPharmacySlug: VENDOR_SLUGS.gc,
    publicMenu: true,
  },
  {
    itemCode: "PEPTIDE-MOTSC",
    label: "MOTS-c",
    category: "peptide",
    primarySupplier: "gc",
    primaryCostCents: GC_WHOLESALE_CENTS.motsc10mg,
    primaryCostUnit: "vial",
    clientPriceCents: 0,
    fulfillmentPharmacySlug: VENDOR_SLUGS.gc,
    gcSku: "MOTS-c-10",
    publicMenu: false,
    notes: "Staff escalation only — not FCC. Optional Phase 2 vs SS-31+NAD+.",
  },
  {
    itemCode: "PEPTIDE-NAD-INJ",
    label: "NAD+ Injection",
    category: "peptide",
    primarySupplier: "gc",
    primaryCostCents: GC_WHOLESALE_CENTS.nadInjectable1000mg,
    primaryCostUnit: "vial",
    alternateSupplier: "fcc",
    alternateCostCents: FCC_WHOLESALE_CENTS.nad1000mg,
    clientPriceCents: 19900,
    fulfillmentPharmacySlug: VENDOR_SLUGS.gc,
    gcSku: "STLKS-NAD-1000mg",
    fccSku: "3119",
    publicMenu: true,
    notes: "STLKS injectable NAD+ primary per GC catalog 2026-05.",
  },
  {
    itemCode: "PEPTIDE-AOD9604",
    label: "AOD-9604",
    category: "peptide",
    primarySupplier: "gc",
    primaryCostCents: GC_WHOLESALE_CENTS.aod9604HalfMg,
    primaryCostUnit: "vial",
    alternateSupplier: "fcc",
    alternateCostCents: FCC_WHOLESALE_CENTS.aod9604Mo,
    clientPriceCents: 12900,
    fulfillmentPharmacySlug: VENDOR_SLUGS.gc,
    gcSku: "AOD9604-05MG-03ML",
    fccSku: "3557",
    publicMenu: false,
    notes: "Metabolic stack adjunct — PATH primary.",
  },
  {
    itemCode: "PEPTIDE-SLU-PP332",
    label: "SLU-PP-332",
    category: "peptide",
    primarySupplier: "gc",
    primaryCostCents: GC_WHOLESALE_CENTS.sluPp3325mg,
    primaryCostUnit: "vial",
    alternateSupplier: "fcc",
    alternateCostCents: FCC_WHOLESALE_CENTS.sluPp332Mo,
    clientPriceCents: 9900,
    fulfillmentPharmacySlug: VENDOR_SLUGS.gc,
    gcSku: "SLU-PP-332-5MG-3ML",
    fccSku: "3819",
    publicMenu: false,
  },
  {
    itemCode: "PEPTIDE-5AMINO1MQ",
    label: "5-Amino-1MQ",
    category: "peptide",
    primarySupplier: "gc",
    primaryCostCents: GC_WHOLESALE_CENTS.fiveAmino1mq50mg,
    primaryCostUnit: "vial",
    alternateSupplier: "fcc",
    alternateCostCents: FCC_WHOLESALE_CENTS.fiveAmino1mqMo,
    clientPriceCents: 11900,
    fulfillmentPharmacySlug: VENDOR_SLUGS.gc,
    gcSku: "5AMINO1MQ-50MG-03ML",
    fccSku: "3130",
    publicMenu: false,
  },
  {
    itemCode: "PEPTIDE-SERMORELIN",
    label: "Sermorelin Injection",
    category: "peptide",
    primarySupplier: "gc",
    primaryCostCents: GC_WHOLESALE_CENTS.sermorelin10mg,
    primaryCostUnit: "vial",
    alternateSupplier: "fcc",
    alternateCostCents: FCC_WHOLESALE_CENTS.sermorelinMo,
    clientPriceCents: 14900,
    fulfillmentPharmacySlug: VENDOR_SLUGS.gc,
    gcSku: "SERMORELIN-10MG-03ML",
    fccSku: "2884",
    publicMenu: true,
  },
  {
    itemCode: "HORM-BI-EST-CREAM",
    label: "Bi-Est cream (women)",
    category: "hormone",
    primarySupplier: "custom_pharmacy_evans",
    primaryCostCents: 2700,
    primaryCostUnit: "30g",
    clientPriceCents: 0,
    fulfillmentPharmacySlug: VENDOR_SLUGS.customPharmacyEvans,
    publicMenu: false,
    notes: "Included in ELEVATED HRT. Est. Custom Pharmacy COGS.",
  },
  {
    itemCode: "HORM-PROG-CAPS",
    label: "Progesterone capsules",
    category: "hormone",
    primarySupplier: "custom_pharmacy_evans",
    primaryCostCents: 3500,
    primaryCostUnit: "30 caps",
    clientPriceCents: 0,
    fulfillmentPharmacySlug: VENDOR_SLUGS.customPharmacyEvans,
    publicMenu: false,
    notes: "Oral micronized at bedtime — default, not prog cream.",
  },
  {
    itemCode: "HORM-TEST-CYP",
    label: "Testosterone cypionate (men)",
    category: "hormone",
    primarySupplier: "custom_pharmacy_evans",
    primaryCostCents: 4200,
    primaryCostUnit: "10mL vial",
    alternateSupplier: "gc",
    alternateCostCents: GC_WHOLESALE_CENTS.testCyp10ml,
    clientPriceCents: 0,
    fulfillmentPharmacySlug: VENDOR_SLUGS.customPharmacyEvans,
    publicMenu: false,
    notes: "Injectable default for TRT. Included in ELEVATED TRT.",
  },
  {
    itemCode: "IV-MYERS",
    label: "Myers Cocktail premix",
    category: "iv_additive",
    primarySupplier: "fcc",
    primaryCostCents: 4500,
    primaryCostUnit: "bag",
    clientPriceCents: 18500,
    fulfillmentPharmacySlug: VENDOR_SLUGS.fcc,
    publicMenu: true,
  },
];

export type ServiceLane = "iv_lounge" | "hormones" | "peptides_gc" | "peptides_fcc" | "weight_glp1" | "labs" | "supplies";

export function resolveVendorForLane(lane: ServiceLane): VendorProfile {
  switch (lane) {
    case "iv_lounge":
    case "peptides_fcc":
      return VENDORS.fcc;
    case "peptides_gc":
    case "weight_glp1":
      return VENDORS.gc;
    case "hormones":
      return VENDORS.customPharmacy;
    case "labs":
      return {
        slug: VENDOR_SLUGS.labcorp,
        displayName: "LabCorp",
        supplierKey: "labcorp",
        role: "In-office blood draws",
        fulfillment: "lab_billing",
        routingNote: "Client billing account.",
      };
    case "supplies":
      return {
        slug: VENDOR_SLUGS.henrySchein,
        displayName: "Henry Schein",
        supplierKey: "henry_schein",
        role: "IV supplies, syringes, clinic consumables",
        fulfillment: "wholesale_supply",
        routingNote: "Not compounded medications.",
      };
  }
}

export function resolvePharmacySlugForItemCode(itemCode: string): string {
  const line = FORMULARY_ECONOMICS_CATALOG.find((l) => l.itemCode === itemCode);
  if (line) return line.fulfillmentPharmacySlug;
  if (itemCode.startsWith("HORM-")) return VENDOR_SLUGS.customPharmacyEvans;
  if (itemCode.startsWith("IV-")) return VENDOR_SLUGS.fcc;
  if (itemCode.startsWith("STACK-METABOLIC") || itemCode.startsWith("PEPTIDE-RETATRUTIDE"))
    return VENDOR_SLUGS.gc;
  return VENDOR_SLUGS.fcc;
}

export function resolvePharmacySlugForSupplier(supplier: FormularySupplier): string {
  switch (supplier) {
    case "gc":
      return VENDOR_SLUGS.gc;
    case "custom_pharmacy_evans":
      return VENDOR_SLUGS.customPharmacyEvans;
    case "fcc":
    default:
      return VENDOR_SLUGS.fcc;
  }
}
