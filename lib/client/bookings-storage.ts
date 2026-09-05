// Client-only (uses localStorage) — never import this from a Server Component.

export type StoredBookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "EXPIRED";

export interface BookingCardData {
  reference: string;
  status: StoredBookingStatus;
  date: string; // "YYYY-MM-DD"
  startTime: string;
  endTime: string;
  totalPrice: string;
  currency: string;
  customerPhone: string;
  pitchSlug: string;
  pitchName: string;
  pitchAddress: string;
  lat: number;
  lng: number;
  photoPath: string | null;
}

const STORAGE_KEY = "turfaura:my-bookings";
const MAX_STORED = 100;

function readAll(): BookingCardData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // Private browsing, disabled storage, or corrupted JSON — treat as empty.
    return [];
  }
}

function writeAll(bookings: BookingCardData[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings.slice(0, MAX_STORED)));
  } catch {
    // Storage full or unavailable — the save silently no-ops, same as it
    // would for any other client-only convenience feature.
  }
}

export function getStoredBookings(): BookingCardData[] {
  return readAll();
}

/** Upserts by reference — re-saving an existing booking (e.g. after a status refresh) replaces it, not duplicates it. */
export function saveStoredBooking(booking: BookingCardData): void {
  const rest = readAll().filter((b) => b.reference !== booking.reference);
  writeAll([booking, ...rest]);
}

export function saveStoredBookings(bookings: BookingCardData[]): void {
  const refs = new Set(bookings.map((b) => b.reference));
  const rest = readAll().filter((b) => !refs.has(b.reference));
  writeAll([...bookings, ...rest]);
}

export function removeStoredBooking(reference: string): void {
  writeAll(readAll().filter((b) => b.reference !== reference));
}

/**
 * A booking stays visible through its own day plus one extra grace day (an
 * overnight slot's actual end time can fall after midnight the next day —
 * see lib/time.ts), then it's pruned automatically on the next visit.
 */
export function isBookingExpired(booking: { date: string }): boolean {
  const today = new Date().toISOString().slice(0, 10);
  const cutoff = new Date(`${today}T00:00:00.000Z`);
  cutoff.setUTCDate(cutoff.getUTCDate() - 1);
  return Date.parse(`${booking.date}T00:00:00.000Z`) < cutoff.getTime();
}

/** Drops expired bookings from storage and returns what's left. */
export function pruneExpiredBookings(): BookingCardData[] {
  const all = readAll();
  const kept = all.filter((b) => !isBookingExpired(b));
  if (kept.length !== all.length) writeAll(kept);
  return kept;
}
