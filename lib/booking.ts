import { prisma } from "@/lib/prisma";
import { Prisma, BookingStatus, type Pitch } from "@/generated/prisma/client";
import { generateBookingReference } from "@/lib/booking-reference";
import { APPROVAL_HOURS } from "@/lib/constants";
import { addMinutesToTime, expireStaleHolds, toDateOnly } from "@/lib/availability";
import { notifyOwnerOfNewBooking } from "@/lib/telegram";

export interface CreateBookingInput {
  pitchId: string;
  date: string; // "YYYY-MM-DD"
  startTime: string; // "HH:mm"
  durationMinutes?: number; // defaults to the pitch's base slot length
  customerName: string;
  customerPhone: string;
}

export type CreateBookingResult =
  | { ok: true; bookingId: string; reference: string }
  | { ok: false; error: "SLOT_TAKEN" | "PITCH_NOT_FOUND" | "SLOT_OUT_OF_RANGE" };

export function computePricing(
  pitch: Pick<Pitch, "basePricePerHour" | "slotDurationMinutes">,
  durationMinutes?: number,
) {
  const duration = durationMinutes ?? pitch.slotDurationMinutes;
  const totalPrice = (pitch.basePricePerHour.toNumber() * duration) / 60;
  return { totalPrice: Math.round(totalPrice * 100) / 100 };
}

const MAX_ATTEMPTS = 5;

/**
 * Creates a booking for a slot (optionally spanning more than one base slot,
 * e.g. a 2-hour booking), pending the owner's approval. Race-safe against two
 * customers booking overlapping time at once: a Postgres EXCLUDE constraint
 * (see the `booking_overlap_exclusion` migration) is the actual source of
 * truth — it rejects any overlap regardless of exact start time, not just an
 * exact match — this just retries on a booking-reference collision and
 * reports a clean error on a genuine conflict.
 */
export async function createBookingWithHold(input: CreateBookingInput): Promise<CreateBookingResult> {
  const pitch = await prisma.pitch.findFirst({
    where: { id: input.pitchId, isActive: true },
    include: { owner: { select: { name: true, telegramChatId: true } } },
  });
  if (!pitch) return { ok: false, error: "PITCH_NOT_FOUND" };

  const duration = input.durationMinutes ?? pitch.slotDurationMinutes;
  const endTime = addMinutesToTime(input.startTime, duration);
  if (input.startTime < pitch.openTime || endTime > pitch.closeTime) {
    return { ok: false, error: "SLOT_OUT_OF_RANGE" };
  }

  const { totalPrice } = computePricing(pitch, duration);

  await expireStaleHolds(input.pitchId);

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      const booking = await prisma.booking.create({
        data: {
          reference: generateBookingReference(),
          pitchId: input.pitchId,
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          date: toDateOnly(input.date),
          startTime: input.startTime,
          endTime,
          totalPrice,
          currency: pitch.currency,
          status: BookingStatus.PENDING,
          expiresAt: new Date(Date.now() + APPROVAL_HOURS * 60 * 60_000),
        },
      });
      if (pitch.owner.telegramChatId) {
        // Awaited (not fire-and-forget): in a serverless runtime, work left
        // running after the response is sent isn't guaranteed to finish.
        // notifyOwnerOfNewBooking swallows its own errors, so this can't
        // fail the booking — it only adds the Telegram round-trip latency.
        await notifyOwnerOfNewBooking(pitch.owner.telegramChatId, {
          pitchName: pitch.name,
          date: input.date,
          startTime: input.startTime,
          endTime,
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          totalPrice: totalPrice.toString(),
          currency: pitch.currency,
          reference: booking.reference,
        });
      }

      return { ok: true, bookingId: booking.id, reference: booking.reference };
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2002") {
          const target = err.meta?.target;
          const isReferenceCollision = Array.isArray(target) && target.includes("reference");
          if (isReferenceCollision) continue; // retry with a freshly generated reference
        }
        // P2039: the "no_overlapping_active_bookings" exclusion constraint
        // rejected an overlapping range (possibly a different start time
        // than an existing booking, e.g. a 2-hour booking colliding with a
        // 1-hour one that starts partway through it).
        if (err.code === "P2002" || err.code === "P2039") {
          return { ok: false, error: "SLOT_TAKEN" };
        }
      }
      throw err;
    }
  }

  return { ok: false, error: "SLOT_TAKEN" };
}
