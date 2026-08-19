const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function ownerBookingsChannel(ownerId: string): string {
  return `owner-bookings:${ownerId}`;
}

/**
 * Pushes a live "a booking just happened" event to the owner's open dashboard
 * tabs, over Supabase's Realtime broadcast REST endpoint — a plain HTTP call,
 * no websocket connection to manage server-side. Best-effort: a failure here
 * should never affect booking creation, so errors are swallowed like the
 * Telegram notification is.
 */
export async function broadcastNewBooking(ownerId: string): Promise<void> {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return;

  try {
    const res = await fetch(`${SUPABASE_URL}/realtime/v1/api/broadcast`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        messages: [{ topic: ownerBookingsChannel(ownerId), event: "new_booking", payload: {} }],
      }),
    });
    if (!res.ok) {
      console.error("Realtime broadcast failed:", res.status, await res.text().catch(() => ""));
    }
  } catch (err) {
    console.error("Realtime broadcast failed:", err);
  }
}
