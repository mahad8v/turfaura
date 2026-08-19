"use client";

import Link from "next/link";
import { User, MapPinned, Plus, Pencil, QrCode, Wallet, Bell, LogOut, ChevronRight } from "lucide-react";
import { TelegramConnect } from "@/components/owner/TelegramConnect";
import { TurfSwitcher, type SwitchableTurf } from "@/components/owner/TurfSwitcher";

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

export function SettingsForm({
  telegramConfigured,
  telegramConnected,
  getTelegramConnectUrl,
  disconnectTelegram,
  turfs,
  activeTurfId,
  setActivePitch,
  logoutAction,
}: {
  telegramConfigured: boolean;
  telegramConnected: boolean;
  getTelegramConnectUrl: () => Promise<string>;
  disconnectTelegram: () => Promise<void>;
  turfs: SwitchableTurf[];
  activeTurfId: string;
  setActivePitch: (pitchId: string) => Promise<void>;
  logoutAction: () => Promise<void>;
}) {
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
          <SettingsRow
            icon={QrCode}
            label="Share your turf"
            href={activeTurfId ? "/dashboard/settings/share" : "#"}
            disabled={!activeTurfId}
          />
          <SettingsRow icon={Plus} label="Add a turf" href="/dashboard/pitches/new" />
          <SettingsRow icon={User} label="Profile" href="/dashboard/settings/profile" />
          <SettingsRow icon={Wallet} label="Earnings" href="/dashboard/earnings" />
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
