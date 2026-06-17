export type IntakeQuestionType = "yes_no" | "single" | "multi" | "scale";

export interface IntakeQuestionOption {
  value: string;
  label: string;
}

export interface IntakeQuestionTags {
  symptomKeys?: string[];
  contraindicationTags?: string[];
  labTriggers?: string[];
  hardStop?: boolean;
}

export interface IntakeQuestion {
  id: string;
  text: string;
  type: IntakeQuestionType;
  options?: IntakeQuestionOption[];
  patientFacing: true;
  tags: IntakeQuestionTags;
  routesToPathways: string[];
}

export type IntakeAnswers = Record<string, string | string[] | number | boolean>;
