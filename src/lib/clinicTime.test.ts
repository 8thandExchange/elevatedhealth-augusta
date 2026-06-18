import { describe, expect, it } from "vitest";
import {
  CLINIC_TIMEZONE,
  addClinicDays,
  addMonths,
  clinicLocalToUtc,
  clinicMinutesFromMidnight,
  formatClinicDateKey,
  formatClinicDateTime,
  isConsentActive,
  mergeMinuteWindows,
} from "./clinicTime";

describe("clinicTime", () => {
  it("formats consent signed time in Eastern", () => {
    const label = formatClinicDateTime("2026-06-16T15:00:00.000Z");
    expect(label).toMatch(/Jun 16, 2026/);
    expect(label).toMatch(/11:00/);
  });

  it("treats expiration date as valid through end of clinic calendar day", () => {
    const signedAt = new Date("2026-06-01T12:00:00.000Z");
    const expiresAt = addMonths(signedAt, 0).toISOString();
    const sameDay = new Date("2026-06-01T20:00:00.000Z");
    expect(isConsentActive(expiresAt, sameDay)).toBe(true);
  });

  it("expires after the clinic calendar day passes", () => {
    const signedAt = new Date("2026-05-16T18:00:00.000Z");
    const expiresAt = addMonths(signedAt, 12).toISOString();
    expect(formatClinicDateKey(expiresAt)).toBe("2027-05-16");
    const dayAfter = new Date("2027-05-17T14:00:00.000Z");
    expect(isConsentActive(expiresAt, dayAfter)).toBe(false);
  });

  it("uses America/New_York", () => {
    expect(CLINIC_TIMEZONE).toBe("America/New_York");
  });

  it("maps 9:00 AM Eastern to 13:00 UTC in June (EDT)", () => {
    const utc = clinicLocalToUtc("2026-06-25", 9 * 60);
    expect(utc.toISOString()).toBe("2026-06-25T13:00:00.000Z");
    expect(clinicMinutesFromMidnight(utc)).toBe(9 * 60);
  });

  it("addClinicDays steps calendar dates in Eastern", () => {
    expect(addClinicDays("2026-06-25", 1)).toBe("2026-06-26");
  });

  it("mergeMinuteWindows joins touching fragments for slot generation", () => {
    const merged = mergeMinuteWindows([
      { startMin: 540, endMin: 570, step: 30 },
      { startMin: 570, endMin: 600, step: 30 },
      { startMin: 630, endMin: 660, step: 30 },
    ]);
    expect(merged).toEqual([
      { startMin: 540, endMin: 600, step: 30 },
      { startMin: 630, endMin: 660, step: 30 },
    ]);
  });
});
