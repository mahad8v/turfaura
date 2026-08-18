import { Wallet, TrendingUp, MapPinned } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getOwnerWithActivePitch } from "@/lib/active-pitch";
import { Money } from "@/components/shared/Money";
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

  const confirmedBookings = await prisma.booking.findMany({
    where: { pitchId: activePitch.id, status: BookingStatus.CONFIRMED },
    select: { totalPrice: true },
  });

  const totalValue = confirmedBookings.reduce((sum, b) => sum + b.totalPrice.toNumber(), 0);

  return (
    <div>
      <h1 className="font-display text-xl font-bold text-zinc-900">Earnings</h1>
      <p className="mt-1 text-sm text-zinc-500">
        {activePitch.name} — customers pay cash at the pitch after playing, so this reflects what&apos;s expected
        from confirmed bookings, not money already collected.
      </p>

      <div className="mt-6 max-w-sm">
        <div className="rounded-2xl border border-zinc-200 bg-linear-to-br from-white to-emerald-50/40 p-5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm shadow-emerald-600/30">
            <Wallet className="size-4" strokeWidth={2.25} />
          </span>
          <p className="mt-3 text-sm text-zinc-500">Expected cash ({activePitch.currency})</p>
          <p className="font-display mt-0.5 text-2xl font-extrabold text-zinc-900">
            <Money amount={totalValue} currency={activePitch.currency} />
          </p>
          <p className="mt-1.5 flex items-center gap-1 text-xs text-zinc-400">
            <TrendingUp className="size-3.5" />
            {confirmedBookings.length} confirmed booking{confirmedBookings.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>
    </div>
  );
}
