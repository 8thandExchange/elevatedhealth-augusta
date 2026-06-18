/**
 * Clinical Optimization Framework — unified program/formulary catalog.
 * Single source for public visibility, staff quoting gates, lab routing, and supply checks.
 * Public surfaces import only `public_status === "public"` fields via helpers below.
 */
import { CATALOG, memberPriceCents, nonMemberPriceCents } from "./pricing";
import { LAB_PANEL_DISPLAY_NAMES, LAB_PANEL_SLUGS } from "./labPanelRecommendations";
import { isServiceActive } from "./serviceConfig";
import {
  CORE_SERVICES,
  ELEVATED_PROGRAMS,
  MEDICATION_FILLS,
  METABOLIC_STACK_ALACARTE,
  PEPTIDE_PRODUCTS,
  SEXUAL_WELLNESS_PRODUCTS,
  type ElevatedProgramKey,
} from "./stripeConfig";
import { FORMULARY_ECONOMICS_CATALOG } from "./vendorRouting";
import { marginPct } from "./formularyEconomics";

export type PublicCatalogStatus = "public" | "hidden" | "provider_only" | "inactive";
export type ClinicalCatalogStatus = "active" | "draft" | "policy_review" | "inactive";

export type OptimizationCategory =
  | "iv_hydration"
  | "glp1_weight_loss"
  | "metabolic_program"
  | "peptide_metabolic"
  | "peptide_recovery"
  | "peptide_vitality"
  | "peptide_cellular"
  | "peptide_aesthetic"
  | "peptide_sexual"
  | "hormone_male"
  | "hormone_female"
  | "sexual_wellness"
  | "lab_optimization"
  | "program_membership";

export interface ProviderAlgorithmRef {
  protocolSlug: string;
  /** Provider-only — never render on public pages */
  startDose?: string;
  escalationSchedule?: string;
  frequency?: string;
  route?: string;
  cycleLength?: string;
  holdRules?: string[];
  stopRules?: string[];
  monitoringLabs?: string[];
  adverseEffectMonitoring?: string[];
  refillRules?: string;
  followUpInterval?: string;
  supplierVialOption?: string;
  unitConversionNotes?: string;
  documentationRequired?: string[];
}

export interface ClinicalOptimizationItem {
  slug: string;
  display_name: string;
  category: OptimizationCategory;
  public_status: PublicCatalogStatus;
  clinical_status: ClinicalCatalogStatus;
  supplier: string | null;
  supplier_sku: string | null;
  route: string | null;
  dosage_form: string | null;
  patient_price_cents: number | null;
  member_price_cents: number | null;
  clinic_cost_cents: number | null;
  requires_labs: boolean;
  lab_panel_slug: string | null;
  requires_consent: boolean;
  consent_type: string | null;
  requires_provider_signoff: boolean;
  ordering_supplies_required: boolean;
  inventory_tracking_required: boolean;
  supply_checklist_key?: string | null;
  internal_notes: string | null;
  regulatory_notes?: string | null;
  public_description: string;
  staff_description: string;
  provider_algorithm: ProviderAlgorithmRef | null;
  catalog_key: string | null;
  elevated_program_key: ElevatedProgramKey | null;
  policy_key: string | null;
  margin_threshold_pct: number;
  last_reviewed_at?: string | null;
  reviewed_by?: string | null;
}

/** Legacy / alternate slugs → canonical catalog slug */
export const CATALOG_SLUG_ALIASES: Record<string, string> = {
  bpc_157: "bpc-157",
  tb_500: "tb-500",
  bpc_tb_recovery_stack: "bpc-157-tb-500-stack",
  pda_recovery: "pda-pentadeca-arginate",
  nad_injection: "nad",
  cjc1295_ipamorelin: "cjc-ipamorelin",
  retatrutide: "retatrutide-provider-directed",
  ss31: "ss-31-provider-only",
  aod9604: "aod-9604",
  slu_pp332: "slu-pp-332-provider-only",
  five_amino_1mq: "5-amino-1mq-provider-only",
};

export const PUBLIC_AVAILABILITY_DISCLAIMER =
  "Availability depends on provider review, labs, current clinic policy, consent, and pharmacy availability.";

export const PUBLIC_HOMEPAGE_SERVICES = [
  {
    title: "IV Hydration",
    tagline: "Walk-in nutrient therapy",
    body: "Hydration, recovery, immunity, and NAD+ infusions — book direct when screening clears you.",
    route: "/iv-lounge",
    imageKey: "serviceIv" as const,
  },
  {
    title: "GLP-1 Medical Weight Loss",
    tagline: "Physician-supervised",
    body: "Semaglutide or tirzepatide when clinically appropriate — lab-guided titration and monitoring.",
    route: "/weight-loss",
    imageKey: "serviceWeightLoss" as const,
  },
  {
    title: "Peptide Therapy",
    tagline: "Provider-led optimization",
    body: "Recovery Peptide Review, metabolic, longevity, and transformation support — assessment-first, never a walk-in catalog.",
    route: "/peptides",
    imageKey: "servicePeptides" as const,
  },
  {
    title: "Bioidentical Hormone Replacement",
    tagline: "Men & women",
    body: "Lab-guided TRT and BHRT with physician review — not symptom-only prescribing.",
    route: "/hormones",
    imageKey: "serviceHormones" as const,
  },
  {
    title: "Lab-Guided Optimization",
    tagline: "Data before decisions",
    body: "In-office LabCorp draws and expanded panels to confirm the right path — or redirect safely.",
    route: "/how-it-works",
    imageKey: "serviceHormones" as const,
  },
] as const;

/** Homepage cards — omits launch-hidden services (e.g. sexual wellness storefront). */
export function getPublicHomepageServices() {
  return PUBLIC_HOMEPAGE_SERVICES.filter(
    (s) => s.title !== "Sexual Wellness" || isServiceActive("sexualWellness"),
  );
}

export const PUBLIC_PEPTIDE_CATEGORIES = [
  {
    id: "recovery",
    title: "Recovery Peptide Review",
    examples: [
      "BPC-157",
      "TB-500",
      "BPC-157 / TB-500 recovery stack",
      "PDA (Pentadeca Arginate) — provider-selected alternate",
    ],
    note:
      "Recovery peptide protocols for active adults, training recovery, tendon and ligament concerns, soft-tissue recovery, joint support, and inflammation-related recovery goals. Options may include BPC-157, TB-500, BPC-157/TB-500 recovery protocols, or related recovery peptides when clinically appropriate and prescribed by a provider.",
    featured: true,
  },
  {
    id: "glp1_metabolic",
    title: "GLP-1 / Metabolic Optimization",
    examples: ["Semaglutide", "Tirzepatide", "Retatrutide — advanced metabolic recomposition only"],
    note: "Medical weight loss and advanced metabolic programs are lab-guided. Retatrutide is provider-directed within ELEVATED Metabolic Recomposition — not casual à la carte.",
  },
  {
    id: "longevity",
    title: "Longevity / Energy",
    examples: ["NAD+", "Sermorelin", "CJC-1295 / Ipamorelin", "Tesamorelin"],
    note: "Vitality and GH-axis support under physician oversight — gradual titration, no public dosing schedules.",
  },
  {
    id: "sexual",
    title: "Sexual Wellness",
    examples: ["PT-141", "Hormone-linked sexual wellness", "ED / libido / arousal support"],
    note: "Discreet, physician-led care after assessment when clinically appropriate.",
  },
  {
    id: "aesthetic",
    title: "Skin / Hair / GLP-1 Transformation Support",
    examples: ["GHK-Cu", "NAD+", "Skin, collagen, scalp, hair, and GLP-1 glow-up support"],
    note: "Aesthetic and transformation support compounds selected after provider review.",
  },
] as const;

export const PUBLIC_GLP1_CARE_FLOW = [
  "Interest & goals",
  "Wellness Assessment ($79)",
  "Expanded labs when indicated",
  "Provider review of results",
  "Personalized treatment plan",
  "Ongoing monitoring & titration",
] as const;

const FORMULARY_COST_BY_SLUG: Record<string, string> = {
  "bpc-157": "PEPTIDE-HEALING-STACK",
  "tb-500": "PEPTIDE-HEALING-STACK",
  "bpc-157-tb-500-stack": "PEPTIDE-HEALING-STACK",
  semaglutide: "GLP1-SEMAGLUTIDE",
  tirzepatide: "GLP1-TIRZEPATIDE",
  "retatrutide-provider-directed": "PEPTIDE-RETATRUTIDE",
  nad: "PEPTIDE-NAD-INJ",
  sermorelin: "PEPTIDE-SERMORELIN",
  "cjc-ipamorelin": "PEPTIDE-CJC-IPAM",
  tesamorelin: "PEPTIDE-TESAMORELIN",
  "ss-31-provider-only": "PEPTIDE-SS31",
  "aod-9604": "PEPTIDE-AOD9604",
  "slu-pp-332-provider-only": "PEPTIDE-SLU-PP332",
  "5-amino-1mq-provider-only": "PEPTIDE-5AMINO1MQ",
};

function economicsCostForSlug(slug: string): number | null {
  const canonical = CATALOG_SLUG_ALIASES[slug] ?? slug;
  const itemCode = FORMULARY_COST_BY_SLUG[canonical];
  const line = itemCode
    ? FORMULARY_ECONOMICS_CATALOG.find((l) => l.itemCode === itemCode)
    : FORMULARY_ECONOMICS_CATALOG.find(
        (l) =>
          l.itemCode.toLowerCase().includes(canonical.replace(/-/g, "")) ||
          l.itemCode.toLowerCase().includes(canonical.replace(/_/g, "-")),
      );
  if (!line) return null;
  // Individual recovery peptides — model at ~50% of blended stack COGS until discrete SKUs entered
  if (canonical === "bpc-157" || canonical === "tb-500") {
    return Math.round(line.primaryCostCents * 0.5);
  }
  return line.primaryCostCents;
}

function economicsPriceForHealingStack(): { patient: number; member: number } {
  const line = FORMULARY_ECONOMICS_CATALOG.find((l) => l.itemCode === "PEPTIDE-HEALING-STACK");
  return {
    patient: line?.clientPriceCents ? line.clientPriceCents + 8000 : 32900,
    member: line?.clientPriceCents ?? 24900,
  };
}

function fromCatalogKey(
  slug: string,
  display_name: string,
  category: OptimizationCategory,
  catalogKey: string,
  opts: Partial<ClinicalOptimizationItem> = {},
): ClinicalOptimizationItem {
  const item = CATALOG[catalogKey];
  const patient = item ? nonMemberPriceCents(item) : null;
  const member = item ? memberPriceCents(item) : null;
  const cost = economicsCostForSlug(slug) ?? opts.clinic_cost_cents ?? null;
  return {
    slug,
    display_name,
    category,
    public_status: opts.public_status ?? "public",
    clinical_status: opts.clinical_status ?? "active",
    supplier: opts.supplier ?? "GC / FCC",
    supplier_sku: opts.supplier_sku ?? null,
    route: opts.route ?? null,
    dosage_form: opts.dosage_form ?? null,
    patient_price_cents: patient,
    member_price_cents: member,
    clinic_cost_cents: cost,
    requires_labs: opts.requires_labs ?? true,
    lab_panel_slug: opts.lab_panel_slug ?? null,
    requires_consent: opts.requires_consent ?? false,
    consent_type: opts.consent_type ?? null,
    requires_provider_signoff: opts.requires_provider_signoff ?? true,
    ordering_supplies_required: opts.ordering_supplies_required ?? true,
    inventory_tracking_required: opts.inventory_tracking_required ?? false,
    supply_checklist_key: opts.supply_checklist_key ?? null,
    internal_notes: opts.internal_notes ?? null,
    regulatory_notes: opts.regulatory_notes ?? null,
    public_description: opts.public_description ?? display_name,
    staff_description: opts.staff_description ?? display_name,
    provider_algorithm: opts.provider_algorithm ?? null,
    catalog_key: catalogKey,
    elevated_program_key: opts.elevated_program_key ?? null,
    policy_key: opts.policy_key ?? slug,
    margin_threshold_pct: opts.margin_threshold_pct ?? 25,
    last_reviewed_at: opts.last_reviewed_at ?? "2026-06-16",
    reviewed_by: opts.reviewed_by ?? "Dr. Troy Akers",
  };
}

/** Master catalog — extend here; do not duplicate in storefront components. */
export const CLINICAL_OPTIMIZATION_CATALOG: ClinicalOptimizationItem[] = [
  // Programs
  {
    slug: "elevated_glp1",
    display_name: ELEVATED_PROGRAMS.glp1.name,
    category: "glp1_weight_loss",
    public_status: "public",
    clinical_status: "active",
    supplier: "GC / FCC",
    supplier_sku: null,
    route: "subQ",
    dosage_form: "injectable",
    patient_price_cents: ELEVATED_PROGRAMS.glp1.amount,
    member_price_cents: ELEVATED_PROGRAMS.glp1.amount,
    clinic_cost_cents: economicsCostForSlug("semaglutide"),
    requires_labs: true,
    lab_panel_slug: LAB_PANEL_SLUGS.expandedWeight,
    requires_consent: true,
    consent_type: "glp1",
    requires_provider_signoff: true,
    ordering_supplies_required: true,
    inventory_tracking_required: true,
    internal_notes: "Medication included in program — never quote legacy à la carte member/non-member split.",
    public_description:
      "Medical weight loss with compounded semaglutide or tirzepatide when clinically appropriate — gradual titration under physician oversight.",
    staff_description: "ELEVATED GLP-1 all-inclusive monthly; expanded panel at onboarding.",
    provider_algorithm: {
      protocolSlug: "glp1-semaglutide-titration",
      startDose: "Semaglutide 0.25 mg weekly × 4 weeks",
      escalationSchedule: "Increase per tolerance q4 weeks to maintenance 1–2.4 mg",
      frequency: "Weekly subQ",
      route: "Subcutaneous",
      monitoringLabs: ["Expanded panel baseline", "Quarterly CMP", "A1C"],
      followUpInterval: "Monthly RN; physician per escalation",
    },
    catalog_key: null,
    elevated_program_key: "glp1",
    policy_key: "semaglutide",
    margin_threshold_pct: 30,
  },
  {
    slug: "elevated_metabolic_recomposition",
    display_name: ELEVATED_PROGRAMS.metabolicRecomposition.name,
    category: "metabolic_program",
    public_status: "public",
    clinical_status: "active",
    supplier: "FCC / GC",
    supplier_sku: "STACK-METABOLIC-FULL",
    route: "subQ",
    dosage_form: "multi-compound program",
    patient_price_cents: ELEVATED_PROGRAMS.metabolicRecomposition.amount,
    member_price_cents: ELEVATED_PROGRAMS.metabolicRecomposition.amount,
    clinic_cost_cents: economicsCostForSlug("STACK-METABOLIC-FULL"),
    requires_labs: true,
    lab_panel_slug: LAB_PANEL_SLUGS.expandedWeight,
    requires_consent: true,
    consent_type: "glp1",
    requires_provider_signoff: true,
    ordering_supplies_required: true,
    inventory_tracking_required: true,
    internal_notes: "Retatrutide program-only — policy override 2026-06-14 Dr. Akers. Not casual à la carte.",
    public_description:
      "Advanced 90-day provider-directed metabolic recomposition — not a walk-in add-on. Retatrutide only within this structured program.",
    staff_description: "Physician enrollment required; do not quote retatrutide outside this stack.",
    provider_algorithm: { protocolSlug: "metabolic-recomposition-stack" },
    catalog_key: null,
    elevated_program_key: "metabolicRecomposition",
    policy_key: "retatrutide",
    margin_threshold_pct: 35,
  },
  fromCatalogKey("semaglutide", MEDICATION_FILLS.semaglutide.name, "glp1_weight_loss", "semaglutide", {
    public_status: "provider_only",
    lab_panel_slug: LAB_PANEL_SLUGS.expandedWeight,
    consent_type: "glp1",
    elevated_program_key: "glp1",
    public_description: "Single fill when enrolled outside program — provider directs.",
    provider_algorithm: { protocolSlug: "glp1-semaglutide-titration" },
  }),
  fromCatalogKey("tirzepatide", MEDICATION_FILLS.tirzepatide.name, "glp1_weight_loss", "tirzepatide", {
    public_status: "provider_only",
    lab_panel_slug: LAB_PANEL_SLUGS.expandedWeight,
    consent_type: "glp1",
    elevated_program_key: "glp1",
    provider_algorithm: { protocolSlug: "glp1-tirzepatide-titration" },
  }),
  fromCatalogKey("retatrutide-provider-directed", MEDICATION_FILLS.retatrutide.name, "metabolic_program", "retatrutide", {
    public_status: "provider_only",
    clinical_status: "policy_review",
    lab_panel_slug: LAB_PANEL_SLUGS.expandedWeight,
    consent_type: "glp1",
    elevated_program_key: "metabolicRecomposition",
    internal_notes: "À la carte fill exists in Stripe but clinic policy is program-only.",
    public_description: "Advanced metabolic care only — within ELEVATED Metabolic Recomposition when approved.",
    provider_algorithm: { protocolSlug: "metabolic-recomposition-stack" },
  }),
  // Peptides
  fromCatalogKey("sermorelin", PEPTIDE_PRODUCTS.sermorelin.name, "peptide_vitality", "sermorelin", {
    consent_type: "research_peptide",
    provider_algorithm: { protocolSlug: "peptide-sermorelin" },
  }),
  fromCatalogKey("cjc-ipamorelin", PEPTIDE_PRODUCTS.cjc1295Ipamorelin.name, "peptide_vitality", "cjc1295Ipamorelin", {
    consent_type: "research_peptide",
    provider_algorithm: { protocolSlug: "peptide-cjc-ipamorelin" },
  }),
  fromCatalogKey("tesamorelin", PEPTIDE_PRODUCTS.tesamorelin.name, "peptide_vitality", "tesamorelin", {
    consent_type: "research_peptide",
    provider_algorithm: { protocolSlug: "peptide-tesamorelin" },
  }),
  fromCatalogKey("nad", PEPTIDE_PRODUCTS.nadInjection.name, "peptide_cellular", "nadInjection", {
    requires_consent: false,
    provider_algorithm: { protocolSlug: "peptide-nad-subq" },
  }),
  fromCatalogKey("ghk_cu_sublingual", PEPTIDE_PRODUCTS.ghkCuSublingual.name, "peptide_aesthetic", "ghkCuSublingual", {
    provider_algorithm: { protocolSlug: "peptide-ghk-cu" },
  }),
  fromCatalogKey("pt_141", SEXUAL_WELLNESS_PRODUCTS.pt141.name, "peptide_sexual", "pt141", {
    lab_panel_slug: LAB_PANEL_SLUGS.sexualWellness,
    public_description: "PT-141 (bremelanotide) for libido support when clinically appropriate.",
    provider_algorithm: { protocolSlug: "sexual-pt141" },
  }),
  fromCatalogKey("ss-31-provider-only", METABOLIC_STACK_ALACARTE.ss31.name, "peptide_metabolic", "ss31", {
    public_status: "provider_only",
    consent_type: "research_peptide",
    provider_algorithm: { protocolSlug: "metabolic-ss31" },
  }),
  fromCatalogKey("aod-9604", METABOLIC_STACK_ALACARTE.aod9604.name, "peptide_metabolic", "aod9604", {
    public_status: "provider_only",
    provider_algorithm: { protocolSlug: "metabolic-aod9604" },
  }),
  fromCatalogKey("slu-pp-332-provider-only", METABOLIC_STACK_ALACARTE.sluPp332.name, "peptide_metabolic", "sluPp332", {
    public_status: "provider_only",
    provider_algorithm: { protocolSlug: "metabolic-slu-pp332" },
  }),
  fromCatalogKey("5-amino-1mq-provider-only", METABOLIC_STACK_ALACARTE.fiveAmino1mq.name, "peptide_metabolic", "fiveAmino1mq", {
    public_status: "provider_only",
    provider_algorithm: { protocolSlug: "metabolic-5-amino-1mq" },
  }),
  {
    slug: "recovery-peptide-review",
    display_name: "Recovery Peptide Review",
    category: "peptide_recovery",
    public_status: "public",
    clinical_status: "active",
    supplier: null,
    supplier_sku: null,
    route: null,
    dosage_form: "care pathway",
    patient_price_cents: CORE_SERVICES.wellnessAssessment.amount,
    member_price_cents: CORE_SERVICES.wellnessAssessment.amount,
    clinic_cost_cents: null,
    requires_labs: true,
    lab_panel_slug: LAB_PANEL_SLUGS.foundational,
    requires_consent: true,
    consent_type: "research_peptide",
    requires_provider_signoff: true,
    ordering_supplies_required: false,
    inventory_tracking_required: false,
    supply_checklist_key: "recovery_peptide",
    internal_notes: "Front-door pathway — not a compound SKU. Gates BPC/TB/stack/PDA selection.",
    regulatory_notes: "Cat 2 research peptides require Research Peptide Consent and malignancy screen.",
    public_description:
      "Structured clinical review for recovery peptide protocols — assessment, safety screens, labs, consent, and provider sign-off before any compound is discussed.",
    staff_description: "Route injury/training/joint-tendon recovery interest here. Do not quote compounds until gates pass.",
    provider_algorithm: { protocolSlug: "recovery-peptide-review" },
    catalog_key: null,
    elevated_program_key: null,
    policy_key: "recovery_peptide_review",
    margin_threshold_pct: 0,
    last_reviewed_at: "2026-06-16",
    reviewed_by: "Dr. Troy Akers",
  },
  {
    slug: "pda-pentadeca-arginate",
    display_name: "Pentadeca Arginate (PDA)",
    category: "peptide_recovery",
    public_status: "public",
    clinical_status: "active",
    supplier: "FCC",
    supplier_sku: null,
    route: "oral",
    dosage_form: "capsule",
    patient_price_cents: 24900,
    member_price_cents: 19900,
    clinic_cost_cents: economicsCostForSlug("pda-pentadeca-arginate") ?? 8500,
    requires_labs: true,
    lab_panel_slug: LAB_PANEL_SLUGS.foundational,
    requires_consent: true,
    consent_type: "research_peptide",
    requires_provider_signoff: true,
    ordering_supplies_required: false,
    inventory_tracking_required: false,
    supply_checklist_key: "oral_capsule",
    internal_notes: "Optional oral alternate when physician selects PDA instead of injectable recovery peptides.",
    regulatory_notes: "Provider-selected optional alternate after Recovery Peptide Review.",
    public_description:
      "Oral recovery support — optional when clinically appropriate after Recovery Peptide Review.",
    staff_description: "Recovery Peptide Review lane; optional alternate to BPC-157 / TB-500 when physician selects oral route.",
    provider_algorithm: { protocolSlug: "recovery-pda" },
    catalog_key: null,
    elevated_program_key: null,
    policy_key: "pda",
    margin_threshold_pct: 25,
    last_reviewed_at: "2026-06-16",
    reviewed_by: "Dr. Troy Akers",
  },
  {
    slug: "bpc-157",
    display_name: "BPC-157",
    category: "peptide_recovery",
    public_status: "public",
    clinical_status: "active",
    supplier: "FCC",
    supplier_sku: null,
    route: "subQ",
    dosage_form: "injectable",
    patient_price_cents: economicsPriceForHealingStack().patient,
    member_price_cents: economicsPriceForHealingStack().member,
    clinic_cost_cents: economicsCostForSlug("bpc-157"),
    requires_labs: true,
    lab_panel_slug: LAB_PANEL_SLUGS.foundational,
    requires_consent: true,
    consent_type: "research_peptide",
    requires_provider_signoff: true,
    ordering_supplies_required: true,
    inventory_tracking_required: true,
    supply_checklist_key: "recovery_peptide",
    internal_notes: "Recovery Peptide Review lane required. Cat 2 research peptide consent.",
    regulatory_notes: "FDA Cat 2 bulk substance — research peptide consent required.",
    public_description:
      "Injectable recovery peptide — available only after provider review, safety screening, and when clinically appropriate.",
    staff_description: "Recovery Peptide Review lane; confirm consent, malignancy screen, and economics before quote.",
    provider_algorithm: { protocolSlug: "recovery-bpc157" },
    catalog_key: null,
    elevated_program_key: null,
    policy_key: "bpc_157",
    margin_threshold_pct: 25,
    last_reviewed_at: "2026-06-16",
    reviewed_by: "Dr. Troy Akers",
  },
  {
    slug: "tb-500",
    display_name: "TB-500 (Thymosin Beta-4)",
    category: "peptide_recovery",
    public_status: "public",
    clinical_status: "active",
    supplier: "FCC",
    supplier_sku: null,
    route: "subQ",
    dosage_form: "injectable",
    patient_price_cents: economicsPriceForHealingStack().patient,
    member_price_cents: economicsPriceForHealingStack().member,
    clinic_cost_cents: economicsCostForSlug("tb-500"),
    requires_labs: true,
    lab_panel_slug: LAB_PANEL_SLUGS.foundational,
    requires_consent: true,
    consent_type: "research_peptide",
    requires_provider_signoff: true,
    ordering_supplies_required: true,
    inventory_tracking_required: true,
    supply_checklist_key: "recovery_peptide",
    internal_notes: "Recovery Peptide Review lane. WADA prohibited — disclose to athletes.",
    regulatory_notes: "WADA prohibited — athlete disclosure required.",
    public_description:
      "Injectable recovery peptide — available only after provider review and when clinically appropriate.",
    staff_description: "Recovery Peptide Review lane; athlete/WADA disclosure required.",
    provider_algorithm: { protocolSlug: "recovery-tb500" },
    catalog_key: null,
    elevated_program_key: null,
    policy_key: "tb_500",
    margin_threshold_pct: 25,
    last_reviewed_at: "2026-06-16",
    reviewed_by: "Dr. Troy Akers",
  },
  {
    slug: "bpc-157-tb-500-stack",
    display_name: "BPC-157 / TB-500 Recovery Stack",
    category: "peptide_recovery",
    public_status: "public",
    clinical_status: "active",
    supplier: "FCC / GC",
    supplier_sku: "PATH-Wolverine-10x10",
    route: "subQ",
    dosage_form: "injectable blend",
    patient_price_cents: economicsPriceForHealingStack().patient,
    member_price_cents: economicsPriceForHealingStack().member,
    clinic_cost_cents: economicsCostForSlug("bpc-157-tb-500-stack"),
    requires_labs: true,
    lab_panel_slug: LAB_PANEL_SLUGS.foundational,
    requires_consent: true,
    consent_type: "research_peptide",
    requires_provider_signoff: true,
    ordering_supplies_required: true,
    inventory_tracking_required: true,
    supply_checklist_key: "recovery_peptide",
    internal_notes: "Pre-blended recovery stack — internal SKU naming only; no patient-facing 'Wolverine' copy.",
    regulatory_notes: "Cat 2 research peptide consent; blended vial per FCC/GC formulary.",
    public_description:
      "Combined BPC-157 and TB-500 recovery protocol when physician selects the stack after full review.",
    staff_description: "Recovery Peptide Review lane; blended vial per FCC/GC formulary.",
    provider_algorithm: { protocolSlug: "recovery-bpc-tb-stack" },
    catalog_key: null,
    elevated_program_key: null,
    policy_key: "wolverine_stack",
    margin_threshold_pct: 25,
    last_reviewed_at: "2026-06-16",
    reviewed_by: "Dr. Troy Akers",
  },
  // Hormones
  {
    slug: "elevated_trt",
    display_name: ELEVATED_PROGRAMS.trt.name,
    category: "hormone_male",
    public_status: "public",
    clinical_status: "active",
    supplier: "Custom Pharmacy of Evans",
    supplier_sku: null,
    route: "IM/subQ",
    dosage_form: "injectable",
    patient_price_cents: ELEVATED_PROGRAMS.trt.amount,
    member_price_cents: ELEVATED_PROGRAMS.trt.amount,
    clinic_cost_cents: economicsCostForSlug("testosterone"),
    requires_labs: true,
    lab_panel_slug: LAB_PANEL_SLUGS.maleHormone,
    requires_consent: true,
    consent_type: "hormone_therapy",
    requires_provider_signoff: true,
    ordering_supplies_required: true,
    inventory_tracking_required: false,
    internal_notes: null,
    public_description: "Lab-guided testosterone optimization for men — medication included in program.",
    staff_description: "Male hormone panel at onboarding; injectable-first TRT.",
    provider_algorithm: { protocolSlug: "hormone-trt-male" },
    catalog_key: null,
    elevated_program_key: "trt",
    policy_key: "testosterone_cypionate",
    margin_threshold_pct: 30,
  },
  {
    slug: "elevated_hrt",
    display_name: ELEVATED_PROGRAMS.hrt.name,
    category: "hormone_female",
    public_status: "public",
    clinical_status: "active",
    supplier: "Custom Pharmacy of Evans / DrFirst",
    supplier_sku: null,
    route: "transdermal / oral",
    dosage_form: "cream / troche",
    patient_price_cents: ELEVATED_PROGRAMS.hrt.amount,
    member_price_cents: ELEVATED_PROGRAMS.hrt.amount,
    clinic_cost_cents: economicsCostForSlug("biEst"),
    requires_labs: true,
    lab_panel_slug: LAB_PANEL_SLUGS.femaleHormone,
    requires_consent: true,
    consent_type: "hormone_therapy",
    requires_provider_signoff: true,
    ordering_supplies_required: true,
    inventory_tracking_required: false,
    internal_notes: null,
    public_description: "Bioidentical hormone replacement for women — lab-guided, physician-reviewed.",
    staff_description: "Female hormone panel; Bi-Est cream lead product.",
    provider_algorithm: { protocolSlug: "hormone-bhrt-female" },
    catalog_key: null,
    elevated_program_key: "hrt",
    policy_key: "bi_est_cream",
    margin_threshold_pct: 30,
  },
  // Labs (reference)
  {
    slug: "comprehensive_panel",
    display_name: CORE_SERVICES.comprehensivePanel.name,
    category: "lab_optimization",
    public_status: "public",
    clinical_status: "active",
    supplier: "LabCorp",
    supplier_sku: null,
    route: null,
    dosage_form: null,
    patient_price_cents: CORE_SERVICES.comprehensivePanel.amount,
    member_price_cents: memberPriceCents(CATALOG.comprehensivePanel),
    clinic_cost_cents: null,
    requires_labs: false,
    lab_panel_slug: LAB_PANEL_SLUGS.foundational,
    requires_consent: false,
    consent_type: null,
    requires_provider_signoff: false,
    ordering_supplies_required: false,
    inventory_tracking_required: false,
    internal_notes: "Enter EHA LabCorp COGS in /lab-catalog when billing live.",
    public_description: LAB_PANEL_DISPLAY_NAMES["foundation-wellness"] ?? "Comprehensive wellness labs",
    staff_description: "Maps to comprehensive Stripe checkout ($199).",
    provider_algorithm: null,
    catalog_key: "comprehensivePanel",
    elevated_program_key: null,
    policy_key: null,
    margin_threshold_pct: 20,
  },
  {
    slug: "expanded_panel",
    display_name: CORE_SERVICES.expandedPanel.name,
    category: "lab_optimization",
    public_status: "public",
    clinical_status: "active",
    supplier: "LabCorp",
    supplier_sku: null,
    route: null,
    dosage_form: null,
    patient_price_cents: CORE_SERVICES.expandedPanel.amount,
    member_price_cents: memberPriceCents(CATALOG.expandedPanel),
    clinic_cost_cents: null,
    requires_labs: false,
    lab_panel_slug: LAB_PANEL_SLUGS.expandedWeight,
    requires_consent: false,
    consent_type: null,
    requires_provider_signoff: false,
    ordering_supplies_required: false,
    inventory_tracking_required: false,
    internal_notes: null,
    public_description: "Expanded metabolic baseline for GLP-1 and weight optimization.",
    staff_description: "Maps to expanded Stripe checkout ($299).",
    provider_algorithm: null,
    catalog_key: "expandedPanel",
    elevated_program_key: null,
    policy_key: null,
    margin_threshold_pct: 20,
  },
  // Blocked legacy
  {
    slug: "ketamine",
    display_name: "Ketamine / Spravato",
    category: "program_membership",
    public_status: "inactive",
    clinical_status: "inactive",
    supplier: null,
    supplier_sku: null,
    route: null,
    dosage_form: null,
    patient_price_cents: null,
    member_price_cents: null,
    clinic_cost_cents: null,
    requires_labs: false,
    lab_panel_slug: null,
    requires_consent: false,
    consent_type: null,
    requires_provider_signoff: true,
    ordering_supplies_required: false,
    inventory_tracking_required: false,
    internal_notes: "Legacy Réveil — not offered.",
    public_description: "Not offered at Elevated Health Augusta.",
    staff_description: "Redirect to appropriate wellness services.",
    provider_algorithm: null,
    catalog_key: null,
    elevated_program_key: null,
    policy_key: "ketamine",
    margin_threshold_pct: 0,
  },
];

export function catalogBySlug(slug: string): ClinicalOptimizationItem | undefined {
  const canonical = CATALOG_SLUG_ALIASES[slug] ?? slug;
  return CLINICAL_OPTIMIZATION_CATALOG.find((i) => i.slug === canonical);
}

export function itemGrossProfitCents(item: ClinicalOptimizationItem): number | null {
  if (item.patient_price_cents == null || item.clinic_cost_cents == null) return null;
  return item.patient_price_cents - item.clinic_cost_cents;
}

export function itemMemberMarginPercent(item: ClinicalOptimizationItem): number | null {
  return marginPct(item.clinic_cost_cents, item.member_price_cents);
}

export function publicCatalogItems(): ClinicalOptimizationItem[] {
  return CLINICAL_OPTIMIZATION_CATALOG.filter((i) => i.public_status === "public");
}

export function staffQuotableItems(): ClinicalOptimizationItem[] {
  return CLINICAL_OPTIMIZATION_CATALOG.filter(
    (i) =>
      i.clinical_status === "active" &&
      i.public_status !== "inactive" &&
      i.slug !== "ketamine",
  );
}

export function itemMarginPercent(item: ClinicalOptimizationItem): number | null {
  return marginPct(item.clinic_cost_cents, item.patient_price_cents);
}

export function canStaffQuote(item: ClinicalOptimizationItem): {
  ok: boolean;
  blockers: string[];
} {
  const blockers: string[] = [];
  if (item.clinical_status !== "active") blockers.push(`Clinical status: ${item.clinical_status}`);
  if (item.public_status === "inactive") blockers.push("Inactive");
  if (item.patient_price_cents == null) blockers.push("Missing patient price");
  if (item.ordering_supplies_required && !item.supplier) blockers.push("Missing supplier");
  if (item.clinic_cost_cents == null) blockers.push("Missing clinic cost");
  const m = itemMarginPercent(item);
  if (m != null && m < item.margin_threshold_pct) {
    blockers.push(`Margin ${m}% below threshold ${item.margin_threshold_pct}%`);
  }
  if (item.requires_consent && !item.consent_type) blockers.push("Missing consent type");
  return { ok: blockers.length === 0, blockers };
}

export function labPanelLabel(slug: string | null): string {
  if (!slug) return "—";
  return LAB_PANEL_DISPLAY_NAMES[slug as keyof typeof LAB_PANEL_DISPLAY_NAMES] ?? slug;
}
