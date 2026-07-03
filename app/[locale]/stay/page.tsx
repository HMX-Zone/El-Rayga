import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getRooms } from "@/lib/supabase";
import StayGrid from "@/components/StayGrid";
import Marquee from "@/components/Marquee";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("stayTitle"), description: t("stayDesc") };
}

export default async function StayPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const rooms = await getRooms();

  return (
    <>
      <section className="section wrap page-top">
        <span className="eyebrow">{t("stay.eyebrow")}</span>
        <h1 className="d1" style={{ marginTop: "1.2rem" }} data-reveal>
          {t("stay.title1")}<br /><em>{t("stay.title2")}</em>
        </h1>
        <p className="lead muted" style={{ margin: "1.6rem 0 2.4rem" }} data-reveal>{t("stay.lead")}</p>
        <Suspense>
          <StayGrid rooms={rooms} />
        </Suspense>
      </section>
      <Marquee items={[t("stay.marquee1"), t("stay.marquee2"), t("stay.marquee3")]} />
    </>
  );
}
