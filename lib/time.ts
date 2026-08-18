// Pure "HH:mm" time-math helpers — no server-only imports, safe for client
// components (lib/availability.ts pulls in the Prisma/pg driver, which
// breaks the browser bundle if a client component imports from it).

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function addMinutesToTime(time: string, minutes: number): string {
  const total = timeToMinutes(time) + minutes;
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}
