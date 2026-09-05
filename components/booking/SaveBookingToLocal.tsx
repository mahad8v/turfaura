"use client";

import { useEffect } from "react";
import { saveStoredBooking, type BookingCardData } from "@/lib/client/bookings-storage";

/** Invisible — just persists this booking into the browser's local "My Bookings" list once, on landing on its receipt page. */
export function SaveBookingToLocal({ booking }: { booking: BookingCardData }) {
  useEffect(() => {
    saveStoredBooking(booking);
    // Keyed by reference, which never changes for a given receipt page — a
    // one-time save is intentional, not a dependency this should re-run for.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
