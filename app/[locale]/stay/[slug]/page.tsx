import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getRoom, getRooms } from "@/lib/supabase";
import { ARABIC_NAMES, ROOM_FEATURES, ROOM_ORDER, fmtEGP, type RoomSlug, CAMP } from "@/lib/rooms";
import Gallery from "@/components/Gallery";
import BookingBox from "@/components/BookingBox";
import RoomCard from "@/components/RoomCard";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!ROOM_ORDER.includes(slug as RoomSlug)) return {};
  const t = await getTranslations({ locale });
  return {
    title: t(`rooms.${slug}.name`),
    description: t(`rooms.${slug}.tagline`),
  };
}

export default async function RoomPage({
  params,
}: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  if (!ROOM_ORDER.includes(slug as RoomSlug)) notFound();
  const t = await getTranslations();
  const [room, rooms] = await Promise.all([getRoom(slug), getRooms()]);
  if (!room) notFound();

  const rs = slug as RoomSlug;
  const others = rooms.filter((r) => r.slug !== slug).slice(0, 3);

  return (
    <>
      <section className="section wrap page-top">
        <div className="room-head">
          <div>
            <span className="eyebrow">
              {t(`common.kind_${room.kind}`)} · {t("room.sleeps", { n: room.sleeps })}
            </span>
            <h1 className="d2" style={{ marginTop: "1rem" }}>{t(`rooms.${rs}.name`)}</h1>
            {locale !== "ar" && (
              <p className="ar muted" lang="ar" dir="rtl" style={{ fontSize: "1.25rem", marginTop: ".3rem" }}>
                {ARABIC_NAMES[rs]}
              </p>
            )}
          </div>
          <div style={{ textAlign: "end" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "1.9rem", fontWeight: 600 }}>
              EGP {fmtEGP(room.base_price, locale)}
              <span style={{ fontSize: ".5em", opacity: 0.6 }}> / {room.per_bed ? t("common.bed") : t("common.night")}</span>
            </div>
            <Link href="/reviews" className="muted" style={{ fontSize: ".85rem", textDecoration: "underline" }}>
              {t("room.ratingLine")}
            </Link>
          </div>
        </div>

        <Gallery photos={room.photos} name={t(`rooms.${rs}.name`)} />

        <div className="room-cols">
          <div>
            <h2 className="d3">{t(`rooms.${rs}.tagline`)}</h2>
            <div className="spec-row">
              <div><b>{t("room.specSleeps")}</b>{room.sleeps}</div>
              <div><b>{t("room.specBeds")}</b>{t(`rooms.${rs}.beds`)}</div>
              <div><b>{t("room.specBath")}</b>{t(`rooms.${rs}.bath`)}</div>
              <div><b>{t("room.specSize")}</b>{t(`rooms.${rs}.size`)}</div>
            </div>
            <p className="lead">{t(`rooms.${rs}.desc`)}</p>
            <ul className="feat-list">
              {ROOM_FEATURES[rs].map((f) => <li key={f}>{t(`features.${f}`)}</li>)}
            </ul>
            <p className="muted" style={{ marginTop: "2rem", fontSize: ".85rem" }}>
              {t("room.cancellation", { in: CAMP.checkIn, out: CAMP.checkOut })}
            </p>
          </div>
          <BookingBox room={room} />
        </div>
      </section>

      <section className="section theme-dark">
        <div className="wrap section-head">
          <div>
            <span className="eyebrow">{t("room.keepLooking")}</span>
            <h2 className="d2" style={{ marginTop: "1rem" }}>{t("room.otherWays")} <em>{t("room.otherWaysEm")}</em></h2>
          </div>
          <Link className="btn light" href="/stay"><span>{t("home.allStays")}</span><span className="arr">→</span></Link>
        </div>
        <div className="wrap stay-grid">
          {others.map((r) => <RoomCard key={r.slug} room={r} />)}
        </div>
      </section>
    </>
  );
}
