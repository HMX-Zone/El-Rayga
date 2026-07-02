# El Rayga Camp — كامب الرايجه · Dahab

Prototype website for **Elrayga Camp** (Peace Rd, Masbat, Dahab, South Sinai — Google 4.6★, 492 reviews)
with a full direct-booking flow for huts, private rooms and hostel beds.

## Run the local preview

No build step, no dependencies — it's a static site. From the repo root:

```bash
python3 -m http.server 4173
# or: npx serve -l 4173
```

Then open **http://localhost:4173**. (Serve from the repo root — the site uses root-absolute paths.)

## What's inside

| Page | Path |
|---|---|
| Home (WebGL hero, pinned stays strip, reviews band) | `/` |
| All stays + filters (huts / rooms / hostel beds) | `/stay/` |
| Booking slug per stay — gallery, specs, calendar, live pricing | `/stay/<slug>/` ×8 |
| Checkout (guest details, pay on arrival / transfer) | `/book/` |
| Confirmation (booking ref + WhatsApp handoff to the desk) | `/book/confirmed/` |
| Reviews aggregated from Google, Booking.com, Tripadvisor, Facebook | `/reviews/` |
| Experiences (diving, freediving, yoga, safari…) | `/experiences/` |
| About the camp | `/about/` |
| Contact & directions | `/contact/` |

## Design & motion

Custom "desert editorial" direction (not a template): Fraunces + Space Grotesk + Noto Naskh Arabic,
lagoon/sand/coral palette, film-grain overlay. Motion stack:

- **Lenis** smooth scrolling, **GSAP + ScrollTrigger** (vendored in `assets/vendor/`)
- Raw-GLSL **WebGL hero** (animated Red Sea dusk — sky, mountains, waves, sun path, stars; mouse + scroll reactive)
- Preloader, full-screen menu, page-transition curtain, custom cursor, marquees,
  pinned horizontal room strip, clip-path image reveals, floating hover thumbnails

## Booking engine (prototype)

`assets/js/booking.js` — real calendar with simulated availability (deterministic per room+date,
~15% of nights sold out), per-bed pricing for dorms, order → checkout → confirmation with a
booking reference (`ELR-YYMM-XXXX`) and a prefilled WhatsApp message to the camp
(+20 103 006 9058). Bookings persist in `localStorage`. Swap `isDateFull()` and the confirm step
for a real API later; the UI won't change.

## Content

- **Rooms/prices**: `assets/js/data/rooms.js` — edit freely. Prices are indicative, from public OTA listings.
- **Reviews**: `assets/js/data/reviews.js` — real quotes from Google/Booking/Tripadvisor/Facebook are
  marked `verbatim: true`; theme summaries are marked and labelled in the UI.
- **Images**: currently custom generative SVG illustrations (`node tools/generate-art.mjs`).
  To use real photos, drop `1.jpg…4.jpg` into `assets/img/rooms/<slug>/` and update the
  `photos` arrays in `rooms.js`.
- **Room pages**: regenerate after editing rooms with `node tools/make-room-pages.mjs`.
