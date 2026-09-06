"use client";

import { useActionState, useState } from "react";
import { MapPin, CircleDollarSign, Clock, CircleAlert, ArrowRight, CircleCheck } from "lucide-react";
import { TextField, TextAreaField, SelectField } from "@/components/shared/fields";
import { Button } from "@/components/shared/Button";
import { LocationPicker } from "@/components/owner/LocationPicker";
import { PITCH_TYPE_LABELS, PITCH_TYPE_OPTIONS } from "@/lib/pitch-type";
import type { PitchType } from "@/generated/prisma/client";

export interface PitchFormState {
  error?: string;
}

export interface PitchFormDefaults {
  name?: string;
  description?: string;
  address?: string;
  area?: string;
  type?: PitchType;
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

interface FormValues {
  name: string;
  type: PitchType;
  address: string;
  area: string;
  description: string;
  basePricePerHour: string;
  currency: string;
  slotDurationMinutes: string;
  openTime: string;
  closeTime: string;
}

export function PitchForm({ action, defaults = {}, submitLabel }: PitchFormProps) {
  const [state, formAction, pending] = useActionState(action, null);
  const [tab, setTab] = useState<TabId>("basics");

  // React 19 resets a <form>'s own DOM fields after its action settles —
  // including on a validation failure, which used to wipe everything the
  // owner had just typed. Values live here instead so a failed submit
  // can't lose them: this state is untouched by the form's native reset,
  // and every field below is controlled from it.
  const [values, setValues] = useState<FormValues>({
    name: defaults.name ?? "",
    type: defaults.type ?? "FIVE_A_SIDE",
    address: defaults.address ?? "",
    area: defaults.area ?? "",
    description: defaults.description ?? "",
    basePricePerHour: defaults.basePricePerHour ?? "",
    currency: defaults.currency ?? "GMD",
    slotDurationMinutes: String(defaults.slotDurationMinutes ?? 60),
    openTime: defaults.openTime ?? "06:00",
    closeTime: defaults.closeTime ?? "22:00",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
  }

  const basicsComplete = values.name.trim() !== "" && values.address.trim() !== "" && values.area.trim() !== "";
  const pricingComplete = values.basePricePerHour.trim() !== "" && Number(values.basePricePerHour) > 0;
  const scheduleComplete = values.openTime !== "" && values.closeTime !== "" && values.openTime !== values.closeTime;

  const sections: { id: TabId; label: string; complete: boolean }[] = [
    { id: "basics", label: "Basics", complete: basicsComplete },
    { id: "pricing", label: "Pricing", complete: pricingComplete },
    { id: "schedule", label: "Schedule", complete: scheduleComplete },
  ];
  const firstIncomplete = sections.find((s) => !s.complete);
  const completeById = Object.fromEntries(sections.map((s) => [s.id, s.complete])) as Record<TabId, boolean>;

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
              {completeById[t.id] && <CircleCheck className="size-3.5 text-emerald-500" strokeWidth={2.25} />}
            </button>
          );
        })}
      </div>

      {/* No native `required` attributes here: with three fields possibly
          sitting in a currently-hidden (display:none) tab, the browser can
          still try to validate them on submit but can't focus/show the
          error on an unrendered field — Chrome and Firefox both just block
          submission silently in that case. The submit button itself is
          gated on completeness below instead (see firstIncomplete), and the
          server still validates every field via zod as the source of truth. */}
      <section className={`grid gap-4 rounded-2xl border border-zinc-200 bg-white p-5 sm:grid-cols-2 ${tab === "basics" ? "" : "hidden"}`}>
        <TextField label="Pitch name" name="name" value={values.name} onChange={handleChange} required />
        <SelectField label="Pitch type" name="type" value={values.type} onChange={handleChange}>
          {PITCH_TYPE_OPTIONS.map((value) => (
            <option key={value} value={value}>
              {PITCH_TYPE_LABELS[value]}
            </option>
          ))}
        </SelectField>
        <TextField label="Address" name="address" value={values.address} onChange={handleChange} required />
        <TextField
          label="Area / neighbourhood"
          name="area"
          value={values.area}
          onChange={handleChange}
          required
          hint="e.g. Ouakam, Almadies — shown as a location filter to customers."
        />
        <TextAreaField
          label="Description"
          name="description"
          value={values.description}
          onChange={handleChange}
          rows={3}
          className="sm:col-span-2"
        />
        <LocationPicker lat={defaults.lat} lng={defaults.lng} />
      </section>

      <section className={`grid gap-4 rounded-2xl border border-zinc-200 bg-white p-5 sm:grid-cols-2 ${tab === "pricing" ? "" : "hidden"}`}>
        <TextField
          label="Price per hour"
          name="basePricePerHour"
          type="number"
          step="0.01"
          min="0"
          value={values.basePricePerHour}
          onChange={handleChange}
          required
          hint="Paid in cash at the pitch after the match — no deposit collected online."
        />
        <TextField label="Currency" name="currency" value={values.currency} onChange={handleChange} maxLength={3} />
      </section>

      <section className={`grid gap-4 rounded-2xl border border-zinc-200 bg-white p-5 sm:grid-cols-2 ${tab === "schedule" ? "" : "hidden"}`}>
        <SelectField label="Slot length" name="slotDurationMinutes" value={values.slotDurationMinutes} onChange={handleChange}>
          <option value="30">30 minutes</option>
          <option value="60">60 minutes</option>
          <option value="90">90 minutes</option>
          <option value="120">120 minutes</option>
        </SelectField>
        <div className="hidden sm:block" />
        <TextField label="Opens at" name="openTime" type="time" value={values.openTime} onChange={handleChange} />
        <TextField
          label="Closes at"
          name="closeTime"
          type="time"
          value={values.closeTime}
          onChange={handleChange}
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
        {firstIncomplete ? (
          <Button
            type="button"
            size="lg"
            className="w-full sm:w-auto"
            icon={<ArrowRight className="size-4" />}
            onClick={() => setTab(firstIncomplete.id)}
          >
            {firstIncomplete.id === tab ? `Complete ${firstIncomplete.label.toLowerCase()}` : `Next: ${firstIncomplete.label}`}
          </Button>
        ) : (
          <Button type="submit" pending={pending} pendingText="Saving…" size="lg" className="w-full sm:w-auto">
            {submitLabel}
          </Button>
        )}
      </div>
    </form>
  );
}
