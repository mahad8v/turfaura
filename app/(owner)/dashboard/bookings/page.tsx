import Link from "next/link";
import { X, MapPinned } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getOwnerWithActivePitch } from "@/lib/active-pitch";
import { BookingsTable } from "@/components/owner/BookingsTable";
import { BookingsFilterModal } from "@/components/owner/BookingsFilterModal";
import { formatDateLong, toDateStr } from "@/lib/format";
import { BookingStatus } from "@/generated/prisma/client";
import { approveBooking, ownerCancelBooking } from "./actions";

const STATUS_OPTIONS: { value: BookingStatus; label: string }[] = [
  { value: BookingStatus.PENDING, label: "Awaiting approval" },
  { value: BookingStatus.CONFIRMED, label: "Confirmed" },
  { value: BookingStatus.CANCELLED, label: "Cancelled" },
  { value: BookingStatus.EXPIRED, label: "Expired" },
];

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; date?: string }>;
}) {
  const { activePitch } = await getOwnerWithActivePitch();
  const { status, date } = await searchParams;

  const validStatus = STATUS_OPTIONS.some((o) => o.value === status) ? (status as BookingStatus) : undefined;
  const validDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : undefined;

  if (!activePitch) {
    return (
      <div>
        <h1 className="font-display text-xl font-bold text-zinc-900">Bookings</h1>
        <div className="mt-6 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-zinc-300 bg-white py-14 text-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
            <MapPinned className="size-5" strokeWidth={1.75} />
          </span>
          <p className="text-sm text-zinc-500">Add a turf to start taking bookings.</p>
        </div>
      </div>
    );
  }

  const bookings = await prisma.booking.findMany({
    where: {
      pitchId: activePitch.id,
      ...(validStatus ? { status: validStatus } : {}),
      ...(validDate ? { date: new Date(`${validDate}T00:00:00.000Z`) } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const rows = bookings.map((b) => ({
    id: b.id,
    reference: b.reference,
    pitchName: activePitch.name,
    date: toDateStr(b.date),
    startTime: b.startTime,
    endTime: b.endTime,
    customerName: b.customerName,
    customerPhone: b.customerPhone,
    status: b.status,
    totalPrice: b.totalPrice.toString(),
    currency: b.currency,
  }));

  return (
    <div>
      <h1 className="font-display text-xl font-bold text-zinc-900">Bookings</h1>
      <p className="mt-1 text-sm text-zinc-500">{activePitch.name}</p>
      {validDate && (
        <p className="mt-1 flex items-center gap-2 text-sm text-zinc-500">
          Showing {formatDateLong(validDate)}
          <Link
            href="/dashboard/bookings"
            className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 hover:bg-zinc-200"
          >
            <X className="size-3" />
            Clear
          </Link>
        </p>
      )}

      <div className="mt-4">
        <BookingsFilterModal
          basePath="/dashboard/bookings"
          status={validStatus}
          date={validDate}
          statusOptions={STATUS_OPTIONS}
        />
      </div>

      <div className="mt-6">
        <BookingsTable bookings={rows} approveBooking={approveBooking} cancelBooking={ownerCancelBooking} />
      </div>
    </div>
  );
}
