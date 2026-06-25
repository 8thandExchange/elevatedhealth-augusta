/** Service lines for legacy structured SOAP notes (soap_notes / soap_templates). */
export const SOAP_SERVICE_LINES = [
  { value: "hormone", label: "Hormone Optimization (HRT/TRT)" },
  { value: "weight_loss", label: "Medical Weight Loss (GLP-1)" },
  { value: "peptide", label: "Peptide Therapy" },
  { value: "iv_therapy", label: "IV Therapy" },
  { value: "metabolic", label: "Advanced Recomposition (GLP-1)" },
  { value: "general", label: "General Wellness / Longevity" },
] as const;

export type SoapServiceLine = (typeof SOAP_SERVICE_LINES)[number]["value"];

const LABEL_BY_VALUE = Object.fromEntries(
  SOAP_SERVICE_LINES.map((l) => [l.value, l.label]),
) as Record<string, string>;

export function soapServiceLineLabel(value: string): string {
  return LABEL_BY_VALUE[value] ?? value.replace(/_/g, " ");
}

/** Default empty SOAP skeleton when no template exists for a service line. */
export function defaultSoapTemplateFields(): {
  subjective: Record<string, string>;
  objective: Record<string, string>;
  assessment: Record<string, string>;
  plan: Record<string, string>;
} {
  return {
    subjective: {
      chief_complaint: "",
      hpi: "",
      current_medications: "",
      review_of_systems: "",
    },
    objective: {
      physical_exam: "",
      lab_review: "",
      blood_pressure: "",
    },
    assessment: {
      primary_diagnosis: "",
      clinical_impression: "",
    },
    plan: {
      treatment_protocol: "",
      follow_up: "",
      monitoring_plan: "",
    },
  };
}
