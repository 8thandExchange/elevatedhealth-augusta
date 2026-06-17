import { describe, expect, it } from "vitest";
import {
  CDS_PATHWAY_SLUGS,
  INTAKE_QUESTION_BANK,
  SEEDED_CONTRAINDICATION_TAGS,
  SEEDED_SYMPTOM_KEYS,
} from "@/data/intake/questionBank";
import { mapIntakeToAssessment } from "@/lib/intakeToAssessment";

describe("intake question bank", () => {
  it("every routesToPathways value matches a known CDS pathway slug", () => {
    const slugSet = new Set<string>(CDS_PATHWAY_SLUGS);
    for (const q of INTAKE_QUESTION_BANK) {
      for (const slug of q.routesToPathways) {
        expect(slugSet.has(slug), `${q.id} → unknown slug ${slug}`).toBe(true);
      }
    }
  });

  it("every symptomKeys value matches a seeded symptom_key", () => {
    const keys = new Set<string>(SEEDED_SYMPTOM_KEYS);
    for (const q of INTAKE_QUESTION_BANK) {
      for (const key of q.tags.symptomKeys ?? []) {
        expect(keys.has(key), `${q.id} → unknown symptom ${key}`).toBe(true);
      }
    }
  });

  it("every contraindicationTags value matches a seeded candidate tag", () => {
    const tags = new Set<string>(SEEDED_CONTRAINDICATION_TAGS);
    for (const q of INTAKE_QUESTION_BANK) {
      for (const tag of q.tags.contraindicationTags ?? []) {
        expect(tags.has(tag), `${q.id} → unknown contra tag ${tag}`).toBe(true);
      }
    }
  });
});

describe("mapIntakeToAssessment", () => {
  it("pre-fills symptoms and flags nitrates hard stop for ED interest", () => {
    const draft = mapIntakeToAssessment({
      male_ed_onset: true,
      safety_nitrates: true,
    });
    expect(draft.symptomsSelected).toContain("erectile_dysfunction");
    expect(draft.preFlaggedContraindications).toContain("nitrates");
    expect(draft.hardStops).toContain("safety_nitrates");
    expect(draft.goalKey).toBe("male_sexual_function");
  });

  it("hard-stop pregnancy forces provider review posture", () => {
    const draft = mapIntakeToAssessment({
      safety_pregnant_or_nursing: true,
      intake_interest_glp1: true,
    });
    expect(draft.hardStops.length).toBeGreaterThan(0);
    expect(draft.universalSafetyPositive).toContain("safety_pregnant_or_nursing");
  });
});
