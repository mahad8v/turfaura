"use client";

import { useState, useTransition } from "react";
import { CalendarOff, X, CircleAlert, Plus } from "lucide-react";
import { TextField } from "@/components/shared/fields";
import { Button } from "@/components/shared/Button";
import { formatDateLong } from "@/lib/format";

interface BlockedSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string | null;
  reason: string | null;
}

export function BlockedSlotManager({
  pitchId,
  blockedSlots,
  addBlockedSlot,
  removeBlockedSlot,
}: {
  pitchId: string;
  blockedSlots: BlockedSlot[];
  addBlockedSlot: (pitchId: string, formData: FormData) => Promise<void>;
  removeBlockedSlot: (id: string) => Promise<void>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [removingId, setRemovingId] = useState<string | null>(null);

  function handleAdd(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await addBlockedSlot(pitchId, formData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not add that blocked date.");
      }
    });
  }

  function handleRemove(id: string) {
    setError(null);
    setRemovingId(id);
    startTransition(async () => {
      try {
        await removeBlockedSlot(id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not remove that blocked date.");
      } finally {
        setRemovingId(null);
      }
    });
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="flex items-center gap-2 font-display text-sm font-bold text-zinc-900">
        <span className="flex size-6 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
          <CalendarOff className="size-3.5" strokeWidth={2.25} />
        </span>
        Blocked dates
      </h2>
      <p className="mt-1.5 text-xs text-zinc-500">
        Mark maintenance, private hire, or other times the pitch isn&apos;t bookable.
      </p>

      {blockedSlots.length > 0 && (
        <ul className="mt-4 flex flex-col gap-2">
          {blockedSlots.map((slot) => {
            const removing = isPending && removingId === slot.id;
            return (
              <li
                key={slot.id}
                className="flex items-center gap-3 rounded-xl bg-zinc-50 py-2.5 pl-3 pr-2 text-sm text-zinc-700"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-zinc-400 ring-1 ring-inset ring-zinc-200">
                  <CalendarOff className="size-3.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-zinc-900">{formatDateLong(slot.date)}</span>
                  <span className="block truncate text-xs text-zinc-500">
                    {slot.startTime}
                    {slot.endTime ? `–${slot.endTime}` : " onward"}
                    {slot.reason && ` — ${slot.reason}`}
                  </span>
                </span>
                <button
                  type="button"
                  disabled={removing}
                  onClick={() => handleRemove(slot.id)}
                  aria-label="Remove blocked date"
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition-all active:scale-90 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                >
                  <X className="size-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <form action={handleAdd} className="mt-4 flex flex-col gap-3 border-t border-zinc-100 pt-4">
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Date" name="date" type="date" required />
          <TextField label="From" name="startTime" type="time" defaultValue="00:00" />
          <TextField label="To (optional)" name="endTime" type="time" />
          <TextField label="Reason (optional)" name="reason" />
        </div>
        <div>
          <Button type="submit" size="sm" pending={isPending} pendingText="Adding…" icon={<Plus className="size-3.5" />}>
            Add blocked date
          </Button>
        </div>
        {error && (
          <p className="flex items-center gap-1.5 text-sm text-red-600">
            <CircleAlert className="size-4 shrink-0" />
            {error}
          </p>
        )}
      </form>
    </section>
  );
}
