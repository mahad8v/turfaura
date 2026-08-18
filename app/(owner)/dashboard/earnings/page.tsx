import { Wallet, CircleCheckBig, Calculator, Clock, MapPinned, TrendingUp, Receipt } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getOwnerWithActivePitch } from "@/lib/active-pitch";
import { Money } from "@/components/shared/Money";
import { StatCard } from "@/components/shared/StatCard";
import { RevenueChart, type RevenuePoint } from "@/components/owner/RevenueChart";
import { BookingStatusBadge } from "@/components/shared/StatusBadge";
import { formatDateLong, formatDateShort, formatMoney, toDateStr } from "@/lib/format";
import { BookingStatus } from "@/generated/prisma/client";

export default async function EarningsPage() {
  const { activePitch } = await getOwnerWithActivePitch();

  if (!activePitch) {
    return (
      <div>
        <h1 className="font-display text-xl font-bold text-zinc-900">Earnings</h1>
        <div className="mt-6 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-zinc-300 bg-white py-14 text-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
            <MapPinned className="size-5" strokeWidth={1.75} />
          </span>
          <p className="text-sm text-zinc-500">Add a turf to start tracking earnings.</p>
        </div>
      </div>
    );
  }

  const [confirmedBookings, pendingAgg] = await Promise.all([
    prisma.booking.findMany({
      where: { pitchId: activePitch.id, status: BookingStatus.CONFIRMED },
      select: {
        id: true,
        reference: true,
        customerName: true,
        date: true,
        startTime: true,
        endTime: true,
        totalPrice: true,
        status: true,
      },
      orderBy: { date: "desc" },
    }),
    prisma.booking.aggregate({
      where: { pitchId: activePitch.id, status: BookingStatus.PENDING },
      _sum: { totalPrice: true },
      _count: { _all: true },
    }),
  ]);

  const totalValue = confirmedBookings.reduce((sum, b) => sum + b.totalPrice.toNumber(), 0);
  const avgValue = confirmedBookings.length > 0 ? totalValue / confirmedBookings.length : 0;
  const pendingValue = pendingAgg._sum.totalPrice?.toNumber() ?? 0;
  const pendingCount = pendingAgg._count._all;

  // Revenue by day, most recent 14 days that actually had confirmed revenue —
  // sparse on purpose rather than filling every empty calendar day.
  const byDate = new Map<string, number>();
  for (const b of confirmedBookings) {
    const key = toDateStr(b.date);
    byDate.set(key, (byDate.get(key) ?? 0) + b.totalPrice.toNumber());
  }
  const chartPoints: RevenuePoint[] = [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14)
    .map(([dateStr, value]) => ({
      key: dateStr,
      label: new Date(`${dateStr}T00:00:00.000Z`).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      }),
      value,
    }));

  const transactions = confirmedBookings.slice(0, 25);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
        <div>
          <h1 className="font-display text-xl font-bold text-zinc-900">Earnings</h1>
          <p className="mt-1 text-sm text-zinc-500">{activePitch.name} · Financial report</p>
        </div>
        <p className="text-xs text-zinc-400">As of {formatDateLong(toDateStr(new Date()))}</p>
      </div>
      <p className="mt-2 max-w-2xl text-xs text-zinc-400">
        Customers pay cash at the pitch after playing — these figures reflect what&apos;s expected from confirmed
        bookings, not money already collected.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard icon={Wallet} label="Total revenue" value={formatMoney(totalValue, activePitch.currency)} />
        <StatCard icon={CircleCheckBig} label="Confirmed bookings" value={String(confirmedBookings.length)} />
        <StatCard icon={Calculator} label="Average per booking" value={formatMoney(avgValue, activePitch.currency)} />
        <StatCard
          icon={Clock}
          label="Pending"
          value={formatMoney(pendingValue, activePitch.currency)}
          hint={pendingCount > 0 ? `${pendingCount} awaiting approval` : "Nothing awaiting approval"}
          accent="amber"
        />
      </div>

      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5">
        <h2 className="font-display flex items-center gap-2 text-sm font-bold text-zinc-900">
          <TrendingUp className="size-4 text-emerald-600" />
          Revenue trend
        </h2>
        <p className="mt-0.5 text-xs text-zinc-400">Confirmed revenue on the days it was earned.</p>

        {chartPoints.length > 0 ? (
          <div className="mt-5">
            <RevenueChart points={chartPoints} currency={activePitch.currency} />
          </div>
        ) : (
          <p className="mt-6 py-6 text-center text-sm text-zinc-500">No confirmed revenue yet.</p>
        )}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <div className="flex items-center gap-2 p-5 pb-0">
          <Receipt className="size-4 text-emerald-600" />
          <h2 className="font-display text-sm font-bold text-zinc-900">Transactions</h2>
        </div>

        {transactions.length === 0 ? (
          <p className="p-5 text-center text-sm text-zinc-500">No confirmed bookings yet.</p>
        ) : (
          <>
            {/* Mobile: stacked rows. */}
            <div className="mt-3 flex flex-col divide-y divide-zinc-100 sm:hidden">
              {transactions.map((b) => (
                <div key={b.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-900">{b.customerName}</p>
                    <p className="mt-0.5 truncate text-xs text-zinc-500">
                      {formatDateShort(toDateStr(b.date))} · {b.reference}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold tabular-nums text-zinc-900">
                    <Money amount={b.totalPrice.toString()} currency={activePitch.currency} />
                  </p>
                </div>
              ))}
            </div>

            {/* Desktop/tablet: full table. */}
            <div className="mt-3 hidden overflow-x-auto sm:block">
              <table className="min-w-full divide-y divide-zinc-100 text-sm">
                <thead>
                  <tr className="bg-zinc-50/80 text-left text-xs font-medium uppercase tracking-wide text-zinc-400">
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Reference</th>
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {transactions.map((b) => (
                    <tr key={b.id} className="transition-colors hover:bg-zinc-50/60">
                      <td className="whitespace-nowrap px-5 py-3.5 text-zinc-700">{formatDateShort(toDateStr(b.date))}</td>
                      <td className="whitespace-nowrap px-5 py-3.5 font-mono text-xs text-zinc-500">{b.reference}</td>
                      <td className="px-5 py-3.5 text-zinc-900">{b.customerName}</td>
                      <td className="px-5 py-3.5">
                        <BookingStatusBadge status={b.status} />
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-right font-semibold tabular-nums text-zinc-900">
                        <Money amount={b.totalPrice.toString()} currency={activePitch.currency} />
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-zinc-200 bg-zinc-50/60">
                    <td colSpan={4} className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      Total
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-right font-display font-bold tabular-nums text-zinc-900">
                      <Money amount={totalValue} currency={activePitch.currency} />
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </>
        )}
        <div className="h-5 sm:hidden" />
      </div>
    </div>
  );
}
