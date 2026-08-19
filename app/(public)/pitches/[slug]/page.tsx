import Image from "next/image";
import { notFound } from "next/navigation";
import { MapPin, ImageOff, Clock, Banknote } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PitchMap } from "@/components/pitch/PitchMap";
import { AvailabilityPicker } from "@/components/booking/AvailabilityPicker";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";
import { Money } from "@/components/shared/Money";
import { getPitchPhotoUrl } from "@/lib/storage";
import { formatTime12h } from "@/lib/format";

export default async function PitchDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const pitch = await prisma.pitch.findUnique({
    where: { slug, isActive: true },
    include: { photos: { orderBy: { sortOrder: "asc" } }, owner: true },
  });

  if (!pitch) notFound();

  const contactPhone = pitch.owner.phone;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="grid gap-8 lg:grid-cols-3 lg:gap-10">
        <div className="lg:col-span-2">
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl">
            {pitch.name}
          </h1>
          <p className="mt-1.5 flex items-center gap-1.5 text-zinc-500">
            <MapPin className="size-4 shrink-0 text-zinc-400" />
            {pitch.address}
          </p>

          {pitch.photos.length > 0 ? (
            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {pitch.photos.map((photo) => (
                <div key={photo.id} className="relative aspect-square overflow-hidden rounded-xl bg-zinc-100">
                  <Image
                    src={getPitchPhotoUrl(photo.storagePath)}
                    alt={pitch.name}
                    fill
                    className="object-cover"
                    sizes="200px"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5 flex aspect-[16/7] flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-zinc-200 bg-zinc-50 text-zinc-300">
              <ImageOff className="size-6" strokeWidth={1.5} />
              <span className="text-xs text-zinc-400">No photos yet</span>
            </div>
          )}

          {pitch.description && <p className="mt-6 text-sm leading-6 text-zinc-600">{pitch.description}</p>}

          <p className="mt-4 flex items-center gap-1.5 text-sm text-zinc-500">
            <Clock className="size-4 text-zinc-400" />
            Open {formatTime12h(pitch.openTime)}–{formatTime12h(pitch.closeTime)} · {pitch.slotDurationMinutes}-minute
            slots
          </p>

          <div className="mt-6">
            <PitchMap lat={pitch.lat} lng={pitch.lng} name={pitch.name} />
          </div>

          {contactPhone && (
            <div className="mt-5">
              <WhatsAppButton
                phone={contactPhone}
                message={`Hi, I'm interested in booking ${pitch.name}. Is it available?`}
              />
            </div>
          )}
        </div>

        <div>
          <div className="flex flex-col gap-4 lg:sticky lg:top-20">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <p className="text-sm text-zinc-500">Starting from</p>
              <p className="font-display mt-0.5 text-2xl font-extrabold text-zinc-900">
                <Money amount={pitch.basePricePerHour.toString()} currency={pitch.currency} />
                <span className="text-sm font-normal text-zinc-500"> / hour</span>
              </p>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500">
                <Banknote className="size-3.5 text-emerald-600" />
                Book now, pay cash at the pitch after you play
              </p>
            </div>
            <AvailabilityPicker pitchId={pitch.id} slug={pitch.slug} slotDurationMinutes={pitch.slotDurationMinutes} />
          </div>
        </div>
      </div>
    </div>
  );
}
