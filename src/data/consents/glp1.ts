import type { ConsentDocument } from "./types";

/**
 * TODO(PR follow-up): Full GLP-1 consent body was not found in-repo.
 * Paste into body_markdown and add matching consent_versions seed row.
 */
export const glp1Consent: ConsentDocument = {
  type: "glp1",
  version_label: "2026-05-14-v1",
  title: "GLP-1 Consent",
  tier: 2,
  body_markdown: `
# GLP-1 Consent

**TODO:** Full legal text pending paste from prior drafting session or counsel.
Do not activate in production until body_markdown matches the seeded consent_versions row.
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
  effective_from: "2026-05-14T00:00:00Z",
};
