"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/auth";
import { cancelBookingById, type CancelResult } from "@/lib/cancel-booking";
import { BookingStatus, type Owner } from "@/generated/prisma/client";

/** A booking is accessible if the current actor owns its pitch, or is a platform admin. */
async function getAccessibleBooking(owner: Owner, bookingId: string) {
  const booking = await prisma.booking.findFirst({
    where: owner.role === "ADMIN" ? { id: bookingId } : { id: bookingId, pitch: { ownerId: owner.id } },
  });
  if (!booking) throw new Error("Booking not found.");
  return booking;
}

function revalidateBookingPaths() {
  revalidatePath("/dashboard/bookings");
  revalidatePath("/admin/bookings");
}

export async function approveBooking(bookingId: string): Promise<void> {
  const owner = await requireOwner();
  await getAccessibleBooking(owner, bookingId);
  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: BookingStatus.CONFIRMED, approvedAt: new Date(), approvedBy: owner.id, expiresAt: null },
  });
  revalidateBookingPaths();
}

export async function ownerCancelBooking(bookingId: string): Promise<CancelResult> {
  const owner = await requireOwner();
  await getAccessibleBooking(owner, bookingId);
  const result = await cancelBookingById(bookingId);
  revalidateBookingPaths();
  return result;
}
