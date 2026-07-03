import crypto from "crypto";

/* ============================================================
   Paymob Accept integration.
   Fully wired for production; runs in MOCK MODE when
   PAYMOB_API_KEY is not set, so the whole checkout can be
   exercised end-to-end before the camp's Paymob account exists.
   Env (add in Vercel, never commit):
     PAYMOB_API_KEY, PAYMOB_INTEGRATION_ID_CARD,
     PAYMOB_INTEGRATION_ID_WALLET, PAYMOB_IFRAME_ID, PAYMOB_HMAC_SECRET
   ============================================================ */

const BASE = "https://accept.paymob.com/api";

export const paymobEnabled = () => Boolean(process.env.PAYMOB_API_KEY);

type BookingForPayment = {
  ref: string;
  total: number; // EGP
  guest: { first: string; last: string; email: string; phone: string };
  method: "paymob_card" | "paymob_wallet";
};

async function pm(path: string, body: unknown) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Paymob ${path} failed: ${res.status} ${await res.text()}`);
  return res.json();
}

/** Returns a URL to redirect the guest to for payment. */
export async function createCheckout(b: BookingForPayment, siteUrl: string): Promise<string> {
  if (!paymobEnabled()) {
    // mock checkout page inside the app
    return `${siteUrl}/api/paymob/mock?ref=${encodeURIComponent(b.ref)}&amount=${b.total}`;
  }

  const { token } = await pm("/auth/tokens", { api_key: process.env.PAYMOB_API_KEY });

  const order = await pm("/ecommerce/orders", {
    auth_token: token,
    delivery_needed: false,
    amount_cents: Math.round(b.total * 100),
    currency: "EGP",
    merchant_order_id: b.ref,
    items: [{ name: `El Rayga Camp booking ${b.ref}`, amount_cents: Math.round(b.total * 100), quantity: 1 }],
  });

  const integrationId =
    b.method === "paymob_wallet"
      ? process.env.PAYMOB_INTEGRATION_ID_WALLET
      : process.env.PAYMOB_INTEGRATION_ID_CARD;

  const { token: paymentKey } = await pm("/acceptance/payment_keys", {
    auth_token: token,
    amount_cents: Math.round(b.total * 100),
    expiration: 3600,
    order_id: order.id,
    currency: "EGP",
    integration_id: Number(integrationId),
    billing_data: {
      first_name: b.guest.first,
      last_name: b.guest.last || "Guest",
      email: b.guest.email,
      phone_number: b.guest.phone || "+200000000000",
      country: "EG", city: "Dahab", street: "NA", building: "NA", floor: "NA", apartment: "NA",
    },
  });

  return `https://accept.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${paymentKey}`;
}

/** HMAC verification per Paymob's documented field order for transaction callbacks. */
export function verifyPaymobHmac(payload: Record<string, unknown>, hmac: string): boolean {
  const secret = process.env.PAYMOB_HMAC_SECRET;
  if (!secret) return false;
  const obj = payload.obj as Record<string, unknown>;
  const orderObj = obj?.order as Record<string, unknown> | undefined;
  const srcData = obj?.source_data as Record<string, unknown> | undefined;
  const fields = [
    obj?.amount_cents, obj?.created_at, obj?.currency, obj?.error_occured,
    obj?.has_parent_transaction, obj?.id, obj?.integration_id, obj?.is_3d_secure,
    obj?.is_auth, obj?.is_capture, obj?.is_refunded, obj?.is_standalone_payment,
    obj?.is_voided, orderObj?.id, obj?.owner, obj?.pending,
    srcData?.pan, srcData?.sub_type, srcData?.type, obj?.success,
  ];
  const concat = fields.map((f) => String(f ?? "")).join("");
  const digest = crypto.createHmac("sha512", secret).update(concat).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmac));
}

/** Mock-mode webhook signature (keeps the flow honest even without Paymob). */
export function mockSignature(ref: string, amount: string): string {
  const secret = process.env.ELRAYGA_RPC_SECRET ?? "dev";
  return crypto.createHmac("sha256", secret).update(`${ref}:${amount}`).digest("hex");
}
