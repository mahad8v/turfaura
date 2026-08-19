import { Wallet, CircleCheckBig, Calculator, Clock, TrendingUp, Receipt, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Money } from "@/components/shared/Money";
import { StatCard } from "@/components/shared/StatCard";
import { RevenueChart, type RevenuePoint } from "@/components/owner/RevenueChart";
import { BookingStatusBadge } from "@/components/shared/StatusBadge";
import { formatDateLong, formatDateShort, formatMoney, toDateStr } from "@/lib/format";
import { BookingStatus } from "@/generated/prisma/client";

interface ConfirmedRow {
  id: string;
  reference: string;
  customerName: string;
  date: Date;
  startTime: string;
  endTime: string;
  totalPrice: { toNumber(): number };
  currency: string;
  status: BookingStatus;
  pitch: { name: string; owner: { id: string; name: string } };
}

function currencyReport(currency: string, rows: ConfirmedRow[]) {
  const totalValue = rows.reduce((sum, b) => sum + b.totalPrice.toNumber(), 0);
  const avgValue = rows.length > 0 ? totalValue / rows.length : 0;

  const byDate = new Map<string, number>();
  for (const b of rows) {
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

  const byOwner = new Map<string, { name: string; revenue: number; count: number }>();
  for (const b of rows) {
    const entry = byOwner.get(b.pitch.owner.id) ?? { name: b.pitch.owner.name, revenue: 0, count: 0 };
    entry.revenue += b.totalPrice.toNumber();
    entry.count += 1;
    byOwner.set(b.pitch.owner.id, entry);
  }
  const ownerBreakdown = [...byOwner.values()].sort((a, b) => b.revenue - a.revenue);

  return {
    currency,
    totalValue,
    avgValue,
    confirmedCount: rows.length,
    chartPoints,
    ownerBreakdown,
    transactions: rows.slice(0, 25),
  };
}

export default async function AdminEarningsPage() {
  const [confirmedBookings, pendingByCurrency] = await Promise.all([
    prisma.booking.findMany({
      where: { status: BookingStatus.CONFIRMED },
      select: {
        id: true,
        reference: true,
        customerName: true,
        date: true,
        startTime: true,
        endTime: true,
        totalPrice: true,
        currency: true,
        status: true,
        pitch: { select: { name: true, owner: { select: { id: true, name: true } } } },
      },
      orderBy: { date: "desc" },
    }),
    prisma.booking.groupBy({
      by: ["currency"],
      where: { status: BookingStatus.PENDING },
      _sum: { totalPrice: true },
      _count: { _all: true },
    }),
  ]);

  const byCurrency = new Map<string, ConfirmedRow[]>();
  for (const b of confirmedBookings) {
    const list = byCurrency.get(b.currency) ?? [];
    list.push(b);
    byCurrency.set(b.currency, list);
  }
  // A currency with only pending (no confirmed yet) bookings still gets a report.
  for (const p of pendingByCurrency) {
    if (!byCurrency.has(p.currency)) byCurrency.set(p.currency, []);
  }

  const reports = [...byCurrency.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([currency, rows]) => currencyReport(currency, rows));

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
        <div>
          <h1 className="font-display text-xl font-bold text-zinc-900">Earnings</h1>
          <p className="mt-1 text-sm text-zinc-500">Platform-wide financial report, across every owner.</p>
        </div>
        <p className="text-xs text-zinc-400">As of {formatDateLong(toDateStr(new Date()))}</p>
      </div>
      <p className="mt-2 max-w-2xl text-xs text-zinc-400">
        Customers pay cash at the pitch after playing — these figures reflect what&apos;s expected from confirmed
        bookings, not money the platform has collected.
      </p>

      {reports.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-zinc-300 bg-white py-14 text-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
            <Wallet className="size-5" strokeWidth={1.75} />
          </span>
          <p className="text-sm text-zinc-500">No bookings on the platform yet.</p>
        </div>
      ) : (
        reports.map((report) => (
          <div key={report.currency} className="mt-6">
            {reports.length > 1 && (
              <h2 className="font-display mb-3 text-sm font-bold text-zinc-900">{report.currency}</h2>
            )}

            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              <StatCard
                icon={Wallet}
                label="Total revenue"
                value={formatMoney(report.totalValue, report.currency)}
                accent="indigo"
              />
              <StatCard
                icon={CircleCheckBig}
                label="Confirmed bookings"
                value={String(report.confirmedCount)}
                accent="indigo"
              />
              <StatCard
                icon={Calculator}
                label="Average per booking"
                value={formatMoney(report.avgValue, report.currency)}
                accent="indigo"
              />
              <StatCard
                icon={Clock}
                label="Pending"
                value={formatMoney(pendingByCurrency.find((p) => p.currency === report.currency)?._sum.totalPrice?.toNumber() ?? 0, report.currency)}
                hint={(() => {
                  const c = pendingByCurrency.find((p) => p.currency === report.currency)?._count._all ?? 0;
                  return c > 0 ? `${c} awaiting approval` : "Nothing awaiting approval";
                })()}
                accent="amber"
              />
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-5">
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 lg:col-span-3">
                <h3 className="font-display flex items-center gap-2 text-sm font-bold text-zinc-900">
                  <TrendingUp className="size-4 text-indigo-600" />
                  Revenue trend
                </h3>
                <p className="mt-0.5 text-xs text-zinc-400">Confirmed revenue on the days it was earned.</p>

                {report.chartPoints.length > 0 ? (
                  <div className="mt-5">
                    <RevenueChart points={report.chartPoints} currency={report.currency} />
                  </div>
                ) : (
                  <p className="mt-6 py-6 text-center text-sm text-zinc-500">No confirmed revenue yet.</p>
                )}
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-5 lg:col-span-2">
                <h3 className="font-display flex items-center gap-2 text-sm font-bold text-zinc-900">
                  <Users className="size-4 text-indigo-600" />
                  By owner
                </h3>
                {report.ownerBreakdown.length === 0 ? (
                  <p className="mt-4 py-6 text-center text-sm text-zinc-500">No confirmed revenue yet.</p>
                ) : (
                  <ul className="mt-3 flex flex-col divide-y divide-zinc-100">
                    {report.ownerBreakdown.map((o) => (
                      <li key={o.name} className="flex items-center justify-between gap-3 py-2.5">
                        <div className="min-w-0">
                          <p className="truncate text-sm text-zinc-900">{o.name}</p>
                          <p className="text-xs text-zinc-400">
                            {o.count} booking{o.count === 1 ? "" : "s"}
                          </p>
                        </div>
                        <p className="shrink-0 text-sm font-semibold tabular-nums text-zinc-900">
                          <Money amount={o.revenue} currency={report.currency} />
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
              <div className="flex items-center gap-2 p-5 pb-0">
                <Receipt className="size-4 text-indigo-600" />
                <h3 className="font-display text-sm font-bold text-zinc-900">Transactions</h3>
              </div>

              {report.transactions.length === 0 ? (
                <p className="p-5 text-center text-sm text-zinc-500">No confirmed bookings yet.</p>
              ) : (
                <>
                  {/* Mobile: stacked rows. */}
                  <div className="mt-3 flex flex-col divide-y divide-zinc-100 sm:hidden">
                    {report.transactions.map((b) => (
                      <div key={b.id} className="flex items-center justify-between gap-3 px-5 py-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-zinc-900">{b.pitch.name}</p>
                          <p className="mt-0.5 truncate text-xs text-zinc-500">
                            {b.pitch.owner.name} · {formatDateShort(toDateStr(b.date))}
                          </p>
                        </div>
                        <p className="shrink-0 text-sm font-semibold tabular-nums text-zinc-900">
                          <Money amount={b.totalPrice.toString()} currency={report.currency} />
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
                          <th className="px-5 py-3">Pitch</th>
                          <th className="px-5 py-3">Owner</th>
                          <th className="px-5 py-3">Reference</th>
                          <th className="px-5 py-3">Status</th>
                          <th className="px-5 py-3 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {report.transactions.map((b) => (
                          <tr key={b.id} className="transition-colors hover:bg-zinc-50/60">
                            <td className="whitespace-nowrap px-5 py-3.5 text-zinc-700">
                              {formatDateShort(toDateStr(b.date))}
                            </td>
                            <td className="px-5 py-3.5 text-zinc-900">{b.pitch.name}</td>
                            <td className="px-5 py-3.5 text-zinc-700">{b.pitch.owner.name}</td>
                            <td className="whitespace-nowrap px-5 py-3.5 font-mono text-xs text-zinc-500">
                              {b.reference}
                            </td>
                            <td className="px-5 py-3.5">
                              <BookingStatusBadge status={b.status} />
                            </td>
                            <td className="whitespace-nowrap px-5 py-3.5 text-right font-semibold tabular-nums text-zinc-900">
                              <Money amount={b.totalPrice.toString()} currency={report.currency} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t border-zinc-200 bg-zinc-50/60">
                          <td
                            colSpan={5}
                            className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-500"
                          >
                            Total
                          </td>
                          <td className="whitespace-nowrap px-5 py-3 text-right font-display font-bold tabular-nums text-zinc-900">
                            <Money amount={report.totalValue} currency={report.currency} />
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
        ))
      )}
    </div>
  );
}
