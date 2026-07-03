"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LOCALES } from "@/lib/locales";

export default function LangSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const current = LOCALES.find((l) => l.code === locale);

  return (
    <div className="lang" ref={ref}>
      <button
        className="lang-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
        </svg>
        {current?.name}
        <span aria-hidden style={{ fontSize: "0.6em", opacity: 0.6 }}>▾</span>
      </button>
      <div className={`lang-menu ${open ? "open" : ""}`} role="listbox">
        {LOCALES.map((l) => (
          <Link
            key={l.code}
            href={pathname}
            locale={l.code}
            className={l.code === locale ? "cur" : ""}
            onClick={() => setOpen(false)}
          >
            {l.name} <small>{l.code}</small>
          </Link>
        ))}
      </div>
    </div>
  );
}
