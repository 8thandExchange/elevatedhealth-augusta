import type { ConsentDocument } from "./types";

/**
 * TODO: Full consent text will be pasted in via subsequent commit.
 * Reference: /docs/consent_drafts/research-peptide.md (when available)
 * OR see the prior drafting conversation.
 *
 * The version_label below + body_hash in the DB seed represent the
 * approved version. The text body below is a placeholder pending paste.
 */
export const researchPeptideConsent: ConsentDocument = {
  type: "research_peptide",
  version_label: "2026-05-v1",
  title: "Research Peptide Consent",
  tier: 2,
  body_markdown: `
# Research Peptide Consent

[Full text to be pasted here]
`.trim(),
  sections: [
    { id: "regulatory_status", title: "Section 2 — Regulatory Status", requires_attestation: true },
    { id: "risks", title: "Section 3 — Risks and Adverse Events", requires_attestation: true },
    { id: "no_guarantee", title: "Section 4 — No Guarantee of Outcome", requires_attestation: true },
    { id: "sourcing", title: "Section 5 — Sourcing and Compounding", requires_attestation: true },
    { id: "release", title: "Section 7 — Assumption of Risk and Release", requires_attestation: true },
  ],
  expiration_months: 12,
  signing_method: "typed_name_with_section_attestation",
  effective_from: "2026-05-15",
};
