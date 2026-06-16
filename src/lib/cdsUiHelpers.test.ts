import { describe, expect, it } from "vitest";
import {
  canRecommendCandidate,
  requiresSubstanceAcknowledgment,
  shouldRouteToOrderLabs,
} from "./cdsUiHelpers";

describe("cdsUiHelpers", () => {
  it("only allows recommend path when gate is ready", () => {
    expect(canRecommendCandidate("ready")).toBe(true);
    expect(canRecommendCandidate("needs_labs")).toBe(false);
    expect(canRecommendCandidate("blocked_excluded")).toBe(false);
  });

  it("routes needs_labs to order-labs workflow", () => {
    expect(shouldRouteToOrderLabs("needs_labs")).toBe(true);
    expect(shouldRouteToOrderLabs("ready")).toBe(false);
  });

  it("flags substance acknowledgment gates", () => {
    expect(requiresSubstanceAcknowledgment("needs_ack")).toBe(true);
    expect(requiresSubstanceAcknowledgment("blocked_ruo")).toBe(true);
    expect(requiresSubstanceAcknowledgment("ready")).toBe(false);
  });
});
