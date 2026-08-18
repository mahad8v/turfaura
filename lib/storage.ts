import { PITCH_PHOTOS_BUCKET } from "@/lib/constants";

/** Pure URL construction — the bucket is public-read, so no client/auth needed. */
export function getPitchPhotoUrl(storagePath: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${base}/storage/v1/object/public/${PITCH_PHOTOS_BUCKET}/${storagePath}`;
}

export function buildPitchPhotoPath(supabaseUserId: string, pitchId: string, filename: string): string {
  const ext = filename.includes(".") ? filename.slice(filename.lastIndexOf(".")) : "";
  const safeName = crypto.randomUUID();
  return `${supabaseUserId}/${pitchId}/${safeName}${ext}`;
}
