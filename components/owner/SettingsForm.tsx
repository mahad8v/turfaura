"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  User,
  Save,
  CircleAlert,
  CircleCheck,
  MapPinned,
  Plus,
  Pencil,
  Bell,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { TextField } from "@/components/shared/fields";
import { Button } from "@/components/shared/Button";
import { TelegramConnect } from "@/components/owner/TelegramConnect";
import { TurfSwitcher, type SwitchableTurf } from "@/components/owner/TurfSwitcher";
import type { SettingsFormState } from "@/app/(owner)/dashboard/settings/actions";

function SectionHeader({ icon: Icon, title }: { icon: typeof User; title: string }) {
  return (
    <h2 className="flex items-center gap-2 font-display text-sm font-bold text-zinc-900">
      <span className="flex size-6 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
        <Icon className="size-3.5" strokeWidth={2.25} />
      </span>
      {title}
    </h2>
  );
}

function SettingsRow({
  icon: Icon,
  label,
  href,
  disabled,
}: {
  icon: typeof User;
  label: string;
  href: string;
  disabled?: boolean;
}) {
  const content = (
    <>
      <span className="flex items-center gap-3">
        <Icon className="size-4.5 text-zinc-500" strokeWidth={1.75} />
        <span className="text-sm text-zinc-900">{label}</span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-zinc-300" />
    </>
  );

  if (disabled) {
    return <div className="flex w-full items-center justify-between px-4 py-3.5 opacity-50">{content}</div>;
  }

  return (
    <Link href={href} className="flex items-center justify-between px-4 py-3.5 transition-colors hover:bg-zinc-50">
      {content}
    </Link>
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
  logoutAction,
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
  logoutAction: () => Promise<void>;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const activeTurf = turfs.find((t) => t.id === activeTurfId);

  return (
    <div className="flex flex-col gap-5">
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-zinc-900 via-emerald-950 to-zinc-950 px-5 py-6 shadow-xl">
        <div className="bg-hero-dots absolute inset-0 opacity-20" />
        <div className="pointer-events-none absolute -top-10 right-0 size-56 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white ring-1 ring-inset ring-white/20">
            <MapPinned className="size-5" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-lg font-bold text-white">{activeTurf?.name ?? "No turf yet"}</p>
            <p className="text-xs text-emerald-100/70">
              {turfs.length > 0 ? `${turfs.length} turf${turfs.length === 1 ? "" : "s"} on your account` : "Add your first turf to get started"}
            </p>
          </div>
        </div>
      </div>

      {turfs.length > 1 && <TurfSwitcher turfs={turfs} activeTurfId={activeTurfId} setActivePitch={setActivePitch} />}

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <div className="divide-y divide-zinc-100">
          <SettingsRow
            icon={Pencil}
            label="Edit pitch details"
            href={activeTurfId ? `/dashboard/pitches/${activeTurfId}` : "#"}
            disabled={!activeTurfId}
          />
          <SettingsRow icon={Plus} label="Add a turf" href="/dashboard/pitches/new" />
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-3">
            <Bell className="size-4.5 text-zinc-500" strokeWidth={1.75} />
            <span className="text-sm text-zinc-900">Notifications</span>
          </span>
        </div>
        <p className="mt-1.5 pl-7 text-xs text-zinc-500">
          Get an instant Telegram message whenever a customer requests a booking on one of your pitches.
        </p>
        <div className="mt-3 pl-7">
          <TelegramConnect
            configured={telegramConfigured}
            connected={telegramConnected}
            getConnectUrl={getTelegramConnectUrl}
            disconnect={disconnectTelegram}
          />
        </div>
      </div>

      <form action={formAction} className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5">
        <SectionHeader icon={User} title="Profile" />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Full name" name="name" defaultValue={defaults.name} required />
          <TextField
            label="Phone"
            name="phone"
            type="tel"
            defaultValue={defaults.phone}
            hint="Your WhatsApp contact number, shown to customers on your pitch pages."
          />
        </div>

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
          <Button type="submit" pending={pending} pendingText="Saving…" size="md" icon={<Save className="size-4" />}>
            Save settings
          </Button>
        </div>
      </form>

      <form action={logoutAction} className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <button type="submit" className="flex w-full items-center justify-between px-4 py-3.5 transition-colors hover:bg-red-50">
          <span className="flex items-center gap-3">
            <LogOut className="size-4.5 text-red-500" strokeWidth={1.75} />
            <span className="text-sm font-medium text-red-600">Log out</span>
          </span>
          <ChevronRight className="size-4 shrink-0 text-red-200" />
        </button>
      </form>
    </div>
  );
}
