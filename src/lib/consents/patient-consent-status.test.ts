import { describe, expect, it } from "vitest";
import { TIER_1_CONSENTS, TIER_1_REQUIRED_CONSENTS } from "@/data/consents";

describe("patient-consent-status", () => {
  it("provider Tier 1 required set matches patient intake bundle", () => {
    expect(TIER_1_REQUIRED_CONSENTS).toEqual([...TIER_1_CONSENTS]);
  });

  it("does not require a separate notice_of_privacy_practices signature", () => {
    expect(TIER_1_REQUIRED_CONSENTS).not.toContain("notice_of_privacy_practices");
    expect(TIER_1_REQUIRED_CONSENTS).toContain("hipaa_acknowledgment");
  });
});
