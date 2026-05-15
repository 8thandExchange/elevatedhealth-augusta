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
