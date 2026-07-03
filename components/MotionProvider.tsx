"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/* Site-wide motion: Lenis smooth scroll, GSAP ScrollTrigger wiring,
   and the scroll-reveal system ([data-reveal] / [data-reveal-img]).
   A MutationObserver keeps reveals working for client-rendered content. */
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    gsap.registerPlugin(ScrollTrigger);

    let lenis: Lenis | null = null;
    let raf = 0;
    if (!reduce) {
      lenis = new Lenis({ duration: 1.1, smoothWheel: true });
      const loop = (t: number) => { lenis!.raf(t); raf = requestAnimationFrame(loop); };
      raf = requestAnimationFrame(loop);
      lenis.on("scroll", ScrollTrigger.update);
    }

    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("revealed"); io.unobserve(en.target); }
      }),
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    const observeAll = () =>
      document
        .querySelectorAll("[data-reveal]:not(.revealed),[data-reveal-img]:not(.revealed)")
        .forEach((el) => io.observe(el));
    observeAll();
    const mo = new MutationObserver(observeAll);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      lenis?.destroy();
      cancelAnimationFrame(raf);
      io.disconnect();
      mo.disconnect();
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  return <>{children}</>;
}
