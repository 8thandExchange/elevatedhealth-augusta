/**
 * Maps LabCorp interpretation suggestion keys → seeded clinical_protocols.slug values.
 * See supabase/migrations/20260509140000_seed_clinical_protocol_drafts.sql
 */
export const INTERPRETATION_KEY_TO_PROTOCOL_SLUGS: Record<string, string[]> = {
  male_trt_initiation: ["male-trt-initiation-transdermal-cream"],
  trt_e2_management: ["quarterly-hormone-monitoring-male"],
  female_biest: ["bhrt-female-initiation-transdermal"],
  female_progesterone: ["bhrt-female-initiation-transdermal"],
  female_testosterone_vitality: ["bhrt-female-initiation-transdermal"],
  glp1_weight_optimization: [
    "compounded-semaglutide-initiation",
    "compounded-tirzepatide-initiation",
  ],
  thyroid_evaluation: ["thyroid-hypothyroid-management"],
};

export function protocolSlugsForInterpretationKey(key: string): string[] {
  return INTERPRETATION_KEY_TO_PROTOCOL_SLUGS[key] ?? [];
}
