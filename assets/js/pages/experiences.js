/* Experiences: full list with floating hover thumbnail. */
(function () {
  const EXPS = [
    ["dive", "Dive the Blue Hole & Lighthouse", "Two guided dives with a licensed centre 200 m up the promenade. All levels; try-dives daily at 9.", "from EGP 1,900"],
    ["freedive", "Freediving intro course", "One breath, twelve metres, a very quiet brain. Half-day intro with certified instructors on the house reef.", "from EGP 1,400"],
    ["snorkel", "Snorkel safari — Three Pools & Ras Abu Galum", "Boat-free day trip along the coast, lunch in a Bedouin hut on the sand. Gear and pickup included.", "from EGP 700"],
    ["yoga", "Sunrise yoga on the terrace", "60 minutes, all levels, mats provided. The sun does the savasana lighting for free.", "EGP 250 / class"],
    ["safari", "Camel & jeep desert safari", "Laguna camel ride at sunset or Wadi Gnai by jeep — Bedouin dinner, star talk, zero light pollution.", "from EGP 900"],
    ["fire", "Fire & film night", "Every Thursday: a screen in the courtyard, tea on the coals, and whatever the camp votes to watch.", "free for guests"]
  ];
  const list = document.getElementById("exp-list");
  list.innerHTML = EXPS.map(([k, t, d, p], i) => `
    <div class="exp-row" data-thumb="/assets/img/exp/${k}.svg" data-cursor="Ask Dawod">
      <span class="num">0${i + 1}</span>
      <h3>${t}</h3>
      <p>${d}</p>
      <span style="font-weight:600;white-space:nowrap">${p}</span>
    </div>`).join("");

  const thumb = document.createElement("div");
  thumb.className = "exp-thumb";
  document.body.appendChild(thumb);
  EXPS.forEach(([k]) => {
    const im = new Image(); im.src = `/assets/img/exp/${k}.svg`; thumb.appendChild(im);
  });
  list.addEventListener("mousemove", (e) => {
    thumb.style.left = e.clientX + 26 + "px";
    thumb.style.top = e.clientY - 120 + "px";
  });
  list.addEventListener("mouseover", (e) => {
    const row = e.target.closest(".exp-row");
    if (!row) return;
    thumb.classList.add("on");
    const file = row.dataset.thumb.split("/").pop();
    [...thumb.children].forEach((im) => im.classList.toggle("cur", im.src.endsWith(file)));
  });
  list.addEventListener("mouseleave", () => thumb.classList.remove("on"));
})();
