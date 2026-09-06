"use client";

import { useEffect, useState } from "react";
import { Fingerprint, CircleCheck } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { isPlatformAuthenticatorAvailable, isQuickUnlockEnabled, disableQuickUnlock, enableQuickUnlock } from "@/lib/client/quick-unlock";

export function BiometricSettings({ email }: { email: string }) {
  const [available, setAvailable] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // localStorage can't be read during SSR/the initial render, so this
    // can't be lazy useState initial state — it has to land after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEnabled(isQuickUnlockEnabled());
    isPlatformAuthenticatorAvailable().then(setAvailable);
  }, []);

  async function handleEnable() {
    setPending(true);
    setError(null);
    const result = await enableQuickUnlock(email);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setEnabled(true);
  }

  function handleDisable() {
    disableQuickUnlock();
    setEnabled(false);
  }

  if (!available) return null;

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5">
      <h2 className="flex items-center gap-2 font-display text-sm font-bold text-zinc-900">
        <span className="flex size-6 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
          <Fingerprint className="size-3.5" strokeWidth={2.25} />
        </span>
        Quick unlock
      </h2>
      <p className="mt-1.5 text-xs text-zinc-500">
        Use Face ID, Touch ID, or your fingerprint to sign in on this device without a password.
      </p>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      <div className="mt-3">
        {enabled ? (
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-700">
              <CircleCheck className="size-4 shrink-0" />
              Enabled on this device
            </span>
            <Button type="button" variant="secondary" size="sm" onClick={handleDisable}>
              Forget this device
            </Button>
          </div>
        ) : (
          <Button type="button" size="sm" pending={pending} pendingText="Setting up…" onClick={handleEnable}>
            Enable on this device
          </Button>
        )}
      </div>
    </section>
  );
}
