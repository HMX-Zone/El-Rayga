import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/* iCal export per room type. Import this URL in Booking.com / Airbnb /
   Google Calendar to sync the camp's direct bookings outward. */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!/^[\w-]+$/.test(slug)) return new NextResponse("bad slug", { status: 400 });

  const { data, error } = await supabase().rpc("elrayga_ical_events", { p_slug: slug });
  if (error) return new NextResponse("unavailable", { status: 500 });

  const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  const events = (data as { ref: string; check_in: string; check_out: string; status: string }[])
    .map((e) => [
      "BEGIN:VEVENT",
      `UID:${e.ref}@elrayga-camp`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${e.check_in.replace(/-/g, "")}`,
      `DTEND;VALUE=DATE:${e.check_out.replace(/-/g, "")}`,
      `SUMMARY:El Rayga booking ${e.ref} (${e.status})`,
      "END:VEVENT",
    ].join("\r\n"))
    .join("\r\n");

  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//El Rayga Camp//Bookings//EN",
    `X-WR-CALNAME:El Rayga · ${slug}`,
    events,
    "END:VCALENDAR",
  ].join("\r\n");

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `inline; filename="elrayga-${slug}.ics"`,
      "Cache-Control": "public, s-maxage=300",
    },
  });
}
