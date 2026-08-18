"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { cancelBookingById, type CancelResult } from "@/lib/cancel-booking";

export async function cancelBooking(reference: string): Promise<CancelResult> {
  const booking = await prisma.booking.findUnique({ where: { reference }, select: { id: true } });
  if (!booking) return { error: "Booking not found." };

  const result = await cancelBookingById(booking.id);
  if (!result.error) revalidatePath(`/receipt/${reference}`);
  return result;
}
