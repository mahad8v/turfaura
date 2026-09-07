import { slotToDate } from "@/lib/time";

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
  const start = slotToDate(booking.date, booking.startTime);
  const end = slotToDate(booking.date, booking.endTime);

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
