import type { ConsentDocument } from "./types";

/**
 * TODO: Full Notice of Privacy Practices text will be pasted in via subsequent commit.
 * Patients typically sign the HIPAA Acknowledgment (#2), which references this NPP version.
 *
 * The version_label below + body_hash in the DB seed represent the
 * approved version. The text body below is a placeholder pending paste.
 */
export const noticeOfPrivacyPracticesDoc: ConsentDocument = {
  type: "notice_of_privacy_practices",
  version_label: "2026-05-v1",
  title: "Notice of Privacy Practices",
  tier: 1,
  body_markdown: `
# Notice of Privacy Practices

[Full text to be pasted here]
`.trim(),
  sections: [{ id: "all", title: "Notice of Privacy Practices", requires_attestation: false }],
  expiration_months: 36,
  signing_method: "typed_name",
  effective_from: "2026-05-15",
};
