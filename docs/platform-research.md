# Platform research — copy refresh, 12 Oct 2026

Source of truth for the four platform cards on sinai-global.com. Every capability below was checked in the
app's code (file or commit named as evidence). Anything not verified is listed under "Not claimed".
Rule for future edits: a feature goes on the hub only after it is found in code; roadmap items stay off or
are marked "coming soon".

---

## 1. JaSale — field-sales app (Live, jasale.app)

**Who it's for:** companies that sell through field agents (distributors, wholesalers), their agents,
sales managers, back office, drivers and warehouse staff. First customer: a medical-supplies distributor
(pharmacies, dental, orthopedic) whose agents worked from PDF catalogs.

**Status:** live and in daily use; app version `APP_VERSION='2026-10-12-83'` (v83) in
`~/Code/liberty-deploy/app/index.html`. Single-file PWA on Supabase/PostgreSQL.

**Standout capabilities (verified):**
1. **Weekly plan + daily route.** Sunday plan suggestion, collections first, customers visited or ordered in
   the last 14 days skipped (commits v73 `35e490a`, v81 `e38d1a4`); route with Waze and Google Maps deep
   links, calendar week view with geo-conflicts (v70 `14cba0c`, v75 `a707d66`).
2. **Order builder** with product photos, per-customer-type catalogs, step-based and mix-and-match bonuses
   (`bonusInfo`), VAT, commission on house brands only; order sent to the office by `mailto:` + `wa.me` in one
   tap, PDF for the customer (`docToPdf`, `sharePdf`).
3. **Collections per invoice.** Payments allocated to specific open invoices/orders (`loadOpenInvoices`,
   `oiApplyAllocs`, `allocsByPayment`), payment method + photo of check/receipt; monthly aging PDF import
   (`impParseAgingPdf`).
4. **Offline-first.** IndexedDB outbox with reconnect and backup (`outboxView`, v73 commit), service worker.
5. **Roles beyond the agent:** manager, office, driver (`driverHomeView`, `driverRouteView`), warehouse
   (`pickView`, `stockView`); manager logistics and dispatch board (`logisticsView`, `dispatchView`).
6. **Smart follow-up:** automatic customer grade (`custGrade`, `gradeBadge`), 14-day follow-up after a visit
   with no sale (`createNoSaleFollowup`), potential-customer discovery from OpenStreetMap (`overpassQuery`).
7. **Live stock, sales competitions and announcements** (v79 `d7df459`).
8. **Five languages** (he, en, ru, ar, es): 1,891 UI strings, RTL/LTR aware (v83 `c923d91`).

**What's different:** built from a ride-along with a real agent, so the logic follows the field (who owes
money, who was seen recently, which bonus step applies) rather than a generic CRM pipeline. Works with no
signal. One app covers agent, manager, office, driver and warehouse.

**Not claimed:** accounting-system receipts (the JaSale site itself marks it "coming soon"), automatic Gmail
send, Google Calendar sync. Note: the local repo has only 20 commits (shallow history); v83 comes from
`APP_VERSION` and commit messages, not from counting commits.

---

## 2. SINAI Club — youth football coaching (Live, sinaiclub.com)

**Who it's for:** youth football coaches, assistants and club managers, plus parents and players (own
views). Built by a coach of kindergarten to 7th-grade teams.

**Status:** live, app v2.7.0 (`5ef84f9`), PWA in `~/Code/sinai-club/app/`, own Supabase project.

**Standout capabilities (verified):**
1. **Program builder** with auto-build and a "focused" mode: one theme over N weeks in phases
   (introduce, practise, apply in game, test) (`program.js`, commit `c7b9451`).
2. **Drill library of 66 drills** by age with La Masia-based descriptions (`drills.js`), tactics board
   (`board.js`), animated drill demos with video export (`anim.js`).
3. **Voice notes:** hold the mic, speak, and the note becomes ratings, discipline marks or notes for the right
   players; foot-specific notes checked against the player's real foot; offline queue; screen kept awake
   (`voice.js`, `wakeLock`, commit `b43e4f0`; transcription via Groq whisper with OpenAI fallback, `699a6b5`).
4. **Football Manager-style 1–20 player card** (technical/mental/physical/GK, preferred and weak foot);
   scoring v2 is weighted, decaying and shrunk toward the player's level (2.5.0 `39e30a7`).
5. **Quick notes and quick rounds** during sessions (grouped, multi-tap, undo) (2.4.0 `b8344e2`).
6. **End-of-session match:** split auto-balanced by player scores (`splitAuto` in `screens2.js`) or manual,
   in-match notes (`beginMatch`, `matchTap`).
7. **Offline on the pitch:** service worker, saved data, outbox with tablet-side ids (`offline.js`, `7926a2a`).
8. **Family accounts:** one login for everyone (phone + password after SMS), parent creates the child account,
   video-consent toggle (`family.js`, `a69378f`); roster import from Excel/Sheets/PDF/photo (`roster.js`).
   Five languages (2.7.0).

**What's different:** rating happens during practice by tap or voice, and the card is built from many small
observations instead of a one-off evaluation. Designed for weak tablets, offline on the pitch.

**Not claimed (planned; the SINAI Club site marks these "בתכנון"):** XP, home and friend video challenges,
club registration and payment, cross-team comparison. The previous hub bullet "Home challenges with levels
and XP" was wrong and has been removed. Dropout alerts appear on the marketing site but were not clearly found
in code, so they are not on the hub.

---

## 3. Downline HQ — CRM + network for direct-sales distributors (In development, downlinehq.app)

**Who it's for:** independent distributors in direct-sales companies, their uplines and the network owner.

**Status:** in development. Admin is deployed on the sinai-lifestyle Vercel project (downlinehq.app routes
to `/admin`, commit `215b558`) and used inside our own bHIP network (distributor pages such as `/mendel`,
`lib/distributors.ts`), but not offered to outside networks yet. Pill stays "In development".

**Standout capabilities (verified):**
1. **Network tree with subtree access:** ltree paths; owner sees the whole network, everyone else only self
   and subtree (`lib/network.ts`: `path=cd.`, `startsWith(viewer.path + ".")`).
2. **Owner-controlled permissions:** distributors edit only `SELF_EDITABLE` fields (name, bio, photo,
   contact, payment methods); price, sponsor, products and permissions are owner/upline only; the owner can
   lock fields network-wide (`NetworkSettings.locked`, `2cb71ab`).
3. **Personal sales page per distributor** (`app/[distributor]/page.tsx`) with their photo, contact and
   payment methods, and a product chat (`/api/chat`, Anthropic SDK) that answers in the distributor's name.
4. **Lead CRM:** statuses, search, filters, CSV export (`/admin/leads`), lead page with orders and
   reminders, duplicate check (`recentTwin`), import from CSV/XLSX/pasted list/Google Sheets link
   (`lib/import.ts`, `352d1c8`, `0db05f0`).
5. **Orders and tasks** (`/admin/orders`, `/admin/tasks`, `lib/crm.ts`).
6. **Channel click tracking:** UTM source/medium/campaign per account (`/admin/channels`, `/api/track`).
7. **Media library** of raw product assets with sales points (`/admin/media`, `91e6ed2`).
8. **Admin in 9 languages** (he, en, ar, ru, fr, es, ro, th, hi; `lib/i18n/locales.ts`); Google sign-in bound
   to existing distributor emails (`831b66b`).

**What's different:** built from inside a working distributor network, around the rule that each person
controls only their own page while the owner keeps prices, products and permissions.

**Not claimed:** AI video studio for distributors, multi-company use at scale, automatic customer messaging
(out of scope by decision).

---

## 4. SINAI Cinema — streaming platform + studio (Coming soon, sinaicinema.com)

**Who it's for:** viewers of independent films and series (free to watch), creators who publish finished
work, and our own production of the series *Blood, Sand and Faith* (BSF).

**Status:** pre-launch. `origin/main` of `~/Code/sinai-platform` has a pre-launch allowlist gate
(`7711b37`, 12 Oct 2026): only approved accounts see the platform. Pill stays "Coming soon".
(The local checkout is on the old branch `feat/narration-at-upload`; facts below were read from
`origin/main`.)

**Standout capabilities (verified on origin/main):**
1. **AI review before publishing:** per-episode Gemini video analysis; the episode is cleared to publish
   (`qa_status='analyzed'`) or failed, with an appeal route (`lib/qa/episode-analysis.ts`,
   `app/api/qa/appeal`). Matches the coming-soon copy "every film is scanned and analysed".
2. **Captions:** AssemblyAI transcription and translation into 36 locales, run as an Inngest workflow
   (`app/api/cron/process-captions`), with a captions editor in the studio.
3. **Dubbing:** ElevenLabs dubbing into target languages from the studio (`app/api/dubbing/*`,
   `dub-panel.tsx`).
4. **Platform UI in 63 languages** (`apps/web/lib/i18n/locales/`, 63 files).
5. **Three formats:** Features, Short Films, Micros (coming-soon strings `soon.tile.*`).
6. **Creator terms published:** `/earn`, tips paid in the sender's currency (`467a709`), founding-creator
   terms (`751e66a`).
7. **Pre-launch funnel:** viewer and creator tracks, 6-digit email confirmation, confirmed-referral unlock
   (`920f84d`).

**What's different:** a quality gate (AI analysis) on every upload instead of an open feed.

**Not claimed (verified NOT live):** in-platform video generation (never ran in production; BytePlus
adapter only on an unmerged branch), auto-trailers (kill switch `0e11f92`; trailer cutting on the render
worker exists, `3e11c31`, but is not a public feature), memberships and Stripe payouts (schema only),
"develop an idea with AI" (pending verification).

---

## Hub changes made from this research
- New tag, paragraph and 4 bullets per card in en/he/ru/ar/es; the SINAI Cinema card gained a bullet list.
- JaSale users: "Agents, managers, office, drivers, warehouse".
- "How we build" step 4: "JaSale is at version 83" (was "past its 80th version").
- Status pills unchanged: JaSale Live, SINAI Club Live, Downline HQ In development, SINAI Cinema Coming soon.

## Hub v3 (13 Oct 2026): JaSale and SINAI Club cards, re-verified in code
JaSale (`~/Code/liberty-deploy/app/index.html`):
- Weekly plan: `wpSuggest` > `wpPool` > `wpScore` > `routeScore`. Score uses open debt (`debt_agorot`, extra weight
  when older than 90 days via `collAge`), days since last visit and last order (`_ltMap`, order 45+ days),
  visit cadence from the customer grade (`custCadence`, `CAD_GRADE` green 14 / yellow 21 / orange+new 30 /
  potential 45 / gray 56, or a per-customer `visit_frequency_days`), due follow-ups, missed visits, no-sale
  follow-ups, neglected areas. `WP_RECENT_DAYS=14` keeps customers visited or ordered in the last 14 days out.
- Each day: one area (`wpDayAreas`), nearby customers first (`wpPickDay`), stops ordered nearest-neighbour from
  the start point (`wpOrder` > `nnOrder`); Waze / Google Maps links.
- Grade (`custGrade`) is read from the customer record; the client does not compute it. Not claimed: how it is
  calculated. "Buying rhythm" is NOT claimed; the rhythm is a visit cadence.
- Manager: `mgrHomeView` (team today: visits, orders, amount, collected; missed visits; debt >90 days; agents
  this month), `wkPlansView` (approve or return a weekly plan with a note), `targetsView` (commission tiers,
  pace forecast for month end), competitions with a board (`annBoard`, `liberty_competition_board`),
  `stockView` (real-time quantities), `dispatchView` (truck or courier).
- Version number removed from all copy.
SINAI Club (`~/Code/sinai-club/app/program.js`):
- `autoPlanSheet` / `generateProgram`: season mode (theme per week from `THEME_SEQ` by age) or focus mode (one
  theme over N weeks, `BLOCK_PHASES` introduce > practise > apply in game > test in game).
- `buildSession`: per-age skeleton (`SLOTS`: warm-up, rondo/technique, development, application, game,
  cool-down), drill choice by theme keywords with recently used drills penalised (`pickDrill`), a prevention
  warm-up in the first session of each week ("FIFA 11+ style").
- Coaching range now stated as kindergarten to 10th grade (founder update); app age profiles are
  `גן–ב׳ / ג׳–ד׳ / ה׳–ז׳ / ח׳ ומעלה` (`drills.js`).
