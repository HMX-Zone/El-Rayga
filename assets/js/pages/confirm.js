/* Confirmation: pulls the last confirmed booking, shows ref + WhatsApp handoff. */
(function () {
  const E = window.ELRAYGA;
  const B = E.booking;
  const mount = document.getElementById("conf-mount");
  const ref = localStorage.getItem("elrayga-last-ref");
  const rec = B.allConfirmed().find((b) => b.ref === ref);

  if (!rec) {
    mount.innerHTML = `
      <span class="eyebrow">Booking</span>
      <h1 class="d2" style="margin-top:1rem">No recent <em>booking found.</em></h1>
      <p style="margin-top:2rem"><a class="btn coral" href="/stay/" data-transition><span>Browse stays</span><span class="arr">→</span></a></p>`;
    return;
  }

  const ci = new Date(rec.checkIn), co = new Date(rec.checkOut);
  const wa = encodeURIComponent(
    `Hi El Rayga! Booking request ${rec.ref}\n` +
    `${rec.name} — ${rec.guests} ${rec.perBed ? "bed(s)" : "guest(s)"}\n` +
    `${B.fmtLong(ci)} → ${B.fmtLong(co)} (${rec.nights} night${rec.nights > 1 ? "s" : ""})\n` +
    `Total EGP ${E.fmt(rec.total)} — paying ${rec.pay === "arrival" ? "on arrival" : "by transfer"}\n` +
    `Name: ${rec.guest.first} ${rec.guest.last}${rec.guest.notes ? "\nNotes: " + rec.guest.notes : ""}`
  );

  mount.innerHTML = `
    <span class="eyebrow" data-intro>Shukran, ${rec.guest.first} · <span class="ar">شكراً</span></span>
    <h1 class="d1 split-auto" style="margin-top:1.2rem">
      <span data-line>The kettle's</span>
      <span data-line>already <em>on.</em></span>
    </h1>
    <p class="lead muted" data-intro style="margin:1.6rem 0">
      Your request is in. Send it to the desk on WhatsApp to lock it in —
      Dawod (or whoever's on shift) replies fast, day or night.
    </p>
    <p data-intro style="margin-bottom:2.4rem">Booking reference&nbsp; <span class="confetti-num d3">${rec.ref}</span></p>

    <div class="checkout-grid">
      <div class="tick-card" data-reveal>
        <div class="order-card" style="position:static;box-shadow:none;border:0;background:none">
          <div class="row"><span>Stay</span><b>${rec.name}</b></div>
          <div class="row"><span>Check-in</span><b>${B.fmtLong(ci)} · ${E.camp.checkIn}</b></div>
          <div class="row"><span>Check-out</span><b>${B.fmtLong(co)} · by ${E.camp.checkOut}</b></div>
          <div class="row"><span>${rec.perBed ? "Beds" : "Guests"}</span><b>${rec.guests}</b></div>
          <div class="row"><span>Payment</span><b>${rec.pay === "arrival" ? "On arrival" : "Bank transfer"}</b></div>
          <div class="row total"><span>Total</span><b>EGP ${E.fmt(rec.total)}</b></div>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:.9rem;margin-top:1.4rem">
          <a class="btn coral" href="https://wa.me/${E.camp.phoneRaw}?text=${wa}" target="_blank" rel="noopener"><span>Send to camp on WhatsApp</span><span class="arr">→</span></a>
          <button class="btn ghost" id="copy-ref"><span>Copy reference</span></button>
        </div>
      </div>
      <aside>
        <div class="tick-card" data-reveal>
          <h3 class="d3" style="font-size:1.25rem">Before you come</h3>
          <p class="muted" style="margin-top:.8rem;line-height:1.9">
            ${E.camp.address}<br>Plus code <b class="mono-num">${E.camp.plusCode}</b><br>
            Desk: <a href="tel:+${E.camp.phoneRaw}" style="text-decoration:underline">${E.camp.phone}</a><br><br>
            Bring: sunscreen, a book you're willing to trade, and no plans whatsoever.
          </p>
        </div>
        <p style="margin-top:1.4rem"><a href="/" data-transition class="muted" style="text-decoration:underline;font-size:.85rem">← Back to the camp</a></p>
      </aside>
    </div>`;

  document.getElementById("copy-ref").addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(rec.ref); E.toast("Reference copied — see you in Dahab."); }
    catch { E.toast(rec.ref); }
  });
})();
