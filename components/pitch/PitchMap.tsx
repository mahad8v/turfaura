import { Navigation } from "lucide-react";

export function PitchMap({ lat, lng, name }: { lat: number; lng: number; name: string }) {
  const embedSrc = `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
  const navigateHref = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200">
      <iframe
        src={embedSrc}
        title={`Map showing ${name}`}
        className="h-64 w-full grayscale-[15%]"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <div className="flex items-center justify-between bg-white p-3.5">
        <span className="text-xs text-zinc-500">Tap for turn-by-turn directions</span>
        <a
          href={navigateHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-50 hover:text-emerald-800"
        >
          <Navigation className="size-3.5" />
          Navigate
        </a>
      </div>
    </div>
  );
}
