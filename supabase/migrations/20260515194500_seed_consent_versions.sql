-- Seed consent_versions v2026-05-14-v1 (data layer; legal_review_status pending).
-- body_markdown must match src/data/consents/*.ts byte-for-byte (trimmed template literal).
-- body_hash = encode(digest(body_markdown, 'sha256'), 'hex') via pgcrypto.

INSERT INTO public.consent_versions (
  consent_type,
  version_label,
  title,
  body_markdown,
  body_hash,
  effective_from,
  effective_to,
  is_active,
  legal_review_status
)
SELECT
  'terms_of_service',
  '2026-05-14-v1',
  'Practice Terms of Service & Financial Responsibility',
  b.md,
  encode(digest(b.md, 'sha256'), 'hex'),
  '2026-05-14T00:00:00Z'::timestamptz,
  NULL::timestamptz,
  true,
  'pending_review'
FROM (
  SELECT $eha_cv_tos$
# PRACTICE TERMS OF SERVICE & FINANCIAL RESPONSIBILITY
**Patient Name:** _________________________________
**Date of Birth:** _________________________________
**Date:** _________________________________
By signing below, I acknowledge that I have read, understand, and agree to the following terms governing my relationship with Elevated Health Augusta (operated by The Wilkers Group LLC).
### 1. Cash-Pay Practice; No Insurance Billing
Elevated Health Augusta is a cash-pay wellness and concierge medical practice. I understand that:
- The practice does not bill commercial health insurance, Medicare, Medicaid, TRICARE, or any other federal health program for services rendered.
- All fees are my personal responsibility, payable at the time of service or per the membership terms I have selected.
- I may, at my own discretion, request a superbill following payment that I can submit to my insurance carrier for possible out-of-network reimbursement. The practice makes no representation that any portion will be reimbursed.
- The practice does not participate in any insurance network or contract.
### 2. Service Pricing
I have been provided current pricing for the services I am receiving. Pricing for all services is published on the practice website at elevatedhealthaugusta.com. Prices are subject to change with reasonable notice; existing members maintain their membership pricing for the duration of continuous, uninterrupted membership.
### 3. Membership Terms
If I enroll in any ELEVATED program membership:
- The membership auto-renews monthly on the same calendar day each month.
- I may cancel my membership at any time with 30 days' written notice via the patient portal or by emailing the practice.
- Cancellation takes effect at the end of the current billing cycle. I will not receive a prorated refund for the cancellation month.
- If I cancel mid-cycle, I retain access to membership services through the end of the paid cycle.
- Re-enrollment after cancellation is subject to then-current membership pricing.
### 4. Appointment Policies
- I will provide at least 24 hours' notice to cancel or reschedule an appointment.
- Cancellations within 24 hours of the appointment time are considered late cancellations.
- Failure to attend a scheduled appointment without notice is a no-show.
- A $99 rebooking fee will be assessed for late cancellations and no-shows. This fee is non-negotiable and is charged to the payment method on file.
- The practice reserves the right to decline future appointments after repeated no-shows.
### 5. Payment and Charges
- I authorize Elevated Health Augusta to charge the payment method I have provided for all services, products, memberships, and applicable fees.
- I understand that payment is required at the time of service for non-member services.
- I will keep current payment information on file. If my payment method fails, I will be notified and given 7 days to update before my services may be paused.
- Disputed charges should be raised directly with the practice in writing before initiating a chargeback. Initiating a chargeback without first attempting resolution may result in termination of the patient relationship.
### 6. Refund Policy
- Refunds are issued at the practice's discretion.
- Generally: Yes — for services not yet rendered and medications not yet dispensed.
- Generally: No — for services already provided and medications already dispensed (medication cannot be re-dispensed).
- Membership refunds: prorated for cancellations only where required by law.
### 7. Scope of Services
The practice provides wellness-focused services including but not limited to: hormone replacement therapy, peptide therapy, weight management (including GLP-1 medications), IV hydration and nutrient therapy, sexual wellness, hair restoration, and related preventive and optimization services. The practice does not provide emergency care, mental health crisis services, or primary care for acute illness. Patients experiencing emergencies should call 911 or go to the nearest emergency department.
### 8. Communication Methods
I understand the practice may communicate with me via email, SMS, secure messaging within the patient portal, and phone. Standard messaging and data rates may apply. I separately consent to electronic communications under the Communication Consent section.
### 9. Electronic Records and Signatures
I consent to the use of electronic records and signatures for all aspects of my care. Electronic signatures applied to consents, prescriptions, intake forms, and other documents have the same legal effect as handwritten signatures under federal and Georgia law (the federal ESIGN Act and the Georgia Uniform Electronic Transactions Act).
### 10. Termination of the Patient Relationship
Either I or the practice may terminate the patient relationship. The practice may terminate for reasons including but not limited to: non-payment, abusive conduct toward staff, failure to follow medical recommendations, fraudulent representation of health history, or activity that endangers patient safety. The practice will provide reasonable notice and access to records on termination.
### 11. Governing Law
This Terms of Service is governed by the laws of the State of Georgia. Disputes must be brought in the state or federal courts located in Columbia County, Georgia.
### 12. Severability and Entire Agreement
If any provision is found unenforceable, the remaining provisions remain in force. These terms, together with the other consents I sign at intake, constitute the agreement between me and the practice.
---
I have read these Terms of Service. I understand them. I agree to be bound by them.
  $eha_cv_tos$::text AS md
) b
ON CONFLICT (consent_type, version_label) DO NOTHING;

INSERT INTO public.consent_versions (
  consent_type,
  version_label,
  title,
  body_markdown,
  body_hash,
  effective_from,
  effective_to,
  is_active,
  legal_review_status
)
SELECT
  'hipaa_acknowledgment',
  '2026-05-14-v1',
  'HIPAA Notice of Privacy Practices Acknowledgment',
  b.md,
  encode(digest(b.md, 'sha256'), 'hex'),
  '2026-05-14T00:00:00Z'::timestamptz,
  NULL::timestamptz,
  true,
  'pending_review'
FROM (
  SELECT $eha_cv_hipaa$
# HIPAA NOTICE OF PRIVACY PRACTICES ACKNOWLEDGMENT
**Patient Name:** _________________________________
**Date of Birth:** _________________________________
**Date:** _________________________________
### Acknowledgment of Receipt
I, the undersigned, acknowledge that I have received and had the opportunity to review the Notice of Privacy Practices of Elevated Health Augusta. The Notice describes:
- How my protected health information (PHI) may be used and disclosed by the practice.
- My rights with respect to my PHI, including the right to inspect and copy records, request amendments, request restrictions on use, and receive an accounting of disclosures.
- The practice's legal duties with respect to my PHI.
- How to file a complaint if I believe my privacy rights have been violated.
### My Rights Under HIPAA
I understand I have the following rights:
- **Right to access** — I may inspect and obtain a copy of my medical records, generally within 30 days of request.
- **Right to amend** — I may request that the practice amend my records if I believe they are inaccurate or incomplete.
- **Right to an accounting of disclosures** — I may request a list of certain disclosures of my PHI.
- **Right to request restrictions** — I may request restrictions on use and disclosure of my PHI for treatment, payment, or healthcare operations. The practice is not required to agree to all restrictions.
- **Right to confidential communications** — I may request that communications be sent by alternative means or to alternative locations.
- **Right to a paper copy of the Notice** — I may request a paper copy at any time.
- **Right to file a complaint** — I may file a complaint with the practice or with the U.S. Department of Health and Human Services without fear of retaliation.
### Permitted Uses and Disclosures
I understand the practice may use or disclose my PHI without my specific authorization for:
- **Treatment** — providing care and coordinating with other healthcare providers, including compounding pharmacies, laboratories, and consulting physicians.
- **Payment** — processing payments and producing superbills.
- **Healthcare operations** — quality improvement, training, and business management.
- **As required by law** — public health reporting, court orders, law enforcement requests, and other legally mandated disclosures.
### Authorization for Other Disclosures
Any use or disclosure of my PHI beyond those permitted under HIPAA requires my written authorization, which I may revoke at any time.
### Updates to the Notice
The practice may update the Notice of Privacy Practices. The current version is available on the practice website and at the office. Material changes will be communicated to me.
---
I acknowledge receipt of the Notice of Privacy Practices. I have had the opportunity to ask questions and request additional information.
  $eha_cv_hipaa$::text AS md
) b
ON CONFLICT (consent_type, version_label) DO NOTHING;

INSERT INTO public.consent_versions (
  consent_type,
  version_label,
  title,
  body_markdown,
  body_hash,
  effective_from,
  effective_to,
  is_active,
  legal_review_status
)
SELECT
  'general_medical_treatment',
  '2026-05-14-v1',
  'General Medical Treatment Consent',
  b.md,
  encode(digest(b.md, 'sha256'), 'hex'),
  '2026-05-14T00:00:00Z'::timestamptz,
  NULL::timestamptz,
  true,
  'pending_review'
FROM (
  SELECT $eha_cv_gmt$
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
  $eha_cv_gmt$::text AS md
) b
ON CONFLICT (consent_type, version_label) DO NOTHING;

INSERT INTO public.consent_versions (
  consent_type,
  version_label,
  title,
  body_markdown,
  body_hash,
  effective_from,
  effective_to,
  is_active,
  legal_review_status
)
SELECT
  'telehealth',
  '2026-05-14-v1',
  'Telehealth Consent',
  b.md,
  encode(digest(b.md, 'sha256'), 'hex'),
  '2026-05-14T00:00:00Z'::timestamptz,
  NULL::timestamptz,
  true,
  'pending_review'
FROM (
  SELECT $eha_cv_th$
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
  $eha_cv_th$::text AS md
) b
ON CONFLICT (consent_type, version_label) DO NOTHING;

INSERT INTO public.consent_versions (
  consent_type,
  version_label,
  title,
  body_markdown,
  body_hash,
  effective_from,
  effective_to,
  is_active,
  legal_review_status
)
SELECT
  'communication',
  '2026-05-14-v1',
  'Communication Consent',
  b.md,
  encode(digest(b.md, 'sha256'), 'hex'),
  '2026-05-14T00:00:00Z'::timestamptz,
  NULL::timestamptz,
  true,
  'pending_review'
FROM (
  SELECT $eha_cv_comm$
# COMMUNICATION CONSENT
**Patient Name:** _________________________________
**Date of Birth:** _________________________________
**Date:** _________________________________
### 1. Authorization to Communicate
I authorize Elevated Health Augusta to communicate with me using the following methods at the contact information I have provided:
- **Email** — appointment reminders, lab results notifications, billing notices, educational content, refill reminders, and other care-related messages
- **SMS / text message** — appointment reminders, urgent notifications, refill alerts, and other time-sensitive messages
- **Phone calls** — for clinical discussions, appointment scheduling, and follow-up
- **Patient portal secure messaging** — for clinical questions, results delivery, and ongoing communication
- **Postal mail** — billing statements, regulatory notices, and other communications
### 2. SMS / Text Message Consent (TCPA-Compliant Opt-In)
I expressly consent to receive automated and non-automated text messages from Elevated Health Augusta at the mobile phone number I have provided. Message frequency varies based on my care needs. Message and data rates may apply. I may opt out of SMS at any time by replying STOP to any message; opting out of SMS does not affect my care, but may affect timeliness of communications.
### 3. Use of Patient Portal for Messaging
I understand that secure messaging through the patient portal is the preferred channel for clinical communication. Messages sent through the portal are protected. Email and SMS notifications may be sent to alert me that a new portal message is waiting, but the message content itself remains in the portal.
### 4. Privacy of Email and SMS
I understand that:
- Email and SMS are NOT considered fully secure communication methods
- The practice will not include detailed clinical information in email or SMS — these channels are used for notifications and non-PHI communication
- If I prefer the practice avoid email or SMS for any specific topic, I will notify the practice
### 5. Family / Emergency Contact Authorization
The practice will not communicate with family members or emergency contacts about my care without my specific written authorization. I may designate authorized contacts at intake or update my preferences at any time through the patient portal.
### 6. Withdrawal of Consent
I may withdraw consent for any communication channel at any time. Withdrawal of SMS consent does not affect my care, but limits how quickly the practice can reach me.
---
I have read this Communication Consent. I voluntarily consent to the communication channels indicated above.
  $eha_cv_comm$::text AS md
) b
ON CONFLICT (consent_type, version_label) DO NOTHING;

