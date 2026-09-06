"use client";

import { useEffect, useState } from "react";
import { Ticket, Search, Loader2, CircleAlert, CalendarSearch } from "lucide-react";
import { MyBookingCard } from "@/components/booking/MyBookingCard";
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
    <div>
      <section className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 sm:pt-8">
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-zinc-900 via-emerald-950 to-zinc-950 px-5 py-8 shadow-xl sm:px-8 sm:py-10">
          <div className="bg-hero-dots absolute inset-0 opacity-20" />
          <div className="pointer-events-none absolute -top-16 right-0 size-72 rounded-full bg-emerald-500/20 blur-3xl" />

          <div className="relative">
            <span className="animate-fade-in-up inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-emerald-200 ring-1 ring-inset ring-white/20">
              <Ticket className="size-3.5" />
              Saved on this device — no account needed
            </span>
            <h1 className="animate-fade-in-up font-display mt-4 text-2xl font-extrabold text-white sm:text-4xl [animation-delay:80ms]">
              My bookings
            </h1>
            <p className="animate-fade-in-up mt-2 max-w-sm text-sm text-emerald-100/70 [animation-delay:150ms]">
              Lost your bookings — new phone, cleared browser data? Search by the phone number you booked with.
            </p>

            <form
              onSubmit={handleSearch}
              className="animate-fade-in-up mt-6 flex max-w-md items-center gap-2 rounded-full bg-white p-1.5 shadow-lg [animation-delay:220ms]"
            >
              <Search className="ml-2 size-4 shrink-0 text-zinc-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Search by phone number"
                className="min-w-0 flex-1 bg-transparent px-1 py-1.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
              />
              <button
                type="submit"
                disabled={searching}
                aria-label="Search"
                className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white transition-all hover:bg-emerald-400 active:scale-95 disabled:opacity-60"
              >
                {searching ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
              </button>
            </form>
            {searchError && (
              <p className="animate-fade-in-up mt-2.5 flex items-center gap-1.5 text-sm text-amber-200">
                <CircleAlert className="size-4 shrink-0" />
                {searchError}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-lg px-4 py-8 sm:px-6">
        {loading ? (
          <div className="flex justify-center py-10 text-zinc-400">
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : bookings.length > 0 ? (
          <>
            <p className="mb-3 text-sm font-medium text-zinc-500">
              {bookings.length} {bookings.length === 1 ? "booking" : "bookings"}
            </p>
            <div className="flex flex-col gap-3">
              {bookings.map((b) => (
                <MyBookingCard key={b.reference} booking={b} stale={stale} />
              ))}
            </div>
          </>
        ) : (
          !searched && (
            <div className="flex flex-col items-center rounded-3xl border border-dashed border-zinc-200 bg-white py-14 text-center">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <CalendarSearch className="size-6" strokeWidth={1.75} />
              </span>
              <p className="font-display mt-4 text-sm font-bold text-zinc-900">No bookings saved on this device</p>
              <p className="mt-1.5 max-w-xs text-sm text-zinc-500">
                Book a pitch and it&apos;ll show up here automatically — or search by phone number above.
              </p>
            </div>
          )
        )}
      </section>
    </div>
  );
}
