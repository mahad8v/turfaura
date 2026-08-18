import { Skeleton } from "@/components/shared/Skeleton";

export default function Loading() {
  return (
    <div>
      <Skeleton className="h-6 w-28" />
      <Skeleton className="mt-2 h-3.5 w-32" />

      <div className="mt-4 flex flex-wrap items-end gap-3 rounded-2xl border border-zinc-200 bg-white p-4">
        <Skeleton className="h-11 w-44" />
        <Skeleton className="h-11 w-36" />
        <Skeleton className="h-11 w-24" />
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-zinc-200 bg-white p-4">
            <div className="flex items-start justify-between gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="mt-2 h-3 w-40" />
            <Skeleton className="mt-2.5 h-5 w-24 rounded-full" />
            <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-3">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3.5 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
