import { describe, expect, it } from "vitest";
import { generateBookingReference } from "./booking-reference";

describe("generateBookingReference", () => {
  it("has the TA- prefix followed by 6 characters", () => {
    expect(generateBookingReference()).toMatch(/^TA-[A-Z0-9]{6}$/);
  });

  it("never contains visually-ambiguous characters (0, O, 1, I, L)", () => {
    for (let i = 0; i < 200; i++) {
      const code = generateBookingReference().slice(3);
      expect(code).not.toMatch(/[01ILO]/);
    }
  });

  it("is effectively unique across many calls", () => {
    const codes = new Set(Array.from({ length: 500 }, () => generateBookingReference()));
    expect(codes.size).toBe(500);
  });
});
