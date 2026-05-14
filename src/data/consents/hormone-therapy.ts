import type { ConsentDocument } from "./types";

/**
 * TODO: Full consent text will be pasted in via subsequent commit.
 * Reference: /docs/consent_drafts/hormone-therapy.md (when available)
 * OR see the prior drafting conversation.
 *
 * The version_label below + body_hash in the DB seed represent the
 * approved version. The text body below is a placeholder pending paste.
 */
export const hormoneTherapyConsent: ConsentDocument = {
  type: "hormone_therapy",
  version_label: "2026-05-v1",
  title: "Hormone Therapy Consent",
  tier: 2,
  body_markdown: `
# Hormone Therapy Consent

[Full text to be pasted here]
`.trim(),
  sections: [
    { id: "general_risks", title: "Section 3 — General Risks", requires_attestation: true },
    { id: "testosterone_risks", title: "Section 4 — Testosterone Risks", requires_attestation: true },
    { id: "estrogen_risks", title: "Section 5 — Estrogen Risks", requires_attestation: true },
    { id: "lab_monitoring", title: "Section 8 — Lab Monitoring", requires_attestation: true },
    { id: "pregnancy", title: "Section 10 — Pregnancy and Fertility", requires_attestation: true },
  ],
  expiration_months: 12,
  signing_method: "typed_name_with_section_attestation",
  effective_from: "2026-05-15",
};
