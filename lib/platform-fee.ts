// The platform's monthly listing fee an owner account pays TurfAura, tiered
// by how many turfs the account has — not a flat per-turf rate:
//   1 turf         -> 1,200 flat
//   2-5 turfs      -> 1,800 flat (same price regardless of count in this band)
//   6+ turfs       -> 500 per turf
export const PLATFORM_FEE_CURRENCY = "GMD";

export function calculatePlatformFee(turfCount: number): number {
  if (turfCount <= 0) return 0;
  if (turfCount === 1) return 1200;
  if (turfCount <= 5) return 1800;
  return turfCount * 500;
}

export function platformFeeTierLabel(turfCount: number): string {
  if (turfCount <= 0) return "No turfs";
  if (turfCount === 1) return "1 turf — GMD 1,200/mo flat";
  if (turfCount <= 5) return `${turfCount} turfs — GMD 1,800/mo flat`;
  return `${turfCount} turfs — GMD 500/turf/mo`;
}
