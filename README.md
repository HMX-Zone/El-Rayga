# El Rayga Camp — كامب الرايجه · Dahab

Production web app for **Elrayga Camp** (Peace Rd, Masbat, Dahab, South Sinai — Google 4.6★, 492 reviews):
direct booking for huts, private rooms and hostel beds, with a real database, real availability,
Paymob payments, and 10 languages.

## Stack

- **Next.js 16** (App Router, TypeScript) + **React 19**
- **Supabase** (Postgres) — dedicated project for this site (not shared with any other property)
- **Paymob** — card & mobile-wallet payments (sandbox/mock mode when no keys are configured)
- **next-intl** — 10 languages, locale-prefixed routing, RTL for Arabic & Hebrew
- **GSAP + Lenis** — smooth scroll, scroll-triggered reveals, pinned horizontal stays strip
- Custom **raw-GLSL WebGL** hero (animated Red Sea dusk — sky, mountains, waves, sun path, stars)

## Run locally

```bash
npm install
cp .env.example .env.local   # see below for what goes in it
npm run dev
```

Open **http://localhost:3000/en** (locale prefix is required — middleware redirects `/` to your
browser's preferred language, falling back to `en`).

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | defaults baked in | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | defaults baked in | Supabase publishable key (safe to expose — RLS + SECURITY DEFINER functions guard everything) |
| `ELRAYGA_RPC_SECRET` | **yes**, for payments/iCal | Guards the `elrayga_set_payment` and iCal-sync RPCs. Must match the `rpc_secret` row in the `elrayga_config` table |
| `PAYMOB_API_KEY` / `PAYMOB_INTEGRATION_ID_CARD` / `PAYMOB_INTEGRATION_ID_WALLET` / `PAYMOB_IFRAME_ID` / `PAYMOB_HMAC_SECRET` | no | Real Paymob credentials. Omit all of them to run checkout in **mock/sandbox mode** — the full flow (checkout → webhook → paid) works end-to-end without a Paymob account |
| `CRON_SECRET` | no | If set, the Vercel cron for `/api/cron/ical-import` must send it as a Bearer token |

Copy `.env.local` from the template below (already gitignored):

```
NEXT_PUBLIC_SUPABASE_URL=https://zmcjekcqklzyalzbvusc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
ELRAYGA_RPC_SECRET=...
```

**On Vercel**, add the same variables in Project Settings → Environment Variables. Add the Paymob
keys there whenever the camp gets a real Paymob merchant account — no code changes needed.

## What's inside

| Route | What it is |
|---|---|
| `/{locale}` | Home — WebGL hero, pinned stays strip, live review scores, marquees |
| `/{locale}/stay` | All 8 stays, filterable (huts / private rooms / hostel beds) |
| `/{locale}/stay/{slug}` | Booking page per stay — gallery, specs, **live availability calendar**, real-time pricing |
| `/{locale}/book` | Checkout — guest details, Paymob card / wallet / pay-on-arrival |
| `/{locale}/book/confirmed` | Confirmation — booking ref, WhatsApp handoff to the desk |
| `/{locale}/reviews` | Reviews aggregated from Google, Booking.com, Tripadvisor, Facebook |
| `/{locale}/experiences`, `/about`, `/contact` | Content pages, WhatsApp-drafting contact form |
| `/api/availability` | Real per-day availability from the DB |
| `/api/bookings` | Creates a booking (server-validated: dates, conflicts, pricing) |
| `/api/paymob/checkout` *(via `/api/bookings`)*, `/api/paymob/webhook`, `/api/paymob/mock` | Payment flow + sandbox fallback |
| `/api/ical/{slug}` | iCal export per room (import into Booking.com/Airbnb to block double-booking) |
| `/api/cron/ical-import` | Hourly Vercel cron — imports OTA iCal feeds into local blocked dates |

Locales: `en ar ru de fr it es pl zh he` — Arabic and Hebrew render full RTL automatically
(`dir="rtl"` cascades through logical CSS properties, no separate stylesheet).

## Database

Schema lives in `supabase/migrations/`. Apply with the Supabase CLI or MCP:

```
0001_elrayga_init.sql      — rooms, bookings, blocked_dates, ical_feeds, reviews, config + RPCs
0002_elrayga_ical_rpcs.sql — secret-guarded RPCs for the iCal-import cron
```

Everything sensitive (booking creation, payment status, availability writes) goes through
`SECURITY DEFINER` Postgres functions — the tables themselves aren't writable by the anon key.
Rooms and reviews are public-read only.

To add a room: insert into `elrayga_rooms`, then add `rooms.<slug>.*` and `features.*` entries to
every file in `messages/`. To add a language: drop in `messages/<code>.json` (English is the
fallback for any missing key — see `i18n/request.ts`) and add the locale to `lib/locales.ts`.

## Payments

`lib/paymob.ts` implements the full Paymob Accept flow (auth → order → payment key → iframe
redirect) plus HMAC-verified webhook handling. Without `PAYMOB_API_KEY` set, checkout redirects to
an in-app **sandbox page** (`/api/paymob/mock`) that completes the same booking → paid transition
via a signed callback — so the entire flow is testable before the camp has a live merchant account.

## Images

Room "photos" are currently generative SVG illustrations (`/public/images/rooms/<slug>/*.svg`),
one per room in its own palette — used as an honest placeholder since this build environment could
not reach external image hosts (Google/Booking.com/Airbnb) to pull real listing photos. To swap in
real photos: drop files into `public/images/rooms/<slug>/` and update the `photos` column for that
room in `elrayga_rooms` (JSON array of paths).

## Notes

- Prices are indicative, taken from public OTA listings; edit `elrayga_rooms.base_price`.
- This app was built and network-tested from an environment with restricted outbound access
  (only specific hosts allowlisted). `npm run build` and `next lint` pass cleanly; full live
  click-through testing against Supabase/Paymob should happen in Vercel Preview or with a
  developer machine that has normal internet access.
