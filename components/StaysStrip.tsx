"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import RoomCard from "./RoomCard";
import type { DbRoom } from "@/lib/supabase";

/* Pinned horizontal scroll strip. Cards inside move by transform only,
   which never retriggers IntersectionObserver — so their media is
   revealed explicitly when the section enters the viewport. */
export default function StaysStrip({ rooms }: { rooms: DbRoom[] }) {
  const section = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sec = section.current, tr = track.current;
    if (!sec || !tr) return;
    gsap.registerPlugin(ScrollTrigger);

    const io = new IntersectionObserver((es) => {
      if (!es.some((e) => e.isIntersecting)) return;
      tr.querySelectorAll(".card-media").forEach((m, i) =>
        setTimeout(() => m.classList.add("revealed"), i * 110)
      );
      io.disconnect();
    }, { threshold: 0.15 });
    io.observe(sec);

    let st: ScrollTrigger | undefined;
    if (innerWidth > 760 && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const amt = () => -(tr.scrollWidth - innerWidth + 60);
      const tween = gsap.to(tr, {
        x: amt, ease: "none",
        scrollTrigger: {
          trigger: sec, start: "top 12%", end: () => "+=" + Math.abs(amt()),
          pin: sec, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1,
        },
      });
      st = tween.scrollTrigger;
    }
    return () => { io.disconnect(); st?.kill(); };
  }, []);

  return (
    <div ref={section}>
      <div className="hstrip">
        <div className="hstrip-track" ref={track} dir="ltr">
          {rooms.map((r) => <RoomCard key={r.slug} room={r} className="hstrip-card" />)}
        </div>
      </div>
    </div>
  );
}
