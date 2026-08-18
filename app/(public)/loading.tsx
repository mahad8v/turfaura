import { Skeleton, PitchCardSkeleton } from "@/components/shared/Skeleton";

export default function Loading() {
  return (
    <div>
      <section className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 sm:pt-8">
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-zinc-900 via-emerald-950 to-zinc-950 px-5 py-8 shadow-xl sm:px-8 sm:py-10">
          <div className="bg-hero-dots absolute inset-0 opacity-20" />
          <div className="relative">
            <div className="h-6 w-40 animate-pulse rounded-full bg-white/10" />
            <div className="mt-4 h-8 w-56 animate-pulse rounded-full bg-white/10 sm:h-10 sm:w-72" />
            <div className="mt-3 h-4 w-64 animate-pulse rounded-full bg-white/10" />
            <div className="mt-6 h-12 max-w-md animate-pulse rounded-full bg-white/10" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <Skeleton className="h-5 w-40" />
        <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-5 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <PitchCardSkeleton key={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
