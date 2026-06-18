import { describe, expect, it } from "vitest";
import {
  getStaffPortalLoginPath,
  hasClinicAdminRole,
  hasClinicPortalAccess,
  isOfficeManagerEmail,
} from "./staffPortalRouting";

describe("staffPortalRouting", () => {
  it("identifies Kristen as office manager", () => {
    expect(isOfficeManagerEmail("kcovington@pmrehab.net")).toBe(true);
    expect(getStaffPortalLoginPath("kcovington@pmrehab.net")).toBe("/office/dashboard");
  });

  it("treats admin and business_admin as clinic admin", () => {
    expect(hasClinicAdminRole(["staff"])).toBe(false);
    expect(hasClinicAdminRole(["admin"])).toBe(true);
    expect(hasClinicAdminRole(["business_admin", "staff"])).toBe(true);
  });

  it("allows all portal roles clinic access", () => {
    expect(hasClinicPortalAccess(["user"])).toBe(false);
    expect(hasClinicPortalAccess(["staff"])).toBe(true);
    expect(hasClinicPortalAccess(["provider"])).toBe(true);
  });
});
