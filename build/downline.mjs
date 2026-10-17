// Downline HQ page (/downline-hq/ + 9 language twins, Hindi included) — generated from
// build/downline-i18n/<lang>.json. Edit the JSON, run `node build/downline.mjs`, commit the HTML.
// Styles: assets/downline/downline.css. The logo intro is inline (≤1.5s, once per session, skippable,
// off for reduced motion, CSS-only so it never delays the page).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://sinai-global.com';
const LANGS = ['he', 'en', 'ru', 'ar', 'es', 'de', 'it', 'fr', 'pt', 'hi'];
const RTL = new Set(['he', 'ar']);
const LEGACY = new Set(['he', 'en', 'ru', 'ar', 'es', 'de', 'it', 'fr', 'pt']); // languages with privacy/terms twins
const OG_LOCALE = { he: 'he_IL', en: 'en_US', ru: 'ru_RU', ar: 'ar_AR', es: 'es_ES', de: 'de_DE', it: 'it_IT', fr: 'fr_FR', pt: 'pt_BR', hi: 'hi_IN' };
const CG = 'family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400';
const FONTS = {
  he: `${CG}&family=Frank+Ruhl+Libre:wght@300;400;500;700&family=Assistant:wght@400;500;600`,
  ar: `${CG}&family=Amiri:wght@400;700&family=IBM+Plex+Sans+Arabic:wght@300;400;500;700`,
  hi: `${CG}&family=Mukta:wght@300;400;500;600`,
};
const V = '202610170900';
const T = Object.fromEntries(LANGS.map((l) => [l, JSON.parse(fs.readFileSync(path.join(ROOT, 'build/downline-i18n', l + '.json'), 'utf8'))]));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pre = (l) => (l === 'en' ? '' : '/' + l);
const page = (l) => pre(l) + '/downline-hq/';
const home = (l) => pre(l) + '/';
const legal = (l, p) => (LEGACY.has(l) ? pre(l) : '') + p;

const intro = (l) => `<style>#dl-intro{display:none}html.dl-intro-on #dl-intro{display:flex;position:fixed;inset:0;z-index:2147483000;background:#0E1316;align-items:center;justify-content:center;flex-direction:column;cursor:pointer}html.dl-intro-on.dl-intro-out #dl-intro{opacity:0;transition:opacity .25s ease}#dl-intro img{width:min(300px,62vw);height:auto;opacity:0;transform:scale(.9);animation:dl-in .62s cubic-bezier(.22,1,.36,1) .08s forwards}#dl-intro i{display:block;margin-top:18px;height:1px;width:0;background:#C9A96A;animation:dl-bar .5s cubic-bezier(.22,1,.36,1) .55s forwards}@keyframes dl-in{to{opacity:1;transform:scale(1)}}@keyframes dl-bar{to{width:min(220px,46vw)}}@media (prefers-reduced-motion:reduce){html.dl-intro-on #dl-intro{display:none}}</style>
<script>(function(){try{var k='sg_intro_downline';if(sessionStorage.getItem(k))return;sessionStorage.setItem(k,'1');if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;var d=document.documentElement;d.classList.add('dl-intro-on');var done=function(){d.classList.add('dl-intro-out');setTimeout(function(){d.classList.remove('dl-intro-on','dl-intro-out')},260)};var t=setTimeout(done,1240);var skip=function(){clearTimeout(t);done()};addEventListener('keydown',skip,{once:true});addEventListener('click',function(e){var o=document.getElementById('dl-intro');if(o&&o.contains(e.target))skip()})}catch(e){}})();</script>`;

function render(l) {
  const t = T[l];
  const dir = RTL.has(l) ? 'rtl' : 'ltr';
  const langLinks = LANGS.map((x) => `<a href="${page(x)}" data-setlang="${x}" lang="${x}"${x === l ? ' aria-current="true"' : ''}>${esc(T[x].langName)}</a>`).join('');
  const footLangs = LANGS.map((x) => (x === l ? `<span aria-current="true" lang="${x}">${esc(T[x].langName)}</span>` : `<a href="${page(x)}" data-setlang="${x}" lang="${x}">${esc(T[x].langName)}</a>`)).join(' · ');
  const cards = (arr, cls) => `<div class="${cls}">\n${arr.map((f) => `      <div><h3>${esc(f.h)}</h3><p>${esc(f.p)}</p></div>`).join('\n')}\n    </div>`;
  return `<!doctype html>
<html lang="${l}" dir="${dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(t.title)}</title>
<meta name="description" content="${esc(t.description)}">
${LANGS.map((x) => `<link rel="alternate" hreflang="${x}" href="${SITE}${page(x)}">`).join('\n')}
<link rel="alternate" hreflang="x-default" href="${SITE}/downline-hq/">
<script src="/assets/lang.js?v=202610151600"></script>
${intro(l)}
<meta property="og:title" content="Downline HQ">
<meta property="og:description" content="${esc(t.ogDesc)}">
<meta property="og:url" content="${SITE}${page(l)}">
<link rel="canonical" href="${SITE}${page(l)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Downline HQ">
<meta property="og:locale" content="${OG_LOCALE[l]}">
<meta property="og:image" content="${SITE}/assets/og/downline-hq.jpg">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Downline HQ by SINAI Global">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${SITE}/assets/og/downline-hq.jpg">
<link rel="icon" href="/assets/downline/favicon.svg" type="image/svg+xml">
<meta name="theme-color" content="#0E1316">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${FONTS[l] ?? `${CG}&family=Jost:wght@300;400;500`}&display=swap">
<link rel="stylesheet" href="/assets/downline/downline.css?v=${V}">
</head>
<body>
<div id="dl-intro" aria-hidden="true"><img src="/assets/downline/logo-wordmark.svg" alt="" width="288" height="64"><i></i></div>
<div class="wrap">
  <header class="bar">
    <div class="brand" dir="ltr">
      <a class="logo" href="${page(l)}" aria-label="${esc(t.homeAria)}"><img src="/assets/downline/logo-wordmark.svg" alt="Downline HQ" width="288" height="64"></a>
      <a class="by" href="${home(l)}" lang="${l}" dir="auto">${esc(t.byline)}</a>
    </div>
    <nav aria-label="${esc(t.navLabel)}"><a href="#features">${esc(t.navFeatures)}</a><a href="#faq">${esc(t.navFaq)}</a><a href="#early">${esc(t.navEarly)}</a><details class="lng"><summary aria-label="${esc(t.langLabel)}: ${esc(t.langName)}"><svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.5"/><path d="M1.5 8h13M8 1.5c2 2 2.8 4 2.8 6.5S10 12.5 8 14.5M8 1.5C6 3.5 5.2 5.5 5.2 8S6 12.5 8 14.5"/></svg>${esc(t.langName)}</summary><div class="lng-list">${langLinks}</div></details></nav>
  </header>

  <div class="hero">
    <div>
      <div class="eyebrow">${esc(t.eyebrow)}</div>
      <h1>${esc(t.h1a)} <em>${esc(t.h1b)}</em></h1>
      <p>${esc(t.heroP)}</p>
      <div class="stats"><a class="btn" href="#early">${esc(t.heroCta)}</a></div>
    </div>
    <div class="netcore">
  <svg class="tree" viewBox="0 0 300 220" role="img" aria-label="${esc(t.treeAria)}" dir="ltr">
        <line x1="150" y1="46" x2="80" y2="100"/><line x1="150" y1="46" x2="220" y2="100"/>
        <line x1="80" y1="124" x2="40" y2="170"/><line x1="80" y1="124" x2="100" y2="170"/>
        <line x1="220" y1="124" x2="170" y2="170"/><line x1="220" y1="124" x2="220" y2="170"/><line x1="220" y1="124" x2="270" y2="170"/>
        <rect class="me" x="80" y="20" width="140" height="26" rx="5"/><text x="150" y="37" text-anchor="middle" direction="${dir}">${esc(t.tLeader)}</text>
        <rect x="22" y="100" width="116" height="24" rx="5"/><text x="80" y="116" text-anchor="middle" direction="${dir}">${esc(t.tTeam)}</text>
        <rect x="162" y="100" width="116" height="24" rx="5"/><text x="220" y="116" text-anchor="middle" direction="${dir}">${esc(t.tTeam)}</text>
        <rect x="18" y="170" width="44" height="22" rx="5"/><rect x="78" y="170" width="44" height="22" rx="5"/>
        <rect x="148" y="170" width="44" height="22" rx="5"/><rect x="198" y="170" width="44" height="22" rx="5"/><rect x="248" y="170" width="44" height="22" rx="5"/>
        <text x="150" y="214" text-anchor="middle" direction="${dir}">${esc(t.tCaption)}</text>
      </svg>
    </div>
  </div>

  <section id="features">
    <div class="sec-head"><h2>${esc(t.featH2)}</h2><span class="eyebrow">${esc(t.featEyebrow)}</span></div>
    ${cards(t.feats, 'feats')}
  </section>

  <section id="how">
    <div class="sec-head"><h2>${esc(t.howH2)}</h2></div>
    ${cards(t.how, 'method')}
  </section>

  <section id="faq" class="faq">
    <div class="sec-head"><h2>${esc(t.faqH2)}</h2></div>
${t.faq.map((f, i) => `    <details${i === 0 ? ' open' : ''}><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('\n')}
  </section>

  <section id="early">
    <div class="grid2">
      <div>
        <div class="eyebrow">${esc(t.earlyEyebrow)}</div>
        <h2>${esc(t.earlyH2)}</h2>
        <p>${esc(t.earlyP)}</p>
      </div>
      <div class="card">
        <div class="line"><span class="val" id="email">hello@downlinehq.app</span><button class="btn small" type="button" data-copy="email" data-done="${esc(t.copied)}">${esc(t.copy)}</button></div>
        <div class="line"><span class="val" id="phone">050-776-3923</span><button class="btn small" type="button" data-copy="phone" data-done="${esc(t.copied)}">${esc(t.copy)}</button></div>
        <a class="btn" href="mailto:hello@downlinehq.app?subject=${encodeURIComponent(t.mailSubject)}">${esc(t.sendMail)}</a>
      </div>
    </div>
  </section>

  <footer><span>${esc(t.footerPlatform)} <a href="${home(l)}">SINAI Global</a><span class="legal"> · <a href="${legal(l, '/privacy/')}">${esc(t.privacy)}</a> · <a href="${legal(l, '/terms/')}">${esc(t.terms)}</a></span></span><span class="foot-lng" aria-label="${esc(t.langLabel)}">${footLangs}</span></footer>
</div>
</body>
</html>
`;
}

for (const l of LANGS) {
  const dir = path.join(ROOT, l === 'en' ? '' : l, 'downline-hq');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), render(l));
}
console.log(`downline-hq: ${LANGS.length} pages`);
