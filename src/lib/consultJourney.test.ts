import { describe, expect, it } from "vitest";
import {
  canBookWellnessVisit,
  getConsultJourneyPatientAction,
  getConsultJourneyStageIndex,
} from "./consultJourney";

describe("consultJourney", () => {
  it("allows booking as soon as wellness assessment is paid", () => {
    expect(
      canBookWellnessVisit({ onboardingStatus: "consultation_paid", gfeRows: [] }),
    ).toBe(true);
    expect(
      canBookWellnessVisit({
        onboardingStatus: "gfe_pending",
        gfeRows: [],
      }),
    ).toBe(true);
    expect(
      canBookWellnessVisit({
        onboardingStatus: "consultation_scheduled",
        gfeRows: [],
      }),
    ).toBe(false);
  });

  it("places paid patient on schedule step", () => {
    const idx = getConsultJourneyStageIndex({ onboardingStatus: "consultation_paid" });
    expect(idx).toBe(CONSULT_JOURNEY_SCHEDULE_INDEX);
  });

  it("advances account_created when paid booking exists", () => {
    const idx = getConsultJourneyStageIndex({
      onboardingStatus: "account_created",
      hasPaidConsultBooking: true,
    });
    expect(idx).toBe(CONSULT_JOURNEY_SCHEDULE_INDEX);
    const action = getConsultJourneyPatientAction({
      onboardingStatus: "account_created",
      hasPaidConsultBooking: true,
    });
    expect(action.ctaPath).toBe("/schedule-consult");
    expect(action.title).toMatch(/Book your in-person visit/i);
  });

  it("reminds scheduled patients with pending GFE to complete clearance", () => {
    const action = getConsultJourneyPatientAction({
      onboardingStatus: "consultation_scheduled",
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
    expect(action.title).toMatch(/medical clearance/i);
  });
});

const CONSULT_JOURNEY_SCHEDULE_INDEX = 4;
