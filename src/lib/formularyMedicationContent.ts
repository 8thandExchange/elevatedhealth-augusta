/**
 * Staff Medication & Infusion cheat sheet — IV doses from clinicalProtocolSeedIv;
 * Rx add-on drafts from clinicalProtocolSeedIvAddon; static prose from medicationCheatSheetStaticSections.
 */
import {
  IV_CLINICAL_PROTOCOL_BY_SLUG,
  IV_CLINICAL_PROTOCOL_SEED,
  unresolvedReviewerNotes,
  type IvProtocolSeedRecord,
} from "./clinicalProtocolSeedIv";
import {
  IV_ADDON_PROTOCOL_SEED,
  unresolvedAddonReviewerNotes,
  type IvAddonProtocolSeedRecord,
} from "./clinicalProtocolSeedIvAddon";
import {
  ADMIN_MONITORING_BULLETS,
  AUTHORITY_BANNER,
  EMERGENCY_KIT_PLACEHOLDERS,
  FOOTER_DISCLAIMER,
  IV_BASES_FOOTNOTE,
  IV_BASES_ROWS,
  MEYERS_MIXING_CAUTIONS,
  NUTRIENT_ADDON_ROWS,
  OTHER_DRIPS_ROWS,
  PRESCRIPTION_INJECTABLES_SECTION_INTRO,
  REACTION_PROTOCOL_WARNING,
  REACTION_RESPONSE_BULLETS,
  SAFETY_DRUG_BULLETS,
  SAFETY_SCREEN_BULLETS,
  USP797_PREPARATION_SECTION_MARKDOWN,
} from "./medicationCheatSheetStaticSections";

export const MEDICATION_CHEAT_SHEET_META = {
  title: "Medication and Infusion Cheat Sheet",
  subtitle: "Staff Clinical Reference · Nursing",
  version: "1.1.0",
  effectiveDate: "2026-06-29",
  classification: "Internal — clinical staff only (no patient pricing)",
  clinic: "Elevated Health Augusta",
  address: "7013 Evans Town Center Blvd, Suite 203, Evans, GA 30809",
  phone: "(706) 760-3470",
  domain: "elevatedhealthaugusta.com",
  protocolSeedMigration: "20260509140000_seed_clinical_protocol_drafts.sql",
  addonDraftSource: "20260629180000_seed_iv_addon_injectable_protocol_drafts.sql",
} as const;

export const MEDICATION_CHEAT_SHEET_FILENAME_BASE = `EHA-Medication-Infusion-Cheat-Sheet-v${MEDICATION_CHEAT_SHEET_META.version}-${MEDICATION_CHEAT_SHEET_META.effectiveDate}`;

export const MEDICATION_CHEAT_SHEET_BRAND = {
  navy: "#00477E",
  steel: "#A4A4A1",
  paper: "#FFFFFF",
  ink: "#14202B",
  muted: "#5B6770",
  warnBg: "#FFF8E6",
  warnBorder: "#C4A000",
  dangerBg: "#FDEEEE",
  dangerBorder: "#8B2E2E",
  draftBg: "#F4F8FB",
  draftBorder: "#00477E",
} as const;

export type MedicationProtocolSection = {
  slug: string;
  title: string;
  indication: string;
  formulation: string;
  medication: string;
  dose: string;
  base: string;
  route: string;
  frequency: string;
  duration: string;
  preAdministrationChecks: string[];
  monitoringDuring: string[];
  monitoringPost: string[];
  administration: string[];
  openReviewerNotes: string[];
  myersComponents?: readonly (readonly string[])[];
};

export type PrescriptionInjectableDraft = {
  slug: string;
  title: string;
  displayName: string;
  generic: string;
  status: "draft — do not administer until signed";
  dosingLines: string[];
  openReviewerNotes: string[];
};

export {
  AUTHORITY_BANNER,
  IV_BASES_ROWS,
  IV_BASES_FOOTNOTE,
  USP797_PREPARATION_SECTION_MARKDOWN,
  MEYERS_MIXING_CAUTIONS,
  OTHER_DRIPS_ROWS,
  NUTRIENT_ADDON_ROWS,
  PRESCRIPTION_INJECTABLES_SECTION_INTRO,
  ADMIN_MONITORING_BULLETS,
  SAFETY_SCREEN_BULLETS,
  SAFETY_DRUG_BULLETS,
  REACTION_RESPONSE_BULLETS,
  REACTION_PROTOCOL_WARNING,
  EMERGENCY_KIT_PLACEHOLDERS,
  FOOTER_DISCLAIMER,
};

function sectionFromProtocol(protocol: IvProtocolSeedRecord): MedicationProtocolSection {
  const { body_structured: b } = protocol;
  return {
    slug: protocol.slug,
    title: protocol.title,
    indication: b.indication,
    formulation: protocol.formulation,
    medication: b.dosing.medication,
    dose: b.dosing.dose,
    base: protocol.formulation,
    route: b.dosing.route,
    frequency: b.dosing.frequency,
    duration: b.dosing.duration,
    preAdministrationChecks: b.pre_administration_checks,
    monitoringDuring: b.monitoring_during,
    monitoringPost: b.monitoring_post,
    administration: b.administration,
    openReviewerNotes: unresolvedReviewerNotes(protocol).map((n) => n.note),
    myersComponents: protocol.myers_components,
  };
}

function draftFromAddon(protocol: IvAddonProtocolSeedRecord): PrescriptionInjectableDraft {
  const b = protocol.body_structured;
  const d = b.dosing;
  const lines = [
    `Indication: ${b.indication}`,
    `Dose: ${d.dose}`,
    `Route: ${d.route}`,
    `Rate / duration: ${d.duration}`,
    `Frequency: ${d.frequency}`,
    `Pre-administration checks: ${b.pre_administration_checks.join(" · ")}`,
    `Monitoring: ${b.monitoring_during.join(" · ")}`,
    `Administration: ${b.administration.join(" · ")}`,
  ];

  const shortName = protocol.slug.includes("ketorolac")
    ? "Toradol"
    : protocol.slug.includes("ondansetron")
      ? "Zofran"
      : protocol.slug.includes("diphenhydramine")
        ? "Benadryl"
        : "Pepcid";

  const generic = protocol.slug.includes("ketorolac")
    ? "ketorolac"
    : protocol.slug.includes("ondansetron")
      ? "ondansetron"
      : protocol.slug.includes("diphenhydramine")
        ? "diphenhydramine"
        : "famotidine";

  return {
    slug: protocol.slug,
    title: protocol.title,
    displayName: shortName,
    generic,
    status: "draft, pending signature — do not administer until signed",
    dosingLines: lines,
    openReviewerNotes: unresolvedAddonReviewerNotes(protocol).map((n) => n.note),
  };
}

export const IV_MEDICATION_PROTOCOL_SECTIONS: readonly MedicationProtocolSection[] =
  IV_CLINICAL_PROTOCOL_SEED.map(sectionFromProtocol);

export const PRESCRIPTION_INJECTABLE_DRAFTS: readonly PrescriptionInjectableDraft[] =
  IV_ADDON_PROTOCOL_SEED.map(draftFromAddon);

export const MYERS_SECTION = IV_CLINICAL_PROTOCOL_BY_SLUG["iv-myers-cocktail"];
export const NAD250_SECTION = IV_CLINICAL_PROTOCOL_BY_SLUG["iv-nad-250mg"];
export const NAD500_SECTION = IV_CLINICAL_PROTOCOL_BY_SLUG["iv-nad-500mg"];
export const GLUTATHIONE_SECTION = IV_CLINICAL_PROTOCOL_BY_SLUG["iv-glutathione-push"];

export function buildMedicationProtocolTableRows(
  section: MedicationProtocolSection,
): readonly (readonly string[])[] {
  return [
    ["Indication", section.indication],
    ["Medication", section.medication],
    ["Dose", section.dose],
    ["Base / diluent", section.base],
    ["Route", section.route],
    ["Frequency", section.frequency],
    ["Duration", section.duration],
    ["Pre-administration checks", section.preAdministrationChecks.join(" · ")],
    ["Monitoring (during)", section.monitoringDuring.join(" · ")],
    ["Monitoring (post)", section.monitoringPost.join(" · ")],
    ["Administration", section.administration.join(" · ")],
  ];
}

export function buildIvMedicationCardRows(): readonly (readonly string[])[] {
  return IV_MEDICATION_PROTOCOL_SECTIONS.map((s) => [
    s.title.replace(/^IV /, ""),
    `${s.dose} · ${s.base}`,
    `${s.route} · ${s.duration}`,
    [
      ...s.preAdministrationChecks.slice(0, 2),
      `Monitor: ${s.monitoringDuring[0] ?? "per protocol"}`,
      s.openReviewerNotes.length ? `⚠ ${s.openReviewerNotes.length} open reviewer note(s)` : "",
    ]
      .filter(Boolean)
      .join(" · "),
  ]);
}

/** G6PD open note — surfaced prominently on Myers per authoritative cheat sheet. */
export function myersG6pdOpenNote(): string | null {
  const note = unresolvedReviewerNotes(MYERS_SECTION).find((n) =>
    n.note.toLowerCase().includes("g6pd"),
  );
  return note?.note ?? null;
}

/** Glutathione open notes — dose preference + sulfa screening per authoritative cheat sheet. */
export function glutathioneOpenNotesSummary(): string[] {
  return unresolvedReviewerNotes(GLUTATHIONE_SECTION).map((n) => n.note);
}
