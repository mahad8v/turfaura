"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { calculatePlatformFee, PLATFORM_FEE_CURRENCY } from "@/lib/platform-fee";

/** Marks an owner's platform fee paid for a given month, locking in the fee at their current turf count. */
export async function markPaymentPaid(ownerId: string, year: number, month: number): Promise<void> {
  const admin = await requireAdmin();

  const turfCount = await prisma.pitch.count({ where: { ownerId } });
  const amount = calculatePlatformFee(turfCount);

  await prisma.platformPayment.upsert({
    where: { ownerId_year_month: { ownerId, year, month } },
    update: { paid: true, paidAt: new Date(), markedBy: admin.id, amount, currency: PLATFORM_FEE_CURRENCY },
    create: {
      ownerId,
      year,
      month,
      amount,
      currency: PLATFORM_FEE_CURRENCY,
      paid: true,
      paidAt: new Date(),
      markedBy: admin.id,
    },
  });

  revalidatePath("/admin/payments");
  revalidatePath("/admin/earnings");
}

/** Undoes a paid mark — absence of a row is what "unpaid" means, so this just removes the record. */
export async function markPaymentUnpaid(ownerId: string, year: number, month: number): Promise<void> {
  await requireAdmin();

  await prisma.platformPayment.deleteMany({ where: { ownerId, year, month } });

  revalidatePath("/admin/payments");
  revalidatePath("/admin/earnings");
}
