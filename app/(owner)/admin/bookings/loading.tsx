import { Skeleton } from "@/components/shared/Skeleton";

export default function Loading() {
  return (
    <div>
      <div className="flex items-center gap-3">
        <Skeleton className="size-11 rounded-2xl" />
        <div>
          <Skeleton className="h-5 w-28" />
          <Skeleton className="mt-2 h-3.5 w-44" />
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5">
        <Skeleton className="h-3 w-16" />
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <Skeleton className="h-11 w-44" />
          <Skeleton className="h-11 w-44" />
          <Skeleton className="h-11 w-44" />
          <Skeleton className="h-11 w-36" />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-zinc-200 bg-white p-4">
            <div className="flex items-start justify-between gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="mt-2 h-3 w-40" />
          </div>
        ))}
      </div>
    </div>
  );
}
