import Link from "next/link";
import Image from "next/image";
import QRCode from "qrcode";
import { ChevronLeft, MapPinned, LinkIcon } from "lucide-react";
import { getOwnerWithActivePitch } from "@/lib/active-pitch";
import { ShareActions } from "@/components/owner/ShareActions";

export default async function ShareTurfPage() {
  const { activePitch } = await getOwnerWithActivePitch();

  if (!activePitch) {
    return (
      <div className="mx-auto max-w-2xl">
        <Link
          href="/dashboard/settings"
          className="mb-3 inline-flex items-center gap-0.5 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-700"
        >
          <ChevronLeft className="size-4" />
          Account
        </Link>
        <h1 className="font-display text-xl font-bold text-zinc-900">Share your turf</h1>
        <div className="mt-6 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-zinc-300 bg-white py-14 text-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
            <MapPinned className="size-5" strokeWidth={1.75} />
          </span>
          <p className="text-sm text-zinc-500">Add a turf before you can share a booking link for it.</p>
        </div>
      </div>
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const shareUrl = `${baseUrl}/pitches/${activePitch.slug}`;
  const qrDataUrl = await QRCode.toDataURL(shareUrl, {
    width: 480,
    margin: 1,
    color: { dark: "#065f46", light: "#ffffff" },
  });

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/dashboard/settings"
        className="mb-3 inline-flex items-center gap-0.5 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-700"
      >
        <ChevronLeft className="size-4" />
        Account
      </Link>
      <h1 className="font-display text-xl font-bold text-zinc-900">Share your turf</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Anyone who scans this code or opens the link lands straight on {activePitch.name}&apos;s booking page.
      </p>

      <div className="mt-6 flex flex-col items-center gap-5 rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8">
        <div className="overflow-hidden rounded-2xl border border-zinc-200 p-3">
          <Image src={qrDataUrl} alt={`QR code linking to ${activePitch.name}`} width={220} height={220} unoptimized />
        </div>

        <div className="flex w-full max-w-md items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-3">
          <LinkIcon className="size-4 shrink-0 text-zinc-400" />
          <span className="min-w-0 flex-1 truncate text-sm text-zinc-700">{shareUrl}</span>
        </div>

        <ShareActions url={shareUrl} pitchName={activePitch.name} />
      </div>
    </div>
  );
}
