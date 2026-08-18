import { Skeleton } from "@/components/shared/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
      <div className="flex flex-col items-center text-center">
        <Skeleton className="size-14" />
        <Skeleton className="mt-4 h-3 w-32" />
        <Skeleton className="mt-2 h-8 w-40" />
        <Skeleton className="mt-3 h-6 w-24" />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <div className="p-5">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="mt-2.5 h-3.5 w-52" />
          <Skeleton className="mt-2 h-3.5 w-36" />
          <Skeleton className="mt-1.5 h-3.5 w-40" />
          <div className="mt-3 flex gap-5 border-t border-zinc-100 pt-3">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-3.5 w-24" />
          </div>
        </div>
        <div className="border-t border-dashed border-zinc-200 bg-zinc-50/60 p-5">
          <div className="flex justify-between">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="mt-2.5 h-3 w-56" />
        </div>
      </div>

      <Skeleton className="mt-6 aspect-[16/9] w-full rounded-2xl" />

      <div className="mt-6 flex gap-4">
        <Skeleton className="h-11 w-32" />
        <Skeleton className="h-11 w-28" />
      </div>
    </div>
  );
}
