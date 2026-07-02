/* Stay listing: renders all rooms, filter chips, honours ?kind= param. */
(function () {
  const E = window.ELRAYGA;
  const grid = document.getElementById("stay-grid");

  function card(r) {
    return `
    <article class="stay-card" data-kind="${r.kind}" data-cursor="View">
      <a href="/stay/${r.slug}/" data-transition aria-label="${r.name} — details & booking"></a>
      <div class="card-media" data-reveal-img>
        <img src="${r.photos[0]}" alt="${r.name} at El Rayga Camp" loading="lazy">
        <span class="card-kind">${r.kind === "dorm" ? "Hostel bed" : r.kind === "room" ? "Private room" : "Hut"}</span>
        <span class="card-price">from <b>EGP ${E.fmt(r.price)}</b> / ${r.perBed ? "bed" : "night"}</span>
      </div>
      <div class="card-body">
        <h3 class="card-title">${r.name}</h3>
        <span class="card-ar ar">${r.arabic}</span>
      </div>
      <p class="card-meta">Sleeps ${r.sleeps} · ${r.beds} · ${r.bath.split(" (")[0]}</p>
    </article>`;
  }

  function render(kind) {
    const rooms = kind === "all" ? E.rooms : E.rooms.filter((r) => r.kind === kind);
    grid.innerHTML = rooms.map(card).join("");
    grid.querySelectorAll("[data-reveal-img]").forEach((el, i) => {
      setTimeout(() => el.classList.add("revealed"), 60 + i * 90);
    });
  }

  const buttons = document.querySelectorAll(".filters button");
  buttons.forEach((b) =>
    b.addEventListener("click", () => {
      buttons.forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      render(b.dataset.kind);
      history.replaceState(null, "", b.dataset.kind === "all" ? "/stay/" : `/stay/?kind=${b.dataset.kind}`);
    })
  );

  const kind = new URLSearchParams(location.search).get("kind");
  const initial = ["hut", "room", "dorm"].includes(kind) ? kind : "all";
  buttons.forEach((b) => b.classList.toggle("active", b.dataset.kind === initial));
  render(initial);
})();
