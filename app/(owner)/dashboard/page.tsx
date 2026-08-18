import Link from "next/link";
import {
  Plus,
  MapPinned,
  ImageIcon,
  CalendarCheck2,
  Clock,
  CircleCheckBig,
  ArrowRight,
} from "lucide-react";
import { getOwnerWithActivePitch } from "@/lib/active-pitch";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/shared/Button";
import { StatCard } from "@/components/shared/StatCard";
import { BookingStatusBadge } from "@/components/shared/StatusBadge";
import { formatDateLong, formatTimeRangeShort, toDateStr } from "@/lib/format";
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

  const [statusCounts, photoCount, recentBookings] = await Promise.all([
    prisma.booking.groupBy({ by: ["status"], where: { pitchId: activePitch.id }, _count: { _all: true } }),
    prisma.pitchPhoto.count({ where: { pitchId: activePitch.id } }),
    prisma.booking.findMany({
      where: { pitchId: activePitch.id },
      orderBy: { createdAt: "desc" },
      take: 6,
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

      <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display flex items-center gap-2 text-sm font-bold text-zinc-900">
            <Clock className="size-4 text-emerald-600" />
            Recent bookings
          </h2>
          <Link
            href="/dashboard/bookings"
            className="group flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-800"
          >
            View all
            <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <p className="mt-4 py-6 text-center text-sm text-zinc-500">No bookings yet for this turf.</p>
        ) : (
          <ul className="mt-3 flex flex-col divide-y divide-zinc-100">
            {recentBookings.map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-900">{b.customerName}</p>
                  <p className="mt-0.5 truncate text-xs text-zinc-500">
                    {formatDateLong(toDateStr(b.date))} · {formatTimeRangeShort(b.startTime, b.endTime)}
                  </p>
                </div>
                <div className="shrink-0">
                  <BookingStatusBadge status={b.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
