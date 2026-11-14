// SINAI magazines (sinaiclub.com, sinai-global.com) — copy an article's generated cover into permanent storage.
// Called by the DB trigger magazine_cover_fetch (pg_net, with the project's JWT) with {id}. It takes no URL from
// the caller: it reads cover_src from the row itself (only from known image hosts), downloads it, stores it in the
// public bucket "magazine" as <site>/<slug>.<ext>, and sets cover on every language row of that article.
// Errors go to cover_error; the site shows its default cover meanwhile. Same pattern as lifestyle-cover.
import { createClient } from "jsr:@supabase/supabase-js@2";

const ALLOWED = [/^https:\/\/elevenlabsusercontent\.com\//, /^https:\/\/[a-z0-9.-]*fal\.media\//];

Deno.serve(async (req) => {
  const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { "Content-Type": "application/json" } });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  let id: number;
  try { id = Number((await req.json()).id); } catch { return json({ error: "bad body" }, 400); }
  if (!Number.isInteger(id) || id <= 0) return json({ error: "bad id" }, 400);
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: row, error } = await sb.from("magazine_articles").select("id,site,slug,cover_src").eq("id", id).single();
  if (error || !row) return json({ error: "not found" }, 404);
  const src = row.cover_src as string | null;
  const fail = async (msg: string) => { await sb.from("magazine_articles").update({ cover_error: msg.slice(0, 300) }).eq("id", id); return json({ error: msg }, 422); };
  if (!src) return json({ ok: true, skipped: "no cover_src" });
  if (!ALLOWED.some((r) => r.test(src))) return fail("cover_src host not allowed");
  try {
    const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 30000);
    const res = await fetch(src, { signal: ctl.signal }); clearTimeout(t);
    if (!res.ok) return fail(`download ${res.status}`);
    const type = (res.headers.get("content-type") || "image/png").split(";")[0];
    if (!type.startsWith("image/")) return fail(`not an image: ${type}`);
    const bytes = new Uint8Array(await res.arrayBuffer());
    if (bytes.length > 15_000_000) return fail("image too large");
    const ext = type.includes("jpeg") ? "jpg" : type.includes("webp") ? "webp" : "png";
    const path = `${row.site}/${row.slug}.${ext}`;
    const up = await sb.storage.from("magazine").upload(path, bytes, { contentType: type, upsert: true, cacheControl: "31536000" });
    if (up.error) return fail(`upload: ${up.error.message}`);
    const url = sb.storage.from("magazine").getPublicUrl(path).data.publicUrl + `?v=${Date.now()}`;
    await sb.from("magazine_articles").update({ cover: url, cover_error: null }).eq("site", row.site).eq("slug", row.slug);
    return json({ ok: true, cover: url });
  } catch (e) {
    return fail(`fetch failed: ${e instanceof Error ? e.message : String(e)}`);
  }
});
