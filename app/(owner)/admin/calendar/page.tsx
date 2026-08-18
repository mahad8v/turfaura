import { CalendarDays } from "lucide-react";
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

export default async function AdminCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month: monthParam } = await searchParams;
  const { year, month } = parseMonthParam(monthParam);

  const rangeStart = new Date(Date.UTC(year, month - 1, 1));
  const rangeEnd = new Date(Date.UTC(year, month, 1));

  const [bookings, blockedSlots] = await Promise.all([
    prisma.booking.findMany({
      where: {
        date: { gte: rangeStart, lt: rangeEnd },
        status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
      },
      select: { date: true, status: true },
    }),
    prisma.blockedSlot.findMany({
      where: { date: { gte: rangeStart, lt: rangeEnd } },
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
      <div className="flex items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-inset ring-indigo-600/10">
          <CalendarDays className="size-5" strokeWidth={2.25} />
        </span>
        <div>
          <h1 className="font-display text-xl font-bold text-zinc-900">Calendar</h1>
          <p className="text-sm text-zinc-500">Bookings and blocked dates across every pitch on the platform.</p>
        </div>
      </div>
      <div className="mt-6 max-w-xl">
        <BookingCalendar
          year={year}
          month={month}
          days={days}
          calendarBasePath="/admin/calendar"
          dayHref={(dateStr) => `/admin/bookings?date=${dateStr}`}
          accent="indigo"
        />
      </div>
    </div>
  );
}
