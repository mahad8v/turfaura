import { Skeleton } from "@/components/shared/Skeleton";

export default function Loading() {
  return (
    <div className="max-w-2xl">
      <Skeleton className="h-3.5 w-16" />

      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="mt-2 h-3.5 w-44" />
        </div>
        <Skeleton className="h-8 w-24 shrink-0" />
      </div>

      <div className="mt-6 flex flex-col gap-4">
        <div className="flex gap-1 rounded-2xl bg-zinc-100 p-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-9 flex-1" />
          ))}
        </div>
        <div className="grid gap-4 rounded-2xl border border-zinc-200 bg-white p-5 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="h-3 w-20" />
              <Skeleton className="mt-2 h-11 w-full" />
            </div>
          ))}
        </div>
        <Skeleton className="h-12 w-40" />
      </div>

      <div className="mt-5 rounded-2xl border border-zinc-200 bg-white p-5">
        <Skeleton className="h-4 w-24" />
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-zinc-200 bg-white p-5">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-3 h-11 w-full" />
      </div>
    </div>
  );
}
