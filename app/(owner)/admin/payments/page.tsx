import Link from "next/link";
import { ChevronLeft, ChevronRight, Wallet, CircleCheck, Clock, CircleAlert } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Money } from "@/components/shared/Money";
import { StatCard } from "@/components/shared/StatCard";
import { PaymentStatusToggle } from "@/components/owner/PaymentStatusToggle";
import { calculatePlatformFee, platformFeeTierLabel, PLATFORM_FEE_CURRENCY } from "@/lib/platform-fee";
import { formatMoney } from "@/lib/format";
import { markPaymentPaid, markPaymentUnpaid } from "./actions";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function parseMonthParam(month?: string): { year: number; month: number } {
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [y, m] = month.split("-").map(Number);
    return { year: y, month: m };
  }
  const now = new Date();
  return { year: now.getUTCFullYear(), month: now.getUTCMonth() + 1 };
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month: monthParam } = await searchParams;
  const { year, month } = parseMonthParam(monthParam);

  const now = new Date();
  const isPastMonth =
    year < now.getUTCFullYear() || (year === now.getUTCFullYear() && month < now.getUTCMonth() + 1);

  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;

  const [owners, payments] = await Promise.all([
    prisma.owner.findMany({
      where: { role: "OWNER", pitches: { some: {} } },
      select: { id: true, name: true, email: true, _count: { select: { pitches: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.platformPayment.findMany({ where: { year, month } }),
  ]);

  const rows = owners.map((owner) => {
    const payment = payments.find((p) => p.ownerId === owner.id);
    const turfCount = owner._count.pitches;
    const amount = payment?.paid ? payment.amount.toNumber() : calculatePlatformFee(turfCount);
    return {
      ownerId: owner.id,
      name: owner.name,
      email: owner.email,
      turfCount,
      amount,
      currency: payment?.currency ?? PLATFORM_FEE_CURRENCY,
      paid: payment?.paid ?? false,
      paidAt: payment?.paidAt ?? null,
    };
  });

  const expectedTotal = rows.reduce((sum, r) => sum + r.amount, 0);
  const collectedTotal = rows.filter((r) => r.paid).reduce((sum, r) => sum + r.amount, 0);
  const paidCount = rows.filter((r) => r.paid).length;
  const unpaidCount = rows.length - paidCount;

  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-inset ring-indigo-600/10">
          <Wallet className="size-5" strokeWidth={2.25} />
        </span>
        <div>
          <h1 className="font-display text-xl font-bold text-zinc-900">Payments</h1>
          <p className="text-sm text-zinc-500">Monthly platform fees owed by each turf owner.</p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-4">
        <h2 className="font-display text-base font-bold text-zinc-900">
          {MONTH_NAMES[month - 1]} {year}
        </h2>
        <div className="flex items-center gap-1">
          <Link
            href={`/admin/payments?month=${prevYear}-${pad(prevMonth)}`}
            aria-label="Previous month"
            className="flex size-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100"
          >
            <ChevronLeft className="size-4" />
          </Link>
          <Link href="/admin/payments" className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-500 hover:bg-zinc-100">
            This month
          </Link>
          <Link
            href={`/admin/payments?month=${nextYear}-${pad(nextMonth)}`}
            aria-label="Next month"
            className="flex size-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100"
          >
            <ChevronRight className="size-4" />
          </Link>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          icon={Wallet}
          label="Expected this month"
          value={formatMoney(expectedTotal, PLATFORM_FEE_CURRENCY)}
          accent="indigo"
        />
        <StatCard
          icon={CircleCheck}
          label="Collected"
          value={formatMoney(collectedTotal, PLATFORM_FEE_CURRENCY)}
          hint={`${paidCount} owner${paidCount === 1 ? "" : "s"} paid`}
        />
        <StatCard
          icon={Clock}
          label="Outstanding"
          value={formatMoney(expectedTotal - collectedTotal, PLATFORM_FEE_CURRENCY)}
          hint={`${unpaidCount} owner${unpaidCount === 1 ? "" : "s"} unpaid`}
          accent={unpaidCount > 0 ? "amber" : "indigo"}
        />
        <StatCard icon={Wallet} label="Turf owners" value={String(owners.length)} accent="indigo" />
      </div>

      <h2 className="font-display mt-6 text-sm font-bold text-zinc-900">Owners</h2>
      {rows.length === 0 ? (
        <p className="mt-3 rounded-2xl border border-dashed border-zinc-300 bg-white py-8 text-center text-sm text-zinc-500">
          No turf owners yet.
        </p>
      ) : (
        <div className="mt-3 grid gap-3">
          {rows.map((row) => {
            const overdue = isPastMonth && !row.paid;
            return (
              <div
                key={row.ownerId}
                className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white p-4 transition-colors duration-200 hover:border-zinc-300"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="truncate font-medium text-zinc-900">{row.name}</p>
                    {row.paid ? (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                        <CircleCheck className="size-3" />
                        Paid
                      </span>
                    ) : overdue ? (
                      <span className="flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
                        <CircleAlert className="size-3" />
                        Overdue
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                        <Clock className="size-3" />
                        Unpaid
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs text-zinc-500">{row.email}</p>
                  <p className="mt-0.5 text-xs text-zinc-400">{platformFeeTierLabel(row.turfCount)}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <p className="font-display font-bold text-zinc-900">
                    <Money amount={row.amount} currency={row.currency} />
                  </p>
                  <PaymentStatusToggle
                    ownerId={row.ownerId}
                    year={year}
                    month={month}
                    paid={row.paid}
                    markPaid={markPaymentPaid}
                    markUnpaid={markPaymentUnpaid}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
