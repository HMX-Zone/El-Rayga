import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getRoom, supabase } from "@/lib/supabase";
import { fmtEGP, CAMP, type RoomSlug } from "@/lib/rooms";
import CheckoutForm from "@/components/CheckoutForm";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

type Search = { slug?: string; in?: string; out?: string; units?: string; guests?: string };

export default async function BookPage({
  params, searchParams,
}: { params: Promise<{ locale: string }>; searchParams: Promise<Search> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const q = await searchParams;

  const room = q.slug ? await getRoom(q.slug) : null;
  const valid = room && q.in && q.out && /^\d{4}-\d{2}-\d{2}$/.test(q.in) && /^\d{4}-\d{2}-\d{2}$/.test(q.out);

  if (!valid) {
    return (
      <section className="section wrap page-top">
        <span className="eyebrow">{t("checkout.eyebrow")}</span>
        <h1 className="d2" style={{ marginTop: "1rem" }}>{t("checkout.emptyTitle")}</h1>
        <p className="lead muted" style={{ margin: "1.4rem 0 2rem" }}>{t("checkout.emptyLead")}</p>
        <Link className="btn coral" href="/stay"><span>{t("checkout.browse")}</span><span className="arr">→</span></Link>
      </section>
    );
  }

  const units = Math.max(1, Math.min(Number(q.units) || 1, room.units));
  const guests = Math.max(1, Math.min(Number(q.guests) || 1, room.sleeps));

  const { data: quote } = await supabase().rpc("elrayga_quote", {
    p_slug: room.slug, p_in: q.in, p_out: q.out, p_units: units,
  });
  const rs = room.slug as RoomSlug;
  const fmtDate = (s: string) =>
    new Date(s + "T12:00:00").toLocaleDateString(locale, { weekday: "short", day: "numeric", month: "short", year: "numeric" });

  return (
    <section className="section wrap page-top">
      <span className="eyebrow">{t("checkout.eyebrow")}</span>
      <h1 className="d2" style={{ marginTop: "1rem" }} data-reveal>
        {t("checkout.title")} <em>{t("checkout.titleEm")}</em>
      </h1>

      <div className="checkout-grid" style={{ marginTop: "clamp(2rem,4vw,3.2rem)" }}>
        <div>
          <h2 className="d3" style={{ marginBottom: "1.3rem" }}>{t("checkout.whosComing")}</h2>
          <CheckoutForm slug={room.slug} checkIn={q.in!} checkOut={q.out!} units={units} guests={guests} />
        </div>

        <aside className="order-card" data-reveal>
          <div className="oc-media">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={room.photos[0]} alt={t(`rooms.${rs}.name`)} />
          </div>
          <div className="oc-body">
            <h3 className="d3" style={{ fontSize: "1.3rem" }}>{t(`rooms.${rs}.name`)}</h3>
            <p className="muted" style={{ fontSize: ".85rem", margin: ".3rem 0 1rem" }}>{t(`rooms.${rs}.tagline`)}</p>
            <div className="row"><span>{t("room.checkIn")}</span><b>{fmtDate(q.in!)} · {CAMP.checkIn}</b></div>
            <div className="row"><span>{t("room.checkOut")}</span><b>{fmtDate(q.out!)} · {CAMP.checkOut}</b></div>
            <div className="row"><span>{room.per_bed ? t("common.beds") : t("common.guests")}</span><b>{room.per_bed ? units : guests}</b></div>
            {quote && (
              <>
                <div className="row">
                  <span>EGP {fmtEGP(quote.rate, locale)} × {quote.nights} {t("common.nights")}{units > 1 ? ` × ${units}` : ""}</span>
                  <b>EGP {fmtEGP(quote.base, locale)}</b>
                </div>
                <div className="row"><span>{t("room.campFee")}</span><b>EGP {fmtEGP(quote.fee, locale)}</b></div>
                <div className="row total"><span>{t("common.total")}</span><b>EGP {fmtEGP(quote.total, locale)}</b></div>
              </>
            )}
            <p style={{ marginTop: "1rem" }}>
              <Link href={`/stay/${room.slug}`} className="muted" style={{ fontSize: ".8rem", textDecoration: "underline" }}>
                ← {t("checkout.changeDates")}
              </Link>
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
