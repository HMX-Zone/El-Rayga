import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CAMP } from "@/lib/rooms";
import ContactForm from "@/components/ContactForm";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("contactTitle"), description: t("contactDesc") };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <>
      <section className="section wrap page-top">
        <span className="eyebrow">{t("contact.eyebrow")} · <span className="ar" lang="ar">اتصل بنا</span></span>
        <h1 className="d1" style={{ marginTop: "1.2rem" }} data-reveal>
          {t("contact.title1")}<br /><em>{t("contact.title2")}</em>
        </h1>
      </section>

      <section className="wrap" style={{ paddingBottom: "3rem" }}>
        <div className="map-band" data-reveal-img>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/scenes/dawn.svg" alt={t("contact.mapAlt")} />
          <span className="map-pin-label">✳ Peace Rd, Masbat — FGX8+7C</span>
        </div>
      </section>

      <section className="section wrap" style={{ paddingTop: "2rem" }}>
        <div className="checkout-grid">
          <div>
            <h2 className="d3" data-reveal>{t("contact.sayHello")}</h2>
            <p className="muted" data-reveal style={{ margin: ".8rem 0 2rem", maxWidth: "52ch" }}>{t("contact.formLead")}</p>
            <ContactForm />
          </div>
          <aside>
            <div className="tick-card" data-reveal>
              <h3 className="d3" style={{ fontSize: "1.25rem" }}>{t("contact.theDesk")}</h3>
              <p style={{ marginTop: ".8rem", lineHeight: 2 }}>
                <b>{CAMP.address}</b><br />
                Plus code <b className="mono-num">{CAMP.plusCode}</b><br /><br />
                <a href={`tel:+${CAMP.phoneRaw}`} style={{ textDecoration: "underline" }}>{CAMP.phone}</a><br />
                <a href={`https://wa.me/${CAMP.phoneRaw}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline" }}>
                  {t("contact.whatsapp24")}
                </a><br /><br />
                {t("contact.checkTimes", { in: CAMP.checkIn, out: CAMP.checkOut })}
              </p>
            </div>
            <div className="tick-card" style={{ marginTop: "1.2rem" }} data-reveal>
              <h3 className="d3" style={{ fontSize: "1.25rem" }}>{t("contact.gettingHere")}</h3>
              <p className="muted" style={{ marginTop: ".8rem" }}>{t("contact.directions")}</p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
