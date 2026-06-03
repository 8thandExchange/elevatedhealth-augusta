/** Marketing lead + services hub — no PHI in free-text health fields. */

export const LEAD_AREA_OPTIONS = [
  { value: "iv_therapy", label: "IV Therapy" },
  { value: "hormone_optimization", label: "Hormone Optimization" },
  { value: "peptide_therapy", label: "Peptide Therapy" },
  { value: "medical_weight_loss", label: "Medical Weight Loss" },
  { value: "membership", label: "Elevated Membership ($199/mo)" },
  { value: "general", label: "General / Not sure yet" },
] as const;

export type LeadAreaValue = (typeof LEAD_AREA_OPTIONS)[number]["value"];

export const SERVICE_PILLARS = [
  {
    title: "IV Therapy",
    description: "Walk-in hydration and nutrient infusions in Evans — Myers, glutathione, NAD+, and custom IV builds.",
    href: "/iv-lounge",
    cta: "Explore IV Lounge",
  },
  {
    title: "Hormone Optimization",
    description: "Physician-supervised TRT and BHRT with LabCorp labs and compounded protocols when clinically appropriate.",
    href: "/hormones",
    cta: "Hormone programs",
    subLinks: [
      { label: "Men's TRT", href: "/hormones-men" },
      { label: "Women's BHRT", href: "/hormones-women" },
    ],
  },
  {
    title: "Peptide Therapy",
    description:
      "Consult-gated peptide protocols — Restore, Healing, and Vitality stacks plus à la carte options, prescribed and monitored in clinic.",
    href: "/peptides",
    cta: "Peptide therapy",
  },
  {
    title: "Medical Weight Loss",
    description:
      "Medically supervised weight management with compounded semaglutide and tirzepatide after consultation and evaluation.",
    href: "/weight-loss",
    cta: "Weight programs",
  },
  {
    title: "Elevated Membership",
    description: "One membership — $199/month — member pricing on labs, programs, and eligible services.",
    href: "/membership",
    cta: "Membership",
  },
] as const;
