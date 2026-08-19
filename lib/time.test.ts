import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { addMinutesToTime, extendPastMidnight, isPastSlot, timeToMinutes, toWallClock } from "./time";

describe("timeToMinutes", () => {
  it("converts HH:mm to minutes since midnight", () => {
    expect(timeToMinutes("00:00")).toBe(0);
    expect(timeToMinutes("09:30")).toBe(570);
    expect(timeToMinutes("23:59")).toBe(1439);
  });

  it("reads extended (>24:00) notation as more than a full day", () => {
    expect(timeToMinutes("28:00")).toBe(1680);
  });
});

describe("addMinutesToTime", () => {
  it("adds minutes within a day", () => {
    expect(addMinutesToTime("09:00", 60)).toBe("10:00");
  });

  it("does not wrap past 24:00 — extended notation stays monotonic", () => {
    expect(addMinutesToTime("23:30", 60)).toBe("24:30");
  });
});

describe("extendPastMidnight", () => {
  it("adds 24h to a wall-clock time", () => {
    expect(extendPastMidnight("04:00")).toBe("28:00");
    expect(extendPastMidnight("00:00")).toBe("24:00");
  });
});

describe("toWallClock", () => {
  it("leaves an ordinary time unchanged", () => {
    expect(toWallClock("14:30")).toBe("14:30");
  });

  it("normalizes extended notation back to a real clock time", () => {
    expect(toWallClock("28:00")).toBe("04:00");
    expect(toWallClock("24:00")).toBe("00:00");
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

  it("treats an overnight pitch's extended-notation slot as not past while it's still today", () => {
    // "today" 15:00 (3pm) is well before an extended 25:30 (1:30am tomorrow).
    expect(isPastSlot("2026-08-18", "25:30")).toBe(false);
  });

  it("treats an overnight slot as past once the real clock reaches it, even after the date rolls over", () => {
    vi.setSystemTime(new Date("2026-08-19T01:45:00.000Z")); // 1:45am the next day
    expect(isPastSlot("2026-08-18", "25:30")).toBe(true); // 1:30am has passed
  });

  it("treats an overnight slot as still upcoming just before the real clock reaches it", () => {
    vi.setSystemTime(new Date("2026-08-19T01:15:00.000Z")); // 1:15am the next day
    expect(isPastSlot("2026-08-18", "25:30")).toBe(false); // 1:30am hasn't happened yet
  });
});
