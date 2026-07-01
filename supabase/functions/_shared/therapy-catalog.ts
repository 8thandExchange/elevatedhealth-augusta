/**
 * Canonical therapy availability catalog — single source for frontend + edge functions.
 *
 * GUARDRAILS (do not regress):
 * - Ketamine / Spravato: EXCLUDED — legacy Réveil, never patient-facing, engine-hard-blocked.
 * - Retatrutide: ALLOWED but provider-gated within GLP-1 — never engine-hard-blocked.
 * - Active peptides (BPC-157, TB-500, etc.): OFFERED after Wellness Assessment + provider review.
 */

export type TherapyCategory =
  | "legacy_excluded"
  | "formulary_excluded"
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
  key: string;
  name: string;
  category: TherapyCategory;
  patientFacingAvailability: PatientFacingAvailability;
  providerGated: boolean;
  description: string;
  onWebsite: boolean;
  inPatientGuide: boolean;
  inStripePricing: boolean;
  clinicalNotes: string;
  catalogSlug?: string;
  /** CDS engine hard-blocks this candidate_key regardless of DB seed rows */
  engineHardExcluded?: boolean;
  /** CDS pathway activation panel must not prescriber-activate this policy row */
  cdsActivationBlocked?: boolean;
  /** CDS candidates.candidate_key when different from `key` (e.g. policy_ketamine) */
  cdsPolicyCandidateKey?: string;
  /** Intake/email legacy program id remapped for sunsetted services */
  legacyProgramAlias?: string;
  /** Short staff-facing policy bullet for cheatsheets */
  staffPolicyBullet?: string;
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
    cdsActivationBlocked: true,
    cdsPolicyCandidateKey: "policy_ketamine",
    legacyProgramAlias: "General Wellness",
    staffPolicyBullet: "Ketamine / Spravato — not offered.",
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
      "NOT engine-excluded. Physician-selected within GLP-1 lane; GLP-1 consent Section 11A. Never advertise or lead with retatrutide.",
    catalogSlug: "retatrutide-provider-directed",
    engineHardExcluded: false,
    staffPolicyBullet:
      "Retatrutide — physician-selected within GLP-1 lane only; full consent; never headline or advertise.",
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
    cdsActivationBlocked: true,
    cdsPolicyCandidateKey: "policy_retatrutide_ala_carte",
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
    clinicalNotes:
      "Internal name Wolverine Stack — never patient-facing. Pre-blended vials not offered; Rx separately.",
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
    key: "tesamorelin",
    name: "Tesamorelin",
    category: "peptide_vitality",
    patientFacingAvailability: "website_consult_gated",
    providerGated: true,
    description:
      "Physician-guided growth-hormone axis support for body composition and metabolic health after assessment.",
    onWebsite: true,
    inPatientGuide: true,
    inStripePricing: true,
    clinicalNotes: "Monthly peptide program. Research Peptide Consent when clinically indicated.",
    catalogSlug: "tesamorelin",
  },
  {
    key: "ghk-cu",
    name: "GHK-Cu Topical",
    category: "peptide_aesthetic",
    patientFacingAvailability: "website_consult_gated",
    providerGated: true,
    description:
      "Topical peptide support for skin, collagen, and transformation goals — selected by your provider after review.",
    onWebsite: true,
    inPatientGuide: true,
    inStripePricing: true,
    clinicalNotes: "Topical preferred over injectable GHK-Cu per formulary policy.",
    catalogSlug: "ghk_cu_topical",
  },
  {
    key: "pt-141",
    name: "PT-141 (Bremelanotide)",
    category: "sexual_wellness",
    patientFacingAvailability: "provider_only",
    providerGated: true,
    description:
      "FDA-approved libido support (Vyleesi class) when clinically appropriate — physician-guided after assessment.",
    onWebsite: false,
    inPatientGuide: true,
    inStripePricing: true,
    clinicalNotes: "Sexual wellness lane hidden at launch; offered when clinically appropriate.",
    catalogSlug: "pt_141",
  },
  {
    key: "mazdutide",
    name: "Mazdutide",
    category: "formulary_excluded",
    patientFacingAvailability: "not_offered",
    providerGated: true,
    description: "Not offered — insufficient clinical governance vs semaglutide/tirzepatide/retatrutide program path.",
    onWebsite: false,
    inPatientGuide: false,
    inStripePricing: false,
    clinicalNotes: "Not in formulary — insufficient clinical governance vs sema/tirz/reta",
  },
  {
    key: "melanotan2",
    name: "Melanotan II",
    category: "formulary_excluded",
    patientFacingAvailability: "not_offered",
    providerGated: true,
    description: "Not offered — cosmetic tanning; reputational and regulatory risk.",
    onWebsite: false,
    inPatientGuide: false,
    inStripePricing: false,
    clinicalNotes: "Cosmetic tanning — reputational/regulatory risk",
  },
  {
    key: "cagrilintide",
    name: "Cagrilintide",
    category: "formulary_excluded",
    patientFacingAvailability: "not_offered",
    providerGated: true,
    description: "Not on EHA formulary — use GLP-1 program paths instead.",
    onWebsite: false,
    inPatientGuide: false,
    inStripePricing: false,
    clinicalNotes: "Not on EHA formulary — use GLP-1 program paths instead",
  },
  {
    key: "cagrilintide_retatrutide_blend",
    name: "Cagrilintide / Retatrutide blend",
    category: "formulary_excluded",
    patientFacingAvailability: "not_offered",
    providerGated: true,
    description: "Pre-blended products not offered — use supervised GLP-1 program protocols only.",
    onWebsite: false,
    inPatientGuide: false,
    inStripePricing: false,
    clinicalNotes: "Pre-blended — use supervised metabolic protocol only",
  },
  {
    key: "igf1_lr3",
    name: "IGF-1 LR3",
    category: "formulary_excluded",
    patientFacingAvailability: "not_offered",
    providerGated: true,
    description: "High-risk growth factor — physician exclusion default.",
    onWebsite: false,
    inPatientGuide: false,
    inStripePricing: false,
    clinicalNotes: "High-risk growth factor — physician exclusion default",
  },
  {
    key: "ghk_cu_injectable",
    name: "GHK-Cu injectable",
    category: "formulary_excluded",
    patientFacingAvailability: "not_offered",
    providerGated: true,
    description: "Injectable GHK-Cu not offered — topical/sublingual preferred per formulary policy.",
    onWebsite: false,
    inPatientGuide: false,
    inStripePricing: false,
    clinicalNotes: "Prefer topical/sublingual per formulary policy",
  },
];

function normalizeTherapyKey(key: string): string {
  return key.toLowerCase().trim().replace(/[\s-]+/g, "_");
}

export function therapyByKey(key: string): TherapyCatalogEntry | undefined {
  const normalized = normalizeTherapyKey(key);
  return THERAPY_CATALOG.find((t) => normalizeTherapyKey(t.key) === normalized);
}

export function therapyByCatalogSlug(slug: string): TherapyCatalogEntry | undefined {
  const normalized = slug.toLowerCase().trim();
  return THERAPY_CATALOG.find(
    (t) => t.catalogSlug?.toLowerCase() === normalized || normalizeTherapyKey(t.key) === normalized.replace(/-/g, "_"),
  );
}

/** Keys hard-blocked by CDS engine — derived from catalog, not a separate list. */
export function therapyEngineExcludedKeys(): readonly string[] {
  return THERAPY_CATALOG.filter((t) => t.engineHardExcluded).map((t) => normalizeTherapyKey(t.key));
}

export function isTherapyEngineExcluded(key: string): boolean {
  const normalized = normalizeTherapyKey(key);
  return therapyEngineExcludedKeys().includes(normalized);
}

export function isTherapyNotOffered(keyOrSlug: string): boolean {
  const entry = therapyByKey(keyOrSlug) ?? therapyByCatalogSlug(keyOrSlug);
  return entry?.patientFacingAvailability === "not_offered";
}

export function isTherapyStaffQuotable(slug: string): boolean {
  const entry = therapyByCatalogSlug(slug);
  if (!entry) return true;
  return entry.patientFacingAvailability !== "not_offered";
}

export function isTherapyWebsiteVisible(key: string): boolean {
  return therapyByKey(key)?.onWebsite === true;
}

export function offeredPeptideKeys(): string[] {
  return THERAPY_CATALOG.filter(
    (t) =>
      t.category.startsWith("peptide_") &&
      t.patientFacingAvailability !== "not_offered" &&
      !t.engineHardExcluded,
  ).map((t) => t.key);
}

export function websiteTherapies(): TherapyCatalogEntry[] {
  return THERAPY_CATALOG.filter((t) => t.onWebsite);
}

export function recoveryPeptideTherapies(): TherapyCatalogEntry[] {
  return THERAPY_CATALOG.filter(
    (t) => t.category === "peptide_recovery" && t.patientFacingAvailability !== "not_offered",
  );
}

export function recoveryPeptideShortNames(): string {
  return recoveryPeptideTherapies()
    .filter((t) => t.key !== "recovery-stack")
    .map((t) => t.name.replace(/\s*\(.+\)$/, ""))
    .join(", ");
}

export function recoveryPeptidePublicLanguage(): string {
  const names = recoveryPeptideShortNames();
  return (
    `Recovery peptide protocols for active adults, training recovery, tendon and ligament concerns, ` +
    `soft-tissue recovery, joint support, and inflammation-related recovery goals. Options may include ` +
    `${names}, or related recovery peptides when clinically appropriate and prescribed by a provider.`
  );
}

/** Pathway engine: compounds not offered despite vendor catalog availability */
export function pathwayExcludedCompounds(): readonly { key: string; reason: string }[] {
  return THERAPY_CATALOG.filter((t) => t.patientFacingAvailability === "not_offered").map((t) => ({
    key: t.key,
    reason: t.clinicalNotes,
  }));
}

export function cdsCandidateActivationBlocklist(): ReadonlySet<string> {
  return new Set(
    THERAPY_CATALOG.flatMap((t) => {
      if (!t.cdsActivationBlocked) return [];
      return [t.cdsPolicyCandidateKey ?? `policy_${t.key}`];
    }),
  );
}

export function therapyStaffPolicyBullets(): string[] {
  return THERAPY_CATALOG.map((t) => t.staffPolicyBullet).filter((b): b is string => Boolean(b));
}

export function ketamineNotOfferedPatientCopy(): string {
  const k = therapyByKey("ketamine");
  return `IV ketamine and SPRAVATO? (esketamine) are not offered at Elevated Health Augusta.`;
}

export function resolveLegacyProgramKey(rawProgram: string): string {
  const entry = therapyByKey(rawProgram);
  if (entry?.legacyProgramAlias) return entry.legacyProgramAlias;
  return rawProgram;
}

export function resolveLegacyProgramDisplayLabel(rawProgram: string): string {
  return resolveLegacyProgramKey(rawProgram);
}

/** Map legacy intake program ids to display labels (edge functions + portal). */
export function legacyProgramDisplayLabels(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const t of THERAPY_CATALOG) {
    if (t.legacyProgramAlias) out[t.key] = t.legacyProgramAlias;
  }
  return out;
}

export function therapiesByCategory(category: TherapyCategory): TherapyCatalogEntry[] {
  return THERAPY_CATALOG.filter((t) => t.category === category);
}

export function providerGatedTherapies(): TherapyCatalogEntry[] {
  return THERAPY_CATALOG.filter(
    (t) => t.providerGated && t.patientFacingAvailability !== "not_offered",
  );
}

export function glpTherapyKeys(): string[] {
  return THERAPY_CATALOG.filter(
    (t) => t.category === "glp1_weight_loss" && t.patientFacingAvailability !== "not_offered" && t.key !== "policy_retatrutide_ala_carte",
  ).map((t) => t.key);
}

export function isLegacySunsettedService(serviceKey: string): boolean {
  const entry = therapyByKey(serviceKey);
  return entry?.patientFacingAvailability === "not_offered" && entry.category === "legacy_excluded";
}
