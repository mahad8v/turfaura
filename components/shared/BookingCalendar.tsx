import Link from "next/link";
import { ChevronLeft, ChevronRight, Ban } from "lucide-react";

export interface CalendarDayData {
  total: number;
  hasConfirmed: boolean;
  hasPending: boolean;
  blocked: boolean;
}

interface BookingCalendarProps {
  year: number;
  month: number; // 1-12
  days: Record<string, CalendarDayData>;
  calendarBasePath: string;
  dayHref: (dateStr: string) => string;
  accent?: "emerald" | "indigo";
}

const ACCENT_RING: Record<"emerald" | "indigo", string> = {
  emerald: "ring-emerald-500",
  indigo: "ring-indigo-500",
};

const ACCENT_TEXT: Record<"emerald" | "indigo", string> = {
  emerald: "text-emerald-700",
  indigo: "text-indigo-700",
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function BookingCalendar({
  year,
  month,
  days,
  calendarBasePath,
  dayHref,
  accent = "emerald",
}: BookingCalendarProps) {
  const firstOfMonth = new Date(Date.UTC(year, month - 1, 1));
  const startWeekday = firstOfMonth.getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;

  const cells: (number | null)[] = [
    ...Array(startWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base font-bold text-zinc-900">
          {MONTH_NAMES[month - 1]} {year}
        </h2>
        <div className="flex items-center gap-1">
          <Link
            href={`${calendarBasePath}?month=${prevYear}-${pad(prevMonth)}`}
            aria-label="Previous month"
            className="flex size-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100"
          >
            <ChevronLeft className="size-4" />
          </Link>
          <Link
            href={calendarBasePath}
            className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-500 hover:bg-zinc-100"
          >
            Today
          </Link>
          <Link
            href={`${calendarBasePath}?month=${nextYear}-${pad(nextMonth)}`}
            aria-label="Next month"
            className="flex size-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100"
          >
            <ChevronRight className="size-4" />
          </Link>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-0.5 text-center text-xs font-medium text-zinc-400 sm:gap-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={i} />;
          const dateStr = `${year}-${pad(month)}-${pad(day)}`;
          const data = days[dateStr];
          const isToday = dateStr === todayStr;

          const cellContent = (
            <div
              className={`flex aspect-square flex-col items-center justify-center gap-0.5 rounded-lg text-sm transition-colors ${
                isToday ? `ring-2 ring-inset ${ACCENT_RING[accent]}` : ""
              } ${data ? "hover:bg-zinc-50" : ""}`}
            >
              <span className={isToday ? `font-bold ${ACCENT_TEXT[accent]}` : "text-zinc-700"}>{day}</span>
              <div className="flex h-3.5 items-center gap-0.5">
                {data && data.total > 0 && (
                  <span
                    className={`rounded-full px-1.5 text-[10px] font-semibold ${
                      data.hasConfirmed
                        ? "bg-emerald-100 text-emerald-700"
                        : data.hasPending
                          ? "bg-amber-100 text-amber-700"
                          : "bg-zinc-100 text-zinc-500"
                    }`}
                  >
                    {data.total}
                  </span>
                )}
                {data?.blocked && <Ban className="size-2.5 text-red-400" strokeWidth={2.5} />}
              </div>
            </div>
          );

          return data && data.total > 0 ? (
            <Link key={i} href={dayHref(dateStr)}>
              {cellContent}
            </Link>
          ) : (
            <div key={i}>{cellContent}</div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-zinc-100 pt-3 text-xs text-zinc-500">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-emerald-400" />
          Has confirmed bookings
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-amber-400" />
          Awaiting payment/confirmation
        </span>
        <span className="flex items-center gap-1.5">
          <Ban className="size-3 text-red-400" strokeWidth={2.5} />
          Blocked
        </span>
      </div>
    </div>
  );
}
