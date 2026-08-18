export function formatMoney(amount: number | string, currency: string): string {
  const value = typeof amount === "string" ? Number(amount) : amount;
  try {
    // Whole amounts only — currencies like GMD/XOF don't render a symbol
    // glyph in Intl (falls back to the 3-letter code, e.g. "GMD 2,800.00"),
    // so trimming the cents keeps prices short enough to fit in a badge.
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${Math.round(value)} ${currency}`;
  }
}

export function toDateStr(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function formatDateLong(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00.000Z`).toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

// Compact form for tight spaces (booking list rows on mobile), e.g. "Mon, Aug 17".
export function formatDateShort(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00.000Z`).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function formatTime12h(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

export function formatTimeRange(startTime: string, endTime: string): string {
  return `${formatTime12h(startTime)} – ${formatTime12h(endTime)}`;
}

// Compact form for tight spaces: drops the repeated AM/PM when both ends of
// the range share one, e.g. "9:00 – 10:00 AM" instead of "9:00 AM – 10:00 AM".
export function formatTimeRangeShort(startTime: string, endTime: string): string {
  const start = formatTime12h(startTime);
  const end = formatTime12h(endTime);
  const [startClock, startPeriod] = start.split(" ");
  const [, endPeriod] = end.split(" ");
  if (startPeriod === endPeriod) return `${startClock} – ${end}`;
  return `${start} – ${end}`;
}
