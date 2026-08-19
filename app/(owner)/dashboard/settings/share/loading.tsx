import { Skeleton } from "@/components/shared/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl">
      <Skeleton className="h-3.5 w-16" />
      <Skeleton className="mt-3 h-6 w-40" />
      <Skeleton className="mt-2 h-3.5 w-full max-w-md" />

      <div className="mt-6 flex flex-col items-center gap-5 rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8">
        <Skeleton className="size-[220px] rounded-2xl" />
        <Skeleton className="h-11 w-full max-w-md" />
        <div className="flex gap-2.5">
          <Skeleton className="h-11 w-28" />
          <Skeleton className="h-11 w-24" />
        </div>
      </div>
    </div>
  );
}
