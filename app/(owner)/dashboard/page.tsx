import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  MapPinned,
  ImageOff,
  ImageIcon,
  CalendarCheck2,
  Ban,
  Clock,
  CircleCheckBig,
  ChevronRight,
  Settings,
} from "lucide-react";
import { getOwnerWithActivePitch } from "@/lib/active-pitch";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/shared/Button";
import { Money } from "@/components/shared/Money";
import { StatCard } from "@/components/shared/StatCard";
import { getPitchPhotoUrl } from "@/lib/storage";
import { BookingStatus } from "@/generated/prisma/client";

export default async function DashboardPage() {
  const { owner, pitches, activePitch } = await getOwnerWithActivePitch();

  if (!activePitch) {
    return (
      <div>
        <h1 className="font-display text-xl font-bold text-zinc-900">Welcome back, {owner.name.split(" ")[0]}</h1>
        <p className="mt-0.5 text-sm text-zinc-500">Add your first turf to get started.</p>
        <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <MapPinned className="size-6" strokeWidth={1.75} />
          </span>
          <p className="text-sm text-zinc-500">You haven&apos;t added any turfs yet.</p>
          <Link href="/dashboard/pitches/new">
            <Button icon={<Plus className="size-4" />}>Add your first turf</Button>
          </Link>
        </div>
      </div>
    );
  }

  const [statusCounts, photoCount, firstPhoto] = await Promise.all([
    prisma.booking.groupBy({ by: ["status"], where: { pitchId: activePitch.id }, _count: { _all: true } }),
    prisma.pitchPhoto.count({ where: { pitchId: activePitch.id } }),
    prisma.pitchPhoto.findFirst({
      where: { pitchId: activePitch.id },
      orderBy: { sortOrder: "asc" },
      select: { storagePath: true },
    }),
  ]);

  const countFor = (status: BookingStatus) => statusCounts.find((s) => s.status === status)?._count._all ?? 0;
  const totalBookings = statusCounts.reduce((sum, s) => sum + s._count._all, 0);
  const needsAttention = countFor(BookingStatus.PENDING);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-bold text-zinc-900">Welcome back, {owner.name.split(" ")[0]}</h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            Managing <span className="font-medium text-zinc-700">{activePitch.name}</span>
            {pitches.length > 1 && (
              <>
                {" "}
                ·{" "}
                <Link href="/dashboard/settings" className="text-emerald-700 hover:text-emerald-800">
                  switch turf
                </Link>
              </>
            )}
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard icon={CalendarCheck2} label="Total bookings" value={String(totalBookings)} />
        <StatCard icon={CircleCheckBig} label="Confirmed" value={String(countFor(BookingStatus.CONFIRMED))} />
        <StatCard
          icon={Clock}
          label="Needs attention"
          value={String(needsAttention)}
          hint={needsAttention > 0 ? "Awaiting your approval" : "You're all caught up"}
          accent={needsAttention > 0 ? "amber" : "emerald"}
        />
        <StatCard icon={ImageIcon} label="Photos" value={String(photoCount)} />
      </div>

      <h2 className="font-display mt-8 text-sm font-bold text-zinc-900">This turf</h2>
      <Link
        href={`/dashboard/pitches/${activePitch.id}`}
        className="group mt-3 flex max-w-2xl items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-3 transition-all duration-150 active:scale-[0.98] active:bg-zinc-50 sm:hover:-translate-y-0.5 sm:hover:border-zinc-300"
      >
        <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
          {firstPhoto ? (
            <Image
              src={getPitchPhotoUrl(firstPhoto.storagePath)}
              alt=""
              fill
              className="object-cover"
              sizes="64px"
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center text-zinc-300">
              <ImageOff className="size-5" strokeWidth={1.5} />
            </div>
          )}
          {!activePitch.isActive && (
            <span className="absolute inset-0 flex items-center justify-center bg-black/45">
              <Ban className="size-4 text-white" />
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate font-display font-semibold text-zinc-900 group-hover:text-emerald-700">
              {activePitch.name}
            </h3>
            {!activePitch.isActive && (
              <span className="shrink-0 rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500">
                Inactive
              </span>
            )}
          </div>
          <p className="truncate text-xs text-zinc-500">{activePitch.address}</p>
          <p className="mt-1 text-xs font-medium text-zinc-700">
            <Money amount={activePitch.basePricePerHour.toString()} currency={activePitch.currency} />
            <span className="font-normal text-zinc-400"> /hr · tap to manage</span>
          </p>
        </div>

        <ChevronRight className="size-4 shrink-0 text-zinc-300 transition-transform group-hover:translate-x-0.5" />
      </Link>

      {pitches.length > 1 && (
        <Link
          href="/dashboard/settings"
          className="mt-3 flex max-w-2xl items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-700"
        >
          <Settings className="size-3.5" />
          You have {pitches.length} turfs — switch which one you&apos;re managing in Settings
        </Link>
      )}
    </div>
  );
}
