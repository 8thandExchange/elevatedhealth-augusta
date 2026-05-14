import type { ConsentDocument } from "./types";

/**
 * TODO: Full consent text will be pasted in via subsequent commit.
 * Reference: /docs/consent_drafts/communication.md (when available)
 * OR see the prior drafting conversation.
 *
 * The version_label below + body_hash in the DB seed represent the
 * approved version. The text body below is a placeholder pending paste.
 */
export const communicationConsent: ConsentDocument = {
  type: "communication",
  version_label: "2026-05-v1",
  title: "Communication Consent",
  tier: 1,
  body_markdown: `
# Communication Consent

[Full text to be pasted here]
`.trim(),
  sections: [{ id: "all", title: "Communication Consent", requires_attestation: true }],
  expiration_months: 12,
  signing_method: "typed_name",
  effective_from: "2026-05-15",
};
