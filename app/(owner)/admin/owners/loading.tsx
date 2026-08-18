import { Skeleton, EntityRowSkeleton } from "@/components/shared/Skeleton";

export default function Loading() {
  return (
    <div>
      <div className="flex items-center gap-3">
        <Skeleton className="size-11 rounded-2xl" />
        <div>
          <Skeleton className="h-5 w-20" />
          <Skeleton className="mt-2 h-3.5 w-52" />
        </div>
      </div>
      <div className="mt-6 flex flex-col gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <EntityRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
