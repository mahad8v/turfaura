"use client";

import { useState, useTransition } from "react";
import { Send, CircleCheck, CircleAlert, Unlink } from "lucide-react";
import { Button } from "@/components/shared/Button";

export function TelegramConnect({
  configured,
  connected,
  getConnectUrl,
  disconnect,
}: {
  configured: boolean;
  connected: boolean;
  getConnectUrl: () => Promise<string>;
  disconnect: () => Promise<void>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!configured) {
    return (
      <p className="col-span-full flex items-center gap-1.5 text-xs text-zinc-500">
        <CircleAlert className="size-3.5 shrink-0" />
        Telegram notifications aren&apos;t set up on this server yet — ask whoever manages TurfAura&apos;s deployment
        to add the bot credentials.
      </p>
    );
  }

  if (connected) {
    return (
      <div className="col-span-full flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
          <CircleCheck className="size-3.5" />
          Connected
        </span>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          icon={<Unlink className="size-3.5" />}
          pending={isPending}
          onClick={() =>
            startTransition(async () => {
              setError(null);
              try {
                await disconnect();
              } catch (err) {
                setError(err instanceof Error ? err.message : "Could not disconnect.");
              }
            })
          }
        >
          Disconnect
        </Button>
        {error && (
          <p className="flex w-full items-center gap-1.5 text-sm text-red-600">
            <CircleAlert className="size-4 shrink-0" />
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="col-span-full">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        icon={<Send className="size-3.5" />}
        pending={isPending}
        onClick={() => {
          // Open the tab synchronously, inside the click itself — a browser
          // only trusts window.open as "not a popup" when it happens in the
          // same tick as the user gesture. Opening it AFTER awaiting the
          // server action (getConnectUrl) loses that trust and gets silently
          // blocked, which is why nothing used to happen on click. Point
          // this blank tab at the real URL once it's fetched instead.
          const popup = window.open("", "_blank");
          setError(null);
          startTransition(async () => {
            try {
              const url = await getConnectUrl();
              if (popup) {
                popup.location.href = url;
              } else {
                // Even the synchronous open was blocked (strict popup
                // settings) — fall back to navigating the current tab.
                window.location.href = url;
              }
            } catch (err) {
              popup?.close();
              setError(err instanceof Error ? err.message : "Could not start Telegram linking.");
            }
          });
        }}
      >
        Connect Telegram
      </Button>
      {error && (
        <p className="mt-2 flex items-center gap-1.5 text-sm text-red-600">
          <CircleAlert className="size-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
