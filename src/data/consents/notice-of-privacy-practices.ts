import type { ConsentDocument } from "./types";

/**
 * TODO(PR follow-up): Full NPP (HIPAA Notice of Privacy Practices) body was not found in-repo.
 * Patients typically sign the HIPAA Acknowledgment, which references this NPP version.
 * Paste into body_markdown and add matching consent_versions seed row.
 */
export const noticeOfPrivacyPracticesDoc: ConsentDocument = {
  type: "notice_of_privacy_practices",
  version_label: "2026-05-14-v1",
  title: "Notice of Privacy Practices",
  tier: 1,
  body_markdown: `
# Notice of Privacy Practices

**TODO:** Full legal text pending paste from prior drafting session or counsel.
Do not activate in production until body_markdown matches the seeded consent_versions row.
`.trim(),
  sections: [{ id: "all", title: "Notice of Privacy Practices", requires_attestation: false }],
  expiration_months: 36,
  signing_method: "typed_name",
  effective_from: "2026-05-14T00:00:00Z",
};
