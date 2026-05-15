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
  'research_peptide',
  '2026-05-15-v1',
  'Research Peptide Therapy Informed Consent',
  b.md,
  encode(digest(b.md, 'sha256'), 'hex'),
  '2026-05-15T00:00:00Z'::timestamptz,
  NULL::timestamptz,
  true,
  'pending_review'
FROM (
  SELECT $eha_cv_rp$
# RESEARCH PEPTIDE THERAPY INFORMED CONSENT
**Patient Name:** _________________________________
**Date of Birth:** _________________________________
**Date:** _________________________________
**Document version:** 2026-05-15-v1
---
## READ THIS DOCUMENT CAREFULLY. IT DESCRIBES A FORM OF MEDICAL TREATMENT THAT INVOLVES SUBSTANCES THAT ARE NOT APPROVED BY THE U.S. FOOD AND DRUG ADMINISTRATION. BY SIGNING THIS DOCUMENT, YOU ARE ACCEPTING RISKS AND LIMITATIONS THAT WOULD NOT APPLY TO TRADITIONAL FDA-APPROVED MEDICATIONS.
---
## SECTION 1 — WHAT THIS CONSENT COVERS
This consent governs my receipt of research peptide therapy from Elevated Health Augusta (the "Practice"). Research peptides are short chains of amino acids that the Practice prescribes for purposes including, but not limited to, tissue repair, recovery, immune modulation, cognitive function, growth hormone modulation, and skin and connective tissue support.
### 1.1 — Substances Currently Offered
As of the date of this consent, the Practice currently offers the following research peptides under this consent framework:
- **BPC-157** (Body Protection Compound)
- **TB-500** (Thymosin Beta-4 fragment)
- **CJC-1295** (with or without DAC)
- **Ipamorelin**
- **Selank**
- **Thymosin Alpha-1**
- **GHK-Cu** (Copper Tripeptide) — sublingual and topical formulations preferred; injectable formulation only when clinically indicated
- **"Wolverine Stack"** — a combined protocol of BPC-157 and TB-500
The Practice also offers the following peptides that, while clinically related, do NOT require this consent because they are FDA-approved, not on the FDA Category 2 Bulk Substances list, or otherwise have a distinct regulatory status:
- Sermorelin
- Tesamorelin (FDA-approved for HIV-associated lipodystrophy; may be prescribed off-label for other indications, in which case the separate Off-Label Use Acknowledgment applies)
- NAD+ (all delivery methods)
- PT-141 (Bremelanotide, FDA-approved as Vyleesi for HSDD)
- Pentadeca Arginate (PDA)
### 1.2 — Class-Based Consent
I understand that this consent applies not only to the specific substances listed in Section 1.1, but to the **class** of research peptides — meaning substances with the following shared characteristics:
- Not approved by the FDA for human prescription use
- May appear on the FDA Category 2 Bulk Substances list, which identifies substances the FDA has flagged for safety review
- Compounded by a state-licensed 503A compounding pharmacy on a per-prescription basis
- Used for wellness, longevity, recovery, or quality-of-life indications rather than treatment of a specific FDA-recognized disease
This means that if the Practice adds a new research peptide to its formulary that shares this class profile, I will be notified and asked to acknowledge the addition through a brief Substance Addition Acknowledgment. I will NOT be required to re-sign this entire consent unless the new substance carries materially different risks not covered by this document.
If a new substance is added that has materially different risks — for example, novel cancer warnings, novel cardiac risks, or risks of a different class than those described below — I will be required to sign a new consent specific to that substance before receiving it.
### 1.3 — Substances I Will NOT Receive Under This Consent
I understand that this consent does NOT cover:
- Controlled substances of any schedule
- Anabolic-androgenic steroids
- Selective Androgen Receptor Modulators (SARMs)
- Substances on the FDA Difficult to Compound list
- Substances explicitly prohibited from compounding by the FDA (including Retatrutide, as of the date of this consent)
- Any peptide or substance used for performance enhancement in athletic competition
---
## SECTION 2 — REGULATORY STATUS (ATTESTATION REQUIRED)
### 2.1 — Not FDA-Approved
I understand that the substances offered under this consent are NOT approved by the U.S. Food and Drug Administration ("FDA") for human prescription use for the indications for which I am being prescribed them. This means:
- The FDA has not reviewed and approved these substances for safety and efficacy at the doses I will receive
- These substances are not available as commercial pharmaceutical products
- They are prepared by a compounding pharmacy specifically for me under my prescription
- Standard pharmaceutical quality-control processes (FDA-approved manufacturing, batch testing for commercial release, etc.) do NOT apply to these substances in the same way they apply to FDA-approved medications
### 2.2 — FDA Category 2 Bulk Substances List
I understand that several of the substances offered under this consent (including but not limited to BPC-157, TB-500, CJC-1295, Ipamorelin, Selank, Thymosin Alpha-1, and GHK-Cu in its injectable form) appear on the FDA's Category 2 Bulk Substances list. This list identifies substances the FDA has flagged for further safety review.
I understand the practical implications of Category 2 status:
- The FDA may, at any time and without prior notice, prohibit compounding pharmacies from preparing these substances
- If the FDA prohibits compounding of a substance I am currently receiving, the Practice may be required to discontinue prescribing it
- The Practice will provide reasonable notice if a substance I am receiving is no longer available
- The Practice cannot guarantee continuous availability of any specific substance offered under this consent
### 2.3 — Off-Label and Unproven Indications
I understand that the indications for which I am being prescribed these substances are NOT FDA-recognized indications. The clinical evidence supporting their use varies and includes:
- Animal studies and preclinical research
- Small human studies, often unpublished or non-peer-reviewed
- Case reports and case series
- Anecdotal clinical experience
- Mechanism-of-action reasoning
I understand that this body of evidence does NOT meet the standard required for FDA approval, and that more rigorous studies may, in the future, reveal that some or all of these substances are not effective for the purposes for which they are being prescribed.
### 2.4 — Section 2 Attestation
**I attest that I have read Section 2 in its entirety. I understand that the substances I will receive under this consent are not FDA-approved, are or may be on the FDA Category 2 list, and may be prohibited from compounding at any time. I accept these regulatory realities as a condition of receiving this therapy.**
☐ I attest to the above. (Required to proceed.)
---
## SECTION 3 — RISKS AND ADVERSE EVENTS (ATTESTATION REQUIRED)
### 3.1 — Common Side Effects
I understand that, like all bioactive substances, research peptides carry risks of adverse effects. Common reported side effects include, but are not limited to:
**Injection-site reactions:** redness, swelling, bruising, pain, itching, or local infection at the injection site. Infection is rare with proper technique but can be serious if it occurs.
**Systemic reactions:** flushing, headache, fatigue, dizziness, nausea, transient changes in heart rate or blood pressure.
**Allergic and immune reactions:** rash, hives, itching, sensitivity reactions. In rare cases, severe allergic reactions (anaphylaxis) may occur, which can be life-threatening if not treated immediately.
**Hormonal effects:** depending on the specific peptide, effects on appetite, blood sugar, insulin sensitivity, growth hormone levels, IGF-1 levels, cortisol levels, prolactin levels, or thyroid function. These effects may be desired or undesired depending on context.
**Mood and sleep changes:** alterations in mood, anxiety, sleep quality, or vivid dreams have been reported with certain peptides.
### 3.2 — Substance-Specific Risks
In addition to the class risks above, individual substances may carry additional risks:
**BPC-157, TB-500, GHK-Cu:** theoretical concern about effects on tumor growth, given their tissue-repair and angiogenic mechanisms. While clinical evidence of tumor promotion in humans is not established, patients with active or recent history of cancer should consult with their oncologist before using these substances. Long-term safety data is limited.
**CJC-1295, Ipamorelin (and other GHRH analogs and growth hormone secretagogues):** effects on insulin sensitivity, blood sugar, IGF-1 levels, and water retention. May worsen carpal tunnel syndrome. Theoretical effects on tumor growth via IGF-1 elevation. Patients with diabetes or prediabetes may experience changes in blood sugar control. Patients with active cancer or recent cancer history should consult with their oncologist.
**Selank, Thymosin Alpha-1:** effects on immune function. Patients with autoimmune conditions or immunosuppressive regimens should discuss with their treating physicians.
**Thymosin Alpha-1:** may interact with immunosuppressive medications.
### 3.3 — Unknown Long-Term Risks
I understand that, because these substances lack long-term human safety data:
- Risks that emerge only after years of use are NOT well characterized
- Effects on chronic disease risk (cardiovascular, oncologic, neurologic) are largely unknown
- Effects on fertility, pregnancy outcomes, and developing fetuses are largely unknown
- Drug-drug interactions with prescription and non-prescription substances are incompletely characterized
### 3.4 — Pregnancy, Breastfeeding, and Fertility
I understand that:
- The safety of these substances during pregnancy and breastfeeding is NOT established
- These substances should NOT be used during pregnancy or breastfeeding
- I will notify the Practice immediately if I become pregnant or am attempting to conceive while using these substances
- Effects on male fertility and sperm quality are largely unknown
- If pregnancy is a possibility, I will use reliable contraception while using these substances and for a reasonable period after discontinuation
### 3.5 — Athletic Competition and WADA Status
I understand that several substances offered under this consent — including but not limited to BPC-157, TB-500, CJC-1295, Ipamorelin, and other growth hormone secretagogues — are prohibited substances under the World Anti-Doping Agency (WADA) Code and the rules of most competitive athletic governing bodies.
If I am a competitive athlete subject to drug testing (including but not limited to NCAA, professional sports, Olympic-level competition, military fitness testing in certain circumstances, or other sanctioned competition), my use of these substances may result in a positive drug test, disqualification, suspension, and other sanctions by the relevant governing body. **The Practice does NOT prescribe these substances for performance enhancement in athletic competition, and I am NOT receiving them for that purpose.**
### 3.6 — Section 3 Attestation
**I attest that I have read Section 3 in its entirety. I understand the categories of risks described, including common side effects, substance-specific risks, unknown long-term risks, pregnancy and fertility considerations, and athletic-competition consequences. I have had the opportunity to ask questions about specific risks and to discuss my personal medical history with the clinical team.**
☐ I attest to the above. (Required to proceed.)
---
## SECTION 4 — NO GUARANTEE OF OUTCOME (ATTESTATION REQUIRED)
### 4.1 — No Guaranteed Benefit
I understand that:
- The Practice has NOT guaranteed that I will experience any specific benefit from these substances
- Individual response varies; some patients experience significant benefit, some experience modest benefit, and some experience no measurable benefit
- The benefits reported in clinical literature may not apply to my specific circumstance
- The Practice's clinical recommendations are based on best available evidence at the time of prescription, which evidence is limited and may change
### 4.2 — No Treatment of Diagnosed Disease
I understand that these substances are NOT being prescribed to treat or cure any FDA-recognized disease or condition. They are being prescribed for wellness, longevity, recovery, or quality-of-life indications. If I have a diagnosed medical condition that requires treatment, I understand that:
- Research peptides are NOT a substitute for evidence-based treatment of that condition
- I should continue to receive appropriate care for any diagnosed condition from qualified providers
- The Practice does NOT represent that these substances will treat, cure, or prevent any disease
### 4.3 — Section 4 Attestation
**I attest that I have read Section 4 in its entirety. I understand that no specific benefit has been guaranteed, that these substances are not being prescribed to treat any FDA-recognized disease, and that I should continue appropriate evidence-based care for any diagnosed conditions I have.**
☐ I attest to the above. (Required to proceed.)
---
## SECTION 5 — SOURCING AND COMPOUNDING (ATTESTATION REQUIRED)
### 5.1 — 503A Compounding Pharmacy Sourcing
I understand that all substances I receive under this consent will be compounded by a state-licensed 503A compounding pharmacy under prescription from the Practice. The Practice has identified the following primary partner pharmacy:
- **Formulation Compounding Center (FCC)** — Lewisville, Texas
The Practice may use other state-licensed 503A compounding pharmacies as clinically appropriate or as availability requires.
I understand that:
- 503A compounding pharmacies are state-licensed and subject to state board of pharmacy oversight
- 503A pharmacies prepare medications for individual patients under specific prescriptions
- 503A pharmacies are NOT FDA-inspected manufacturing facilities, and the products they produce are NOT FDA-approved commercial pharmaceuticals
- Quality and consistency may vary among compounding pharmacies
### 5.2 — Gray Market Risk
I understand that "research peptides" are widely available on the internet from unregulated sources marketed as "for research purposes only" or "not for human consumption." I understand:
- I will NOT obtain my peptides from any source other than the compounding pharmacy designated by the Practice
- Gray-market peptide sources may contain incorrect dosages, contamination, or substances entirely different from what is labeled
- Self-sourcing from gray-market vendors is dangerous and may result in serious harm
- If I have used or am currently using peptides from gray-market sources, I will disclose this to the Practice
- The Practice will discontinue prescribing if it has reason to believe I am also self-sourcing from unregulated vendors
### 5.3 — Storage, Reconstitution, and Administration
I understand that proper storage, reconstitution, and administration of these substances is essential to safety and efficacy:
- I will follow all storage instructions (refrigeration, protection from light, etc.) as instructed by the clinical team
- I will follow reconstitution instructions exactly as provided, using only the bacteriostatic water or diluent supplied with the medication
- I will use sterile injection technique and dispose of needles in a sharps container
- I will NOT share medications, needles, or syringes with any other person
- I will contact the Practice immediately if I have questions about administration technique
### 5.4 — Section 5 Attestation
**I attest that I have read Section 5 in its entirety. I understand the regulatory status of compounded medications, the risks of gray-market self-sourcing, and the storage and administration requirements. I commit to obtaining my peptides only through the Practice's designated compounding pharmacy.**
☐ I attest to the above. (Required to proceed.)
---
## SECTION 6 — MONITORING AND DISCONTINUATION
### 6.1 — Lab Monitoring
I understand that the Practice may require baseline and periodic laboratory monitoring while I am using these substances, which may include:
- Complete blood count and metabolic panel
- Glucose, hemoglobin A1c, and insulin (for growth hormone secretagogues)
- IGF-1 (for growth hormone secretagogues)
- Liver function tests
- Other tests as clinically indicated based on the specific peptide and my medical history
I agree to complete required laboratory monitoring as a condition of continued therapy. Refusal to complete required monitoring may result in discontinuation of therapy.
### 6.2 — Adverse Event Reporting
I will report any of the following to the Practice promptly:
- New or worsening symptoms that may be related to therapy
- Severe injection-site reactions
- Signs of allergic reaction (rash, hives, difficulty breathing, swelling of face/tongue/throat)
- Any hospitalization or emergency department visit
- Any new diagnosis of cancer or other serious medical condition
- Any pregnancy or suspected pregnancy
- Any new medication, supplement, or recreational substance use
### 6.3 — Right to Discontinue
I understand that:
- I may discontinue therapy at any time, with or without notifying the Practice
- The Practice may discontinue prescribing if my clinical situation changes, if monitoring is not completed, if I fail to follow recommendations, or if continued therapy is no longer appropriate in the Practice's judgment
- The Practice may discontinue prescribing if a substance becomes unavailable, is prohibited by the FDA, or is no longer available from the compounding pharmacy
- I will be notified of any planned discontinuation and given appropriate guidance for tapering or transition
---
## SECTION 7 — ASSUMPTION OF RISK AND RELEASE (ATTESTATION REQUIRED)
### 7.1 — Assumption of Risk
Having read this consent and having had the opportunity to ask questions, I voluntarily assume the risks of receiving research peptide therapy, including but not limited to the risks described in Sections 2 through 5 of this consent and any risks that may emerge that are not currently known.
### 7.2 — Acknowledgment of Alternatives
I understand that alternatives to research peptide therapy exist, including:
- Lifestyle modifications (diet, exercise, sleep, stress management)
- FDA-approved medications for any FDA-recognized condition I may have
- No treatment
- Other evidence-based wellness interventions
I have considered these alternatives and voluntarily choose to receive research peptide therapy at this time.
### 7.3 — Release and Limitation of Liability
To the maximum extent permitted by Georgia law, I release the Practice, its owners, employees, contractors, and agents from liability for adverse outcomes arising from the inherent risks of research peptide therapy that have been disclosed in this consent and that occur in the absence of negligence on the Practice's part.
**This release does NOT apply to:**
- Negligent care
- Failure to follow established standards of care
- Intentional misconduct
- Gross negligence
- Any claim that cannot legally be waived under Georgia law
I understand that this release does NOT waive my rights to pursue claims based on negligence or other legally non-waivable grounds.
### 7.4 — Section 7 Attestation
**I attest that I have read Section 7 in its entirety. I voluntarily assume the disclosed risks of research peptide therapy. I understand that this consent does not release the Practice from liability for negligence or for any claim that cannot legally be waived under Georgia law.**
☐ I attest to the above. (Required to proceed.)
---
## SECTION 8 — DURATION AND RENEWAL OF THIS CONSENT
This consent is effective on the date signed below and remains in effect for twelve (12) months. The Practice will request that I re-sign this consent annually as a condition of continued therapy.
I may withdraw this consent at any time by:
- Notifying the Practice in writing or through the patient portal
- Discontinuing therapy
Withdrawal of consent does NOT retroactively invalidate care already provided.
If the Practice adds a new substance to the research peptide formulary that shares the class profile described in Section 1.2, I will receive a Substance Addition Acknowledgment, which I may sign without re-executing this entire consent.
---
## SECTION 9 — QUESTIONS AND OPPORTUNITY TO DISCUSS
I have had the opportunity to ask questions about this consent and about research peptide therapy in general. The clinical team has answered my questions to my satisfaction. If I have additional questions after signing this consent, I understand I may contact the Practice at:
**Phone:** (706) 760-3470
**Address:** 7013 Evans Town Center Blvd, Suite 203, Evans, GA 30809
**Patient Portal:** elevatedhealthaugusta.com
---
## SECTION 10 — PATIENT SIGNATURE AND ATTESTATION
By signing below, I attest that:
1. I have read this entire consent in its entirety, including all sections
2. I have completed all required per-section attestations in Sections 2, 3, 4, 5, and 7
3. I have had the opportunity to ask questions and receive answers
4. I am at least 18 years of age and have the legal capacity to consent to my own medical care
5. I am signing voluntarily and without coercion
6. I understand that my electronic signature has the same legal effect as a handwritten signature
**Patient signature (typed full legal name):** _________________________________
**Date and time signed (auto-captured):** _________________________________
**IP address (auto-captured):** _________________________________
**Document version signed:** 2026-05-15-v1
**Document hash (auto-captured):** _________________________________
---
*End of Research Peptide Therapy Informed Consent.*
  $eha_cv_rp$::text AS md
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
  'hormone_therapy',
  '2026-05-15-v1',
  'Hormone Replacement Therapy Informed Consent',
  b.md,
  encode(digest(b.md, 'sha256'), 'hex'),
  '2026-05-15T00:00:00Z'::timestamptz,
  NULL::timestamptz,
  true,
  'pending_review'
FROM (
  SELECT $eha_cv_hrt$
# HORMONE REPLACEMENT THERAPY INFORMED CONSENT
**Patient Name:** _________________________________
**Date of Birth:** _________________________________
**Date:** _________________________________
**Document version:** 2026-05-15-v1
---
## READ THIS DOCUMENT CAREFULLY. IT DESCRIBES THE BENEFITS, RISKS, AND ALTERNATIVES OF HORMONE REPLACEMENT THERAPY ("HRT"). BY SIGNING THIS DOCUMENT, YOU ARE CONSENTING TO RECEIVE HORMONE REPLACEMENT THERAPY FROM ELEVATED HEALTH AUGUSTA.
---
## SECTION 1 — WHAT THIS CONSENT COVERS
This consent governs my receipt of hormone replacement therapy ("HRT") from Elevated Health Augusta (the "Practice"). HRT may include, depending on my clinical needs and the recommendations of the clinical team:
### 1.1 — Hormones I May Receive
**For male patients (Testosterone Replacement Therapy / "TRT"):**
- Testosterone (typically as testosterone cypionate, testosterone propionate, or other esters), administered by intramuscular or subcutaneous injection, topical cream or gel, or compounded oral or sublingual preparations
- Anastrozole or other aromatase inhibitors, if needed to manage estradiol levels during testosterone therapy
- Human Chorionic Gonadotropin (HCG) or related agents, if clinically indicated to preserve testicular function or fertility
- Enclomiphene citrate or other selective estrogen receptor modulators ("SERMs"), if clinically indicated as an alternative or adjunct to testosterone therapy
**For female patients (Bioidentical Hormone Replacement Therapy / "BHRT"):**
- Estradiol (bioidentical estrogen), administered as topical cream, transdermal patch, vaginal preparation, or compounded oral or sublingual preparations
- Estriol, alone or in combination with estradiol ("Bi-Est")
- Progesterone (bioidentical), administered orally, topically, or vaginally
- Testosterone (low-dose for female patients), administered as topical cream or compounded preparations
- DHEA, if clinically indicated
**For all patients:**
- Pregnenolone, if clinically indicated
- Thyroid hormone replacement (levothyroxine, liothyronine, or compounded T4/T3 combinations), if clinically indicated and supported by laboratory evidence
- Other hormonal agents that the clinical team and I agree are appropriate based on my clinical situation
### 1.2 — Compounded vs. Commercial Medications
I understand that:
- Some of the medications I may receive are FDA-approved commercial pharmaceutical products
- Other medications I may receive are compounded by a state-licensed 503A compounding pharmacy under prescription
- Compounded medications are NOT FDA-approved commercial products; they are prepared individually for me under prescription
- The Practice and I will discuss which form (commercial vs. compounded) is appropriate based on my clinical needs, insurance status (the Practice does not bill insurance, but I may have separate coverage for FDA-approved products), and personal preference
### 1.3 — Compounding Pharmacy Partners
The Practice works with the following 503A compounding pharmacies for hormone preparations:
- **Custom Pharmacy of Evans** — bio-identical hormone creams (Bi-Est, estradiol cream, testosterone cream for female patients, progesterone cream, and related topical preparations)
- **Formulation Compounding Center (FCC)** — Lewisville, Texas — injectable hormone preparations (testosterone cypionate, testosterone propionate, HCG, and related injectables) and other compounded preparations not available as creams
The Practice may use other state-licensed 503A compounding pharmacies as clinically appropriate or as availability requires.
### 1.4 — Administration Methods
Hormones may be administered by various routes including, but not limited to:
- Intramuscular or subcutaneous injection (self-administered at home after training)
- Topical creams, gels, or patches
- Vaginal preparations (for female patients receiving local estrogen therapy)
- Oral or sublingual preparations
- Subcutaneous pellet implantation (if offered)
The clinical team and I will determine the appropriate route based on my clinical needs, lifestyle, and preferences.
---
## SECTION 2 — POTENTIAL BENEFITS OF HRT
I understand that HRT may, but is not guaranteed to, provide the following benefits:
### 2.1 — For Patients Receiving Testosterone Therapy
- Improved energy and reduced fatigue
- Improved mood and reduced symptoms of depression in patients with documented low testosterone
- Improved libido and sexual function
- Improved muscle mass and reduced body fat
- Improved bone mineral density
- Improved exercise capacity
- Improvement in symptoms of hypogonadism
### 2.2 — For Patients Receiving Estrogen and/or Progesterone Therapy
- Relief of vasomotor symptoms (hot flashes, night sweats)
- Relief of genitourinary symptoms (vaginal dryness, urinary symptoms)
- Improvement in sleep quality
- Improvement in mood and reduction in mood lability associated with perimenopause and menopause
- Improvement in skin quality and elasticity
- Preservation of bone mineral density
- Potential cardiovascular benefits when started near the time of menopause (the "timing hypothesis"; benefits are most established for women under 60 or within 10 years of menopause onset)
- Reduction in risk of certain conditions, depending on individual circumstances
### 2.3 — For Patients Receiving Thyroid Replacement
- Resolution of hypothyroid symptoms (fatigue, cold intolerance, weight changes, cognitive symptoms)
- Normalization of thyroid laboratory markers
I understand that individual response to HRT varies significantly, and that the Practice has NOT guaranteed any specific benefit.
---
## SECTION 3 — GENERAL RISKS OF HRT (ATTESTATION REQUIRED)
### 3.1 — Risks Common Across Hormone Therapies
**Injection-site reactions** (for injected hormones): redness, pain, swelling, bruising, lump formation, or infection at the injection site. Infection is rare with proper technique but can be serious.
**Topical administration reactions:** skin irritation, redness, or rash at the application site. Possibility of transfer to others through skin contact (particularly important for testosterone applied topically — transfer to female partners or children can cause virilization in them).
**Allergic reactions:** rare but possible reactions to the active ingredient or to compounding excipients (carrier oils, preservatives, alcohol bases, etc.). Severe allergic reactions can be life-threatening if not treated immediately.
**Mood changes:** depending on the hormone and dose, may include mood elevation, irritability, anxiety, depression, emotional lability, or aggression. Significant mood changes should be reported to the Practice.
**Cardiovascular considerations:** hormones can affect cardiovascular risk factors. The relationship between HRT and cardiovascular disease is complex and depends on the patient's age, time since menopause (for women), baseline cardiovascular health, and the specific hormones used. Routine monitoring is required.
**Blood clot risk:** estrogen therapy, particularly oral estrogen, increases the risk of venous thromboembolism (blood clots). Risk is lower with transdermal preparations. Testosterone therapy may also affect coagulation.
**Liver effects:** oral hormones are metabolized through the liver and may affect liver function. Routine liver monitoring may be required.
**Effects on existing medical conditions:** HRT may worsen certain conditions (including but not limited to hormone-sensitive cancers, severe liver disease, severe heart disease, and uncontrolled hypertension). The clinical team will review my medical history before initiating therapy.
### 3.2 — Section 3 Attestation
**I attest that I have read Section 3 in its entirety. I understand the general risks of hormone replacement therapy, including injection-site and topical reactions, allergic reactions, mood changes, cardiovascular and blood clot considerations, liver effects, and effects on existing medical conditions. I have had the opportunity to discuss my personal medical history with the clinical team.**
☐ I attest to the above. (Required to proceed.)
---
## SECTION 4 — SPECIFIC RISKS OF TESTOSTERONE THERAPY (ATTESTATION REQUIRED)
If I am receiving testosterone therapy, I specifically understand and accept the following additional risks:
### 4.1 — Polycythemia (Elevated Red Blood Cell Count)
Testosterone therapy can increase red blood cell count, leading to polycythemia or erythrocytosis. Severe polycythemia increases the risk of blood clots, stroke, and heart attack. I will complete regular hematocrit monitoring. If my hematocrit exceeds the threshold established by the clinical team, dose reduction, dose interruption, or therapeutic phlebotomy (blood donation) may be required.
### 4.2 — Cardiovascular Risk
The relationship between testosterone therapy and cardiovascular events is the subject of ongoing scientific debate. Some studies have suggested increased cardiovascular risk; others have not. I understand that:
- Testosterone therapy may increase cardiovascular risk in certain patient populations
- The Practice will assess my cardiovascular risk before and during therapy
- I will report any chest pain, shortness of breath, palpitations, or other cardiovascular symptoms promptly
### 4.3 — Prostate Considerations
In male patients:
- Testosterone may stimulate growth of prostate tissue
- Testosterone is contraindicated in patients with active prostate cancer
- Testosterone therapy in patients with a history of prostate cancer requires consultation with their urologist or oncologist
- PSA (prostate-specific antigen) monitoring is required during therapy
- Lower urinary tract symptoms may worsen during therapy
### 4.4 — Fertility and Testicular Function
In male patients, testosterone therapy:
- Suppresses natural testosterone production
- Significantly reduces sperm production, often to infertile levels
- May cause testicular atrophy (shrinkage)
- Recovery of fertility after discontinuation is variable and not guaranteed
- If I intend to father children in the future, I should consult with a reproductive specialist about fertility preservation (sperm banking) BEFORE starting testosterone therapy. The Practice does not provide or facilitate fertility preservation services.
- HCG or SERM adjunct therapy may partially preserve testicular function and fertility but does not guarantee preservation
### 4.5 — Estrogen Conversion
Testosterone can convert to estradiol in the body via the aromatase enzyme. Elevated estradiol in male patients may cause:
- Breast tenderness or development of glandular breast tissue (gynecomastia)
- Fluid retention and edema
- Mood changes
- Erectile difficulties
If estradiol levels become elevated, the clinical team may recommend an aromatase inhibitor (such as anastrozole). I understand that excessive estradiol suppression carries its own risks, including bone loss, joint pain, and mood effects.
### 4.6 — Acne, Hair Changes, and Sweating
Testosterone therapy may cause:
- Acne, particularly on the back, chest, and shoulders
- Increased body hair growth
- Male pattern hair loss (if genetically predisposed)
- Increased sweating
- Voice deepening (rare at therapeutic doses; more common in female patients receiving testosterone)
### 4.7 — Risks for Female Patients Receiving Testosterone
For female patients receiving low-dose testosterone:
- Increased body hair growth (hirsutism) and facial hair
- Acne
- Voice deepening (may be permanent)
- Clitoral enlargement (may be permanent)
- Male pattern hair loss
- Menstrual irregularities
Therapeutic doses for female patients are MUCH lower than male doses. Even small overdoses can cause virilizing effects that may be permanent.
### 4.8 — Section 4 Attestation
**I attest that I have read Section 4 in its entirety. I understand the specific risks of testosterone therapy, including polycythemia, cardiovascular risk, prostate considerations (if applicable), fertility effects (if applicable), estrogen conversion, and virilizing effects (if applicable). I understand that some virilizing effects in female patients may be permanent.**
☐ I attest to the above. (Required to proceed.)
---
## SECTION 5 — SPECIFIC RISKS OF ESTROGEN AND PROGESTERONE THERAPY (ATTESTATION REQUIRED)
If I am receiving estrogen and/or progesterone therapy, I specifically understand and accept the following additional risks:
### 5.1 — Breast Cancer Risk
The relationship between hormone therapy and breast cancer is complex:
- Combined estrogen-progestin therapy has been associated with a modest increase in breast cancer risk with longer-term use
- Estrogen-alone therapy (for women without a uterus) has been associated with a smaller or neutral effect on breast cancer risk in some studies
- The absolute increase in risk is small but real
- The risk may differ between bioidentical/transdermal preparations and synthetic/oral preparations, though evidence is incomplete
- Regular breast cancer screening (mammography per age-appropriate guidelines) is required during therapy
- Therapy is contraindicated in patients with active or recent breast cancer
### 5.2 — Endometrial Cancer Risk
In female patients with an intact uterus:
- Unopposed estrogen therapy (estrogen without progesterone) significantly increases the risk of endometrial cancer
- Patients with a uterus must receive progesterone (or progestin) alongside estrogen
- Any unexpected vaginal bleeding during therapy must be reported promptly and may require evaluation
### 5.3 — Cardiovascular and Stroke Risk
- Oral estrogen increases risk of venous thromboembolism (blood clots, including deep vein thrombosis and pulmonary embolism)
- Transdermal estrogen has a lower thromboembolic risk than oral preparations
- Estrogen therapy may increase stroke risk, particularly in older women and women started on therapy more than 10 years after menopause
- Therapy is contraindicated in patients with active or recent thromboembolic disease
### 5.4 — Gallbladder Disease
Estrogen therapy, particularly oral estrogen, increases the risk of gallbladder disease and may worsen pre-existing gallbladder problems.
### 5.5 — Progesterone Side Effects
Progesterone therapy may cause:
- Drowsiness or sedation (particularly with oral micronized progesterone)
- Mood changes, including depressed mood
- Bloating and breast tenderness
- Breakthrough bleeding (which should be reported)
### 5.6 — Risks for Male Patients Receiving Estrogen-Related Therapy
If estrogen therapy is being used in male patients for any clinically indicated reason, additional risks include:
- Gynecomastia (breast tissue development)
- Reduced libido and sexual function
- Fertility effects
- Mood changes
### 5.7 — Section 5 Attestation
**I attest that I have read Section 5 in its entirety. I understand the specific risks of estrogen and progesterone therapy, including breast cancer risk, endometrial cancer risk (if applicable), cardiovascular and stroke risk, gallbladder disease, and side effects of progesterone.**
☐ I attest to the above. (Required to proceed.)
---
## SECTION 6 — ALTERNATIVES TO HRT
I understand that alternatives to HRT exist, including:
- **Lifestyle modifications:** diet, exercise, stress management, sleep optimization, weight management
- **Non-hormonal medications:** certain antidepressants (SSRIs/SNRIs) for vasomotor symptoms, gabapentin, oxybutynin, and others
- **Non-hormonal therapies:** vaginal moisturizers and lubricants for genitourinary symptoms
- **Cognitive and behavioral interventions:** for sleep, mood, and symptom management
- **No treatment:** acceptance of symptoms without pharmacological intervention
- **Specialty referral:** to endocrinology, urology, gynecology, or other specialists if my clinical situation is complex
I have considered these alternatives and voluntarily choose to receive HRT at this time.
---
## SECTION 7 — RIGHT TO REFUSE OR DISCONTINUE
I understand that:
- I have the right to refuse any specific component of the recommended HRT regimen
- I may discontinue therapy at any time
- The Practice may discontinue prescribing if my clinical situation changes, if monitoring is not completed, if I develop a contraindication, or if continued therapy is no longer appropriate in the Practice's judgment
- Discontinuation of HRT may result in return of symptoms or other clinical effects; the clinical team will discuss appropriate tapering when feasible
---
## SECTION 8 — LAB MONITORING AND FOLLOW-UP (ATTESTATION REQUIRED)
### 8.1 — Required Baseline Labs
Before initiating HRT, I will complete baseline laboratory testing as recommended by the clinical team, which may include:
- Complete blood count
- Comprehensive metabolic panel including liver function
- Lipid panel
- Hormone levels (testosterone total and free, estradiol, progesterone, DHEA-S, SHBG, others as indicated)
- Thyroid panel (TSH, free T3, free T4, antibodies as indicated)
- Prostate-specific antigen (PSA), for male patients over age 40 or as clinically indicated
- Other tests based on my medical history and the specific therapy I will receive
### 8.2 — Required Ongoing Lab Monitoring
While receiving HRT, I will complete ongoing lab monitoring at intervals determined by the clinical team. Typical monitoring schedules include:
- First follow-up labs 6-12 weeks after initiation or dose change
- Regular monitoring thereafter (typically every 3-6 months in the first year, then every 6-12 months once stable)
- More frequent monitoring if clinically indicated
I understand that completing required lab monitoring is a CONDITION of continued therapy. The Practice may decline to refill prescriptions if monitoring is not current.
### 8.3 — Clinical Follow-Up
I will attend scheduled follow-up appointments (in-person or telehealth) with the clinical team. I will report new or worsening symptoms, side effects, or changes in my health status promptly.
### 8.4 — Section 8 Attestation
**I attest that I have read Section 8 in its entirety. I understand that baseline and ongoing lab monitoring is required and that completion of monitoring is a condition of continued therapy. I commit to attending follow-up appointments and reporting new or worsening symptoms.**
☐ I attest to the above. (Required to proceed.)
---
## SECTION 9 — MEDICATION SAFETY AND SHARING
I understand and agree that:
- I will NOT share my hormone medications with any other person under any circumstances
- I will store my medications safely, particularly testosterone (which can cause virilization in women and children through topical transfer or accidental administration)
- I will dispose of unused medication, needles, and syringes safely (sharps containers for needles)
- I will keep medications out of reach of children and pets
- For topical hormones, I will follow application site instructions to prevent transfer to others, including washing hands after application and covering the application site
---
## SECTION 10 — PREGNANCY, FERTILITY, AND BREASTFEEDING (ATTESTATION REQUIRED)
### 10.1 — Pregnancy Contraindication
I understand that:
- HRT is generally contraindicated during pregnancy
- Some hormones, particularly testosterone and unopposed estrogen, can cause serious harm to a developing fetus
- I will notify the Practice immediately if I become pregnant or am attempting to conceive while receiving HRT
### 10.2 — Breastfeeding
- Hormones may transfer to breast milk
- I will notify the Practice if I am breastfeeding or planning to breastfeed
### 10.3 — Contraception
For patients of reproductive potential:
- If pregnancy is possible and not desired, I will use reliable contraception during HRT
- I understand that testosterone therapy is NOT a reliable contraceptive in male or female patients
- I understand that HRT in female patients is NOT a reliable contraceptive
### 10.4 — Fertility Considerations
For male patients:
- Testosterone therapy significantly reduces fertility, often to infertile levels
- If I intend to father children, I should consult with a reproductive specialist about fertility preservation (sperm banking) BEFORE starting testosterone. The Practice does not provide or facilitate fertility preservation services.
For female patients:
- Estrogen and progesterone therapy may affect ovulation
- Effects on fertility vary; I should consult with a reproductive specialist if pregnancy is a goal
### 10.5 — Section 10 Attestation
**I attest that I have read Section 10 in its entirety. I understand that HRT is contraindicated during pregnancy, that hormones may transfer to breast milk, and that HRT affects fertility. I will notify the Practice of pregnancy, suspected pregnancy, or breastfeeding promptly. If applicable to my situation, I will use reliable contraception during therapy.**
☐ I attest to the above. (Required to proceed.)
---
## SECTION 11 — DURATION AND RENEWAL OF THIS CONSENT
This consent is effective on the date signed below and remains in effect for twelve (12) months. The Practice will request that I re-sign this consent annually as a condition of continued therapy.
I may withdraw this consent at any time by:
- Notifying the Practice in writing or through the patient portal
- Discontinuing therapy
If the Practice materially modifies its HRT protocols (for example, by adding new agents with materially different risk profiles), I may be asked to sign an updated consent before continuing therapy.
---
## SECTION 12 — QUESTIONS AND OPPORTUNITY TO DISCUSS
I have had the opportunity to ask questions about this consent and about hormone replacement therapy in general. The clinical team has answered my questions to my satisfaction.
**Phone:** (706) 760-3470
**Address:** 7013 Evans Town Center Blvd, Suite 203, Evans, GA 30809
**Patient Portal:** elevatedhealthaugusta.com
---
## SECTION 13 — PATIENT SIGNATURE AND ATTESTATION
By signing below, I attest that:
1. I have read this entire consent in its entirety, including all sections
2. I have completed all required per-section attestations in Sections 3, 4, 5, 8, and 10
3. I have had the opportunity to ask questions and receive answers
4. I am at least 18 years of age and have the legal capacity to consent to my own medical care
5. I am signing voluntarily and without coercion
6. I understand that my electronic signature has the same legal effect as a handwritten signature
**Patient signature (typed full legal name):** _________________________________
**Date and time signed (auto-captured):** _________________________________
**IP address (auto-captured):** _________________________________
**Document version signed:** 2026-05-15-v1
**Document hash (auto-captured):** _________________________________
---
*End of Hormone Replacement Therapy Informed Consent.*
  $eha_cv_hrt$::text AS md
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
  'glp1',
  '2026-05-15-v1',
  'GLP-1 / Weight Management Informed Consent',
  b.md,
  encode(digest(b.md, 'sha256'), 'hex'),
  '2026-05-15T00:00:00Z'::timestamptz,
  NULL::timestamptz,
  true,
  'pending_review'
FROM (
  SELECT $eha_cv_glp1$
# GLP-1 / WEIGHT MANAGEMENT INFORMED CONSENT
**Patient Name:** _________________________________
**Date of Birth:** _________________________________
**Date:** _________________________________
**Document version:** 2026-05-15-v1
---
## READ THIS DOCUMENT CAREFULLY. IT DESCRIBES THE BENEFITS, RISKS, AND LIMITATIONS OF GLP-1 RECEPTOR AGONIST THERAPY AND RELATED MEDICATIONS USED FOR WEIGHT MANAGEMENT. THIS DOCUMENT INCLUDES INFORMATION ABOUT FDA BLACK BOX WARNINGS AND CONTRAINDICATIONS. YOU MUST CONFIRM YOU DO NOT HAVE CERTAIN MEDICAL CONDITIONS BEFORE THERAPY CAN BE INITIATED.
---
## SECTION 1 — WHAT THIS CONSENT COVERS
This consent governs my receipt of weight management therapy from Elevated Health Augusta (the "Practice") using GLP-1 receptor agonists and related medications.
### 1.1 — Medications Covered
This consent covers, depending on my clinical needs and the recommendations of the clinical team:
- **Semaglutide** (the active ingredient in branded products including Ozempic®, Wegovy®, and Rybelsus®)
- **Tirzepatide** (the active ingredient in branded products including Mounjaro® and Zepbound®) — a dual GLP-1/GIP receptor agonist
- **Liraglutide** (the active ingredient in branded products including Saxenda® and Victoza®)
- Other GLP-1 receptor agonists or dual incretin agonists that may become available
Adjunctive medications may include:
- **Vitamin B12** (cyanocobalamin or methylcobalamin), often added to compounded preparations
- **Anti-nausea medications** (ondansetron or similar) for symptom management
- Other supportive medications as clinically indicated
### 1.2 — Compounded vs. Commercial Medications
I understand that:
- Semaglutide, tirzepatide, and liraglutide are available as FDA-approved commercial pharmaceutical products
- The Practice may prescribe compounded semaglutide or tirzepatide prepared by a state-licensed 503A compounding pharmacy. Compounded versions are NOT FDA-approved commercial products.
- Compounded preparations may include additional ingredients (such as B12) that are not present in commercial products
- The Practice will discuss with me whether compounded or commercial preparation is appropriate based on my clinical needs, cost considerations (the Practice does not bill insurance), and the regulatory landscape, which may change
- The FDA has, at various times, restricted compounding of these medications. The Practice will inform me if the regulatory status of compounded versions changes during my treatment
### 1.3 — Administration
GLP-1 medications are administered by subcutaneous injection, typically:
- Weekly (semaglutide, tirzepatide)
- Daily (liraglutide)
I will be trained on self-injection technique. I will inject in approved sites (abdomen, thigh, or upper arm), rotating sites as instructed.
---
## SECTION 2 — POTENTIAL BENEFITS
I understand that GLP-1 therapy may, but is not guaranteed to, provide the following benefits:
- Reduction in body weight (clinical trial average reductions: 10-15% for semaglutide, 15-20% for tirzepatide at maximum tolerated doses; individual results vary widely)
- Reduction in appetite and food cravings
- Improved blood sugar control and reduction in hemoglobin A1c (for patients with type 2 diabetes or prediabetes)
- Improvement in cardiovascular risk factors
- Possible reduction in cardiovascular event risk (established for some agents in patients with established cardiovascular disease)
- Improvement in obstructive sleep apnea (established for tirzepatide)
- Improvement in non-alcoholic fatty liver disease markers
- Other potential metabolic benefits
I understand that:
- Individual response varies significantly
- Weight regain is common after discontinuation; many patients regain a substantial portion of weight lost within 1-2 years of stopping
- Continued therapy may be required for sustained results
- The Practice has NOT guaranteed any specific weight loss outcome
---
## SECTION 3 — HOW GLP-1 MEDICATIONS WORK
GLP-1 receptor agonists work by:
- Slowing gastric emptying (food remains in the stomach longer)
- Increasing satiety (feeling of fullness)
- Reducing appetite and food-seeking behavior
- Improving insulin secretion in response to meals
- Reducing glucagon secretion
These mechanisms together produce reduced caloric intake and improved blood sugar control.
---
## SECTION 4 — FDA BLACK BOX WARNINGS (ATTESTATION REQUIRED)
### 4.1 — Thyroid C-Cell Tumor Warning
The FDA has issued a BLACK BOX WARNING for GLP-1 receptor agonists regarding the risk of thyroid C-cell tumors, including medullary thyroid carcinoma (MTC). This warning is based on findings in animal studies in which GLP-1 agonists caused thyroid C-cell tumors in rodents. Whether the same risk applies to humans is not established but cannot be ruled out.
### 4.2 — Absolute Contraindications
I understand that GLP-1 therapy is ABSOLUTELY CONTRAINDICATED — meaning it cannot be safely prescribed — in patients with:
- **Personal history of medullary thyroid carcinoma (MTC)**
- **Family history of medullary thyroid carcinoma (MTC) in any blood relative**
- **Multiple Endocrine Neoplasia syndrome type 2 (MEN 2)**, a hereditary condition that predisposes to MTC and other tumors
- **Family history of Multiple Endocrine Neoplasia syndrome type 2 (MEN 2)**
The Practice will NOT prescribe GLP-1 therapy to patients with any of these conditions.
### 4.3 — Mandatory Patient Attestation
**I attest, under penalty of providing false information that would invalidate this consent, that:**
- ☐ I have NO personal history of medullary thyroid carcinoma (MTC)
- ☐ I have NO family history (in any blood relative — parents, siblings, children, grandparents, aunts, uncles, cousins) of medullary thyroid carcinoma (MTC)
- ☐ I have NOT been diagnosed with Multiple Endocrine Neoplasia syndrome type 2 (MEN 2)
- ☐ I have NO known family history of Multiple Endocrine Neoplasia syndrome type 2 (MEN 2)
- ☐ I will notify the Practice immediately if I learn of any of these conditions in myself or my blood relatives during therapy
I understand that:
- The Practice is relying on the truthfulness of these attestations
- Knowingly providing false attestations may result in serious harm to me, including thyroid cancer
- I cannot hold the Practice liable for outcomes arising from therapy administered based on false attestations I have provided
### 4.4 — Other Conditions Requiring Special Consideration
GLP-1 therapy is also CONTRAINDICATED or requires special consideration in patients with:
- History of pancreatitis
- Severe gastroparesis (delayed stomach emptying) or other significant GI motility disorders
- Severe diabetic retinopathy (rapid blood sugar reduction may worsen retinopathy)
- History of pancreatic cancer
- Type 1 diabetes (these medications are not approved for type 1 diabetes)
- Active eating disorder, including anorexia nervosa or bulimia nervosa
- Pregnancy or planning pregnancy
- Breastfeeding
The Practice will review my medical history and may decline to prescribe if any of these conditions apply.
---
## SECTION 5 — OTHER SERIOUS RISKS (ATTESTATION REQUIRED)
### 5.1 — Pancreatitis
GLP-1 medications have been associated with cases of acute pancreatitis, including life-threatening cases. I understand that:
- Symptoms of pancreatitis include severe persistent abdominal pain (often radiating to the back), nausea, vomiting, and fever
- If I experience these symptoms, I will stop the medication immediately and seek emergency medical care
- I will inform the Practice promptly of any episode of pancreatitis
- A history of pancreatitis may preclude continued use of GLP-1 medications
### 5.2 — Gallbladder Disease
GLP-1 medications increase the risk of gallbladder disease, including gallstones and cholecystitis (gallbladder inflammation requiring surgical removal in some cases). Risk is higher with larger and more rapid weight loss.
### 5.3 — Severe Gastrointestinal Effects
Common GI side effects include nausea, vomiting, diarrhea, constipation, abdominal pain, and decreased appetite. These effects:
- Are usually most pronounced during the first weeks of therapy and after dose increases
- Often improve with continued therapy
- Can in some cases be severe enough to require dose reduction or discontinuation
- Can cause dehydration, electrolyte imbalances, and kidney injury in severe cases
I will report severe or persistent GI symptoms promptly.
### 5.4 — Kidney Effects
Severe vomiting, diarrhea, or dehydration during GLP-1 therapy can lead to acute kidney injury, including in some cases requiring hospitalization. Patients with pre-existing kidney disease are at higher risk. I will report any sign of significant dehydration (lightheadedness, reduced urination, severe thirst) promptly.
### 5.5 — Hypoglycemia (Low Blood Sugar)
GLP-1 therapy alone has a low risk of hypoglycemia, but the risk increases significantly if I am also taking insulin or sulfonylureas (e.g., glipizide, glyburide). If I have diabetes and am on these medications, my diabetes regimen may need adjustment when starting GLP-1 therapy.
### 5.6 — Suicidal Ideation and Mental Health Effects
The FDA is investigating reports of suicidal thoughts and behaviors in patients taking GLP-1 medications. While a causal relationship is not established, I understand:
- I will report any new or worsening depressed mood, anxiety, hopelessness, or thoughts of suicide or self-harm promptly
- I will not stop the medication without consulting the Practice unless I am in crisis, in which case I will call 988 (the Suicide and Crisis Lifeline) or go to the nearest emergency department
- If I have a history of significant depression, anxiety, suicidal ideation, or eating disorder, I will disclose this to the Practice
### 5.7 — Vision Changes (Tirzepatide)
Tirzepatide has been associated with reports of vision changes, including in some cases changes consistent with a condition called non-arteritic anterior ischemic optic neuropathy (NAION). I will report any sudden vision changes promptly.
### 5.8 — Aspiration Risk During Anesthesia
GLP-1 medications slow gastric emptying. If I am scheduled for surgery or any procedure requiring sedation or anesthesia, I will:
- Inform my surgeon and anesthesiologist that I am taking a GLP-1 medication
- Follow their pre-procedure instructions, which may include extended fasting or holding the medication for a period before the procedure
- The Practice will not be involved in coordinating pre-procedure medication management; this is between me and my surgical team
### 5.9 — Section 5 Attestation
**I attest that I have read Section 5 in its entirety. I understand the serious risks of GLP-1 therapy, including pancreatitis, gallbladder disease, severe GI effects, kidney effects, hypoglycemia risk, potential mental health effects, vision changes, and aspiration risk during anesthesia. I commit to reporting these symptoms promptly and to informing other healthcare providers of my GLP-1 therapy.**
☐ I attest to the above. (Required to proceed.)
---
## SECTION 6 — COMMON SIDE EFFECTS
I understand that most patients on GLP-1 therapy experience some side effects, including:
- Nausea (most common, particularly in early weeks)
- Vomiting
- Diarrhea
- Constipation
- Abdominal pain or discomfort
- Bloating, belching, gas
- Decreased appetite (often desired)
- Fatigue
- Headache
- Injection-site reactions (redness, itching, bruising)
- Hair thinning or loss (often related to rapid weight loss)
- Loss of muscle mass alongside fat (mitigated by adequate protein intake and resistance training)
- "Ozempic face" or "Ozempic body" — laxity of facial or body skin due to rapid weight loss
Most side effects improve with time or with dose adjustment. I will report side effects that are severe, persistent, or interfering with daily life.
---
## SECTION 7 — PREGNANCY AND BREASTFEEDING (ATTESTATION REQUIRED)
### 7.1 — Pregnancy
GLP-1 medications should NOT be used during pregnancy. Animal studies have shown adverse fetal effects. Human safety data is limited.
I understand:
- I will use reliable contraception during therapy if pregnancy is possible
- I will notify the Practice immediately if I become pregnant or am attempting to conceive
- Medications should generally be discontinued at least 2 months before attempting conception (longer for tirzepatide and other long-acting agents; the Practice will provide specific guidance)
### 7.2 — Breastfeeding
GLP-1 medications are not recommended during breastfeeding. I will notify the Practice if I am breastfeeding or planning to breastfeed.
### 7.3 — Section 7 Attestation
**I attest that I have read Section 7 in its entirety. I confirm that I am not currently pregnant and not currently breastfeeding. I will use reliable contraception during therapy if pregnancy is possible. I will notify the Practice immediately if I become pregnant, suspect I may be pregnant, or am planning to conceive.**
☐ I attest to the above. (Required to proceed.)
---
## SECTION 8 — ALTERNATIVES TO GLP-1 THERAPY
I understand that alternatives to GLP-1 therapy exist, including:
- **Lifestyle interventions:** dietary changes, exercise, behavioral therapy, structured weight loss programs
- **Other prescription weight-loss medications:** phentermine, bupropion/naltrexone, orlistat, others
- **Bariatric surgery:** for patients meeting clinical criteria; this requires specialty consultation outside the Practice
- **No treatment:** acceptance of current weight without pharmacological intervention
I have considered these alternatives and voluntarily choose GLP-1 therapy at this time.
---
## SECTION 9 — DURATION OF THERAPY AND DISCONTINUATION
I understand that:
- GLP-1 therapy is typically a long-term intervention; benefits diminish or reverse after discontinuation
- Most patients regain a substantial portion of weight lost within 1-2 years of stopping
- The Practice and I will discuss duration of therapy based on my goals, response, and tolerance
- If I choose to discontinue, the clinical team will recommend a tapering approach and support the transition
- Discontinuation may be required if I develop a contraindication, intolerance, or if therapy is no longer appropriate in the Practice's clinical judgment
---
## SECTION 10 — LIFESTYLE REQUIREMENTS (ATTESTATION REQUIRED)
### 10.1 — Nutrition Requirements
To minimize side effects and protect my health during therapy, I will:
- Consume adequate protein (typically 0.7-1.0 grams per pound of goal body weight, or as advised by the clinical team)
- Stay well-hydrated
- Eat smaller, more frequent meals during dose escalations
- Avoid high-fat, fried, or heavily processed foods, which worsen GI side effects
- Limit alcohol, which can worsen side effects and reduce effectiveness
### 10.2 — Exercise and Muscle Preservation
Rapid weight loss carries a risk of muscle loss. I will:
- Engage in regular resistance training (or as advised by the clinical team) to preserve muscle mass
- Maintain physical activity appropriate for my health status
### 10.3 — Lab Monitoring
I will complete baseline and periodic lab monitoring as recommended by the clinical team, which may include:
- Complete blood count and comprehensive metabolic panel
- Hemoglobin A1c
- Lipid panel
- Liver and kidney function
- Other tests as clinically indicated
I understand that completing required monitoring is a CONDITION of continued therapy. The Practice may decline to refill prescriptions if monitoring is not current.
### 10.4 — Section 10 Attestation
**I attest that I have read Section 10 in its entirety. I commit to the nutrition, exercise, and lab monitoring requirements described. I understand that these are conditions of therapy and that the Practice may decline to refill prescriptions if I am not meeting these requirements.**
☐ I attest to the above. (Required to proceed.)
---
## SECTION 11 — DURATION AND RENEWAL OF THIS CONSENT
This consent is effective on the date signed below and remains in effect for twelve (12) months. The Practice will request that I re-sign this consent annually as a condition of continued therapy.
I may withdraw this consent at any time by notifying the Practice in writing or through the patient portal, or by discontinuing therapy.
---
## SECTION 12 — PATIENT SIGNATURE AND ATTESTATION
By signing below, I attest that:
1. I have read this entire consent in its entirety, including all sections
2. I have completed all required per-section attestations in Sections 4 (mandatory MTC/MEN 2 attestation), 5, 7, and 10
3. I have had the opportunity to ask questions and receive answers
4. I am at least 18 years of age and have the legal capacity to consent to my own medical care
5. I am signing voluntarily and without coercion
6. I understand that my electronic signature has the same legal effect as a handwritten signature
7. **The MTC/MEN 2 attestations I provided in Section 4 are truthful and accurate to the best of my knowledge**
**Patient signature (typed full legal name):** _________________________________
**Date and time signed (auto-captured):** _________________________________
**IP address (auto-captured):** _________________________________
**Document version signed:** 2026-05-15-v1
**Document hash (auto-captured):** _________________________________
---
*End of GLP-1 / Weight Management Informed Consent.*
  $eha_cv_glp1$::text AS md
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
  'off_label',
  '2026-05-15-v1',
  'Off-Label Use Acknowledgment',
  b.md,
  encode(digest(b.md, 'sha256'), 'hex'),
  '2026-05-15T00:00:00Z'::timestamptz,
  NULL::timestamptz,
  true,
  'pending_review'
FROM (
  SELECT $eha_cv_ol$
# OFF-LABEL USE ACKNOWLEDGMENT
**Patient Name:** _________________________________
**Date of Birth:** _________________________________
**Date:** _________________________________
**Document version:** 2026-05-15-v1
---
## READ THIS DOCUMENT CAREFULLY. IT EXPLAINS WHAT "OFF-LABEL" USE OF MEDICATIONS MEANS AND THE LEGAL AND CLINICAL FRAMEWORK UNDER WHICH ELEVATED HEALTH AUGUSTA MAY PRESCRIBE FDA-APPROVED MEDICATIONS FOR USES OTHER THAN THEIR FDA-APPROVED INDICATIONS.
---
## SECTION 1 — WHAT "OFF-LABEL" MEANS
### 1.1 — Definition
When the U.S. Food and Drug Administration ("FDA") approves a prescription medication, it approves the medication for a specific:
- **Indication** (the medical condition or symptom the medication is approved to treat)
- **Patient population** (e.g., adults, children of certain ages, patients with specific characteristics)
- **Dose and dosing schedule**
- **Route of administration** (e.g., oral, injection, topical)
- **Duration of therapy**
When a licensed physician prescribes an FDA-approved medication for a use that falls outside the FDA-approved indication, patient population, dose, route, or duration, that use is called **"off-label."**
### 1.2 — Off-Label Use Is Legal and Common
Off-label prescribing by licensed physicians is **legal under federal and state law**. The FDA regulates pharmaceutical manufacturers' ability to *market* medications, not physicians' ability to *prescribe* them.
Off-label use is extremely common across medicine. Studies estimate that approximately 1 in 5 prescriptions in the United States are for off-label uses. Off-label prescribing is particularly common in fields including:
- Wellness and longevity medicine
- Hormone replacement therapy
- Weight management
- Sexual health
- Mental health and psychiatry
- Pediatrics (many medications are not FDA-approved for children even when used in pediatric care)
- Oncology
- Pain management
The Practice's clinical recommendations may include off-label use of FDA-approved medications when, in the clinical team's judgment, off-label use is appropriate for my care.
---
## SECTION 2 — EXAMPLES OF OFF-LABEL USE IN THE PRACTICE
The following are examples of common off-label uses that may apply to my care at the Practice. This list is illustrative and not exhaustive.
**Hormone-related off-label uses:**
- Testosterone therapy in women (not FDA-approved for women in the United States, though widely prescribed by wellness and hormone practices internationally)
- Compounded bioidentical hormone preparations (compounded medications themselves are not "FDA-approved" in the same manner as commercial products; their active ingredients may be FDA-approved)
- Anastrozole for management of estradiol levels in men (FDA-approved for breast cancer in postmenopausal women)
- HCG, enclomiphene, and other agents for fertility preservation or restoration during testosterone therapy
**Weight management off-label uses:**
- Use of GLP-1 receptor agonists for weight management in patients who do not meet FDA-approved BMI thresholds for the approved weight management indication
- Compounded semaglutide or tirzepatide (compounded preparations are not FDA-approved commercial products)
- Use of certain medications approved for diabetes for weight management in patients without diabetes
**Other off-label uses:**
- PT-141 (Bremelanotide) for sexual health indications other than the FDA-approved indication of hypoactive sexual desire disorder in premenopausal women
- Various medications used for "longevity" or "anti-aging" indications, which are not FDA-recognized medical conditions
- Compounded preparations combining multiple active ingredients that are not available as a commercial combination product
---
## SECTION 3 — WHAT OFF-LABEL USE MEANS FOR ME
### 3.1 — What Off-Label Use Does NOT Mean
Off-label use does **NOT** mean:
- The medication is unsafe
- The medication is being used illegally
- The Practice is acting outside the standard of care
- The medication has not been studied
- The medication has not been used clinically by other physicians
### 3.2 — What Off-Label Use DOES Mean
Off-label use **DOES** mean:
- The FDA has not specifically reviewed and approved the use I am receiving
- The clinical evidence supporting the off-label use may be less robust than the evidence supporting the FDA-approved use
- The dosing for my off-label use may be based on clinical experience, expert opinion, or smaller studies rather than large FDA-required trials
- Insurance companies are less likely to cover off-label uses (though this is generally not relevant to my care at the Practice, since the Practice does not bill insurance)
- The risk-benefit balance for my specific off-label use should be discussed with the clinical team
### 3.3 — My Responsibility to Discuss
I have the right and responsibility to:
- Ask the clinical team about any medication being prescribed off-label
- Ask about the evidence supporting the off-label use in my specific situation
- Ask about alternatives, including FDA-approved alternatives
- Decline any off-label use I am not comfortable with
The Practice's clinical team will discuss off-label use with me when it is recommended and will answer my questions.
---
## SECTION 4 — RELATIONSHIP TO OTHER CONSENTS
This Off-Label Use Acknowledgment is a general consent that complements, but does not replace, the specific service consents I have signed or may sign with the Practice. Specifically:
- The **Hormone Replacement Therapy Consent** describes specific risks of hormone therapies, many of which involve off-label use
- The **GLP-1 / Weight Management Consent** describes specific risks of GLP-1 therapy, including off-label uses
- The **Research Peptide Consent** covers substances that are NOT FDA-approved at all (and is therefore not "off-label" in the technical sense — it is non-FDA-approved use, which is a separate category covered by that consent)
Where service-specific consents and this Off-Label Acknowledgment overlap, all applicable consents apply together.
---
## SECTION 5 — ACKNOWLEDGMENT AND ATTESTATION
I acknowledge that:
1. I have read this Off-Label Use Acknowledgment in its entirety
2. I understand what "off-label" use of medications means
3. I understand that off-label prescribing by licensed physicians is legal and common
4. I understand that the Practice may prescribe FDA-approved medications for off-label uses when, in the clinical team's judgment, off-label use is appropriate for my care
5. I have had the opportunity to ask questions about off-label prescribing
6. I understand that I may ask additional questions about any specific off-label use at any time during my care
7. I understand that I may decline any off-label use I am not comfortable with
---
## SECTION 6 — PATIENT SIGNATURE
By signing below, I attest that I have read this Off-Label Use Acknowledgment in its entirety and that I understand and accept its terms.
**Patient signature (typed full legal name):** _________________________________
**Date and time signed (auto-captured):** _________________________________
**IP address (auto-captured):** _________________________________
**Document version signed:** 2026-05-15-v1
**Document hash (auto-captured):** _________________________________
---
*End of Off-Label Use Acknowledgment.*
  $eha_cv_ol$::text AS md
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
  'notice_of_privacy_practices',
  '2026-05-15-v1',
  'Notice of Privacy Practices',
  b.md,
  encode(digest(b.md, 'sha256'), 'hex'),
  '2026-05-15T00:00:00Z'::timestamptz,
  NULL::timestamptz,
  true,
  'pending_review'
FROM (
  SELECT $eha_cv_npp$
# NOTICE OF PRIVACY PRACTICES
**Effective Date:** 2026-05-15
**Practice:** Elevated Health Augusta (operated by The Wilkers Group LLC)
**Location:** 7013 Evans Town Center Blvd, Suite 203, Evans, GA 30809
**Phone:** (706) 760-3470
---
## THIS NOTICE DESCRIBES HOW MEDICAL INFORMATION ABOUT YOU MAY BE USED AND DISCLOSED AND HOW YOU CAN GET ACCESS TO THIS INFORMATION. PLEASE REVIEW IT CAREFULLY.
---
## SECTION 1 — INTRODUCTION
Elevated Health Augusta ("we," "our," "the Practice") is required by federal law (the Health Insurance Portability and Accountability Act, or "HIPAA") to:
1. Maintain the privacy of your protected health information ("PHI").
2. Provide you with this Notice describing our legal duties and privacy practices with respect to your PHI.
3. Follow the terms of the Notice currently in effect.
4. Notify you in the event of certain breaches of your unsecured PHI.
This Notice applies to all PHI that we collect, create, receive, maintain, or transmit in connection with providing health care services to you. PHI includes any information that identifies you and relates to your past, present, or future physical or mental health, the care provided to you, or the payment for that care.
---
## SECTION 2 — HOW WE USE AND DISCLOSE YOUR PROTECTED HEALTH INFORMATION
We are permitted by law to use and disclose your PHI for certain purposes without obtaining your specific written authorization. These purposes are described below.
### 2.1 — Treatment
We use and disclose your PHI to provide, coordinate, and manage your health care. This includes:
- Reviewing your medical history during your Wellness Assessment
- Coordinating care with other clinicians involved in your treatment
- Ordering laboratory tests and reviewing results
- Sending prescriptions to pharmacies (including compounding pharmacies such as Custom Pharmacy of Evans and Formulation Compounding Center)
- Sharing relevant information with consulting physicians, including Dr. Dennis A. Williams, MD (our secondary supervising physician)
- Sharing relevant information with our nursing and clinical staff who are involved in your care
- Communicating with you and following up on your treatment plan
**Example:** If our clinical team determines that you would benefit from compounded testosterone replacement therapy, we will send your prescription, including relevant clinical information, to our partner compounding pharmacy.
### 2.2 — Payment
We use and disclose your PHI to obtain payment for the health care services we provide to you. Because we are a cash-pay practice and do not bill insurance, our payment-related uses are limited. They include:
- Processing your payment for services through our payment processor (Stripe)
- Issuing receipts and superbills upon your request
- Verifying that payment for membership programs has been received
- Communicating with you about outstanding balances, failed payments, or refunds
- Communicating with collection agencies in the event of unpaid balances (rare; we attempt to resolve directly with patients first)
**Example:** When you pay for your $79 Wellness Assessment, our payment processor receives the minimum PHI necessary to process the transaction. We do not share your full medical record with the payment processor.
### 2.3 — Health Care Operations
We use and disclose your PHI to support the operations of the Practice. This includes:
- Quality assessment and improvement activities
- Reviewing the competence of our clinical staff and conducting training programs
- Evaluating and improving the quality of care we provide
- Conducting medical reviews and audits
- Business planning and administrative activities
- Customer service and addressing patient complaints
- Maintaining the Practice's records, including electronic health records and patient management systems
**Example:** Our medical director may review patient records to assess clinical quality and identify opportunities to improve our protocols. Identifying information is limited to the minimum necessary for the review.
### 2.4 — Disclosures Required or Permitted by Law Without Your Authorization
We may use or disclose your PHI without your authorization in the following situations:
**Public Health Activities:** We may disclose PHI to public health authorities for purposes such as:
- Preventing or controlling disease, injury, or disability
- Reporting child abuse or neglect
- Reporting adverse events or product defects to the U.S. Food and Drug Administration
- Notifying persons who may have been exposed to a communicable disease
**Health Oversight Activities:** We may disclose PHI to a health oversight agency for activities authorized by law, such as audits, investigations, inspections, and licensure actions.
**Judicial and Administrative Proceedings:** We may disclose PHI in response to a court order, subpoena, discovery request, or other lawful process, subject to applicable legal requirements.
**Law Enforcement:** We may disclose PHI to law enforcement officials for purposes such as:
- Identifying or locating a suspect, fugitive, material witness, or missing person
- Reporting a crime committed on our premises
- Reporting a death we believe may have resulted from criminal conduct
- Responding to a court order, warrant, or other lawful process
**To Avert a Serious Threat to Health or Safety:** We may use and disclose PHI when necessary to prevent a serious and imminent threat to your health and safety or the health and safety of another person or the public.
**Workers' Compensation:** We may disclose PHI as authorized by and to the extent necessary to comply with workers' compensation laws.
**Coroners, Medical Examiners, and Funeral Directors:** We may disclose PHI to coroners, medical examiners, and funeral directors as necessary for them to perform their duties.
**Military and Veterans:** If you are a member of the armed forces, we may disclose PHI as required by military command authorities.
**Required by Law:** We will use and disclose PHI when required to do so by federal, state, or local law.
**Research:** We may use and disclose PHI for research purposes when the research has been approved by an Institutional Review Board (IRB) or privacy board that has waived the requirement for individual authorization, or when the disclosure is otherwise permitted under HIPAA. The Practice does not currently participate in research that involves disclosure of identifiable PHI without authorization.
### 2.5 — Business Associates
We share your PHI with certain business associates who perform services on our behalf. Our business associates are required by written agreement to protect your PHI consistent with HIPAA and to use it only for the purposes for which we engaged them. Our current categories of business associates include:
- **Electronic Health Records (EHR) and Practice Management Platforms** — for storage and management of your medical records and appointments
- **Customer Relationship Management Platforms** — for communications, marketing, and patient engagement (currently GoHighLevel)
- **Payment Processors** — for processing patient payments (Stripe)
- **Compounding Pharmacy Partners** — Custom Pharmacy of Evans (bio-identical hormone creams) and Formulation Compounding Center (injectable compounded preparations), and any future 503A compounding pharmacy partners
- **Laboratory Service Providers** — LabCorp and other reference laboratories for diagnostic testing
- **Telehealth Platform Providers** — for HIPAA-compliant video and audio consultation services
- **Cloud Hosting and Infrastructure Providers** — Supabase, Lovable, and related infrastructure providers for application hosting
- **Email and SMS Service Providers** — for sending appointment reminders, billing notifications, and other patient communications
- **Artificial Intelligence Service Providers** — for AI-assisted operations such as automated chat assistance, lead capture, and administrative workflows. AI providers receive minimal PHI necessary for the specific service. We do not provide full medical records to AI systems for clinical decision-making.
- **Legal, Accounting, and Compliance Advisors** — as needed for legal compliance and business operations
- **Billing and Accounts Receivable Services** — if engaged to support payment collection
A current list of our business associates and the specific services they provide is available upon request by contacting us at (706) 760-3470.
### 2.6 — Communications With Family Members, Friends, or Other Designees
With your verbal or written agreement, or in situations where we can reasonably infer that you would not object, we may disclose relevant portions of your PHI to a family member, friend, or other person you have identified as involved in your care or in payment for your care. Examples include:
- Discussing your treatment plan with your spouse when they are present with your verbal consent
- Communicating with an emergency contact you have designated
- Discussing payment arrangements with a family member who is helping with your finances, with your verbal authorization
You may at any time:
- Tell us which individuals are authorized to receive information about your care
- Tell us which individuals are NOT authorized to receive information about your care
- Restrict or revoke previous authorizations
### 2.7 — Appointment Reminders and Health-Related Communications
We may use and disclose your PHI to:
- Send appointment reminders by phone call, email, or text message
- Communicate with you about treatment options, alternative care, or related services
- Communicate with you about general health and wellness topics related to our practice
- Promote services or products we provide, except where required to obtain your specific authorization (see Marketing below)
### 2.8 — Marketing and Use of Your Information for Promotional Purposes
We will obtain your written authorization before using or disclosing your PHI for marketing purposes that fall outside the scope of routine health-related communications, including before using your PHI in:
- Marketing testimonials or case studies that identify you
- Photographs or videos used for promotional purposes that identify you
- Any communication promoting a third party's product or service in exchange for payment to us
Routine appointment reminders, refill notices, and care-related communications do NOT require separate marketing authorization.
### 2.9 — Sale of Your Health Information
We do NOT sell your PHI to any third party. We do not derive direct or indirect compensation from any third party in exchange for your PHI.
### 2.10 — Psychotherapy Notes
Our practice does not currently provide psychotherapy as a standalone service. If we were to maintain psychotherapy notes, those notes would be subject to additional protections beyond the protections that apply to other PHI, and we would obtain your specific written authorization before using or disclosing those notes except in narrow circumstances permitted by HIPAA.
### 2.11 — Substance Use Disorder Records
If we were to provide federally funded substance use disorder treatment subject to 42 CFR Part 2, those records would be subject to additional protections beyond HIPAA. The Practice does not currently provide such services.
### 2.12 — All Other Uses and Disclosures
Any use or disclosure of your PHI that is not described in this Notice will be made only with your written authorization. You may revoke that authorization in writing at any time, except to the extent we have already taken action in reliance on your authorization.
---
## SECTION 3 — YOUR RIGHTS REGARDING YOUR PROTECTED HEALTH INFORMATION
You have the following rights regarding the PHI we maintain about you.
### 3.1 — Right to Inspect and Copy
You have the right to inspect and obtain a copy of your PHI, including your medical record and billing records, except in limited circumstances permitted by law.
To request access, submit a written request to the Practice at the address or phone number above. We will respond to your request within 30 days, or 60 days if necessary. We may charge a reasonable cost-based fee for the cost of copying, mailing, or providing electronic copies.
You may request access to your records in electronic format. We will provide an electronic copy if the records are maintained electronically and the format you request is readily producible.
### 3.2 — Right to Request Amendment
If you believe the PHI we maintain about you is inaccurate or incomplete, you have the right to request that we amend the information. To request an amendment, submit a written request to the Practice that explains the reason for the requested amendment. We may deny your request if:
- We did not create the information (in which case you should contact the entity that created it)
- The information is not part of the medical record we maintain
- The information is not part of the records you would have the right to inspect and copy
- The information is accurate and complete
If we deny your request, you have the right to submit a written statement of disagreement, which we will include with any future disclosures of the disputed information.
### 3.3 — Right to an Accounting of Disclosures
You have the right to request an accounting of certain disclosures of your PHI made by us in the six years prior to your request. This accounting will not include:
- Disclosures made for treatment, payment, or health care operations
- Disclosures made to you or to your personal representative
- Disclosures made pursuant to your written authorization
- Certain other disclosures specified by HIPAA
To request an accounting, submit a written request to the Practice. We will respond within 60 days, or 90 days if necessary. The first accounting in any 12-month period is free; additional accountings may incur a reasonable cost-based fee.
### 3.4 — Right to Request Restrictions
You have the right to request restrictions on our use or disclosure of your PHI for treatment, payment, or health care operations, or to family members or others involved in your care. We are NOT required to agree to your request unless:
- The disclosure is to a health plan for payment or health care operations purposes, and
- The PHI pertains to a health care item or service for which you (or someone on your behalf) have paid the Practice in full out-of-pocket
Because we are a cash-pay practice, you may request that we not disclose information about specific services to any health plan you submit a superbill to, and we will accommodate such requests.
To request restrictions, submit a written request to the Practice. We will respond within 30 days.
### 3.5 — Right to Confidential Communications
You have the right to request that we communicate with you about your PHI in a specific way or at a specific location. For example, you may request that we contact you only at home, only by mail, only by phone, or only at a specific phone number.
We will accommodate reasonable requests. To request confidential communications, submit a written or verbal request to the Practice. We may require that you specify how payment will be handled if your request involves any additional cost to us.
### 3.6 — Right to a Paper Copy of This Notice
You have the right to obtain a paper copy of this Notice at any time, even if you have agreed to receive it electronically. To obtain a paper copy, ask any staff member or call the Practice at the phone number above.
### 3.7 — Right to Be Notified of a Breach
You have the right to be notified if there is a breach of your unsecured PHI. We will provide the notification required by HIPAA breach notification rules without unreasonable delay and in no case later than 60 calendar days following discovery of the breach.
### 3.8 — Right to Choose Someone to Act for You
If you have given someone medical power of attorney or if someone is your legal guardian, that person can exercise your rights and make choices about your PHI. We will verify that the person has the authority and can act for you before we take any action.
### 3.9 — Right to File a Complaint
If you believe your privacy rights have been violated, you may file a complaint with:
**The Practice:**
Privacy Officer
Elevated Health Augusta
7013 Evans Town Center Blvd, Suite 203
Evans, GA 30809
Phone: (706) 760-3470
**The U.S. Department of Health and Human Services Office for Civil Rights:**
200 Independence Avenue, SW
Washington, D.C. 20201
Phone: 1-877-696-6775
Online: https://www.hhs.gov/hipaa/filing-a-complaint/
**Georgia Composite Medical Board** (for complaints related to physician conduct):
Online: https://medicalboard.georgia.gov/
We will not retaliate against you for filing a complaint. You will not be denied care, charged additional fees, or otherwise penalized for exercising any of the rights described in this Notice.
---
## SECTION 4 — OUR DUTIES
We are required by law to:
1. Maintain the privacy and security of your PHI
2. Provide you with this Notice of our legal duties and privacy practices with respect to your PHI
3. Notify you if we are unable to agree to a requested restriction
4. Accommodate reasonable requests you may have to communicate PHI by alternative means or at alternative locations
5. Obtain your written authorization before using or disclosing your PHI for purposes not described in this Notice
6. Follow the terms of the Notice currently in effect
---
## SECTION 5 — DATA SECURITY
We take reasonable steps to protect your PHI from unauthorized access, use, or disclosure. Our security measures include:
- Encrypted storage of electronic PHI
- Encrypted transmission of PHI between our systems and our business associates
- Multi-factor authentication for staff access to PHI
- Role-based access controls limiting staff access to only the PHI needed for their job
- Regular security training for our staff
- Audit logs tracking who has accessed your records and when
- Written business associate agreements with all vendors that handle PHI on our behalf
- Compliance with HIPAA Security Rule requirements
No security system is perfect. While we take reasonable steps to protect your information, we cannot guarantee that PHI will never be subject to unauthorized access, particularly in connection with security incidents affecting third parties or our business associates. In the event of a breach of unsecured PHI, we will notify you in accordance with HIPAA breach notification rules.
---
## SECTION 6 — STATE LAW
Where state law (Georgia, in our case) provides greater privacy protections than HIPAA, we will follow the more protective state law standard. Georgia law provides additional protections in certain areas including:
- Mental health records
- Genetic testing information
- HIV/AIDS-related information
- Substance use disorder records
- Minors' health records (where applicable; our practice does not currently treat minors)
---
## SECTION 7 — CHANGES TO THIS NOTICE
We reserve the right to change this Notice at any time. Changes will apply to PHI we already have about you as well as any information we receive in the future. The new Notice will be available upon request, in our office, and on our website at elevatedhealthaugusta.com.
The effective date of this Notice is shown at the top of the first page. If we make material changes, we will post the revised Notice promptly and offer copies to you at your next visit. You may request a paper or electronic copy of the most current Notice at any time.
---
## SECTION 8 — CONTACT INFORMATION
If you have questions about this Notice, want to request a copy, or want to exercise any of the rights described in this Notice, please contact us:
**Privacy Officer**
Elevated Health Augusta
7013 Evans Town Center Blvd, Suite 203
Evans, GA 30809
Phone: (706) 760-3470
Website: elevatedhealthaugusta.com
---
## ACKNOWLEDGMENT OF RECEIPT
Patients sign the separate HIPAA Notice of Privacy Practices Acknowledgment document to confirm receipt of this Notice. That acknowledgment is maintained in the patient's record. The signed acknowledgment is NOT consent to specific uses or disclosures of PHI — it is solely confirmation that this Notice has been provided to the patient.
---
*End of Notice of Privacy Practices.*
  $eha_cv_npp$::text AS md
) b
ON CONFLICT (consent_type, version_label) DO NOTHING;
