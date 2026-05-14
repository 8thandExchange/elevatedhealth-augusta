import type { ConsentDocument } from "./types";

/**
 * TODO: Full consent text will be pasted in via subsequent commit.
 * Reference: /docs/consent_drafts/glp1.md (when available)
 * OR see the prior drafting conversation.
 *
 * The version_label below + body_hash in the DB seed represent the
 * approved version. The text body below is a placeholder pending paste.
 */
export const glp1Consent: ConsentDocument = {
  type: "glp1",
  version_label: "2026-05-v1",
  title: "GLP-1 Consent",
  tier: 2,
  body_markdown: `
# GLP-1 Consent

[Full text to be pasted here]
`.trim(),
  sections: [
    { id: "fda_warnings", title: "Section 4 — FDA Black Box Warnings", requires_attestation: true },
    { id: "serious_risks", title: "Section 5 — Other Serious Risks", requires_attestation: true },
    { id: "pregnancy", title: "Section 7 — Pregnancy and Breastfeeding", requires_attestation: true },
    { id: "lifestyle", title: "Section 10 — Lifestyle Requirements", requires_attestation: true },
    { id: "mtc_attestation", title: "MTC/MEN 2 attestation", requires_attestation: true },
  ],
  expiration_months: 12,
  signing_method: "typed_name_with_section_attestation",
  effective_from: "2026-05-15",
};
