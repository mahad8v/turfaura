"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Fingerprint, X } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { isPlatformAuthenticatorAvailable, isQuickUnlockEnabled, enableQuickUnlock } from "@/lib/client/quick-unlock";

/**
 * Mounted in the owner/admin dashboard shells. login() redirects here with
 * a one-time `?welcome=1` after a fresh password sign-in — if this device
 * supports a platform biometric and hasn't set up quick-unlock already,
 * offer it once, then strip the param so it doesn't reappear on refresh.
 */
export function BiometricEnrollPrompt({ email }: { email: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [show, setShow] = useState(false);
  const [enabling, setEnabling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!searchParams.has("welcome")) return;

    let cancelled = false;
    (async () => {
      if (isQuickUnlockEnabled()) {
        dismiss();
        return;
      }
      const available = await isPlatformAuthenticatorAvailable();
      if (cancelled) return;
      if (available) {
        setShow(true);
      } else {
        dismiss();
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once per mount to consume the one-time `welcome` param
  }, []);

  function dismiss() {
    setShow(false);
    const params = new URLSearchParams(searchParams);
    params.delete("welcome");
    router.replace(params.size > 0 ? `${pathname}?${params.toString()}` : pathname);
  }

  async function handleEnable() {
    setEnabling(true);
    setError(null);
    const result = await enableQuickUnlock(email);
    setEnabling(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    dismiss();
  }

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 sm:bottom-4 sm:left-1/2 sm:right-auto sm:w-full sm:max-w-sm sm:-translate-x-1/2">
      <div className="rounded-t-3xl border border-zinc-200 bg-white p-5 shadow-2xl sm:rounded-3xl">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Fingerprint className="size-5" strokeWidth={1.75} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-display font-bold text-zinc-900">Enable quick unlock?</p>
            <p className="mt-1 text-sm text-zinc-500">
              Use Face ID, Touch ID, or your fingerprint to sign back in on this device — no password needed next
              time.
            </p>
          </div>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss"
            className="shrink-0 text-zinc-400 transition-colors hover:text-zinc-600"
          >
            <X className="size-4" />
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <div className="mt-4 flex items-center gap-2">
          <Button type="button" pending={enabling} pendingText="Setting up…" onClick={handleEnable} className="flex-1">
            Enable
          </Button>
          <Button type="button" variant="secondary" onClick={dismiss}>
            Not now
          </Button>
        </div>
      </div>
    </div>
  );
}
