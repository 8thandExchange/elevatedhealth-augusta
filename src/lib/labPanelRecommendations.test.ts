import { describe, expect, it } from "vitest";
import {
  GOAL_TO_LAB_PANEL_SLUG,
  LAB_PANEL_SLUGS,
  recommendLabPanelSlug,
  recommendLabPanelSlugFromSymptoms,
} from "./labPanelRecommendations";

describe("labPanelRecommendations", () => {
  it("maps TRT goal to male hormone panel", () => {
    expect(GOAL_TO_LAB_PANEL_SLUG.low_testosterone).toBe(LAB_PANEL_SLUGS.maleHormone);
    expect(recommendLabPanelSlug("low_testosterone")).toBe("hormone-male");
  });

  it("maps GLP-1 and metabolic goals to expanded panel", () => {
    expect(recommendLabPanelSlug("weight_loss")).toBe("weight-optimization");
    expect(recommendLabPanelSlug("metabolic_recomposition")).toBe("weight-optimization");
  });

  it("routes IV-only to no default panel", () => {
    expect(recommendLabPanelSlug("iv_only")).toBeNull();
  });

  it("symptom routing prefers expanded for weight language", () => {
    expect(recommendLabPanelSlugFromSymptoms(["weight gain"])).toBe("weight-optimization");
  });
});
