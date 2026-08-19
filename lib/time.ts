// Pure "HH:mm" time-math helpers — no server-only imports, safe for client
// components (lib/availability.ts pulls in the Prisma/pg driver, which
// breaks the browser bundle if a client component imports from it).
//
// A pitch that closes after midnight (e.g. opens 10:00, closes 04:00 the
// next morning) stores its closeTime — and every booking/blocked-slot time
// that falls after midnight — in "extended" notation past 24:00 (04:00
// becomes "28:00"), the same convention transit/nightlife schedules use.
// That keeps the whole operating window one ordinary, monotonically
// increasing range: every existing string/numeric time comparison (slot
// generation, the DB's overlap-exclusion constraint) keeps working
// unchanged, with no day-wrap-aware logic needed anywhere else. Only
// display (formatTime12h) and native <input type="time"> (toWallClock)
// need to normalize back to a real 00:00–23:59 clock.

const DAY_MINUTES = 24 * 60;

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/**
 * Adds minutes to an "HH:mm" time. Does NOT wrap at 24:00 — for an ordinary
 * same-day pitch this never matters (a slot's end time is always bounded by
 * closeTime, which is always < 24:00 for such a pitch), and for an overnight
 * pitch it's exactly what lets extended notation keep working.
 */
export function addMinutesToTime(time: string, minutes: number): string {
  const total = timeToMinutes(time) + minutes;
  const hh = Math.floor(total / 60);
  const mm = total % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

/** Extends a wall-clock "HH:mm" time by 24h — "04:00" -> "28:00". */
export function extendPastMidnight(time: string): string {
  return addMinutesToTime(time, DAY_MINUTES);
}

/** Normalizes a possibly-extended (>24:00) time back to real wall-clock "HH:mm". */
export function toWallClock(time: string): string {
  const mins = ((timeToMinutes(time) % DAY_MINUTES) + DAY_MINUTES) % DAY_MINUTES;
  const hh = Math.floor(mins / 60);
  const mm = mins % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

/**
 * True if a "YYYY-MM-DD" date + "HH:mm" start time has already passed,
 * against the current clock — dates/times are treated as plain UTC
 * wall-clock values throughout this app (see toDateOnly in availability.ts),
 * so "now" is read in UTC here too for consistency. startTime may be in
 * extended (>24:00) notation for an overnight pitch, so "now" is expressed
 * in the same terms: minutes since dateStr's own midnight, however many
 * calendar days have actually elapsed since then.
 */
export function isPastSlot(dateStr: string, startTime: string): boolean {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const daysElapsed = Math.round((Date.parse(todayStr) - Date.parse(dateStr)) / 86_400_000);
  if (daysElapsed < 0) return false; // dateStr is in the future
  const nowMinutesFromDateStrMidnight = daysElapsed * DAY_MINUTES + now.getUTCHours() * 60 + now.getUTCMinutes();
  return timeToMinutes(startTime) <= nowMinutesFromDateStrMidnight;
}
