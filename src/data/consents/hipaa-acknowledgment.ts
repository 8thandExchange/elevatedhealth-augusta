import type { ConsentDocument } from "./types";

/**
 * TODO: Full consent text will be pasted in via subsequent commit.
 * Reference: /docs/consent_drafts/hipaa-acknowledgment.md (when available)
 * OR see the prior drafting conversation.
 *
 * The version_label below + body_hash in the DB seed represent the
 * approved version. The text body below is a placeholder pending paste.
 */
export const hipaaAcknowledgmentConsent: ConsentDocument = {
  type: "hipaa_acknowledgment",
  version_label: "2026-05-v1",
  title: "HIPAA Acknowledgment",
  tier: 1,
  body_markdown: `
# HIPAA Acknowledgment

[Full text to be pasted here]
`.trim(),
  sections: [{ id: "all", title: "HIPAA Acknowledgment", requires_attestation: true }],
  expiration_months: 12,
  signing_method: "typed_name",
  effective_from: "2026-05-15",
};
