import { describe, expect, it } from "vitest";
import {
  consultGatedServicesCopy,
  filterConsultVisitReasons,
  filterVisibleVisitReasons,
  isVisitReasonVisible,
} from "./serviceConfig";

describe("serviceConfig visit reason visibility", () => {
  const reasons = [
    { id: "peptide", label: "Peptide therapy" },
    { id: "sexual_wellness", label: "Sexual wellness" },
    { id: "hair_restoration", label: "Hair restoration" },
  ];

  it("hides launch-gated sexual wellness and hair restoration", () => {
    expect(isVisitReasonVisible("sexual_wellness")).toBe(false);
    expect(isVisitReasonVisible("hair_restoration")).toBe(false);
    expect(isVisitReasonVisible("peptide")).toBe(true);
  });

  it("filters booking reason lists", () => {
    const visible = filterVisibleVisitReasons(reasons);
    expect(visible.map((r) => r.id)).toEqual(["peptide"]);
  });

  it("excludes IV from Wellness Assessment modal reasons", () => {
    const consultReasons = filterConsultVisitReasons([
      { id: "peptide", label: "Peptide therapy" },
      { id: "iv", label: "IV therapy / wellness drips" },
      { id: "weight_loss", label: "Weight loss" },
    ]);
    expect(consultReasons.map((r) => r.id)).toEqual(["peptide", "weight_loss"]);
  });

  it("builds consult marketing copy without hidden services", () => {
    expect(consultGatedServicesCopy()).toBe("hormone therapy, peptides, weight loss");
    expect(consultGatedServicesCopy()).not.toContain("sexual wellness");
  });
});
