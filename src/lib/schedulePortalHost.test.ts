import { describe, expect, it } from "vitest";
import {
  CALENDAR_KIOSK_EMAIL,
  CALENDAR_KIOSK_USERNAME,
  resolveCalendarLoginEmail,
} from "./schedulePortalHost";

describe("resolveCalendarLoginEmail", () => {
  it("maps kiosk username to internal auth email", () => {
    expect(resolveCalendarLoginEmail("calendar")).toBe(CALENDAR_KIOSK_EMAIL);
    expect(resolveCalendarLoginEmail("Calendar")).toBe(CALENDAR_KIOSK_EMAIL);
    expect(resolveCalendarLoginEmail(CALENDAR_KIOSK_USERNAME)).toBe(CALENDAR_KIOSK_EMAIL);
  });

  it("passes through staff emails", () => {
    expect(resolveCalendarLoginEmail("drdwmd@pmrehab.net")).toBe("drdwmd@pmrehab.net");
  });

  it("rejects unknown usernames without @", () => {
    expect(() => resolveCalendarLoginEmail("frontdesk")).toThrow();
  });
});
