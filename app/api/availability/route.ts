import { NextResponse, type NextRequest } from "next/server";
import { getAvailability } from "@/lib/availability";

export async function GET(request: NextRequest) {
  const pitchId = request.nextUrl.searchParams.get("pitchId");
  const date = request.nextUrl.searchParams.get("date");
  const durationParam = request.nextUrl.searchParams.get("duration");

  if (!pitchId || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "pitchId and a YYYY-MM-DD date are required." }, { status: 400 });
  }

  let duration: number | undefined;
  if (durationParam) {
    const parsed = Number(durationParam);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return NextResponse.json({ error: "duration must be a positive number of minutes." }, { status: 400 });
    }
    duration = parsed;
  }

  try {
    const slots = await getAvailability(pitchId, date, duration);
    return NextResponse.json({ slots });
  } catch {
    return NextResponse.json({ error: "Pitch not found." }, { status: 404 });
  }
}
