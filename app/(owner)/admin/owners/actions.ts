"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { OwnerRole } from "@/generated/prisma/client";

export async function toggleAdminRole(ownerId: string): Promise<void> {
  const admin = await requireAdmin();

  if (ownerId === admin.id) {
    throw new Error("You can't change your own admin access.");
  }

  const target = await prisma.owner.findUniqueOrThrow({ where: { id: ownerId } });
  const nextRole = target.role === OwnerRole.ADMIN ? OwnerRole.OWNER : OwnerRole.ADMIN;

  await prisma.owner.update({ where: { id: ownerId }, data: { role: nextRole } });
  revalidatePath("/admin/owners");
}
