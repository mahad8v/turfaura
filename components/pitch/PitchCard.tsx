import Link from 'next/link';
import Image from 'next/image';
import { MapPin, ImageOff } from 'lucide-react';
import { Money } from '@/components/shared/Money';
import { getPitchPhotoUrl } from '@/lib/storage';
import { PITCH_TYPE_LABELS } from '@/lib/pitch-type';
import type { PitchType } from '@/generated/prisma/client';

interface PitchCardProps {
  slug: string;
  name: string;
  address: string;
  type: PitchType;
  basePricePerHour: string;
  currency: string;
  photoPath?: string;
}

export function PitchCard({
  slug,
  name,
  address,
  type,
  basePricePerHour,
  currency,
  photoPath,
}: PitchCardProps) {
  return (
    <Link
      href={`/pitches/${slug}`}
      className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-lg hover:shadow-zinc-900/5"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100">
        {photoPath ? (
          <Image
            src={getPitchPhotoUrl(photoPath)}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 90vw"
            unoptimized
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-1.5 text-zinc-300">
            <ImageOff className="size-6" strokeWidth={1.5} />
            <span className="text-xs text-zinc-400">No photo yet</span>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-black/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <span className="absolute left-2 top-2 rounded-full bg-zinc-900/70 px-2 py-1 text-[11px] font-semibold whitespace-nowrap text-white backdrop-blur-sm">
          {PITCH_TYPE_LABELS[type]}
        </span>
        <span className="absolute right-2 top-2 rounded-full bg-white/95 px-2 py-1 text-[11px] font-semibold whitespace-nowrap text-zinc-900 shadow-sm backdrop-blur-sm">
          <Money amount={basePricePerHour} currency={currency} />
          <span className="font-normal text-zinc-500">/hr</span>
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-display font-semibold text-zinc-900 transition-colors text-sm group-hover:text-emerald-700">
          {name}
        </h3>
        <p className="mt-1 flex items-center gap-1 text-sm text-zinc-500">
          <MapPin className="size-3.5 shrink-0 text-zinc-400" />
          <span className="truncate">{address}</span>
        </p>
      </div>
    </Link>
  );
}
