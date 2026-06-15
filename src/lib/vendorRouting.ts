/**
 * Vendor routing — single source of truth for who fulfills what.
 * GC Scientific = peptide sourcing partner (vetted 503A network).
 * FCC = IV, core peptides, GLP-1 backup, sexual wellness, hair.
 * Custom Pharmacy of Evans = all hormone compounds (local fax).
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
    role: "Primary peptide partner — metabolic stack & advanced peptides",
    fulfillment: "portal",
    routingNote:
      "Route metabolic stack and GC-catalog peptides through GC account manager. Confirm fulfilling 503A name + COA per batch.",
  },
  fcc: {
    slug: VENDOR_SLUGS.fcc,
    displayName: "FCC (Formulation Compounding Center)",
    supplierKey: "fcc",
    role: "IV compounds, core peptide menu, GLP-1 backup, à la carte orals",
    fulfillment: "portal",
    routingNote: "FormuConnect portal. Default for IV Lounge premix, sermorelin, NAD+, AOD, SLU, healing stack.",
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

/** GC wholesale (1+ unit tier) — cents. Source: GC Compounding Consultant price sheet 2026-06. */
export const GC_WHOLESALE_CENTS = {
  retatrutide10mg: 15000,
  retatrutide20mg: 25000,
  retatrutide40mg: 45000,
  semaglutide5mg: 8500,
  semaglutide10mg: 13500,
  tirzepatide10mg: 20000,
  tirzepatide15mg: 26000,
  ss3150mg: 4500,
  tesamorelin10mg: 6500,
  cjcIpamorelinBlend5_5: 5500,
  nadSynthetic1000mg: 8500,
  motsc10mg: 5200,
  ghkCu50mg: 5200,
  bpc157Tablets60: 6000,
  tb50010mg: 5000,
  fiveAmino1mq60x50mg: 16000,
  hcg5000iu: 3500,
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
    label: "ELEVATED Metabolic Recomposition Stack",
    category: "peptide_stack",
    primarySupplier: "gc",
    primaryCostCents: 74800,
    primaryCostUnit: "month",
    alternateSupplier: "fcc",
    alternateCostCents: 117900,
    clientPriceCents: 119900,
    fulfillmentPharmacySlug: VENDOR_SLUGS.gc,
    publicMenu: true,
    notes: "GC COGS at phased-average (~$748); FCC full-capacity model ~$1,179. Retail $1,199/mo.",
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
    gcSku: "GLP1-R-20",
    fccSku: "2484",
    publicMenu: true,
  },
  {
    itemCode: "PEPTIDE-SS31",
    label: "SS-31 (Elamipretide)",
    category: "peptide",
    primarySupplier: "gc",
    primaryCostCents: GC_WHOLESALE_CENTS.ss3150mg,
    primaryCostUnit: "vial",
    alternateSupplier: "fcc",
    alternateCostCents: FCC_WHOLESALE_CENTS.ss3180mg,
    clientPriceCents: 24900,
    fulfillmentPharmacySlug: VENDOR_SLUGS.gc,
    gcSku: "SS-31-50",
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
    primaryCostCents: GC_WHOLESALE_CENTS.cjcIpamorelinBlend5_5,
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
    primarySupplier: "fcc",
    primaryCostCents: FCC_WHOLESALE_CENTS.nad1000mg,
    primaryCostUnit: "vial",
    alternateSupplier: "gc",
    alternateCostCents: GC_WHOLESALE_CENTS.nadSynthetic1000mg,
    clientPriceCents: 19900,
    fulfillmentPharmacySlug: VENDOR_SLUGS.fcc,
    fccSku: "3119",
    publicMenu: true,
    notes: "FCC cheaper than GC on NAD+ — stay FCC.",
  },
  {
    itemCode: "PEPTIDE-AOD9604",
    label: "AOD-9604",
    category: "peptide",
    primarySupplier: "fcc",
    primaryCostCents: FCC_WHOLESALE_CENTS.aod9604Mo,
    primaryCostUnit: "month",
    clientPriceCents: 12900,
    fulfillmentPharmacySlug: VENDOR_SLUGS.fcc,
    fccSku: "3557",
    publicMenu: false,
    notes: "Metabolic stack adjunct — not on GC sheet.",
  },
  {
    itemCode: "PEPTIDE-SLU-PP332",
    label: "SLU-PP-332",
    category: "peptide",
    primarySupplier: "fcc",
    primaryCostCents: FCC_WHOLESALE_CENTS.sluPp332Mo,
    primaryCostUnit: "month",
    clientPriceCents: 9900,
    fulfillmentPharmacySlug: VENDOR_SLUGS.fcc,
    fccSku: "3819",
    publicMenu: false,
  },
  {
    itemCode: "PEPTIDE-5AMINO1MQ",
    label: "5-Amino-1MQ",
    category: "peptide",
    primarySupplier: "fcc",
    primaryCostCents: FCC_WHOLESALE_CENTS.fiveAmino1mqMo,
    primaryCostUnit: "month",
    alternateSupplier: "gc",
    alternateCostCents: GC_WHOLESALE_CENTS.fiveAmino1mq60x50mg,
    clientPriceCents: 11900,
    fulfillmentPharmacySlug: VENDOR_SLUGS.fcc,
    fccSku: "3130",
    publicMenu: false,
    notes: "FCC 30-count cheaper per month than GC 60-count.",
  },
  {
    itemCode: "PEPTIDE-SERMORELIN",
    label: "Sermorelin Injection",
    category: "peptide",
    primarySupplier: "fcc",
    primaryCostCents: FCC_WHOLESALE_CENTS.sermorelinMo,
    primaryCostUnit: "month",
    clientPriceCents: 14900,
    fulfillmentPharmacySlug: VENDOR_SLUGS.fcc,
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
    alternateSupplier: "fcc",
    alternateCostCents: 5200,
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
    case "weight_glp1":
      return VENDORS.fcc;
    case "peptides_gc":
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
