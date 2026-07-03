"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { DbReview } from "@/lib/supabase";

const NAMES: Record<string, string> = {
  google: "Google Maps", booking: "Booking.com", tripadvisor: "Tripadvisor", facebook: "Facebook",
};
const norm = (r: DbReview) => (r.platform === "booking" ? r.rating / 2 : r.rating);

export default function ReviewWall({ reviews }: { reviews: DbReview[] }) {
  const t = useTranslations("reviews");
  const [filter, setFilter] = useState("all");

  const list = reviews.filter((r) =>
    filter === "all" ? true : filter === "critical" ? norm(r) <= 2.5 : r.platform === filter
  );

  const filters = ["all", "google", "booking", "tripadvisor", "facebook", "critical"];

  return (
    <>
      <div className="section-head">
        <div className="filters" id="rev-filters">
          {filters.map((f) => (
            <button key={f} className={filter === f ? "active" : ""} data-p={f} onClick={() => setFilter(f)}>
              {f === "all" ? t("allPlatforms") : f === "critical" ? t("roughOnes") : NAMES[f]}
            </button>
          ))}
        </div>
        <a className="btn ghost" href="https://maps.google.com/?q=Elrayga+Camp+Dahab" target="_blank" rel="noopener noreferrer">
          <span>{t("writeOne")} ↗</span>
        </a>
      </div>
      <div className="review-wall">
        {list.map((r, i) => {
          const v = Math.round(norm(r));
          return (
            <article className={`review-card ${v <= 2 ? "negative" : ""}`} key={i} data-reveal>
              <div className="rc-head">
                <span className={`rc-platform ${r.platform}`}>{NAMES[r.platform]}</span>
                <span className={`stars ${v <= 2 ? "low" : ""}`}>
                  {"★".repeat(v)}<span style={{ opacity: 0.25 }}>{"★".repeat(Math.max(0, 5 - v))}</span>
                </span>
              </div>
              <p>“{r.body}”</p>
              {r.original && <p className="original" lang={r.lang ?? undefined}>{r.original}</p>}
              <div className="rc-foot">
                <span>{r.author}</span>
                <span>{r.said_when}{r.verbatim ? "" : ` · ${t("themeSummary")}`}</span>
              </div>
            </article>
          );
        })}
      </div>
      <p className="muted" style={{ marginTop: "2rem", fontSize: ".8rem", maxWidth: "62ch" }}>{t("note")}</p>
    </>
  );
}
