# SINAI Global — sinai-global.com
Static site on GitHub Pages. English at `/`, other languages at `/<lang>/` (he, ru, ar, es, de, it, fr, pt, hi). `assets/lang.js` sends visitors in Israel (timezone or Hebrew browser) to Hebrew and everyone else to English; the language link saves the choice (`localStorage sg-lang`, same key as jasale.app and sinaiclub.com).

## Generated pages
The home page and the solutions page (custom development + pricing) in all 10 languages are generated:

    node build/build.mjs

Copy lives in `build/i18n/<lang>.json` (one file per language, same keys). Edit the JSON, run the build, commit the generated HTML. The build also writes `sitemap.xml`.

- Styles and script: `assets/sg.css`, `assets/sg.js` (currency, phone screens, menu, brand intro, business form).
- Prices: fixed per currency in `assets/sg.js` (`PRICES`) — keep `PRICES` in `build/build.mjs` (ILS/USD first paint) in sync. Default ₪ in Israel, $ elsewhere; the choice is saved in `localStorage sg-cur`.
- Brand intro (logo A, peak + sun): home page only, max 1.5s, once per browser session, skippable, never with reduced motion.

## Hand-written pages
`/downline-hq/`, `/privacy/`, `/terms/` (+ 8 language twins, no Hindi yet) use `assets/site.css`.
