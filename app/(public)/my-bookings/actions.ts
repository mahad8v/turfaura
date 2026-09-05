"use server";

import { prisma } from "@/lib/prisma";
import { toDateStr } from "@/lib/format";
import type { BookingCardData } from "@/lib/client/bookings-storage";

const MAX_RESULTS = 30;

function toCardData(
  booking: {
    reference: string;
    status: string;
    date: Date;
    startTime: string;
    endTime: string;
    totalPrice: { toString(): string };
    currency: string;
    customerPhone: string;
  },
  pitch: {
    slug: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
    photos: { storagePath: string }[];
  },
): BookingCardData {
  return {
    reference: booking.reference,
    status: booking.status as BookingCardData["status"],
    date: toDateStr(booking.date),
    startTime: booking.startTime,
    endTime: booking.endTime,
    totalPrice: booking.totalPrice.toString(),
    currency: booking.currency,
    customerPhone: booking.customerPhone,
    pitchSlug: pitch.slug,
    pitchName: pitch.name,
    pitchAddress: pitch.address,
    lat: pitch.lat,
    lng: pitch.lng,
    photoPath: pitch.photos[0]?.storagePath ?? null,
  };
}

const PITCH_SELECT = {
  select: { slug: true, name: true, address: true, lat: true, lng: true, photos: { take: 1, select: { storagePath: true } } },
} as const;

/** Re-fetches current, live data for bookings the browser already knows about (by reference) — keeps status accurate without needing an account. */
export async function refreshBookingsByReference(references: string[]): Promise<BookingCardData[]> {
  const unique = Array.from(new Set(references)).slice(0, 50);
  if (unique.length === 0) return [];

  const bookings = await prisma.booking.findMany({
    where: { reference: { in: unique } },
    include: { pitch: PITCH_SELECT },
    orderBy: { createdAt: "desc" },
  });

  return bookings.map((b) => toCardData(b, b.pitch));
}

/** Lets someone recover their bookings on a new device / after clearing storage, without an account. */
export async function findBookingsByPhone(phone: string): Promise<BookingCardData[]> {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 7) return [];

  const bookings = await prisma.booking.findMany({
    where: { customerPhone: { contains: digits } },
    include: { pitch: PITCH_SELECT },
    orderBy: { createdAt: "desc" },
    take: MAX_RESULTS,
  });

  return bookings.map((b) => toCardData(b, b.pitch));
}
