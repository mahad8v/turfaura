"use client";

import { useEffect, useState } from "react";
import { Ticket, Search, Loader2, CircleAlert } from "lucide-react";
import { MyBookingCard } from "@/components/booking/MyBookingCard";
import { Button } from "@/components/shared/Button";
import {
  pruneExpiredBookings,
  saveStoredBookings,
  type BookingCardData,
} from "@/lib/client/bookings-storage";
import { findBookingsByPhone, refreshBookingsByReference } from "./actions";

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<BookingCardData[]>([]);
  const [stale, setStale] = useState(false);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    // localStorage can't be read during SSR/the initial render (no `window`
    // there), so this can't be computed as lazy useState initial state —
    // it has to land after mount, via this effect, same as any other
    // browser-only API this app syncs from.
    /* eslint-disable react-hooks/set-state-in-effect */
    const local = pruneExpiredBookings();
    setBookings(local);
    setLoading(false);
    /* eslint-enable react-hooks/set-state-in-effect */

    if (local.length === 0) return;
    refreshBookingsByReference(local.map((b) => b.reference))
      .then((fresh) => {
        if (fresh.length > 0) {
          saveStoredBookings(fresh);
          setBookings(fresh);
          setStale(false);
        }
      })
      .catch(() => {
        // Offline or the request failed — keep showing the cached local
        // copy rather than an empty page.
        setStale(true);
      });
  }, []);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearchError(null);
    setSearching(true);
    setSearched(true);
    try {
      const found = await findBookingsByPhone(phone);
      if (found.length === 0) {
        setSearchError("No bookings found for that phone number.");
      } else {
        saveStoredBookings(found);
        setBookings((prev) => {
          const foundRefs = new Set(found.map((b) => b.reference));
          return [...found, ...prev.filter((b) => !foundRefs.has(b.reference))];
        });
        setStale(false);
      }
    } catch {
      setSearchError("Couldn't reach the server — check your connection and try again.");
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6">
      <div className="flex items-center gap-2">
        <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <Ticket className="size-4.5" strokeWidth={2.25} />
        </span>
        <div>
          <h1 className="font-display text-lg font-bold text-zinc-900">My bookings</h1>
          <p className="text-xs text-zinc-500">Saved on this device — no account needed.</p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="mt-5 flex items-center gap-2">
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Find bookings by phone number"
          className="w-full min-w-0 rounded-full border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
        />
        <Button type="submit" pending={searching} icon={<Search className="size-4" />} aria-label="Search">
          <span className="hidden sm:inline">Search</span>
        </Button>
      </form>
      <p className="mt-1.5 text-xs text-zinc-500">
        Lost your bookings (new phone, cleared browser data)? Search by the phone number you booked with.
      </p>
      {searchError && (
        <p className="mt-2 flex items-center gap-1.5 text-sm text-red-600">
          <CircleAlert className="size-4 shrink-0" />
          {searchError}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-3">
        {loading ? (
          <div className="flex justify-center py-10 text-zinc-400">
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : bookings.length > 0 ? (
          bookings.map((b) => <MyBookingCard key={b.reference} booking={b} stale={stale} />)
        ) : (
          !searched && (
            <div className="rounded-2xl border border-dashed border-zinc-200 py-10 text-center">
              <p className="text-sm text-zinc-500">No bookings saved on this device yet.</p>
              <p className="mt-1 text-xs text-zinc-400">
                Book a pitch and it&apos;ll show up here automatically — or search by phone number above.
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
