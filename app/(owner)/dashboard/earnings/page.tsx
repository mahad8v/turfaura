import { Wallet, TrendingUp } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/auth";
import { Money } from "@/components/shared/Money";
import { BookingStatus } from "@/generated/prisma/client";

export default async function EarningsPage() {
  const owner = await requireOwner();

  const pitches = await prisma.pitch.findMany({
    where: { ownerId: owner.id },
    select: { id: true, name: true, currency: true },
    orderBy: { name: "asc" },
  });

  const confirmedBookings = await prisma.booking.findMany({
    where: { pitch: { ownerId: owner.id }, status: BookingStatus.CONFIRMED },
    select: { pitchId: true, totalPrice: true, currency: true },
  });

  const totalsByCurrency = new Map<string, { totalValue: number; count: number }>();
  for (const b of confirmedBookings) {
    const entry = totalsByCurrency.get(b.currency) ?? { totalValue: 0, count: 0 };
    entry.totalValue += b.totalPrice.toNumber();
    entry.count += 1;
    totalsByCurrency.set(b.currency, entry);
  }

  const perPitch = pitches.map((pitch) => {
    const bookingsForPitch = confirmedBookings.filter((b) => b.pitchId === pitch.id);
    const value = bookingsForPitch.reduce((sum, b) => sum + b.totalPrice.toNumber(), 0);
    return { pitch, value, count: bookingsForPitch.length };
  });

  return (
    <div>
      <h1 className="font-display text-xl font-bold text-zinc-900">Earnings</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Customers pay cash at the pitch after playing — these totals reflect what&apos;s expected from confirmed
        bookings, not money already collected.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...totalsByCurrency.entries()].map(([currency, totals]) => (
          <div
            key={currency}
            className="rounded-2xl border border-zinc-200 bg-linear-to-br from-white to-emerald-50/40 p-5 shadow-sm"
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm shadow-emerald-600/30">
              <Wallet className="size-4" strokeWidth={2.25} />
            </span>
            <p className="mt-3 text-sm text-zinc-500">Expected cash ({currency})</p>
            <p className="font-display mt-0.5 text-2xl font-extrabold text-zinc-900">
              <Money amount={totals.totalValue} currency={currency} />
            </p>
            <p className="mt-1.5 flex items-center gap-1 text-xs text-zinc-400">
              <TrendingUp className="size-3.5" />
              {totals.count} confirmed booking{totals.count === 1 ? "" : "s"}
            </p>
          </div>
        ))}
        {totalsByCurrency.size === 0 && (
          <div className="col-span-full flex flex-col items-center gap-2 rounded-2xl border border-dashed border-zinc-300 bg-white py-12 text-center">
            <Wallet className="size-6 text-zinc-300" strokeWidth={1.5} />
            <p className="text-sm text-zinc-500">No confirmed bookings yet.</p>
          </div>
        )}
      </div>

      <h2 className="font-display mt-8 text-sm font-bold text-zinc-900">By pitch</h2>
      <div className="mt-3 divide-y divide-zinc-100 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        {perPitch.map(({ pitch, value, count }) => (
          <div key={pitch.id} className="flex items-center justify-between px-5 py-3.5 text-sm">
            <span className="text-zinc-900">{pitch.name}</span>
            <span className="text-zinc-500">
              {count} booking{count === 1 ? "" : "s"} ·{" "}
              <span className="font-medium text-zinc-900">
                <Money amount={value} currency={pitch.currency} />
              </span>
            </span>
          </div>
        ))}
        {perPitch.length === 0 && <p className="px-5 py-4 text-sm text-zinc-500">No pitches yet.</p>}
      </div>
    </div>
  );
}
