/* ============================================================
   EL RAYGA — BOOKING ENGINE (prototype)
   Real calendar, guest/bed steppers, live pricing, availability
   simulation (deterministic per room+date), localStorage cart,
   checkout + confirmation with booking reference + WhatsApp
   handoff to the camp. Swap `isDateFull` + the confirm step for
   a real API later — the UI won't need to change.
   ============================================================ */
(function () {
  const E = window.ELRAYGA;
  const MS = 86400000;

  /* deterministic pseudo-availability: ~15% of dates "sold out" per room */
  function isDateFull(slug, date) {
    const key = slug + "|" + date.toISOString().slice(0, 10);
    let h = 0;
    for (const c of key) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return (h % 100) < 15;
  }

  function fmtDate(d) {
    return d ? d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "";
  }
  function fmtLong(d) {
    return d ? d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : "";
  }

  E.booking = {
    isDateFull, fmtDate, fmtLong,
    nights: (a, b) => Math.round((b - a) / MS),

    save(order) { localStorage.setItem("elrayga-order", JSON.stringify(order)); },
    load() {
      try { return JSON.parse(localStorage.getItem("elrayga-order")); } catch { return null; }
    },
    saveConfirmed(rec) {
      const all = E.booking.allConfirmed();
      all.push(rec);
      localStorage.setItem("elrayga-bookings", JSON.stringify(all));
    },
    allConfirmed() {
      try { return JSON.parse(localStorage.getItem("elrayga-bookings")) || []; } catch { return []; }
    },
    makeRef() {
      const d = new Date();
      const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
      return `ELR-${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}-${rand}`;
    }
  };

  /* ---------- calendar widget ----------
     mount(el, { slug, onChange(checkIn, checkOut) }) */
  E.booking.mountCalendar = function (pop, opts) {
    let view = new Date(); view.setDate(1);
    let checkIn = null, checkOut = null;
    const today = new Date(); today.setHours(0, 0, 0, 0);

    function render() {
      const y = view.getFullYear(), m = view.getMonth();
      const first = new Date(y, m, 1);
      const startDow = (first.getDay() + 6) % 7; // monday first
      const days = new Date(y, m + 1, 0).getDate();
      let html = `<div class="cal-head">
        <button class="cal-nav" data-nav="-1" aria-label="Previous month">←</button>
        <b>${view.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</b>
        <button class="cal-nav" data-nav="1" aria-label="Next month">→</button>
      </div><div class="cal-grid">`;
      for (const d of ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]) html += `<span class="dow">${d}</span>`;
      for (let i = 0; i < startDow; i++) html += `<span class="cal-day off"></span>`;
      for (let d = 1; d <= days; d++) {
        const date = new Date(y, m, d);
        const cls = ["cal-day"];
        if (date < today) cls.push("past");
        else if (isDateFull(opts.slug, date)) cls.push("full");
        if (checkIn && date.getTime() === checkIn.getTime()) cls.push("sel");
        if (checkOut && date.getTime() === checkOut.getTime()) cls.push("sel");
        if (checkIn && checkOut && date > checkIn && date < checkOut) cls.push("inrange");
        html += `<span class="${cls.join(" ")}" data-t="${date.getTime()}">${d}</span>`;
      }
      html += `</div><div class="cal-legend"><span>—̶ sold out</span><span>tap check-in, then check-out</span></div>`;
      pop.innerHTML = html;
    }

    pop.addEventListener("click", (e) => {
      const nav = e.target.closest("[data-nav]");
      if (nav) { view.setMonth(view.getMonth() + +nav.dataset.nav); render(); return; }
      const day = e.target.closest(".cal-day[data-t]");
      if (!day || day.classList.contains("past") || day.classList.contains("full")) return;
      const date = new Date(+day.dataset.t);
      if (!checkIn || (checkIn && checkOut)) { checkIn = date; checkOut = null; }
      else if (date > checkIn) {
        // reject ranges that cross a sold-out night
        let ok = true;
        for (let t = checkIn.getTime(); t < date.getTime(); t += MS) {
          if (isDateFull(opts.slug, new Date(t))) { ok = false; break; }
        }
        if (!ok) { E.toast("Those dates cross a sold-out night — pick another range."); checkIn = date; checkOut = null; }
        else checkOut = date;
      } else { checkIn = date; checkOut = null; }
      render();
      opts.onChange(checkIn, checkOut);
    });

    render();
    return {
      get: () => ({ checkIn, checkOut }),
      set: (a, b) => { checkIn = a; checkOut = b; render(); }
    };
  };
})();
