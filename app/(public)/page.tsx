import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { PitchCard } from '@/components/pitch/PitchCard';
import { FilterModal } from '@/components/pitch/FilterModal';
import { SearchBar } from '@/components/pitch/SearchBar';
import { PITCH_TYPE_OPTIONS } from '@/lib/pitch-type';
import { getAvailability } from '@/lib/availability';
import type { PitchType } from '@/generated/prisma/client';

interface Filters {
  q?: string;
  area?: string;
  type?: PitchType;
  minPrice?: string;
  maxPrice?: string;
  date?: string;
  time?: string;
}

function buildQuery(
  filters: Filters,
  overrides: Partial<Filters> = {},
): string {
  const merged = { ...filters, ...overrides };
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(merged)) {
    if (value) params.set(key, value);
  }
  const qs = params.toString();
  return qs ? `/?${qs}` : '/';
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Filters>;
}) {
  const { q, area, type, minPrice, maxPrice, date, time } = await searchParams;
  const filters: Filters = { q, area, type, minPrice, maxPrice, date, time };

  const query = q?.trim();
  const validType =
    type && (PITCH_TYPE_OPTIONS as string[]).includes(type) ? type : undefined;
  const min =
    minPrice && !Number.isNaN(Number(minPrice)) ? Number(minPrice) : undefined;
  const max =
    maxPrice && !Number.isNaN(Number(maxPrice)) ? Number(maxPrice) : undefined;
  const validDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : undefined;
  const validTime = time && /^\d{2}:\d{2}$/.test(time) ? time : undefined;

  const [allAreas, pitchesRaw] = await Promise.all([
    prisma.pitch.findMany({
      where: { isActive: true, area: { not: '' } },
      select: { area: true },
      distinct: ['area'],
      orderBy: { area: 'asc' },
    }),
    prisma.pitch.findMany({
      where: {
        isActive: true,
        ...(query
          ? {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { address: { contains: query, mode: 'insensitive' } },
              ],
            }
          : {}),
        ...(area ? { area } : {}),
        ...(validType ? { type: validType } : {}),
        ...(min !== undefined || max !== undefined
          ? {
              basePricePerHour: {
                ...(min !== undefined ? { gte: min } : {}),
                ...(max !== undefined ? { lte: max } : {}),
              },
            }
          : {}),
      },
      include: { photos: { orderBy: { sortOrder: 'asc' }, take: 1 } },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  let pitches = pitchesRaw;
  if (validDate) {
    const available = [];
    for (const pitch of pitches) {
      const slots = await getAvailability(pitch.id, validDate);
      const hasOpening = validTime
        ? slots.some((s) => s.startTime === validTime && s.available)
        : slots.some((s) => s.available);
      if (hasOpening) available.push(pitch);
    }
    pitches = available;
  }

  const activeModalFilterCount = [
    validType,
    min !== undefined,
    max !== undefined,
    validDate,
  ].filter(Boolean).length;

  return (
    <div>
      <section className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 sm:pt-8">
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-zinc-900 via-emerald-950 to-zinc-950 px-5 py-8 shadow-xl sm:px-8 sm:py-10">
          <div className="bg-hero-dots absolute inset-0 opacity-20" />
          <div className="pointer-events-none absolute -top-16 right-0 size-72 rounded-full bg-emerald-500/20 blur-3xl" />

          <div className="relative">
            <span className="animate-fade-in-up inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-emerald-200 ring-1 ring-inset ring-white/20">
              {/* <Zap className="size-3.5 text-lime-300" /> */}
              Instant booking, no sign-up
            </span>
            <h1 className="animate-fade-in-up font-display mt-4 max-w-sm text-2xl font-extrabold leading-tight text-white sm:text-4xl [animation-delay:80ms]">
              Book a pitch with your crew
            </h1>
            <p className="animate-fade-in-up mt-2 max-w-sm text-sm text-emerald-100/70 [animation-delay:150ms]">
              Pick a time, request your slot, and pay cash at the pitch after
              you play.
            </p>

            <SearchBar
              query={query}
              area={area}
              type={validType}
              minPrice={minPrice}
              maxPrice={maxPrice}
              date={validDate}
              time={validTime}
            />
          </div>
        </div>
      </section>

      {allAreas.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-zinc-900">
            <MapPin className="size-4 text-emerald-600" />
            Browse by location
          </h2>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            <Link
              href={buildQuery(filters, { area: undefined })}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                !area
                  ? 'bg-zinc-900 text-white'
                  : 'bg-white text-zinc-600 ring-1 ring-inset ring-zinc-200 hover:bg-zinc-50'
              }`}
            >
              All areas
            </Link>
            {allAreas.map(({ area: a }) => (
              <Link
                key={a}
                href={buildQuery(filters, { area: a })}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  area === a
                    ? 'bg-zinc-900 text-white'
                    : 'bg-white text-zinc-600 ring-1 ring-inset ring-zinc-200 hover:bg-zinc-50'
                }`}
              >
                {a}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        <FilterModal
          q={query}
          area={area}
          type={validType}
          minPrice={minPrice}
          maxPrice={maxPrice}
          date={validDate}
          time={validTime}
          activeCount={activeModalFilterCount}
        />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="font-display text-lg font-bold text-zinc-900 sm:text-xl">
            {query ? `Results for "${query}"` : 'Popular pitches'}
          </h2>
          {pitches.length > 0 && (
            <span className="text-sm text-zinc-400">
              {pitches.length} pitch{pitches.length === 1 ? '' : 'es'}
            </span>
          )}
        </div>

        {pitches.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white py-16 text-center">
            <p className="text-sm text-zinc-500">
              No pitches match your filters
              {validDate ? ' for that date' : ''}
              {query ? ` and search for "${query}"` : ''}. Try widening your
              search.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:gap-5 lg:grid-cols-3">
            {pitches.map((pitch) => (
              <PitchCard
                key={pitch.id}
                slug={pitch.slug}
                name={pitch.name}
                address={pitch.address}
                type={pitch.type}
                basePricePerHour={pitch.basePricePerHour.toString()}
                currency={pitch.currency}
                photoPath={pitch.photos[0]?.storagePath}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
