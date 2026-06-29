import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  formatDeidentifiedLabPrompt,
  safeHarborAge,
  toDeidentifiedLabContext,
} from "../supabase/functions/_shared/phi-deidentify.ts";

describe("safeHarborAge", () => {
  it("returns integer age for under 90", () => {
    expect(safeHarborAge("1980-01-15")).toBe(String(new Date().getFullYear() - 1980));
  });

  it("caps at 90+ for ages 90 and above", () => {
    expect(safeHarborAge("1920-06-01")).toBe("90+");
    expect(safeHarborAge("1930-01-01")).toBe("90+");
  });
});

describe("toDeidentifiedLabContext", () => {
  it("never includes name, dob, or patient_id in serialized output", () => {
    const ctx = toDeidentifiedLabContext({
      dob: "1980-05-01",
      gender: "female",
      primary_program: "hrt",
      service_interests: ["energy", "sleep"],
      medical_history: {
        safety_screening: { cardiac_conditions: true },
        current_medications: "Secret free text meds",
        treatment_goals: "Lose weight fast",
      },
      medications: [{ medication_name: "Bi-Est", service_line: "hrt" }],
    });

    const blob = JSON.stringify(ctx) + formatDeidentifiedLabPrompt(ctx);
    expect(blob).not.toMatch(/1980-05-01/);
    expect(blob).not.toMatch(/Jane Doe/i);
    expect(blob).not.toMatch(/patient_id/i);
    expect(blob).not.toMatch(/Secret free text/);
    expect(blob).not.toMatch(/Lose weight fast/);
    expect(ctx.symptomList).toContain("screen:cardiac_conditions");
    expect(ctx.medicationList[0]).toContain("Bi-Est");
  });
});
