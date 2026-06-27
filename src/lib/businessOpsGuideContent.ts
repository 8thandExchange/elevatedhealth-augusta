/**
 * Business Operations Guide — plain-language pricing, margins, and formulary reference.
 * Staff hand-out edition. Patient prices align with stripeConfig; COGS from formulary economics.
 */

export const OPS_GUIDE_META = {
  title: "Elevated Health Augusta — Clinical Operations Handbook",
  subtitle: "Business operations + clinical SOPs + staff quick reference",
  version: "2.0.0",
  effectiveDate: "2026-06-26",
  owner: "Dr. Troy Akers / Dr. Dennis Williams",
  classification: "Internal — staff & clinical team only",
  address: "7013 Evans Town Center Blvd, Suite 203, Evans, GA 30809",
  phone: "(706) 760-3470",
  domain: "elevatedhealthaugusta.com",
} as const;

export const MEMBERSHIP_PLAN_ROWS = [
  ["ELEVATED IV", "$199 / mo", "None — non-Rx IV membership", "No labs included"],
  ["ELEVATED HRT (women)", "$229 / mo", "Bi-Est + progesterone cream", "Quarterly panel included"],
  ["ELEVATED TRT (men)", "$249 / mo", "Testosterone cream (no injections)", "Quarterly panel included"],
  ["ELEVATED GLP-1", "$349 sema / $449 tirz", "Compounded sema or tirz", "Quarterly panel included"],
] as const;

export const TIER_INCLUSION_ROWS = [
  [
    "ELEVATED IV — $199",
    "2 complimentary signature drips every month (any drip on the menu) · monthly RN check-in · unlimited messaging · priority booking · 20% off boosters & à la carte. No medication and no labs bundled.",
  ],
  [
    "ELEVATED HRT — $229",
    "Bi-Est cream + progesterone (plus testosterone cream if prescribed) · free quarterly hormone panel · monthly RN check-in · unlimited messaging · physician oversight · 20% off à la carte. Cream only — no troches.",
  ],
  [
    "ELEVATED TRT — $249",
    "Testosterone cream, daily and physician-titrated — no injections · free quarterly hormone panel · monthly RN check-in · unlimited messaging · physician oversight · 20% off à la carte.",
  ],
  [
    "ELEVATED GLP-1 — $349 / $449",
    "Compounded semaglutide OR tirzepatide · monthly dose titration · anti-nausea support when indicated · free quarterly expanded panel · monthly RN check-in · unlimited messaging · physician oversight · 20% off à la carte.",
  ],
] as const;

export const MEMBER_DISCOUNT_EXAMPLE_ROWS = [
  ["BPC-157 (recovery peptide)", "$249", "$199.20", "Not part of their plan → 20% off"],
  ["Extra Meyers IV drip", "$159", "$127.20", "Beyond the 2 included → 20% off"],
  ["Testosterone (for a TRT member)", "Included", "Included", "Already in their plan → no charge"],
  ["Quarterly panel (HRT/TRT member)", "$299 value", "$0", "Bundled in their membership"],
] as const;

export const OFFER_POLICY_ROWS = [
  ["NAD+", "ONLY as the $50 IV booster add-on", "No NAD+ injection, troche, nasal, or standalone infusion"],
  ["Peptides", "À la carte, after a Wellness Assessment", "Not a walk-in or online self-serve menu"],
  ["IV drips", "Walk-in at the IV Lounge, no consult", "Screening questions still required"],
  ["Retatrutide", "Physician-gated, full consent only ($449)", "Not advertised; not casual à la carte"],
  ["Ketamine / Spravato", "Not offered", "Legacy service — we do not provide it"],
  ["Sexual wellness / hair", "Hidden at launch", "Exists but not promoted yet"],
] as const;

export const PROGRAM_ECONOMICS_ROWS = [
  ["ELEVATED TRT (men)", "$249", "$36", "$57", "$93", "$156", "63%"],
  ["ELEVATED HRT (women)", "$229", "$58", "$61", "$119", "$110", "48%"],
  ["GLP-1 — Semaglutide", "$349", "$107", "$63", "$170", "$179", "51%"],
  ["GLP-1 — Tirzepatide", "$449", "$185–240", "$63", "$248–303", "$146–201", "33–45%"],
  ["GLP-1 — Retatrutide (gated)", "$449", "$250", "$63", "$313", "$136", "30%"],
  ["ELEVATED IV", "$199", "$90", "n/a", "$90", "$109", "55%"],
] as const;

export const GLP1_FILL_ROWS = [
  ["Semaglutide single fill", "$75", "$299", "75%", "Headline weight product"],
  ["Tirzepatide single fill", "$185", "$399", "54%", "Headline weight product"],
  ["Retatrutide (monthly, gated)", "$250", "$449", "44%", "Physician-selected within GLP-1 lane"],
] as const;

export const PEPTIDE_ALACARTE_ROWS = [
  ["Tesamorelin", "$72", "$399", "82%"],
  ["SS-31 (Elamipretide)", "$50", "$249", "80%"],
  ["PT-141 (Bremelanotide)", "$49", "$225", "78%"],
  ["Healing / Wolverine stack", "$94", "$349", "73%"],
  ["CJC-1295 / Ipamorelin", "$79", "$179", "56%"],
  ["Sermorelin", "$65", "$149", "56%"],
  ["5-Amino-1MQ (caps)", "$79", "$119", "34%"],
] as const;

export const RECOVERY_PEPTIDE_ROWS = [
  ["BPC-157", "$66", "$249", "$199.20", "73%", "58%"],
  ["TB-500", "$66", "$249", "$199.20", "73%", "58%"],
  ["Wolverine (BPC + TB)", "$94", "$349", "$279.20", "73%", "58%"],
  ["PDA (Pentadeca Arginate)", "$85", "$249", "$199.20", "66%", "57%"],
] as const;

export const IV_DRIP_ROWS = [
  ["The Resurrection", "Recovery", "Saline · B-Complex · Zofran · Toradol", "$139"],
  ["The Meyers", "Wellness", "Saline · Magnesium · B-Complex · Calcium", "$159"],
  ["Beast Mode", "Performance", "Amino acids · B12 · Magnesium · Taurine", "$169"],
  ["The Shield", "Immunity", "Saline · Vitamin C · Zinc · B-Complex", "$149"],
  ["The Glow", "Glow", "Saline · Biotin · Vitamin C · Glutathione", "$159"],
] as const;

export const IV_ADDON_ROWS = [
  ["NAD+ Booster", "$7.00", "$50", "86%"],
  ["Glutathione Push", "$9.90", "$35", "72%"],
  ["B12 Shot", "$2.80", "$25", "89%"],
  ["Toradol Push", "$2.50", "$25", "90%"],
  ["Vitamin C Push", "$1.40", "$25", "94%"],
  ["Zofran Push", "$1.50", "$25", "94%"],
] as const;

export const HORMONE_SOURCING_ROWS = [
  ["Testosterone cream (men)", "Custom Pharmacy of Evans", "$30 / mo", "Empower backup $52.80"],
  ["Bi-Est cream (women)", "Custom Pharmacy of Evans", "$27 / mo", "Empower backup $58.10"],
  ["Progesterone caps (women)", "Custom Pharmacy of Evans", "$35 / mo", "Empower backup $24.00"],
] as const;

export const LAB_PRICING_ROWS = [
  ["Foundation Wellness (8 tests)", "$53.70", "$199", "73%", "$159", "66%"],
  ["Hormone — Male (16 tests)", "$170.65", "$299", "43%", "$239", "29%"],
  ["Hormone — Female (18 tests)", "$182.25", "$299", "39%", "$239", "24%"],
  ["Weight / Expanded (16 tests)", "$190.10", "$299", "36%", "$239", "21%"],
  ["Sexual Wellness (7 tests)", "$107.55", "$199", "46%", "$159", "32%"],
] as const;

export const LAB_COMPOSITION_ROWS = [
  [
    "Foundation Wellness (8)",
    "CBC · Comprehensive Metabolic Panel · Lipid panel · Hemoglobin A1c · hs-CRP · TSH · Vitamin D (25-OH) · Ferritin",
  ],
  [
    "Hormone — Male (16)",
    "All 8 Foundation tests + Total Testosterone · Free Testosterone · Estradiol (sensitive) · SHBG · LH · FSH · PSA · DHEA-Sulfate",
  ],
  [
    "Hormone — Female (18)",
    "All 8 Foundation tests + Estradiol (sensitive) · Progesterone · FSH · LH · Prolactin · DHEA-Sulfate · Free T3 · Free T4 · Total Testosterone · SHBG",
  ],
  [
    "Weight / Expanded (16)",
    "All 8 Foundation tests + Fasting insulin · Apolipoprotein B · Lipoprotein(a) · Leptin · Homocysteine · Folate · Vitamin B12 · Iron studies",
  ],
  [
    "Sexual Wellness (7)",
    "Total Testosterone · Free Testosterone · Estradiol (sensitive) · Prolactin · SHBG · DHEA-Sulfate · TSH",
  ],
] as const;

export const LAB_FREQUENCY_ROWS = [
  ["Foundation Wellness", "At onboarding with the Wellness Assessment; then annually or when clinically indicated"],
  [
    "Hormone — Male / Female",
    "Baseline before starting HRT/TRT, then included every quarter (every 3 months) while a member; extra recheck after a dose change when the physician orders it",
  ],
  ["Weight / Expanded", "Baseline before starting GLP-1, then included every quarter while a GLP-1 member"],
  ["Sexual Wellness", "Ordered when a patient is being worked up for sexual-wellness concerns"],
] as const;

export const VENDOR_SOURCING_ROWS = [
  ["Peptides + GLP-1", "FCC / GC (PATH)", "Empower (hormones / GLP-1 backup only)"],
  ["Hormone creams", "Custom Pharmacy of Evans", "Empower (backup)"],
  ["IV drips + add-ons (supplies)", "McKesson / Henry Schein", "—"],
  ["IV compounds", "FCC (Formulation Compounding Center)", "—"],
  ["Retail HRT (patches / gels)", "DrFirst Rcopia → patient's pharmacy", "On request"],
  ["Lab draws", "LabCorp client billing", "—"],
] as const;

export const RECENT_CHANGE_ROWS = [
  ["ELEVATED Wellness renamed", "Now ELEVATED IV — the non-Rx IV membership", "Live on site & receipts"],
  ["Standalone NAD+ retired", "NAD+ is only the $50 IV booster add-on", "Infusion & peptide NAD+ removed"],
  ["No separate peptides membership", "Peptides stay à la carte with the 20% member discount", "Decision recorded"],
  ["Retatrutide", "Offered — physician-gated GLP-1 option ($449)", "Full GLP-1 consent required"],
  ["Metabolic stack / SLU-PP-332 / AOD-9604", "Discontinued", "Off the menu"],
  ["Injectable TRT discontinued", "Men's TRT is testosterone cream only — no cypionate injections", "Off the menu"],
  ["Anastrozole & HCG removed", "Neither offered as part of TRT/HRT", "Off the menu"],
] as const;

export const MEMBERSHIP_CALLOUTS = {
  planIsProgram:
    "Each patient picks one ELEVATED plan and pays one all-inclusive monthly price. That price covers the plan's medication (for Rx plans), monthly RN check-in, unlimited messaging, physician oversight, and — for HRT, TRT, and GLP-1 — the quarterly lab panel. ELEVATED IV (renamed from ELEVATED Wellness) is the non-Rx plan: no medication and no labs bundled.",
  sharedBenefits:
    "Every plan: monthly RN check-in with Caroline · unlimited messaging · lab review and protocol adjustments by our physicians at no extra charge · anti-nausea support for GLP-1 when indicated · 20% off anything à la carte not already in their plan.",
  paidSeparately:
    "Getting started: $79 Wellness Assessment + baseline panel ($199 Foundation or $299 hormone/expanded). Extra physician consults beyond standard care ($149 Medical Review). À la carte outside their plan — members still get 20% off. Never discount twice on medication the plan already covers.",
  memberDiscount:
    "Members automatically get 20% off à la carte at checkout — same menu, lower price. Any ELEVATED plan unlocks the discount. It never applies to what their own plan already includes.",
  cancelPolicy:
    "The quarterly panel and 20% discount are member-only benefits. When membership cancels or lapses, the next quarterly panel bills at full à la carte pricing and all services revert to non-member prices. Re-enrolling restores benefits immediately. Say it plainly: \"While you're a member it's included; if you ever drop the membership, everything goes back to à la carte.\"",
  trtDelivery:
    "Men's TRT is testosterone cream only — applied daily, physician-titrated. We do not offer injectable (cypionate) TRT, anastrozole, or HCG.",
  nadBooster:
    "NAD+ is offered ONLY as the $50 IV booster add-on. Standalone NAD+ infusion and peptide NAD+ SKUs are retired. IV supplies from McKesson/Henry Schein; compounds from FCC. The two included drips on ELEVATED IV cover any signature drip; boosters are 20% off for members, not free.",
  labBundling:
    "For HRT, TRT, and GLP-1 members the quarterly panel is included at no separate charge. Prices above apply to onboarding baseline and à la carte orders. Foundation Wellness is the baseline draw; hormone and expanded panels build on those same eight tests.",
  marginNote:
    "Margins shown are product margins (patient price minus medication/supply cost) — not take-home profit after staff time, rent, and fees.",
} as const;

export const OPS_GUIDE_STATS = {
  membershipPlans: 4,
  priceRange: "$199–$449",
  memberDiscount: "20%",
  ivMenu: "5 signature drips + 6 boosters",
} as const;
