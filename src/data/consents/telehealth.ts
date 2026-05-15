import type { ConsentDocument } from "./types";

/** Legal text v2026-05-14-v1 — keep in sync with `supabase/migrations/20260515194500_seed_consent_versions.sql`. */
export const telehealthConsent: ConsentDocument = {
  type: "telehealth",
  version_label: "2026-05-14-v1",
  title: "Telehealth Consent",
  tier: 1,
  body_markdown: `
# TELEHEALTH CONSENT
**Patient Name:** _________________________________
**Date of Birth:** _________________________________
**Date:** _________________________________
### 1. Nature of Telehealth Services
I understand that Elevated Health Augusta may provide some or all of my care through telehealth — meaning real-time audio, video, telephone, or asynchronous secure messaging communication with my clinician rather than in-person visits.
Telehealth services may include:
- Video or telephone visits with the supervising physician for Medical Review
- Video or telephone visits with the RN for follow-up and check-ins
- Asynchronous messaging through the patient portal for non-urgent questions
- Telephone calls for prescription discussions and protocol adjustments
### 2. Benefits of Telehealth
- Increased convenience and access to care
- Reduced travel time
- Ability to receive timely guidance between in-person visits
- Continuity of care when in-person visits are not feasible
### 3. Risks and Limitations of Telehealth
I understand telehealth has limitations:
- The clinician cannot perform a physical examination during a telehealth visit
- Technical problems (internet outages, audio/video quality, equipment failure) may interrupt or terminate the visit
- In rare cases, a telehealth visit may not be sufficient to evaluate my condition, and I may be asked to come in person or seek emergency care
- The clinician may not be able to fully evaluate my condition through telehealth alone; additional in-person visits or testing may be required
- Information transmitted may not be sufficient (e.g., poor video resolution, missed visual cues) to make a complete diagnosis
### 4. Privacy and Security
- Telehealth visits are conducted using HIPAA-compliant platforms
- I understand that no electronic communication is 100% secure, and I accept the residual risk
- I will conduct telehealth visits from a private setting where my conversation cannot be overheard
- I will not record any portion of the visit without explicit written permission from the clinician
### 5. Emergency Procedures
- Telehealth is NOT appropriate for emergencies
- If I experience a medical emergency during or after a telehealth visit, I will call 911 or go to the nearest emergency department
- I will provide my current physical location and emergency contact at the start of each telehealth visit so that emergency services can be dispatched if needed
### 6. State of Practice and Jurisdiction
I understand that the supervising physician (Dr. Troy Akers) is licensed in Georgia (license #67924) and that telehealth services may be provided to patients physically located in Georgia. If I am physically located outside Georgia at the time of a telehealth visit, I will notify the practice; the practice may decline to provide service if I am located in a state where the physician is not licensed.
### 7. Right to Withdraw Consent
I understand that I may withdraw consent to telehealth at any time and request in-person visits instead. Withdrawal will not affect my future care.
### 8. Right to Decline Telehealth for a Specific Visit
I may decline telehealth for any specific visit and request an in-person appointment instead. The practice will accommodate when feasible.
---
I have read this Telehealth Consent. I voluntarily consent to receive telehealth services from Elevated Health Augusta. I understand the benefits, risks, and limitations described above.
`.trim(),
  sections: [{ id: "all", title: "Telehealth Consent", requires_attestation: true }],
  expiration_months: 12,
  signing_method: "typed_name",
  effective_from: "2026-05-14T00:00:00Z",
};
