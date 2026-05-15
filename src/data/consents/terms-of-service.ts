import type { ConsentDocument } from "./types";

/** Legal text v2026-05-14-v1 — keep in sync with `supabase/migrations/20260515194500_seed_consent_versions.sql`. */
export const termsOfServiceConsent: ConsentDocument = {
  type: "terms_of_service",
  version_label: "2026-05-14-v1",
  title: "Practice Terms of Service & Financial Responsibility",
  tier: 1,
  body_markdown: `
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
`.trim(),
  sections: [{ id: "all", title: "Terms of Service", requires_attestation: true }],
  expiration_months: 12,
  signing_method: "typed_name",
  effective_from: "2026-05-14T00:00:00Z",
};
