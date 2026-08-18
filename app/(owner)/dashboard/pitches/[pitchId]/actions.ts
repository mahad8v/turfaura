"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { PITCH_PHOTOS_BUCKET } from "@/lib/constants";
import { parsePitchForm, firstZodError } from "@/lib/validation/pitch";
import type { PitchFormState } from "@/components/owner/PitchForm";
import type { Owner } from "@/generated/prisma/client";

/** A pitch is accessible if the current actor owns it, or is a platform admin. */
async function getAccessiblePitch(owner: Owner, pitchId: string) {
  const pitch = await prisma.pitch.findFirst({
    where: owner.role === "ADMIN" ? { id: pitchId } : { id: pitchId, ownerId: owner.id },
  });
  if (!pitch) throw new Error("Pitch not found.");
  return pitch;
}

function revalidatePitchPaths(pitchId: string) {
  revalidatePath(`/dashboard/pitches/${pitchId}`);
  revalidatePath("/dashboard");
  revalidatePath("/admin/pitches");
}

export async function updatePitch(
  pitchId: string,
  _prevState: PitchFormState | null,
  formData: FormData,
): Promise<PitchFormState> {
  const owner = await requireOwner();
  await getAccessiblePitch(owner, pitchId);

  const parsed = parsePitchForm(formData);
  if (!parsed.success) return { error: firstZodError(parsed.error) };
  const data = parsed.data;

  await prisma.pitch.update({
    where: { id: pitchId },
    data: {
      name: data.name,
      type: data.type,
      description: data.description || null,
      address: data.address,
      area: data.area,
      lat: data.lat,
      lng: data.lng,
      basePricePerHour: data.basePricePerHour,
      currency: data.currency,
      slotDurationMinutes: data.slotDurationMinutes,
      openTime: data.openTime,
      closeTime: data.closeTime,
    },
  });

  revalidatePitchPaths(pitchId);
  return {};
}

export async function toggleActive(pitchId: string): Promise<void> {
  const owner = await requireOwner();
  const pitch = await getAccessiblePitch(owner, pitchId);
  await prisma.pitch.update({ where: { id: pitchId }, data: { isActive: !pitch.isActive } });
  revalidatePitchPaths(pitchId);
}

export async function addPhotoRecord(pitchId: string, storagePath: string): Promise<void> {
  const owner = await requireOwner();
  await getAccessiblePitch(owner, pitchId);

  if (!storagePath.startsWith(`${owner.supabaseUserId}/${pitchId}/`)) {
    throw new Error("Invalid photo path.");
  }

  const count = await prisma.pitchPhoto.count({ where: { pitchId } });
  await prisma.pitchPhoto.create({ data: { pitchId, storagePath, sortOrder: count } });
  revalidatePitchPaths(pitchId);
}

export async function deletePhoto(photoId: string): Promise<void> {
  const owner = await requireOwner();
  const photo = await prisma.pitchPhoto.findUnique({ where: { id: photoId }, include: { pitch: true } });
  if (!photo || (owner.role !== "ADMIN" && photo.pitch.ownerId !== owner.id)) {
    throw new Error("Photo not found.");
  }

  const admin = createAdminClient();
  await admin.storage.from(PITCH_PHOTOS_BUCKET).remove([photo.storagePath]);
  await prisma.pitchPhoto.delete({ where: { id: photoId } });

  revalidatePitchPaths(photo.pitchId);
}

export async function addBlockedSlot(pitchId: string, formData: FormData): Promise<void> {
  const owner = await requireOwner();
  await getAccessiblePitch(owner, pitchId);

  const date = String(formData.get("date") ?? "");
  const startTime = String(formData.get("startTime") ?? "") || "00:00";
  const endTime = String(formData.get("endTime") ?? "").trim() || null;
  const reason = String(formData.get("reason") ?? "").trim() || null;

  if (!date) throw new Error("Date is required.");

  await prisma.blockedSlot.create({
    data: { pitchId, date: new Date(`${date}T00:00:00.000Z`), startTime, endTime, reason },
  });

  revalidatePitchPaths(pitchId);
}

export async function removeBlockedSlot(blockedSlotId: string): Promise<void> {
  const owner = await requireOwner();
  const slot = await prisma.blockedSlot.findUnique({ where: { id: blockedSlotId }, include: { pitch: true } });
  if (!slot || (owner.role !== "ADMIN" && slot.pitch.ownerId !== owner.id)) {
    throw new Error("Blocked slot not found.");
  }

  await prisma.blockedSlot.delete({ where: { id: blockedSlotId } });
  revalidatePitchPaths(slot.pitchId);
}

/**
 * Toggles a single weekly-recurring slot for a regular group's standing time
 * — creates it if it's currently open, deletes it if it's already blocked.
 */
export async function toggleRecurringBlockedSlot(
  pitchId: string,
  dayOfWeek: number,
  startTime: string,
  endTime: string,
): Promise<void> {
  const owner = await requireOwner();
  await getAccessiblePitch(owner, pitchId);

  if (dayOfWeek < 0 || dayOfWeek > 6) throw new Error("Invalid day of week.");

  const existing = await prisma.recurringBlockedSlot.findUnique({
    where: { pitchId_dayOfWeek_startTime: { pitchId, dayOfWeek, startTime } },
  });

  if (existing) {
    await prisma.recurringBlockedSlot.delete({ where: { id: existing.id } });
  } else {
    await prisma.recurringBlockedSlot.create({ data: { pitchId, dayOfWeek, startTime, endTime } });
  }

  revalidatePitchPaths(pitchId);
}
