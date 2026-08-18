import { getOwnerWithActivePitch } from "@/lib/active-pitch";
import { SettingsForm } from "@/components/owner/SettingsForm";
import { isTelegramConfigured } from "@/lib/telegram";
import { logout } from "../../actions";
import { getTelegramConnectUrl, disconnectTelegram, setActivePitch } from "./actions";

export default async function SettingsPage() {
  const { owner, pitches, activePitch } = await getOwnerWithActivePitch();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-center text-xl font-bold text-zinc-900">Account</h1>
      <div className="mt-6">
        <SettingsForm
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
          logoutAction={logout}
        />
      </div>
    </div>
  );
}
