import { Skeleton, StatCardSkeleton } from "@/components/shared/Skeleton";

export default function Loading() {
  return (
    <div>
      <div className="flex items-center gap-3">
        <Skeleton className="size-11 rounded-2xl" />
        <div>
          <Skeleton className="h-5 w-24" />
          <Skeleton className="mt-2 h-3.5 w-56" />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-4">
        <Skeleton className="h-5 w-32" />
        <div className="flex items-center gap-1.5">
          <Skeleton className="size-8 rounded-lg" />
          <Skeleton className="h-8 w-20 rounded-lg" />
          <Skeleton className="size-8 rounded-lg" />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      <Skeleton className="mt-6 h-4 w-20" />
      <div className="mt-3 grid gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white p-4">
            <div className="min-w-0 flex-1">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="mt-2 h-3 w-48" />
              <Skeleton className="mt-1.5 h-3 w-32" />
            </div>
            <div className="flex flex-col items-end gap-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
