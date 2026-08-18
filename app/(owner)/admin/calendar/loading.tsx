import { Skeleton, CalendarSkeleton } from "@/components/shared/Skeleton";

export default function Loading() {
  return (
    <div>
      <div className="flex items-center gap-3">
        <Skeleton className="size-11 rounded-2xl" />
        <div>
          <Skeleton className="h-5 w-24" />
          <Skeleton className="mt-2 h-3.5 w-56" />
        </div>
      </div>
      <div className="mt-6 max-w-xl">
        <CalendarSkeleton />
      </div>
    </div>
  );
}
