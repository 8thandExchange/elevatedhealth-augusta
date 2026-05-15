import type { ConsentDocument } from "./types";

/** Legal text v2026-05-15-v1 — keep in sync with `supabase/migrations/20260515194500_seed_consent_versions.sql`. */
export const offLabelConsent: ConsentDocument = {
  type: "off_label",
  version_label: "2026-05-15-v1",
  title: "Off-Label Use Acknowledgment",
  tier: 2,
  body_markdown: `
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
`.trim(),
  sections: [{ id: "all", title: "Off-Label Use Acknowledgment", requires_attestation: true }],
  expiration_months: 12,
  signing_method: "typed_name",
  effective_from: "2026-05-15T00:00:00Z",
};
