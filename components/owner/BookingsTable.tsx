"use client";

import { useState, useTransition } from "react";
import { CalendarSearch, CircleAlert, CheckCheck, Ban, Hash } from "lucide-react";
import { BookingStatusBadge } from "@/components/shared/StatusBadge";
import { Money } from "@/components/shared/Money";
import { Button } from "@/components/shared/Button";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";
import { formatDateLong, formatDateShort, formatTimeRange, formatTimeRangeShort } from "@/lib/format";
import type { BookingStatus } from "@/generated/prisma/client";

export interface BookingRow {
  id: string;
  reference: string;
  pitchName: string;
  ownerName?: string;
  date: string;
  startTime: string;
  endTime: string;
  customerName: string;
  customerPhone: string;
  status: BookingStatus;
  totalPrice: string;
  currency: string;
}

interface CancelResult {
  error?: string;
}

interface BookingsTableProps {
  bookings: BookingRow[];
  approveBooking: (bookingId: string) => Promise<void>;
  cancelBooking: (bookingId: string) => Promise<CancelResult>;
}

function whatsAppMessage(b: BookingRow): string {
  return `Hi ${b.customerName}, this is ${b.pitchName} confirming your booking (ref ${b.reference}) for ${formatDateLong(b.date)} at ${formatTimeRange(b.startTime, b.endTime)}. Can you confirm you'll be playing? Payment is cash at the pitch afterward.`;
}

function BookingActions({
  booking,
  pending,
  onApprove,
  onCancel,
}: {
  booking: BookingRow;
  pending: boolean;
  onApprove: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {(booking.status === "PENDING" || booking.status === "CONFIRMED") && (
        <WhatsAppButton phone={booking.customerPhone} message={whatsAppMessage(booking)} label="WhatsApp" size="sm" />
      )}
      {booking.status === "PENDING" && (
        <Button size="sm" variant="primary" icon={<CheckCheck className="size-3.5" />} pending={pending} onClick={onApprove}>
          Approve
        </Button>
      )}
      {(booking.status === "PENDING" || booking.status === "CONFIRMED") && (
        <Button size="sm" variant="secondary" icon={<Ban className="size-3.5" />} pending={pending} onClick={onCancel}>
          Cancel
        </Button>
      )}
    </div>
  );
}

export function BookingsTable({ bookings, approveBooking, cancelBooking }: BookingsTableProps) {
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function run(bookingId: string, fn: () => Promise<void | CancelResult>) {
    setError(null);
    setPendingId(bookingId);
    startTransition(async () => {
      const result = await fn();
      if (result && "error" in result && result.error) setError(result.error);
      setPendingId(null);
    });
  }

  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-zinc-300 bg-white py-14 text-center">
        <span className="flex size-11 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
          <CalendarSearch className="size-5" strokeWidth={1.75} />
        </span>
        <p className="text-sm text-zinc-500">No bookings match these filters.</p>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <p className="mb-3 flex items-center gap-1.5 text-sm text-red-600">
          <CircleAlert className="size-4 shrink-0" />
          {error}
        </p>
      )}

      {/* Mobile: stacked cards — a 6-column data table doesn't fit a phone screen. */}
      <div className="grid gap-3 md:hidden">
        {bookings.map((b) => {
          const rowPending = isPending && pendingId === b.id;
          return (
            <div key={b.id} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-zinc-900">{b.pitchName}</p>
                  {b.ownerName && <p className="text-xs text-indigo-600">{b.ownerName}</p>}
                </div>
                <span className="flex shrink-0 items-center gap-1 rounded-md bg-zinc-100 px-1.5 py-0.5 font-mono text-xs font-medium text-zinc-600">
                  <Hash className="size-3" />
                  {b.reference}
                </span>
              </div>
              <p className="mt-1.5 text-xs text-zinc-500">
                {formatDateShort(b.date)} · {formatTimeRangeShort(b.startTime, b.endTime)}
              </p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                <BookingStatusBadge status={b.status} />
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-3 text-sm">
                <div>
                  <p className="text-zinc-900">{b.customerName}</p>
                  <p className="text-xs text-zinc-500">{b.customerPhone}</p>
                </div>
                <p className="font-medium text-zinc-900">
                  <Money amount={b.totalPrice} currency={b.currency} />
                </p>
              </div>
              <div className="mt-3">
                <BookingActions
                  booking={b}
                  pending={rowPending}
                  onApprove={() => run(b.id, () => approveBooking(b.id))}
                  onCancel={() => run(b.id, () => cancelBooking(b.id))}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop/tablet: full table. */}
      <div className="hidden overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm md:block">
        <table className="min-w-full divide-y divide-zinc-100 text-sm">
          <thead>
            <tr className="text-left text-xs font-medium uppercase tracking-wide text-zinc-400">
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3">Pitch &amp; time</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {bookings.map((b) => {
              const rowPending = isPending && pendingId === b.id;
              return (
                <tr key={b.id} className="transition-colors hover:bg-zinc-50/60">
                  <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs font-medium text-zinc-600">
                    {b.reference}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-medium text-zinc-900">{b.pitchName}</div>
                    {b.ownerName && <div className="text-xs text-indigo-600">{b.ownerName}</div>}
                    <div className="text-xs text-zinc-500">
                      {formatDateShort(b.date)} · {formatTimeRangeShort(b.startTime, b.endTime)}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="text-zinc-900">{b.customerName}</div>
                    <div className="text-xs text-zinc-500">{b.customerPhone}</div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 font-medium text-zinc-900">
                    <Money amount={b.totalPrice} currency={b.currency} />
                  </td>
                  <td className="px-4 py-3.5">
                    <BookingStatusBadge status={b.status} />
                  </td>
                  <td className="px-4 py-3.5">
                    <BookingActions
                      booking={b}
                      pending={rowPending}
                      onApprove={() => run(b.id, () => approveBooking(b.id))}
                      onCancel={() => run(b.id, () => cancelBooking(b.id))}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
