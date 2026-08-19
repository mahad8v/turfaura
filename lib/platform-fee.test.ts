import { describe, expect, it } from "vitest";
import { calculatePlatformFee } from "./platform-fee";

describe("calculatePlatformFee", () => {
  it("charges nothing for zero turfs", () => {
    expect(calculatePlatformFee(0)).toBe(0);
  });

  it("charges a flat 1,200 for exactly one turf", () => {
    expect(calculatePlatformFee(1)).toBe(1200);
  });

  it("charges a flat 1,800 for 2 to 5 turfs, regardless of count within the band", () => {
    expect(calculatePlatformFee(2)).toBe(1800);
    expect(calculatePlatformFee(3)).toBe(1800);
    expect(calculatePlatformFee(5)).toBe(1800);
  });

  it("charges 500 per turf once the account has more than 5", () => {
    expect(calculatePlatformFee(6)).toBe(3000);
    expect(calculatePlatformFee(10)).toBe(5000);
  });
});
