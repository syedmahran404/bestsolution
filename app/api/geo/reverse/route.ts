/** GET /api/geo/reverse?lat=&lng= — coordinates → human-readable address. */
import { NextResponse } from "next/server";

import { reverseGeocode } from "@/lib/maps-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const lat = Number(params.get("lat"));
  const lng = Number(params.get("lng"));
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return NextResponse.json(
      { error: "Valid lat/lng required." },
      { status: 422 },
    );
  }
  const address = await reverseGeocode(lat, lng);
  return NextResponse.json({ address }, { status: 200 });
}
