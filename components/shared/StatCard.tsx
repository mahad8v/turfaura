import type { LucideIcon } from "lucide-react";

type Accent = "emerald" | "indigo" | "amber";

const accentClasses: Record<Accent, string> = {
  emerald: "bg-emerald-50 text-emerald-600",
  indigo: "bg-indigo-50 text-indigo-600",
  amber: "bg-amber-50 text-amber-600",
};

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  accent = "emerald",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  accent?: Accent;
}) {
  return (
    <div className="group rounded-2xl border border-zinc-200 bg-white p-3.5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md sm:p-5">
      <span
        className={`flex size-8 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-105 sm:size-10 sm:rounded-xl ${accentClasses[accent]}`}
      >
        <Icon className="size-4 sm:size-4.5" strokeWidth={2.25} />
      </span>
      <p className="mt-2.5 truncate text-xs text-zinc-500 sm:mt-3.5 sm:text-sm">{label}</p>
      <p className="font-display mt-0.5 text-xl font-extrabold tracking-tight text-zinc-900 sm:text-2xl">{value}</p>
      {hint && <p className="mt-1 truncate text-[11px] text-zinc-400 sm:text-xs">{hint}</p>}
    </div>
  );
}
