import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createCheckout, paymobEnabled } from "@/lib/paymob";

/* Creates a booking. All validation, conflict-checking and pricing is
   authoritative in the DB (elrayga_create_booking, SECURITY DEFINER,
   advisory-locked). For Paymob methods we return a checkout URL —
   the real Paymob iframe when keys are configured, the in-app mock
   otherwise. */
export async function POST(req: NextRequest) {
  let body: {
    slug?: string; checkIn?: string; checkOut?: string; units?: number; guests?: number;
    guest?: { first: string; last: string; email: string; phone: string; notes?: string };
    method?: "arrival" | "paymob_card" | "paymob_wallet"; locale?: string;
  };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad json" }, { status: 400 }); }

  const { slug, checkIn, checkOut, units, guests, guest, method, locale } = body;
  if (!slug || !checkIn || !checkOut || !guest || !method) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  const { data, error } = await supabase().rpc("elrayga_create_booking", {
    p_slug: slug,
    p_in: checkIn,
    p_out: checkOut,
    p_units: units ?? 1,
    p_guests: guests ?? 1,
    p_guest: guest,
    p_method: method,
    p_locale: locale ?? "en",
  });

  if (error) {
    // surface the human-readable DB validation message ("sold out on …" etc.)
    const msg = error.message.replace(/^.*?:\s*/, "");
    return NextResponse.json({ error: msg }, { status: 409 });
  }

  const ref = data.ref as string;

  if (method === "arrival") {
    return NextResponse.json({ ref, status: data.status });
  }

  const origin = req.nextUrl.origin;
  try {
    const checkoutUrl = await createCheckout(
      { ref, total: Number(data.total), guest, method },
      `${origin}`
    );
    // remember locale for the post-payment redirect (mock mode)
    const url = new URL(checkoutUrl);
    if (!paymobEnabled()) url.searchParams.set("locale", locale ?? "en");
    return NextResponse.json({ ref, status: data.status, checkoutUrl: url.toString() });
  } catch {
    // payment provider down → keep the booking, fall back to arrival-style confirm
    return NextResponse.json({ ref, status: data.status });
  }
}
