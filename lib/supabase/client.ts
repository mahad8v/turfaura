import { createBrowserClient } from "@supabase/ssr";

// Memoized — several components (RealtimeBookingListener, the quick-unlock
// biometric flow, etc.) each call createClient() independently. Handing
// each caller its own fresh client used to mean multiple independent
// auto-refresh timers running against the same cookie-stored session; since
// Supabase rotates the refresh token on every use, two of them racing to
// refresh at once could invalidate the token the other had just gotten
// ("Invalid Refresh Token: Refresh Token Not Found") even in normal use.
// One shared instance per tab removes that race entirely.
let client: ReturnType<typeof createBrowserClient> | undefined;

export function createClient() {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
  }
  return client;
}
