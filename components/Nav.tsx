"use client";

import { startTransition, useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import LangSwitcher from "./LangSwitcher";
import { CAMP } from "@/lib/rooms";

const LINKS = [
  ["home", "/"],
  ["stay", "/stay"],
  ["experiences", "/experiences"],
  ["reviews", "/reviews"],
  ["about", "/about"],
  ["contact", "/contact"],
] as const;

export default function Nav() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    let last = 0;
    const onScroll = () => {
      const y = scrollY;
      setHidden(y > 500 && y > last && !document.body.classList.contains("menu-open"));
      last = y;
    };
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("menu-open", menu);
    return () => document.body.classList.remove("menu-open");
  }, [menu]);

  // close the overlay on navigation
  useEffect(() => { startTransition(() => setMenu(false)); }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <header className={`nav ${hidden ? "hidden" : ""}`}>
        <div className="nav-bar">
          <Link className="nav-brand" href="/" aria-label="El Rayga Camp — home">
            EL RAYGA <span className="ar">الرايجه</span>
          </Link>
          <nav className="nav-links" aria-label="Primary">
            {LINKS.filter(([k]) => k !== "home").map(([key, href]) => (
              <Link key={key} href={href} className={isActive(href) ? "active" : ""}>
                {t(key)}
              </Link>
            ))}
          </nav>
          <div className="nav-end">
            <LangSwitcher />
            <Link className="btn light sm" href="/stay">
              <span>{t("bookStay")}</span>
            </Link>
            <button
              className="burger-btn"
              aria-label={menu ? t("close") : t("menu")}
              aria-expanded={menu}
              onClick={() => setMenu(!menu)}
            >
              <span className="burger"><i /><i /></span>
            </button>
          </div>
        </div>
      </header>

      <nav className="menu-overlay" aria-hidden={!menu}>
        {LINKS.map(([key, href], i) => (
          <Link
            key={key}
            href={href}
            className="big"
            style={{ transitionDelay: menu ? `${0.2 + i * 0.05}s` : "0s" }}
            onClick={() => setMenu(false)}
          >
            {t(key)}
          </Link>
        ))}
        <div className="meta">
          {CAMP.address}
          <br />
          <a href={`tel:+${CAMP.phoneRaw}`}>{CAMP.phone}</a> ·{" "}
          <a href={`https://wa.me/${CAMP.phoneRaw}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
          <br />
          <span lang={locale}>Google 4.6 ★ · 492</span>
        </div>
      </nav>
    </>
  );
}
