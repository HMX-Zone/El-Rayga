import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const maxDuration = 60;

/* Hourly Vercel cron (see vercel.json): pulls each OTA iCal feed listed in
   elrayga_ical_feeds and blocks those dates locally, so a Booking.com or
   Airbnb reservation can't be double-booked here. Add feeds with:
   insert into elrayga_ical_feeds (room_id, url, label) values (…). */

function parseIcs(ics: string): { start: string; end: string }[] {
  const out: { start: string; end: string }[] = [];
  const events = ics.split("BEGIN:VEVENT").slice(1);
  for (const ev of events) {
    const start = ev.match(/DTSTART[^:]*:(\d{8})/)?.[1];
    const end = ev.match(/DTEND[^:]*:(\d{8})/)?.[1];
    if (start && end) {
      const f = (s: string) => `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
      out.push({ start: f(start), end: f(end) });
    }
  }
  return out;
}

export async function GET(req: Request) {
  // Vercel cron sends Authorization: Bearer $CRON_SECRET when configured
  const auth = req.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const secret = process.env.ELRAYGA_RPC_SECRET;
  if (!secret) return NextResponse.json({ error: "ELRAYGA_RPC_SECRET not set" }, { status: 500 });

  const db = supabase();
  const { data: feeds, error } = await db.rpc("elrayga_list_ical_feeds", { p_secret: secret });
  if (error) return NextResponse.json({ error: "db" }, { status: 500 });
  if (!feeds?.length) return NextResponse.json({ ok: true, feeds: 0 });

  let blocked = 0;
  for (const feed of feeds as { id: string; room_id: string; url: string }[]) {
    try {
      const res = await fetch(feed.url, { signal: AbortSignal.timeout(15000) });
      if (!res.ok) continue;
      const ranges = parseIcs(await res.text());
      const days: string[] = [];
      for (const r of ranges) {
        for (let d = new Date(r.start + "T00:00:00Z"); d < new Date(r.end + "T00:00:00Z"); d.setUTCDate(d.getUTCDate() + 1)) {
          days.push(d.toISOString().slice(0, 10));
        }
      }
      const { data: n } = await db.rpc("elrayga_apply_ical_blocks", {
        p_secret: secret, p_feed_id: feed.id, p_days: days,
      });
      blocked += n ?? 0;
    } catch { /* keep going with the next feed */ }
  }
  return NextResponse.json({ ok: true, feeds: feeds.length, blocked });
}
