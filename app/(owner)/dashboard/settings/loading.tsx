import { Skeleton } from "@/components/shared/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl">
      <Skeleton className="mx-auto h-6 w-20" />

      <div className="mt-6 flex flex-col gap-5">
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-zinc-900 via-emerald-950 to-zinc-950 px-5 py-6 shadow-xl">
          <div className="bg-hero-dots absolute inset-0 opacity-20" />
          <div className="relative flex items-center gap-3">
            <div className="size-12 shrink-0 animate-pulse rounded-2xl bg-white/10" />
            <div className="min-w-0 flex-1">
              <div className="h-5 w-32 animate-pulse rounded-full bg-white/10" />
              <div className="mt-2 h-3 w-40 animate-pulse rounded-full bg-white/10" />
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          <div className="divide-y divide-zinc-100">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3.5">
                <Skeleton className="size-4.5" />
                <Skeleton className="h-3.5 w-32" />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="mt-3 h-3.5 w-full max-w-sm" />
          <Skeleton className="mt-3 h-9 w-36" />
        </div>

        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          <div className="flex items-center gap-3 px-4 py-3.5">
            <Skeleton className="size-4.5" />
            <Skeleton className="h-3.5 w-20" />
          </div>
        </div>
      </div>
    </div>
  );
}
