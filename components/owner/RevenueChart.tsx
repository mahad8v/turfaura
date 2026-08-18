"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/format";

export interface RevenuePoint {
  key: string;
  label: string;
  value: number;
}

/** Rounds a max value up to a clean step for axis ticks (e.g. 4,300 -> 5,000). */
function niceCeiling(value: number): number {
  if (value <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return step * magnitude;
}

export function RevenueChart({ points, currency }: { points: RevenuePoint[]; currency: string }) {
  const [active, setActive] = useState<number | null>(null);

  const rawMax = Math.max(...points.map((p) => p.value), 0);
  const axisMax = niceCeiling(rawMax);
  const ticks = [axisMax, axisMax * 0.75, axisMax * 0.5, axisMax * 0.25, 0];

  return (
    <div>
      <div className="flex h-52">
        <div className="flex w-16 shrink-0 flex-col justify-between pr-2 text-right text-[10px] tabular-nums text-zinc-400">
          {ticks.map((t) => (
            <span key={t}>{formatMoney(t, currency)}</span>
          ))}
        </div>

        <div className="relative flex-1">
          <div className="absolute inset-0 flex flex-col justify-between">
            {ticks.map((t) => (
              <div key={t} className="border-t border-zinc-100" />
            ))}
          </div>

          <div className="relative flex h-full items-end gap-1.5 sm:gap-2.5">
            {points.map((p, i) => {
              const heightPct = axisMax > 0 ? Math.max((p.value / axisMax) * 100, p.value > 0 ? 3 : 0) : 0;
              const isActive = active === i;
              return (
                <div
                  key={p.key}
                  className="group relative flex h-full flex-1 flex-col items-center justify-end"
                  onMouseEnter={() => setActive(i)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                  tabIndex={0}
                >
                  {isActive && (
                    <div className="pointer-events-none absolute bottom-full z-10 mb-2 whitespace-nowrap rounded-lg bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg">
                      <span className="block font-semibold">{formatMoney(p.value, currency)}</span>
                      <span className="block text-[10px] text-zinc-300">{p.label}</span>
                    </div>
                  )}
                  <div
                    className={`w-full max-w-6 rounded-t-sm transition-colors ${isActive ? "bg-emerald-500" : "bg-emerald-600"}`}
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-2 flex gap-1.5 pl-16 sm:gap-2.5">
        {points.map((p) => (
          <span key={p.key} className="flex-1 truncate text-center text-[10px] text-zinc-400">
            {p.label}
          </span>
        ))}
      </div>
    </div>
  );
}
