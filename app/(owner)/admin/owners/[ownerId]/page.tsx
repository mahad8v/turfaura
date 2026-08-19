import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronLeft,
  Mail,
  Phone,
  CalendarClock,
  ShieldUser,
  ShieldOff,
  MapPinned,
  CalendarCheck,
  Wallet,
  Pencil,
  Ban,
  CircleCheck,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { Money } from "@/components/shared/Money";
import { StatCard } from "@/components/shared/StatCard";
import { ToggleButton } from "@/components/shared/ToggleButton";
import { formatMoney } from "@/lib/format";
import { BookingStatus } from "@/generated/prisma/client";
import { toggleAdminRole } from "../actions";
import { toggleActive } from "../../../dashboard/pitches/[pitchId]/actions";

export default async function AdminOwnerDetailPage({ params }: { params: Promise<{ ownerId: string }> }) {
  const currentAdmin = await requireAdmin();
  const { ownerId } = await params;

  const owner = await prisma.owner.findUnique({
    where: { id: ownerId },
    include: {
      pitches: {
        include: { _count: { select: { bookings: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!owner) notFound();

  const pitchIds = owner.pitches.map((p) => p.id);
  const [statusCounts, confirmedByCurrency] = await Promise.all([
    prisma.booking.groupBy({
      by: ["status"],
      where: { pitchId: { in: pitchIds } },
      _count: { _all: true },
    }),
    prisma.booking.groupBy({
      by: ["currency"],
      where: { pitchId: { in: pitchIds }, status: BookingStatus.CONFIRMED },
      _sum: { totalPrice: true },
    }),
  ]);

  const totalBookings = statusCounts.reduce((sum, s) => sum + s._count._all, 0);
  const needsAttention = statusCounts.find((s) => s.status === BookingStatus.PENDING)?._count._all ?? 0;
  const revenueLabel =
    confirmedByCurrency.length === 0
      ? "—"
      : confirmedByCurrency
          .map((row) => formatMoney(row._sum.totalPrice?.toNumber() ?? 0, row.currency))
          .join(" · ");

  return (
    <div>
      <Link
        href="/admin/owners"
        className="mb-3 inline-flex items-center gap-0.5 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-700"
      >
        <ChevronLeft className="size-4" />
        Owners
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={`flex size-12 shrink-0 items-center justify-center rounded-full bg-linear-to-br text-lg font-semibold text-white shadow-sm ${
              owner.role === "ADMIN" ? "from-indigo-500 to-indigo-700" : "from-zinc-400 to-zinc-600"
            }`}
          >
            {owner.name.charAt(0).toUpperCase()}
          </span>
          <div>
            <h1 className="font-display flex items-center gap-2 text-xl font-bold text-zinc-900">
              {owner.name}
              {owner.id === currentAdmin.id && <span className="text-sm font-normal text-zinc-400">(you)</span>}
            </h1>
            <span
              className={`mt-0.5 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                owner.role === "ADMIN"
                  ? "bg-indigo-50 text-indigo-700 ring-indigo-600/20"
                  : "bg-zinc-100 text-zinc-600 ring-zinc-500/20"
              }`}
            >
              {owner.role === "ADMIN" ? "Admin" : "Owner"}
            </span>
          </div>
        </div>

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
      </div>

      <div className="mt-5 flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-white p-4 text-sm sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-2">
        <span className="flex items-center gap-1.5 text-zinc-600">
          <Mail className="size-3.5 text-zinc-400" />
          {owner.email}
        </span>
        {owner.phone && (
          <span className="flex items-center gap-1.5 text-zinc-600">
            <Phone className="size-3.5 text-zinc-400" />
            {owner.phone}
          </span>
        )}
        <span className="flex items-center gap-1.5 text-zinc-500">
          <CalendarClock className="size-3.5 text-zinc-400" />
          Joined {owner.createdAt.toLocaleDateString()}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard icon={MapPinned} label="Pitches" value={String(owner.pitches.length)} accent="indigo" />
        <StatCard icon={CalendarCheck} label="Total bookings" value={String(totalBookings)} accent="indigo" />
        <StatCard
          icon={CalendarCheck}
          label="Needs attention"
          value={String(needsAttention)}
          hint="Awaiting owner approval"
          accent={needsAttention > 0 ? "amber" : "indigo"}
        />
        <StatCard icon={Wallet} label="Confirmed revenue" value={revenueLabel} accent="indigo" />
      </div>

      <h2 className="font-display mt-6 text-sm font-bold text-zinc-900">Pitches</h2>
      {owner.pitches.length === 0 ? (
        <p className="mt-3 rounded-2xl border border-dashed border-zinc-300 bg-white py-8 text-center text-sm text-zinc-500">
          This owner hasn&apos;t added any turfs yet.
        </p>
      ) : (
        <div className="mt-3 grid gap-3">
          {owner.pitches.map((pitch) => (
            <div
              key={pitch.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white p-4 transition-colors duration-200 hover:border-zinc-300"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="truncate font-medium text-zinc-900">{pitch.name}</p>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset ${
                      pitch.isActive
                        ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                        : "bg-zinc-100 text-zinc-500 ring-zinc-500/20"
                    }`}
                  >
                    {pitch.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="truncate text-xs text-zinc-500">{pitch.address}</p>
                <p className="mt-0.5 text-xs text-zinc-400">
                  <Money amount={pitch.basePricePerHour.toString()} currency={pitch.currency} /> /hr ·{" "}
                  {pitch._count.bookings} booking{pitch._count.bookings === 1 ? "" : "s"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <ToggleButton
                  id={pitch.id}
                  active={pitch.isActive}
                  onLabel="Activate"
                  offLabel="Deactivate"
                  onIcon={<CircleCheck className="size-3.5" />}
                  offIcon={<Ban className="size-3.5" />}
                  action={toggleActive}
                />
                <Link
                  href={`/dashboard/pitches/${pitch.id}`}
                  className="flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
                >
                  <Pencil className="size-3.5" />
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
