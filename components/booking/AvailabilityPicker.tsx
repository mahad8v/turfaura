"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { CalendarDays, CircleAlert, CalendarX2 } from "lucide-react";
import { formatTime12h } from "@/lib/format";
import { Skeleton } from "@/components/shared/Skeleton";

interface Slot {
  startTime: string;
  endTime: string;
  available: boolean;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDaysIso(days: number): string {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function durationLabel(minutes: number): string {
  if (minutes % 60 === 0) {
    const hours = minutes / 60;
    return `${hours} hour${hours === 1 ? "" : "s"}`;
  }
  return `${minutes} min`;
}

async function fetchAvailability(pitchId: string, date: string, duration: number): Promise<Slot[]> {
  const res = await fetch(`/api/availability?pitchId=${pitchId}&date=${date}&duration=${duration}`);
  if (!res.ok) throw new Error("Could not load availability.");
  const data: { slots: Slot[] } = await res.json();
  return data.slots;
}

export function AvailabilityPicker({
  pitchId,
  slug,
  slotDurationMinutes,
}: {
  pitchId: string;
  slug: string;
  slotDurationMinutes: number;
}) {
  const [date, setDate] = useState(todayIso);
  const [durationMultiplier, setDurationMultiplier] = useState(1);

  const duration = slotDurationMinutes * durationMultiplier;

  const {
    data: slots,
    isPending,
    isPlaceholderData,
    error,
  } = useQuery({
    queryKey: ["availability", pitchId, date, duration],
    queryFn: () => fetchAvailability(pitchId, date, duration),
    // Keep showing the last result while a new date/duration loads instead
    // of flashing back to a blank spinner every time — the picker already
    // has data on screen, no need to hide it while the next combo loads.
    placeholderData: keepPreviousData,
  });

  const availableCount = (slots ?? []).filter((s) => s.available).length;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5">
      <h2 className="flex items-center gap-2 font-display text-sm font-bold text-zinc-900">
        <CalendarDays className="size-4 text-emerald-600" />
        Pick a time
      </h2>
      <input
        type="date"
        value={date}
        min={todayIso()}
        max={addDaysIso(60)}
        onChange={(e) => setDate(e.target.value)}
        className="mt-3 w-full rounded-full border border-zinc-200 px-4 py-3 text-sm text-zinc-900 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
      />

      <p className="mt-3 text-xs font-medium text-zinc-500">Duration</p>
      <div className="mt-1.5 flex gap-1.5">
        {[1, 2, 3].map((multiplier) => (
          <button
            key={multiplier}
            type="button"
            onClick={() => setDurationMultiplier(multiplier)}
            className={`flex-1 rounded-full px-2 py-2 text-sm font-medium transition-colors ${
              durationMultiplier === multiplier
                ? "bg-emerald-600 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            {durationLabel(slotDurationMinutes * multiplier)}
          </button>
        ))}
      </div>

      <div className={`mt-4 min-h-[3.5rem] transition-opacity ${isPlaceholderData ? "opacity-50" : ""}`}>
        {isPending && (
          <>
            <Skeleton className="mb-2.5 h-3 w-32" />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-9.5 w-full" />
              ))}
            </div>
          </>
        )}
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-600">
            <CircleAlert className="size-4 shrink-0" />
            {error.message}
          </div>
        )}
        {!isPending && !error && slots.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-6 text-center text-zinc-400">
            <CalendarX2 className="size-6" strokeWidth={1.5} />
            <p className="text-sm">No {durationLabel(duration).toLowerCase()} slots fit this pitch&apos;s hours.</p>
          </div>
        )}
        {!isPending && !error && slots.length > 0 && (
          <>
            <p className="mb-2.5 text-xs text-zinc-400">
              {availableCount} of {slots.length} slots open
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {slots.map((slot) =>
                slot.available ? (
                  <Link
                    key={slot.startTime}
                    href={`/pitches/${slug}/book?date=${date}&start=${slot.startTime}&duration=${duration}`}
                    className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-center text-sm font-medium text-emerald-700 transition-all hover:border-emerald-400 hover:bg-emerald-100 active:scale-[0.97]"
                  >
                    {formatTime12h(slot.startTime)}
                  </Link>
                ) : (
                  <span
                    key={slot.startTime}
                    className="cursor-not-allowed rounded-full border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-center text-sm text-zinc-300 line-through"
                  >
                    {formatTime12h(slot.startTime)}
                  </span>
                ),
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
