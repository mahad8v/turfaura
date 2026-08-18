import { BookingStatusBadge } from "@/components/shared/StatusBadge";
import type { BookingStatus } from "@/generated/prisma/client";

// Solid-fill equivalents of StatusBadge's tones (good/warning/muted×2) — the
// same reserved status meaning, just saturated enough to read as a bar fill
// instead of a badge background.
const FILL: Record<BookingStatus, string> = {
  PENDING: "bg-amber-400",
  CONFIRMED: "bg-emerald-500",
  CANCELLED: "bg-zinc-300",
  EXPIRED: "bg-zinc-400",
};

export function StatusDistributionBar({
  counts,
}: {
  counts: { status: BookingStatus; count: number }[];
}) {
  const total = counts.reduce((sum, c) => sum + c.count, 0);

  return (
    <div>
      {total === 0 ? (
        <div className="h-3 w-full rounded-full bg-zinc-100" />
      ) : (
        <div className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full bg-zinc-100">
          {counts
            .filter((c) => c.count > 0)
            .map((c) => (
              <div
                key={c.status}
                className={`h-full ${FILL[c.status]} transition-all duration-500`}
                style={{ width: `${(c.count / total) * 100}%` }}
              />
            ))}
        </div>
      )}

      {/* Legend — the reliable identity channel; the bar alone never carries the numbers. */}
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2.5">
        {counts.map((c) => (
          <div key={c.status} className="flex items-center gap-2">
            <BookingStatusBadge status={c.status} />
            <span className="text-sm font-semibold text-zinc-900">{c.count}</span>
            <span className="text-xs text-zinc-400">{total > 0 ? `${Math.round((c.count / total) * 100)}%` : "—"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
