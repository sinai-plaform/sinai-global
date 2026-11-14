// SINAI Global magazine — the site-specific half (config and page chrome). Engine: mag-core.js.
// English lives at the root (/magazine), the other languages under /xx/magazine — same as the rest of sinai-global.com.
// Header, footer, fonts and words come from build/build.mjs (server/mag-chrome.js is generated; run the build after
// changing build/i18n/*.json).
import DATA from './mag-chrome.js';
import { LANGS, RTL, esc, coverOf, fmtDate } from './mag-core.js';

const ORIGIN = 'https://sinai-global.com';
const { V, ridge, chrome } = DATA;
const C = (l) => chrome[l] || chrome.en;
const t = (l) => C(l).t;
const home = (l) => (l === 'en' ? '/' : `/${l}/`);
const SKY = `<div class="sky" aria-hidden="true"><div class="glow"></div><div class="sun"></div><div class="field"><i class="layer far"></i><i class="layer"></i><i class="flow" data-flow="/assets/topo-flow.svg"></i><b class="summit-dot"></b></div></div>${ridge}`;

function page(p) {
  const l = p.lang, c = C(l), cl = p.contentLang || l;
  const twins = (h) => h.replace(/%%TWIN:([a-z]{2})%%/g, (_, x) => p.twin(x));
  const alts = p.alternates.map(([x, href]) => `<link rel="alternate" hreflang="${x}" href="${href}">`).join('\n') + (p.xdefault ? `\n<link rel="alternate" hreflang="x-default" href="${p.xdefault}">` : '');
  return `<!doctype html>
<html lang="${l}" dir="${RTL.has(l) ? 'rtl' : 'ltr'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(p.title)}</title>
<meta name="description" content="${esc(p.desc)}">
<meta name="theme-color" content="#121a24">
<link rel="canonical" href="${p.canonical}">
${alts}
<script src="/assets/lang.js?v=${V}"></script>
<script src="/assets/sg.js?v=${V}" defer></script>
<script src="/assets/flow.js?v=${V}" defer></script>
<meta property="og:type" content="${p.ogType || 'website'}">
<meta property="og:site_name" content="SINAI Global">
<meta property="og:title" content="${esc(p.title)}">
<meta property="og:description" content="${esc(p.desc)}">
<meta property="og:url" content="${p.canonical}">
<meta property="og:locale" content="${chrome[cl] ? chrome[cl].og : c.og}">
<meta property="og:image" content="${esc(p.image)}">
${p.published ? `<meta property="article:published_time" content="${p.published}">` : ''}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${esc(p.image)}">
${p.ld.map((x) => `<script type="application/ld+json">${JSON.stringify(x).replace(/</g, '\\u003c')}</script>`).join('\n')}
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><link rel="icon" type="image/png" sizes="48x48" href="/favicon-48.png"><link rel="icon" type="image/png" sizes="96x96" href="/favicon-96.png"><link rel="icon" type="image/png" sizes="192x192" href="/favicon-192.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${c.font}&display=swap" media="print" onload="this.media='all'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${c.font}&display=swap"></noscript>
<link rel="stylesheet" href="/assets/sg.css?v=${V}">
<link rel="stylesheet" href="/assets/mag.css?v=${V}">
</head>
<body class="mag mag-${p.kind}">
${twins(c.header)}
<main id="main">
${p.body}
  <section class="cta-band" aria-labelledby="cta-h"><div class="field cta-field" aria-hidden="true"><i class="layer far"></i><i class="layer"></i><i class="flow" data-flow="/assets/topo-flow.svg"></i></div><div class="halo" aria-hidden="true"></div><div class="wrap">
    <h2 id="cta-h">${esc(c.cta.h2)}</h2>
    <p>${esc(c.cta.d)}</p>
    <div class="ctas"><a class="btn sun" href="${c.cta.href}">${esc(c.cta.b)}</a></div>
  </div></section>
</main>
${twins(c.footer)}
</body>
</html>
`;
}

const card = (a, l, s, P, h = 'h2') => `<a class="mcard" href="${P.art(l, a.slug)}"><span class="mpic"><img src="${esc(coverOf(site, a, 'card'))}" alt="" loading="lazy" decoding="async" width="640" height="400"><span class="mcat">${esc(s['cat_' + a.category])}</span></span><span class="mbody"><${h}>${esc(a.title)}</${h}><span class="mex">${esc(a.excerpt)}</span><span class="mmeta">${esc(fmtDate(a.published_at, l))} · ${a.read_min} ${esc(s.min)}</span></span></a>`;

function indexBody({ lang: l, t: s, cat, arts, P }) {
  const chip = (k, label) => `<a href="${P.base(l)}${k ? `?cat=${k}` : ''}"${(cat || '') === k ? ' aria-current="true"' : ''}>${esc(label)}</a>`;
  return `  <section class="sol-hero mag-hero" aria-labelledby="h1">
    ${SKY}
    <div class="wrap">
      <p class="mkick"><bdi>SINAI GLOBAL</bdi> · ${esc(s.mag)}</p>
      <h1 id="h1">${esc(s.title)}</h1>
      <p>${esc(s.sub)}</p>
    </div>
  </section>
  <section class="mlist"><div class="wrap">
    <nav class="mchips" aria-label="${esc(s.mag)}">${chip('', s.all)}${site.cats.map((k) => chip(k, s['cat_' + k])).join('')}</nav>
    ${arts.length ? `<div class="mgrid">${arts.map((a) => card(a, l, s, P)).join('')}</div>` : `<p class="mempty">${esc(s.empty)}</p>`}
  </div></section>`;
}

function articleBody({ lang: l, t: s, a, cover, coverSet, more, P, html, date }) {
  return `  <article class="mart" lang="${a.lang}" dir="${RTL.has(a.lang) ? 'rtl' : 'ltr'}"><div class="wrap mnarrow">
    <p class="mcrumb"><a href="${P.base(l)}">${esc(s.mag)}</a> · <a href="${P.base(l)}?cat=${a.category}">${esc(s['cat_' + a.category])}</a></p>
    <h1>${esc(a.title)}</h1>
    <p class="lead">${esc(a.excerpt)}</p>
    <p class="mmeta">${esc(s.by)} ${esc(a.author)} · ${esc(date)} · ${a.read_min} ${esc(s.min)}</p>
    <img class="mcover" src="${esc(cover)}"${coverSet} alt="${esc(a.title)}" width="1600" height="900" fetchpriority="high">
    <div class="prose">${html}</div>
    <aside class="who mauthor"><img src="/assets/founder.webp" alt="" width="72" height="72" loading="lazy"><div><b>${esc(a.author)}</b><p>${esc(s.bio)}</p></div></aside>
  </div></article>
  ${more.length ? `<section class="mmore"><div class="wrap"><h2>${esc(s.more)}</h2><div class="mgrid">${more.map((m) => card(m, l, s, P, 'h3')).join('')}</div><p class="mback"><a class="link" href="${P.base(l)}">${esc(s.back)}</a></p></div></section>` : `<p class="mback wrap"><a class="link" href="${P.base(l)}">${esc(s.back)}</a></p>`}`;
}

function notFound(l, down) {
  const s = t(l), base = (x) => (x === 'en' ? '' : '/' + x) + '/magazine';
  return page({ lang: l, kind: 'none', title: `${s.nf_h} · SINAI Global`, desc: s.nf_p, canonical: ORIGIN + base(l), alternates: [], twin: base, ld: [], image: ORIGIN + '/assets/og/sinai-global.jpg',
    body: `  <section class="sol-hero mag-hero"><div class="wrap"><h1>${esc(down ? s.mag : s.nf_h)}</h1><p>${esc(down ? s.err_p : s.nf_p)}</p><a class="btn sun" href="${base(l)}">${esc(s.back)}</a></div></section>` });
}

export const site = {
  id: 'global', name: 'SINAI Global', origin: ORIGIN, rootLang: 'en', cats: ['ai', 'automation', 'build', 'growth'],
  home, t: (l) => ({ ...t(l), mag_title: t(l).title, mag_sub: t(l).sub }), page, indexBody, articleBody, notFound,
  ogImage: ORIGIN + '/assets/og/sinai-global.jpg', authorUrl: ORIGIN + '/#about',
  publisher: { '@type': 'Organization', '@id': ORIGIN + '/#org', name: 'SINAI Global', url: ORIGIN + '/', logo: { '@type': 'ImageObject', url: ORIGIN + '/assets/og/logo.png' } },
  llmsIntro: 'The magazine of SINAI Global (https://sinai-global.com), a technology company from northern Israel that brings AI into the daily work of businesses. Short, practical guides for business owners: where AI saves time, what software costs, automation, and finding customers. Written by Liran Dandekar, founder of SINAI Global. Published in 10 languages.',
};
