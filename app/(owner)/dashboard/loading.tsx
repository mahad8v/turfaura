import { Skeleton, StatCardSkeleton, ListRowSkeleton } from "@/components/shared/Skeleton";

export default function Loading() {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="mt-2 h-3.5 w-36" />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      <Skeleton className="mt-8 h-4 w-20" />
      <div className="mt-3 max-w-2xl">
        <ListRowSkeleton />
      </div>
    </div>
  );
}
