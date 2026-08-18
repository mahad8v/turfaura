import { Skeleton } from "@/components/shared/Skeleton";

export default function Loading() {
  return (
    <div className="max-w-2xl">
      <Skeleton className="h-6 w-24" />
      <Skeleton className="mt-2 h-3.5 w-56" />

      <div className="mt-6 flex flex-col gap-5">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-24" />
          </div>
          <Skeleton className="mt-3 h-3.5 w-full max-w-sm" />
          <Skeleton className="mt-3 h-14 w-full" />
        </div>

        <div className="grid gap-4 rounded-2xl border border-zinc-200 bg-white p-5 sm:grid-cols-2">
          <Skeleton className="col-span-full h-4 w-20" />
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="h-3 w-16" />
              <Skeleton className="mt-2 h-11 w-full" />
            </div>
          ))}
        </div>
        <Skeleton className="h-12 w-40" />

        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <Skeleton className="h-4 w-44" />
          <Skeleton className="mt-3 h-3.5 w-full max-w-sm" />
          <Skeleton className="mt-3 h-11 w-full" />
        </div>
      </div>
    </div>
  );
}
