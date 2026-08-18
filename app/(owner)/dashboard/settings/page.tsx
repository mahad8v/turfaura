import { getOwnerWithActivePitch } from "@/lib/active-pitch";
import { SettingsForm } from "@/components/owner/SettingsForm";
import { isTelegramConfigured } from "@/lib/telegram";
import { updateSettings, getTelegramConnectUrl, disconnectTelegram, setActivePitch } from "./actions";

export default async function SettingsPage() {
  const { owner, pitches, activePitch } = await getOwnerWithActivePitch();

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-xl font-bold text-zinc-900">Settings</h1>
      <p className="mt-1 text-sm text-zinc-500">Your profile, contact details, and active turf.</p>
      <div className="mt-6">
        <SettingsForm
          action={updateSettings}
          defaults={{
            name: owner.name,
            phone: owner.phone ?? undefined,
          }}
          telegramConfigured={isTelegramConfigured()}
          telegramConnected={Boolean(owner.telegramChatId)}
          getTelegramConnectUrl={getTelegramConnectUrl}
          disconnectTelegram={disconnectTelegram}
          turfs={pitches.map((p) => ({
            id: p.id,
            name: p.name,
            address: p.address,
            isActive: p.isActive,
          }))}
          activeTurfId={activePitch?.id ?? ""}
          setActivePitch={setActivePitch}
        />
      </div>
    </div>
  );
}
