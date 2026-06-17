/**
 * Supply readiness checklists per treatment modality (internal ops).
 */
import type { ClinicalOptimizationItem } from "./clinicalOptimizationCatalog";

export type SupplyCategory =
  | "injectable_peptide_glp1"
  | "recovery_peptide"
  | "hormone_injectable"
  | "hormone_cream"
  | "iv_infusion"
  | "lab_draw"
  | "oral_capsule";

export interface SupplyChecklistItem {
  key: string;
  label: string;
  required: boolean;
}

export interface SupplyReadinessProfile {
  category: SupplyCategory;
  medicationOrProduct: string;
  checklist: SupplyChecklistItem[];
  refrigerationRequired: boolean;
  lotTrackingRequired: boolean;
  reorderThreshold: string | null;
  parLevel: string | null;
  preferredSupplier: string | null;
  backupSupplier: string | null;
}

const INJECTABLE_BASE: SupplyChecklistItem[] = [
  { key: "medication_vial", label: "Medication vial or kit", required: true },
  { key: "insulin_syringes", label: "Insulin syringes (correct gauge)", required: true },
  { key: "alcohol_pads", label: "Alcohol pads", required: true },
  { key: "gauze_bandages", label: "Gauze / bandages", required: true },
  { key: "sharps_container", label: "Sharps container + patient disposal instructions", required: true },
  { key: "gloves", label: "Gloves", required: true },
  { key: "patient_instruction", label: "Patient instruction sheet", required: true },
  { key: "cold_chain", label: "Refrigerated storage (if applicable)", required: false },
  { key: "take_home_bag", label: "Patient take-home bag", required: true },
  { key: "labels", label: "Rx labels", required: true },
];

const IV_BASE: SupplyChecklistItem[] = [
  { key: "iv_fluid", label: "Normal saline / LR bag per protocol", required: true },
  { key: "iv_start_kit", label: "IV start kit", required: true },
  { key: "catheter", label: "IV catheter (appropriate gauge)", required: true },
  { key: "extension_tubing", label: "Extension set / tubing", required: true },
  { key: "saline_flush", label: "Saline flushes", required: true },
  { key: "dressing", label: "Tegaderm / dressing", required: true },
  { key: "tourniquet", label: "Tourniquet", required: true },
  { key: "prep", label: "Chlorhexidine / alcohol prep", required: true },
  { key: "gloves", label: "Gloves", required: true },
  { key: "sharps", label: "Sharps container", required: true },
  { key: "emergency", label: "Emergency supplies per standing order", required: true },
];

const LAB_DRAW: SupplyChecklistItem[] = [
  { key: "labcorp_requisition", label: "LabCorp order set / requisition", required: true },
  { key: "draw_tubes", label: "Draw tubes by panel", required: true },
  { key: "butterfly", label: "Butterfly needles", required: true },
  { key: "vacutainer", label: "Vacutainers / holder", required: true },
  { key: "tourniquet", label: "Tourniquet", required: true },
  { key: "prep", label: "Alcohol / chlorhexidine", required: true },
  { key: "gauze", label: "Gauze / bandages", required: true },
  { key: "specimen_bag", label: "Specimen bags + labels", required: true },
  { key: "courier", label: "Courier pickup workflow confirmed", required: true },
];

const RECOVERY_PEPTIDE_CHECKLIST: SupplyChecklistItem[] = [
  { key: "medication_vial", label: "Medication / product vial or kit", required: true },
  { key: "insulin_syringes", label: "Insulin syringes", required: true },
  { key: "alcohol_pads", label: "Alcohol pads", required: true },
  { key: "gloves", label: "Gloves", required: true },
  { key: "gauze_bandages", label: "Gauze / bandages", required: true },
  { key: "sharps_container", label: "Sharps container", required: true },
  { key: "labels", label: "Rx labels", required: true },
  { key: "cold_storage", label: "Cold storage (if required)", required: false },
  { key: "fridge_temp_log", label: "Fridge temperature log (if required)", required: false },
  { key: "lot_tracking", label: "Lot tracking", required: true },
  { key: "expiration_tracking", label: "Expiration tracking", required: true },
  { key: "injection_teaching", label: "Patient injection teaching sheet", required: true },
  { key: "take_home_bag", label: "Take-home bag", required: true },
  { key: "consent_form", label: "Research Peptide Consent on file", required: true },
  { key: "adverse_reaction", label: "Adverse reaction instructions", required: true },
];

export const SUPPLY_PROFILES: Record<SupplyCategory, Omit<SupplyReadinessProfile, "medicationOrProduct">> = {
  injectable_peptide_glp1: {
    category: "injectable_peptide_glp1",
    checklist: INJECTABLE_BASE,
    refrigerationRequired: true,
    lotTrackingRequired: true,
    reorderThreshold: "2 weeks remaining supply",
    parLevel: "4-week on-hand minimum",
    preferredSupplier: "FCC / GC",
    backupSupplier: "Empower Pharmacy",
  },
  recovery_peptide: {
    category: "recovery_peptide",
    checklist: RECOVERY_PEPTIDE_CHECKLIST,
    refrigerationRequired: true,
    lotTrackingRequired: true,
    reorderThreshold: "2 weeks remaining supply",
    parLevel: "4-week on-hand minimum",
    preferredSupplier: "FCC / GC",
    backupSupplier: "Empower Pharmacy",
  },
  hormone_injectable: {
    category: "hormone_injectable",
    checklist: INJECTABLE_BASE,
    refrigerationRequired: false,
    lotTrackingRequired: false,
    reorderThreshold: "1 vial remaining",
    parLevel: "2 vials TRT",
    preferredSupplier: "Custom Pharmacy of Evans",
    backupSupplier: "FCC",
  },
  hormone_cream: {
    category: "hormone_cream",
    checklist: [
      { key: "cream_tube", label: "Compounded cream/troche", required: true },
      { key: "applicator", label: "Applicator / dosing card", required: true },
      { key: "patient_education", label: "Application instructions", required: true },
      { key: "labels", label: "Rx labels", required: true },
    ],
    refrigerationRequired: false,
    lotTrackingRequired: false,
    reorderThreshold: "7 days remaining",
    parLevel: "30-day supply",
    preferredSupplier: "Custom Pharmacy of Evans",
    backupSupplier: null,
  },
  iv_infusion: {
    category: "iv_infusion",
    checklist: IV_BASE,
    refrigerationRequired: false,
    lotTrackingRequired: true,
    reorderThreshold: "Per FEFO par levels",
    parLevel: "Per inventory dashboard",
    preferredSupplier: "Henry Schein / FCC additives",
    backupSupplier: null,
  },
  lab_draw: {
    category: "lab_draw",
    checklist: LAB_DRAW,
    refrigerationRequired: false,
    lotTrackingRequired: false,
    reorderThreshold: "Tube stock < 1 week",
    parLevel: "2 weeks draw supplies",
    preferredSupplier: "LabCorp",
    backupSupplier: null,
  },
  oral_capsule: {
    category: "oral_capsule",
    checklist: [
      { key: "capsules", label: "Compounded capsules", required: true },
      { key: "bottle", label: "Labeled bottle", required: true },
      { key: "patient_education", label: "Dosing instructions", required: true },
    ],
    refrigerationRequired: false,
    lotTrackingRequired: false,
    reorderThreshold: "14-day supply",
    parLevel: "30-day",
    preferredSupplier: "FCC",
    backupSupplier: null,
  },
};

export function supplyCategoryForItem(item: ClinicalOptimizationItem): SupplyCategory {
  if (item.supply_checklist_key === "recovery_peptide") return "recovery_peptide";
  if (item.category === "lab_optimization") return "lab_draw";
  if (item.category === "iv_hydration") return "iv_infusion";
  if (item.category === "hormone_male") return "hormone_injectable";
  if (item.category === "hormone_female") return "hormone_cream";
  if (item.dosage_form === "capsule") return "oral_capsule";
  return "injectable_peptide_glp1";
}

export function recoveryPeptideSupplyProfile(productName: string): SupplyReadinessProfile {
  const base = SUPPLY_PROFILES.recovery_peptide;
  return { ...base, medicationOrProduct: productName };
}

export function supplyProfileForItem(item: ClinicalOptimizationItem): SupplyReadinessProfile {
  const cat = supplyCategoryForItem(item);
  const base = SUPPLY_PROFILES[cat];
  return {
    ...base,
    medicationOrProduct: item.display_name,
  };
}
