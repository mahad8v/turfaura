import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  MapPinned,
  ImageOff,
  CalendarCheck2,
  Ban,
  LayoutGrid,
  Clock,
  CircleCheckBig,
  ChevronRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/shared/Button";
import { Money } from "@/components/shared/Money";
import { StatCard } from "@/components/shared/StatCard";
import { getPitchPhotoUrl } from "@/lib/storage";
import { BookingStatus } from "@/generated/prisma/client";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const owner = await prisma.owner.findUniqueOrThrow({ where: { supabaseUserId: user!.id } });
  const [pitches, statusCounts] = await Promise.all([
    prisma.pitch.findMany({
      where: { ownerId: owner.id },
      include: {
        _count: { select: { bookings: true } },
        photos: { take: 1, orderBy: { sortOrder: "asc" }, select: { storagePath: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.booking.groupBy({
      by: ["status"],
      where: { pitch: { ownerId: owner.id } },
      _count: { _all: true },
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
          <p className="mt-0.5 text-sm text-zinc-500">Here&apos;s how your pitches are doing.</p>
        </div>
        <Link href="/dashboard/pitches/new" className="hidden sm:block">
          <Button icon={<Plus className="size-4" />}>Add a pitch</Button>
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard icon={LayoutGrid} label="Pitches listed" value={String(pitches.length)} />
        <StatCard icon={CalendarCheck2} label="Total bookings" value={String(totalBookings)} />
        <StatCard icon={CircleCheckBig} label="Confirmed" value={String(countFor(BookingStatus.CONFIRMED))} />
        <StatCard
          icon={Clock}
          label="Needs attention"
          value={String(needsAttention)}
          hint={needsAttention > 0 ? "Awaiting your approval" : "You're all caught up"}
          accent={needsAttention > 0 ? "amber" : "emerald"}
        />
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="font-display text-sm font-bold text-zinc-900">Your pitches</h2>
        <span className="text-xs text-zinc-400">
          {pitches.length} pitch{pitches.length === 1 ? "" : "es"}
        </span>
      </div>

      {pitches.length === 0 ? (
        <div className="mt-4 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <MapPinned className="size-6" strokeWidth={1.75} />
          </span>
          <p className="text-sm text-zinc-500">You haven&apos;t added any pitches yet.</p>
          <Link href="/dashboard/pitches/new">
            <Button icon={<Plus className="size-4" />}>Add your first pitch</Button>
          </Link>
        </div>
      ) : (
        <div className="mt-4 flex max-w-2xl flex-col gap-2.5">
          {pitches.map((pitch) => {
            const photo = pitch.photos[0];
            return (
              <Link
                key={pitch.id}
                href={`/dashboard/pitches/${pitch.id}`}
                className="group flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm transition-all duration-150 active:scale-[0.98] active:bg-zinc-50 sm:hover:-translate-y-0.5 sm:hover:border-zinc-300 sm:hover:shadow-md"
              >
                <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
                  {photo ? (
                    <Image
                      src={getPitchPhotoUrl(photo.storagePath)}
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
                  {!pitch.isActive && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/45">
                      <Ban className="size-4 text-white" />
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="truncate font-display font-semibold text-zinc-900 group-hover:text-emerald-700">
                      {pitch.name}
                    </h3>
                    {!pitch.isActive && (
                      <span className="shrink-0 rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs text-zinc-500">{pitch.address}</p>
                  <div className="mt-1 flex items-center gap-3 text-xs text-zinc-400">
                    <span className="font-medium text-zinc-700">
                      <Money amount={pitch.basePricePerHour.toString()} currency={pitch.currency} />
                      <span className="font-normal text-zinc-400"> /hr</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarCheck2 className="size-3" />
                      {pitch._count.bookings}
                    </span>
                  </div>
                </div>

                <ChevronRight className="size-4 shrink-0 text-zinc-300 transition-transform group-hover:translate-x-0.5" />
              </Link>
            );
          })}
        </div>
      )}

      {/* Mobile: floating action button — the header's "Add a pitch" button is hidden below sm. */}
      <Link
        href="/dashboard/pitches/new"
        aria-label="Add a pitch"
        className="fixed right-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-40 flex size-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/35 transition-transform active:scale-90 sm:hidden"
      >
        <Plus className="size-6" strokeWidth={2.5} />
      </Link>
    </div>
  );
}
