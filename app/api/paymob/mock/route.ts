import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { mockSignature } from "@/lib/paymob";

/* Mock payment gateway, active only when Paymob keys are absent.
   GET  → renders a minimal sandbox checkout page.
   POST → verifies the signed payload and marks the booking paid via
          the secret-guarded RPC, then redirects to the confirmation. */

export async function GET(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get("ref") ?? "";
  const amount = req.nextUrl.searchParams.get("amount") ?? "0";
  const locale = req.nextUrl.searchParams.get("locale") ?? "en";
  const sig = mockSignature(ref, amount);

  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Paymob sandbox · El Rayga</title>
<style>
  body{font-family:system-ui,sans-serif;background:#0c1a1c;color:#f4efe4;display:grid;place-items:center;min-height:100vh;margin:0}
  .card{background:#fff;color:#131f1e;border-radius:20px;padding:2.4rem;max-width:26rem;width:calc(100% - 2rem);box-shadow:0 30px 80px rgba(0,0,0,.4)}
  h1{font-size:1.1rem;margin:0 0 .3rem} .sub{opacity:.55;font-size:.82rem;margin-bottom:1.6rem}
  .amt{font-size:2rem;font-weight:700;margin-bottom:1.6rem}
  input{width:100%;padding:.8em 1em;border:1px solid #ccc;border-radius:10px;margin-bottom:.7rem;font:inherit;box-sizing:border-box}
  button{width:100%;padding:.9em;border:0;border-radius:100px;font:inherit;font-weight:700;cursor:pointer}
  .pay{background:#e8542f;color:#fff} .cancel{background:none;color:#888;margin-top:.4rem}
  .badge{display:inline-block;background:#ffe9d9;color:#c14a1e;font-size:.68rem;font-weight:700;letter-spacing:.1em;padding:.35em .9em;border-radius:100px;margin-bottom:1rem}
</style></head><body>
<form class="card" method="POST" action="/api/paymob/mock">
  <span class="badge">SANDBOX — NO REAL CHARGE</span>
  <h1>El Rayga Camp · ${ref}</h1>
  <div class="sub">Paymob test checkout (add real keys in Vercel to go live)</div>
  <div class="amt">EGP ${amount}</div>
  <input placeholder="Card number" value="4987 6543 2109 8769" readonly>
  <input placeholder="MM/YY · CVV" value="12/29 · 123" readonly>
  <input type="hidden" name="ref" value="${ref.replace(/"/g, "")}">
  <input type="hidden" name="amount" value="${amount.replace(/"/g, "")}">
  <input type="hidden" name="sig" value="${sig}">
  <input type="hidden" name="locale" value="${locale.replace(/[^a-z-]/gi, "")}">
  <button class="pay" type="submit" id="mock-pay">Pay EGP ${amount}</button>
  <button class="cancel" formaction="/api/paymob/mock?cancel=1">Cancel</button>
</form></body></html>`;

  return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const ref = String(form.get("ref") ?? "");
  const amount = String(form.get("amount") ?? "");
  const sig = String(form.get("sig") ?? "");
  const locale = String(form.get("locale") ?? "en").replace(/[^a-z-]/gi, "") || "en";

  const cancelled = req.nextUrl.searchParams.get("cancel") === "1";
  if (!cancelled && sig === mockSignature(ref, amount)) {
    await supabase().rpc("elrayga_set_payment", {
      p_ref: ref,
      p_secret: process.env.ELRAYGA_RPC_SECRET ?? "",
      p_status: "paid",
      p_txn: `MOCK-${Date.now()}`,
      p_order_id: `MOCKORD-${ref}`,
    });
  }
  return NextResponse.redirect(
    new URL(`/${locale}/book/confirmed?ref=${encodeURIComponent(ref)}`, req.nextUrl.origin),
    303
  );
}
