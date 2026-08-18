import { Skeleton, StatCardSkeleton } from "@/components/shared/Skeleton";

export default function Loading() {
  return (
    <div>
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-zinc-900 via-indigo-950 to-zinc-950 px-5 py-8 shadow-xl sm:px-8 sm:py-10">
        <div className="bg-hero-dots absolute inset-0 opacity-20" />
        <div className="relative">
          <div className="h-6 w-32 animate-pulse rounded-full bg-white/10" />
          <div className="mt-4 h-8 w-48 animate-pulse rounded-full bg-white/10" />
          <div className="mt-3 h-4 w-64 animate-pulse rounded-full bg-white/10" />
        </div>
      </div>

      <div className="relative z-10 -mt-8 grid gap-4 px-1 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-5">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 lg:col-span-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-5 h-3 w-full rounded-full" />
          <div className="mt-4 flex flex-wrap gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-24" />
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 lg:col-span-2">
          <Skeleton className="size-10 rounded-xl" />
          <Skeleton className="mt-3.5 h-3 w-28" />
          <Skeleton className="mt-2 h-7 w-32" />
        </div>
      </div>
    </div>
  );
}
