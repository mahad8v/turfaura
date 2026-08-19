'use client';

import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export function SearchBar({
  query,
  area,
  type,
  minPrice,
  maxPrice,
  date,
  time,
}: {
  query?: string;
  area?: string;
  type?: string;
  minPrice?: string;
  maxPrice?: string;
  date?: string;
  time?: string;
}) {
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string' && value) params.set(key, value);
    }
    router.push(params.size > 0 ? `/?${params.toString()}` : '/');
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="animate-fade-in-up mt-6 flex max-w-md items-center gap-2 rounded-full bg-white p-1.5 shadow-lg [animation-delay:220ms]"
    >
      <Search className="ml-2 size-4 shrink-0 text-zinc-400" />
      <input
        type="search"
        name="q"
        defaultValue={query}
        placeholder="Pitch name or neighbourhood…"
        className="min-w-0 flex-1 bg-transparent px-1 py-.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
      />
      {area && <input type="hidden" name="area" value={area} />}
      {type && <input type="hidden" name="type" value={type} />}
      {minPrice && <input type="hidden" name="minPrice" value={minPrice} />}
      {maxPrice && <input type="hidden" name="maxPrice" value={maxPrice} />}
      {date && <input type="hidden" name="date" value={date} />}
      {time && <input type="hidden" name="time" value={time} />}
      <button
        type="submit"
        aria-label="Search"
        className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white transition-all hover:bg-emerald-400 active:scale-95"
      >
        <Search className="size-4" />
      </button>
    </form>
  );
}
