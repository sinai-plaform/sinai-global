// SINAI magazine — shared engine for the static SINAI sites on Cloudflare Pages (sinaiclub.com, sinai-global.com).
// The same file lives in both repos (server/mag-core.js); the site-specific part is server/mag-site.js.
// Articles are rows in public.magazine_articles (Supabase ooxdupeihzvbzudibaoi, column `site`), written by the weekly
// scheduled task and published by the DB job magazine_publish_due (pg_cron). Pages are rendered on request by the
// Pages Functions in functions/ and kept 10 minutes in Cloudflare's cache, so a new article needs no deploy.
export const LANGS = ['he', 'en', 'ru', 'ar', 'es', 'de', 'it', 'fr', 'pt', 'hi'];
export const RTL = new Set(['he', 'ar']);
const SB = 'https://ooxdupeihzvbzudibaoi.supabase.co/rest/v1/';
let DB = SB; // local trial only: wrangler pages dev --binding MAG_DB=http://localhost:8795/ (see _tools/magazine/mock-db.mjs)
const KEY = 'sb_publishable_ZnDL8YTqC6I-NGAQcTdOGQ_biIvDUSb'; // publishable key; RLS lets it read published rows only
const TTL = 600;
const LIST = 'slug,lang,category,title,excerpt,cover,published_at,read_min';
const FULL = LIST + ',body_md,author,seo_title,seo_description,updated_at';

export const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

async function rows(q) {
  const res = await fetch(DB + q, { headers: { apikey: KEY, Authorization: 'Bearer ' + KEY, Accept: 'application/json' }, signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error('magazine db ' + res.status);
  return res.json();
}

// --- tiny markdown → HTML (headings, paragraphs, bold/italic, links, lists, blockquotes); no raw HTML passes through
function inline(s) {
  return esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*(?!\*)(.+?)\*(?!\*)/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/[^)\s]*)\)/g, '<a href="$2">$1</a>');
}
export function mdToHtml(md) {
  const out = [], lines = String(md || '').replace(/\r/g, '').split('\n');
  const block = /^(#{1,4}\s|>\s?|\s*[-*]\s+|\s*\d+[.)]\s+)/;
  let i = 0;
  while (i < lines.length) {
    const l = lines[i];
    if (!l.trim()) { i++; continue; }
    const h = l.match(/^(#{1,4})\s+(.*)$/);
    if (h) { const n = Math.max(2, h[1].length); out.push(`<h${n}>${inline(h[2])}</h${n}>`); i++; continue; }
    if (/^>\s?/.test(l)) { const q = []; while (i < lines.length && /^>\s?/.test(lines[i])) q.push(lines[i++].replace(/^>\s?/, '')); out.push(`<blockquote>${inline(q.join(' '))}</blockquote>`); continue; }
    if (/^\s*[-*]\s+/.test(l)) { const it = []; while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) it.push(lines[i++].replace(/^\s*[-*]\s+/, '')); out.push(`<ul>${it.map((x) => `<li>${inline(x)}</li>`).join('')}</ul>`); continue; }
    if (/^\s*\d+[.)]\s+/.test(l)) { const it = []; while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) it.push(lines[i++].replace(/^\s*\d+[.)]\s+/, '')); out.push(`<ol>${it.map((x) => `<li>${inline(x)}</li>`).join('')}</ol>`); continue; }
    const p = [];
    while (i < lines.length && lines[i].trim() && !block.test(lines[i])) p.push(lines[i++]);
    out.push(`<p>${inline(p.join(' '))}</p>`);
  }
  return out.join('\n');
}

/** Everything a site needs to build links. `site` = { id, origin, rootLang, cats, ... } from mag-site.js */
export function paths(site) {
  const base = (l) => (l === site.rootLang ? '' : '/' + l) + '/magazine';
  return { base, art: (l, slug) => base(l) + '/' + slug, abs: (p) => site.origin + p };
}
export const fmtDate = (iso, l, style = 'medium') => {
  try { return iso ? new Intl.DateTimeFormat(l === 'he' ? 'he-IL' : l === 'hi' ? 'hi-IN' : l, { dateStyle: style, timeZone: 'Asia/Jerusalem' }).format(new Date(iso)) : ''; } catch { return ''; }
};
/** Every article shows a picture: its own cover, else the site's branded default.
 *  Covers are stored light, in three files (edge function magazine-cover): <slug>-1600.webp (the `cover` column),
 *  <slug>-800.webp for cards and phones, <slug>-1200.jpg for link previews. `kind`: 'full' | 'card' | 'share'. */
const SIZED = /-1600\.webp(?=\?|$)/;
export const coverOf = (site, a, kind = 'full') => {
  if (!a.cover) return `${site.origin}/assets/magazine/cover-default.jpg`;
  if (!SIZED.test(a.cover)) return a.cover; // an older or un-resized picture: one file for everything
  return kind === 'card' ? a.cover.replace(SIZED, '-800.webp') : kind === 'share' ? a.cover.replace(SIZED, '-1200.jpg') : a.cover;
};
/** srcset + sizes for the article picture, so a phone downloads the 800px file. Empty when there is only one file. */
export const coverSet = (site, a) => (a.cover && SIZED.test(a.cover) ? ` srcset="${esc(coverOf(site, a, 'card'))} 800w, ${esc(a.cover)} 1600w" sizes="(max-width: 860px) 100vw, 800px"` : '');

async function list(site, lang, cat, limit = 60) {
  const q = (l) => `magazine_articles?site=eq.${site.id}&status=eq.published&lang=eq.${l}${cat ? `&category=eq.${cat}` : ''}&select=${LIST}&order=published_at.desc&limit=${limit}`;
  let r = await rows(q(lang));
  if (!r.length && lang !== 'en') r = await rows(q('en'));
  if (!r.length && lang !== 'he') r = await rows(q('he'));
  return r;
}

const CC = { 'Cache-Control': `public, max-age=300, s-maxage=${TTL}` };
const html = (body, status = 200, extra = CC) => new Response(body, { status, headers: { 'Content-Type': 'text/html; charset=utf-8', ...extra } });

export async function indexPage(site, lang, url, load = list) {
  const P = paths(site), t = site.t(lang);
  const c = url.searchParams.get('cat');
  const cat = site.cats.includes(c) ? c : null;
  const arts = await load(site, lang, cat);
  const body = site.indexBody({ lang, t, cat, arts, P });
  return html(site.page({
    lang, kind: 'index', title: `${t.mag_title} · ${site.name}`, desc: t.mag_sub,
    canonical: P.abs(P.base(lang)), alternates: LANGS.map((l) => [l, P.abs(P.base(l))]), xdefault: P.abs(P.base('en')),
    twin: (l) => P.base(l) + (cat ? `?cat=${cat}` : ''),
    ld: [{ '@context': 'https://schema.org', '@type': 'Blog', name: `${site.name} — ${t.mag}`, url: P.abs(P.base(lang)), inLanguage: lang, description: t.mag_sub, publisher: site.publisher }],
    image: arts[0] ? coverOf(site, arts[0], 'share') : site.ogImage, body,
  }));
}

/** `all` = every published language row of one slug; `more` = other articles of the same category. */
export function renderArticle(site, lang, all, more) {
  const P = paths(site);
  const a = all.find((x) => x.lang === lang) || all.find((x) => x.lang === 'en') || all.find((x) => x.lang === 'he') || all[0];
  const t = site.t(lang), langs = LANGS.filter((l) => all.some((x) => x.lang === l));
  const canonical = P.abs(P.art(a.lang, a.slug)), cover = coverOf(site, a);
  const ld = [
    { '@context': 'https://schema.org', '@type': 'Article', headline: a.title, description: a.excerpt, image: cover, datePublished: a.published_at, dateModified: a.updated_at || a.published_at, inLanguage: a.lang, articleSection: site.t('en')['cat_' + a.category], mainEntityOfPage: canonical, author: { '@type': 'Person', name: a.author, url: site.authorUrl }, publisher: site.publisher },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: site.name, item: site.origin + site.home(lang) },
      { '@type': 'ListItem', position: 2, name: t.mag, item: P.abs(P.base(lang)) },
      { '@type': 'ListItem', position: 3, name: a.title, item: canonical }] },
  ];
  const body = site.articleBody({ lang, t, a, cover, coverSet: coverSet(site, a), more: more.filter((x) => x.slug !== a.slug).slice(0, 3), P, html: mdToHtml(a.body_md), date: fmtDate(a.published_at, lang, 'long') });
  return site.page({
    lang, kind: 'article', contentLang: a.lang, title: `${a.seo_title || a.title} · ${site.name}`, desc: a.seo_description || a.excerpt,
    canonical, alternates: langs.map((l) => [l, P.abs(P.art(l, a.slug))]), xdefault: langs.includes('en') ? P.abs(P.art('en', a.slug)) : null,
    twin: (l) => (langs.includes(l) ? P.art(l, a.slug) : P.base(l)),
    ld, image: coverOf(site, a, 'share'), ogType: 'article', published: a.published_at, body,
  });
}

async function articlePage(site, lang, slug) {
  if (!/^[a-z0-9][a-z0-9-]{1,80}$/.test(slug)) return null;
  const all = await rows(`magazine_articles?site=eq.${site.id}&status=eq.published&slug=eq.${slug}&select=${FULL}&limit=12`);
  if (!all.length) return null;
  return html(renderArticle(site, lang, all, await list(site, lang, all[0].category, 4)));
}

async function sitemap(site) {
  const P = paths(site);
  const all = await rows(`magazine_articles?site=eq.${site.id}&status=eq.published&select=slug,lang,published_at&order=published_at.desc&limit=5000`);
  const by = new Map();
  for (const a of all) { const e = by.get(a.slug) || { langs: [], mod: a.published_at }; e.langs.push(a.lang); by.set(a.slug, e); }
  const one = (path, langs, mod, pri) => langs.map((l) => `<url><loc>${P.abs(path(l))}</loc>${mod ? `<lastmod>${mod.slice(0, 10)}</lastmod>` : ''}<priority>${pri}</priority>${langs.map((x) => `<xhtml:link rel="alternate" hreflang="${x}" href="${P.abs(path(x))}"/>`).join('')}${langs.includes('en') ? `<xhtml:link rel="alternate" hreflang="x-default" href="${P.abs(path('en'))}"/>` : ''}</url>`).join('');
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${one(P.base, LANGS, all[0]?.published_at, '0.9')}${[...by].map(([slug, e]) => one((l) => P.art(l, slug), LANGS.filter((l) => e.langs.includes(l)), e.mod, '0.8')).join('')}</urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8', ...CC } });
}

async function llms(site) {
  const P = paths(site);
  const en = await rows(`magazine_articles?site=eq.${site.id}&status=eq.published&lang=eq.en&select=slug,title,excerpt&order=published_at.desc&limit=500`);
  const txt = [`# ${site.name} — Magazine`, '', '> ' + site.llmsIntro, '',
    '## Articles', 'English links below; the same article exists in he, ru, ar, es, de, it, fr, pt and hi — see the hreflang links on each page.',
    ...en.map((a) => `- [${a.title}](${P.abs(P.art('en', a.slug))}): ${a.excerpt}`), '',
    '## More', `- [Magazine](${P.abs(P.base('en'))})`, `- [${site.name}](${site.origin + site.home('en')})`, `- Sitemap: ${site.origin + P.base(site.rootLang)}/sitemap.xml`, ''].join('\n');
  return new Response(txt, { headers: { 'Content-Type': 'text/markdown; charset=utf-8', ...CC } });
}

const NOSTORE = { 'Cache-Control': 'no-store' };

/** The Pages Function handler. params.lang is the /xx/ prefix (absent on the root-language routes). */
export function handler(site) {
  return async (ctx) => {
    const { request, params } = ctx, url = new URL(request.url);
    if (ctx.env && ctx.env.MAG_DB) DB = ctx.env.MAG_DB;
    if (request.method !== 'GET' && request.method !== 'HEAD') return new Response('Method not allowed', { status: 405 });
    let lang = site.rootLang;
    if (params.lang !== undefined) {
      if (!LANGS.includes(params.lang)) return ctx.next();
      if (params.lang === site.rootLang) return Response.redirect(site.origin + url.pathname.slice(3) + url.search, 301);
      lang = params.lang;
    }
    const rest = [].concat(params.path || []).filter(Boolean);
    if (url.pathname.endsWith('/')) return Response.redirect(site.origin + url.pathname.replace(/\/+$/, '') + url.search, 301);
    if (rest.length > 1) return html(site.notFound(lang), 404, NOSTORE);
    const cache = caches.default, key = new Request(url.toString(), { method: 'GET' });
    const hit = await cache.match(key);
    if (hit) return hit;
    let res;
    try {
      if (!rest.length) res = await indexPage(site, lang, url);
      else if (rest[0] === 'sitemap.xml' && lang === site.rootLang) res = await sitemap(site);
      else if (rest[0] === 'llms.txt' && lang === site.rootLang) res = await llms(site);
      else res = await articlePage(site, lang, rest[0]);
    } catch (e) {
      console.error('magazine', e);
      return html(site.notFound(lang, true), 503, { ...NOSTORE, 'Retry-After': '60' });
    }
    if (!res) return html(site.notFound(lang), 404, NOSTORE);
    ctx.waitUntil(cache.put(key, res.clone()));
    return res;
  };
}
