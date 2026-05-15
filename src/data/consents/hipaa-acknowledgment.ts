import type { ConsentDocument } from "./types";

/** Legal text v2026-05-14-v1 — keep in sync with `supabase/migrations/20260515194500_seed_consent_versions.sql`. */
export const hipaaAcknowledgmentConsent: ConsentDocument = {
  type: "hipaa_acknowledgment",
  version_label: "2026-05-14-v1",
  title: "HIPAA Notice of Privacy Practices Acknowledgment",
  tier: 1,
  body_markdown: `
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
`.trim(),
  sections: [{ id: "all", title: "HIPAA Acknowledgment", requires_attestation: true }],
  expiration_months: 12,
  signing_method: "typed_name",
  effective_from: "2026-05-14T00:00:00Z",
};
