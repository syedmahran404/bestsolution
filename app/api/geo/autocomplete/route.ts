/** GET /api/geo/autocomplete?q= — address suggestions (V2.1 location search). */
import { NextResponse } from "next/server";

import { placesAutocomplete } from "@/lib/maps-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q") ?? "";
  const predictions = await placesAutocomplete(q);
  return NextResponse.json({ predictions }, { status: 200 });
}
