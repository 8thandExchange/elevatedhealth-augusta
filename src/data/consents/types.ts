export type ConsentType =
  | "terms_of_service"
  | "hipaa_acknowledgment"
  | "general_medical_treatment"
  | "telehealth"
  | "communication"
  | "hormone_therapy"
  | "glp1"
  | "off_label"
  | "research_peptide"
  | "notice_of_privacy_practices";

export type ConsentTier = 1 | 2 | 3;

export interface ConsentSection {
  id: string;
  title: string;
  requires_attestation: boolean;
}

export interface ConsentDocument {
  type: ConsentType;
  version_label: string;
  title: string;
  tier: ConsentTier;
  body_markdown: string;
  sections: ConsentSection[];
  expiration_months: number;
  signing_method: "typed_name" | "typed_name_with_section_attestation" | "one_tap_acknowledgment";
  effective_from: string;
}
