/**
 * Canonical therapy availability catalog — Phase 2 truth source.
 *
 * Use this file when deciding patient-facing copy, CDS posture, Stripe surfacing,
 * and staff guardrails. Operational pricing/SKU detail lives in
 * `clinicalOptimizationCatalog.ts` and `stripeConfig.ts`; link via `catalogSlug`.
 *
 * GUARDRAILS (do not regress):
 * - Ketamine / Spravato: intentionally EXCLUDED — legacy Réveil service, never patient-facing.
 * - Retatrutide: intentionally ALLOWED but provider-gated within the GLP-1 lane — never advertised,
 *   never engine-hard-blocked; à la carte SKU is staff/provider-initiated only.
 * - Active peptides (BPC-157, TB-500, etc.): OFFERED after Wellness Assessment + provider review —
 *   patients must not self-select; use "provider-reviewed" language, not "not offered" or "hard stop".
 *   Research Peptide Consent is a legal document name, not patient-facing "research compound" marketing.
 */
import { ENGINE_EXCLUDED_CANDIDATE_KEYS } from "../../supabase/functions/_shared/cds-engine.ts";

/** Must stay in sync with `ENGINE_EXCLUDED_CANDIDATE_KEYS` in cds-engine.ts */
export const THERAPY_ENGINE_EXCLUSIONS = [...ENGINE_EXCLUDED_CANDIDATE_KEYS] as const;

export type TherapyCategory =
  | "legacy_excluded"
  | "glp1_weight_loss"
  | "peptide_recovery"
  | "peptide_vitality"
  | "peptide_metabolic"
  | "hormone"
  | "iv"
  | "sexual_wellness"
  | "hair_restoration";

export type PatientFacingAvailability =
  | "not_offered"
  | "website_program"
  | "website_consult_gated"
  | "provider_only"
  | "staff_internal";

export interface TherapyCatalogEntry {
  /** Stable key — matches CDS candidate_key / policy_key where applicable */
  key: string;
  name: string;
  category: TherapyCategory;
  /** Plain-language availability for patients (no internal jargon) */
  patientFacingAvailability: PatientFacingAvailability;
  /** Requires physician selection — never self-serve checkout on public site */
  providerGated: boolean;
  description: string;
  onWebsite: boolean;
  inPatientGuide: boolean;
  inStripePricing: boolean;
  clinicalNotes: string;
  /** Link to `clinicalOptimizationCatalog` slug when a formulary row exists */
  catalogSlug?: string;
  /** True when CDS engine hard-blocks regardless of DB seed rows */
  engineHardExcluded?: boolean;
}

export const THERAPY_CATALOG: TherapyCatalogEntry[] = [
  {
    key: "ketamine",
    name: "Ketamine / Spravato",
    category: "legacy_excluded",
    patientFacingAvailability: "not_offered",
    providerGated: true,
    description: "Legacy Réveil-era service — not available at Elevated Health Augusta.",
    onWebsite: false,
    inPatientGuide: false,
    inStripePricing: false,
    clinicalNotes:
      "Engine + catalog hard exclusion. Legacy routes redirect home. Staff must never quote or schedule.",
    catalogSlug: "ketamine",
    engineHardExcluded: true,
  },
  {
    key: "semaglutide",
    name: "Semaglutide (ELEVATED GLP-1)",
    category: "glp1_weight_loss",
    patientFacingAvailability: "website_program",
    providerGated: true,
    description: "Physician-supervised GLP-1 weight-loss program with labs and ongoing care.",
    onWebsite: true,
    inPatientGuide: true,
    inStripePricing: true,
    clinicalNotes: "Headline weight-loss molecule. Program $349/mo; single fills when not on program.",
    catalogSlug: "semaglutide",
  },
  {
    key: "tirzepatide",
    name: "Tirzepatide (ELEVATED GLP-1)",
    category: "glp1_weight_loss",
    patientFacingAvailability: "website_program",
    providerGated: true,
    description: "Dual-action GLP-1/GIP program for weight and metabolic health after provider review.",
    onWebsite: true,
    inPatientGuide: true,
    inStripePricing: true,
    clinicalNotes: "Program $449/mo. Molecule-locked pricing through titration.",
    catalogSlug: "tirzepatide",
  },
  {
    key: "retatrutide",
    name: "Retatrutide",
    category: "glp1_weight_loss",
    patientFacingAvailability: "provider_only",
    providerGated: true,
    description:
      "Investigational triple agonist — available only when your physician selects it within the GLP-1 program after assessment and consent.",
    onWebsite: false,
    inPatientGuide: true,
    inStripePricing: true,
    clinicalNotes:
      "NOT engine-excluded. Physician-selected within GLP-1 lane; GLP-1 consent Section 11A. Never advertise or lead with retatrutide. Not casual à la carte self-serve.",
    catalogSlug: "retatrutide-provider-directed",
    engineHardExcluded: false,
  },
  {
    key: "bpc-157",
    name: "BPC-157",
    category: "peptide_recovery",
    patientFacingAvailability: "website_consult_gated",
    providerGated: true,
    description:
      "Recovery peptide your provider may prescribe after Wellness Assessment, safety screening, and when clinically appropriate.",
    onWebsite: true,
    inPatientGuide: true,
    inStripePricing: true,
    clinicalNotes: "Recovery Peptide Review pathway. Research Peptide Consent (legal doc). Cat 2 — 503A sourced.",
    catalogSlug: "bpc-157",
  },
  {
    key: "tb-500",
    name: "TB-500 (Thymosin Beta-4)",
    category: "peptide_recovery",
    patientFacingAvailability: "website_consult_gated",
    providerGated: true,
    description:
      "Weekly recovery peptide your provider may select for tissue mobility and training recovery support.",
    onWebsite: true,
    inPatientGuide: true,
    inStripePricing: true,
    clinicalNotes: "Recovery Peptide Review pathway. WADA prohibited — disclose athletes. Research Peptide Consent.",
    catalogSlug: "tb-500",
  },
  {
    key: "recovery-stack",
    name: "BPC-157 / TB-500 Recovery Stack",
    category: "peptide_recovery",
    patientFacingAvailability: "website_consult_gated",
    providerGated: true,
    description: "Combined recovery protocol when your provider selects both peptides — never self-selected.",
    onWebsite: true,
    inPatientGuide: true,
    inStripePricing: true,
    clinicalNotes: "Internal name Wolverine Stack — never patient-facing. Pre-blended vials not offered; Rx separately. Stripe SKU via RECOVERY_STACK in formularyCheatSheetContent.",
  },
  {
    key: "sermorelin",
    name: "Sermorelin",
    category: "peptide_vitality",
    patientFacingAvailability: "website_consult_gated",
    providerGated: true,
    description: "Growth-hormone secretagogue peptide prescribed after consult and provider review.",
    onWebsite: true,
    inPatientGuide: true,
    inStripePricing: true,
    clinicalNotes: "Not Cat 2. Monthly peptide program after Wellness Assessment.",
    catalogSlug: "sermorelin",
  },
  {
    key: "cjc-ipamorelin",
    name: "CJC-1295 / Ipamorelin",
    category: "peptide_vitality",
    patientFacingAvailability: "website_consult_gated",
    providerGated: true,
    description: "Nightly growth/recovery peptide stack when clinically appropriate and provider-directed.",
    onWebsite: true,
    inPatientGuide: true,
    inStripePricing: true,
    clinicalNotes: "Cat 2 — Research Peptide Consent. Provider layers after anchor therapy stable.",
    catalogSlug: "cjc-ipamorelin",
  },
  {
    key: "policy_retatrutide_ala_carte",
    name: "Retatrutide à la carte (policy block)",
    category: "glp1_weight_loss",
    patientFacingAvailability: "not_offered",
    providerGated: true,
    description: "Retatrutide is not sold as casual à la carte self-serve — GLP-1 program path only.",
    onWebsite: false,
    inPatientGuide: false,
    inStripePricing: false,
    clinicalNotes: "CDS seed row EXCLUDED — blocks casual à la carte; distinct from physician-initiated gated fill SKU.",
    engineHardExcluded: false,
  },
];

export function therapyByKey(key: string): TherapyCatalogEntry | undefined {
  const normalized = key.trim().toLowerCase();
  return THERAPY_CATALOG.find((t) => t.key.toLowerCase() === normalized);
}

export function isTherapyEngineExcluded(key: string): boolean {
  const normalized = key.trim().toLowerCase();
  return (THERAPY_ENGINE_EXCLUSIONS as readonly string[]).includes(normalized);
}

export function offeredPeptideKeys(): string[] {
  return THERAPY_CATALOG.filter(
    (t) =>
      t.category.startsWith("peptide_") &&
      t.patientFacingAvailability !== "not_offered" &&
      !t.engineHardExcluded,
  ).map((t) => t.key);
}

/** Patient-safe therapies visible on public storefronts (excludes ketamine, hidden SKUs) */
export function websiteTherapies(): TherapyCatalogEntry[] {
  return THERAPY_CATALOG.filter((t) => t.onWebsite);
}
