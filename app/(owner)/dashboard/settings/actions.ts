"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/auth";
import { buildTelegramConnectUrl, generateTelegramLinkToken, isTelegramConfigured } from "@/lib/telegram";

export interface SettingsFormState {
  error?: string;
  success?: boolean;
}

export async function updateSettings(
  _prevState: SettingsFormState | null,
  formData: FormData,
): Promise<SettingsFormState> {
  const owner = await requireOwner();

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim() || null;

  if (!name) return { error: "Name is required." };

  await prisma.owner.update({
    where: { id: owner.id },
    data: { name, phone },
  });

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/settings/profile");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function getTelegramConnectUrl(): Promise<string> {
  const owner = await requireOwner();
  if (!isTelegramConfigured()) throw new Error("Telegram notifications aren't configured on this server.");

  const token = generateTelegramLinkToken();
  await prisma.owner.update({ where: { id: owner.id }, data: { telegramLinkToken: token } });
  return buildTelegramConnectUrl(token);
}

export async function disconnectTelegram(): Promise<void> {
  const owner = await requireOwner();
  await prisma.owner.update({ where: { id: owner.id }, data: { telegramChatId: null, telegramLinkToken: null } });
  revalidatePath("/dashboard/settings");
}

/** Switches which turf the dashboard is scoped to. */
export async function setActivePitch(pitchId: string): Promise<void> {
  const owner = await requireOwner();
  const pitch = await prisma.pitch.findFirst({ where: { id: pitchId, ownerId: owner.id }, select: { id: true } });
  if (!pitch) throw new Error("That turf isn't on your account.");

  await prisma.owner.update({ where: { id: owner.id }, data: { activePitchId: pitchId } });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/bookings");
  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard/earnings");
}
