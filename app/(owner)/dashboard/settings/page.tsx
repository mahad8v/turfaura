import { requireOwner } from "@/lib/auth";
import { SettingsForm } from "@/components/owner/SettingsForm";
import { isTelegramConfigured } from "@/lib/telegram";
import { updateSettings, getTelegramConnectUrl, disconnectTelegram } from "./actions";

export default async function SettingsPage() {
  const owner = await requireOwner();

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-xl font-bold text-zinc-900">Settings</h1>
      <p className="mt-1 text-sm text-zinc-500">Your profile and contact details.</p>
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
        />
      </div>
    </div>
  );
}
