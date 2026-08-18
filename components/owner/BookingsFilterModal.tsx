"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ListFilter, X } from "lucide-react";
import { SelectField, TextField } from "@/components/shared/fields";
import { Button } from "@/components/shared/Button";

interface BookingsFilterModalProps {
  basePath: string;
  status?: string;
  date?: string;
  statusOptions: { value: string; label: string }[];
  owners?: { id: string; name: string }[];
  ownerId?: string;
  pitches?: { id: string; name: string }[];
  pitchId?: string;
}

export function BookingsFilterModal({
  basePath,
  status,
  date,
  statusOptions,
  owners,
  ownerId,
  pitches,
  pitchId,
}: BookingsFilterModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const activeCount = [status, date, ownerId, pitchId].filter(Boolean).length;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    for (const [key, value] of formData.entries()) {
      if (typeof value === "string" && value) params.set(key, value);
    }
    setOpen(false);
    router.push(params.size > 0 ? `${basePath}?${params.toString()}` : basePath);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-between rounded-full border border-zinc-200 bg-white px-4 py-3 text-left transition-colors hover:border-zinc-300 hover:bg-zinc-50 sm:w-auto sm:min-w-56"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-zinc-700">
          <ListFilter className="size-4 text-emerald-600" />
          Filters
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
            {owners && (
              <SelectField label="Owner" name="ownerId" defaultValue={ownerId ?? ""}>
                <option value="">All owners</option>
                {owners.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </SelectField>
            )}

            {pitches && (
              <SelectField label="Pitch" name="pitchId" defaultValue={pitchId ?? ""}>
                <option value="">All pitches</option>
                {pitches.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </SelectField>
            )}

            <SelectField label="Status" name="status" defaultValue={status ?? ""}>
              <option value="">All statuses</option>
              {statusOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </SelectField>

            <TextField label="Date" name="date" type="date" defaultValue={date} />

            <div className="flex items-center gap-3 pt-1 pb-1">
              <Button type="submit" size="lg" className="flex-1">
                Show results
              </Button>
              {activeCount > 0 && (
                <Link
                  href={basePath}
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
