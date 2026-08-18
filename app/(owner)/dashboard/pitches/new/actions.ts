"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/auth";
import { parsePitchForm, firstZodError } from "@/lib/validation/pitch";
import { slugify } from "@/lib/slug";
import type { PitchFormState } from "@/components/owner/PitchForm";

async function uniqueSlugFor(name: string): Promise<string> {
  const base = slugify(name);
  let slug = base;
  let suffix = 1;
  while (await prisma.pitch.findUnique({ where: { slug }, select: { id: true } })) {
    suffix += 1;
    slug = `${base}-${suffix}`;
  }
  return slug;
}

export async function createPitch(_prevState: PitchFormState | null, formData: FormData): Promise<PitchFormState> {
  const owner = await requireOwner();

  const parsed = parsePitchForm(formData);
  if (!parsed.success) return { error: firstZodError(parsed.error) };
  const data = parsed.data;

  const slug = await uniqueSlugFor(data.name);

  const pitch = await prisma.pitch.create({
    data: {
      ownerId: owner.id,
      name: data.name,
      slug,
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

  // A freshly created turf becomes the one the dashboard is scoped to —
  // same "switch into what you just made" behavior as adding a new store.
  await prisma.owner.update({ where: { id: owner.id }, data: { activePitchId: pitch.id } });

  redirect(`/dashboard/pitches/${pitch.id}`);
}
