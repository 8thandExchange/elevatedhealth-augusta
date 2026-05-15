import type { ConsentDocument } from "./types";

/** Legal text v2026-05-14-v1 — keep in sync with `supabase/migrations/20260515194500_seed_consent_versions.sql`. */
export const communicationConsent: ConsentDocument = {
  type: "communication",
  version_label: "2026-05-14-v1",
  title: "Communication Consent",
  tier: 1,
  body_markdown: `
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
`.trim(),
  sections: [{ id: "all", title: "Communication Consent", requires_attestation: true }],
  expiration_months: 12,
  signing_method: "typed_name",
  effective_from: "2026-05-14T00:00:00Z",
};
