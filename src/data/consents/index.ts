import type { ConsentType } from "./types";
import { termsOfServiceConsent } from "./terms-of-service";
import { hipaaAcknowledgmentConsent } from "./hipaa-acknowledgment";
import { generalMedicalTreatmentConsent } from "./general-medical-treatment";
import { telehealthConsent } from "./telehealth";
import { communicationConsent } from "./communication";
import { hormoneTherapyConsent } from "./hormone-therapy";
import { glp1Consent } from "./glp1";
import { offLabelConsent } from "./off-label";
import { researchPeptideConsent } from "./research-peptide";
import { noticeOfPrivacyPracticesDoc } from "./notice-of-privacy-practices";

export * from "./types";
export { termsOfServiceConsent } from "./terms-of-service";
export { hipaaAcknowledgmentConsent } from "./hipaa-acknowledgment";
export { generalMedicalTreatmentConsent } from "./general-medical-treatment";
export { telehealthConsent } from "./telehealth";
export { communicationConsent } from "./communication";
export { hormoneTherapyConsent } from "./hormone-therapy";
export { glp1Consent } from "./glp1";
export { offLabelConsent } from "./off-label";
export { researchPeptideConsent } from "./research-peptide";
export { noticeOfPrivacyPracticesDoc } from "./notice-of-privacy-practices";

export const ALL_CONSENTS = {
  terms_of_service: termsOfServiceConsent,
  hipaa_acknowledgment: hipaaAcknowledgmentConsent,
  general_medical_treatment: generalMedicalTreatmentConsent,
  telehealth: telehealthConsent,
  communication: communicationConsent,
  hormone_therapy: hormoneTherapyConsent,
  glp1: glp1Consent,
  off_label: offLabelConsent,
  research_peptide: researchPeptideConsent,
  notice_of_privacy_practices: noticeOfPrivacyPracticesDoc,
} as const;

export const TIER_1_CONSENTS: ConsentType[] = [
  "terms_of_service",
  "hipaa_acknowledgment",
  "general_medical_treatment",
  "telehealth",
  "communication",
];

/** Provider + patient Tier 1 gate. NPP receipt is covered by `hipaa_acknowledgment`, not a separate signature. */
export const TIER_1_REQUIRED_CONSENTS: ConsentType[] = [...TIER_1_CONSENTS];

export const TIER_2_CONSENTS: ConsentType[] = [
  "hormone_therapy",
  "glp1",
  "off_label",
  "research_peptide",
];
