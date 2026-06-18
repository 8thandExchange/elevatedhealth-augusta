import { describe, expect, it } from "vitest";
import {
  formatConsultationAmount,
  isAwaitingConsultPayment,
  isPaidConsultation,
} from "./consultationBookingDisplay";

describe("consultationBookingDisplay", () => {
  it("formats dollar amounts without double-scaling", () => {
    expect(formatConsultationAmount(79)).toBe("$79");
    expect(formatConsultationAmount(7900)).toBe("$79");
  });

  it("distinguishes awaiting payment vs paid", () => {
    expect(isAwaitingConsultPayment("pending_payment")).toBe(true);
    expect(isPaidConsultation("paid")).toBe(true);
    expect(isPaidConsultation("pending")).toBe(false);
  });
});
