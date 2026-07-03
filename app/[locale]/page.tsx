import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getRooms, getReviews } from "@/lib/supabase";
import HeroGL from "@/components/HeroGL";
import Marquee from "@/components/Marquee";
import StaysStrip from "@/components/StaysStrip";
import ScoreBand from "@/components/ScoreBand";
import ExpRows from "@/components/ExpRows";

export const dynamic = "force-dynamic";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const [rooms, reviews] = await Promise.all([getRooms(), getReviews()]);
  const ticker = reviews.filter((r) => (r.platform === "booking" ? r.rating / 2 : r.rating) >= 4).slice(0, 3);

  return (
    <>
      {/* ============ HERO ============ */}
      <section className="hero">
        <HeroGL />
        <div className="hero-content">
          <div className="hero-kicker">
            <span className="eyebrow">{t("hero.kicker")}</span>
            <span className="ar" lang="ar" dir="rtl">كامب الرايجه</span>
          </div>
          <h1 className="hero-title d1" data-reveal>
            {t("hero.line1")}<br />{t("hero.line2")}<br /><em>{t("hero.line3")}</em>
          </h1>
          <p className="hero-sub" data-reveal>{t("hero.sub")}</p>
          <div className="hero-actions" data-reveal>
            <Link className="btn light" href="/stay"><span>{t("hero.cta")}</span><span className="arr">→</span></Link>
            <Link className="btn ghost" href="/reviews"><span>{t("hero.reviewsCta")}</span></Link>
          </div>
        </div>
        <div className="hero-strip">
          <span dangerouslySetInnerHTML={{ __html: t.raw("hero.strip1") }} />
          <span dangerouslySetInnerHTML={{ __html: t.raw("hero.strip2") }} />
          <span dangerouslySetInnerHTML={{ __html: t.raw("hero.strip3") }} />
          <span dangerouslySetInnerHTML={{ __html: t.raw("hero.strip4") }} />
        </div>
      </section>

      <Marquee
        items={[
          t("home.marquee1"),
          <span className="ar" key="ar1" lang="ar">تعالى عيش الرايجه</span>,
          t("home.marquee2"), t("home.marquee3"), t("home.marquee4"),
          <span className="ar" key="ar2" lang="ar">دهب</span>,
          t("home.marquee5"),
        ]}
      />

      {/* ============ INTRO ============ */}
      <section className="section wrap">
        <div className="section-head">
          <div>
            <span className="eyebrow">{t("home.introEyebrow")}</span>
            <h2 className="d2" style={{ marginTop: "1rem" }} data-reveal>
              {t("home.introTitle1")}<br /><em>{t("home.introTitle2")}</em>
            </h2>
          </div>
          <p className="lead muted" data-reveal>{t("home.introLead")}</p>
        </div>
        <div className="bignum-row">
          <div className="bignum" data-reveal><b>4.6<span style={{ fontSize: ".4em" }}>★</span></b><span>{t("home.stat1")}</span></div>
          <div className="bignum" data-reveal><b>9.3</b><span>{t("home.stat2")}</span></div>
          <div className="bignum" data-reveal><b>8</b><span>{t("home.stat3")}</span></div>
          <div className="bignum" data-reveal><b>20<span style={{ fontSize: ".4em" }}>min</span></b><span>{t("home.stat4")}</span></div>
        </div>
      </section>

      {/* ============ STAYS ============ */}
      <section className="section theme-dark" id="stays">
        <div className="wrap section-head">
          <div>
            <span className="eyebrow">{t("home.staysEyebrow")}</span>
            <h2 className="d2" style={{ marginTop: "1rem" }}>{t("home.staysTitle1")} <em>{t("home.staysTitle2")}</em></h2>
          </div>
          <Link className="btn light" href="/stay"><span>{t("home.allStays")}</span><span className="arr">→</span></Link>
        </div>
        <StaysStrip rooms={rooms} />
      </section>

      {/* ============ EXPERIENCES ============ */}
      <section className="section wrap">
        <div className="section-head">
          <div>
            <span className="eyebrow">{t("home.expEyebrow")}</span>
            <h2 className="d2" style={{ marginTop: "1rem" }}>
              {t("home.expTitle1")}<br /><em>{t("home.expTitle2")}</em>
            </h2>
          </div>
          <Link className="btn ghost" href="/experiences"><span>{t("home.allExp")}</span><span className="arr">→</span></Link>
        </div>
        <ExpRows limit={4} />
      </section>

      {/* ============ REVIEWS ============ */}
      <section className="section theme-deep">
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="eyebrow">{t("home.revEyebrow")}</span>
              <h2 className="d2" style={{ marginTop: "1rem" }}>
                {t("home.revTitle1")}<br /><em>{t("home.revTitle2")}</em>
              </h2>
            </div>
            <Link className="btn light" href="/reviews"><span>{t("home.readAll")}</span><span className="arr">→</span></Link>
          </div>
          <ScoreBand />
          <div style={{ display: "grid", gap: "1.1rem", marginTop: "2rem" }}>
            {ticker.map((r, i) => (
              <div className="tick-card" data-reveal key={i}>
                <p style={{ fontFamily: "var(--font-display)", fontSize: "1.12rem", fontStyle: "italic" }}>“{r.body}”</p>
                <p className="muted" style={{ marginTop: ".7rem", fontSize: ".8rem" }}>— {r.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ WHERE ============ */}
      <section className="section wrap">
        <div className="section-head">
          <div>
            <span className="eyebrow">{t("home.whereEyebrow")}</span>
            <h2 className="d2" style={{ marginTop: "1rem" }} dangerouslySetInnerHTML={{ __html: t.raw("home.whereTitle") }} />
          </div>
          <div className="muted" style={{ maxWidth: "36ch" }} data-reveal>{t("home.whereNote")}</div>
        </div>
        <div className="map-band" data-reveal-img>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/scenes/lagoon.svg" alt={t("home.mapAlt")} />
          <span className="map-pin-label">✳ {t("home.mapPin")}</span>
        </div>
      </section>
    </>
  );
}
