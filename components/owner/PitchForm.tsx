"use client";

import { useActionState, useState } from "react";
import { MapPin, CircleDollarSign, Clock, CircleAlert } from "lucide-react";
import { TextField, TextAreaField, SelectField } from "@/components/shared/fields";
import { Button } from "@/components/shared/Button";
import { PITCH_TYPE_LABELS, PITCH_TYPE_OPTIONS } from "@/lib/pitch-type";

export interface PitchFormState {
  error?: string;
}

export interface PitchFormDefaults {
  name?: string;
  description?: string;
  address?: string;
  area?: string;
  type?: "FIVE_A_SIDE" | "SEVEN_A_SIDE" | "ELEVEN_A_SIDE";
  lat?: number;
  lng?: number;
  basePricePerHour?: string;
  currency?: string;
  slotDurationMinutes?: number;
  openTime?: string;
  closeTime?: string;
}

interface PitchFormProps {
  action: (prevState: PitchFormState | null, formData: FormData) => Promise<PitchFormState>;
  defaults?: PitchFormDefaults;
  submitLabel: string;
}

const TABS = [
  { id: "basics", label: "Basics", icon: MapPin },
  { id: "pricing", label: "Pricing", icon: CircleDollarSign },
  { id: "schedule", label: "Schedule", icon: Clock },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function PitchForm({ action, defaults = {}, submitLabel }: PitchFormProps) {
  const [state, formAction, pending] = useActionState(action, null);
  const [tab, setTab] = useState<TabId>("basics");

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {/* iOS-style segmented control — sections stay mounted (just hidden) so
          the single form submission still carries every field regardless of
          which tab is showing. */}
      <div className="flex gap-1 rounded-2xl bg-zinc-100 p-1">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-medium transition-all duration-150 ${
                active ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 active:scale-95"
              }`}
            >
              <Icon className="size-3.5" strokeWidth={2.25} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* No native `required` attributes here: with three fields possibly
          sitting in a currently-hidden (display:none) tab, the browser can
          still try to validate them on submit but can't focus/show the
          error on an unrendered field — Chrome and Firefox both just block
          submission silently in that case. The server already validates
          every field via zod and surfaces a clear error below instead. */}
      <section className={`grid gap-4 rounded-2xl border border-zinc-200 bg-white p-5 sm:grid-cols-2 ${tab === "basics" ? "" : "hidden"}`}>
        <TextField label="Pitch name" name="name" defaultValue={defaults.name} />
        <SelectField label="Pitch type" name="type" defaultValue={defaults.type ?? "FIVE_A_SIDE"}>
          {PITCH_TYPE_OPTIONS.map((value) => (
            <option key={value} value={value}>
              {PITCH_TYPE_LABELS[value]}
            </option>
          ))}
        </SelectField>
        <TextField label="Address" name="address" defaultValue={defaults.address} />
        <TextField
          label="Area / neighbourhood"
          name="area"
          defaultValue={defaults.area}
          hint="e.g. Ouakam, Almadies — shown as a location filter to customers."
        />
        <TextAreaField
          label="Description"
          name="description"
          defaultValue={defaults.description}
          rows={3}
          className="sm:col-span-2"
        />
        <TextField
          label="Latitude"
          name="lat"
          type="number"
          step="any"
          defaultValue={defaults.lat}
          hint="Right-click the spot on Google Maps and copy the coordinates."
        />
        <TextField label="Longitude" name="lng" type="number" step="any" defaultValue={defaults.lng} />
      </section>

      <section className={`grid gap-4 rounded-2xl border border-zinc-200 bg-white p-5 sm:grid-cols-2 ${tab === "pricing" ? "" : "hidden"}`}>
        <TextField
          label="Price per hour"
          name="basePricePerHour"
          type="number"
          step="0.01"
          min="0"
          defaultValue={defaults.basePricePerHour}
          hint="Paid in cash at the pitch after the match — no deposit collected online."
        />
        <TextField label="Currency" name="currency" defaultValue={defaults.currency ?? "GMD"} maxLength={3} />
      </section>

      <section className={`grid gap-4 rounded-2xl border border-zinc-200 bg-white p-5 sm:grid-cols-2 ${tab === "schedule" ? "" : "hidden"}`}>
        <SelectField
          label="Slot length"
          name="slotDurationMinutes"
          defaultValue={String(defaults.slotDurationMinutes ?? 60)}
        >
          <option value="30">30 minutes</option>
          <option value="60">60 minutes</option>
          <option value="90">90 minutes</option>
          <option value="120">120 minutes</option>
        </SelectField>
        <div className="hidden sm:block" />
        <TextField label="Opens at" name="openTime" type="time" defaultValue={defaults.openTime ?? "06:00"} />
        <TextField
          label="Closes at"
          name="closeTime"
          type="time"
          defaultValue={defaults.closeTime ?? "22:00"}
          hint="A close time before opening time means the pitch closes after midnight, e.g. opens 10:00, closes 04:00."
        />
      </section>

      {state?.error && (
        <p className="flex items-center gap-1.5 text-sm text-red-600">
          <CircleAlert className="size-4 shrink-0" />
          {state.error}
        </p>
      )}

      <div>
        <Button type="submit" pending={pending} pendingText="Saving…" size="lg" className="w-full sm:w-auto">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
