/* Reviews page: platform score cards + filterable masonry wall. */
(function () {
  const E = window.ELRAYGA;
  const NAMES = { google: "Google Maps", booking: "Booking.com", tripadvisor: "Tripadvisor", facebook: "Facebook" };

  /* score cards */
  const scores = document.getElementById("scores");
  scores.innerHTML = E.platforms.map((p) => `
    <a class="score-card" href="${p.url}" target="_blank" rel="noopener" style="--pct:${(p.score / p.outOf) * 100}%">
      <span class="platform">${p.name}</span>
      <span class="score">${p.score}<small>${p.unit ? p.unit : "/ " + p.outOf}</small></span>
      <span class="count">${p.count} reviews${p.note ? " · " + p.note : ""}</span>
      <span class="bar"><i></i></span>
    </a>`).join("");
  const io = new IntersectionObserver((es) => es.forEach((x) => x.isIntersecting && x.target.classList.add("inview")), { threshold: 0.3 });
  scores.querySelectorAll(".score-card").forEach((c) => io.observe(c));

  /* wall */
  function starRow(r) {
    // booking scores are /10 → map to /5 for stars
    const v = r.platform === "booking" ? Math.round(r.rating / 2) : r.rating;
    const low = v <= 2;
    return `<span class="stars ${low ? "low" : ""}">${"★".repeat(v)}${`<span style="opacity:.25">${"★".repeat(5 - v)}</span>`}</span>`;
  }
  function card(r) {
    const v = r.platform === "booking" ? r.rating / 2 : r.rating;
    return `
    <article class="review-card ${v <= 2 ? "negative" : ""}" data-reveal>
      <div class="rc-head">
        <span class="rc-platform ${r.platform}">${NAMES[r.platform]}</span>
        ${starRow(r)}
      </div>
      <p>“${r.text}”</p>
      ${r.original ? `<p class="original ar">${r.original}</p>` : ""}
      <div class="rc-foot">
        <span>${r.author}</span>
        <span>${r.when}${r.verbatim ? "" : " · theme summary"}</span>
      </div>
    </article>`;
  }
  const wall = document.getElementById("wall");
  function render(filter) {
    let list = E.reviews;
    if (filter === "critical") list = list.filter((r) => (r.platform === "booking" ? r.rating / 2 : r.rating) <= 2.5);
    else if (filter !== "all") list = list.filter((r) => r.platform === filter);
    wall.innerHTML = list.map(card).join("") || `<p class="muted">Nothing here yet.</p>`;
    wall.querySelectorAll("[data-reveal]").forEach((el, i) => setTimeout(() => el.classList.add("revealed"), 40 + i * 70));
  }
  const btns = document.querySelectorAll("#rev-filters button");
  btns.forEach((b) => b.addEventListener("click", () => {
    btns.forEach((x) => x.classList.remove("active"));
    b.classList.add("active");
    render(b.dataset.p);
  }));
  render("all");
})();
