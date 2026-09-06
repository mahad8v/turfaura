import { Clock, CheckCircle2, XCircle, TimerOff } from "lucide-react";
import type { BookingStatus } from "@/generated/prisma/client";

const bookingStyles: Record<BookingStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700 ring-amber-600/20",
  CONFIRMED: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  CANCELLED: "bg-zinc-100 text-zinc-600 ring-zinc-500/20",
  EXPIRED: "bg-zinc-100 text-zinc-500 ring-zinc-500/20",
};

const bookingLabels: Record<BookingStatus, string> = {
  PENDING: "Awaiting approval",
  CONFIRMED: "Confirmed",
  CANCELLED: "Cancelled",
  EXPIRED: "Expired",
};

const bookingIcons: Record<BookingStatus, typeof Clock> = {
  PENDING: Clock,
  CONFIRMED: CheckCircle2,
  CANCELLED: XCircle,
  EXPIRED: TimerOff,
};

function Badge({ className, icon: Icon, children }: { className: string; icon: typeof Clock; children: React.ReactNode }) {
  return (
    <span className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${className}`}>
      <Icon className="size-3.5" strokeWidth={2.25} />
      {children}
    </span>
  );
}

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return (
    <Badge className={bookingStyles[status]} icon={bookingIcons[status]}>
      {bookingLabels[status]}
    </Badge>
  );
}
