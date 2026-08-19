import { describe, expect, it } from "vitest";
import {
  formatMoney,
  formatDateLong,
  formatDateShort,
  formatTime12h,
  formatTimeRange,
  formatTimeRangeShort,
  toDateStr,
} from "./format";

// Intl.NumberFormat separates the currency code from the amount with a
// no-break space (U+00A0), not a regular ASCII space — normalize before
// comparing so this test isn't tied to one particular ICU/CLDR version.
function normalizeSpaces(s: string): string {
  return s.replace(/\u00A0/g, " ");
}

describe("formatMoney", () => {
  it("formats a whole-number amount with the currency code", () => {
    expect(normalizeSpaces(formatMoney(2800, "GMD"))).toBe("GMD 2,800");
  });

  it("accepts a string amount", () => {
    expect(normalizeSpaces(formatMoney("900", "GMD"))).toBe("GMD 900");
  });

  it("rounds off cents rather than showing them", () => {
    expect(normalizeSpaces(formatMoney(1234.5, "GMD"))).toBe("GMD 1,235");
  });

  it("falls back to a plain string for a malformed currency code", () => {
    // Intl only validates the *shape* of a currency code, not that it's a
    // real ISO 4217 assignment — a 3-letter code always formats fine, so
    // the fallback path only triggers on something structurally invalid.
    expect(formatMoney(500, "US")).toBe("500 US");
  });
});

describe("toDateStr", () => {
  it("renders a Date as YYYY-MM-DD", () => {
    expect(toDateStr(new Date("2026-08-17T00:00:00.000Z"))).toBe("2026-08-17");
  });
});

describe("formatDateLong / formatDateShort", () => {
  it("renders the full weekday, month, and year", () => {
    expect(formatDateLong("2026-08-17")).toBe("Monday, August 17, 2026");
  });

  it("renders a compact weekday + month + day for tight layouts", () => {
    expect(formatDateShort("2026-08-17")).toBe("Mon, Aug 17");
  });
});

describe("formatTime12h", () => {
  it("converts midnight and noon correctly", () => {
    expect(formatTime12h("00:00")).toBe("12:00 AM");
    expect(formatTime12h("12:00")).toBe("12:00 PM");
  });

  it("converts a normal morning and evening time", () => {
    expect(formatTime12h("09:05")).toBe("9:05 AM");
    expect(formatTime12h("21:30")).toBe("9:30 PM");
  });

  it("normalizes an overnight pitch's extended (>24:00) time", () => {
    // 28:00 is an overnight pitch's 4am-the-next-morning close time.
    expect(formatTime12h("28:00")).toBe("4:00 AM");
    expect(formatTime12h("24:00")).toBe("12:00 AM");
  });
});

describe("formatTimeRange / formatTimeRangeShort", () => {
  it("shows AM/PM on both ends in the long form", () => {
    expect(formatTimeRange("09:00", "10:00")).toBe("9:00 AM – 10:00 AM");
  });

  it("drops the repeated AM/PM in the short form when both ends match", () => {
    expect(formatTimeRangeShort("09:00", "10:00")).toBe("9:00 – 10:00 AM");
  });

  it("keeps both AM/PM in the short form when the range crosses noon", () => {
    expect(formatTimeRangeShort("11:30", "12:30")).toBe("11:30 AM – 12:30 PM");
  });
});
