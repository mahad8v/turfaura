"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Goal, Mail, Lock, CircleAlert, ArrowLeft, FlaskConical, Fingerprint } from "lucide-react";
import { login, resolveLoginDestination } from "../actions";
import { TextField } from "@/components/shared/fields";
import { Button } from "@/components/shared/Button";
import { isPlatformAuthenticatorAvailable, isQuickUnlockEnabled, unlockWithBiometrics } from "@/lib/client/quick-unlock";

// Dead-code-eliminated from the production bundle: Next.js inlines
// NODE_ENV at build time, so `next build` strips this whole branch (and the
// seeded credentials in it) out — it only ever exists in `next dev`.
const DEV_QUICK_LOGINS =
  process.env.NODE_ENV === "development"
    ? [
        { label: "Super admin", email: "admin@turfaura.dev" },
        { label: "Owner — Aisha (4 pitches)", email: "aisha@turfaura.dev" },
        { label: "Owner — Momodou (3 pitches)", email: "momodou@turfaura.dev" },
        { label: "Owner — Fatou (3 pitches)", email: "fatou@turfaura.dev" },
      ].map((account) => ({ ...account, password: "TurfAura123!" }))
    : [];

export default function LoginPage() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(login, null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [quickUnlockReady, setQuickUnlockReady] = useState(false);
  const [usePassword, setUsePassword] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);

  useEffect(() => {
    if (!isQuickUnlockEnabled()) return;
    isPlatformAuthenticatorAvailable().then((available) => {
      if (available) setQuickUnlockReady(true);
    });
  }, []);

  async function handleUnlock() {
    setUnlocking(true);
    setUnlockError(null);
    const result = await unlockWithBiometrics();
    if (!result.ok) {
      setUnlocking(false);
      setUnlockError(result.error);
      setUsePassword(true);
      return;
    }
    const destination = await resolveLoginDestination();
    router.push(destination);
  }

  const showBiometric = quickUnlockReady && !usePassword;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500 to-emerald-700 text-white shadow-sm shadow-emerald-600/30">
            <Goal className="size-4" strokeWidth={2.5} />
          </span>
          <span className="font-display text-xl font-extrabold tracking-tight text-zinc-900">TurfAura</span>
        </Link>

        <div className="rounded-2xl border border-zinc-200 bg-white p-7">
          <h1 className="font-display text-xl font-bold text-zinc-900">Pitch owner login</h1>
          <p className="mt-1 text-sm text-zinc-500">Manage your pitches, pricing, and bookings.</p>

          {showBiometric ? (
            <div className="mt-6 flex flex-col items-center gap-4 py-2 text-center">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <Fingerprint className="size-6" strokeWidth={1.75} />
              </span>
              <p className="text-sm text-zinc-500">Unlock with Face ID, Touch ID, or your fingerprint.</p>
              {unlockError && (
                <p className="flex items-center gap-1.5 text-sm text-red-600">
                  <CircleAlert className="size-4 shrink-0" />
                  {unlockError}
                </p>
              )}
              <Button
                type="button"
                size="lg"
                className="w-full"
                pending={unlocking}
                pendingText="Verifying…"
                icon={<Fingerprint className="size-4" />}
                onClick={handleUnlock}
              >
                Unlock
              </Button>
              <button
                type="button"
                onClick={() => setUsePassword(true)}
                className="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-700"
              >
                Use password instead
              </button>
            </div>
          ) : (
          <form action={formAction} className="mt-6 flex flex-col gap-4">
            <TextField
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              icon={<Mail className="size-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              autoComplete="current-password"
              icon={<Lock className="size-4" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {state?.error && (
              <p className="flex items-center gap-1.5 text-sm text-red-600">
                <CircleAlert className="size-4 shrink-0" />
                {state.error}
              </p>
            )}
            <Button type="submit" pending={pending} pendingText="Signing in…" size="lg" className="mt-1">
              Sign in
            </Button>
          </form>
          )}
        </div>

        {DEV_QUICK_LOGINS.length > 0 && (
          <div className="mt-6 rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-4">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-amber-700">
              <FlaskConical className="size-3.5" />
              Dev quick login
            </p>
            <div className="mt-3 flex flex-col gap-1.5">
              {DEV_QUICK_LOGINS.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => {
                    setEmail(account.email);
                    setPassword(account.password);
                  }}
                  className="flex items-center justify-between gap-2 rounded-full border border-amber-200 bg-white px-3.5 py-2.5 text-left text-sm text-zinc-700 transition-colors hover:border-amber-400 hover:bg-amber-100/60"
                >
                  <span className="font-medium">{account.label}</span>
                  <span className="truncate text-xs text-zinc-400">{account.email}</span>
                </button>
              ))}
            </div>
            <p className="mt-2.5 text-xs text-amber-700/70">Fills the form above — press Sign in to log in.</p>
          </div>
        )}

        <p className="mt-6 text-center text-sm text-zinc-500">
          New pitch owner?{" "}
          <Link href="/signup" className="font-medium text-emerald-700 hover:text-emerald-800">
            Create an account
          </Link>
        </p>
        <p className="mt-3 text-center text-sm text-zinc-400">
          <Link href="/" className="inline-flex items-center gap-1 hover:text-zinc-600">
            <ArrowLeft className="size-3.5" />
            Back to search
          </Link>
        </p>
      </div>
    </div>
  );
}
