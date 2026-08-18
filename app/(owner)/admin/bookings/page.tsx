import Link from "next/link";
import { CalendarCheck, X } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { BookingsFilterModal } from "@/components/owner/BookingsFilterModal";
import { BookingsTable } from "@/components/owner/BookingsTable";
import { formatDateLong, toDateStr } from "@/lib/format";
import { BookingStatus } from "@/generated/prisma/client";
import { approveBooking, ownerCancelBooking } from "../../dashboard/bookings/actions";

const STATUS_OPTIONS: { value: BookingStatus; label: string }[] = [
  { value: BookingStatus.PENDING, label: "Awaiting approval" },
  { value: BookingStatus.CONFIRMED, label: "Confirmed" },
  { value: BookingStatus.CANCELLED, label: "Cancelled" },
  { value: BookingStatus.EXPIRED, label: "Expired" },
];

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ ownerId?: string; pitchId?: string; status?: string; date?: string }>;
}) {
  const { ownerId, pitchId, status, date } = await searchParams;
  const validStatus = STATUS_OPTIONS.some((o) => o.value === status) ? (status as BookingStatus) : undefined;
  const validDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : undefined;

  const [owners, pitches] = await Promise.all([
    prisma.owner.findMany({ where: { role: "OWNER" }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.pitch.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  const bookings = await prisma.booking.findMany({
    where: {
      ...(ownerId ? { pitch: { ownerId } } : {}),
      ...(pitchId ? { pitchId } : {}),
      ...(validStatus ? { status: validStatus } : {}),
      ...(validDate ? { date: new Date(`${validDate}T00:00:00.000Z`) } : {}),
    },
    include: { pitch: { select: { name: true, owner: { select: { name: true } } } } },
    orderBy: [{ date: "desc" }, { startTime: "desc" }],
    take: 200,
  });

  const rows = bookings.map((b) => ({
    id: b.id,
    reference: b.reference,
    pitchName: b.pitch.name,
    ownerName: b.pitch.owner.name,
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
      <div className="flex items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-inset ring-indigo-600/10">
          <CalendarCheck className="size-5" strokeWidth={2.25} />
        </span>
        <div>
          <h1 className="font-display text-xl font-bold text-zinc-900">All bookings</h1>
          <p className="text-sm text-zinc-500">
            Platform-wide view — approve, message, or cancel bookings for any owner.
          </p>
        </div>
      </div>
      {validDate && (
        <p className="mt-3 flex items-center gap-2 text-sm text-zinc-500">
          Showing {formatDateLong(validDate)}
          <Link
            href="/admin/bookings"
            className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 hover:bg-zinc-200"
          >
            <X className="size-3" />
            Clear
          </Link>
        </p>
      )}

      <div className="mt-4">
        <BookingsFilterModal
          basePath="/admin/bookings"
          status={validStatus}
          date={validDate}
          statusOptions={STATUS_OPTIONS}
          owners={owners}
          ownerId={ownerId}
          pitches={pitches}
          pitchId={pitchId}
        />
      </div>

      <div className="mt-6">
        <BookingsTable bookings={rows} approveBooking={approveBooking} cancelBooking={ownerCancelBooking} />
      </div>
    </div>
  );
}
