import { Skeleton } from "@/components/shared/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl">
      <Skeleton className="h-3.5 w-16" />
      <Skeleton className="mt-3 h-6 w-24" />
      <Skeleton className="mt-2 h-3.5 w-48" />

      <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="h-3 w-16" />
            <Skeleton className="mt-2 h-11 w-full" />
          </div>
        ))}
        <Skeleton className="h-11 w-32" />
      </div>
    </div>
  );
}
