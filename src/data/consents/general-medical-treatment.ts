import type { ConsentDocument } from "./types";

/** Legal text v2026-05-14-v1 — keep in sync with `supabase/migrations/20260515194500_seed_consent_versions.sql`. */
export const generalMedicalTreatmentConsent: ConsentDocument = {
  type: "general_medical_treatment",
  version_label: "2026-05-14-v1",
  title: "General Medical Treatment Consent",
  tier: 1,
  body_markdown: `
# GENERAL MEDICAL TREATMENT CONSENT
**Patient Name:** _________________________________
**Date of Birth:** _________________________________
**Date:** _________________________________
### 1. Consent to Evaluation and Treatment
I voluntarily consent to be evaluated and treated by the clinicians, registered nurses, and other healthcare staff of Elevated Health Augusta. I understand that my care may include:
- Medical history review and physical assessment
- Vital signs, body composition analysis, and other measurements
- Laboratory testing performed by LabCorp or other contracted labs
- Prescription of medications, including compounded medications
- Administration of injections, infusions, and other treatments
- Counseling and patient education
- Referral to other healthcare providers when indicated
### 2. Care Provided by RN Under Physician Standing Orders
I understand and consent to the following care model:
- Routine clinical services, including patient intake, ongoing assessments, administration of medications under standing orders, and management of established treatment plans, are commonly performed by registered nurses operating under physician-authorized standing orders.
- The practice's standing orders are authorized by Troy Akers, DO (primary supervising physician) and Dennis Williams, MD (secondary supervising physician), in accordance with Georgia law (O.C.G.A. § 43-26-3 et seq.).
- Standing orders define what care the registered nurse may provide without specific physician orders for each encounter.
- I understand that my care is overseen by a physician, but the majority of my visits may be conducted by the registered nurse. The physician is available for review of complex cases, lab interpretation, and protocol decisions.
- If at any time I prefer to be seen by the physician, I may request a Medical Review ($149 for non-members; included for members when staff-initiated escalations are warranted).
### 3. Right to Refuse Treatment
I understand that I have the right to refuse any treatment at any time. If I refuse a recommended treatment, the practice will explain the potential consequences but will respect my decision.
### 4. No Guarantee of Outcome
I understand that medicine is not an exact science and that no clinician has guaranteed any particular result or outcome from my care. The practice will provide care consistent with the applicable standard of care for a cash-pay wellness practice.
### 5. Records and Communication with Other Providers
I authorize the practice to:
- Maintain medical records of my care
- Communicate with other healthcare providers involved in my care (including pharmacies, labs, and consulting physicians)
- Share records as required by law
I do NOT authorize the practice to share my records with employers, family members, or other parties without my specific written authorization, except as required by law.
### 6. My Responsibilities as a Patient
I agree to:
- Provide complete and accurate health history, including all medications and supplements
- Disclose changes in my health status promptly
- Follow recommended treatment protocols
- Attend recommended follow-up appointments and laboratory monitoring
- Communicate concerns or adverse events promptly
- Not share my prescribed medications with others
### 7. Limits of Care
I understand the practice provides wellness and concierge medical services but does NOT provide:
- Emergency care (for emergencies, call 911 or go to the nearest emergency department)
- Acute illness primary care (urgent care or PCP recommended)
- Mental health crisis services (for crises, call 988 or go to the nearest emergency department)
- Surgery
- Inpatient care
---
I have read this consent. I voluntarily consent to evaluation and treatment by Elevated Health Augusta under the terms above.
`.trim(),
  sections: [{ id: "all", title: "General Medical Treatment Consent", requires_attestation: true }],
  expiration_months: 12,
  signing_method: "typed_name",
  effective_from: "2026-05-14T00:00:00Z",
};
