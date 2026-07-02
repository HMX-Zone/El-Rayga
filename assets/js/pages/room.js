/* Room booking slug page. Reads window.ROOM_SLUG (baked into each
   /stay/<slug>/index.html), renders gallery + specs + live booking widget. */
(function () {
  const E = window.ELRAYGA;
  const room = E.rooms.find((r) => r.slug === window.ROOM_SLUG);
  const mount = document.getElementById("room-mount");
  if (!room) { mount.innerHTML = `<div class="section wrap"><h1 class="d2">Stay not found.</h1><p style="margin-top:1rem"><a class="btn" href="/stay/" data-transition><span>All stays</span></a></p></div>`; return; }

  document.title = `${room.name} — book direct · El Rayga Camp, Dahab`;

  const kindLabel = room.kind === "dorm" ? "Hostel bed" : room.kind === "room" ? "Private room" : "Hut";

  mount.innerHTML = `
  <section class="section wrap room-hero">
    <div class="room-head">
      <div>
        <span class="eyebrow" data-intro>${kindLabel} · sleeps ${room.sleeps}</span>
        <h1 class="d2 split-auto" style="margin-top:1rem"><span data-line>${room.name}</span></h1>
        <p class="ar muted" data-intro style="font-size:1.3rem;margin-top:.4rem">${room.arabic}</p>
      </div>
      <div style="text-align:right" data-intro>
        <div style="font-family:var(--font-display);font-size:2rem;font-weight:600">EGP ${E.fmt(room.price)}<span style="font-size:.5em;opacity:.6"> / ${room.unit}</span></div>
        <a href="/reviews/" data-transition class="muted" style="font-size:.85rem;text-decoration:underline">4.6 ★ camp rating · 492 Google reviews</a>
      </div>
    </div>

    <div class="room-gallery">
      ${room.photos.map((p, i) => `
        <figure data-lightbox="${p}" data-cursor="Zoom" ${i === 0 ? 'data-reveal-img class="revealed"' : "data-reveal-img"}>
          <img src="${p}" alt="${room.name} — photo ${i + 1}" ${i > 1 ? 'loading="lazy"' : ""}>
          ${i === room.photos.length - 1 ? `<span class="more">${room.photos.length} photos — tap to zoom</span>` : ""}
        </figure>`).join("")}
    </div>

    <div class="room-cols">
      <div>
        <h2 class="d3">${room.tagline}</h2>
        <div class="spec-row">
          <div><b>Sleeps</b>${room.sleeps} ${room.sleeps > 1 ? "guests" : "guest"}</div>
          <div><b>Beds</b>${room.beds}</div>
          <div><b>Bathroom</b>${room.bath}</div>
          <div><b>Size</b>${room.size}</div>
        </div>
        <p class="lead">${room.description}</p>
        <ul class="feat-list">${room.features.map((f) => `<li>${f}</li>`).join("")}</ul>
        <p class="muted" style="margin-top:2rem;font-size:.85rem">
          Free cancellation up to 48 h before check-in on direct bookings ·
          Check-in ${E.camp.checkIn} · Check-out ${E.camp.checkOut}
        </p>
      </div>

      <aside class="bookbox" id="bookbox">
        <div class="bb-price"><b>EGP ${E.fmt(room.price)}</b><span>/ ${room.unit}</span></div>
        <div class="bb-fields">
          <div class="bb-anchor">
            <button class="bb-field" id="f-in" aria-haspopup="dialog"><b>Check-in</b><span id="v-in">Add date</span></button>
          </div>
          <div class="bb-anchor">
            <button class="bb-field" id="f-out" aria-haspopup="dialog"><b>Check-out</b><span id="v-out">Add date</span></button>
          </div>
          <div class="bb-anchor full">
            <button class="bb-field full" id="f-guests"><b>${room.perBed ? "Beds" : "Guests"}</b><span id="v-guests">1 ${room.perBed ? "bed" : "guest"}</span></button>
            <div class="cal-pop guest-pop" id="guest-pop">
              <div class="guest-row">
                <div>${room.perBed ? "Beds" : "Guests"}<br><small class="muted">${room.perBed ? `${room.sleeps} in this dorm` : `max ${room.sleeps}`}</small></div>
                <div class="stepper">
                  <button id="g-minus" aria-label="Fewer">−</button>
                  <b id="g-count" class="mono-num">1</b>
                  <button id="g-plus" aria-label="More">+</button>
                </div>
              </div>
            </div>
          </div>
          <div class="bb-anchor full">
            <div class="cal-pop" id="cal-pop"></div>
          </div>
        </div>
        <div class="bb-summary" id="bb-summary"></div>
        <div class="bb-error" id="bb-error"></div>
        <button class="btn coral" id="bb-reserve"><span>Reserve</span><span class="arr">→</span></button>
        <p class="bb-note">No charge yet — we confirm on WhatsApp, pay on arrival or by transfer.</p>
      </aside>
    </div>
  </section>

  <section class="section theme-dark">
    <div class="wrap section-head">
      <div><span class="eyebrow">Keep looking</span><h2 class="d2" style="margin-top:1rem">Other ways to <em>stay.</em></h2></div>
      <a class="btn light" href="/stay/" data-transition><span>All stays</span><span class="arr">→</span></a>
    </div>
    <div class="wrap stay-grid" id="others"></div>
  </section>`;

  /* others strip: 3 different rooms */
  const others = E.rooms.filter((r) => r.slug !== room.slug).slice(0, 3);
  document.getElementById("others").innerHTML = others.map((r) => `
    <article class="stay-card" data-cursor="View">
      <a href="/stay/${r.slug}/" data-transition aria-label="${r.name}"></a>
      <div class="card-media"><img src="${r.photos[0]}" alt="${r.name}" loading="lazy">
        <span class="card-price">from <b>EGP ${E.fmt(r.price)}</b></span></div>
      <div class="card-body"><h3 class="card-title">${r.name}</h3><span class="card-ar ar">${r.arabic}</span></div>
    </article>`).join("");

  /* ---------------- booking widget wiring ---------------- */
  const B = E.booking;
  let guests = 1;
  const maxG = room.perBed ? room.sleeps : room.sleeps;

  const calPop = document.getElementById("cal-pop");
  const guestPop = document.getElementById("guest-pop");
  const vIn = document.getElementById("v-in"), vOut = document.getElementById("v-out");
  const summary = document.getElementById("bb-summary");
  const errEl = document.getElementById("bb-error");

  let state = { checkIn: null, checkOut: null };
  const cal = B.mountCalendar(calPop, {
    slug: room.slug,
    onChange(a, b) {
      state = { checkIn: a, checkOut: b };
      vIn.textContent = a ? B.fmtDate(a) : "Add date";
      vOut.textContent = b ? B.fmtDate(b) : "Add date";
      updateSummary();
      if (a && b) closePops();
    }
  });

  function closePops() {
    calPop.classList.remove("open");
    guestPop.classList.remove("open");
    document.querySelectorAll(".bb-field").forEach((f) => f.classList.remove("open"));
  }
  function toggle(pop, btn) {
    const was = pop.classList.contains("open");
    closePops();
    if (!was) { pop.classList.add("open"); btn.classList.add("open"); }
  }
  document.getElementById("f-in").addEventListener("click", (e) => { e.stopPropagation(); toggle(calPop, e.currentTarget); });
  document.getElementById("f-out").addEventListener("click", (e) => { e.stopPropagation(); toggle(calPop, e.currentTarget); });
  document.getElementById("f-guests").addEventListener("click", (e) => { e.stopPropagation(); toggle(guestPop, e.currentTarget); });
  document.addEventListener("click", (e) => { if (!e.target.closest(".bookbox")) closePops(); });
  calPop.addEventListener("click", (e) => e.stopPropagation());
  guestPop.addEventListener("click", (e) => e.stopPropagation());

  const gCount = document.getElementById("g-count");
  const gMinus = document.getElementById("g-minus");
  const gPlus = document.getElementById("g-plus");
  function setGuests(n) {
    guests = Math.min(Math.max(1, n), maxG);
    gCount.textContent = guests;
    document.getElementById("v-guests").textContent = `${guests} ${room.perBed ? (guests > 1 ? "beds" : "bed") : (guests > 1 ? "guests" : "guest")}`;
    gMinus.disabled = guests <= 1;
    gPlus.disabled = guests >= maxG;
    updateSummary();
  }
  gMinus.addEventListener("click", () => setGuests(guests - 1));
  gPlus.addEventListener("click", () => setGuests(guests + 1));
  setGuests(1);

  function price() {
    if (!state.checkIn || !state.checkOut) return null;
    const nights = B.nights(state.checkIn, state.checkOut);
    const units = room.perBed ? guests : 1;
    const base = room.price * nights * units;
    const fee = Math.round(base * 0.05);
    return { nights, units, base, fee, total: base + fee };
  }

  function updateSummary() {
    errEl.style.display = "none";
    const p = price();
    if (!p) { summary.classList.remove("visible"); return; }
    summary.classList.add("visible");
    summary.innerHTML = `
      <div class="row"><span>EGP ${E.fmt(room.price)} × ${p.nights} night${p.nights > 1 ? "s" : ""}${room.perBed ? ` × ${p.units} bed${p.units > 1 ? "s" : ""}` : ""}</span><b>EGP ${E.fmt(p.base)}</b></div>
      <div class="row"><span>Camp & cleaning fee</span><b>EGP ${E.fmt(p.fee)}</b></div>
      <div class="row total"><span>Total</span><b>EGP ${E.fmt(p.total)}</b></div>`;
  }

  document.getElementById("bb-reserve").addEventListener("click", () => {
    const p = price();
    if (!p) {
      errEl.textContent = "Pick your check-in and check-out dates first.";
      errEl.style.display = "block";
      toggle(calPop, document.getElementById("f-in"));
      return;
    }
    B.save({
      slug: room.slug, name: room.name, photo: room.photos[0],
      unitLabel: room.perBed ? "bed" : room.kind,
      checkIn: state.checkIn.toISOString(), checkOut: state.checkOut.toISOString(),
      guests, ...p, rate: room.price, perBed: room.perBed
    });
    location.href = "/book/";
  });
})();
