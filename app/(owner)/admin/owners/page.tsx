import Link from "next/link";
import { Users, Mail, Phone, ShieldUser, ShieldOff, ChevronRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ToggleButton } from "@/components/shared/ToggleButton";
import { toggleAdminRole } from "./actions";

export default async function AdminOwnersPage() {
  const currentAdmin = await requireAdmin();

  const owners = await prisma.owner.findMany({
    include: { _count: { select: { pitches: true } } },
    orderBy: { createdAt: "desc" },
  });

  const bookingCounts = await prisma.booking.groupBy({
    by: ["pitchId"],
    _count: { _all: true },
  });
  const pitchOwnerMap = await prisma.pitch.findMany({ select: { id: true, ownerId: true } });
  const bookingsByOwner = new Map<string, number>();
  for (const p of pitchOwnerMap) {
    const count = bookingCounts.find((b) => b.pitchId === p.id)?._count._all ?? 0;
    bookingsByOwner.set(p.ownerId, (bookingsByOwner.get(p.ownerId) ?? 0) + count);
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-inset ring-indigo-600/10">
          <Users className="size-5" strokeWidth={2.25} />
        </span>
        <div>
          <h1 className="font-display text-xl font-bold text-zinc-900">People</h1>
          <p className="text-sm text-zinc-500">{owners.length} accounts on the platform, owners and admins.</p>
        </div>
      </div>

      {/* Mobile: stacked cards. */}
      <div className="mt-6 grid gap-3 md:hidden">
        {owners.map((owner) => (
          <div
            key={owner.id}
            className="rounded-2xl border border-zinc-200 bg-white p-4 transition-colors duration-200 hover:border-zinc-300"
          >
            <div className="flex items-start justify-between gap-2">
              <Link href={`/admin/owners/${owner.id}`} className="group flex min-w-0 items-start gap-3">
                <span
                  className={`flex size-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br text-sm font-semibold text-white shadow-sm ${
                    owner.role === "ADMIN" ? "from-indigo-500 to-indigo-700" : "from-zinc-400 to-zinc-600"
                  }`}
                >
                  {owner.name.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="font-medium text-zinc-900 group-hover:text-indigo-700">
                    {owner.name}
                    {owner.id === currentAdmin.id && <span className="ml-1.5 text-xs text-zinc-400">(you)</span>}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-zinc-500">
                    <Mail className="size-3.5 shrink-0 text-zinc-400" />
                    <span className="truncate">{owner.email}</span>
                  </p>
                  {owner.phone && (
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-zinc-400">
                      <Phone className="size-3.5 shrink-0" />
                      {owner.phone}
                    </p>
                  )}
                </div>
              </Link>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
                  owner.role === "ADMIN"
                    ? "bg-indigo-50 text-indigo-700 ring-indigo-600/20"
                    : "bg-zinc-100 text-zinc-600 ring-zinc-500/20"
                }`}
              >
                {owner.role === "ADMIN" ? "Admin" : "Owner"}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-3 text-xs text-zinc-500">
              <span>
                {owner._count.pitches} pitch{owner._count.pitches === 1 ? "" : "es"} ·{" "}
                {bookingsByOwner.get(owner.id) ?? 0} bookings
              </span>
              <span>Joined {owner.createdAt.toLocaleDateString()}</span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              {owner.id !== currentAdmin.id && (
                <ToggleButton
                  id={owner.id}
                  active={owner.role === "ADMIN"}
                  onLabel="Make admin"
                  offLabel="Revoke admin"
                  onIcon={<ShieldUser className="size-3.5" />}
                  offIcon={<ShieldOff className="size-3.5" />}
                  action={toggleAdminRole}
                />
              )}
              <Link
                href={`/admin/owners/${owner.id}`}
                className="flex flex-1 items-center justify-center gap-1 rounded-full border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
              >
                View details
                <ChevronRight className="size-3.5" />
              </Link>
            </div>
          </div>
        ))}
        {owners.length === 0 && (
          <p className="rounded-2xl border border-dashed border-zinc-300 bg-white py-8 text-center text-sm text-zinc-500">
            No owners yet.
          </p>
        )}
      </div>

      {/* Desktop/tablet: full table. */}
      <div className="mt-6 hidden overflow-hidden rounded-2xl border border-zinc-200 bg-white md:block">
        <table className="min-w-full divide-y divide-zinc-100 text-sm">
          <thead>
            <tr className="bg-zinc-50/80 text-left text-xs font-medium uppercase tracking-wide text-zinc-400">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Pitches</th>
              <th className="px-4 py-3">Bookings</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {owners.map((owner) => (
              <tr key={owner.id} className="transition-colors hover:bg-zinc-50/60">
                <td className="px-4 py-3.5">
                  <Link href={`/admin/owners/${owner.id}`} className="group flex items-center gap-3">
                    <span
                      className={`flex size-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br text-xs font-semibold text-white shadow-sm ${
                        owner.role === "ADMIN" ? "from-indigo-500 to-indigo-700" : "from-zinc-400 to-zinc-600"
                      }`}
                    >
                      {owner.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="font-medium text-zinc-900 group-hover:text-indigo-700">
                      {owner.name}
                      {owner.id === currentAdmin.id && <span className="ml-1.5 text-xs text-zinc-400">(you)</span>}
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1.5 text-zinc-600">
                    <Mail className="size-3.5 text-zinc-400" />
                    {owner.email}
                  </div>
                  {owner.phone && (
                    <div className="mt-0.5 flex items-center gap-1.5 text-xs text-zinc-400">
                      <Phone className="size-3.5" />
                      {owner.phone}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3.5">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
                      owner.role === "ADMIN"
                        ? "bg-indigo-50 text-indigo-700 ring-indigo-600/20"
                        : "bg-zinc-100 text-zinc-600 ring-zinc-500/20"
                    }`}
                  >
                    {owner.role === "ADMIN" ? "Admin" : "Owner"}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-zinc-700">{owner._count.pitches}</td>
                <td className="px-4 py-3.5 text-zinc-700">{bookingsByOwner.get(owner.id) ?? 0}</td>
                <td className="px-4 py-3.5 text-zinc-500">{owner.createdAt.toLocaleDateString()}</td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-end gap-2">
                    {owner.id !== currentAdmin.id && (
                      <ToggleButton
                        id={owner.id}
                        active={owner.role === "ADMIN"}
                        onLabel="Make admin"
                        offLabel="Revoke admin"
                        onIcon={<ShieldUser className="size-3.5" />}
                        offIcon={<ShieldOff className="size-3.5" />}
                        action={toggleAdminRole}
                      />
                    )}
                    <Link
                      href={`/admin/owners/${owner.id}`}
                      className="flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
                    >
                      View
                      <ChevronRight className="size-3.5" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {owners.length === 0 && <p className="px-4 py-6 text-sm text-zinc-500">No owners yet.</p>}
      </div>
    </div>
  );
}
