import { notFound } from "next/navigation";
import { CheckCircle2, MapPin, CalendarDays, Clock3, User, Phone, Banknote } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { BookingStatusBadge } from "@/components/shared/StatusBadge";
import { Money } from "@/components/shared/Money";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";
import { CancelBookingButton } from "@/components/booking/CancelBookingButton";
import { PitchMap } from "@/components/pitch/PitchMap";
import { formatDateLong, formatTimeRange, toDateStr } from "@/lib/format";
import { BookingStatus } from "@/generated/prisma/client";
import { cancelBooking } from "./actions";

export default async function ReceiptPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;

  const booking = await prisma.booking.findUnique({
    where: { reference },
    include: { pitch: { include: { owner: true } } },
  });

  if (!booking) notFound();

  const canCancel = booking.status === BookingStatus.PENDING || booking.status === BookingStatus.CONFIRMED;

  const contactPhone = booking.pitch.owner.phone;
  const dateStr = toDateStr(booking.date);
  const isConfirmed = booking.status === BookingStatus.CONFIRMED;

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
      <div className="text-center">
        <span
          className={`mx-auto flex size-14 items-center justify-center rounded-full ${isConfirmed ? "bg-emerald-100 text-emerald-600" : "bg-zinc-100 text-zinc-500"}`}
        >
          <CheckCircle2 className="size-7" strokeWidth={2} />
        </span>
        <p className="mt-4 text-xs uppercase tracking-wide text-zinc-400">Booking reference</p>
        <p className="font-display mt-1 text-3xl font-extrabold tracking-wide text-zinc-900">{booking.reference}</p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <BookingStatusBadge status={booking.status} />
        </div>
        {booking.status === BookingStatus.PENDING && (
          <p className="mt-3 text-sm text-zinc-500">
            The pitch owner will confirm your booking on WhatsApp, then approve it here.
          </p>
        )}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <div className="p-5">
          <p className="font-display font-bold text-zinc-900">{booking.pitch.name}</p>
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-zinc-500">
            <MapPin className="size-4 shrink-0 text-zinc-400" />
            {booking.pitch.address}
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-zinc-500">
            <CalendarDays className="size-4 shrink-0 text-zinc-400" />
            {formatDateLong(dateStr)}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-zinc-500">
            <Clock3 className="size-4 shrink-0 text-zinc-400" />
            {formatTimeRange(booking.startTime, booking.endTime)}
          </p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 border-t border-zinc-100 pt-3 text-sm text-zinc-500">
            <span className="flex items-center gap-1.5">
              <User className="size-3.5 text-zinc-400" />
              {booking.customerName}
            </span>
            <span className="flex items-center gap-1.5">
              <Phone className="size-3.5 text-zinc-400" />
              {booking.customerPhone}
            </span>
          </div>
        </div>

        <div className="border-t border-dashed border-zinc-200 bg-zinc-50/60 p-5 text-sm">
          <div className="flex justify-between">
            <span className="text-zinc-500">Total price</span>
            <span className="font-medium text-zinc-900">
              <Money amount={booking.totalPrice.toString()} currency={booking.currency} />
            </span>
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500">
            <Banknote className="size-3.5 shrink-0 text-emerald-600" />
            Pay cash at the pitch after you play.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <PitchMap lat={booking.pitch.lat} lng={booking.pitch.lng} name={booking.pitch.name} />
      </div>

      <div className="mt-6 flex flex-wrap items-start gap-4">
        {contactPhone && (
          <WhatsAppButton
            phone={contactPhone}
            message={`Hi, I have a booking (ref ${booking.reference}) for ${booking.pitch.name} on ${formatDateLong(dateStr)} at ${booking.startTime}. I'd like to ask about...`}
          />
        )}
        {canCancel && (
          <div>
            <CancelBookingButton reference={booking.reference} cancelBooking={cancelBooking} />
          </div>
        )}
      </div>
    </div>
  );
}
