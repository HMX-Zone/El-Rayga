"use client";

import { useEffect, useRef } from "react";
import { PLATFORMS } from "@/lib/rooms";

export default function ScoreBand() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && e.target.classList.add("inview")),
      { threshold: 0.3 }
    );
    ref.current?.querySelectorAll(".score-card").forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, []);

  return (
    <div className="score-band" ref={ref}>
      {PLATFORMS.map((p) => (
        <a
          key={p.id}
          className="score-card"
          href={p.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ "--pct": `${(p.score / p.outOf) * 100}%` } as React.CSSProperties}
        >
          <span className="platform">{p.name}</span>
          <span className="score">
            {p.score}
            <small>{"unit" in p && p.unit ? p.unit : ` / ${p.outOf}`}</small>
          </span>
          <span className="count">{p.count} reviews{"note" in p && p.note ? ` · ${p.note}` : ""}</span>
          <span className="bar"><i /></span>
        </a>
      ))}
    </div>
  );
}
