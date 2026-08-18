import { Skeleton } from "@/components/shared/Skeleton";

export default function Loading() {
  return (
    <div className="max-w-2xl">
      <Skeleton className="h-3.5 w-16" />
      <Skeleton className="mt-3 h-6 w-32" />
      <Skeleton className="mt-2 h-3.5 w-full max-w-sm" />

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
    </div>
  );
}
