"use client";

import { useEffect, useRef } from "react";

export default function Marquee({
  items, speed = 0.6, className = "",
}: { items: React.ReactNode[]; speed?: number; className?: string }) {
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = track.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let x = 0, raf = 0;
    const step = () => {
      x -= speed;
      const half = el.scrollWidth / 2;
      if (-x >= half) x += half;
      el.style.transform = `translateX(${x}px)`;
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [speed]);

  return (
    <div className={`marquee ${className}`} dir="ltr">
      <div className="marquee-track" ref={track}>
        {[...items, ...items].map((item, i) => <span key={i}>{item}</span>)}
      </div>
    </div>
  );
}
