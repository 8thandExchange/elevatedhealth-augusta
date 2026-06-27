/**
 * Staff formulary & pricing cheat sheet — patient-facing prices only.
 * Aligns with stripeConfig, ivTherapiesCatalog, and pricing_source_of_truth.md.
 */
import { IV_ADDONS_CATALOG } from "./ivAddonsCatalog";
import { IV_THERAPIES_CATALOG } from "./ivTherapiesCatalog";
import { MEMBER_DISCOUNT_PERCENT, fmtUsd, labMemberCents } from "./pricing";
import {
  CORE_SERVICES,
  ELEVATED_COMBO_ADDONS,
  ELEVATED_PROGRAMS,
  GLP1_PROGRAM_VARIANTS,
  HAIR_RESTORATION_PRODUCTS,
  MEDICATION_FILLS,
  METABOLIC_STACK_ALACARTE,
  PEPTIDE_PRODUCTS,
  RECOVERY_PEPTIDE_PRODUCTS,
  SEXUAL_WELLNESS_PRODUCTS,
} from "./stripeConfig";
import { TIER_INCLUSION_ROWS } from "./businessOpsGuideContent";

export const CHEAT_SHEET_META = {
  title: "Formulary & Pricing Cheat Sheet",
  subtitle: "Memberships · IV · Hormones · GLP-1 · Peptides",
  version: "1.0.0",
  effectiveDate: "2026-06-26",
  classification: "Internal — staff reference",
  clinic: "Elevated Health Augusta",
  address: "7013 Evans Town Center Blvd, Suite 203, Evans, GA 30809",
  phone: "(706) 760-3470",
  domain: "elevatedhealthaugusta.com",
} as const;

export const CHEAT_SHEET_FILENAME_BASE = `EHA-Formulary-Cheat-Sheet-v${CHEAT_SHEET_META.version}-${CHEAT_SHEET_META.effectiveDate}`;

const member = (cents: number) => fmtUsd(labMemberCents(cents));

/** Recovery stack — live Stripe SKU; not grouped in RECOVERY_PEPTIDE_PRODUCTS. */
export const RECOVERY_STACK = {
  name: "BPC-157 / TB-500 Recovery Stack",
  nonMemberCents: 34900,
  displayPrice: "$349",
  memberDisplay: member(34900),
  note: "Consult-gated · Research Peptide Consent · never say “Wolverine” to patients",
} as const;

export const QUICK_REFERENCE = [
  { label: "Front door", value: `${CORE_SERVICES.wellnessAssessment.displayPrice} Wellness Assessment` },
  { label: "Member discount", value: `${MEMBER_DISCOUNT_PERCENT}% off all à la carte` },
  { label: "Payment", value: "Card · Klarna · Affirm · superbills on request" },
  { label: "Lane A", value: "IV Lounge — walk-in, no consult" },
  { label: "Lane B", value: "Hormones · GLP-1 · peptides — consult-gated" },
] as const;

export const MEMBERSHIP_ROWS = [
  {
    name: ELEVATED_PROGRAMS.wellness.name,
    price: ELEVATED_PROGRAMS.wellness.displayPrice,
    medication: "None (IV-only)",
    labs: "Not included",
    highlight: "2 signature drips/mo · 20% off add-ons · priority booking",
  },
  {
    name: ELEVATED_PROGRAMS.hrt.name,
    price: ELEVATED_PROGRAMS.hrt.displayPrice,
    medication: "Bi-Est + progesterone (+ T cream if Rx)",
    labs: "Quarterly Comprehensive ($199 value)",
    highlight: "Cream only — no troches",
  },
  {
    name: ELEVATED_PROGRAMS.trt.name,
    price: ELEVATED_PROGRAMS.trt.displayPrice,
    medication: "Testosterone cream (daily)",
    labs: "Quarterly Comprehensive ($199 value)",
    highlight: "No injections · no anastrozole · no HCG",
  },
  {
    name: ELEVATED_PROGRAMS.glp1.name,
    price: GLP1_PROGRAM_VARIANTS.semaglutide.displayPrice + " · " + GLP1_PROGRAM_VARIANTS.tirzepatide.displayPrice,
    medication: "Compounded semaglutide OR tirzepatide",
    labs: "Quarterly Expanded ($299 value)",
    highlight: "Price locked to molecule — titration does not change monthly rate",
  },
] as const;

export const COMBO_ADDON_ROWS = Object.values(ELEVATED_COMBO_ADDONS).map((a) => [
  a.name.replace("ELEVATED ", "").replace(" Medication Add-On", ""),
  a.displayPrice,
  "Medication only — no duplicate RN/labs/messaging",
]);

export const MEMBERSHIP_INCLUDES = TIER_INCLUSION_ROWS.map(([, detail]) => detail);

export const NOT_INCLUDED = [
  `Initial ${CORE_SERVICES.wellnessAssessment.displayPrice} Wellness Assessment + baseline labs (${CORE_SERVICES.comprehensivePanel.displayPrice} or ${CORE_SERVICES.expandedPanel.displayPrice})`,
  `Patient-requested ${CORE_SERVICES.medicalReview.displayPrice} Medical Review`,
  "À la carte beyond plan inclusions (members get 20% off)",
] as const;

export const VISIT_LAB_ROWS = [
  [CORE_SERVICES.wellnessAssessment.name, CORE_SERVICES.wellnessAssessment.displayPrice, "RN intake · universal front door"],
  ["Maintenance Visit", CORE_SERVICES.wellnessAssessment.displayPrice, "RN follow-up under standing orders"],
  [CORE_SERVICES.medicalReview.name, CORE_SERVICES.medicalReview.displayPrice, "Physician · complex cases / patient-requested"],
  [CORE_SERVICES.phoneFollowUp.name, CORE_SERVICES.phoneFollowUp.displayPrice, "Physician phone · non-members"],
  [CORE_SERVICES.rebookingFee.name, CORE_SERVICES.rebookingFee.displayPrice, "Late cancel / no-show"],
  [CORE_SERVICES.comprehensivePanel.name, CORE_SERVICES.comprehensivePanel.displayPrice, "Hormone baseline · member quarterly included on Rx programs"],
  [CORE_SERVICES.expandedPanel.name, CORE_SERVICES.expandedPanel.displayPrice, "GLP-1 / metabolic baseline · member quarterly on GLP-1"],
] as const;

export const IV_DRIP_ROWS = IV_THERAPIES_CATALOG.map((d) => [
  d.name,
  `$${d.price}`,
  member(d.price * 100),
  d.category,
  (d.ingredients ?? []).join(" · "),
]);

export const IV_ADDON_ROWS = IV_ADDONS_CATALOG.map((a) => [
  a.name,
  `$${a.price}`,
  member(a.price * 100),
  a.description ?? "",
]);

export const HORMONE_FILL_ROWS = [
  [MEDICATION_FILLS.testosterone.name, MEDICATION_FILLS.testosterone.displayPrice, member(MEDICATION_FILLS.testosterone.amount), "Included on ELEVATED TRT"],
  [MEDICATION_FILLS.biEst.name, MEDICATION_FILLS.biEst.displayPrice, member(MEDICATION_FILLS.biEst.amount), "Included on ELEVATED HRT"],
  [MEDICATION_FILLS.progesterone.name, MEDICATION_FILLS.progesterone.displayPrice, member(MEDICATION_FILLS.progesterone.amount), "Included on ELEVATED HRT"],
] as const;

export const GLP1_ROWS = [
  [GLP1_PROGRAM_VARIANTS.semaglutide.name, GLP1_PROGRAM_VARIANTS.semaglutide.displayPrice, "All-inclusive program"],
  [GLP1_PROGRAM_VARIANTS.tirzepatide.name, GLP1_PROGRAM_VARIANTS.tirzepatide.displayPrice, "All-inclusive program"],
  [MEDICATION_FILLS.semaglutide.name, MEDICATION_FILLS.semaglutide.displayPrice, member(MEDICATION_FILLS.semaglutide.amount), "Single fill · non-member / between programs"],
  [MEDICATION_FILLS.tirzepatide.name, MEDICATION_FILLS.tirzepatide.displayPrice, member(MEDICATION_FILLS.tirzepatide.amount), "Single fill"],
  [MEDICATION_FILLS.retatrutide.name, MEDICATION_FILLS.retatrutide.displayPrice, member(MEDICATION_FILLS.retatrutide.amount), "Provider-gated · GLP-1 consent · never advertise"],
] as const;

const activePeptideKeys = ["sermorelin", "cjc1295Ipamorelin", "tesamorelin", "ghkCuTopical"] as const;

export const PEPTIDE_MONTHLY_ROWS = activePeptideKeys.map((key) => {
  const p = PEPTIDE_PRODUCTS[key];
  return [p.name, p.displayPrice, member(p.amount), "Consult-gated · monthly"];
});

export const RECOVERY_PEPTIDE_ROWS = [
  ...Object.values(RECOVERY_PEPTIDE_PRODUCTS).map((p) => [
    p.name,
    p.displayPrice,
    member(p.amount),
    "One-time fill · Research Peptide Consent",
  ]),
  [
    RECOVERY_STACK.name,
    RECOVERY_STACK.displayPrice,
    RECOVERY_STACK.memberDisplay,
    RECOVERY_STACK.note,
  ],
];

export const METABOLIC_PEPTIDE_ROWS = Object.values(METABOLIC_STACK_ALACARTE).map((p) => [
  p.name,
  p.displayPrice,
  member(p.amount),
  "Provider-only · standalone (no bundled metabolic program)",
]);

export const SEXUAL_WELLNESS_ROWS = Object.values(SEXUAL_WELLNESS_PRODUCTS).map((p) => [
  p.name,
  p.displayPrice,
  member(p.amount),
  "Launch-hidden — do not promote on storefront",
]);

export const HAIR_ROWS = Object.values(HAIR_RESTORATION_PRODUCTS).map((p) => [
  p.name,
  p.displayPrice,
  member(p.amount),
  "Launch-hidden — do not promote on storefront",
]);

export const POLICY_BULLETS = [
  "Medication is INCLUDED in ELEVATED TRT / HRT / GLP-1 — never say “plus pharmacy costs.”",
  "NAD+ is ONLY the $50 IV booster push — no peptide NAD+, no standalone NAD+ infusion.",
  "Ketamine / Spravato — not offered (legacy).",
  "Retatrutide — physician-selected within GLP-1 lane only; full consent; never headline or advertise.",
  "Injectable TRT (cypionate) — not offered. Anastrozole and HCG — not offered.",
  "Cash pay · no insurance billing · itemized receipts & superbills on request.",
  "Benefits end on membership cancel: quarterly labs revert to full price; 20% discount ends.",
] as const;
