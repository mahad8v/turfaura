import { timeToMinutes } from "@/lib/time";

const DAY_MINUTES = 24 * 60;

// Booking dates/times are treated as plain UTC wall-clock throughout this
// app (see lib/time.ts) — and Gambia, the only market this runs in, really
// is UTC+0 year-round, so that's not just an internal simplification here,
// it's also literally correct for the calendar event.
function slotToUtcDate(dateStr: string, time: string): Date {
  const minutes = timeToMinutes(time); // may exceed 24*60 in extended (overnight) notation
  const daysToAdd = Math.floor(minutes / DAY_MINUTES);
  const wallClockMinutes = ((minutes % DAY_MINUTES) + DAY_MINUTES) % DAY_MINUTES;
  const date = new Date(`${dateStr}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + daysToAdd);
  date.setUTCHours(Math.floor(wallClockMinutes / 60), wallClockMinutes % 60, 0, 0);
  return date;
}

function formatIcsDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

// Escapes the handful of characters the ICS spec (RFC 5545) requires escaped
// in text values — commas, semicolons, backslashes, and newlines.
function escapeIcsText(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;").replace(/\n/g, "\\n");
}

export function buildBookingIcsDataUrl(booking: {
  reference: string;
  pitchName: string;
  pitchAddress: string;
  date: string;
  startTime: string;
  endTime: string;
}): string {
  const start = slotToUtcDate(booking.date, booking.startTime);
  const end = slotToUtcDate(booking.date, booking.endTime);

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//TurfAura//Booking//EN",
    "BEGIN:VEVENT",
    `UID:${booking.reference}@turfaura.app`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${formatIcsDate(start)}`,
    `DTEND:${formatIcsDate(end)}`,
    `SUMMARY:${escapeIcsText(`${booking.pitchName} — TurfAura booking`)}`,
    `DESCRIPTION:${escapeIcsText(`Booking reference ${booking.reference}`)}`,
    `LOCATION:${escapeIcsText(booking.pitchAddress)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return `data:text/calendar;charset=utf-8,${encodeURIComponent(lines.join("\r\n"))}`;
}
