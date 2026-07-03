import { createClient } from "@supabase/supabase-js";

/* Dedicated Supabase project for El Rayga Camp (separate from any other
   site's database). The URL and publishable (anon) key are public by
   design — everything sensitive is enforced by RLS + SECURITY DEFINER
   functions in the DB. Env vars override the baked-in defaults (useful
   for branch databases / self-hosting). */
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://zmcjekcqklzyalzbvusc.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "sb_publishable_4yiTRUDDorz_wQXCXi-MNA_9jBEjQPE";

export function supabase() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  });
}

export type DbRoom = {
  id: string;
  slug: string;
  kind: "hut" | "room" | "dorm";
  sleeps: number;
  per_bed: boolean;
  units: number;
  base_price: number;
  photos: string[];
  accent: string | null;
};

export type DbReview = {
  platform: "google" | "booking" | "tripadvisor" | "facebook";
  rating: number;
  author: string;
  said_when: string | null;
  verbatim: boolean;
  lang: string | null;
  original: string | null;
  body: string;
};

export type Booking = {
  ref: string;
  room_slug: string;
  room_kind: string;
  per_bed: boolean;
  check_in: string;
  check_out: string;
  units: number;
  guests: number;
  guest: { first: string; last: string; email: string; phone: string; notes?: string };
  status: "pending" | "confirmed" | "paid" | "cancelled";
  payment_method: "paymob_card" | "paymob_wallet" | "arrival";
  base_total: number;
  fee_total: number;
  total: number;
};

export async function getRooms(): Promise<DbRoom[]> {
  const { data, error } = await supabase()
    .from("elrayga_rooms")
    .select("id, slug, kind, sleeps, per_bed, units, base_price, photos, accent")
    .eq("active", true);
  if (error) throw error;
  // stable, curated order
  const order = [
    "seafront-bamboo-hut", "garden-hut", "bedouin-hut", "comfy-studio",
    "private-double", "family-lodge", "mixed-dorm", "female-dorm",
  ];
  return (data ?? []).sort((a, b) => order.indexOf(a.slug) - order.indexOf(b.slug));
}

export async function getRoom(slug: string): Promise<DbRoom | null> {
  const { data } = await supabase()
    .from("elrayga_rooms")
    .select("id, slug, kind, sleeps, per_bed, units, base_price, photos, accent")
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();
  return data;
}

export async function getReviews(): Promise<DbReview[]> {
  const { data, error } = await supabase()
    .from("elrayga_reviews")
    .select("platform, rating, author, said_when, verbatim, lang, original, body")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getAvailability(slug: string, from: string, to: string) {
  const { data, error } = await supabase().rpc("elrayga_availability", {
    p_slug: slug, p_from: from, p_to: to,
  });
  if (error) throw error;
  return (data ?? []) as { day: string; free: number }[];
}

export async function getBooking(ref: string): Promise<Booking | null> {
  const { data, error } = await supabase().rpc("elrayga_get_booking", { p_ref: ref });
  if (error) throw error;
  return (data as Booking) ?? null;
}
