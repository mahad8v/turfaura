import { prisma } from "@/lib/prisma";
import { BookingStatus } from "@/generated/prisma/client";

export interface CancelResult {
  error?: string;
}

/**
 * Cancels a booking. Used by both the customer-facing receipt page and the
 * owner's bookings dashboard. No payment was ever collected up front (cash
 * is paid at the pitch after playing), so there's nothing to refund.
 */
export async function cancelBookingById(bookingId: string): Promise<CancelResult> {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) return { error: "Booking not found." };
  if (booking.status === BookingStatus.CANCELLED || booking.status === BookingStatus.EXPIRED) {
    return { error: "This booking is already cancelled." };
  }

  await prisma.booking.update({
    where: { id: booking.id },
    data: { status: BookingStatus.CANCELLED, expiresAt: null },
  });

  return {};
}
