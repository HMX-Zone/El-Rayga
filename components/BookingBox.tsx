"use client";

import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { fmtEGP } from "@/lib/rooms";
import type { DbRoom } from "@/lib/supabase";

const MS = 86400000;
const iso = (d: Date) => {
  const z = new Date(d);
  z.setMinutes(z.getMinutes() - z.getTimezoneOffset());
  return z.toISOString().slice(0, 10);
};

export default function BookingBox({ room }: { room: DbRoom }) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();

  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);
  const [view, setView] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [units, setUnits] = useState(1);
  const [guests, setGuests] = useState(1);
  const [pop, setPop] = useState<"cal" | "guests" | null>(null);
  const [error, setError] = useState("");
  const [free, setFree] = useState<Record<string, number>>({});
  const [loadingCal, setLoadingCal] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  /* real availability from the DB, one month at a time */
  const loadMonth = useCallback(async (d: Date) => {
    const from = iso(new Date(d.getFullYear(), d.getMonth(), 1));
    const to = iso(new Date(d.getFullYear(), d.getMonth() + 1, 1));
    setLoadingCal(true);
    try {
      const res = await fetch(`/api/availability?slug=${room.slug}&from=${from}&to=${to}`);
      const rows: { day: string; free: number }[] = await res.json();
      setFree((f) => {
        const next = { ...f };
        for (const r of rows) next[r.day] = r.free;
        return next;
      });
    } catch { /* leave days unknown → treated as available, server re-validates */ }
    setLoadingCal(false);
  }, [room.slug]);

  useEffect(() => { startTransition(() => { loadMonth(view); }); }, [view, loadMonth]);

  useEffect(() => {
    const close = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setPop(null); };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const freeOn = (d: Date) => free[iso(d)] ?? room.units;
  const dayFull = (d: Date) => freeOn(d) < units;

  function pick(date: Date) {
    setError("");
    if (!checkIn || (checkIn && checkOut)) { setCheckIn(date); setCheckOut(null); return; }
    if (date <= checkIn) { setCheckIn(date); setCheckOut(null); return; }
    for (let ts = checkIn.getTime(); ts < date.getTime(); ts += MS) {
      if (dayFull(new Date(ts))) {
        setError(t("room.rangeCrossesFull"));
        setCheckIn(date); setCheckOut(null);
        return;
      }
    }
    setCheckOut(date);
    setPop(null);
  }

  const nights = checkIn && checkOut ? Math.round((+checkOut - +checkIn) / MS) : 0;
  const base = nights * room.base_price * (room.per_bed ? units : 1);
  const fee = Math.round(base * 0.05);

  const fmtD = (d: Date | null) =>
    d ? d.toLocaleDateString(locale, { day: "numeric", month: "short" }) : t("room.addDate");

  function reserve() {
    if (!checkIn || !checkOut) {
      setError(t("room.pickDatesFirst"));
      setPop("cal");
      return;
    }
    const q = new URLSearchParams({
      slug: room.slug, in: iso(checkIn), out: iso(checkOut),
      units: String(room.per_bed ? units : 1), guests: String(guests),
    });
    router.push(`/book?${q}`);
  }

  /* calendar grid for the viewed month */
  const y = view.getFullYear(), m = view.getMonth();
  const firstDow = (new Date(y, m, 1).getDay() + 6) % 7;
  const daysIn = new Date(y, m + 1, 0).getDate();
  const dows = [1, 2, 3, 4, 5, 6, 0].map((d) =>
    new Date(2024, 0, d + 1).toLocaleDateString(locale, { weekday: "narrow" })
  );
  const maxUnits = room.per_bed ? room.units : room.sleeps;

  return (
    <aside className="bookbox" ref={box}>
      <div className="bb-price">
        <b>EGP {fmtEGP(room.base_price, locale)}</b>
        <span>/ {room.per_bed ? t("common.bed") : t("common.night")}</span>
      </div>
      <div className="bb-fields">
        <div className="bb-anchor">
          <button className={`bb-field ${pop === "cal" ? "open" : ""}`} onClick={() => setPop(pop === "cal" ? null : "cal")} id="f-in">
            <b>{t("room.checkIn")}</b><span id="v-in">{fmtD(checkIn)}</span>
          </button>
        </div>
        <div className="bb-anchor">
          <button className={`bb-field ${pop === "cal" ? "open" : ""}`} onClick={() => setPop(pop === "cal" ? null : "cal")} id="f-out">
            <b>{t("room.checkOut")}</b><span id="v-out">{fmtD(checkOut)}</span>
          </button>
        </div>
        <div className="bb-anchor full">
          <button className={`bb-field full ${pop === "guests" ? "open" : ""}`} onClick={() => setPop(pop === "guests" ? null : "guests")} id="f-guests">
            <b>{room.per_bed ? t("common.beds") : t("common.guests")}</b>
            <span>{room.per_bed ? units : guests}</span>
          </button>
          {pop === "guests" && (
            <div className="cal-pop guest-pop">
              <div className="guest-row">
                <div>
                  {room.per_bed ? t("common.beds") : t("common.guests")}<br />
                  <small className="muted">{t("room.max", { n: maxUnits })}</small>
                </div>
                <div className="stepper">
                  <button
                    aria-label="−"
                    disabled={(room.per_bed ? units : guests) <= 1}
                    onClick={() => room.per_bed ? setUnits(units - 1) : setGuests(guests - 1)}
                  >−</button>
                  <b className="mono-num" id="g-count">{room.per_bed ? units : guests}</b>
                  <button
                    aria-label="+"
                    id="g-plus"
                    disabled={(room.per_bed ? units : guests) >= maxUnits}
                    onClick={() => room.per_bed ? setUnits(units + 1) : setGuests(guests + 1)}
                  >+</button>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="bb-anchor full">
          {pop === "cal" && (
            <div className="cal-pop" id="cal-pop">
              <div className="cal-head">
                <button className="cal-nav" data-nav="-1" aria-label="prev"
                  disabled={view <= new Date(today.getFullYear(), today.getMonth(), 1)}
                  onClick={() => setView(new Date(y, m - 1, 1))}>←</button>
                <b>{view.toLocaleDateString(locale, { month: "long", year: "numeric" })}</b>
                <button className="cal-nav" data-nav="1" aria-label="next" onClick={() => setView(new Date(y, m + 1, 1))}>→</button>
              </div>
              <div className="cal-grid">
                {dows.map((d, i) => <span className="dow" key={i}>{d}</span>)}
                {Array.from({ length: firstDow }).map((_, i) => <span key={`o${i}`} />)}
                {Array.from({ length: daysIn }).map((_, i) => {
                  const date = new Date(y, m, i + 1);
                  const past = date < today;
                  const isFull = !past && dayFull(date);
                  const sel = (checkIn && +date === +checkIn) || (checkOut && +date === +checkOut);
                  const inRange = checkIn && checkOut && date > checkIn && date < checkOut;
                  return (
                    <button
                      key={i}
                      className={`cal-day ${isFull ? "full" : ""} ${sel ? "sel" : ""} ${inRange ? "inrange" : ""}`}
                      disabled={past || isFull}
                      data-t={date.getTime()}
                      onClick={() => pick(date)}
                    >{i + 1}</button>
                  );
                })}
              </div>
              <div className="cal-legend">
                <span>— {t("room.soldOut")}</span>
                {loadingCal && <span>{t("common.loading")}</span>}
              </div>
            </div>
          )}
        </div>
      </div>

      {nights > 0 && (
        <div className="bb-summary" id="bb-summary">
          <div className="row">
            <span>
              EGP {fmtEGP(room.base_price, locale)} × {nights} {t("common.nights")}
              {room.per_bed && units > 1 ? ` × ${units}` : ""}
            </span>
            <b>EGP {fmtEGP(base, locale)}</b>
          </div>
          <div className="row"><span>{t("room.campFee")}</span><b>EGP {fmtEGP(fee, locale)}</b></div>
          <div className="row total"><span>{t("common.total")}</span><b>EGP {fmtEGP(base + fee, locale)}</b></div>
        </div>
      )}
      {error && <div className="bb-error" role="alert">{error}</div>}
      <button className="btn coral" id="bb-reserve" onClick={reserve}>
        <span>{t("room.reserve")}</span><span className="arr">→</span>
      </button>
      <p className="bb-note">{t("room.noChargeNote")}</p>
    </aside>
  );
}
