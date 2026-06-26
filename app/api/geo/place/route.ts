/** GET /api/geo/place?placeId= — resolve a place to coordinates + address. */
import { NextResponse } from "next/server";

import { placeDetails } from "@/lib/maps-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const placeId = new URL(request.url).searchParams.get("placeId") ?? "";
  const place = await placeDetails(placeId);
  if (!place) {
    return NextResponse.json({ error: "Place not found." }, { status: 404 });
  }
  return NextResponse.json({ place }, { status: 200 });
}
