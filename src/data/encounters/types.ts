export type EncounterType =
  | "wellness_assessment"
  | "trt_followup"
  | "bhrt_followup"
  | "glp1_followup"
  | "peptide_consultation"
  | "iv_administration"
  | "im_administration"
  | "lab_review"
  | "phone_consultation"
  | "other";

export const ENCOUNTER_TYPE_LABELS: Record<EncounterType, string> = {
  wellness_assessment: "Wellness Assessment",
  trt_followup: "TRT Follow-up",
  bhrt_followup: "BHRT Follow-up",
  glp1_followup: "GLP-1 Follow-up",
  peptide_consultation: "Peptide Consultation",
  iv_administration: "IV Administration",
  im_administration: "IM Administration",
  lab_review: "Lab Review",
  phone_consultation: "Phone Consultation",
  other: "Other",
};

export type EncounterStatus = "draft" | "signed" | "amended";

export interface PatientEncounter {
  id: string;
  patient_id: string;
  encounter_date: string;
  encounter_type: string;
  chief_complaint: string | null;
  subjective: string | null;
  objective: string | null;
  assessment: string | null;
  plan: string | null;
  medications_prescribed: string | null;
  follow_up_plan: string | null;
  status: EncounterStatus;
  created_by_user_id: string;
  created_at: string;
  last_edited_by_user_id: string | null;
  last_edited_at: string | null;
  signed_by_user_id: string | null;
  signed_at: string | null;
  signed_ip_address: string | null;
  amends_encounter_id: string | null;
  internal_notes: string | null;
}

export interface EncounterVitals {
  id: string;
  encounter_id: string;
  systolic_bp: number | null;
  diastolic_bp: number | null;
  heart_rate: number | null;
  respiratory_rate: number | null;
  temperature_f: number | null;
  weight_lbs: number | null;
  height_inches: number | null;
  spo2_pct: number | null;
  bmi: number | null;
  recorded_at: string;
  recorded_by_user_id: string;
}

export type EncounterAttachmentType = "lab_result" | "imaging" | "external_record" | "photo" | "other";

export interface EncounterAttachment {
  id: string;
  encounter_id: string | null;
  patient_id: string;
  attachment_type: EncounterAttachmentType;
  file_name: string;
  storage_path: string;
  file_size_bytes: number | null;
  mime_type: string | null;
  uploaded_by_user_id: string;
  uploaded_at: string;
  description: string | null;
  lab_collection_date: string | null;
}

export type EncounterAuditAction =
  | "viewed"
  | "created"
  | "edited"
  | "signed"
  | "amended"
  | "attachment_added"
  | "attachment_removed";

export interface EncounterAuditLogEntry {
  id: string;
  encounter_id: string;
  user_id: string;
  action: EncounterAuditAction;
  action_details: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  occurred_at: string;
}

export type AllergySeverity = "mild" | "moderate" | "severe" | "unknown";

export interface PatientAllergy {
  id: string;
  patient_id: string;
  allergen: string;
  reaction: string | null;
  severity: AllergySeverity | null;
  noted_date: string | null;
  active: boolean;
  noted_by_user_id: string;
  noted_at: string;
}

export interface PatientCurrentMedication {
  id: string;
  patient_id: string;
  medication_name: string;
  dose: string | null;
  frequency: string | null;
  route: string | null;
  prescribed_by: string | null;
  is_eha_prescribed: boolean;
  start_date: string | null;
  end_date: string | null;
  active: boolean;
  notes: string | null;
  added_by_user_id: string;
  added_at: string;
}

export type ProblemListStatus = "active" | "resolved" | "inactive";

export interface PatientProblem {
  id: string;
  patient_id: string;
  problem: string;
  icd10_code: string | null;
  status: ProblemListStatus;
  onset_date: string | null;
  resolved_date: string | null;
  noted_by_user_id: string;
  noted_at: string;
}
