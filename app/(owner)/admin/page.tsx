import Link from 'next/link';
import {
  Users,
  CalendarCheck,
  Clock,
  HandCoins,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { Money } from '@/components/shared/Money';
import { StatCard } from '@/components/shared/StatCard';
import { StatusDistributionBar } from '@/components/shared/StatusDistributionBar';
import { BookingStatusBadge } from '@/components/shared/StatusBadge';
import { formatDateLong, formatTimeRangeShort } from '@/lib/format';
import { BookingStatus } from '@/generated/prisma/client';

export default async function AdminOverviewPage() {
  const [ownerCount, statusCounts, confirmedValue, recentBookings] =
    await Promise.all([
      prisma.owner.count({ where: { role: 'OWNER' } }),
      prisma.booking.groupBy({ by: ['status'], _count: { _all: true } }),
      prisma.booking.groupBy({
        by: ['currency'],
        where: { status: BookingStatus.CONFIRMED },
        _sum: { totalPrice: true },
        _count: { _all: true },
      }),
      prisma.booking.findMany({
        orderBy: { createdAt: 'desc' },
        take: 6,
        include: { pitch: { select: { name: true } } },
      }),
    ]);

  const countFor = (status: BookingStatus) =>
    statusCounts.find((s) => s.status === status)?._count._all ?? 0;
  const totalBookings = statusCounts.reduce((sum, s) => sum + s._count._all, 0);

  const statusOrder = [
    BookingStatus.PENDING,
    BookingStatus.CONFIRMED,
    BookingStatus.CANCELLED,
    BookingStatus.EXPIRED,
  ] as const;

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

      <div className="animate-fade-in-up relative z-10 -mt-8 grid gap-4 px-1 sm:grid-cols-3 [animation-delay:200ms]">
        <StatCard
          icon={Users}
          label="Pitch owners"
          value={String(ownerCount)}
          accent="indigo"
        />
        <StatCard
          icon={CalendarCheck}
          label="Total bookings"
          value={String(totalBookings)}
          accent="indigo"
        />
        <StatCard
          icon={Clock}
          label="Needs attention"
          value={String(countFor(BookingStatus.PENDING))}
          hint="Awaiting owner approval"
          accent="indigo"
        />
      </div>

      <div className="animate-fade-in-up mt-6 grid gap-4 lg:grid-cols-5 [animation-delay:260ms]">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 lg:col-span-3">
          <h2 className="font-display flex items-center gap-2 text-sm font-bold text-zinc-900">
            <TrendingUp className="size-4 text-indigo-600" />
            Bookings by status
          </h2>
          <div className="mt-4">
            <StatusDistributionBar
              counts={statusOrder.map((status) => ({
                status,
                count: countFor(status),
              }))}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-linear-to-br from-emerald-50/70 to-white p-5 lg:col-span-2">
          <div className="flex items-start justify-between gap-2">
            <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm shadow-emerald-600/30">
              <HandCoins className="size-4.5" strokeWidth={2.25} />
            </span>
            <Link
              href="/admin/earnings"
              className="group flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"
            >
              Full report
              <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <p className="mt-3.5 text-sm text-zinc-500">Confirmed cash value</p>
          {confirmedValue.length > 0 ? (
            <div className="mt-1 flex flex-col gap-2">
              {confirmedValue.map((row) => (
                <div
                  key={row.currency}
                  className="flex items-baseline justify-between gap-2"
                >
                  <p className="font-display text-2xl font-extrabold tracking-tight text-zinc-900">
                    <Money
                      amount={row._sum.totalPrice?.toString() ?? '0'}
                      currency={row.currency}
                    />
                  </p>
                  <p className="shrink-0 text-xs text-zinc-400">
                    {row._count._all} bookings
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="font-display mt-1 text-2xl font-extrabold tracking-tight text-zinc-300">
              —
            </p>
          )}
          <p className="mt-2 text-xs text-zinc-400">
            Paid in cash at the pitch, across every owner.
          </p>
        </div>
      </div>

      <div className="animate-fade-in-up mt-6 rounded-2xl border border-zinc-200 bg-white p-5 [animation-delay:320ms]">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display flex items-center gap-2 text-sm font-bold text-zinc-900">
            <Clock className="size-4 text-indigo-600" />
            Recent bookings
          </h2>
          <Link
            href="/admin/bookings"
            className="group flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"
          >
            View all
            <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <p className="mt-4 py-6 text-center text-sm text-zinc-500">
            No bookings on the platform yet.
          </p>
        ) : (
          <ul className="mt-3 flex flex-col divide-y divide-zinc-100">
            {recentBookings.map((b) => (
              <li
                key={b.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-900">
                    {b.pitch.name}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-zinc-500">
                    {b.customerName} ·{' '}
                    {formatDateLong(b.date.toISOString().slice(0, 10))} ·{' '}
                    {formatTimeRangeShort(b.startTime, b.endTime)}
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
