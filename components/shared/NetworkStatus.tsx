"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { WifiOff, Wifi } from "lucide-react";

function subscribe(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getSnapshot() {
  return navigator.onLine;
}

// SSR has no network state of its own — assume online so the server-rendered
// markup never shows the banner, then let the client re-check on hydration.
function getServerSnapshot() {
  return true;
}

/**
 * Mounted once, globally, in the root layout. Native `online`/`offline`
 * events fire off the browser's actual network-interface state (not a
 * server ping), so this is instant and works the same across the public
 * marketplace, owner dashboard, and admin.
 */
export function NetworkStatus() {
  const router = useRouter();
  const isOnline = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const wasOffline = useRef(false);
  const [showRestored, setShowRestored] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      wasOffline.current = true;
      return;
    }
    if (!wasOffline.current) return;

    // Only flash "back online" when we actually saw an outage — a plain
    // `online` snapshot on first load shouldn't show a banner nobody was
    // waiting for. Refresh so any Server Component data that failed or went
    // stale while offline is refetched automatically.
    wasOffline.current = false;
    setShowRestored(true);
    router.refresh();
    const timer = setTimeout(() => setShowRestored(false), 3000);
    return () => clearTimeout(timer);
  }, [isOnline, router]);

  if (isOnline && !showRestored) return null;

  const offline = !isOnline;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed inset-x-0 top-0 z-100 flex items-center justify-center gap-1.5 px-4 py-2.5 text-center text-sm font-medium text-white ${
        offline ? "bg-zinc-900" : "bg-emerald-600"
      }`}
    >
      {offline ? (
        <>
          <WifiOff className="size-4 shrink-0" />
          You&apos;re offline — some things may not work until you reconnect.
        </>
      ) : (
        <>
          <Wifi className="size-4 shrink-0" />
          Back online
        </>
      )}
    </div>
  );
}
