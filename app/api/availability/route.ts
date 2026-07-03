import { NextRequest, NextResponse } from "next/server";
import { getAvailability } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug") ?? "";
  const from = req.nextUrl.searchParams.get("from") ?? "";
  const to = req.nextUrl.searchParams.get("to") ?? "";
  if (!/^[\w-]+$/.test(slug) || !/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
    return NextResponse.json({ error: "bad params" }, { status: 400 });
  }
  try {
    const rows = await getAvailability(slug, from, to);
    return NextResponse.json(rows, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 500 });
  }
}
