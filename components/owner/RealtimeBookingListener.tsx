"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/**
 * Mounted once in the owner dashboard shell. Listens for the broadcast
 * lib/realtime.ts sends on every new booking and refreshes the current
 * route's Server Component data in place — no manual reload needed to see
 * a booking that just came in.
 */
export function RealtimeBookingListener({ ownerId }: { ownerId: string }) {
  const router = useRouter();
  const [toast, setToast] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`owner-bookings:${ownerId}`)
      .on("broadcast", { event: "new_booking" }, () => {
        router.refresh();
        setToast(true);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ownerId, router]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(false), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <div
      aria-hidden={!toast}
      className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-emerald-600/30 transition-all duration-300 ${
        toast ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
      }`}
    >
      <CalendarCheck className="size-4 shrink-0" />
      New booking received
    </div>
  );
}
