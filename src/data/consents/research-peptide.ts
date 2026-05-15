import type { ConsentDocument } from "./types";

/**
 * TODO(PR follow-up): Full research peptide consent body was not found in-repo.
 * Paste into body_markdown and add matching consent_versions seed row.
 */
export const researchPeptideConsent: ConsentDocument = {
  type: "research_peptide",
  version_label: "2026-05-14-v1",
  title: "Research Peptide Consent",
  tier: 2,
  body_markdown: `
# Research Peptide Consent

**TODO:** Full legal text pending paste from prior drafting session or counsel.
Do not activate in production until body_markdown matches the seeded consent_versions row.
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
  effective_from: "2026-05-14T00:00:00Z",
};
