import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import ExpRows from "@/components/ExpRows";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("expTitle"), description: t("expDesc") };
}

export default async function ExperiencesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const chips = [
    "chipTea", "chipFilm", "chipGames", "chipHammocks", "chipBooks",
    "chipKitchen", "chipTerrace", "chipSnorkel", "chipTours", "chipWifi",
  ] as const;

  return (
    <>
      <section className="section wrap page-top">
        <span className="eyebrow">{t("experiences.eyebrow")}</span>
        <h1 className="d1" style={{ marginTop: "1.2rem" }} data-reveal>
          {t("experiences.title1")}<br /><em>{t("experiences.title2")}</em>
        </h1>
        <p className="lead muted" style={{ margin: "1.6rem 0 2.6rem" }} data-reveal>{t("experiences.lead")}</p>
        <ExpRows />
      </section>
      <section className="section theme-dark">
        <div className="wrap section-head">
          <div>
            <span className="eyebrow">{t("experiences.freeEyebrow")}</span>
            <h2 className="d2" style={{ marginTop: "1rem" }}>{t("experiences.freeTitle")} <em>{t("experiences.freeTitleEm")}</em></h2>
          </div>
        </div>
        <div className="wrap chips" data-reveal>
          {chips.map((c) => <span key={c}>{t(`experiences.${c}`)}</span>)}
        </div>
      </section>
    </>
  );
}
