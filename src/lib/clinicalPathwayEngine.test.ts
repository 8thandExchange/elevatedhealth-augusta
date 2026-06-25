import { describe, expect, it } from "vitest";
import {
  recommendPathway,
  recommendPathwayFromSymptoms,
  EXCLUDED_COMPOUNDS,
} from "./clinicalPathwayEngine";
import { DOSING_PROTOCOLS } from "./dosingProtocols";
import { CORE_SERVICES } from "./stripeConfig";

describe("clinicalPathwayEngine", () => {
  it("routes weight loss to GLP-1 program with expanded labs", () => {
    const p = recommendPathway("weight_loss");
    expect(p.programKey).toBe("glp1");
    expect(p.labChargeCents).toBe(CORE_SERVICES.expandedPanel.amount);
    expect(p.dosing[0]?.compoundKey).toBe("semaglutide");
  });

  it("routes advanced recomposition through the GLP-1 lane with gated retatrutide", () => {
    const p = recommendPathway("metabolic_recomposition");
    expect(p.programKey).toBe("glp1");
    expect(p.compoundKeys).toContain("retatrutide");
    expect(p.consents).toContain("Research Peptide Consent");
  });

  it("routes symptoms to TRT", () => {
    const p = recommendPathwayFromSymptoms(["low testosterone", "fatigue"]);
    expect(p.goal).toBe("low_testosterone");
  });

  it("routes IV symptoms to iv_only", () => {
    const p = recommendPathwayFromSymptoms(["IV hydration"]);
    expect(p.goal).toBe("iv_only");
  });

  it("every dosing protocol has titration steps", () => {
    for (const d of Object.values(DOSING_PROTOCOLS)) {
      expect(d.titration.length).toBeGreaterThan(0);
      expect(d.gcSku.length).toBeGreaterThan(0);
    }
  });

  it("excludes high-risk compounds", () => {
    const keys = EXCLUDED_COMPOUNDS.map((e) => e.key);
    expect(keys).toContain("mazdutide");
    expect(keys).toContain("melanotan2");
  });
});
