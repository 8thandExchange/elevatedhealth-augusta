import { describe, expect, it } from "vitest";
import {
  computeGfeExpiresAt,
  GFE_VALIDITY_MONTHS,
  isGfeClearanceCurrentlyValid,
  pickActiveGfeClearance,
  shouldPromptForGfe,
  type GfeClearanceRow,
} from "./gfeClearance";

const baseRow = (overrides: Partial<GfeClearanceRow>): GfeClearanceRow => ({
  id: "1",
  patient_id: "p1",
  service_category: "general",
  clearance_source: "qualiphy",
  status: "approved",
  approved_at: "2026-01-01T00:00:00.000Z",
  expires_at: "2027-01-01T00:00:00.000Z",
  exam_name: null,
  provider_name: null,
  pdf_storage_path: null,
  sent_at: null,
  meeting_url: null,
  notes: null,
  created_at: "2026-01-01T00:00:00.000Z",
  ...overrides,
});

describe("gfeClearance", () => {
  it("computes 12-month expiry from approval date", () => {
    const exp = computeGfeExpiresAt("2026-06-01T12:00:00.000Z");
    expect(exp.getUTCFullYear()).toBe(2027);
    expect(GFE_VALIDITY_MONTHS).toBe(12);
  });

  it("treats approved row as valid before expires_at", () => {
    expect(
      isGfeClearanceCurrentlyValid(
        baseRow({ expires_at: "2030-01-01T00:00:00.000Z" }),
        new Date("2026-06-01"),
      ),
    ).toBe(true);
  });

  it("treats approved row as invalid after expires_at", () => {
    expect(
      isGfeClearanceCurrentlyValid(
        baseRow({ expires_at: "2025-01-01T00:00:00.000Z" }),
        new Date("2026-06-01"),
      ),
    ).toBe(false);
  });

  it("does not prompt when valid clearance exists", () => {
    expect(shouldPromptForGfe([baseRow({})], new Date("2026-06-01"))).toBe(false);
  });

  it("does not prompt when pending invite exists", () => {
    expect(
      shouldPromptForGfe(
        [baseRow({ status: "pending", expires_at: null, approved_at: null })],
        new Date("2026-06-01"),
      ),
    ).toBe(false);
  });

  it("prompts when no valid or pending clearance", () => {
    expect(
      shouldPromptForGfe(
        [baseRow({ status: "rejected", expires_at: null })],
        new Date("2026-06-01"),
      ),
    ).toBe(true);
  });

  it("pickActiveGfeClearance chooses latest valid approved row", () => {
    const rows = [
      baseRow({
        id: "old",
        approved_at: "2024-01-01T00:00:00.000Z",
        expires_at: "2025-01-01T00:00:00.000Z",
      }),
      baseRow({
        id: "new",
        approved_at: "2026-01-01T00:00:00.000Z",
        expires_at: "2027-06-01T00:00:00.000Z",
      }),
    ];
    expect(pickActiveGfeClearance(rows)?.id).toBe("new");
  });
});
