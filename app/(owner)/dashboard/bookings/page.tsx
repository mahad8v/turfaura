import Link from "next/link";
import { ListFilter, X } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/auth";
import { BookingsTable } from "@/components/owner/BookingsTable";
import { SelectField, TextField } from "@/components/shared/fields";
import { Button } from "@/components/shared/Button";
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
  searchParams: Promise<{ pitchId?: string; status?: string; date?: string }>;
}) {
  const owner = await requireOwner();
  const { pitchId, status, date } = await searchParams;

  const validStatus = STATUS_OPTIONS.some((o) => o.value === status) ? (status as BookingStatus) : undefined;
  const validDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : undefined;

  const pitches = await prisma.pitch.findMany({
    where: { ownerId: owner.id },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const bookings = await prisma.booking.findMany({
    where: {
      pitch: { ownerId: owner.id },
      ...(pitchId ? { pitchId } : {}),
      ...(validStatus ? { status: validStatus } : {}),
      ...(validDate ? { date: new Date(`${validDate}T00:00:00.000Z`) } : {}),
    },
    include: { pitch: { select: { name: true } } },
    orderBy: [{ date: "desc" }, { startTime: "desc" }],
    take: 200,
  });

  const rows = bookings.map((b) => ({
    id: b.id,
    reference: b.reference,
    pitchName: b.pitch.name,
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

      <form
        method="get"
        className="mt-4 flex flex-wrap items-end gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
      >
        <div className="min-w-40">
          <SelectField label="Pitch" name="pitchId" defaultValue={pitchId ?? ""}>
            <option value="">All pitches</option>
            {pitches.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </SelectField>
        </div>
        <div className="min-w-44">
          <SelectField label="Status" name="status" defaultValue={validStatus ?? ""}>
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </SelectField>
        </div>
        <TextField label="Date" name="date" type="date" defaultValue={validDate} />
        <Button type="submit" variant="secondary" icon={<ListFilter className="size-3.5" />}>
          Filter
        </Button>
      </form>

      <div className="mt-6">
        <BookingsTable bookings={rows} approveBooking={approveBooking} cancelBooking={ownerCancelBooking} />
      </div>
    </div>
  );
}
