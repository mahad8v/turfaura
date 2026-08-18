/** Base shimmer block — compose with a width/height/rounding className. */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-full ${className}`} />;
}

/** Mirrors StatCard's layout so the swap-in on load doesn't jump. */
export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-3.5 sm:p-5">
      <Skeleton className="size-8 rounded-lg sm:size-10 sm:rounded-xl" />
      <Skeleton className="mt-3.5 h-3 w-16" />
      <Skeleton className="mt-2 h-5 w-10 sm:h-6" />
    </div>
  );
}

/** Mirrors a native-list row (pitch cards, booking cards) — thumbnail + two text lines. */
export function ListRowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-3">
      <Skeleton className="size-16 shrink-0 rounded-xl" />
      <div className="flex-1">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="mt-2 h-3 w-1/2" />
        <Skeleton className="mt-2 h-3 w-1/3" />
      </div>
    </div>
  );
}

/** Mirrors PitchCard — image + two text lines, for the public search grid. */
export function PitchCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="mt-2 h-3 w-1/2" />
      </div>
    </div>
  );
}

/** Mirrors BookingCalendar — month header + weekday row + a 6x7 grid of day cells. */
export function CalendarSkeleton() {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <div className="flex items-center gap-1.5">
          <Skeleton className="size-8 rounded-lg" />
          <Skeleton className="h-8 w-14 rounded-lg" />
          <Skeleton className="size-8 rounded-lg" />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-7 gap-0.5 sm:gap-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="mx-auto h-3 w-6" />
        ))}
      </div>
      <div className="mt-1.5 grid grid-cols-7 gap-0.5 sm:gap-1">
        {Array.from({ length: 35 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

/** Mirrors a responsive person/entity row — avatar circle, two text lines, a status pill. */
export function EntityRowSkeleton() {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white p-4">
      <div className="flex min-w-0 items-center gap-3">
        <Skeleton className="size-10 shrink-0 rounded-full" />
        <div className="min-w-0">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-2 h-3 w-40" />
        </div>
      </div>
      <Skeleton className="h-6 w-16 shrink-0" />
    </div>
  );
}
