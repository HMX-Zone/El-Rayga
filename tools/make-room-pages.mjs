/* Stamps out /stay/<slug>/index.html for every room in the data file.
   Run after adding/renaming rooms:  node tools/make-room-pages.mjs */
import { mkdirSync, writeFileSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// load room data from the browser-format data file
const src = readFileSync(join(root, "assets/js/data/rooms.js"), "utf8");
const window = { ELRAYGA: {} };
new Function("window", src)(window);
const rooms = window.ELRAYGA.rooms;

const page = (r) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${r.name} — book direct · El Rayga Camp, Dahab</title>
  <meta name="description" content="${r.tagline} Sleeps ${r.sleeps} · from EGP ${r.price} per ${r.perBed ? "bed" : "night"}. Book ${r.name} at El Rayga Camp, Masbat, Dahab.">
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%230b1b1e'/%3E%3Ctext x='16' y='23' text-anchor='middle' font-size='18' fill='%23ff5c39'%3E✳%3C/text%3E%3C/svg%3E">
  <link rel="stylesheet" href="/assets/css/fonts.css">
  <link rel="stylesheet" href="/assets/css/main.css">
</head>
<body data-page="room">
  <main id="room-mount"></main>
  <script>window.ROOM_SLUG = ${JSON.stringify(r.slug)};</script>
  <script src="/assets/vendor/gsap.min.js"></script>
  <script src="/assets/vendor/ScrollTrigger.min.js"></script>
  <script src="/assets/vendor/lenis.min.js"></script>
  <script src="/assets/js/data/rooms.js"></script>
  <script src="/assets/js/data/reviews.js"></script>
  <script src="/assets/js/main.js"></script>
  <script src="/assets/js/booking.js"></script>
  <script src="/assets/js/pages/room.js"></script>
</body>
</html>
`;

for (const r of rooms) {
  const dir = join(root, "stay", r.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), page(r));
  console.log("stay/" + r.slug + "/index.html");
}
