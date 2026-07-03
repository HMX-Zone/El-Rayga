import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getBooking } from "@/lib/supabase";
import { CAMP, fmtEGP, type RoomSlug } from "@/lib/rooms";

export const metadata: Metadata = { title: "Booking confirmed", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function ConfirmedPage({
  params, searchParams,
}: { params: Promise<{ locale: string }>; searchParams: Promise<{ ref?: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const { ref } = await searchParams;
  const booking = ref ? await getBooking(ref) : null;

  if (!booking) {
    return (
      <section className="section wrap page-top">
        <h1 className="d2">{t("confirmed.notFound")}</h1>
        <p style={{ marginTop: "2rem" }}>
          <Link className="btn coral" href="/stay"><span>{t("checkout.browse")}</span><span className="arr">→</span></Link>
        </p>
      </section>
    );
  }

  const rs = booking.room_slug as RoomSlug;
  const fmtDate = (s: string) =>
    new Date(s + "T12:00:00").toLocaleDateString(locale, { weekday: "short", day: "numeric", month: "short", year: "numeric" });

  const wa = encodeURIComponent(
    `Hi El Rayga! Booking ${booking.ref}\n` +
    `${t(`rooms.${rs}.name`)} — ${booking.units} ${booking.per_bed ? "bed(s)" : "unit"} · ${booking.guests} guest(s)\n` +
    `${booking.check_in} → ${booking.check_out}\n` +
    `Total EGP ${booking.total} — ${booking.payment_method === "arrival" ? "paying on arrival" : booking.status === "paid" ? "PAID online" : "payment pending"}\n` +
    `Name: ${booking.guest.first} ${booking.guest.last}`
  );

  const statusKey = booking.status === "paid" ? "paid" : booking.status === "confirmed" ? "confirmed" : "pending";

  return (
    <section className="section wrap page-top">
      <span className="eyebrow">
        {t("confirmed.shukran", { name: booking.guest.first })} · <span className="ar" lang="ar">شكراً</span>
      </span>
      <h1 className="d1" style={{ marginTop: "1.2rem" }} data-reveal>
        {t("confirmed.title1")}<br /><em>{t("confirmed.title2")}</em>
      </h1>
      <p className="lead muted" style={{ margin: "1.6rem 0" }}>{t(`confirmed.lead_${statusKey}`)}</p>
      <p style={{ marginBottom: "2.2rem" }}>
        {t("confirmed.reference")}&nbsp; <span className="ref-chip d3">{booking.ref}</span>
      </p>

      <div className="checkout-grid">
        <div className="tick-card" data-reveal>
          <div className="order-card" style={{ position: "static", boxShadow: "none", border: 0, background: "none" }}>
            <div className="row"><span>{t("confirmed.stay")}</span><b>{t(`rooms.${rs}.name`)}</b></div>
            <div className="row"><span>{t("room.checkIn")}</span><b>{fmtDate(booking.check_in)} · {CAMP.checkIn}</b></div>
            <div className="row"><span>{t("room.checkOut")}</span><b>{fmtDate(booking.check_out)} · {CAMP.checkOut}</b></div>
            <div className="row"><span>{booking.per_bed ? t("common.beds") : t("common.guests")}</span><b>{booking.per_bed ? booking.units : booking.guests}</b></div>
            <div className="row"><span>{t("confirmed.payment")}</span><b>{t(`confirmed.status_${statusKey}`)}</b></div>
            <div className="row total"><span>{t("common.total")}</span><b>EGP {fmtEGP(booking.total, locale)}</b></div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: ".9rem", marginTop: "1.3rem" }}>
            <a className="btn coral" href={`https://wa.me/${CAMP.phoneRaw}?text=${wa}`} target="_blank" rel="noopener noreferrer">
              <span>{t("confirmed.sendWhatsApp")}</span><span className="arr">→</span>
            </a>
          </div>
        </div>
        <aside>
          <div className="tick-card" data-reveal>
            <h3 className="d3" style={{ fontSize: "1.2rem" }}>{t("confirmed.beforeYouCome")}</h3>
            <p className="muted" style={{ marginTop: ".8rem", lineHeight: 1.9 }}>
              {CAMP.address}<br />
              Plus code <b className="mono-num">{CAMP.plusCode}</b><br />
              <a href={`tel:+${CAMP.phoneRaw}`} style={{ textDecoration: "underline" }}>{CAMP.phone}</a><br /><br />
              {t("confirmed.bring")}
            </p>
          </div>
          <p style={{ marginTop: "1.3rem" }}>
            <Link href="/" className="muted" style={{ textDecoration: "underline", fontSize: ".85rem" }}>
              ← {t("confirmed.backHome")}
            </Link>
          </p>
        </aside>
      </div>
    </section>
  );
}
