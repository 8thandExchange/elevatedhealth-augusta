/**
 * Staff Complete Reference — full formulary, dosing, pricing, and multi-peptide strategy.
 * Sources: stripeConfig, dosingProtocols, providerProtocolAlgorithms, iv catalogs, formularyCheatSheetContent.
 */
import {
  COMBO_ADDON_ROWS,
  GLP1_ROWS,
  HORMONE_FILL_ROWS,
  IV_ADDON_ROWS,
  IV_DRIP_ROWS,
  MEMBERSHIP_ROWS,
  METABOLIC_PEPTIDE_ROWS,
  NOT_INCLUDED,
  PEPTIDE_MONTHLY_ROWS,
  POLICY_BULLETS,
  QUICK_REFERENCE,
  RECOVERY_PEPTIDE_ROWS,
  RECOVERY_STACK,
  SEXUAL_WELLNESS_ROWS,
  HAIR_ROWS,
  VISIT_LAB_ROWS,
} from "./formularyCheatSheetContent";
import { IV_ADDONS_CATALOG } from "./ivAddonsCatalog";
import { IV_THERAPIES_CATALOG } from "./ivTherapiesCatalog";
import { DOSING_PROTOCOLS, type DosingProtocol } from "./dosingProtocols";
import { PROVIDER_PROTOCOL_ALGORITHMS } from "./providerProtocolAlgorithms";
import {
  LAB_COMPOSITION_ROWS,
  LAB_FREQUENCY_ROWS,
  LAB_PRICING_ROWS,
} from "./businessOpsGuideContent";
import { labPanelDisplayPrice } from "./labPanelCheckout";
import { MEMBER_DISCOUNT_PERCENT, fmtUsd, labMemberCents } from "./pricing";
import {
  CHARGE_CHECKPOINTS,
  DO_SAY,
  DONT_SAY,
  LANE_A_IV_STEPS,
  LANE_B_CONSULT_STEPS,
  PATIENT_JOURNEY_PHASES,
  STAFF_OPENING_SCRIPT,
  TEAM_ROWS,
} from "./staffQuickCardContent";
import { CORE_SERVICES } from "./stripeConfig";

export const MASTER_GUIDE_META = {
  title: "Staff Complete Reference",
  subtitle: "Process · Multi-Service Add-Ons · Formulary · Dosing · Pricing · Cost & Margin",
  version: "2.4.0",
  effectiveDate: "2026-06-29",
  classification: "Internal — master staff formulary & operations reference",
  clinic: "Elevated Health Augusta",
  address: "7013 Evans Town Center Blvd, Suite 203, Evans, GA 30809",
  phone: "(706) 760-3470",
  domain: "elevatedhealthaugusta.com",
  portal: "elevatedhealthaugusta.com/provider",
} as const;

export const MASTER_GUIDE_FILENAME_BASE = `EHA-Staff-Complete-Reference-v${MASTER_GUIDE_META.version}-${MASTER_GUIDE_META.effectiveDate}`;

const member = (cents: number) => fmtUsd(labMemberCents(cents));

/** Layer 3 (peptides) rules — complements multiServiceAddonPlaybook.ts layers 1–2. */
export const PEPTIDE_LAYER_RULES = {
  headline: "Layer 3 — Peptides (à la carte on top of combo)",
  summary:
    "Peptides never duplicate the care bundle. Bill as separate SKUs after consult-gated review. Active ELEVATED members save 20% on each peptide line.",
  declinedPrograms: [
    "ELEVATED Peptides membership (~$349/mo bundle) — declined 2026-06-25.",
    "ELEVATED Metabolic Recomposition ($599/mo) — retired 2026-06-24; peptides remain à la carte.",
    "Standalone NAD+ peptide — discontinued; NAD+ is the $50 IV booster only.",
  ],
  rules: [
    "Physician layers 1–2 peptides at a time after anchor ± add-on is stable.",
    "Recovery stack (BPC + TB) = $349 / " + member(RECOVERY_STACK.nonMemberCents) + " member — only published peptide bundle.",
    "Research Peptide Consent + malignancy screen for Cat 2 compounds.",
    "Retatrutide is NOT a casual peptide add-on — GLP-1 lane only, physician-gated.",
  ],
} as const;

/** Which lab panel to order by program / pathway — staff routing table. */
export const LAB_PANEL_ORDERING_ROWS = [
  [
    "ELEVATED TRT (men)",
    "Hormone — Male (16 tests)",
    CORE_SERVICES.expandedPanel.displayPrice,
    labPanelDisplayPrice("hormone-male", true),
    "Baseline before TRT · quarterly included while member",
  ],
  [
    "ELEVATED HRT (women)",
    "Hormone — Female (18 tests)",
    CORE_SERVICES.expandedPanel.displayPrice,
    labPanelDisplayPrice("hormone-female", true),
    "Baseline before HRT · quarterly included while member",
  ],
  [
    "ELEVATED GLP-1 / weight loss",
    "Weight / Expanded (16 tests)",
    CORE_SERVICES.expandedPanel.displayPrice,
    labPanelDisplayPrice("weight-optimization", true),
    "Baseline before GLP-1 · quarterly included while member",
  ],
  [
    "GLP-1 + hormone combo",
    "Weight / Expanded (16 tests)",
    CORE_SERVICES.expandedPanel.displayPrice,
    labPanelDisplayPrice("weight-optimization", true),
    "One draw covers both lanes when GLP-1 is in the mix",
  ],
  [
    "General wellness / IV / peptides",
    "Foundation Wellness (8 tests)",
    CORE_SERVICES.comprehensivePanel.displayPrice,
    labPanelDisplayPrice("foundation-wellness", true),
    "Comprehensive Wellness Panel · annual or as indicated",
  ],
  [
    "Sexual wellness workup",
    "Sexual Wellness (7 tests)",
    CORE_SERVICES.comprehensivePanel.displayPrice,
    labPanelDisplayPrice("sexual-wellness", true),
    "When clinically indicated for libido/ED workup",
  ],
] as const;

export function buildLabCompositionRows(): string[][] {
  return LAB_COMPOSITION_ROWS.map(([panel, tests]) => [panel, tests]);
}

export function buildLabFrequencyRows(): string[][] {
  return LAB_FREQUENCY_ROWS.map(([panel, when]) => [panel, when]);
}

export function buildLabPricingRows(): string[][] {
  return LAB_PRICING_ROWS.map(([panel, cogs, walkIn, margin, member, memberMargin]) => [
    panel,
    walkIn,
    member,
    `${margin} gross margin`,
    `LabCorp COGS ${cogs}`,
  ]);
}

function formatTitration(p: DosingProtocol): string {
  return p.titration.map((t) => `${t.weeks}: ${t.dose}`).join(" → ");
}

function formatDosingSummary(key: string): string {
  const p = DOSING_PROTOCOLS[key];
  if (!p) return "Physician-directed — see provider protocol";
  const parts = [
    p.route,
    p.frequency,
    p.timing ? `(${p.timing})` : "",
    formatTitration(p),
    `Maint: ${p.maintenanceDose}`,
    `Cycle: ${p.cycleWeeks}`,
  ].filter(Boolean);
  return parts.join(" · ");
}

function purposeFromProtocol(key: string): string {
  const p = DOSING_PROTOCOLS[key];
  return p?.patientExplanation ?? "See staff formulary / provider algorithm";
}

/** Detailed peptide rows: name, purpose, dosing, non-member, member, billing, notes. */
export function buildDetailedPeptideRows(): string[][] {
  const rows: string[][] = [];

  const doseKeyByProductName: Record<string, string> = {
    "Sermorelin Injection": "sermorelin",
    "CJC-1295/Ipamorelin": "cjcIpamorelin",
    Tesamorelin: "tesamorelin",
    "GHK-Cu Topical": "ghkCuTopical",
  };

  for (const row of PEPTIDE_MONTHLY_ROWS) {
    const key = doseKeyByProductName[row[0]] ?? "";
    rows.push([
      row[0],
      key === "ghkCuTopical"
        ? "Skin, collagen, and scalp support — topical peptide for aesthetic goals"
        : purposeFromProtocol(key),
      key === "ghkCuTopical" ? "Topical · daily AM/PM per pharmacy label" : formatDosingSummary(key),
      row[1],
      row[2],
      "Monthly sub",
      row[3],
    ]);
  }

  rows.push([
    "PT-141 (Bremelanotide)",
    purposeFromProtocol("pt141"),
    formatDosingSummary("pt141"),
    "$225",
    member(22500),
    "One-time fill (PRN protocol)",
    "Sexual wellness · PRN libido · not daily research peptide",
  ]);

  for (const row of RECOVERY_PEPTIDE_ROWS) {
    const name = row[0];
    const doseKey = name.includes("BPC") ? "bpc157" : name.includes("TB") ? "tb500" : null;
    rows.push([
      name,
      doseKey ? purposeFromProtocol(doseKey) : RECOVERY_STACK.note,
      doseKey ? formatDosingSummary(doseKey) : "BPC daily + TB weekly per signed stack protocol",
      row[1],
      row[2],
      name.includes("Stack") ? "One-time bundle" : "One-time fill",
      row[3],
    ]);
  }

  for (const row of METABOLIC_PEPTIDE_ROWS) {
    const doseKey =
      row[0].includes("SS-31") ? "ss31" : row[0].includes("AOD") ? "aod9604" : row[0].includes("SLU") ? "sluPp332" : "fiveAmino1mq";
    const protocolKey = doseKey === "fiveAmino1mq" ? null : doseKey;
    rows.push([
      row[0],
      protocolKey ? purposeFromProtocol(protocolKey) : "Metabolic adjunct — physician-directed plateau support",
      protocolKey ? formatDosingSummary(protocolKey) : "Per physician protocol",
      row[1],
      row[2],
      "Monthly sub",
      row[3],
    ]);
  }

  return rows;
}

/** GLP-1 with dosing column. */
export function buildDetailedGlp1Rows(): string[][] {
  return GLP1_ROWS.map((row) => {
    const doseKey = row[0].toLowerCase().includes("semaglutide")
      ? "semaglutide"
      : row[0].toLowerCase().includes("tirzepatide")
        ? "tirzepatide"
        : row[0].toLowerCase().includes("retatrutide")
          ? "retatrutide"
          : null;
    const isProgram = row.length === 3;
    return [
      row[0],
      doseKey ? purposeFromProtocol(doseKey) : "Program or single fill",
      doseKey ? formatDosingSummary(doseKey) : "—",
      row[1],
      isProgram ? "Included in program" : String(row[2]),
      isProgram ? String(row[2]) : String(row[3] ?? ""),
    ];
  });
}

/** Hormone protocols with dosing from provider algorithms. */
export function buildHormoneProtocolRows(): string[][] {
  const trt = PROVIDER_PROTOCOL_ALGORITHMS.find((a) => a.slug === "male-trt-initiation-transdermal-cream");
  const bhrt = PROVIDER_PROTOCOL_ALGORITHMS.find((a) => a.slug === "bhrt-female-initiation-transdermal");
  const rows: string[][] = [];

  if (trt) {
    rows.push([
      "Men — ELEVATED TRT (testosterone cream)",
      "Lab-guided testosterone optimization; daily transdermal cream titrated to labs",
      `${trt.startDose} · ${trt.escalationSchedule} · ${trt.frequency}`,
      "$249/mo all-inclusive",
      "Medication included — never say plus pharmacy",
      "Quarterly Comprehensive labs included",
    ]);
  }

  if (bhrt) {
    rows.push([
      "Women — ELEVATED HRT (Bi-Est + progesterone)",
      "Lab-guided bioidentical hormone balance; cream + oral progesterone",
      `${bhrt.startDose} · ${bhrt.escalationSchedule}`,
      "$229/mo all-inclusive",
      "Medication included · cream only — no troches",
      "Quarterly Comprehensive labs included",
    ]);
  }

  for (const row of HORMONE_FILL_ROWS) {
    rows.push([row[0], "À la carte fill outside program", "Physician-directed", row[1], row[2], row[3]]);
  }

  return rows;
}

/** IV drips with clinical description. */
export function buildDetailedIvDripRows(): string[][] {
  return IV_THERAPIES_CATALOG.map((d) => {
    const memberPrice = member(d.price * 100);
    const dripRow = IV_DRIP_ROWS.find((r) => r[0] === d.name);
    return [
      d.name,
      d.description,
      (d.ingredients ?? []).join(", "),
      `$${d.price}`,
      dripRow?.[2] ?? memberPrice,
      d.category,
    ];
  });
}

/** IV boosters with benefits. */
export function buildDetailedIvAddonRows(): string[][] {
  return IV_ADDONS_CATALOG.map((a) => {
    const addonRow = IV_ADDON_ROWS.find((r) => r[0] === a.name);
    return [
      a.name,
      a.description ?? "",
      (a.benefits ?? []).join(" · "),
      `$${a.price}`,
      addonRow?.[2] ?? member(a.price * 100),
      (a.best_for ?? []).join(", "),
    ];
  });
}

export {
  CHARGE_CHECKPOINTS,
  COMBO_ADDON_ROWS,
  DO_SAY,
  DONT_SAY,
  HAIR_ROWS,
  LANE_A_IV_STEPS,
  LANE_B_CONSULT_STEPS,
  MEMBERSHIP_ROWS,
  NOT_INCLUDED,
  PATIENT_JOURNEY_PHASES,
  POLICY_BULLETS,
  QUICK_REFERENCE,
  RECOVERY_STACK,
  SEXUAL_WELLNESS_ROWS,
  STAFF_OPENING_SCRIPT,
  TEAM_ROWS,
  VISIT_LAB_ROWS,
  CORE_SERVICES,
  MEMBER_DISCOUNT_PERCENT,
};
