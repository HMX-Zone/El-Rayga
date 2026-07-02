/* ============================================================
   EL RAYGA — SHARED SHELL + MOTION ENGINE
   Lenis smooth scroll · GSAP ScrollTrigger reveals · menu
   overlay · page-transition curtain · custom cursor · marquee
   ============================================================ */
(function () {
  const C = window.ELRAYGA.camp;
  const page = document.body.dataset.page || "";

  /* ---------------- shared header / menu / footer ---------------- */
  const NAV = [
    ["Home", "/", "01"],
    ["Stay & Book", "/stay/", "02"],
    ["Experiences", "/experiences/", "03"],
    ["Reviews", "/reviews/", "04"],
    ["About the Camp", "/about/", "05"],
    ["Contact & Find Us", "/contact/", "06"]
  ];

  document.body.insertAdjacentHTML(
    "afterbegin",
    `
  <div class="preloader" aria-hidden="true">
    <div class="pl-inner">
      <div class="pl-ar">كامب الرايجه</div>
      <div class="pl-en">El Rayga · Dahab</div>
      <div class="pl-count">00</div>
    </div>
  </div>
  <div class="curtain" aria-hidden="true"><span class="ar">الرايجه</span></div>
  <header class="site-header">
    <a class="brand" href="/" data-transition>
      <span class="brand-mark">EL RAYGA</span>
      <span class="brand-ar">الرايجه</span>
    </a>
    <div class="header-cta">
      <a class="btn light" href="/stay/" data-transition id="hdr-book" style="${page === "stay" || page === "room" || page === "book" ? "display:none" : ""}"><span>Book a stay</span><span class="arr">→</span></a>
      <button class="menu-btn" aria-label="Menu" aria-expanded="false">
        <span class="menu-word">Menu</span>
        <span class="burger"><i></i><i></i></span>
      </button>
    </div>
  </header>
  <nav class="menu-overlay" aria-hidden="true">
    <div class="menu-links">
      ${NAV.map(([label, href, idx]) => `<a href="${href}" data-transition><span class="idx">${idx}</span>${label}</a>`).join("")}
    </div>
    <aside class="menu-side">
      <div class="art"><img src="/assets/img/scenes/camp-night.svg" alt="El Rayga camp courtyard at night"></div>
      <div class="menu-meta">
        ${C.address}<br>
        <a href="tel:+${C.phoneRaw}">${C.phone}</a><br>
        Check-in ${C.checkIn} · Check-out ${C.checkOut}<br>
        <span style="color:var(--gold)">Google 4.6 ★ · 492 reviews</span>
      </div>
    </aside>
  </nav>
  <div class="cursor"><div class="dot"></div><div class="label"></div></div>
  <div class="lightbox" role="dialog" aria-label="Image viewer"><img alt=""></div>
  <div class="toast" role="status"></div>`
  );

  document.body.insertAdjacentHTML(
    "beforeend",
    `
  <footer class="site-footer">
    <div class="footer-cta">
      <span class="ar">تعالى عيش الرايجه</span>
      <p class="lead" style="margin-inline:auto;opacity:.8">Come live the Rayga. Beds from EGP 350 a night, two minutes from the lagoon.</p>
      <p style="margin-top:2rem"><a class="btn coral" href="/stay/" data-transition><span>Check availability</span><span class="arr">→</span></a></p>
    </div>
    <div class="footer-big" aria-hidden="true"><span>EL RAYGA CAMP</span></div>
    <div class="footer-grid">
      <div>
        <h4>Find us</h4>
        ${C.address}<br>Plus code ${C.plusCode}<br>
        <a href="tel:+${C.phoneRaw}">${C.phone}</a>
        <a href="https://wa.me/${C.phoneRaw}" target="_blank" rel="noopener">WhatsApp us</a>
      </div>
      <div>
        <h4>Sleep</h4>
        <a href="/stay/?kind=hut" data-transition>Huts</a>
        <a href="/stay/?kind=room" data-transition>Private rooms</a>
        <a href="/stay/?kind=dorm" data-transition>Hostel beds</a>
      </div>
      <div>
        <h4>Camp</h4>
        <a href="/experiences/" data-transition>Experiences</a>
        <a href="/about/" data-transition>About</a>
        <a href="/reviews/" data-transition>Reviews</a>
        <a href="/contact/" data-transition>Contact</a>
      </div>
      <div>
        <h4>Elsewhere</h4>
        <a href="https://www.booking.com/hotel/eg/elrayga-camp.html" target="_blank" rel="noopener">Booking.com ↗</a>
        <a href="https://www.tripadvisor.com/Hotel_Review-g297547-d17588873" target="_blank" rel="noopener">Tripadvisor ↗</a>
        <a href="https://www.facebook.com/elraygacamp/" target="_blank" rel="noopener">Facebook ↗</a>
        <a href="https://maps.google.com/?q=Elrayga+Camp+Dahab" target="_blank" rel="noopener">Google Maps ↗</a>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© ${new Date().getFullYear()} El Rayga Camp, Dahab — prototype site</span>
      <span>Check-in ${C.checkIn} · Check-out ${C.checkOut} · Free Wi-Fi everywhere</span>
    </div>
  </footer>`
  );

  /* ---------------- smooth scroll ---------------- */
  let lenis = null;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (window.Lenis && !reduceMotion) {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
  }
  window.__lenis = lenis;

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    if (lenis) lenis.on("scroll", ScrollTrigger.update);
  }

  /* ---------------- preloader ---------------- */
  const pre = document.querySelector(".preloader");
  const count = pre.querySelector(".pl-count");
  const alreadySeen = sessionStorage.getItem("elrayga-seen");
  function killPreloader(fast) {
    if (!window.gsap || fast) { pre.remove(); startIntro(); return; }
    gsap.timeline()
      .to(count, { innerText: 100, duration: 0.9, snap: "innerText", ease: "power2.inOut" })
      .to(pre.querySelector(".pl-inner"), { yPercent: -30, opacity: 0, duration: 0.5, ease: "power2.in" })
      .to(pre, { clipPath: "inset(0 0 100% 0)", duration: 0.85, ease: "expo.inOut" }, "-=0.15")
      .add(() => { pre.remove(); sessionStorage.setItem("elrayga-seen", "1"); startIntro(); });
  }
  if (alreadySeen || reduceMotion) { pre.remove(); requestAnimationFrame(startIntro); }
  else { pre.style.clipPath = "inset(0 0 0% 0)"; setTimeout(() => killPreloader(false), 250); }

  function startIntro() {
    document.body.classList.add("ready");
    // split-line hero reveals
    document.querySelectorAll(".split-lines").forEach((el, i) => {
      const spans = el.querySelectorAll(".line > span");
      if (window.gsap) {
        gsap.to(spans, { y: 0, duration: 1.15, ease: "expo.out", stagger: 0.09, delay: 0.1 + i * 0.1 });
      } else spans.forEach(s => (s.style.transform = "none"));
    });
    document.querySelectorAll("[data-intro]").forEach((el, i) => {
      if (window.gsap) gsap.fromTo(el, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.45 + i * 0.12 });
      else { el.style.opacity = 1; }
    });
  }

  /* ---------------- page transitions ---------------- */
  const curtain = document.querySelector(".curtain");
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-transition]");
    if (!a || e.metaKey || e.ctrlKey) return;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("http") || href.startsWith("#")) return;
    e.preventDefault();
    if (!window.gsap || reduceMotion) { location.href = href; return; }
    gsap.timeline()
      .set(curtain, { yPercent: 101 })
      .to(curtain, { yPercent: 0, duration: 0.6, ease: "expo.inOut" })
      .to(curtain.querySelector(".ar"), { opacity: 1, duration: 0.25 }, "-=0.2")
      .add(() => (location.href = href), "+=0.05");
  });

  /* ---------------- menu overlay ---------------- */
  const menuBtn = document.querySelector(".menu-btn");
  const overlay = document.querySelector(".menu-overlay");
  const menuWord = menuBtn.querySelector(".menu-word");
  menuBtn.addEventListener("click", () => {
    const open = document.body.classList.toggle("menu-open");
    menuBtn.setAttribute("aria-expanded", open);
    overlay.setAttribute("aria-hidden", !open);
    menuWord.textContent = open ? "Close" : "Menu";
    overlay.querySelectorAll(".menu-links a").forEach((a, i) => {
      a.style.transitionDelay = open ? 0.25 + i * 0.06 + "s" : "0s";
    });
    if (lenis) open ? lenis.stop() : lenis.start();
  });
  overlay.addEventListener("click", (e) => { if (e.target.closest("a")) menuBtn.click(); });

  /* ---------------- hide header on scroll down ---------------- */
  let lastY = 0;
  const header = document.querySelector(".site-header");
  window.addEventListener("scroll", () => {
    const y = scrollY;
    header.classList.toggle("hidden", y > 500 && y > lastY && !document.body.classList.contains("menu-open"));
    lastY = y;
  }, { passive: true });

  /* ---------------- scroll reveals ---------------- */
  const io = new IntersectionObserver(
    (entries) => entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("revealed"); io.unobserve(en.target); } }),
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );
  window.ELRAYGA.observeReveals = (root = document) =>
    root.querySelectorAll("[data-reveal]:not(.revealed),[data-reveal-img]:not(.revealed)").forEach((el) => io.observe(el));
  window.ELRAYGA.observeReveals();
  // catch content injected by page scripts after this point
  new MutationObserver(() => window.ELRAYGA.observeReveals()).observe(document.body, { childList: true, subtree: true });

  // split lines that reveal on scroll (not hero)
  if (window.gsap && window.ScrollTrigger) {
    document.querySelectorAll(".split-scroll").forEach((el) => {
      const spans = el.querySelectorAll(".line > span");
      gsap.to(spans, {
        y: 0, duration: 1.05, ease: "expo.out", stagger: 0.08,
        scrollTrigger: { trigger: el, start: "top 82%" }
      });
    });
    // parallax on any [data-parallax] media
    document.querySelectorAll("[data-parallax]").forEach((el) => {
      const amt = parseFloat(el.dataset.parallax) || 12;
      gsap.fromTo(el, { yPercent: -amt }, {
        yPercent: amt, ease: "none",
        scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true }
      });
    });
    // giant footer type slides in
    const fb = document.querySelector(".footer-big span");
    if (fb) gsap.fromTo(fb, { yPercent: 60, opacity: 0.2 }, {
      yPercent: 0, opacity: 1, ease: "power2.out",
      scrollTrigger: { trigger: ".footer-big", start: "top 95%", end: "top 60%", scrub: true }
    });
  }

  /* ---------------- marquee ---------------- */
  document.querySelectorAll(".marquee").forEach((m) => {
    const track = m.querySelector(".marquee-track");
    if (!track) return;
    track.innerHTML += track.innerHTML;
    let x = 0, speed = parseFloat(m.dataset.speed || "0.6");
    const dir = m.dataset.dir === "rtl" ? 1 : -1;
    (function step() {
      x += speed * dir;
      const half = track.scrollWidth / 2;
      if (x <= -half) x += half;
      if (x >= 0 && dir === 1) x -= half;
      track.style.transform = `translateX(${x}px)`;
      requestAnimationFrame(step);
    })();
  });

  /* ---------------- custom cursor ---------------- */
  const cursor = document.querySelector(".cursor");
  const label = cursor.querySelector(".label");
  let cx = -100, cy = -100, tx = -100, ty = -100;
  addEventListener("mousemove", (e) => { tx = e.clientX; ty = e.clientY; });
  (function moveCursor() {
    cx += (tx - cx) * 0.18; cy += (ty - cy) * 0.18;
    cursor.style.transform = `translate(${cx}px, ${cy}px)`;
    requestAnimationFrame(moveCursor);
  })();
  document.addEventListener("mouseover", (e) => {
    const t = e.target.closest("[data-cursor]");
    if (t) { cursor.classList.add("big"); label.textContent = t.dataset.cursor; }
    else if (e.target.closest("a,button")) { cursor.classList.add("big"); label.textContent = ""; }
    else { cursor.classList.remove("big"); }
  });

  /* ---------------- lightbox ---------------- */
  const lb = document.querySelector(".lightbox");
  const lbImg = lb.querySelector("img");
  document.addEventListener("click", (e) => {
    const fig = e.target.closest("[data-lightbox]");
    if (fig) {
      lbImg.src = fig.dataset.lightbox || fig.querySelector("img")?.src;
      lb.classList.add("open");
      if (lenis) lenis.stop();
    } else if (e.target.closest(".lightbox")) {
      lb.classList.remove("open");
      if (lenis) lenis.start();
    }
  });
  addEventListener("keydown", (e) => { if (e.key === "Escape") { lb.classList.remove("open"); if (lenis) lenis.start(); } });

  /* ---------------- toast ---------------- */
  window.ELRAYGA.toast = (msg) => {
    const t = document.querySelector(".toast");
    t.textContent = msg;
    t.classList.add("on");
    clearTimeout(t._h);
    t._h = setTimeout(() => t.classList.remove("on"), 3200);
  };

  /* helpers used by page scripts */
  window.ELRAYGA.fmt = (n) => new Intl.NumberFormat("en-EG").format(n);
  window.ELRAYGA.splitLines = function (el) {
    // wrap each existing line-ish chunk (we author with <span data-line>) — simple utility for authored markup
    el.querySelectorAll("[data-line]").forEach((l) => {
      const inner = document.createElement("span");
      inner.innerHTML = l.innerHTML;
      l.innerHTML = ""; l.className = "line"; l.appendChild(inner);
    });
    el.classList.add("split-lines");
  };
  document.querySelectorAll(".split-auto").forEach((el) => window.ELRAYGA.splitLines(el));
})();
