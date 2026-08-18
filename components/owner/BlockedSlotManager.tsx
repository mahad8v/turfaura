"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarOff, Repeat, X, CircleAlert, Plus } from "lucide-react";
import { TextField } from "@/components/shared/fields";
import { Button } from "@/components/shared/Button";
import { formatDateLong, formatTime12h } from "@/lib/format";
import { timeToMinutes, addMinutesToTime } from "@/lib/time";

interface BlockedSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string | null;
  reason: string | null;
}

interface RecurringBlockedSlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

// dayOfWeek follows Date#getUTCDay() (0 = Sunday), displayed Monday-first.
const DAYS = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 0, label: "Sun" },
];

export function BlockedSlotManager({
  pitchId,
  openTime,
  closeTime,
  slotDurationMinutes,
  blockedSlots,
  recurringBlockedSlots,
  addBlockedSlot,
  removeBlockedSlot,
  toggleRecurringBlockedSlot,
}: {
  pitchId: string;
  openTime: string;
  closeTime: string;
  slotDurationMinutes: number;
  blockedSlots: BlockedSlot[];
  recurringBlockedSlots: RecurringBlockedSlot[];
  addBlockedSlot: (pitchId: string, formData: FormData) => Promise<void>;
  removeBlockedSlot: (id: string) => Promise<void>;
  toggleRecurringBlockedSlot: (pitchId: string, dayOfWeek: number, startTime: string, endTime: string) => Promise<void>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState(1);
  const [togglingSlot, setTogglingSlot] = useState<string | null>(null);
  const router = useRouter();

  const daySlots = useMemo(() => {
    const slots: string[] = [];
    let cursor = openTime;
    while (timeToMinutes(cursor) < timeToMinutes(closeTime)) {
      slots.push(cursor);
      cursor = addMinutesToTime(cursor, slotDurationMinutes);
    }
    return slots;
  }, [openTime, closeTime, slotDurationMinutes]);

  const countForDay = (day: number) => recurringBlockedSlots.filter((b) => b.dayOfWeek === day).length;
  const isSlotBlocked = (startTime: string) =>
    recurringBlockedSlots.some((b) => b.dayOfWeek === activeDay && b.startTime === startTime);

  function handleToggleSlot(startTime: string) {
    setError(null);
    setTogglingSlot(startTime);
    startTransition(async () => {
      try {
        await toggleRecurringBlockedSlot(pitchId, activeDay, startTime, addMinutesToTime(startTime, slotDurationMinutes));
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not update that slot.");
      } finally {
        setTogglingSlot(null);
      }
    });
  }

  function handleAdd(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await addBlockedSlot(pitchId, formData);
        router.refresh();
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
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not remove that blocked date.");
      } finally {
        setRemovingId(null);
      }
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-2xl border border-zinc-200 bg-white p-5">
        <h2 className="flex items-center gap-2 font-display text-sm font-bold text-zinc-900">
          <span className="flex size-6 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
            <Repeat className="size-3.5" strokeWidth={2.25} />
          </span>
          Regulars&apos; standing times
        </h2>
        <p className="mt-1.5 text-xs text-zinc-500">
          Tap a day, then tap the times a regular group always plays — those slots stay unavailable every week.
        </p>

        <div className="mt-4 flex gap-3">
          <div className="flex shrink-0 flex-col gap-1">
            {DAYS.map((day) => {
              const active = activeDay === day.value;
              const count = countForDay(day.value);
              return (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => setActiveDay(day.value)}
                  className={`relative flex items-center justify-center rounded-full px-3 py-2 text-xs font-medium transition-colors ${
                    active ? "bg-emerald-600 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  }`}
                >
                  {day.label}
                  {count > 0 && (
                    <span
                      className={`ml-1.5 flex size-4 items-center justify-center rounded-full text-[10px] font-semibold ${
                        active ? "bg-white/25 text-white" : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="grid flex-1 grid-cols-2 content-start gap-2 sm:grid-cols-3">
            {daySlots.map((start) => {
              const blocked = isSlotBlocked(start);
              const toggling = isPending && togglingSlot === start;
              return (
                <button
                  key={start}
                  type="button"
                  disabled={toggling}
                  onClick={() => handleToggleSlot(start)}
                  className={`rounded-full border px-3 py-2.5 text-center text-sm font-medium transition-all active:scale-[0.97] disabled:opacity-60 ${
                    blocked
                      ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                      : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
                  }`}
                >
                  {formatTime12h(start)}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5">
        <h2 className="flex items-center gap-2 font-display text-sm font-bold text-zinc-900">
          <span className="flex size-6 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
            <CalendarOff className="size-3.5" strokeWidth={2.25} />
          </span>
          One-off blocked dates
        </h2>
        <p className="mt-1.5 text-xs text-zinc-500">Mark maintenance, private hire, or other specific dates off.</p>

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
        </form>
      </section>

      {error && (
        <p className="flex items-center gap-1.5 text-sm text-red-600">
          <CircleAlert className="size-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
