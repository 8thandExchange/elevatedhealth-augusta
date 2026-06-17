import { describe, expect, it } from "vitest";
import { ALL_PATIENT_GOALS, GOAL_LABELS } from "./clinicalPathwayEngine";
import { GOAL_TO_LAB_PANEL_SLUG } from "./labPanelRecommendations";

describe("PatientGoal catalog", () => {
  it("every PatientGoal has a label and lab-panel mapping entry", () => {
    for (const goal of ALL_PATIENT_GOALS) {
      expect(GOAL_LABELS[goal], `missing label for ${goal}`).toBeTruthy();
      expect(goal in GOAL_TO_LAB_PANEL_SLUG, `missing lab mapping for ${goal}`).toBe(true);
    }
  });

  it("maps new goals to expected default lab panel slugs", () => {
    expect(GOAL_TO_LAB_PANEL_SLUG.prediabetes_insulin_resistance).toBe("weight-optimization");
    expect(GOAL_TO_LAB_PANEL_SLUG.male_sexual_function).toBe("sexual-wellness");
    expect(GOAL_TO_LAB_PANEL_SLUG.female_sexual_function).toBe("hormone-female");
    expect(GOAL_TO_LAB_PANEL_SLUG.thyroid_optimization).toBe("foundation-wellness");
    expect(GOAL_TO_LAB_PANEL_SLUG.anemia_iron).toBe("foundation-wellness");
    expect(GOAL_TO_LAB_PANEL_SLUG.aesthetics).toBeNull();
  });
});
