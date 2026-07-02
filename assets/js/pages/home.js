/* Home page: horizontal stays strip (pinned scrub), experience rows w/ floating thumb,
   review scores + ticker. */
(function () {
  const E = window.ELRAYGA;

  /* ---- stays strip ---- */
  const track = document.getElementById("hstrip-track");
  const card = (r) => `
    <article class="stay-card hstrip-card" data-cursor="View">
      <a href="/stay/${r.slug}/" data-transition aria-label="${r.name}"></a>
      <div class="card-media">
        <img src="${r.photos[0]}" alt="${r.name} at El Rayga Camp">
        <span class="card-kind">${r.kind === "dorm" ? "Hostel bed" : r.kind}</span>
        <span class="card-price">from <b>EGP ${E.fmt(r.price)}</b> / ${r.perBed ? "bed" : "night"}</span>
      </div>
      <div class="card-body">
        <h3 class="card-title">${r.name}</h3>
        <span class="card-ar ar">${r.arabic}</span>
      </div>
      <p class="card-meta">${r.tagline}</p>
    </article>`;
  track.innerHTML = E.rooms.map(card).join("");

  /* cards inside the pinned strip move by transform only, which doesn't
     retrigger IntersectionObserver — reveal them when the section shows up */
  track.querySelectorAll(".card-media").forEach((m) => m.setAttribute("data-reveal-img", ""));
  const stripIO = new IntersectionObserver((es) => {
    if (!es.some((e) => e.isIntersecting)) return;
    track.querySelectorAll(".card-media").forEach((m, i) => setTimeout(() => m.classList.add("revealed"), i * 120));
    stripIO.disconnect();
  }, { threshold: 0.15 });
  stripIO.observe(document.getElementById("stays"));

  if (window.gsap && window.ScrollTrigger && innerWidth > 760) {
    const strip = document.querySelector(".hstrip");
    const amt = () => -(track.scrollWidth - innerWidth + 60);
    gsap.to(track, {
      x: amt, ease: "none",
      scrollTrigger: {
        trigger: strip, start: "top 12%", end: () => "+=" + Math.abs(amt()),
        pin: "#stays", scrub: 1, invalidateOnRefresh: true, anticipatePin: 1
      }
    });
  }

  /* ---- experiences teaser ---- */
  const exps = [
    ["dive", "Dive the reef", "House reef, Lighthouse & the Blue Hole with licensed centres next door."],
    ["yoga", "Sunrise yoga", "On the sun terrace, before the heat — mats and silence provided."],
    ["fire", "Fire & film nights", "Bedouin tea, a screen under the stars, and whoever shows up."],
    ["safari", "Desert by camel", "Laguna rides at sunset, Wadi Gnai by jeep, stars you can read by."]
  ];
  const list = document.getElementById("home-exp");
  list.innerHTML = exps.map(([k, t, d], i) => `
    <a class="exp-row" href="/experiences/" data-transition data-thumb="/assets/img/exp/${k}.svg">
      <span class="num">0${i + 1}</span><h3>${t}</h3><p>${d}</p><span class="arr">→</span>
    </a>`).join("");
  const thumb = document.createElement("div");
  thumb.className = "exp-thumb";
  document.body.appendChild(thumb);
  const imgs = {};
  exps.forEach(([k]) => {
    const im = new Image(); im.src = `/assets/img/exp/${k}.svg`; imgs[k] = im; thumb.appendChild(im);
  });
  list.addEventListener("mousemove", (e) => {
    thumb.style.left = e.clientX + 26 + "px";
    thumb.style.top = e.clientY - 120 + "px";
  });
  list.addEventListener("mouseover", (e) => {
    const row = e.target.closest(".exp-row");
    if (!row) return;
    thumb.classList.add("on");
    const key = row.dataset.thumb;
    [...thumb.children].forEach((im) => im.classList.toggle("cur", im.src.endsWith(key.split("/").pop())));
  });
  list.addEventListener("mouseleave", () => thumb.classList.remove("on"));

  /* ---- review scores + ticker ---- */
  const scores = document.getElementById("home-scores");
  scores.innerHTML = E.platforms.map((p) => `
    <a class="score-card" href="${p.url}" target="_blank" rel="noopener" style="--pct:${(p.score / p.outOf) * 100}%">
      <span class="platform">${p.name}</span>
      <span class="score">${p.score}<small>/ ${p.outOf}${p.unit ? "" : ""}</small></span>
      <span class="count">${p.count} reviews${p.note ? " · " + p.note : ""}</span>
      <span class="bar"><i></i></span>
    </a>`).join("");
  const io = new IntersectionObserver((es) => es.forEach((x) => x.isIntersecting && x.target.classList.add("inview")), { threshold: 0.4 });
  scores.querySelectorAll(".score-card").forEach((c) => io.observe(c));

  const picks = E.reviews.filter((r) => r.rating >= 4).slice(0, 3);
  document.getElementById("home-ticker").innerHTML = picks.map((r) => `
    <div class="tick-card" data-reveal>
      <p style="font-family:var(--font-display);font-size:1.15rem;font-style:italic">“${r.text}”</p>
      <p class="muted" style="margin-top:.8rem;font-size:.82rem">— ${r.author}, ${r.platform === "google" ? "Google Maps" : r.platform === "booking" ? "Booking.com" : r.platform === "tripadvisor" ? "Tripadvisor" : "Facebook"}</p>
    </div>`).join("");
})();
