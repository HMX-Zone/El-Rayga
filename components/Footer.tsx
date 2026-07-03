"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CAMP } from "@/lib/rooms";

export default function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="site-footer">
      <div className="footer-cta">
        <span className="ar">تعالى عيش الرايجه</span>
        <p className="lead" style={{ marginInline: "auto", opacity: 0.8 }}>{t("cta")}</p>
        <p style={{ marginTop: "1.8rem" }}>
          <Link className="btn coral" href="/stay">
            <span>{t("checkAvailability")}</span><span className="arr">→</span>
          </Link>
        </p>
      </div>
      <div className="footer-big" aria-hidden>EL RAYGA CAMP</div>
      <div className="footer-grid">
        <div>
          <h4>{t("findUs")}</h4>
          {CAMP.address}<br />
          Plus code {CAMP.plusCode}<br />
          <a href={`tel:+${CAMP.phoneRaw}`}>{CAMP.phone}</a>
          <a href={`https://wa.me/${CAMP.phoneRaw}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
        </div>
        <div>
          <h4>{t("sleep")}</h4>
          <Link href="/stay?kind=hut">{t("huts")}</Link>
          <Link href="/stay?kind=room">{t("privateRooms")}</Link>
          <Link href="/stay?kind=dorm">{t("hostelBeds")}</Link>
        </div>
        <div>
          <h4>{t("camp")}</h4>
          <Link href="/experiences">{t("experiences")}</Link>
          <Link href="/about">{t("about")}</Link>
          <Link href="/reviews">{t("reviews")}</Link>
          <Link href="/contact">{t("contact")}</Link>
        </div>
        <div>
          <h4>{t("elsewhere")}</h4>
          <a href="https://www.booking.com/hotel/eg/elrayga-camp.html" target="_blank" rel="noopener noreferrer">Booking.com ↗</a>
          <a href="https://www.tripadvisor.com/Hotel_Review-g297547-d17588873" target="_blank" rel="noopener noreferrer">Tripadvisor ↗</a>
          <a href="https://www.facebook.com/elraygacamp/" target="_blank" rel="noopener noreferrer">Facebook ↗</a>
          <a href="https://maps.google.com/?q=Elrayga+Camp+Dahab" target="_blank" rel="noopener noreferrer">Google Maps ↗</a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} El Rayga Camp, Dahab</span>
        <span>{t("times", { in: CAMP.checkIn, out: CAMP.checkOut })}</span>
      </div>
    </footer>
  );
}
