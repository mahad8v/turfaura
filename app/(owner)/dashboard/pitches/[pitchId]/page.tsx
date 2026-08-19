import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowRight,
  ChevronLeft,
  ShieldUser,
  Ban,
  CircleCheck,
} from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { requireOwner } from '@/lib/auth';
import { PitchForm } from '@/components/owner/PitchForm';
import { PhotoManager } from '@/components/owner/PhotoManager';
import { BlockedSlotManager } from '@/components/owner/BlockedSlotManager';
import { ToggleButton } from '@/components/shared/ToggleButton';
import { toWallClock } from '@/lib/time';
import {
  updatePitch,
  toggleActive,
  addPhotoRecord,
  deletePhoto,
  addBlockedSlot,
  removeBlockedSlot,
  toggleRecurringBlockedSlot,
} from './actions';

export default async function EditPitchPage({
  params,
}: {
  params: Promise<{ pitchId: string }>;
}) {
  const { pitchId } = await params;
  const owner = await requireOwner();
  const isAdmin = owner.role === 'ADMIN';

  const pitch = await prisma.pitch.findFirst({
    where: isAdmin ? { id: pitchId } : { id: pitchId, ownerId: owner.id },
    include: {
      owner: { select: { name: true } },
      photos: { orderBy: { sortOrder: 'asc' } },
      blockedSlots: { orderBy: { date: 'asc' } },
      recurringBlockedSlots: { orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }] },
    },
  });

  if (!pitch) notFound();

  const editingSomeoneElses = isAdmin && pitch.ownerId !== owner.id;
  const bookingsHref = isAdmin
    ? `/admin/bookings?pitchId=${pitch.id}`
    : `/dashboard/bookings?pitchId=${pitch.id}`;
  const backHref = editingSomeoneElses ? '/admin/pitches' : '/dashboard';

  return (
    <div className="max-w-2xl">
      <Link
        href={backHref}
        className="mb-3 inline-flex items-center gap-0.5 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-700"
      >
        <ChevronLeft className="size-4" />
        Pitches
      </Link>

      {editingSomeoneElses && (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm text-indigo-700">
          <ShieldUser className="size-4 shrink-0" />
          Editing as admin — this pitch belongs to{' '}
          <span className="font-medium">{pitch.owner.name}</span>.
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display truncate text-xl font-bold text-zinc-900">
            {pitch.name}
          </h1>
          <Link
            href={bookingsHref}
            className="group mt-1 inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:text-emerald-800"
          >
            View bookings for this pitch
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        <ToggleButton
          id={pitch.id}
          active={pitch.isActive}
          onLabel="Activate"
          offLabel="Deactivate"
          onIcon={<CircleCheck className="size-3.5" />}
          offIcon={<Ban className="size-3.5" />}
          action={toggleActive}
        />
      </div>

      <div className="mt-6">
        <PitchForm
          action={updatePitch.bind(null, pitch.id)}
          submitLabel="Save changes"
          defaults={{
            name: pitch.name,
            type: pitch.type,
            description: pitch.description ?? undefined,
            address: pitch.address,
            area: pitch.area,
            lat: pitch.lat,
            lng: pitch.lng,
            basePricePerHour: pitch.basePricePerHour.toString(),
            currency: pitch.currency,
            slotDurationMinutes: pitch.slotDurationMinutes,
            openTime: pitch.openTime,
            // The stored value may be in extended (>24:00) notation for an
            // overnight pitch (see lib/time.ts) — a native <input
            // type="time"> only accepts 00:00-23:59, so normalize it back
            // for the form; parsePitchForm re-extends it on save if needed.
            closeTime: toWallClock(pitch.closeTime),
          }}
        />
      </div>

      <div className="mt-5">
        <PhotoManager
          pitchId={pitch.id}
          supabaseUserId={owner.supabaseUserId}
          photos={pitch.photos}
          addPhotoRecord={addPhotoRecord}
          deletePhoto={deletePhoto}
        />
      </div>

      <div className="mt-5">
        <BlockedSlotManager
          pitchId={pitch.id}
          openTime={pitch.openTime}
          closeTime={pitch.closeTime}
          slotDurationMinutes={pitch.slotDurationMinutes}
          blockedSlots={pitch.blockedSlots.map((s) => ({
            id: s.id,
            date: s.date.toISOString().slice(0, 10),
            startTime: s.startTime,
            endTime: s.endTime,
            reason: s.reason,
          }))}
          recurringBlockedSlots={pitch.recurringBlockedSlots}
          addBlockedSlot={addBlockedSlot}
          removeBlockedSlot={removeBlockedSlot}
          toggleRecurringBlockedSlot={toggleRecurringBlockedSlot}
        />
      </div>
    </div>
  );
}
