import { describe, expect, it } from "vitest";
import { pitchFormSchema } from "./pitch";

const BASE = {
  name: "Bakau Beach Pitch",
  address: "Atlantic Boulevard, Bakau",
  area: "Bakau",
  type: "FIVE_A_SIDE" as const,
  lat: "13.47",
  lng: "-16.69",
  basePricePerHour: "1000",
  currency: "GMD",
  slotDurationMinutes: "60",
};

describe("pitchFormSchema", () => {
  it("leaves a same-day close time unchanged", () => {
    const result = pitchFormSchema.safeParse({ ...BASE, openTime: "06:00", closeTime: "22:00" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.closeTime).toBe("22:00");
  });

  it("extends an overnight close time past 24:00", () => {
    const result = pitchFormSchema.safeParse({ ...BASE, openTime: "10:00", closeTime: "04:00" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.closeTime).toBe("28:00");
  });

  it("extends a close time equal to a later open time (e.g. open 14:00, close 02:00)", () => {
    const result = pitchFormSchema.safeParse({ ...BASE, openTime: "14:00", closeTime: "02:00" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.closeTime).toBe("26:00");
  });

  it("rejects an open time equal to the close time", () => {
    const result = pitchFormSchema.safeParse({ ...BASE, openTime: "10:00", closeTime: "10:00" });
    expect(result.success).toBe(false);
  });
});
