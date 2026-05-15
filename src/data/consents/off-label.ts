import type { ConsentDocument } from "./types";

/**
 * TODO(PR follow-up): Full off-label acknowledgment body was not found in-repo.
 * Paste into body_markdown and add matching consent_versions seed row.
 */
export const offLabelConsent: ConsentDocument = {
  type: "off_label",
  version_label: "2026-05-14-v1",
  title: "Off-Label Use Acknowledgment",
  tier: 2,
  body_markdown: `
# Off-Label Use Acknowledgment

**TODO:** Full legal text pending paste from prior drafting session or counsel.
Do not activate in production until body_markdown matches the seeded consent_versions row.
`.trim(),
  sections: [{ id: "all", title: "Off-Label Use Acknowledgment", requires_attestation: true }],
  expiration_months: 12,
  signing_method: "typed_name",
  effective_from: "2026-05-14T00:00:00Z",
};
