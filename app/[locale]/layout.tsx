import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { dirFor, LOCALE_CODES } from "@/lib/locales";
import MotionProvider from "@/components/MotionProvider";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import "../globals.css";

export function generateStaticParams() {
  return LOCALE_CODES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: { default: t("homeTitle"), template: `%s · El Rayga Camp` },
    description: t("homeDesc"),
    icons: {
      icon: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%230c1a1c'/%3E%3Ctext x='16' y='23' text-anchor='middle' font-size='18' fill='%23e8542f'%3E✳%3C/text%3E%3C/svg%3E`,
    },
    alternates: {
      languages: Object.fromEntries(LOCALE_CODES.map((l) => [l, `/${l}`])),
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale} dir={dirFor(locale)}>
      <body className="grain">
        <NextIntlClientProvider>
          <MotionProvider>
            <Nav />
            <main>{children}</main>
            <Footer />
          </MotionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
