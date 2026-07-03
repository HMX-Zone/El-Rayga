"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";

const EXPS = ["dive", "freedive", "snorkel", "yoga", "safari", "fire"] as const;

export default function ExpRows({ limit }: { limit?: number }) {
  const t = useTranslations("experiences");
  const thumb = useRef<HTMLDivElement>(null);
  const [cur, setCur] = useState<string | null>(null);
  const items = limit ? EXPS.slice(0, limit) : [...EXPS];

  return (
    <div
      className="exp-list"
      onMouseMove={(e) => {
        if (!thumb.current) return;
        thumb.current.style.left = e.clientX + 26 + "px";
        thumb.current.style.top = e.clientY - 110 + "px";
      }}
      onMouseLeave={() => setCur(null)}
    >
      {items.map((k, i) => (
        <div className="exp-row" key={k} onMouseEnter={() => setCur(k)}>
          <span className="num">0{i + 1}</span>
          <h3>{t(`items.${k}.title`)}</h3>
          <p>{t(`items.${k}.desc`)}</p>
          <span className="price">{t(`items.${k}.price`)}</span>
        </div>
      ))}
      <div className={`exp-thumb ${cur ? "on" : ""}`} ref={thumb} aria-hidden>
        {EXPS.map((k) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={k} src={`/images/exp/${k}.svg`} alt="" className={cur === k ? "cur" : ""} />
        ))}
      </div>
    </div>
  );
}
