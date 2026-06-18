/**
 * Holgate workflow: intake symptoms + LabCorp results → Custom Pharmacy hormone cream Rx.
 * Non-hormone therapies (GLP-1, peptides, IV) are routed elsewhere — never through this module.
 */

import type { MedicationRecommendation } from "@/lib/medicationMapping";
import {
  analyzeLabcorpResults,
  labResultRowToValues,
  type LabcorpLabValues,
} from "@/lib/labcorpInterpretation";
import { generateLabcorpHormoneCreamRecommendations } from "@/lib/labcorpMedicationRecommendations";
import {
  findFormularyItem,
  resolveFormularyId,
  type PharmacyFormularyItem,
} from "@/lib/pharmacyOrderFormulary";
import {
  CUSTOM_PHARMACY_PREPARATIONS_BY_ID,
  type CustomPharmacyPreparation,
} from "@/lib/customPharmacyFormulary";

export interface SymptomContext {
  estrogen_score?: number | null;
  progesterone_score?: number | null;
  androgen_score?: number | null;
  cortisol_score?: number | null;
  raw_answers?: Record<string, unknown> | null;
  date_logged?: string | null;
}

export interface CreamPrescriptionRecommendation {
  formularyId: string;
  formularyItem: PharmacyFormularyItem;
  preparation: CustomPharmacyPreparation;
  strength: string;
  sig: string;
  quantity: string;
  rationale: string;
  priority: number;
  /** Human-readable symptom + lab context for staff review */
  clinicalSummary?: string;
}

/** Symptom scores at or above this threshold are clinically meaningful on intake. */
const SYMPTOM_SCORE_THRESHOLD = 12;

/** Map formulary cream line → Custom Pharmacy strength option when labs don't specify. */
const DEFAULT_PREP_STRENGTH: Record<string, string> = {
  male_testosterone_cream: "100mg/g",
  male_testosterone_cream_escalation: "150mg/g",
  hrt_bi_est: "2.5mg/g",
  hrt_progesterone_cream: "50mg/g",
  female_testosterone_cream: "1mg/g",
};

function pickStrength(formularyId: string, preparation: CustomPharmacyPreparation): string {
  const preferred = DEFAULT_PREP_STRENGTH[formularyId];
  if (preferred && preparation.strength_options.includes(preferred)) return preferred;
  if (preparation.strength_options.includes(preparation.default_strength)) {
    return preparation.default_strength;
  }
  return preparation.strength_options[0] ?? preparation.default_strength;
}

function toCreamRec(med: MedicationRecommendation): CreamPrescriptionRecommendation | null {
  const formularyId = resolveFormularyId(med.formularyId);
  const item = findFormularyItem(formularyId);
  if (!item) return null;
  const preparation = CUSTOM_PHARMACY_PREPARATIONS_BY_ID[item.customPreparationId];
  if (!preparation || preparation.preparation_type !== "cream") return null;

  return {
    formularyId: item.id,
    formularyItem: item,
    preparation,
    strength: pickStrength(item.id, preparation),
    sig: item.sig,
    quantity: preparation.default_quantity,
    rationale: med.rationale,
    priority: med.priority,
  };
}

function genderDefaultCream(
  gender: string | null | undefined,
  symptoms?: SymptomContext | null,
): CreamPrescriptionRecommendation | null {
  const male = gender?.toLowerCase() === "male";
  const item = findFormularyItem(male ? "male_testosterone_cream" : "hrt_bi_est");
  if (!item) return null;
  const preparation = CUSTOM_PHARMACY_PREPARATIONS_BY_ID[item.customPreparationId];
  if (!preparation) return null;
  const symptomNote = buildSymptomSummary(symptoms, gender);
  return {
    formularyId: item.id,
    formularyItem: item,
    preparation,
    strength: pickStrength(item.id, preparation),
    sig: item.sig,
    quantity: preparation.default_quantity,
    rationale: male
      ? "Lab panel reviewed — standard men's transdermal testosterone cream per signed TRT protocol."
      : "Lab panel reviewed — Bi-Est transdermal cream as lead BHRT product for symptomatic women.",
    priority: 1,
    clinicalSummary: symptomNote || undefined,
  };
}

export function parseSymptomContext(row: Record<string, unknown> | null | undefined): SymptomContext | null {
  if (!row) return null;
  return {
    estrogen_score: typeof row.estrogen_score === "number" ? row.estrogen_score : null,
    progesterone_score: typeof row.progesterone_score === "number" ? row.progesterone_score : null,
    androgen_score: typeof row.androgen_score === "number" ? row.androgen_score : null,
    cortisol_score: typeof row.cortisol_score === "number" ? row.cortisol_score : null,
    raw_answers: (row.raw_answers as Record<string, unknown>) ?? null,
    date_logged: typeof row.date_logged === "string" ? row.date_logged : null,
  };
}

export function buildSymptomSummary(
  symptoms: SymptomContext | null | undefined,
  gender?: string | null,
): string {
  if (!symptoms) return "";
  const male = gender?.toLowerCase() === "male";
  const lines: string[] = [];

  if (male && (symptoms.androgen_score ?? 0) >= SYMPTOM_SCORE_THRESHOLD) {
    lines.push("androgen-related symptoms on intake");
  }
  if (!male) {
    if ((symptoms.estrogen_score ?? 0) >= SYMPTOM_SCORE_THRESHOLD) {
      lines.push("estrogen-related symptoms on intake");
    }
    if ((symptoms.progesterone_score ?? 0) >= SYMPTOM_SCORE_THRESHOLD) {
      lines.push("progesterone/sleep-related symptoms on intake");
    }
  }
  if ((symptoms.cortisol_score ?? 0) >= SYMPTOM_SCORE_THRESHOLD) {
    lines.push("stress/cortisol-related symptoms on intake");
  }

  const rawSymptoms = symptoms.raw_answers?.symptoms;
  if (rawSymptoms && typeof rawSymptoms === "object") {
    const answered = Object.entries(rawSymptoms as Record<string, unknown>)
      .filter(([, v]) => v === true || v === "yes" || v === "often" || v === "severe")
      .map(([k]) => k.replace(/_/g, " "))
      .slice(0, 4);
    if (answered.length > 0) {
      lines.push(`reported: ${answered.join(", ")}`);
    }
  }

  if (lines.length === 0) return "";
  return `Symptoms: ${lines.join("; ")}.`;
}

function enrichWithSymptoms(
  creams: CreamPrescriptionRecommendation[],
  symptoms: SymptomContext | null | undefined,
  gender: string,
  values: LabcorpLabValues,
): CreamPrescriptionRecommendation[] {
  const summary = buildSymptomSummary(symptoms, gender);
  const male = gender.toLowerCase() === "male";

  const enriched = creams.map((c) => ({
    ...c,
    rationale: summary ? `${c.rationale}${summary.startsWith("Symptoms") ? ` ${summary}` : ""}` : c.rationale,
    clinicalSummary: summary || c.clinicalSummary,
  }));

  // Symptom-driven add-on: progesterone cream when sleep/prog symptoms + low prog on panel
  if (
    !male &&
    (symptoms?.progesterone_score ?? 0) >= SYMPTOM_SCORE_THRESHOLD &&
    values.progesterone_pg != null &&
    values.progesterone_pg < 200 &&
    !enriched.some((c) => c.formularyId === "hrt_progesterone_cream")
  ) {
    const progItem = findFormularyItem("hrt_progesterone_cream");
    const prep = progItem
      ? CUSTOM_PHARMACY_PREPARATIONS_BY_ID[progItem.customPreparationId]
      : null;
    if (progItem && prep) {
      enriched.push({
        formularyId: progItem.id,
        formularyItem: progItem,
        preparation: prep,
        strength: pickStrength(progItem.id, prep),
        sig: progItem.sig,
        quantity: prep.default_quantity,
        rationale: `Progesterone ${values.progesterone_pg} pg/mL with progesterone-related symptoms — transdermal progesterone per BHRT protocol.${summary ? ` ${summary}` : ""}`,
        priority: 2,
        clinicalSummary: summary || undefined,
      });
    }
  }

  enriched.sort((a, b) => a.priority - b.priority);
  return enriched;
}

export function recommendCreamPrescriptions(input: {
  gender?: string | null;
  labRow?: Record<string, unknown> | null;
  symptoms?: SymptomContext | null;
}): CreamPrescriptionRecommendation[] {
  const gender = input.gender ?? "female";

  // Holgate workflow: pharmacy order requires returned labs
  if (!input.labRow) return [];

  const values = labResultRowToValues(input.labRow);
  const interpretation = analyzeLabcorpResults(values, gender);
  const medRecs = generateLabcorpHormoneCreamRecommendations(interpretation, values, gender);
  const creams = medRecs
    .map(toCreamRec)
    .filter((r): r is CreamPrescriptionRecommendation => r !== null);

  if (creams.length > 0) {
    return enrichWithSymptoms(creams, input.symptoms, gender, values);
  }

  const fallback = genderDefaultCream(gender, input.symptoms);
  if (!fallback) return [];
  return enrichWithSymptoms([fallback], input.symptoms, gender, values);
}

export function primaryCreamPrescription(input: {
  gender?: string | null;
  labRow?: Record<string, unknown> | null;
  symptoms?: SymptomContext | null;
}): CreamPrescriptionRecommendation | null {
  return recommendCreamPrescriptions(input)[0] ?? null;
}

/** Build modal-ready selection from algorithm output or formulary line. */
export function buildCustomPharmacySelection(input: {
  formularyId: string;
  strength?: string;
  sig?: string;
  refills?: number;
}) {
  const item = findFormularyItem(resolveFormularyId(input.formularyId));
  if (!item) return null;
  const preparation = CUSTOM_PHARMACY_PREPARATIONS_BY_ID[item.customPreparationId];
  if (!preparation) return null;
  return {
    preparation,
    strength: input.strength ?? pickStrength(item.id, preparation),
    sig: input.sig ?? item.sig,
    quantity: preparation.default_quantity,
    refills: input.refills ?? 2,
  };
}
