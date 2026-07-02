import { describe, expect, it } from "vitest";
import { FORMULARY_ECONOMICS_CATALOG, type FormularyEconomicsLine } from "./vendorRouting";
import { RECOVERY_PEPTIDE_PRODUCTS } from "./stripeConfig";
import { getMedicationConsentRule } from "@/data/consents/medication-consent-mapping";
// Plain-TS shared price map imported by supabase/functions/create-alacarte-checkout/index.ts.
// The edge function itself is Deno (https:// imports + serve()) and cannot be imported here,
// but this is the identical object it consumes.
import { LIVE_RECOVERY_PEPTIDES } from "../../supabase/functions/_shared/live-prices.ts";

/**
 * PHARMACY SOURCING COMPLIANCE INVARIANTS
 *
 * These tests are a build-time guard. Each one encodes a known compliance hole
 * that must fail the build if it ever reopens. Do NOT weaken any assertion to
 * make the suite green — a failure means real catalog/mapping data violates a
 * sourcing or consent rule and must be fixed in the data, not in this test.
 *
 * Context (see .cursorrules "REGULATORY POSTURE" + vendorRouting.ts header):
 *  - GC's STLKS line is the 503A patient-fill line.
 *  - GC's PATH line is lyophilized RESEARCH-USE-ONLY material — never dispensed
 *    to patients, never on a patient-facing menu.
 *  - Cat-2 research/recovery peptides (BPC-157, TB-500, CJC-1295/Ipamorelin,
 *    Selank, Thymosin-α1, GHK-Cu injectable) are only prescribable under a
 *    signed Research Peptide Consent.
 */

/** Valid category union — mirrors FormularyEconomicsLine["category"] in vendorRouting.ts. */
const VALID_CATEGORIES: ReadonlyArray<FormularyEconomicsLine["category"]> = [
  "peptide_stack",
  "glp1",
  "peptide",
  "hormone",
  "iv_additive",
  "program",
];

/**
 * Cat-2 research/recovery peptide molecule tokens that may appear in a catalog
 * itemCode. Deliberately EXCLUDES metabolic/provider-only peptides (SS-31,
 * MOTS-c, AOD-9604, SLU-PP-332, 5-Amino-1MQ) and green-light peptides
 * (Sermorelin, Tesamorelin, NAD+) — none of those carry a research_peptide
 * consent requirement.
 */
const RESEARCH_PEPTIDE_ITEMCODE_PATTERN =
  /(BPC-?157|TB-?500|CJC|IPAM|SELANK|THYMOSIN|GHK)/i;

/**
 * Catalog itemCode → canonical medication_id for the research/recovery peptides.
 * If a catalog line matches RESEARCH_PEPTIDE_ITEMCODE_PATTERN but is missing
 * here, INVARIANT 3 fails loudly (naming the itemCode) rather than silently
 * skipping it — so a newly-added research peptide can't dodge the consent check.
 */
const RESEARCH_RECOVERY_PEPTIDE_MED_BY_ITEMCODE: Record<string, string> = {
  "PEPTIDE-BPC157": "bpc_157",
  "PEPTIDE-TB500": "tb_500",
  "PEPTIDE-CJC-IPAM": "cjc_ipamorelin_combo",
};

/**
 * Recovery checkout product_key → canonical medication_id.
 * Mirrors RECOVERY_PEPTIDE_MEDICATION_IDS in
 * supabase/functions/create-alacarte-checkout/index.ts (kept in sync manually
 * because that Deno edge module cannot be imported into vitest).
 */
const RECOVERY_PRODUCT_KEY_TO_MEDICATION_ID: Record<string, string> = {
  bpc157: "bpc_157",
  tb500: "tb_500",
};

function requiresResearchPeptideConsent(medicationId: string): boolean {
  return (
    getMedicationConsentRule(medicationId)?.required_consents.includes("research_peptide") ?? false
  );
}

describe("pharmacy sourcing invariants", () => {
  // INVARIANT 1 — No research-use SKU on a patient-facing line.
  // Reason: PATH is GC's lyophilized research-use-only line; patient fills must
  // route through the STLKS 503A line only. A PATH SKU on a publicMenu line
  // means we are surfacing research material as a patient product.
  it("INVARIANT 1: no PATH research-use gcSku on any patient-facing (publicMenu) line", () => {
    for (const line of FORMULARY_ECONOMICS_CATALOG) {
      if (line.publicMenu !== true) continue;
      const gcSku = line.gcSku;
      if (!gcSku) continue;
      expect(
        gcSku.startsWith("PATH-"),
        `INVARIANT 1: patient-facing line ${line.itemCode} has a research-use PATH gcSku "${gcSku}"`,
      ).toBe(false);
      expect(
        gcSku.includes("PATH"),
        `INVARIANT 1: patient-facing line ${line.itemCode} gcSku "${gcSku}" contains "PATH" (research-use line)`,
      ).toBe(false);
    }
  });

  // INVARIANT 2 — No PATH sourcing instruction hidden in any notes field.
  // Reason: sourcing risk can hide in the free-text notes field, not just the
  // structured SKU field ("PATH primary", "PATH-1234", etc.).
  it("INVARIANT 2: no PATH sourcing instruction in any notes field", () => {
    for (const line of FORMULARY_ECONOMICS_CATALOG) {
      const notes = line.notes;
      if (!notes) continue;
      expect(
        /PATH\s+primary/i.test(notes),
        `INVARIANT 2: line ${line.itemCode} notes route to PATH as primary: "${notes}"`,
      ).toBe(false);
      expect(
        notes.includes("PATH-"),
        `INVARIANT 2: line ${line.itemCode} notes reference a PATH- research SKU: "${notes}"`,
      ).toBe(false);
    }
  });

  // INVARIANT 3 — Every research/recovery peptide line is consent-gated.
  // Reason: a Cat-2 research peptide must not be surfaceable in the catalog
  // without a research_peptide consent requirement backing it.
  it("INVARIANT 3: every research/recovery peptide catalog line requires research_peptide consent", () => {
    for (const line of FORMULARY_ECONOMICS_CATALOG) {
      if (!RESEARCH_PEPTIDE_ITEMCODE_PATTERN.test(line.itemCode)) continue;

      const medicationId = RESEARCH_RECOVERY_PEPTIDE_MED_BY_ITEMCODE[line.itemCode];
      expect(
        medicationId,
        `INVARIANT 3: research/recovery peptide line ${line.itemCode} has no medication_id mapping — wire it to a research_peptide consent rule`,
      ).toBeTruthy();

      expect(
        requiresResearchPeptideConsent(medicationId),
        `INVARIANT 3: research/recovery peptide line ${line.itemCode} (medication_id "${medicationId}") does not require research_peptide consent`,
      ).toBe(true);
    }
  });

  // INVARIANT 4 — Category is a valid union member.
  // Reason: catches invalid category strings (e.g. "peptide_recovery") at test
  // time, defending against data drift that TS compile alone won't catch (e.g.
  // JSON-seeded rows or `as any` escapes).
  it("INVARIANT 4: every catalog line category is a valid union member", () => {
    for (const line of FORMULARY_ECONOMICS_CATALOG) {
      expect(
        VALID_CATEGORIES.includes(line.category),
        `INVARIANT 4: line ${line.itemCode} has invalid category "${line.category}"`,
      ).toBe(true);
    }
  });

  // INVARIANT 5 — No recovery checkout product without a research_peptide consent mapping.
  // Reason: makes it a BUILD FAILURE to add a recovery peptide to the payment
  // catalog (RECOVERY_PEPTIDE_PRODUCTS / LIVE_RECOVERY_PEPTIDES) without also
  // wiring its research_peptide consent requirement in the consent mapping.
  it("INVARIANT 5: every recovery checkout product_key maps to a research_peptide-gated medication_id", () => {
    const recoveryProductKeys = new Set<string>([
      ...Object.keys(RECOVERY_PEPTIDE_PRODUCTS),
      ...Object.keys(LIVE_RECOVERY_PEPTIDES),
    ]);

    for (const productKey of recoveryProductKeys) {
      const medicationId = RECOVERY_PRODUCT_KEY_TO_MEDICATION_ID[productKey];
      expect(
        medicationId,
        `INVARIANT 5: recovery product_key "${productKey}" has no medication_id mapping (create-alacarte-checkout RECOVERY_PEPTIDE_MEDICATION_IDS)`,
      ).toBeTruthy();

      expect(
        requiresResearchPeptideConsent(medicationId),
        `INVARIANT 5: recovery product_key "${productKey}" (medication_id "${medicationId}") is not gated by research_peptide consent`,
      ).toBe(true);
    }
  });
});
