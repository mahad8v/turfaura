import { notFound, redirect } from "next/navigation";
import { CalendarDays, Clock3 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { computePricing } from "@/lib/booking";
import { addMinutesToTime } from "@/lib/availability";
import { formatDateLong, formatMoney, formatTimeRange } from "@/lib/format";
import { BookingForm } from "@/components/booking/BookingForm";
import { createBooking } from "./actions";

export default async function BookPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ date?: string; start?: string; duration?: string }>;
}) {
  const { slug } = await params;
  const { date, start, duration: durationParam } = await searchParams;

  const pitch = await prisma.pitch.findUnique({ where: { slug, isActive: true } });
  if (!pitch) notFound();
  if (!date || !start) redirect(`/pitches/${slug}`);

  const parsedDuration = durationParam ? Number(durationParam) : NaN;
  const duration = Number.isFinite(parsedDuration) && parsedDuration > 0 ? parsedDuration : pitch.slotDurationMinutes;

  const endTime = addMinutesToTime(start, duration);
  const { totalPrice } = computePricing(pitch, duration);
  const boundCreateBooking = createBooking.bind(null, pitch.id, date, start, duration);

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Confirm your booking</p>
      <h1 className="font-display mt-1 text-2xl font-extrabold text-zinc-900">Reserve this slot</h1>

      <div className="mt-5 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <div className="bg-emerald-50/60 px-5 py-4">
          <p className="font-display font-bold text-zinc-900">{pitch.name}</p>
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-zinc-600">
            <CalendarDays className="size-4 text-emerald-600" />
            {formatDateLong(date)}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-zinc-600">
            <Clock3 className="size-4 text-emerald-600" />
            {formatTimeRange(start, endTime)}
          </p>
        </div>
        <div className="px-5 py-4 text-sm">
          <div className="flex justify-between">
            <span className="text-zinc-500">Total price</span>
            <span className="font-display font-bold text-emerald-700">{formatMoney(totalPrice, pitch.currency)}</span>
          </div>
          <p className="mt-2 border-t border-dashed border-zinc-200 pt-2 text-xs text-zinc-500">
            Pay cash at the pitch after you play — no deposit needed now.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <BookingForm action={boundCreateBooking} />
      </div>
    </div>
  );
}
