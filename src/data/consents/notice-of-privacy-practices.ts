import type { ConsentDocument } from "./types";

/** Legal text v2026-05-15-v1 — keep in sync with `supabase/migrations/20260515194500_seed_consent_versions.sql`. */
export const noticeOfPrivacyPracticesDoc: ConsentDocument = {
  type: "notice_of_privacy_practices",
  version_label: "2026-05-15-v1",
  title: "Notice of Privacy Practices",
  tier: 1,
  body_markdown: `
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
Privacy Officer: Troy Akers, DO
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
**Privacy Officer:** Troy Akers, DO
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
`.trim(),
  sections: [{ id: "all", title: "Notice of Privacy Practices", requires_attestation: false }],
  expiration_months: 36,
  signing_method: "typed_name",
  effective_from: "2026-05-15T00:00:00Z",
};
