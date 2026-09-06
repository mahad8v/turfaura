/** The app's own public base URL — used anywhere an absolute link needs to be built (share links, auth email redirects). */
export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}
