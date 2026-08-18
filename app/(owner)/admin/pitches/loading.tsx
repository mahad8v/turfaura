import { Skeleton, ListRowSkeleton } from "@/components/shared/Skeleton";

export default function Loading() {
  return (
    <div>
      <div className="flex items-center gap-3">
        <Skeleton className="size-11 rounded-2xl" />
        <div>
          <Skeleton className="h-5 w-28" />
          <Skeleton className="mt-2 h-3.5 w-64" />
        </div>
      </div>
      <div className="mt-6 flex flex-col gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ListRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
