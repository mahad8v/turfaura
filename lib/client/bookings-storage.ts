// Client-only (uses localStorage) — never import this from a Server Component.
import { slotToDate } from "@/lib/time";

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
 * True once the booking's actual end time has passed — not just its date,
 * so an overnight slot (e.g. ends "28:00", really 4am the next day) stays
 * visible until it genuinely finishes, using the same extended-notation
 * time math the rest of the app uses (see lib/time.ts).
 */
export function isBookingExpired(booking: { date: string; endTime: string }): boolean {
  return slotToDate(booking.date, booking.endTime).getTime() < Date.now();
}

/** Drops expired bookings from storage and returns what's left. */
export function pruneExpiredBookings(): BookingCardData[] {
  const all = readAll();
  const kept = all.filter((b) => !isBookingExpired(b));
  if (kept.length !== all.length) writeAll(kept);
  return kept;
}
