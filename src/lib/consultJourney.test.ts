import { describe, expect, it } from "vitest";
import {
  canBookWellnessVisit,
  getConsultJourneyPatientAction,
  getConsultJourneyStageIndex,
} from "./consultJourney";

describe("consultJourney", () => {
  it("blocks booking until GFE cleared", () => {
    expect(
      canBookWellnessVisit({ onboardingStatus: "consultation_paid", gfeRows: [] }),
    ).toBe(false);
    expect(
      canBookWellnessVisit({
        onboardingStatus: "gfe_cleared",
        gfeRows: [],
      }),
    ).toBe(true);
  });

  it("places paid patient on GFE step", () => {
    const idx = getConsultJourneyStageIndex({ onboardingStatus: "consultation_paid" });
    expect(idx).toBeGreaterThanOrEqual(4);
  });

  it("advances account_created when paid booking exists", () => {
    const idx = getConsultJourneyStageIndex({
      onboardingStatus: "account_created",
      hasPaidConsultBooking: true,
    });
    expect(idx).toBe(4);
    const action = getConsultJourneyPatientAction({
      onboardingStatus: "account_created",
      hasPaidConsultBooking: true,
    });
    expect(action.ctaPath).not.toBe("/consult/start");
    expect(action.title).toMatch(/Good Faith Exam/i);
  });

  it("offers booking when gfe_cleared even with stale pending invite row", () => {
    const action = getConsultJourneyPatientAction({
      onboardingStatus: "gfe_cleared",
      gfeRows: [
        {
          id: "pending",
          patient_id: "p1",
          service_category: "general",
          clearance_source: "qualiphy",
          status: "pending",
          approved_at: null,
          expires_at: null,
          exam_name: null,
          provider_name: null,
          pdf_storage_path: null,
          sent_at: null,
          meeting_url: "https://example.com",
          notes: null,
          created_at: "2026-06-02T00:00:00.000Z",
        },
      ],
    });
    expect(action.ctaPath).toBe("/schedule-consult");
    expect(action.title).toMatch(/Book your in-person visit/i);
  });
});
