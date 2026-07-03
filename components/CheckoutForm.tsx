"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

type Props = {
  slug: string; checkIn: string; checkOut: string; units: number; guests: number;
};

const METHODS = ["arrival", "paymob_card", "paymob_wallet"] as const;

export default function CheckoutForm({ slug, checkIn, checkOut, units, guests }: Props) {
  const t = useTranslations("checkout");
  const locale = useLocale();
  const router = useRouter();
  const [method, setMethod] = useState<(typeof METHODS)[number]>("arrival");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ first: "", last: "", email: "", phone: "", notes: "" });
  const [bad, setBad] = useState<string[]>([]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const invalid = (["first", "last", "email", "phone"] as const).filter(
      (k) => !form[k].trim() || (k === "email" && !/^\S+@\S+\.\S+$/.test(form.email))
    );
    setBad(invalid);
    if (invalid.length) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, checkIn, checkOut, units, guests, guest: form, method, locale }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Booking failed");
      if (data.checkoutUrl) {
        location.href = data.checkoutUrl; // Paymob (or mock) payment page
      } else {
        router.push(`/book/confirmed?ref=${encodeURIComponent(data.ref)}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed");
      setBusy(false);
    }
  }

  return (
    <form id="guest-form" className="form-grid" onSubmit={submit} noValidate>
      <div className={`field ${bad.includes("first") ? "err" : ""}`}>
        <label htmlFor="g-first">{t("firstName")} *</label>
        <input id="g-first" autoComplete="given-name" value={form.first} onChange={set("first")} />
      </div>
      <div className={`field ${bad.includes("last") ? "err" : ""}`}>
        <label htmlFor="g-last">{t("lastName")} *</label>
        <input id="g-last" autoComplete="family-name" value={form.last} onChange={set("last")} />
      </div>
      <div className={`field ${bad.includes("email") ? "err" : ""}`}>
        <label htmlFor="g-email">{t("email")} *</label>
        <input id="g-email" type="email" autoComplete="email" value={form.email} onChange={set("email")} />
      </div>
      <div className={`field ${bad.includes("phone") ? "err" : ""}`}>
        <label htmlFor="g-phone">{t("phone")} *</label>
        <input id="g-phone" type="tel" autoComplete="tel" placeholder="+20 …" value={form.phone} onChange={set("phone")} />
      </div>
      <div className="field full">
        <label htmlFor="g-notes">{t("notes")}</label>
        <textarea id="g-notes" rows={3} placeholder={t("notesPlaceholder")} value={form.notes} onChange={set("notes")} />
      </div>

      <div className="full" style={{ marginTop: ".5rem" }}>
        <h2 className="d3" style={{ fontSize: "1.25rem", marginBottom: "0.9rem" }}>{t("howPay")}</h2>
        <div style={{ display: "grid", gap: ".8rem" }}>
          {METHODS.map((m) => (
            <label key={m} className={`pay-opt ${method === m ? "sel" : ""}`}>
              <input type="radio" name="pay" value={m} checked={method === m} onChange={() => setMethod(m)} />
              <span>
                <b>{t(`method_${m}`)}</b><br />
                <small className="muted">{t(`method_${m}_desc`)}</small>
              </span>
            </label>
          ))}
        </div>
      </div>
      {error && <p className="bb-error full" role="alert">{error}</p>}
      <div className="full">
        <button className="btn coral" type="submit" disabled={busy} style={{ width: "100%" }}>
          <span>{busy ? t("working") : t("confirm")}</span><span className="arr">→</span>
        </button>
        <p className="bb-note">{t("footnote")}</p>
      </div>
    </form>
  );
}
