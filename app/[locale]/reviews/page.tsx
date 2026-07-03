import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getReviews } from "@/lib/supabase";
import ScoreBand from "@/components/ScoreBand";
import ReviewWall from "@/components/ReviewWall";
import Marquee from "@/components/Marquee";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("reviewsTitle"), description: t("reviewsDesc") };
}

export default async function ReviewsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const reviews = await getReviews();

  return (
    <>
      <section className="section wrap page-top">
        <span className="eyebrow">{t("reviews.eyebrow")}</span>
        <h1 className="d1" style={{ marginTop: "1.2rem" }} data-reveal>
          {t("reviews.title1")}<br /><em>{t("reviews.title2")}</em>
        </h1>
        <p className="lead muted" style={{ margin: "1.6rem 0 2.6rem" }} data-reveal>{t("reviews.lead")}</p>
        <ScoreBand />
      </section>
      <section className="wrap" style={{ paddingBottom: "clamp(4rem,9vw,8.5rem)" }}>
        <ReviewWall reviews={reviews} />
      </section>
      <Marquee className="theme-dark" items={[t("reviews.marquee1"), t("reviews.marquee2"), t("reviews.marquee3")]} />
    </>
  );
}
