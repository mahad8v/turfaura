import { Skeleton } from "@/components/shared/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="grid gap-8 lg:grid-cols-3 lg:gap-10">
        <div className="lg:col-span-2">
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="mt-3 h-4 w-1/2" />

          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-xl" />
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-2">
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-5/6" />
            <Skeleton className="h-3.5 w-2/3" />
          </div>

          <Skeleton className="mt-6 aspect-[16/9] w-full rounded-2xl" />
        </div>

        <div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="mt-2 h-7 w-32" />
            <Skeleton className="mt-3 h-3.5 w-40" />
          </div>
          <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-3 h-12 w-full" />
            <div className="mt-3 grid grid-cols-3 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-9 rounded-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
