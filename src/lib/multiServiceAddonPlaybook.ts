/**
 * Multi-service add-on playbook — how to enroll TRT + GLP-1 + peptides competitively
 * without double-charging for care or eroding margin.
 *
 * Layer 1: Anchor program (owns RN, labs, messaging)
 * Layer 2: Medication add-on (second Rx lane on same subscription — saves $100/mo)
 * Layer 3+: Peptides (à la carte SKUs; member 20% off each line — separate subscriptions)
 *
 * Pricing source: elevatedComboPrograms.ts · docs/pricing/elevated_combo_programs.md
 */
import {
  COMBO_DUPLICATE_CARE_SAVINGS_CENTS,
  COMBO_SHARED_CARE_BULLETS,
  listComboOptions,
  quoteCombo,
  type ComboAnchorKey,
  type ComboSelection,
} from "./elevatedComboPrograms";
import { MEMBER_DISCOUNT_PERCENT, fmtUsd, labMemberCents } from "./pricing";
import { RECOVERY_STACK as RECOVERY_STACK_META } from "./formularyCheatSheetContent";
import { CORE_SERVICES, PEPTIDE_PRODUCTS } from "./stripeConfig";

export const MULTI_SERVICE_PLAYBOOK = {
  headline: "Multi-service add-on playbook",
  tagline: "Serve TRT + weight loss + peptides — one care bundle, medication add-ons, à la carte peptides",
  problem:
    "Patients want multiple lanes. Enrolling two full ELEVATED programs double-charges RN visits, messaging, and quarterly labs (~$100/mo waste). À la carte everything loses program value and lab bundling.",
  solution:
    "Three layers: (1) one anchor program owns the care bundle, (2) optional medication add-on for the second Rx lane on the same Stripe subscription, (3) peptides as separate SKUs with member 20% off — never duplicate the care bundle.",
} as const;

/** Staff enrollment steps — Provider Dashboard → Elevated Combo Selector. */
export const ENROLLMENT_STEPS = [
  `$79 Wellness Assessment + baseline labs (${CORE_SERVICES.comprehensivePanel.displayPrice} hormones · ${CORE_SERVICES.expandedPanel.displayPrice} if GLP-1 in mix)`,
  "Provider review — document all lanes: weight, hormones, recovery, vitality, metabolic adjuncts",
  "Pick anchor = primary clinical goal (weight → GLP-1 anchor; hormones → TRT/HRT anchor)",
  "If second Rx lane indicated → select medication add-on in Elevated Combo Selector (one subscription, two line items)",
  "Send combo checkout link OR update existing subscription via update-subscription-addon",
  "Peptides (layer 3): after consent + gates → separate Send Payment Link per SKU (member −20% each line)",
  "Quote total monthly = combo total + sum of peptide lines (show math on paper)",
  "Chart: elevated_program (anchor) + elevated_program_addon + peptide SKUs in care plan",
  "Staging OK: physician may start anchor only; add medication add-on after 8–12 weeks stable",
] as const;

export const STAFF_NEVER = [
  "Enroll two full ELEVATED programs for the same patient — always anchor + add-on ($100/mo lost + duplicate visits)",
  "Fold peptides into the combo subscription or invent custom bundle prices — leadership approval only",
  "Stack additional discounts on top of member 20% on peptides",
  "Say plus pharmacy costs on TRT/HRT/GLP-1 anchor or add-on lines",
  "Skip Expanded labs when GLP-1 is in the combo — one draw covers both lanes",
] as const;

export const STAFF_ALWAYS = [
  `"One visit, one lab cadence, both medications — you save $100/month vs two separate programs."`,
  `"Your anchor program includes RN check-ins, quarterly labs, and messaging. The add-on is medication only."`,
  `"Peptides bill separately at member pricing — we layer them after your core protocols are stable."`,
  "Use Elevated Combo Selector in provider portal — do not manually price-match in Stripe",
] as const;

export const MARGIN_GUARDRAILS = [
  `Medication add-ons priced at full program minus $${COMBO_DUPLICATE_CARE_SAVINGS_CENTS / 100} — preserves ~30%+ gross margin on drug COGS`,
  "Peptides: catalog price only; member discount = 20% per line — no extra stacking",
  "Recovery stack ($349) is the only published peptide bundle SKU — saves vs $498 à la carte BPC+TB",
  "If anchor + add-on + 2 peptides feels high, stage peptides — do not discount the combo",
] as const;

/** Full dual-lane combo matrix for staff quoting. */
export function buildComboMatrixRows(): string[][] {
  return listComboOptions().map((q) => {
    const comboLabel = q.addon
      ? `${q.anchor.label} + ${q.addon.label}`
      : q.anchor.label;
    const vsTwoFull = q.addon ? `Save ${q.savingsDisplay}/mo vs two full programs` : "Anchor only";
    return [
      comboLabel,
      q.totalDisplay,
      q.addon ? q.addon.addOnDisplayPrice : "—",
      vsTwoFull,
      q.onboardingLabDisplay + " once at start",
    ];
  });
}

export interface TripleServiceQuote {
  scenario: string;
  combo: ComboSelection;
  peptideLines: { name: string; nonMemberCents: number }[];
  steadyStateDisplay: string;
  month1Notes: string;
  staffScript: string;
}

function memberPeptide(cents: number): string {
  return fmtUsd(labMemberCents(cents));
}

function steadyTotal(comboCents: number, peptideCents: number[]): string {
  const peptideMember = peptideCents.reduce((s, c) => s + labMemberCents(c), 0);
  return fmtUsd(comboCents + peptideMember) + "/mo steady state";
}

/** Common triple-service scenarios staff should know cold. */
export function buildTripleServiceScenarios(): TripleServiceQuote[] {
  const scenarios: TripleServiceQuote[] = [
    {
      scenario: "Man · weight loss + TRT + recovery (BPC/TB stack)",
      combo: { anchor: "glp1_semaglutide", addon: "trt" },
      peptideLines: [{ name: RECOVERY_STACK_META.name, nonMemberCents: RECOVERY_STACK_META.nonMemberCents }],
      steadyStateDisplay: steadyTotal(quoteCombo({ anchor: "glp1_semaglutide", addon: "trt" }).totalMonthlyCents, []),
      month1Notes: `$79 consult + $299 Expanded labs + $498/mo combo starts + ${RECOVERY_STACK_META.displayPrice} stack (${memberPeptide(RECOVERY_STACK_META.nonMemberCents)} member)`,
      staffScript:
        "GLP-1 semaglutide program with TRT medication add-on — $498/mo all-in for both Rx lanes. Recovery stack is a separate one-time fill; member saves 20%.",
    },
    {
      scenario: "Woman · weight loss + HRT + sermorelin (vitality)",
      combo: { anchor: "glp1_tirzepatide", addon: "hrt" },
      peptideLines: [{ name: PEPTIDE_PRODUCTS.sermorelin.name, nonMemberCents: PEPTIDE_PRODUCTS.sermorelin.amount }],
      steadyStateDisplay: steadyTotal(
        quoteCombo({ anchor: "glp1_tirzepatide", addon: "hrt" }).totalMonthlyCents,
        [PEPTIDE_PRODUCTS.sermorelin.amount],
      ),
      month1Notes: `$79 + $299 Expanded + $578/mo combo + sermorelin ${PEPTIDE_PRODUCTS.sermorelin.displayPrice} (${memberPeptide(PEPTIDE_PRODUCTS.sermorelin.amount)} member)`,
      staffScript:
        "Tirzepatide anchor with HRT medication add-on — $578/mo. Sermorelin layers on as its own subscription once physician clears; member price $119/mo.",
    },
    {
      scenario: "Man · TRT anchor + semaglutide + CJC/Ipamorelin",
      combo: { anchor: "trt", addon: "glp1_semaglutide" },
      peptideLines: [
        { name: PEPTIDE_PRODUCTS.cjc1295Ipamorelin.name, nonMemberCents: PEPTIDE_PRODUCTS.cjc1295Ipamorelin.amount },
      ],
      steadyStateDisplay: steadyTotal(
        quoteCombo({ anchor: "trt", addon: "glp1_semaglutide" }).totalMonthlyCents,
        [PEPTIDE_PRODUCTS.cjc1295Ipamorelin.amount],
      ),
      month1Notes: `$79 + $299 Expanded + $498/mo combo + CJC ${PEPTIDE_PRODUCTS.cjc1295Ipamorelin.displayPrice} (${memberPeptide(PEPTIDE_PRODUCTS.cjc1295Ipamorelin.amount)} member)`,
      staffScript:
        "TRT-led combo with semaglutide add-on — $498/mo symmetric either anchor order. CJC/Ipamorelin added after stability review.",
    },
    {
      scenario: "Man · TRT + tirzepatide + BPC-157 (ongoing recovery fill)",
      combo: { anchor: "trt", addon: "glp1_tirzepatide" },
      peptideLines: [{ name: "BPC-157 fill", nonMemberCents: 24900 }],
      steadyStateDisplay: steadyTotal(quoteCombo({ anchor: "trt", addon: "glp1_tirzepatide" }).totalMonthlyCents, [24900]),
      month1Notes: `$79 + $299 Expanded + $598/mo combo + BPC $249 (${memberPeptide(24900)} member) per fill cycle`,
      staffScript:
        "Highest-demand men's stack — $598/mo for TRT + tirzepatide medication lanes. BPC is consult-gated fill, not in the combo.",
    },
  ];

  // Fix first scenario steady state — includes one-time stack in month1 only, not monthly
  scenarios[0].steadyStateDisplay =
    fmtUsd(quoteCombo({ anchor: "glp1_semaglutide", addon: "trt" }).totalMonthlyCents) +
    "/mo combo · stack billed per fill cycle";

  return scenarios;
}

export function buildTripleServiceTableRows(): string[][] {
  return buildTripleServiceScenarios().map((s) => {
    const q = quoteCombo(s.combo);
    const peptideSummary = s.peptideLines
      .map((p) => `${p.name}: ${fmtUsd(p.nonMemberCents)} (${memberPeptide(p.nonMemberCents)} member)`)
      .join(" · ");
    return [s.scenario, q.totalDisplay, peptideSummary, s.steadyStateDisplay, s.staffScript];
  });
}

export function buildLayerSummaryRows(): string[][] {
  return [
    [
      "Layer 1 · Anchor",
      "One full ELEVATED program",
      "TRT $249 · HRT $229 · GLP-1 sema $349 · GLP-1 tirz $449",
      "RN check-ins · messaging · quarterly labs · primary Rx",
      "Elevated Combo Selector — anchor tile",
    ],
    [
      "Layer 2 · Med add-on",
      "Second Rx lane · same subscription",
      "+TRT $149 · +HRT $129 · +sema $249 · +tirz $349",
      `Saves $${COMBO_DUPLICATE_CARE_SAVINGS_CENTS / 100}/mo vs second full program`,
      "Combo Selector — add-on tile · update-subscription-addon",
    ],
    [
      "Layer 3+ · Peptides",
      "À la carte · separate SKU(s)",
      "Catalog price · member −20% each line",
      "Recovery stack $349 bundle only published peptide bundle",
      "Send Payment Link per peptide · physician layers 1–2 at a time",
    ],
    [
      "IV membership",
      "ELEVATED IV $199",
      "Non-Rx · no hormone/GLP combo SKUs",
      "20% off à la carte IV + peptides",
      "Separate from Rx combo — can stack with layer 3 peptides",
    ],
  ];
}

export { COMBO_SHARED_CARE_BULLETS, COMBO_DUPLICATE_CARE_SAVINGS_CENTS, MEMBER_DISCOUNT_PERCENT };

/** Pick recommended anchor when patient wants 3+ services. */
export function recommendAnchor(goals: {
  weightLoss?: boolean;
  hormones?: boolean;
  gender?: "male" | "female" | null;
}): ComboAnchorKey {
  if (goals.weightLoss && goals.hormones) {
    return "glp1_semaglutide";
  }
  if (goals.weightLoss) return "glp1_semaglutide";
  if (goals.hormones) return goals.gender === "female" ? "hrt" : "trt";
  return "glp1_semaglutide";
}
