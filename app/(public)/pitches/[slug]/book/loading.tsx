import { Skeleton } from "@/components/shared/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
      <Skeleton className="h-3.5 w-36" />
      <Skeleton className="mt-2 h-7 w-48" />

      <div className="mt-5 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <div className="bg-emerald-50/60 px-5 py-4">
          <div className="h-4 w-32 animate-pulse rounded-full bg-emerald-900/10" />
          <div className="mt-2.5 h-3.5 w-44 animate-pulse rounded-full bg-emerald-900/10" />
          <div className="mt-1.5 h-3.5 w-36 animate-pulse rounded-full bg-emerald-900/10" />
        </div>
        <div className="px-5 py-4">
          <div className="flex justify-between">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="mt-3 h-3 w-full" />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5">
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="h-3 w-16" />
              <Skeleton className="mt-2 h-11 w-full" />
            </div>
          ))}
        </div>
        <Skeleton className="mt-4 h-12 w-full" />
      </div>
    </div>
  );
}
