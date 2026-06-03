import { supabase } from "@/integrations/supabase/client";
import { findingsSummaryForAlert } from "@/lib/labcorpMedicationRecommendations";
import {
  analyzeLabcorpResults,
  labResultRowToValues,
  parseInterpretationSnapshot,
  type LabInterpretationSnapshot,
  type LabcorpLabValues,
} from "@/lib/labcorpInterpretation";

export type PersistLabcorpInterpretationStatus = "persisted" | "skipped" | "failed";

export type PersistLabcorpInterpretationResult = {
  status: PersistLabcorpInterpretationStatus;
  reason?: string;
  error?: string;
  snapshot?: LabInterpretationSnapshot;
};

/** Stable hash of numeric lab inputs used by the interpretation engine. */
export function fingerprintLabValues(values: LabcorpLabValues): string {
  return JSON.stringify(values);
}

export function hasInterpretableLabcorpValues(values: LabcorpLabValues): boolean {
  return Object.values(values).some(
    (v) => v != null && typeof v === "number" && !Number.isNaN(v),
  );
}

/** Legacy Holgate / saliva engine stores protocols on treatment_plan without engine=labcorp. */
export function isHolgateTreatmentPlan(treatmentPlan: unknown): boolean {
  if (!treatmentPlan || typeof treatmentPlan !== "object") return false;
  const o = treatmentPlan as Record<string, unknown>;
  if (o.engine === "labcorp") return false;
  return Array.isArray(o.protocols) || (Array.isArray(o.findings) && o.engine == null);
}

export function canOverwriteTreatmentPlanWithLabcorp(treatmentPlan: unknown): boolean {
  if (treatmentPlan == null) return true;
  if (parseInterpretationSnapshot(treatmentPlan)) return true;
  return !isHolgateTreatmentPlan(treatmentPlan);
}

export function valuesChangedSinceSnapshot(
  values: LabcorpLabValues,
  snapshot: LabInterpretationSnapshot,
): boolean {
  const fp = snapshot.values_fingerprint;
  if (!fp) return true;
  return fingerprintLabValues(values) !== fp;
}

export function buildLabcorpInterpretationUpdate(
  row: Record<string, unknown>,
  patientGender: string,
  primaryProgram?: string | null,
  options?: {
    existingTreatmentPlan?: unknown;
    existingCorrelationAlert?: string | null;
  },
): {
  clinical_story: string;
  treatment_plan?: LabInterpretationSnapshot;
  correlation_alert: string | null;
} | null {
  const values = labResultRowToValues(row);
  if (!hasInterpretableLabcorpValues(values)) return null;

  const interpretation = analyzeLabcorpResults(values, patientGender, primaryProgram);
  const snapshot: LabInterpretationSnapshot = {
    version: 1,
    engine: "labcorp",
    interpreted_at: new Date().toISOString(),
    interpretation,
    values_fingerprint: fingerprintLabValues(values),
  };

  const interpretationAlert = findingsSummaryForAlert(interpretation.findings);
  const correlation_alert = mergeCorrelationAlerts(
    options?.existingCorrelationAlert ?? null,
    interpretationAlert,
  );

  const update: {
    clinical_story: string;
    treatment_plan?: LabInterpretationSnapshot;
    correlation_alert: string | null;
  } = {
    clinical_story: interpretation.story,
    correlation_alert,
  };

  if (canOverwriteTreatmentPlanWithLabcorp(options?.existingTreatmentPlan)) {
    update.treatment_plan = snapshot;
  }

  return update;
}

function mergeCorrelationAlerts(
  safetyOrExisting: string | null,
  interpretationAlert: string | null,
): string | null {
  const parts: string[] = [];
  if (safetyOrExisting) {
    for (const piece of safetyOrExisting.split("·").map((s) => s.trim())) {
      if (piece && !parts.includes(piece)) parts.push(piece);
    }
  }
  if (interpretationAlert) {
    for (const piece of interpretationAlert.split("·").map((s) => s.trim())) {
      if (piece && !parts.includes(piece)) parts.push(piece);
    }
  }
  return parts.length > 0 ? parts.join(" · ") : null;
}

/**
 * Runs LabCorp interpretation and writes clinical_story / treatment_plan / correlation_alert.
 * Skips legacy ZRT rows and Holgate-shaped treatment_plan (preserves Holgate JSON).
 */
export async function persistLabcorpInterpretation(options: {
  labResultId: string;
  row: Record<string, unknown>;
  patientGender: string;
  primaryProgram?: string | null;
  existingTreatmentPlan?: unknown;
  existingCorrelationAlert?: string | null;
}): Promise<PersistLabcorpInterpretationResult> {
  const labSource = options.row.lab_source;
  if (labSource === "zrt") {
    return { status: "skipped", reason: "legacy_zrt" };
  }

  const built = buildLabcorpInterpretationUpdate(
    options.row,
    options.patientGender,
    options.primaryProgram,
    {
      existingTreatmentPlan: options.existingTreatmentPlan,
      existingCorrelationAlert: options.existingCorrelationAlert,
    },
  );

  if (!built) {
    return { status: "skipped", reason: "no_interpretable_values" };
  }

  const payload: Record<string, unknown> = {
    clinical_story: built.clinical_story,
    correlation_alert: built.correlation_alert,
  };
  if (built.treatment_plan) {
    payload.treatment_plan = JSON.parse(JSON.stringify(built.treatment_plan));
  }

  try {
    const { error } = await supabase
      .from("lab_results")
      .update(payload)
      .eq("id", options.labResultId);

    if (error) {
      return { status: "failed", error: error.message };
    }

    return {
      status: "persisted",
      snapshot:
        built.treatment_plan ??
        parseInterpretationSnapshot(options.existingTreatmentPlan) ??
        undefined,
    };
  } catch (e: unknown) {
    return {
      status: "failed",
      error: e instanceof Error ? e.message : "Unknown error",
    };
  }
}

/** Call after lab_results insert/update (manual entry or PDF parse). Failures are non-blocking. */
export async function autoPersistLabcorpInterpretationAfterSave(options: {
  labResultId: string;
  row: Record<string, unknown>;
  patientGender: string;
  primaryProgram?: string | null;
  existingTreatmentPlan?: unknown;
  existingCorrelationAlert?: string | null;
}): Promise<PersistLabcorpInterpretationResult> {
  return persistLabcorpInterpretation(options);
}
