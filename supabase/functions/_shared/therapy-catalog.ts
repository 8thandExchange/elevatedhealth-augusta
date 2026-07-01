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
  | "peptide_aesthetic"
  | "hormone"
  | "iv"
  | "sexual_wellness"
  | "hair_restoration"
  | "program_membership";

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
  /** pricing.ts / stripeConfig catalog key when applicable */
  catalogKey?: string;
  /** Patient-facing storefront route */
  pageRoute?: string;
  /** Display price string — Stripe is source of truth for charges */
  displayPrice?: string;
  /** Hidden from public nav at launch (sexual wellness, hair, etc.) */
  hiddenAtLaunch?: boolean;
  /** Staff/internal only — never patient storefront */
  internalOnly?: boolean;
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
      "$499/mo gated fill. NOT engine-excluded. Physician-selected within GLP-1 lane; GLP-1 consent Section 11A. Never advertise or lead with retatrutide.",
    catalogSlug: "retatrutide-provider-directed",
    catalogKey: "retatrutide",
    pageRoute: "/weight-loss",
    displayPrice: "$499/mo",
    engineHardExcluded: false,
    staffPolicyBullet:
      "Retatrutide — $499/mo · physician-selected within GLP-1 lane only; full consent; never headline or advertise.",
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
  // Hormone optimization programs
  {
    key: "elevated-trt",
    name: "ELEVATED TRT",
    category: "hormone",
    patientFacingAvailability: "website_program",
    providerGated: true,
    description:
      "Lab-guided testosterone optimization for men — compounded transdermal protocols when prescribed after assessment.",
    onWebsite: true,
    inPatientGuide: true,
    inStripePricing: true,
    clinicalNotes: "Cream-based TRT lead product. Quarterly Comprehensive panel included.",
    catalogKey: "trt",
    pageRoute: "/hormones/men",
    displayPrice: "$249/mo",
    catalogSlug: "elevated_trt",
  },
  {
    key: "elevated-hrt",
    name: "ELEVATED HRT",
    category: "hormone",
    patientFacingAvailability: "website_program",
    providerGated: true,
    description:
      "Bioidentical hormone replacement for women — physician-guided after labs and provider review.",
    onWebsite: true,
    inPatientGuide: true,
    inStripePricing: true,
    clinicalNotes: "Bi-Est cream lead product. Quarterly Comprehensive panel included.",
    catalogKey: "hrt",
    pageRoute: "/hormones/women",
    displayPrice: "$229/mo",
    catalogSlug: "elevated_hrt",
  },
  {
    key: "testosterone-fill",
    name: "Testosterone Cream Fill",
    category: "hormone",
    patientFacingAvailability: "provider_only",
    providerGated: true,
    description: "Single testosterone cream fill when not on ELEVATED TRT — provider-directed.",
    onWebsite: false,
    inPatientGuide: true,
    inStripePricing: true,
    clinicalNotes: "Included in ELEVATED TRT program when enrolled.",
    catalogKey: "testosterone",
    displayPrice: "$179",
    catalogSlug: "testosterone",
  },
  // IV / NAD (Lane A)
  {
    key: "iv-lounge",
    name: "IV Lounge",
    category: "iv",
    patientFacingAvailability: "website_program",
    providerGated: false,
    description:
      "Walk-in IV hydration and wellness drips — book online, complete screening, pay at checkout. No $79 consult required.",
    onWebsite: true,
    inPatientGuide: true,
    inStripePricing: true,
    clinicalNotes: "Lane A direct booking. Public prepay required; staff may use pay_at_visit for walk-ins.",
    pageRoute: "/iv-lounge",
    catalogSlug: "iv_lounge",
  },
  {
    key: "iv-nad-booster",
    name: "NAD+ IV Booster",
    category: "iv",
    patientFacingAvailability: "website_program",
    providerGated: false,
    description: "NAD+ push add-on to any IV drip — the only patient-facing NAD+ SKU after peptide NAD discontinuation.",
    onWebsite: true,
    inPatientGuide: true,
    inStripePricing: true,
    clinicalNotes: "Standalone NAD+ infusions and peptide NAD SKUs discontinued 2026-06-25.",
    pageRoute: "/iv-lounge",
    displayPrice: "$50",
    catalogSlug: "nad_booster",
  },
  {
    key: "elevated-iv",
    name: "ELEVATED IV",
    category: "program_membership",
    patientFacingAvailability: "website_program",
    providerGated: false,
    description: "Monthly IV membership — signature drips, member pricing on add-ons, priority booking.",
    onWebsite: true,
    inPatientGuide: true,
    inStripePricing: true,
    clinicalNotes: "Non-Rx IV membership. 20% off add-ons.",
    catalogKey: "wellness",
    pageRoute: "/membership",
    displayPrice: "$199/mo",
    catalogSlug: "elevated_iv",
  },
  // Metabolic peptides (provider-only à la carte)
  {
    key: "ss-31",
    name: "SS-31 (Elamipretide)",
    category: "peptide_metabolic",
    patientFacingAvailability: "provider_only",
    providerGated: true,
    description:
      "Metabolic and mitochondrial support peptide — physician-directed after assessment when appropriate for your plan.",
    onWebsite: false,
    inPatientGuide: true,
    inStripePricing: true,
    clinicalNotes: "Provider-only metabolic à la carte. Research Peptide Consent when indicated.",
    catalogKey: "ss31",
    displayPrice: "$249/mo",
    catalogSlug: "ss-31-provider-only",
  },
  {
    key: "aod-9604",
    name: "AOD-9604",
    category: "peptide_metabolic",
    patientFacingAvailability: "provider_only",
    providerGated: true,
    description: "Body composition support peptide — layered by your physician when clinically appropriate.",
    onWebsite: false,
    inPatientGuide: true,
    inStripePricing: true,
    clinicalNotes: "Provider-only metabolic à la carte.",
    catalogKey: "aod9604",
    displayPrice: "$129/mo",
    catalogSlug: "aod-9604",
  },
  {
    key: "slu-pp-332",
    name: "SLU-PP-332",
    category: "peptide_metabolic",
    patientFacingAvailability: "provider_only",
    providerGated: true,
    description: "Metabolic pathway support — selected by your provider for appropriate patients after review.",
    onWebsite: false,
    inPatientGuide: true,
    inStripePricing: true,
    clinicalNotes: "Provider-only metabolic à la carte.",
    catalogKey: "sluPp332",
    displayPrice: "$99/mo",
    catalogSlug: "slu-pp-332-provider-only",
  },
  {
    key: "five-amino-1mq",
    name: "5-Amino-1MQ",
    category: "peptide_metabolic",
    patientFacingAvailability: "provider_only",
    providerGated: true,
    description: "Metabolic support peptide — physician-guided when your provider determines fit.",
    onWebsite: false,
    inPatientGuide: true,
    inStripePricing: true,
    clinicalNotes: "Provider-only metabolic à la carte.",
    catalogKey: "fiveAmino1mq",
    displayPrice: "$119/mo",
    catalogSlug: "5-amino-1mq-provider-only",
  },
  {
    key: "pda-recovery",
    name: "Pentadeca Arginate (PDA)",
    category: "peptide_recovery",
    patientFacingAvailability: "website_consult_gated",
    providerGated: true,
    description: "Oral recovery support — optional alternate your physician may select after Recovery Peptide Review.",
    onWebsite: true,
    inPatientGuide: true,
    inStripePricing: true,
    clinicalNotes: "Optional oral alternate to injectable recovery peptides when physician selects.",
    catalogSlug: "pda-pentadeca-arginate",
    displayPrice: "$249",
  },
  // Sexual wellness (hidden at launch)
  {
    key: "tadalafil",
    name: "Tadalafil",
    category: "sexual_wellness",
    patientFacingAvailability: "provider_only",
    providerGated: true,
    description: "Physician-guided ED support when clinically appropriate after assessment.",
    onWebsite: false,
    inPatientGuide: true,
    inStripePricing: true,
    clinicalNotes: "Sexual wellness lane hidden at launch.",
    catalogKey: "tadalafil",
    displayPrice: "$99/mo",
    hiddenAtLaunch: true,
    catalogSlug: "tadalafil",
  },
  {
    key: "sildenafil",
    name: "Sildenafil",
    category: "sexual_wellness",
    patientFacingAvailability: "provider_only",
    providerGated: true,
    description: "Physician-guided ED support when clinically appropriate after assessment.",
    onWebsite: false,
    inPatientGuide: true,
    inStripePricing: true,
    clinicalNotes: "Sexual wellness lane hidden at launch.",
    catalogKey: "sildenafil",
    displayPrice: "$79/mo",
    hiddenAtLaunch: true,
    catalogSlug: "sildenafil",
  },
  {
    key: "oxytocin",
    name: "Oxytocin Nasal Spray",
    category: "sexual_wellness",
    patientFacingAvailability: "provider_only",
    providerGated: true,
    description: "Intimacy and connection support — physician-guided when appropriate for your plan.",
    onWebsite: false,
    inPatientGuide: true,
    inStripePricing: true,
    clinicalNotes: "Sexual wellness lane hidden at launch.",
    catalogKey: "oxytocin",
    displayPrice: "$89/mo",
    hiddenAtLaunch: true,
    catalogSlug: "oxytocin",
  },
  // Hair restoration (hidden at launch)
  {
    key: "minoxidil-finasteride",
    name: "Minoxidil + Finasteride",
    category: "hair_restoration",
    patientFacingAvailability: "provider_only",
    providerGated: true,
    description: "Physician-guided scalp protocol for hair density — individualized plan after review.",
    onWebsite: false,
    inPatientGuide: true,
    inStripePricing: true,
    clinicalNotes: "Hair restoration hidden at launch.",
    catalogKey: "minoxidilFinasteride",
    displayPrice: "$129/mo",
    hiddenAtLaunch: true,
    catalogSlug: "minoxidil_finasteride",
  },
  {
    key: "dutasteride",
    name: "Dutasteride Protocol",
    category: "hair_restoration",
    patientFacingAvailability: "provider_only",
    providerGated: true,
    description: "Physician-guided hair restoration protocol when your provider determines fit.",
    onWebsite: false,
    inPatientGuide: true,
    inStripePricing: true,
    clinicalNotes: "Hair restoration hidden at launch.",
    catalogKey: "dutasteride",
    displayPrice: "$149/mo",
    hiddenAtLaunch: true,
    catalogSlug: "dutasteride",
  },
  {
    key: "ghk-cu-scalp",
    name: "GHK-Cu Scalp Therapy",
    category: "hair_restoration",
    patientFacingAvailability: "provider_only",
    providerGated: true,
    description: "Topical scalp peptide support for hair and skin goals — provider-reviewed after assessment.",
    onWebsite: false,
    inPatientGuide: true,
    inStripePricing: true,
    clinicalNotes: "Hair restoration hidden at launch.",
    catalogKey: "ghkCuScalp",
    displayPrice: "$149/mo",
    hiddenAtLaunch: true,
    catalogSlug: "ghk_cu_scalp",
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

/** Outcome-based peptide groupings for patient storefront UX */
export interface PeptideOutcomeGroup {
  id: string;
  title: string;
  summary: string;
  therapyKeys: string[];
}

export const PEPTIDE_OUTCOME_GROUPS: PeptideOutcomeGroup[] = [
  {
    id: "recovery",
    title: "Recovery",
    summary:
      "May support tissue recovery, training bounce-back, and joint comfort in appropriate patients — provider-reviewed after Wellness Assessment.",
    therapyKeys: ["bpc-157", "tb-500", "pda-recovery"],
  },
  {
    id: "body_composition",
    title: "Body composition",
    summary:
      "Physician-guided support for lean mass and metabolic goals — your provider determines fit after labs and assessment.",
    therapyKeys: ["tesamorelin", "cjc-ipamorelin"],
  },
  {
    id: "longevity",
    title: "Longevity & performance",
    summary:
      "Vitality and GH-axis support under individualized plans — never self-selected online. NAD+ is available as a $50 IV booster add-on (Lane A), not a peptide SKU.",
    therapyKeys: ["sermorelin", "cjc-ipamorelin", "tesamorelin", "iv-nad-booster"],
  },
  {
    id: "hair_skin",
    title: "Hair & skin",
    summary:
      "Topical transformation support when clinically appropriate — provider-reviewed, not a walk-in catalog.",
    therapyKeys: ["ghk-cu", "ghk-cu-scalp"],
  },
  {
    id: "sexual_wellness",
    title: "Sexual wellness",
    summary:
      "Discreet, physician-guided care for libido and intimacy goals — offered when your provider determines fit.",
    therapyKeys: ["pt-141", "tadalafil", "sildenafil", "oxytocin"],
  },
];

export function peptideOutcomeGroups(): PeptideOutcomeGroup[] {
  return PEPTIDE_OUTCOME_GROUPS;
}

export function therapiesForPageRoute(route: string): TherapyCatalogEntry[] {
  const normalized = route.replace(/\/$/, "");
  return THERAPY_CATALOG.filter(
    (t) => t.pageRoute?.replace(/\/$/, "") === normalized && t.patientFacingAvailability !== "not_offered",
  );
}

export function therapiesByCatalogKey(catalogKey: string): TherapyCatalogEntry | undefined {
  return THERAPY_CATALOG.find((t) => t.catalogKey === catalogKey);
}

export function activeTherapyCatalogEntries(): TherapyCatalogEntry[] {
  return THERAPY_CATALOG.filter((t) => t.patientFacingAvailability !== "not_offered");
}
