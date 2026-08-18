import { requireOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BookingCalendar, type CalendarDayData } from "@/components/shared/BookingCalendar";
import { BookingStatus } from "@/generated/prisma/client";

function parseMonthParam(month?: string): { year: number; month: number } {
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [y, m] = month.split("-").map(Number);
    return { year: y, month: m };
  }
  const now = new Date();
  return { year: now.getUTCFullYear(), month: now.getUTCMonth() + 1 };
}

export default async function OwnerCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const owner = await requireOwner();
  const { month: monthParam } = await searchParams;
  const { year, month } = parseMonthParam(monthParam);

  const rangeStart = new Date(Date.UTC(year, month - 1, 1));
  const rangeEnd = new Date(Date.UTC(year, month, 1));

  const [bookings, blockedSlots] = await Promise.all([
    prisma.booking.findMany({
      where: {
        pitch: { ownerId: owner.id },
        date: { gte: rangeStart, lt: rangeEnd },
        status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
      },
      select: { date: true, status: true },
    }),
    prisma.blockedSlot.findMany({
      where: { pitch: { ownerId: owner.id }, date: { gte: rangeStart, lt: rangeEnd } },
      select: { date: true },
    }),
  ]);

  const days: Record<string, CalendarDayData> = {};
  for (const b of bookings) {
    const key = b.date.toISOString().slice(0, 10);
    const entry = days[key] ?? { total: 0, hasConfirmed: false, hasPending: false, blocked: false };
    entry.total += 1;
    if (b.status === BookingStatus.CONFIRMED) entry.hasConfirmed = true;
    else entry.hasPending = true;
    days[key] = entry;
  }
  for (const s of blockedSlots) {
    const key = s.date.toISOString().slice(0, 10);
    const entry = days[key] ?? { total: 0, hasConfirmed: false, hasPending: false, blocked: false };
    entry.blocked = true;
    days[key] = entry;
  }

  return (
    <div>
      <h1 className="font-display text-xl font-bold text-zinc-900">Calendar</h1>
      <p className="mt-1 text-sm text-zinc-500">Bookings and blocked dates across all your pitches.</p>
      <div className="mt-6 max-w-xl">
        <BookingCalendar
          year={year}
          month={month}
          days={days}
          calendarBasePath="/dashboard/calendar"
          dayHref={(dateStr) => `/dashboard/bookings?date=${dateStr}`}
        />
      </div>
    </div>
  );
}
