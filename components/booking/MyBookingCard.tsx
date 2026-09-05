"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { MapPin, CalendarDays, Clock3, Navigation, CalendarPlus, Share2, ImageOff } from "lucide-react";
import { BookingStatusBadge } from "@/components/shared/StatusBadge";
import { Money } from "@/components/shared/Money";
import { getPitchPhotoUrl } from "@/lib/storage";
import { formatDateLong, formatTimeRange } from "@/lib/format";
import { buildBookingIcsDataUrl } from "@/lib/calendar";
import { buildWaLink } from "@/lib/whatsapp";
import type { BookingCardData } from "@/lib/client/bookings-storage";
import type { BookingStatus } from "@/generated/prisma/client";

export function MyBookingCard({ booking, stale }: { booking: BookingCardData; stale?: boolean }) {
  const [shared, setShared] = useState(false);
  const mapsHref = `https://www.google.com/maps/dir/?api=1&destination=${booking.lat},${booking.lng}`;
  const shareText = `${booking.pitchName}\n${booking.pitchAddress}\n${formatDateLong(booking.date)}, ${formatTimeRange(booking.startTime, booking.endTime)}\nRef ${booking.reference}\n${mapsHref}`;

  async function handleShareLocation() {
    if ("share" in navigator) {
      try {
        await navigator.share({ title: booking.pitchName, text: shareText });
        return;
      } catch {
        return; // cancelled or unsupported mid-call — fall through only on genuine absence, not user cancel
      }
    }
    window.open(buildWaLink("", shareText), "_blank", "noopener,noreferrer");
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
      <div className="flex gap-3 p-4">
        <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
          {booking.photoPath ? (
            <Image src={getPitchPhotoUrl(booking.photoPath)} alt="" fill className="object-cover" sizes="64px" unoptimized />
          ) : (
            <span className="flex h-full items-center justify-center text-zinc-300">
              <ImageOff className="size-5" />
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <Link href={`/pitches/${booking.pitchSlug}`} className="min-w-0 truncate font-display font-bold text-zinc-900 hover:text-emerald-700">
              {booking.pitchName}
            </Link>
            <BookingStatusBadge status={booking.status as BookingStatus} />
          </div>
          <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-zinc-500">
            <MapPin className="size-3.5 shrink-0 text-zinc-400" />
            {booking.pitchAddress}
          </p>
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-zinc-500">
            <CalendarDays className="size-3.5 shrink-0 text-zinc-400" />
            {formatDateLong(booking.date)}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
            <Clock3 className="size-3.5 shrink-0 text-zinc-400" />
            {formatTimeRange(booking.startTime, booking.endTime)}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-dashed border-zinc-200 px-4 py-2.5 text-xs text-zinc-500">
        <span className="font-mono font-medium tracking-wide text-zinc-700">{booking.reference}</span>
        <span className="font-medium text-zinc-900">
          <Money amount={booking.totalPrice} currency={booking.currency} />
        </span>
      </div>

      {stale && (
        <p className="border-t border-amber-100 bg-amber-50 px-4 py-1.5 text-[11px] text-amber-700">
          Offline — showing your last known status for this booking.
        </p>
      )}

      <div className="grid grid-cols-3 gap-px border-t border-zinc-100 bg-zinc-100 text-xs font-medium">
        <button
          type="button"
          onClick={handleShareLocation}
          className="flex flex-col items-center gap-1 bg-white px-2 py-2.5 text-zinc-600 transition-colors hover:bg-zinc-50 active:bg-zinc-100"
        >
          <Share2 className="size-4 text-emerald-600" />
          {shared ? "Opened" : "Share"}
        </button>
        <a
          href={mapsHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1 bg-white px-2 py-2.5 text-zinc-600 transition-colors hover:bg-zinc-50 active:bg-zinc-100"
        >
          <Navigation className="size-4 text-emerald-600" />
          Maps
        </a>
        <a
          href={buildBookingIcsDataUrl(booking)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1 bg-white px-2 py-2.5 text-zinc-600 transition-colors hover:bg-zinc-50 active:bg-zinc-100"
        >
          <CalendarPlus className="size-4 text-emerald-600" />
          Calendar
        </a>
      </div>
    </div>
  );
}
