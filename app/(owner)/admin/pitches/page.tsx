import Link from "next/link";
import { MapPinned, Pencil, Ban, CircleCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Money } from "@/components/shared/Money";
import { ToggleButton } from "@/components/shared/ToggleButton";
import { toggleActive } from "../../dashboard/pitches/[pitchId]/actions";

export default async function AdminPitchesPage() {
  const pitches = await prisma.pitch.findMany({
    include: { owner: { select: { name: true } }, _count: { select: { bookings: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-inset ring-indigo-600/10">
          <MapPinned className="size-5" strokeWidth={2.25} />
        </span>
        <div>
          <h1 className="font-display text-xl font-bold text-zinc-900">All pitches</h1>
          <p className="text-sm text-zinc-500">
            {pitches.length} pitches across every owner. Edit pricing, schedule, blocked dates, and photos directly.
          </p>
        </div>
      </div>

      {/* Mobile: stacked cards. */}
      <div className="mt-6 grid gap-3 md:hidden">
        {pitches.map((pitch) => (
          <div
            key={pitch.id}
            className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition-all duration-200 hover:border-zinc-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <MapPinned className="size-4.5" strokeWidth={2.25} />
                </span>
                <div className="min-w-0">
                  <p className="font-medium text-zinc-900">{pitch.name}</p>
                  <p className="truncate text-xs text-zinc-500">{pitch.address}</p>
                  <p className="mt-0.5 text-xs text-zinc-400">{pitch.owner.name}</p>
                </div>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
                  pitch.isActive
                    ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                    : "bg-zinc-100 text-zinc-500 ring-zinc-500/20"
                }`}
              >
                {pitch.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-3 text-sm">
              <span className="font-medium text-zinc-900">
                <Money amount={pitch.basePricePerHour.toString()} currency={pitch.currency} />
                <span className="text-xs font-normal text-zinc-400"> /hr</span>
              </span>
              <span className="text-xs text-zinc-500">{pitch._count.bookings} bookings</span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Link
                href={`/dashboard/pitches/${pitch.id}`}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-medium text-zinc-700 transition-colors hover:border-zinc-400 hover:bg-zinc-50"
              >
                <Pencil className="size-3.5" />
                Edit
              </Link>
              <ToggleButton
                id={pitch.id}
                active={pitch.isActive}
                onLabel="Activate"
                offLabel="Deactivate"
                onIcon={<CircleCheck className="size-3.5" />}
                offIcon={<Ban className="size-3.5" />}
                action={toggleActive}
              />
            </div>
          </div>
        ))}
        {pitches.length === 0 && (
          <p className="rounded-2xl border border-dashed border-zinc-300 bg-white py-8 text-center text-sm text-zinc-500">
            No pitches yet.
          </p>
        )}
      </div>

      {/* Desktop/tablet: full table. */}
      <div className="mt-6 hidden overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm md:block">
        <table className="min-w-full divide-y divide-zinc-100 text-sm">
          <thead>
            <tr className="bg-zinc-50/80 text-left text-xs font-medium uppercase tracking-wide text-zinc-400">
              <th className="px-4 py-3">Pitch</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Bookings</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {pitches.map((pitch) => (
              <tr key={pitch.id} className="transition-colors hover:bg-zinc-50/60">
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                      <MapPinned className="size-4" strokeWidth={2.25} />
                    </span>
                    <div>
                      <div className="font-medium text-zinc-900">{pitch.name}</div>
                      <div className="text-xs text-zinc-500">{pitch.address}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-zinc-700">{pitch.owner.name}</td>
                <td className="whitespace-nowrap px-4 py-3.5 font-medium text-zinc-900">
                  <Money amount={pitch.basePricePerHour.toString()} currency={pitch.currency} />
                  <span className="text-xs font-normal text-zinc-400"> /hr</span>
                </td>
                <td className="px-4 py-3.5 text-zinc-700">{pitch._count.bookings}</td>
                <td className="px-4 py-3.5">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
                      pitch.isActive
                        ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                        : "bg-zinc-100 text-zinc-500 ring-zinc-500/20"
                    }`}
                  >
                    {pitch.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex flex-col items-end gap-2">
                    <Link
                      href={`/dashboard/pitches/${pitch.id}`}
                      className="flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:border-zinc-400 hover:bg-zinc-50"
                    >
                      <Pencil className="size-3.5" />
                      Edit
                    </Link>
                    <ToggleButton
                      id={pitch.id}
                      active={pitch.isActive}
                      onLabel="Activate"
                      offLabel="Deactivate"
                      onIcon={<CircleCheck className="size-3.5" />}
                      offIcon={<Ban className="size-3.5" />}
                      action={toggleActive}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {pitches.length === 0 && <p className="px-4 py-6 text-sm text-zinc-500">No pitches yet.</p>}
      </div>
    </div>
  );
}
