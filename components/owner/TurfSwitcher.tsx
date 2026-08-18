"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronsUpDown, Check, MapPinned, Ban, CircleAlert } from "lucide-react";

export interface SwitchableTurf {
  id: string;
  name: string;
  address: string;
  isActive: boolean;
}

export function TurfSwitcher({
  turfs,
  activeTurfId,
  setActivePitch,
}: {
  turfs: SwitchableTurf[];
  activeTurfId: string;
  setActivePitch: (pitchId: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const rootRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const active = turfs.find((t) => t.id === activeTurfId);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function selectTurf(pitchId: string) {
    if (pitchId === activeTurfId) {
      setOpen(false);
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await setActivePitch(pitchId);
        setOpen(false);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not switch turfs.");
      }
    });
  }

  if (turfs.length <= 1) {
    return (
      <div className="flex items-center gap-2.5 rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-600">
        <MapPinned className="size-4 shrink-0 text-zinc-400" />
        {active ? (
          <span>
            Only one turf on your account — <span className="font-medium text-zinc-900">{active.name}</span>.
          </span>
        ) : (
          <span>No turfs yet — add one to get started.</span>
        )}
      </div>
    );
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={isPending}
        className="flex w-full items-center gap-3 rounded-full border border-zinc-200 bg-white px-4 py-3 text-left text-sm transition-colors hover:border-zinc-300 disabled:opacity-60"
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
          <MapPinned className="size-4" strokeWidth={2.25} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium text-zinc-900">{active?.name ?? "Select a turf"}</span>
          <span className="block truncate text-xs text-zinc-500">{active?.address}</span>
        </span>
        <ChevronsUpDown className="size-4 shrink-0 text-zinc-400" />
      </button>

      {open && (
        <div className="absolute z-20 mt-1.5 w-full overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg">
          <ul className="max-h-72 overflow-y-auto py-1">
            {turfs.map((turf) => (
              <li key={turf.id}>
                <button
                  type="button"
                  onClick={() => selectTurf(turf.id)}
                  disabled={isPending}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm transition-colors hover:bg-zinc-50 disabled:opacity-60"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500">
                    {turf.isActive ? <MapPinned className="size-3.5" /> : <Ban className="size-3.5" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-zinc-900">{turf.name}</span>
                    <span className="block truncate text-xs text-zinc-400">{turf.address}</span>
                  </span>
                  {turf.id === activeTurfId && <Check className="size-4 shrink-0 text-emerald-600" />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && (
        <p className="mt-2 flex items-center gap-1.5 text-sm text-red-600">
          <CircleAlert className="size-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
