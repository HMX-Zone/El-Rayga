import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("aboutTitle"), description: t("aboutDesc") };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const blocks = ["place", "idea", "people", "honesty"] as const;
  const chips = [
    "chipWifi", "chipBreakfast", "chipParking", "chipDesk", "chipGarden", "chipBar",
    "chipKitchen", "chipLaundry", "chipAC", "chipLuggage", "chipYoga", "chipRestaurant",
  ] as const;

  return (
    <>
      <section className="section wrap page-top">
        <span className="eyebrow">{t("about.eyebrow")} · <span className="ar" lang="ar">عن الكامب</span></span>
        <h1 className="d1" style={{ marginTop: "1.2rem" }} data-reveal>
          {t("about.title1")}<br /><em>{t("about.title2")}</em>
        </h1>
        <p className="lead muted" style={{ marginTop: "1.6rem" }} data-reveal>{t("about.lead")}</p>
      </section>

      <section className="wrap section" style={{ paddingTop: 0 }}>
        <div className="story-pin">
          <div className="story-media" data-reveal-img>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/scenes/camp-dusk.svg" alt={t("about.mediaAlt")} />
          </div>
          <div className="story-blocks">
            {blocks.map((b, i) => (
              <div key={b} data-reveal>
                <span className="eyebrow">0{i + 1} — {t(`about.${b}Eyebrow`)}</span>
                <h3>{t(`about.${b}Title`)}</h3>
                <p>{t(`about.${b}Body`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section theme-dark">
        <div className="wrap section-head">
          <div>
            <span className="eyebrow">{t("about.facilitiesEyebrow")}</span>
            <h2 className="d2" style={{ marginTop: "1rem" }}>{t("about.facilitiesTitle")} <em>{t("about.facilitiesTitleEm")}</em></h2>
          </div>
        </div>
        <div className="wrap chips" data-reveal>
          {chips.map((c) => <span key={c}>{t(`about.${c}`)}</span>)}
        </div>
        <div className="wrap bignum-row" style={{ marginTop: "3.2rem" }}>
          <div className="bignum" data-reveal><b>2 min</b><span>{t("about.fact1")}</span></div>
          <div className="bignum" data-reveal><b>24 h</b><span>{t("about.fact2")}</span></div>
          <div className="bignum" data-reveal><b>2×</b><span>{t("about.fact3")}</span></div>
          <div className="bignum" data-reveal><b>2 AM</b><span>{t("about.fact4")}</span></div>
        </div>
      </section>
    </>
  );
}
