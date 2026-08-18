import { Users, MapPinned, CalendarCheck, Wallet, Clock, HandCoins, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Money } from "@/components/shared/Money";
import { StatCard } from "@/components/shared/StatCard";
import { BookingStatusBadge } from "@/components/shared/StatusBadge";
import { BookingStatus } from "@/generated/prisma/client";

export default async function AdminOverviewPage() {
  const [ownerCount, pitchCount, statusCounts, confirmedValue] = await Promise.all([
    prisma.owner.count({ where: { role: "OWNER" } }),
    prisma.pitch.count(),
    prisma.booking.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.booking.groupBy({
      by: ["currency"],
      where: { status: BookingStatus.CONFIRMED },
      _sum: { totalPrice: true },
      _count: { _all: true },
    }),
  ]);

  const countFor = (status: BookingStatus) => statusCounts.find((s) => s.status === status)?._count._all ?? 0;
  const totalBookings = statusCounts.reduce((sum, s) => sum + s._count._all, 0);

  return (
    <div>
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-zinc-900 via-indigo-950 to-zinc-950 px-5 py-8 shadow-xl sm:px-8 sm:py-10">
        <div className="bg-hero-dots absolute inset-0 opacity-20" />
        <div className="pointer-events-none absolute -top-16 right-0 size-72 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="relative">
          <span className="animate-fade-in-up inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-indigo-200 ring-1 ring-inset ring-white/20">
            <ShieldCheck className="size-3.5" />
            Admin access
          </span>
          <h1 className="animate-fade-in-up font-display mt-4 text-2xl font-extrabold tracking-tight text-white sm:text-3xl [animation-delay:80ms]">
            Platform overview
          </h1>
          <p className="animate-fade-in-up mt-2 max-w-md text-sm text-indigo-100/70 [animation-delay:150ms]">
            A read-only view across every owner on TurfAura.
          </p>
        </div>
      </div>

      <div className="relative z-10 -mt-8 grid gap-4 px-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Pitch owners" value={String(ownerCount)} accent="indigo" />
        <StatCard icon={MapPinned} label="Pitches listed" value={String(pitchCount)} accent="indigo" />
        <StatCard icon={CalendarCheck} label="Total bookings" value={String(totalBookings)} accent="indigo" />
        <StatCard
          icon={Clock}
          label="Needs attention"
          value={String(countFor(BookingStatus.PENDING))}
          hint="Awaiting owner approval"
          accent="indigo"
        />
      </div>

      <h2 className="font-display mt-8 text-sm font-bold text-zinc-900">Bookings by status</h2>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(
          [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.CANCELLED, BookingStatus.EXPIRED] as const
        ).map((status) => (
          <div
            key={status}
            className="flex flex-col items-center gap-2 rounded-2xl border border-zinc-200 bg-white p-4 text-center shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md"
          >
            <p className="font-display text-2xl font-extrabold tracking-tight text-zinc-900">{countFor(status)}</p>
            <BookingStatusBadge status={status} />
          </div>
        ))}
      </div>

      <h2 className="font-display mt-8 flex items-center gap-2 text-sm font-bold text-zinc-900">
        <HandCoins className="size-4 text-indigo-600" />
        Confirmed cash value across the platform
      </h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {confirmedValue.map((row) => (
          <div
            key={row.currency}
            className="group rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-transform duration-200 group-hover:scale-105">
              <Wallet className="size-4.5" strokeWidth={2.25} />
            </span>
            <p className="mt-3.5 text-sm text-zinc-500">{row.currency}</p>
            <p className="font-display mt-0.5 text-2xl font-extrabold tracking-tight text-zinc-900">
              <Money amount={row._sum.totalPrice?.toString() ?? "0"} currency={row.currency} />
            </p>
            <p className="mt-1 text-xs text-zinc-400">{row._count._all} confirmed bookings, paid in cash at the pitch</p>
          </div>
        ))}
        {confirmedValue.length === 0 && (
          <p className="col-span-full rounded-2xl border border-dashed border-zinc-300 bg-white py-8 text-center text-sm text-zinc-500">
            No confirmed bookings on the platform yet.
          </p>
        )}
      </div>
    </div>
  );
}
