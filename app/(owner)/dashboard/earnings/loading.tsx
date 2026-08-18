import { Skeleton } from "@/components/shared/Skeleton";

export default function Loading() {
  return (
    <div>
      <Skeleton className="h-6 w-24" />
      <Skeleton className="mt-2 h-3.5 w-full max-w-md" />
      <Skeleton className="mt-1.5 h-3.5 w-2/3 max-w-sm" />

      <div className="mt-6 max-w-sm">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <Skeleton className="size-9 rounded-xl" />
          <Skeleton className="mt-3.5 h-3.5 w-36" />
          <Skeleton className="mt-2 h-7 w-28" />
          <Skeleton className="mt-2.5 h-3.5 w-32" />
        </div>
      </div>
    </div>
  );
}
