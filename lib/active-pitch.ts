import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/auth";
import type { Owner, Pitch } from "@/generated/prisma/client";

export interface OwnerActivePitch {
  owner: Owner;
  pitches: Pitch[];
  activePitch: Pitch | null;
}

/**
 * Resolves which of the owner's pitches the dashboard is currently scoped
 * to. Falls back to (and persists) their oldest pitch if none is set yet or
 * the stored one no longer belongs to them — an owner should never land on
 * an empty dashboard just because activePitchId is stale.
 *
 * Wrapped in React's cache() so the layout and the page it wraps can both
 * call this within the same request for one DB round-trip, not two.
 */
export const getOwnerWithActivePitch = cache(async (): Promise<OwnerActivePitch> => {
  const owner = await requireOwner();
  const pitches = await prisma.pitch.findMany({ where: { ownerId: owner.id }, orderBy: { createdAt: "asc" } });

  let activePitch = pitches.find((p) => p.id === owner.activePitchId) ?? null;
  if (!activePitch && pitches.length > 0) {
    activePitch = pitches[0];
    await prisma.owner.update({ where: { id: owner.id }, data: { activePitchId: activePitch.id } });
  }

  return { owner, pitches, activePitch };
});
