"use client";

import { useActionState } from "react";
import Link from "next/link";
import { User, Save, CircleAlert, CircleCheck, Send, MapPinned, Plus } from "lucide-react";
import { TextField } from "@/components/shared/fields";
import { Button } from "@/components/shared/Button";
import { TelegramConnect } from "@/components/owner/TelegramConnect";
import { TurfSwitcher, type SwitchableTurf } from "@/components/owner/TurfSwitcher";
import type { SettingsFormState } from "@/app/(owner)/dashboard/settings/actions";

function SectionHeader({ icon: Icon, title }: { icon: typeof User; title: string }) {
  return (
    <h2 className="col-span-full flex items-center gap-2 font-display text-sm font-bold text-zinc-900">
      <span className="flex size-6 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
        <Icon className="size-3.5" strokeWidth={2.25} />
      </span>
      {title}
    </h2>
  );
}

export interface SettingsFormDefaults {
  name: string;
  phone?: string;
}

export function SettingsForm({
  action,
  defaults,
  telegramConfigured,
  telegramConnected,
  getTelegramConnectUrl,
  disconnectTelegram,
  turfs,
  activeTurfId,
  setActivePitch,
}: {
  action: (prevState: SettingsFormState | null, formData: FormData) => Promise<SettingsFormState>;
  defaults: SettingsFormDefaults;
  telegramConfigured: boolean;
  telegramConnected: boolean;
  getTelegramConnectUrl: () => Promise<string>;
  disconnectTelegram: () => Promise<void>;
  turfs: SwitchableTurf[];
  activeTurfId: string;
  setActivePitch: (pitchId: string) => Promise<void>;
}) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <div className="flex flex-col gap-5">
      <section className="grid gap-3 rounded-2xl border border-zinc-200 bg-white p-5">
        <div className="col-span-full flex items-center justify-between gap-3">
          <SectionHeader icon={MapPinned} title="Active turf" />
          <Link href="/dashboard/pitches/new">
            <Button type="button" variant="secondary" size="sm" icon={<Plus className="size-3.5" />}>
              Add a turf
            </Button>
          </Link>
        </div>
        <p className="-mt-2 text-xs text-zinc-500">
          Your dashboard — bookings, calendar, and earnings — is scoped to this turf. Switch anytime.
        </p>
        <TurfSwitcher turfs={turfs} activeTurfId={activeTurfId} setActivePitch={setActivePitch} />
      </section>

      <form action={formAction} className="flex flex-col gap-5">
        <section className="grid gap-4 rounded-2xl border border-zinc-200 bg-white p-5 sm:grid-cols-2">
          <SectionHeader icon={User} title="Profile" />
          <TextField label="Full name" name="name" defaultValue={defaults.name} required />
          <TextField
            label="Phone"
            name="phone"
            type="tel"
            defaultValue={defaults.phone}
            hint="Your WhatsApp contact number, shown to customers on your pitch pages."
          />
        </section>

        {state?.error && (
          <p className="flex items-center gap-1.5 text-sm text-red-600">
            <CircleAlert className="size-4 shrink-0" />
            {state.error}
          </p>
        )}
        {state?.success && (
          <p className="flex items-center gap-1.5 text-sm text-emerald-700">
            <CircleCheck className="size-4 shrink-0" />
            Saved.
          </p>
        )}

        <div>
          <Button type="submit" pending={pending} pendingText="Saving…" size="lg" icon={<Save className="size-4" />}>
            Save settings
          </Button>
        </div>
      </form>

      <section className="grid gap-3 rounded-2xl border border-zinc-200 bg-white p-5">
        <SectionHeader icon={Send} title="Telegram notifications" />
        <p className="col-span-full -mt-2 text-xs text-zinc-500">
          Get an instant Telegram message whenever a customer requests a booking on one of your pitches.
        </p>
        <TelegramConnect
          configured={telegramConfigured}
          connected={telegramConnected}
          getConnectUrl={getTelegramConnectUrl}
          disconnect={disconnectTelegram}
        />
      </section>
    </div>
  );
}
