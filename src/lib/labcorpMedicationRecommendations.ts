import type { MedicationRecommendation } from "@/lib/medicationMapping";
import type { LabFinding, LabcorpInterpretation, LabcorpLabValues } from "@/lib/labcorpInterpretation";

/**
 * Map LabCorp interpretation patterns → PharmacyOrderCard formulary IDs
 * and consent-relevant medication hints for the Rx portal.
 */
export function generateLabcorpMedicationRecommendations(
  interpretation: LabcorpInterpretation,
  values: LabcorpLabValues,
  gender: string,
): MedicationRecommendation[] {
  const patterns = new Set(interpretation.findings.map((f) => f.pattern));
  const recs: MedicationRecommendation[] = [];
  const male = gender.toLowerCase() === "male";

  if (male && patterns.has("Low Testosterone (TRT candidate)")) {
    const t = values.testosterone_t;
    if (t != null && t < 350) {
      recs.push({
        formularyId: "male_test_200",
        name: "Testosterone Cream - Male 200mg",
        strength: "200mg/g (Liposomal Base)",
        rationale: `Total testosterone ${t} ng/dL — initiation-range dosing per clinic TRT protocol`,
        priority: 1,
      });
    } else if (t != null && t < 500) {
      recs.push({
        formularyId: "male_test_150",
        name: "Testosterone Cream - Male 150mg",
        strength: "150mg/g (Liposomal Base)",
        rationale: `Total testosterone ${t} ng/dL — moderate transdermal dose`,
        priority: 1,
      });
    } else if (t != null && t < 700) {
      recs.push({
        formularyId: "male_test_100",
        name: "Testosterone Cream - Male 100mg",
        strength: "100mg/g (Liposomal Base)",
        rationale: `Total testosterone ${t} ng/dL — maintenance-range dosing`,
        priority: 2,
      });
    }
  }

  if (!male && patterns.has("Low Estradiol (BHRT candidate)")) {
    recs.push({
      formularyId: "biest",
      name: "Bi-Est Cream (Menopause)",
      strength: "80/20 E3/E2 2.5mg/g (Topiclick)",
      rationale: "Low estradiol pattern on LabCorp panel — BHRT candidacy per signed protocol",
      priority: 1,
    });
  }

  if (!male && patterns.has("Low Progesterone")) {
    recs.push({
      formularyId: "progesterone_sleep",
      name: "Progesterone Cream (Sleep Stack)",
      strength: "40mg/click (Topiclick)",
      rationale: "Low progesterone — sleep/anxiety stack consideration",
      priority: 2,
    });
  }

  if (!male && patterns.has("Low Testosterone (female)")) {
    recs.push({
      formularyId: "female_testosterone",
      name: "Testosterone Cream - Female (Vitality)",
      strength: "10mg/g (Topiclick)",
      rationale: "Low female testosterone — micro-dose vitality protocol",
      priority: 2,
    });
  }

  if (
    patterns.has("Glycemic risk (GLP-1 consideration)") ||
    patterns.has("Insulin resistance pattern")
  ) {
    recs.push({
      formularyId: "compounded_semaglutide",
      name: "Compounded Semaglutide (monthly program)",
      strength: "Titrate per weight-loss protocol",
      rationale:
        "Metabolic pattern supports GLP-1 discussion — order via Rx portal / FCC after glp1 consent (not in cream formulary dropdown)",
      priority: 1,
    });
    if (values.a1c != null && values.a1c >= 7) {
      recs.push({
        formularyId: "compounded_tirzepatide",
        name: "Compounded Tirzepatide (monthly program)",
        strength: "Titrate per weight-loss protocol",
        rationale:
          "HbA1c ≥7% — discuss tirzepatide pathway after glp1 consent; order via Rx portal / FCC (not in cream dropdown)",
        priority: 2,
      });
    }
  }

  recs.sort((a, b) => a.priority - b.priority);
  return dedupeByFormularyId(recs);
}

function dedupeByFormularyId(recs: MedicationRecommendation[]): MedicationRecommendation[] {
  const seen = new Set<string>();
  return recs.filter((r) => {
    if (seen.has(r.formularyId)) return false;
    seen.add(r.formularyId);
    return true;
  });
}

export function findingsSummaryForAlert(findings: LabFinding[]): string | null {
  const high = findings.filter((f) => f.priority === "high").map((f) => f.pattern);
  if (high.length === 0) return null;
  return high.slice(0, 3).join(" · ");
}
