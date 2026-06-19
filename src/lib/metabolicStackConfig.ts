/**
 * ELEVATED Metabolic Recomposition Stack — single source of truth.
 * Phased 90-day protocol anchored on compounded retatrutide (policy override 2026-06-14, Dr. Akers).
 */

import { MEDICATION_FILLS } from "./stripeConfig";
import { GC_WHOLESALE_CENTS } from "./vendorRouting";
import { metabolicStackEconomics } from "./formularyEconomics";

export type StackTier = "S" | "A" | "B" | "F";

export interface StackCompound {
  key: string;
  name: string;
  tier: StackTier;
  mechanism: string;
  fccSku?: string;
  supplierCostCents?: number;
  /** Catalog key in pricing.ts CATALOG (when sold à la carte). */
  catalogKey?: string;
  /** Staff/internal titration reference — not rendered on public storefronts. */
  dosingSummary: string;
}

export interface StackPhase {
  id: string;
  label: string;
  weeks: string;
  compounds: string[];
  clinicalNotes: string;
}

/** Sold program price — ELEVATED Metabolic (tirzepatide-anchored). Stripe price ID in stripeConfig. */
export const METABOLIC_STACK_PRICE_CENTS = 59900;
export const METABOLIC_STACK_DISPLAY = "$599/mo";

/** Catalog keys summed for à la carte comparison at full stack capacity. */
export const STACK_ALACARTE_CATALOG_KEYS = [
  "retatrutide",
  "ss31",
  "nadInjection",
  "cjc1295Ipamorelin",
  "tesamorelin",
  "aod9604",
  "sluPp332",
  "fiveAmino1mq",
] as const;

const NAD_INJECTION_WHOLESALE_CENTS = 7000;
const CJC_WHOLESALE_CENTS = GC_WHOLESALE_CENTS.cjcIpamorelinBlend10_10;

export const METABOLIC_STACK_COMPOUNDS: StackCompound[] = [
  {
    key: "retatrutide",
    name: "Compounded Retatrutide",
    tier: "S",
    mechanism: "Triple GLP-1 / GIP / glucagon agonist — appetite, insulin sensitivity, active fat oxidation",
    fccSku: "2484",
    supplierCostCents: GC_WHOLESALE_CENTS.retatrutide20mg,
    catalogKey: "retatrutide",
    dosingSummary: "Start 0.5 mg subQ weekly; titrate slowly to 3–4 mg over 6–8 weeks per tolerance",
  },
  {
    key: "tesamorelin",
    name: "Tesamorelin",
    tier: "S",
    mechanism: "GHRH analog — visceral fat targeting, lean mass support",
    fccSku: "2897",
    supplierCostCents: GC_WHOLESALE_CENTS.tesamorelin10mg,
    catalogKey: "tesamorelin",
    dosingSummary: "0.5–1 mg subQ, 5 nights/week before bed",
  },
  {
    key: "cjc1295Ipamorelin",
    name: "CJC-1295 / Ipamorelin",
    tier: "A",
    mechanism: "Combined GHRH + GHRP pulse — recovery, sleep, lean mass during deficit",
    catalogKey: "cjc1295Ipamorelin",
    dosingSummary: "200–400 mcg CJC + 100–300 mcg Ipamorelin subQ together, 5 nights/week",
  },
  {
    key: "ss31",
    name: "SS-31 (Elamipretide)",
    tier: "A",
    mechanism: "Mitochondrial membrane support — metabolic efficiency under GLP demand",
    fccSku: "3811",
    supplierCostCents: GC_WHOLESALE_CENTS.ss3110mg,
    catalogKey: "ss31",
    dosingSummary: "5–10 mg subQ daily (taper to maintenance per protocol)",
  },
  {
    key: "nadInjection",
    name: "NAD+ Injection",
    tier: "A",
    mechanism: "Cellular energy cofactor — complements mitochondrial optimization",
    catalogKey: "nadInjection",
    dosingSummary: "SubQ per protocol; aligns with Vitality stack NAD+ dosing",
  },
  {
    key: "tirzepatide",
    name: "Compounded Tirzepatide",
    tier: "B",
    mechanism: "Dual GLP-1/GIP — alternative anchor if retatrutide not tolerated",
    catalogKey: "tirzepatide",
    dosingSummary: "2.5 mg weekly titration pathway per GLP-1 protocol",
  },
  {
    key: "aod9604",
    name: "AOD-9604",
    tier: "B",
    mechanism: "Lipolytic GH fragment — stack adjunct, fasted morning dosing",
    fccSku: "3557",
    supplierCostCents: 9000,
    catalogKey: "aod9604",
    dosingSummary: "300–500 mcg subQ, 5 days/week, fasted AM",
  },
  {
    key: "sluPp332",
    name: "SLU-PP-332",
    tier: "B",
    mechanism: "ERR exercise-mimetic — early-adopter research compound",
    fccSku: "3819",
    supplierCostCents: 6000,
    catalogKey: "sluPp332",
    dosingSummary: "200–400 mcg oral or subQ per pharmacy formulation",
  },
  {
    key: "fiveAmino1mq",
    name: "5-Amino-1MQ",
    tier: "B",
    mechanism: "NNMT inhibitor — adipose metabolic brake release",
    fccSku: "3129",
    supplierCostCents: 7900,
    catalogKey: "fiveAmino1mq",
    dosingSummary: "50–100 mg oral 1–2× daily when clinically indicated",
  },
  {
    key: "semaglutide",
    name: "Compounded Semaglutide",
    tier: "F",
    mechanism: "Single GLP-1 agonist — budget/obesity pathway only; superseded by dual/triple agonists",
    catalogKey: "semaglutide",
    dosingSummary: "Standard semaglutide titration if clinically indicated",
  },
];

export const METABOLIC_STACK_MOTSC_NOTE =
  "MOTS-c is not currently available from our 503A pharmacy partner. Phase 2 uses SS-31 + NAD+ for mitochondrial support instead.";

export const METABOLIC_STACK_PHASES: StackPhase[] = [
  {
    id: "anchor",
    label: "Phase 1 — Anchor",
    weeks: "Weeks 1–8",
    compounds: ["retatrutide"],
    clinicalNotes:
      "Establish retatrutide at the lowest effective dose. No heroics in week one — titrate weekly based on GI tolerance, glucose, and weight trend.",
  },
  {
    id: "mitochondria",
    label: "Phase 2 — Mitochondrial foundation",
    weeks: "Weeks 2–8",
    compounds: ["ss31", "nadInjection"],
    clinicalNotes:
      "Add SS-31 and NAD+ once retatrutide is tolerated. Supports cellular energy demand during aggressive fat loss.",
  },
  {
    id: "gh",
    label: "Phase 3 — Lean mass & visceral fat",
    weeks: "Weeks 8–12",
    compounds: ["cjc1295Ipamorelin", "tesamorelin"],
    clinicalNotes:
      "Muscle protection becomes priority in sustained deficit. Tesamorelin targets visceral depot; CJC/Ipamorelin broad GH optimization.",
  },
  {
    id: "experimental",
    label: "Phase 4 — Optional adjuncts",
    weeks: "Week 8+ (optional)",
    compounds: ["aod9604", "sluPp332", "fiveAmino1mq"],
    clinicalNotes:
      "Physician-directed add-ons for plateau or exit-phase support. Research-peptide and off-label consents as applicable.",
  },
];

export const METABOLIC_STACK_LABS = [
  {
    when: "Baseline (before Phase 1)",
    panel: "Expanded Panel ($299 — weight/metabolic markers)",
    slug: "weight-optimization",
  },
  { when: "Week 4", panel: "CMP safety check (provider discretion)", slug: null },
  { when: "Quarterly", panel: "Expanded Panel (included in program)", slug: "weight-optimization" },
  { when: "Week 12", panel: "Expanded Panel repeat + body comp review", slug: "weight-optimization" },
];

export function metabolicStackWholesaleCentsFull(): number {
  return metabolicStackEconomics().gcModeledCogsCents;
}

export function metabolicStackWholesaleCentsFcc(): number {
  return metabolicStackEconomics().fccModeledCogsCents;
}

export function metabolicStackMarginPct(): number {
  const wholesale = metabolicStackWholesaleCentsFull();
  if (METABOLIC_STACK_PRICE_CENTS <= 0) return 0;
  return Math.round(((METABOLIC_STACK_PRICE_CENTS - wholesale) / METABOLIC_STACK_PRICE_CENTS) * 100);
}

export const RETATRUTIDE_FILL_CENTS = MEDICATION_FILLS.retatrutide.amount;
