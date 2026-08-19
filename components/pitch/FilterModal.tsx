"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { TextField } from "@/components/shared/fields";
import { Button } from "@/components/shared/Button";
import { PITCH_TYPE_LABELS, PITCH_TYPE_OPTIONS } from "@/lib/pitch-type";
import type { PitchType } from "@/generated/prisma/client";

interface FilterModalProps {
  q?: string;
  area?: string;
  type?: PitchType;
  minPrice?: string;
  maxPrice?: string;
  date?: string;
  time?: string;
  activeCount: number;
}

export function FilterModal({ q, area, type, minPrice, maxPrice, date, time, activeCount }: FilterModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<PitchType | undefined>(type);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    for (const [key, value] of formData.entries()) {
      if (typeof value === "string" && value) params.set(key, value);
    }
    setOpen(false);
    router.push(params.size > 0 ? `/?${params.toString()}` : "/");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-between rounded-full border border-zinc-200 bg-white px-4 py-3 text-left transition-colors hover:border-zinc-300 hover:bg-zinc-50"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-zinc-700">
          <SlidersHorizontal className="size-4 text-emerald-600" />
          Price, date &amp; pitch size
        </span>
        {activeCount > 0 ? (
          <span className="flex size-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
            {activeCount}
          </span>
        ) : (
          <span className="text-xs text-zinc-400">Any</span>
        )}
      </button>

      <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
        <div
          className={`absolute inset-0 bg-zinc-900/50 transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0"}`}
          onClick={() => setOpen(false)}
        />
        <div
          className={`absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl transition-transform duration-200 sm:inset-x-auto sm:left-1/2 sm:top-1/2 sm:bottom-auto sm:w-full sm:max-w-md sm:-translate-x-1/2 sm:rounded-3xl ${
            open ? "translate-y-0 sm:-translate-y-1/2" : "translate-y-full sm:translate-y-[-40%] sm:opacity-0"
          }`}
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-zinc-900">Filters</h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close filters"
              className="flex size-8 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100"
            >
              <X className="size-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-5">
            {q && <input type="hidden" name="q" value={q} />}
            {area && <input type="hidden" name="area" value={area} />}
            <input type="hidden" name="type" value={selectedType ?? ""} />

            <div>
              <p className="mb-2 text-sm font-medium text-zinc-700">Pitch size</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedType(undefined)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    !selectedType ? "bg-emerald-600 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  }`}
                >
                  All
                </button>
                {PITCH_TYPE_OPTIONS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setSelectedType(value)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      selectedType === value ? "bg-emerald-600 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                    }`}
                  >
                    {PITCH_TYPE_LABELS[value]}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <TextField label="Min price" name="minPrice" type="number" min="0" inputSize="sm" defaultValue={minPrice} />
              <TextField label="Max price" name="maxPrice" type="number" min="0" inputSize="sm" defaultValue={maxPrice} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <TextField label="Date" name="date" type="date" defaultValue={date} />
              <TextField label="Time" name="time" type="time" defaultValue={time} />
            </div>

            <div className="flex items-center gap-3 pt-1 pb-1">
              <Button type="submit" size="lg" className="flex-1">
                Show results
              </Button>
              {activeCount > 0 && (
                <Link
                  href={`/${q ? `?q=${encodeURIComponent(q)}` : ""}`}
                  onClick={() => setOpen(false)}
                  className="rounded-full px-3 py-2 text-sm font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
                >
                  Clear
                </Link>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
