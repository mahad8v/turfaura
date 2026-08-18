import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { addMinutesToTime, isPastSlot, timeToMinutes } from "./time";

describe("timeToMinutes", () => {
  it("converts HH:mm to minutes since midnight", () => {
    expect(timeToMinutes("00:00")).toBe(0);
    expect(timeToMinutes("09:30")).toBe(570);
    expect(timeToMinutes("23:59")).toBe(1439);
  });
});

describe("addMinutesToTime", () => {
  it("adds minutes and wraps past midnight", () => {
    expect(addMinutesToTime("09:00", 60)).toBe("10:00");
    expect(addMinutesToTime("23:30", 60)).toBe("00:30");
  });
});

describe("isPastSlot", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Fixed "now": 2026-08-18T15:00:00.000Z (3pm UTC)
    vi.setSystemTime(new Date("2026-08-18T15:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("treats a past date as fully past", () => {
    expect(isPastSlot("2026-08-17", "08:00")).toBe(true);
  });

  it("treats a future date as never past", () => {
    expect(isPastSlot("2026-08-19", "08:00")).toBe(false);
  });

  it("treats an earlier time today as past", () => {
    expect(isPastSlot("2026-08-18", "08:00")).toBe(true);
  });

  it("treats the current time today as past (no immediate-start bookings)", () => {
    expect(isPastSlot("2026-08-18", "15:00")).toBe(true);
  });

  it("treats a later time today as not past", () => {
    expect(isPastSlot("2026-08-18", "16:00")).toBe(false);
  });
});
