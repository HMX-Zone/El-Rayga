import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyPaymobHmac } from "@/lib/paymob";

/* Paymob transaction-processed webhook.
   Configure in the Paymob dashboard:
   https://<site>/api/paymob/webhook  (transaction processed callback) */
export async function POST(req: NextRequest) {
  const hmac = req.nextUrl.searchParams.get("hmac") ?? "";
  let payload: Record<string, unknown>;
  try { payload = await req.json(); } catch { return NextResponse.json({ error: "bad json" }, { status: 400 }); }

  if (!verifyPaymobHmac(payload, hmac)) {
    return NextResponse.json({ error: "bad signature" }, { status: 401 });
  }

  const obj = payload.obj as {
    success?: boolean; id?: number;
    order?: { id?: number; merchant_order_id?: string };
  };
  const ref = obj?.order?.merchant_order_id;
  if (!ref) return NextResponse.json({ error: "no ref" }, { status: 400 });

  const { error } = await supabase().rpc("elrayga_set_payment", {
    p_ref: ref,
    p_secret: process.env.ELRAYGA_RPC_SECRET ?? "",
    p_status: obj.success ? "paid" : "pending",
    p_txn: obj.id ? String(obj.id) : null,
    p_order_id: obj.order?.id ? String(obj.order.id) : null,
  });
  if (error) return NextResponse.json({ error: "db" }, { status: 500 });

  return NextResponse.json({ ok: true });
}
