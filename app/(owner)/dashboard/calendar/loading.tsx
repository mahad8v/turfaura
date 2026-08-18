import { Skeleton, CalendarSkeleton } from "@/components/shared/Skeleton";

export default function Loading() {
  return (
    <div>
      <Skeleton className="h-6 w-24" />
      <Skeleton className="mt-2 h-3.5 w-44" />
      <div className="mt-6 max-w-xl">
        <CalendarSkeleton />
      </div>
    </div>
  );
}
