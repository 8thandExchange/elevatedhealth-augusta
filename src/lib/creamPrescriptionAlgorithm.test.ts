import { describe, expect, it } from "vitest";
import {
  primaryCreamPrescription,
  recommendCreamPrescriptions,
  buildSymptomSummary,
  parseSymptomContext,
} from "./creamPrescriptionAlgorithm";

describe("creamPrescriptionAlgorithm", () => {
  it("returns nothing when labs are not on file", () => {
    expect(primaryCreamPrescription({ gender: "male" })).toBeNull();
    expect(recommendCreamPrescriptions({ gender: "female" })).toEqual([]);
  });

  it("recommends men's testosterone cream when labs support TRT", () => {
    const rec = primaryCreamPrescription({
      gender: "male",
      labRow: { testosterone_t: 420 },
    });
    expect(rec?.formularyId).toMatch(/male_testosterone_cream/);
    expect(rec?.preparation.preparation_type).toBe("cream");
  });

  it("recommends higher-strength male cream for very low testosterone", () => {
    const recs = recommendCreamPrescriptions({
      gender: "male",
      labRow: { testosterone_t: 280 },
    });
    expect(recs[0]?.formularyId).toBe("male_testosterone_cream_escalation");
  });

  it("recommends Bi-Est for low estradiol pattern in women", () => {
    const recs = recommendCreamPrescriptions({
      gender: "female",
      labRow: { estradiol_e2: 18, progesterone_pg: 120 },
    });
    expect(recs.some((r) => r.formularyId === "hrt_bi_est")).toBe(true);
  });

  it("includes symptom context in rationale when scores are elevated", () => {
    const rec = primaryCreamPrescription({
      gender: "female",
      labRow: { estradiol_e2: 18 },
      symptoms: parseSymptomContext({ estrogen_score: 20, date_logged: "2026-01-01" }),
    });
    expect(rec?.rationale).toContain("Symptoms");
  });

  it("summarizes intake symptom scores", () => {
    const summary = buildSymptomSummary(
      parseSymptomContext({ androgen_score: 18 }),
      "male",
    );
    expect(summary).toContain("androgen");
  });
});
