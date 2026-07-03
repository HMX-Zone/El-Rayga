"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ARABIC_NAMES, fmtEGP, type RoomSlug } from "@/lib/rooms";
import type { DbRoom } from "@/lib/supabase";

export default function RoomCard({ room, className = "" }: { room: DbRoom; className?: string }) {
  const t = useTranslations();
  const locale = useLocale();
  const slug = room.slug as RoomSlug;

  return (
    <article className={`stay-card ${className}`}>
      <Link className="cover" href={`/stay/${room.slug}`} aria-label={t(`rooms.${slug}.name`)} />
      <div className="card-media" data-reveal-img>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={room.photos[0]} alt={t(`rooms.${slug}.name`)} loading="lazy" />
        <span className="card-kind">{t(`common.kind_${room.kind}`)}</span>
        <span className="card-price">
          {t("common.from")} <b>EGP {fmtEGP(room.base_price, locale)}</b> / {room.per_bed ? t("common.bed") : t("common.night")}
        </span>
      </div>
      <div className="card-body">
        <h3 className="card-title">{t(`rooms.${slug}.name`)}</h3>
        {locale !== "ar" && <span className="card-ar" lang="ar" dir="rtl">{ARABIC_NAMES[slug]}</span>}
      </div>
      <p className="card-meta">{t(`rooms.${slug}.tagline`)}</p>
    </article>
  );
}
