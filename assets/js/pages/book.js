/* Checkout: order summary from localStorage + guest details form → confirmation. */
(function () {
  const E = window.ELRAYGA;
  const B = E.booking;
  const mount = document.getElementById("book-mount");
  const order = B.load();

  if (!order) {
    mount.innerHTML = `
      <span class="eyebrow">Booking</span>
      <h1 class="d2" style="margin-top:1rem">Nothing in your <em>basket yet.</em></h1>
      <p class="lead muted" style="margin:1.4rem 0 2rem">Pick a hut, room or bed and choose your dates first.</p>
      <a class="btn coral" href="/stay/" data-transition><span>Browse stays</span><span class="arr">→</span></a>`;
    return;
  }

  const room = E.rooms.find((r) => r.slug === order.slug);
  const ci = new Date(order.checkIn), co = new Date(order.checkOut);

  mount.innerHTML = `
    <span class="eyebrow" data-intro>Almost there</span>
    <h1 class="d2 split-auto" style="margin-top:1rem"><span data-line>Complete your <em>booking.</em></span></h1>

    <div class="checkout-grid" style="margin-top:clamp(2rem,4vw,3.5rem)">
      <div>
        <h2 class="d3" style="margin-bottom:1.4rem">Who's coming?</h2>
        <form id="guest-form" class="form-grid" novalidate>
          <div class="field"><label for="g-first">First name *</label><input id="g-first" autocomplete="given-name" required></div>
          <div class="field"><label for="g-last">Last name *</label><input id="g-last" autocomplete="family-name" required></div>
          <div class="field"><label for="g-email">Email *</label><input id="g-email" type="email" autocomplete="email" required></div>
          <div class="field"><label for="g-phone">Phone / WhatsApp *</label><input id="g-phone" type="tel" autocomplete="tel" placeholder="+20 …" required></div>
          <div class="field full"><label for="g-notes">Anything we should know?</label>
            <textarea id="g-notes" rows="3" placeholder="Arrival time, dietary stuff, airport pickup, celebrating something…"></textarea></div>

          <div class="full" style="margin-top:.6rem">
            <h2 class="d3" style="margin-bottom:1rem;font-size:1.3rem">How will you pay?</h2>
            <div style="display:grid;gap:.8rem">
              <label class="pay-opt sel"><input type="radio" name="pay" value="arrival" checked>
                <span><b>Pay on arrival</b><br><small class="muted">Cash (EGP) or card at the desk. Free cancellation up to 48 h before check-in.</small></span></label>
              <label class="pay-opt"><input type="radio" name="pay" value="transfer">
                <span><b>Bank transfer</b><br><small class="muted">We send details on WhatsApp after confirming availability — the Booking.com flow works the same way.</small></span></label>
            </div>
          </div>
          <div class="full">
            <button class="btn coral" type="submit" style="width:100%;justify-content:center"><span>Confirm booking</span><span class="arr">→</span></button>
            <p class="bb-note">Prototype: your booking is stored in this browser and handed to the camp on WhatsApp — no payment happens online.</p>
          </div>
        </form>
      </div>

      <aside class="order-card" data-reveal>
        <div class="oc-media"><img src="${order.photo}" alt="${order.name}"></div>
        <div class="oc-body">
          <h3 class="d3" style="font-size:1.35rem">${order.name}</h3>
          <p class="muted" style="font-size:.85rem;margin:.3rem 0 1rem">${room ? room.tagline : ""}</p>
          <div class="row"><span>Check-in</span><b>${B.fmtLong(ci)} · ${E.camp.checkIn}</b></div>
          <div class="row"><span>Check-out</span><b>${B.fmtLong(co)} · by ${E.camp.checkOut}</b></div>
          <div class="row"><span>${order.perBed ? "Beds" : "Guests"}</span><b>${order.guests}</b></div>
          <div class="row"><span>EGP ${E.fmt(order.rate)} × ${order.nights} night${order.nights > 1 ? "s" : ""}${order.perBed ? ` × ${order.units}` : ""}</span><b>EGP ${E.fmt(order.base)}</b></div>
          <div class="row"><span>Camp & cleaning fee</span><b>EGP ${E.fmt(order.fee)}</b></div>
          <div class="row total"><span>Total</span><b>EGP ${E.fmt(order.total)}</b></div>
          <p style="margin-top:1rem"><a href="/stay/${order.slug}/" data-transition class="muted" style="font-size:.8rem;text-decoration:underline">← Change dates or room</a></p>
        </div>
      </aside>
    </div>`;

  /* pay option toggle */
  mount.querySelectorAll(".pay-opt").forEach((opt) => {
    opt.addEventListener("click", () => {
      mount.querySelectorAll(".pay-opt").forEach((o) => o.classList.remove("sel"));
      opt.classList.add("sel");
      opt.querySelector("input").checked = true;
    });
  });

  document.getElementById("guest-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const get = (id) => document.getElementById(id);
    let ok = true;
    ["g-first", "g-last", "g-email", "g-phone"].forEach((id) => {
      const f = get(id);
      const bad = !f.value.trim() || (id === "g-email" && !/^\S+@\S+\.\S+$/.test(f.value));
      f.closest(".field").classList.toggle("err", bad);
      if (bad) ok = false;
    });
    if (!ok) { E.toast("Fill in the highlighted fields."); return; }

    const rec = {
      ...order,
      ref: B.makeRef(),
      guest: {
        first: get("g-first").value.trim(),
        last: get("g-last").value.trim(),
        email: get("g-email").value.trim(),
        phone: get("g-phone").value.trim(),
        notes: get("g-notes").value.trim()
      },
      pay: document.querySelector("input[name=pay]:checked").value,
      confirmedAt: new Date().toISOString()
    };
    B.saveConfirmed(rec);
    localStorage.setItem("elrayga-last-ref", rec.ref);
    localStorage.removeItem("elrayga-order");
    location.href = "/book/confirmed/";
  });
})();
