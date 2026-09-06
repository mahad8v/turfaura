// Client-only (WebAuthn + localStorage) — never import this from a Server Component.
import { createClient } from "@/lib/supabase/client";

const STORAGE_KEY = "turfaura:quick-unlock";

interface QuickUnlockRecord {
  refreshToken: string;
}

function randomBytes(length: number): Uint8Array<ArrayBuffer> {
  return crypto.getRandomValues(new Uint8Array(new ArrayBuffer(length)));
}

export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (!window.PublicKeyCredential?.isUserVerifyingPlatformAuthenticatorAvailable) return false;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

export function isQuickUnlockEnabled(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

export function disableQuickUnlock(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage unavailable — nothing to clear.
  }
}

/**
 * Registers a platform biometric (Face ID / Touch ID / Windows Hello /
 * fingerprint) purely as a *local unlock gate* for this device — it does
 * not replace the password server-side, and no credential is ever sent to
 * the backend. Once registered, the current session's refresh token is
 * stashed in localStorage; unlockWithBiometrics() only reads it back after
 * a fresh biometric check succeeds, then uses it to mint a new Supabase
 * session so the owner doesn't have to retype a password.
 *
 * Tradeoff, by design (the simpler of the two options — see
 * unlockWithBiometrics for the other half): anyone with script execution
 * on this origin (e.g. via XSS) could read the stored token directly,
 * bypassing the biometric prompt entirely. A full passkey flow verified
 * server-side would close that gap but needs a new database table, a
 * signature-verification library, and a session-minting endpoint — real
 * infrastructure this simpler "remembered device" tier deliberately skips.
 */
export async function enableQuickUnlock(email: string): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!(await isPlatformAuthenticatorAvailable())) {
    return { ok: false, error: "This device doesn't support Face ID, Touch ID, or fingerprint unlock." };
  }

  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { ok: false, error: "You need to be signed in to enable this." };

  try {
    await navigator.credentials.create({
      publicKey: {
        rp: { name: "TurfAura" },
        user: { id: randomBytes(16), name: email, displayName: email },
        challenge: randomBytes(32),
        pubKeyCredParams: [{ type: "public-key", alg: -7 }],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          residentKey: "required",
          userVerification: "required",
        },
        timeout: 60_000,
      },
    });
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Could not set up biometric unlock." };
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ refreshToken: session.refresh_token } satisfies QuickUnlockRecord));
  } catch {
    return { ok: false, error: "Could not save to this device's storage." };
  }

  return { ok: true };
}

export async function unlockWithBiometrics(): Promise<{ ok: true } | { ok: false; error: string }> {
  let record: QuickUnlockRecord | null = null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    record = raw ? JSON.parse(raw) : null;
  } catch {
    record = null;
  }
  if (!record) return { ok: false, error: "Biometric unlock isn't set up on this device." };

  try {
    await navigator.credentials.get({
      publicKey: { challenge: randomBytes(32), userVerification: "required", timeout: 60_000 },
    });
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Biometric check failed." };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.refreshSession({ refresh_token: record.refreshToken });
  if (error) {
    // The stored token is dead (revoked, expired, or password changed since)
    // — don't keep offering a shortcut that will just fail again.
    disableQuickUnlock();
    return { ok: false, error: "Your saved session expired — please sign in with your password." };
  }

  return { ok: true };
}
