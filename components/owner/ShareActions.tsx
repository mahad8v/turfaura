"use client";

import { useState } from "react";
import { Copy, CircleCheck, Share2 } from "lucide-react";
import { Button } from "@/components/shared/Button";

export function ShareActions({ url, pitchName }: { url: string; pitchName: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleShare() {
    if (!("share" in navigator)) {
      await handleCopy();
      return;
    }
    try {
      await navigator.share({ title: pitchName, text: `Book ${pitchName} on TurfAura`, url });
    } catch {
      // Cancelled or unsupported mid-call — nothing to recover, the user just backed out.
    }
  }

  return (
    <div className="flex flex-wrap gap-2.5">
      <Button
        type="button"
        variant="secondary"
        onClick={handleCopy}
        icon={copied ? <CircleCheck className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
      >
        {copied ? "Copied" : "Copy link"}
      </Button>
      <Button type="button" onClick={handleShare} icon={<Share2 className="size-4" />}>
        Share
      </Button>
    </div>
  );
}
