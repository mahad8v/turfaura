"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { ImagePlus, X, CircleAlert, Camera, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { buildPitchPhotoPath, getPitchPhotoUrl } from "@/lib/storage";
import { PITCH_PHOTOS_BUCKET } from "@/lib/constants";

interface Photo {
  id: string;
  storagePath: string;
}

export function PhotoManager({
  pitchId,
  supabaseUserId,
  photos,
  addPhotoRecord,
  deletePhoto,
}: {
  pitchId: string;
  supabaseUserId: string;
  photos: Photo[];
  addPhotoRecord: (pitchId: string, storagePath: string) => Promise<void>;
  deletePhoto: (photoId: string) => Promise<void>;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);
    const supabase = createClient();
    try {
      for (const file of Array.from(files)) {
        const path = buildPitchPhotoPath(supabaseUserId, pitchId, file.name);
        const { error: uploadError } = await supabase.storage.from(PITCH_PHOTOS_BUCKET).upload(path, file);
        if (uploadError) throw uploadError;
        await addPhotoRecord(pitchId, path);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleDelete(photoId: string) {
    setError(null);
    setDeletingId(photoId);
    startTransition(async () => {
      try {
        await deletePhoto(photoId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not remove that photo.");
      } finally {
        setDeletingId(null);
      }
    });
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="flex items-center gap-2 font-display text-sm font-bold text-zinc-900">
        <span className="flex size-6 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
          <Camera className="size-3.5" strokeWidth={2.25} />
        </span>
        Photos
      </h2>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />

      {/* Camera-roll style grid: existing photos plus a trailing "add" tile,
          same size as every other tile — a native photo-picker pattern
          instead of a separate full-width upload button below. */}
      <div className="mt-4 grid grid-cols-3 gap-2.5 sm:grid-cols-4">
        {photos.map((photo) => {
          const deleting = isPending && deletingId === photo.id;
          return (
            <div key={photo.id} className="relative aspect-square overflow-hidden rounded-xl bg-zinc-100">
              <Image
                src={getPitchPhotoUrl(photo.storagePath)}
                alt=""
                fill
                className="object-cover"
                sizes="140px"
                unoptimized
              />
              <button
                type="button"
                onClick={() => handleDelete(photo.id)}
                disabled={deleting}
                aria-label="Remove photo"
                className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-transform active:scale-90 disabled:opacity-70"
              >
                {deleting ? <Loader2 className="size-3.5 animate-spin" /> : <X className="size-3.5" />}
              </button>
            </div>
          );
        })}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-zinc-300 text-zinc-400 transition-all active:scale-95 hover:border-emerald-400 hover:bg-emerald-50/50 hover:text-emerald-700 disabled:opacity-60"
        >
          {uploading ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" strokeWidth={1.75} />}
          <span className="text-[11px] font-medium">{uploading ? "Uploading…" : "Add"}</span>
        </button>
      </div>

      {error && (
        <p className="mt-3 flex items-center gap-1.5 text-sm text-red-600">
          <CircleAlert className="size-4 shrink-0" />
          {error}
        </p>
      )}
    </section>
  );
}
