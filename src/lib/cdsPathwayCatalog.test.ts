import { describe, expect, it } from "vitest";
import { formatRecommendedLabPanel, goalLabel } from "./cdsPathwayCatalog";

describe("cdsPathwayCatalog", () => {
  it("formats TRT default panel charge", () => {
    const lab = formatRecommendedLabPanel("hormone-male");
    expect(lab.displayPrice).toBe("$199");
    expect(lab.cents).toBe(19900);
  });

  it("formats GLP-1 default panel as expanded tier", () => {
    const lab = formatRecommendedLabPanel("weight-optimization");
    expect(lab.displayPrice).toBe("$299");
  });

  it("returns IV-only messaging when no panel slug", () => {
    const lab = formatRecommendedLabPanel(null);
    expect(lab.label).toMatch(/IV screening/i);
  });

  it("resolves goal labels from clinical pathway engine", () => {
    expect(goalLabel("weight_loss")).toMatch(/Weight loss/i);
  });
});
