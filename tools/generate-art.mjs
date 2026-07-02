/* Generates the illustrated "photo" set for every room + experience.
   Run:  node tools/generate-art.mjs
   Output: assets/img/rooms/<slug>/{1..4}.svg , assets/img/exp/*.svg , assets/img/scenes/*.svg
   Deterministic per slug (seeded), so re-runs are stable. */
import { mkdirSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/* ---------- tiny seeded rng ---------- */
function rng(seedStr) {
  let h = 2166136261;
  for (const c of seedStr) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
  return () => {
    h += 0x6d2b79f5;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const lerp = (a, b, t) => a + (b - a) * t;

/* ---------- palettes: time-of-day per photo index ---------- */
const TIMES = {
  dusk:  { skyA: "#2b1f3a", skyB: "#c25b3f", skyC: "#e8a35c", sea: "#173f46", seaHi: "#2c6f70", land: "#1d1626", land2: "#31203a", sun: "#f4c479", star: 0.35 },
  day:   { skyA: "#7fb6c9", skyB: "#cfe3dd", skyC: "#efe6cc", sea: "#1c7a7c", seaHi: "#57b3a6", land: "#a5673f", land2: "#c8895a", sun: "#f7ead0", star: 0 },
  night: { skyA: "#070d1c", skyB: "#122036", skyC: "#1d3a4a", sea: "#0a2531", seaHi: "#174a52", land: "#0b111e", land2: "#16202f", sun: "#e9e4d0", star: 1 },
  dawn:  { skyA: "#33415e", skyB: "#a6738a", skyC: "#e7b98a", sea: "#1b4e57", seaHi: "#3b8a83", land: "#241d33", land2: "#3d2f48", sun: "#f2d9a6", star: 0.15 }
};
const ORDER = ["dusk", "day", "dawn", "night"];

const W = 1200, H = 900;

function defs(id, t, accent) {
  return `<defs>
  <linearGradient id="sky${id}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${t.skyA}"/><stop offset=".55" stop-color="${t.skyB}"/><stop offset="1" stop-color="${t.skyC}"/>
  </linearGradient>
  <linearGradient id="sea${id}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${t.seaHi}"/><stop offset="1" stop-color="${t.sea}"/>
  </linearGradient>
  <radialGradient id="glow${id}" cx=".5" cy=".5" r=".5">
    <stop offset="0" stop-color="${t.sun}" stop-opacity=".9"/><stop offset="1" stop-color="${t.sun}" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="acc${id}" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${accent}"/><stop offset="1" stop-color="${accent}" stop-opacity=".6"/>
  </linearGradient>
  <filter id="grain${id}"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/>
    <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .06 0"/>
  </filter>
  <filter id="soft${id}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="18"/></filter>
</defs>`;
}

function stars(r, t, n = 60) {
  if (!t.star) return "";
  let s = "";
  for (let i = 0; i < n; i++) {
    const x = r() * W, y = r() * H * 0.5, rad = r() * 1.8 + 0.4, o = (r() * 0.6 + 0.3) * t.star;
    s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rad.toFixed(1)}" fill="#fff" opacity="${o.toFixed(2)}"/>`;
  }
  return s;
}

function mountains(r, t, horizon) {
  // Sinai range silhouette + far Saudi range across the gulf
  let far = `M0 ${horizon}`;
  for (let x = 0; x <= W; x += 60) far += ` L${x} ${horizon - 20 - r() * 70}`;
  far += ` L${W} ${horizon} Z`;
  let near = `M0 ${horizon + 10}`;
  for (let x = 0; x <= W; x += 90) near += ` L${x} ${horizon - 60 - r() * 130}`;
  near += ` L${W} ${horizon + 10} Z`;
  return `<path d="${far}" fill="${t.land2}" opacity=".7"/><path d="${near}" fill="${t.land}"/>`;
}

function sea(t, id, y, h) {
  let waves = "";
  for (let i = 0; i < 8; i++) {
    const wy = y + 14 + i * (h / 9);
    waves += `<path d="M0 ${wy} Q ${W / 4} ${wy - 6} ${W / 2} ${wy} T ${W} ${wy}" stroke="#ffffff" stroke-opacity="${0.14 - i * 0.012}" stroke-width="2.5" fill="none"/>`;
  }
  return `<rect x="0" y="${y}" width="${W}" height="${h}" fill="url(#sea${id})"/>${waves}`;
}

function sunOrMoon(t, time, x, y) {
  const rr = time === "night" ? 46 : 74;
  const body = time === "night"
    ? `<circle cx="${x}" cy="${y}" r="${rr}" fill="${t.sun}"/><circle cx="${x + 16}" cy="${y - 10}" r="${rr}" fill="${t.skyA}"/>`
    : `<circle cx="${x}" cy="${y}" r="${rr}" fill="${t.sun}"/>`;
  return `<circle cx="${x}" cy="${y}" r="${rr * 3.4}" fill="url(#glowGLOW)"/>`.replace("GLOW", "") + body;
}

function palm(x, y, s, flip, tone) {
  const f = flip ? -1 : 1;
  let fronds = "";
  for (let i = 0; i < 6; i++) {
    const a = -80 + i * 32;
    fronds += `<path d="M0 0 q ${f * 60 * Math.cos(a * 0.017)} ${-46 - i * 6} ${f * 120 * Math.cos(a * 0.017)} ${-30 + i * 10}" stroke="${tone}" stroke-width="10" stroke-linecap="round" fill="none"/>`;
  }
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M0 0 C ${f * 10} -60 ${f * 26} -110 ${f * 46} -150" stroke="${tone}" stroke-width="14" stroke-linecap="round" fill="none"/>
    <g transform="translate(${f * 46} -150)">${fronds}</g></g>`;
}

function hutShape(x, y, w, h, wall, roof, doorTone, id) {
  return `<g>
    <path d="M${x} ${y} h${w} v${-h} h${-w} Z" fill="${wall}"/>
    ${bambooLines(x, y, w, h, "#00000022")}
    <path d="M${x - w * 0.12} ${y - h} L${x + w / 2} ${y - h - w * 0.42} L${x + w * 1.12} ${y - h} Z" fill="${roof}"/>
    ${thatch(x - w * 0.12, y - h, w * 1.24, id)}
    <rect x="${x + w * 0.38}" y="${y - h * 0.72}" width="${w * 0.24}" height="${h * 0.72}" rx="6" fill="${doorTone}"/>
  </g>`;
}
function bambooLines(x, y, w, h, tone) {
  let s = "";
  for (let i = 1; i < 10; i++) s += `<line x1="${x + (w / 10) * i}" y1="${y}" x2="${x + (w / 10) * i}" y2="${y - h}" stroke="${tone}" stroke-width="3"/>`;
  return s;
}
function thatch(x, y, w, id) {
  let s = "";
  for (let i = 0; i < 12; i++) s += `<line x1="${x + (w / 12) * i + 6}" y1="${y}" x2="${x + (w / 12) * i - 8}" y2="${y + 26}" stroke="#00000030" stroke-width="4" stroke-linecap="round"/>`;
  return s;
}

function lantern(x, y, s, glowTone) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <circle cx="0" cy="26" r="46" fill="${glowTone}" opacity=".28"/>
    <line x1="0" y1="-34" x2="0" y2="-12" stroke="#2a2118" stroke-width="4"/>
    <path d="M-16 -12 h32 l6 14 v22 l-6 14 h-32 l-6 -14 v-22 Z" fill="#2a2118"/>
    <path d="M-10 -6 h20 l4 10 v18 l-4 10 h-20 l-4 -10 v-18 Z" fill="${glowTone}"/>
  </g>`;
}

function stringLights(x1, x2, y, sag, tone) {
  let bulbs = "";
  for (let i = 1; i < 10; i++) {
    const t = i / 10, bx = lerp(x1, x2, t), by = y + Math.sin(Math.PI * t) * sag + 8;
    bulbs += `<circle cx="${bx}" cy="${by}" r="5" fill="${tone}"/><circle cx="${bx}" cy="${by}" r="12" fill="${tone}" opacity=".25"/>`;
  }
  return `<path d="M${x1} ${y} Q ${(x1 + x2) / 2} ${y + sag * 2} ${x2} ${y}" stroke="#1a140f" stroke-width="3" fill="none"/>${bulbs}`;
}

function frame(id) {
  return `<rect width="${W}" height="${H}" filter="url(#grain${id})" opacity=".8"/>
  <rect x="0" y="0" width="${W}" height="${H}" fill="none" stroke="#0e0b08" stroke-opacity=".25" stroke-width="2"/>`;
}

/* ================= SCENES ================= */

function sceneExterior(seed, t, time, accent, kind) {
  const r = rng(seed);
  const id = "x";
  const horizon = H * 0.52;
  const sunX = 200 + r() * 800;
  let structures = "";
  if (kind === "hut") {
    structures = hutShape(W * 0.16, H * 0.86, 360, 260, "#caa96f", accent, "#3a2c1c", id)
      + palm(W * 0.72, H * 0.87, 1.5, false, t.land)
      + palm(W * 0.09, H * 0.88, 1.1, true, t.land);
  } else if (kind === "dorm") {
    structures = `<rect x="${W * 0.12}" y="${H * 0.56}" width="620" height="270" rx="10" fill="#cbb489"/>
      ${[0, 1, 2, 3].map(i => `<rect x="${W * 0.12 + 50 + i * 150}" y="${H * 0.62}" width="86" height="110" rx="8" fill="${t.skyA}" stroke="#3a2c1c" stroke-width="6"/>`).join("")}
      <rect x="${W * 0.12}" y="${H * 0.53}" width="620" height="34" rx="8" fill="${accent}"/>`
      + palm(W * 0.8, H * 0.87, 1.6, false, t.land);
  } else {
    structures = `<rect x="${W * 0.16}" y="${H * 0.5}" width="480" height="330" rx="12" fill="#d3bd93"/>
      <rect x="${W * 0.2}" y="${H * 0.58}" width="120" height="150" rx="8" fill="${t.skyA}" stroke="#3a2c1c" stroke-width="6"/>
      <rect x="${W * 0.44}" y="${H * 0.58}" width="120" height="220" rx="8" fill="#3a2c1c"/>
      <rect x="${W * 0.16}" y="${H * 0.47}" width="480" height="36" rx="10" fill="${accent}"/>`
      + palm(W * 0.75, H * 0.86, 1.5, false, t.land);
  }
  return `${stars(r, t)}${sunOrMoon(t, time, sunX, H * 0.3)}
    ${mountains(r, t, horizon)}
    ${sea(t, id, horizon + 4, H * 0.16)}
    <rect x="0" y="${H * 0.66}" width="${W}" height="${H * 0.34}" fill="${time === 'day' ? '#e2cda1' : '#8a6a4d'}"/>
    <ellipse cx="${W * 0.5}" cy="${H * 0.985}" rx="${W * 0.62}" ry="40" fill="#00000022"/>
    ${structures}
    ${stringLights(W * 0.05, W * 0.95, H * 0.18, 40, t.sun)}
    ${lantern(W * 0.88, H * 0.8, 1.2, t.sun)}`;
}

function sceneInterior(seed, t, time, accent, kind) {
  const r = rng(seed);
  const wall = "#e8d9b8", floor = "#b98d5e";
  const windowSky = `<linearGradient id="wsky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${t.skyA}"/><stop offset=".7" stop-color="${t.skyB}"/><stop offset="1" stop-color="${t.seaHi}"/></linearGradient>`;
  let beds = "";
  if (kind === "dorm") {
    for (let i = 0; i < 3; i++) {
      const bx = 110 + i * 340;
      beds += `<g>
        <rect x="${bx}" y="${H * 0.62}" width="280" height="150" rx="14" fill="#f0e6cf"/>
        <rect x="${bx}" y="${H * 0.62}" width="280" height="44" rx="14" fill="${accent}"/>
        <rect x="${bx + 16}" y="${H * 0.58}" width="86" height="40" rx="12" fill="#fff"/>
        <rect x="${bx - 10}" y="${H * 0.62 + 150}" width="300" height="70" rx="8" fill="#8d6b45"/>
        <rect x="${bx + 210}" y="${H * 0.40}" width="60" height="90" rx="6" fill="#6f5436"/>
      </g>`;
    }
  } else {
    beds = `<g>
      <rect x="${W * 0.14}" y="${H * 0.6}" width="560" height="190" rx="18" fill="#f0e6cf"/>
      <rect x="${W * 0.14}" y="${H * 0.6}" width="560" height="60" rx="18" fill="${accent}"/>
      <rect x="${W * 0.16}" y="${H * 0.55}" width="130" height="52" rx="14" fill="#fff"/>
      <rect x="${W * 0.31}" y="${H * 0.55}" width="130" height="52" rx="14" fill="#fff"/>
      <rect x="${W * 0.12}" y="${H * 0.6 + 190}" width="600" height="80" rx="10" fill="#8d6b45"/>
      <rect x="${W * 0.1}" y="${H * 0.42}" width="620" height="26" rx="8" fill="#6f5436"/>
    </g>`;
  }
  const rug = `<g transform="translate(${W * 0.62} ${H * 0.88})">
      <rect x="-160" y="-26" width="420" height="90" rx="10" fill="${accent}" opacity=".85"/>
      ${[0, 1, 2].map(i => `<rect x="${-140 + i * 130}" y="-12" width="90" height="62" rx="6" fill="#f3ecdd" opacity=".85"/>`).join("")}
    </g>`;
  return `<defs>${windowSky}</defs>
    <rect width="${W}" height="${H}" fill="${wall}"/>
    ${bambooLines(0, H, W, H, "#0000000d")}
    <rect x="0" y="${H * 0.78}" width="${W}" height="${H * 0.22}" fill="${floor}"/>
    <g>
      <rect x="${W * 0.66}" y="${H * 0.14}" width="340" height="330" rx="18" fill="url(#wsky)" stroke="#4a3826" stroke-width="14"/>
      <line x1="${W * 0.66 + 170}" y1="${H * 0.14}" x2="${W * 0.66 + 170}" y2="${H * 0.14 + 330}" stroke="#4a3826" stroke-width="10"/>
      <path d="M${W * 0.66} ${H * 0.14 + 210} h340" stroke="#ffffff55" stroke-width="3"/>
      <rect x="${W * 0.66}" y="${H * 0.14 + 228}" width="340" height="102" fill="${t.sea}" opacity=".9"/>
    </g>
    ${beds}${rug}
    ${lantern(W * 0.08, H * 0.36, 1.3, t.sun)}
    <circle cx="${W * 0.5}" cy="${H * 0.12}" r="70" fill="${accent}" opacity=".14"/>`;
}

function scenePatio(seed, t, time, accent) {
  const r = rng(seed);
  const horizon = H * 0.5;
  let cushions = "";
  const tones = [accent, "#f3ecdd", "#d8a24a", accent];
  for (let i = 0; i < 4; i++) {
    const cx = 150 + i * 260 + r() * 40;
    cushions += `<g transform="translate(${cx} ${H * 0.8})">
      <ellipse cx="0" cy="34" rx="120" ry="26" fill="#00000022"/>
      <rect x="-100" y="-30" width="200" height="60" rx="26" fill="${tones[i % 4]}"/>
      <rect x="-100" y="-44" width="200" height="34" rx="17" fill="${tones[(i + 1) % 4]}" opacity=".9"/>
    </g>`;
  }
  return `${stars(rng(seed + "s"), t)}${sunOrMoon(t, time, W * 0.78, H * 0.24)}
    ${mountains(rng(seed + "m"), t, horizon)}
    ${sea(t, "x", horizon + 4, H * 0.14)}
    <rect x="0" y="${H * 0.62}" width="${W}" height="${H * 0.38}" fill="#9c7350"/>
    <g transform="translate(${W * 0.5} ${H * 0.72})">
      <ellipse cx="0" cy="60" rx="130" ry="24" fill="#00000033"/>
      <rect x="-110" y="-10" width="220" height="64" rx="12" fill="#7a5335"/>
      <circle cx="0" cy="-30" r="26" fill="${t.sun}"/>
      <path d="M-14 -30 q14 -46 28 0" fill="${t.sun}" opacity=".7"/>
      <g stroke="#3a2c1c" stroke-width="5">${[0, 1, 2, 3].map(i => `<line x1="${-70 + i * 46}" y1="-4" x2="${-78 + i * 46}" y2="-58"/>`).join("")}</g>
    </g>
    ${cushions}
    ${stringLights(0, W, H * 0.12, 46, t.sun)}
    ${palm(W * 0.06, H * 0.66, 1.3, true, t.land)}
    ${palm(W * 0.94, H * 0.66, 1.4, false, t.land)}
    ${lantern(W * 0.3, H * 0.66, 1.1, t.sun)}${lantern(W * 0.7, H * 0.66, 1.1, t.sun)}`;
}

function sceneView(seed, t, time, accent) {
  const r = rng(seed);
  const horizon = H * 0.44;
  let fish = "";
  for (let i = 0; i < 5; i++) {
    const fx = 120 + r() * 900, fy = horizon + 120 + r() * 260;
    fish += `<g transform="translate(${fx} ${fy}) scale(${0.7 + r() * 0.8})" opacity=".5">
      <path d="M0 0 q 22 -14 44 0 q -22 14 -44 0 Z" fill="#f3ecdd"/><path d="M44 0 l 16 -10 v20 Z" fill="#f3ecdd"/></g>`;
  }
  return `${stars(r, t)}${sunOrMoon(t, time, W * 0.3, H * 0.22)}
    ${mountains(rng(seed + "m"), t, horizon)}
    ${sea(t, "x", horizon, H - horizon)}
    ${fish}
    <path d="M0 ${H} L ${W * 0.34} ${horizon + 30} L ${W * 0.42} ${horizon + 30} L ${W * 0.2} ${H} Z" fill="#e2cda1" opacity=".9"/>
    <g transform="translate(${W * 0.74} ${H * 0.78})">
      <path d="M-140 40 q 140 60 280 0 l -30 -34 h -220 Z" fill="#7a5335"/>
      <rect x="-16" y="-150" width="12" height="160" fill="#4a3826"/>
      <path d="M-10 -150 L 150 -60 L -10 -20 Z" fill="${accent}"/>
    </g>
    ${palm(W * 0.1, H * 0.9, 1.8, true, t.land)}
    <circle cx="${W * 0.86}" cy="${H * 0.2}" r="8" fill="#fff" opacity=".8"/>
    <path d="M${W * 0.82} ${H * 0.24} q 40 -30 80 0" stroke="#ffffff88" stroke-width="4" fill="none"/>`;
}

/* experiences */
function sceneExp(name, accent) {
  const t = TIMES[{ dive: "day", freedive: "dawn", yoga: "dawn", fire: "night", safari: "dusk", snorkel: "day" }[name] || "day"];
  const r = rng("exp" + name);
  const horizon = H * 0.5;
  const base = `${stars(r, t)}${sunOrMoon(t, t === TIMES.night ? "night" : "day", W * 0.7, H * 0.24)}${mountains(rng(name + "m"), t, horizon)}${sea(t, "x", horizon, H * 0.5)}`;
  const marks = {
    dive: `<g transform="translate(${W * 0.4} ${H * 0.7})"><circle r="60" fill="#0b2c33"/><rect x="-14" y="-90" width="28" height="46" rx="10" fill="${accent}"/><circle cx="0" cy="-14" r="34" fill="#123c44" stroke="#f3ecdd" stroke-width="8"/><path d="M-70 30 q 70 50 140 0" stroke="${accent}" stroke-width="10" fill="none"/>${[1, 2, 3].map(i => `<circle cx="${20 * i}" cy="${-60 - i * 26}" r="${5 + i * 2}" fill="#fff" opacity=".7"/>`).join("")}</g>`,
    freedive: `<g transform="translate(${W * 0.5} ${H * 0.66})"><path d="M0 -40 q 30 60 0 160" stroke="#10333b" stroke-width="26" stroke-linecap="round" fill="none"/><circle cy="-58" r="26" fill="#10333b"/><path d="M-8 120 l 30 44 M8 118 l 34 30" stroke="${accent}" stroke-width="16" stroke-linecap="round"/></g><circle cx="${W * 0.5}" cy="${H * 0.42}" r="90" fill="#0b3a44" opacity=".5"/>`,
    yoga: `<g transform="translate(${W * 0.5} ${H * 0.62})"><ellipse cy="60" rx="150" ry="20" fill="#00000022"/><rect x="-150" y="40" width="300" height="18" rx="9" fill="${accent}"/><circle cy="-70" r="24" fill="#3a2c1c"/><path d="M0 -46 v70 M0 24 l -60 36 M0 24 l 60 36 M0 -20 l -70 -16 M0 -20 l 70 -16" stroke="#3a2c1c" stroke-width="16" stroke-linecap="round"/></g>`,
    fire: `<g transform="translate(${W * 0.5} ${H * 0.72})"><ellipse cy="66" rx="220" ry="30" fill="#00000033"/>${[-160, 160].map(x => `<rect x="${x - 40}" y="18" width="80" height="26" rx="13" fill="#5c4128"/>`).join("")}<path d="M-40 40 q -10 -90 40 -130 q -6 60 30 80 q 20 -26 16 -60 q 40 50 10 110 Z" fill="${accent}"/><path d="M-18 40 q 0 -50 22 -70 q 10 34 18 44 q 8 -12 6 -30 q 22 30 2 56 Z" fill="#ffd98a"/></g>`,
    safari: `<g transform="translate(${W * 0.46} ${H * 0.7})"><path d="M-60 0 q 0 -60 60 -60 q 60 0 60 60 l 30 0 q 20 0 20 -30 q 0 -60 -60 -80 l 0 -20 q 30 -10 30 -40" stroke="#3a2c1c" stroke-width="18" fill="none" stroke-linecap="round"/><ellipse cx="10" cy="30" rx="120" ry="18" fill="#00000022"/><path d="M-90 20 q 40 -110 130 -60 q 70 40 90 30" stroke="${accent}" stroke-width="0" fill="none"/><path d="M-110 6 h40 M120 6 h40" stroke="#3a2c1c" stroke-width="14" stroke-linecap="round"/></g>`,
    snorkel: `<g transform="translate(${W * 0.5} ${H * 0.68})"><ellipse rx="180" ry="120" fill="#0b3a44" opacity=".45"/>${[0, 1, 2, 3, 4].map(i => `<g transform="translate(${-120 + i * 60} ${-20 + (i % 2) * 60}) scale(${0.9 + (i % 3) * 0.3})"><path d="M0 0 q 22 -14 44 0 q -22 14 -44 0 Z" fill="${i % 2 ? accent : "#f3ecdd"}"/><path d="M44 0 l 16 -10 v20 Z" fill="${i % 2 ? accent : "#f3ecdd"}"/></g>`).join("")}<path d="M-150 90 q 20 -60 40 0 q 20 -60 40 0" stroke="#e2557b" stroke-width="10" fill="none" stroke-linecap="round"/></g>`
  };
  return base + (marks[name] || "");
}

/* ---------- svg wrapper ---------- */
function svg(inner, t, accent) {
  const id = "x";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">
${defs(id, t, accent)}
<rect width="${W}" height="${H}" fill="url(#sky${id})"/>
${inner}
${frame(id)}
</svg>`;
}

/* ================= RUN ================= */
const rooms = [
  ["seafront-bamboo-hut", "hut", "#ff5c39"],
  ["garden-hut", "hut", "#3f9d6e"],
  ["bedouin-hut", "hut", "#d8a24a"],
  ["comfy-studio", "room", "#4d8fd1"],
  ["private-double", "room", "#b06ab3"],
  ["family-lodge", "room", "#e0723c"],
  ["mixed-dorm", "dorm", "#2ba7a0"],
  ["female-dorm", "dorm", "#e2557b"]
];

const SCENES = [sceneExterior, sceneInterior, scenePatio, sceneView];
for (const [slug, kind, accent] of rooms) {
  const dir = join(root, "assets/img/rooms", slug);
  mkdirSync(dir, { recursive: true });
  SCENES.forEach((fn, i) => {
    const time = ORDER[(i + rooms.findIndex(x => x[0] === slug)) % 4];
    const t = TIMES[time];
    const body = fn(slug + i, t, time, accent, kind);
    writeFileSync(join(dir, `${i + 1}.svg`), svg(body, t, accent));
  });
  console.log("rooms/", slug);
}

const exps = [["dive", "#2ba7a0"], ["freedive", "#4d8fd1"], ["yoga", "#d8a24a"], ["fire", "#ff5c39"], ["safari", "#e0723c"], ["snorkel", "#3f9d6e"]];
const expDir = join(root, "assets/img/exp");
mkdirSync(expDir, { recursive: true });
for (const [name, accent] of exps) {
  const timeKey = { dive: "day", freedive: "dawn", yoga: "dawn", fire: "night", safari: "dusk", snorkel: "day" }[name];
  writeFileSync(join(expDir, `${name}.svg`), svg(sceneExp(name, accent), TIMES[timeKey], accent));
  console.log("exp/", name);
}

/* hero-adjacent scenes */
const scenesDir = join(root, "assets/img/scenes");
mkdirSync(scenesDir, { recursive: true });
writeFileSync(join(scenesDir, "camp-dusk.svg"), svg(sceneExterior("camp-hero", TIMES.dusk, "dusk", "#ff5c39", "hut"), TIMES.dusk, "#ff5c39"));
writeFileSync(join(scenesDir, "camp-night.svg"), svg(scenePatio("camp-night", TIMES.night, "night", "#d8a24a"), TIMES.night, "#d8a24a"));
writeFileSync(join(scenesDir, "lagoon.svg"), svg(sceneView("lagoon", TIMES.day, "day", "#2ba7a0"), TIMES.day, "#2ba7a0"));
writeFileSync(join(scenesDir, "dawn.svg"), svg(sceneView("dawn-hero", TIMES.dawn, "dawn", "#e2557b"), TIMES.dawn, "#e2557b"));
console.log("scenes done");
