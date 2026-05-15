import type { ConsentDocument } from "./types";

/**
 * TODO(PR follow-up): Full HRT consent body (13 sections + section attestations)
 * was not found in-repo. Paste into body_markdown and add matching row to
 * `supabase/migrations/20260515194500_seed_consent_versions.sql` (or a new migration).
 */
export const hormoneTherapyConsent: ConsentDocument = {
  type: "hormone_therapy",
  version_label: "2026-05-14-v1",
  title: "Hormone Therapy Consent",
  tier: 2,
  body_markdown: `
# Hormone Therapy Consent

**TODO:** Full legal text pending paste from prior drafting session or counsel.
Do not activate in production until body_markdown matches the seeded consent_versions row.
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
  effective_from: "2026-05-14T00:00:00Z",
};
