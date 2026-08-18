import { prisma } from "@/lib/prisma";
import { BookingStatus } from "@/generated/prisma/client";

export interface SlotAvailability {
  startTime: string;
  endTime: string;
  available: boolean;
}

const ACTIVE_STATUSES: BookingStatus[] = [BookingStatus.PENDING, BookingStatus.CONFIRMED];

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function addMinutesToTime(time: string, minutes: number): string {
  const total = timeToMinutes(time) + minutes;
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

/** Midnight-UTC Date for a "YYYY-MM-DD" string, matching how Prisma stores @db.Date columns. */
export function toDateOnly(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00.000Z`);
}

function rangesOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  return aStart < bEnd && bStart < aEnd;
}

/** Flips any of this pitch's bookings the owner never approved/rejected in time to EXPIRED. */
export async function expireStaleHolds(pitchId: string): Promise<void> {
  await prisma.booking.updateMany({
    where: {
      pitchId,
      status: BookingStatus.PENDING,
      expiresAt: { lt: new Date() },
    },
    data: { status: BookingStatus.EXPIRED },
  });
}

/**
 * Availability for each possible start time on the pitch's base slot grid
 * (every `slotDurationMinutes`), checked against a booking window of
 * `durationMinutes` (defaults to one base slot — pass e.g. 120 to find start
 * times where a full 2-hour booking would fit).
 */
export async function getAvailability(
  pitchId: string,
  dateStr: string,
  durationMinutes?: number,
): Promise<SlotAvailability[]> {
  const pitch = await prisma.pitch.findUniqueOrThrow({ where: { id: pitchId } });
  const date = toDateOnly(dateStr);
  const duration = durationMinutes ?? pitch.slotDurationMinutes;

  await expireStaleHolds(pitchId);

  const [bookings, blockedSlots] = await Promise.all([
    prisma.booking.findMany({
      where: { pitchId, date, status: { in: ACTIVE_STATUSES } },
      select: { startTime: true, endTime: true },
    }),
    prisma.blockedSlot.findMany({ where: { pitchId, date } }),
  ]);

  const slots: SlotAvailability[] = [];
  let cursor = pitch.openTime;

  while (timeToMinutes(cursor) + duration <= timeToMinutes(pitch.closeTime)) {
    const start = cursor;
    const end = addMinutesToTime(cursor, duration);

    const isBooked = bookings.some((b) => rangesOverlap(start, end, b.startTime, b.endTime));
    const isBlocked = blockedSlots.some((b) =>
      rangesOverlap(start, end, b.startTime, b.endTime ?? pitch.closeTime),
    );

    slots.push({ startTime: start, endTime: end, available: !isBooked && !isBlocked });
    // Step by the pitch's base grid, not by the requested duration, so e.g. a
    // 2-hour search still offers every hour mark as a possible start time.
    cursor = addMinutesToTime(cursor, pitch.slotDurationMinutes);
  }

  return slots;
}
