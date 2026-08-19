import { Skeleton, StatCardSkeleton } from "@/components/shared/Skeleton";

export default function Loading() {
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
        <div>
          <Skeleton className="h-6 w-24" />
          <Skeleton className="mt-2 h-3.5 w-56" />
        </div>
        <Skeleton className="h-3 w-28" />
      </div>
      <Skeleton className="mt-3 h-3 w-full max-w-lg" />

      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 lg:col-span-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-1.5 h-3 w-56" />
          <div className="mt-6 flex h-52 items-end gap-2.5 pl-16">
            {["h-1/3", "h-1/2", "h-2/3", "h-2/5", "h-3/4", "h-1/2", "h-full", "h-3/5", "h-2/5", "h-1/2"].map((h, i) => (
              <Skeleton key={i} className={`w-full flex-1 rounded-t-sm rounded-b-none ${h}`} />
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 lg:col-span-2">
          <Skeleton className="h-4 w-20" />
          <div className="mt-4 flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-3">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-3.5 w-14" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-5">
        <Skeleton className="h-4 w-28" />
        <div className="mt-4 flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-3">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3.5 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
