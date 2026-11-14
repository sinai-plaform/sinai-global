-- Magazines of sinaiclub.com (site = 'club') and sinai-global.com (site = 'global').
-- Supabase project ooxdupeihzvbzudibaoi (same project as lifestyle_articles). One row per (site, slug, lang).
-- Written by the weekly scheduled tasks as 'scheduled'; the job magazine_publish_due flips them to 'published'
-- when publish_at has passed and tells IndexNow. The sites read published rows with the publishable key.

create table if not exists public.magazine_articles (
  id              bigint generated always as identity primary key,
  site            text not null check (site in ('club', 'global')),
  slug            text not null check (slug ~ '^[a-z0-9][a-z0-9-]{1,80}$'),
  lang            text not null default 'he' check (lang in ('he','en','ru','ar','es','de','it','fr','pt','hi')),
  category        text not null,
  title           text not null,
  excerpt         text not null,
  body_md         text not null,
  cover           text,            -- permanent picture URL (bucket "magazine", <site>/<slug>-1600.webp), filled by the magazine-cover function
  cover_src       text,            -- temporary URL of the generated picture; setting it starts the copy
  cover_error     text,
  status          text not null default 'draft' check (status in ('draft','scheduled','published','archived')),
  publish_at      timestamptz,
  published_at    timestamptz,
  author          text not null default 'Liran Dandekar',
  seo_title       text,
  seo_description text,
  read_min        integer generated always as (greatest(1, round(coalesce(array_length(regexp_split_to_array(btrim(body_md), '\s+'), 1), 0) / 200.0)::int)) stored,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint magazine_articles_site_slug_lang_key unique (site, slug, lang),
  constraint magazine_articles_category_check check (
    (site = 'club'   and category in ('drills', 'sessions', 'players', 'club')) or
    (site = 'global' and category in ('ai', 'automation', 'build', 'growth')))
);
create index if not exists magazine_articles_pub on public.magazine_articles (site, status, lang, published_at desc);

alter table public.magazine_articles enable row level security;
drop policy if exists magazine_articles_public_read on public.magazine_articles;
create policy magazine_articles_public_read on public.magazine_articles for select to anon, authenticated using (status = 'published');
revoke all on public.magazine_articles from anon, authenticated;
grant select on public.magazine_articles to anon, authenticated;

-- published rows always carry a date; updated_at follows every change
create or replace function public.magazine_articles_touch() returns trigger language plpgsql set search_path = public as $$
begin
  if new.status = 'published' and new.published_at is null then new.published_at := now(); end if;
  if tg_op = 'UPDATE' then new.updated_at := now(); end if;
  return new;
end $$;
drop trigger if exists magazine_articles_touch on public.magazine_articles;
create trigger magazine_articles_touch before insert or update on public.magazine_articles for each row execute function public.magazine_articles_touch();

-- public bucket for the covers: magazine/<site>/<slug>.<ext>
insert into storage.buckets (id, name, public) values ('magazine', 'magazine', true) on conflict (id) do nothing;

-- cover: when cover_src is set, the edge function magazine-cover copies the picture into the bucket and fills
-- `cover` on every language row of that article (same pattern as lifestyle_cover_fetch; the key below is the public anon key)
create or replace function public.magazine_cover_fetch() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.cover_src is not null and new.cover_src <> '' and (tg_op = 'INSERT' or new.cover_src is distinct from old.cover_src) then
    perform net.http_post(
      url := 'https://ooxdupeihzvbzudibaoi.supabase.co/functions/v1/magazine-cover',
      body := jsonb_build_object('id', new.id),
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9veGR1cGVpaHp2Ynp1ZGliYW9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5NTk2ODUsImV4cCI6MjA5MjUzNTY4NX0.-phHZwltk41dIJM6tal9B7t2WZVLrAXLV6is4djN9_A'),
      timeout_milliseconds := 60000);
  end if;
  return new;
end $$;
drop trigger if exists magazine_cover_fetch on public.magazine_articles;
create trigger magazine_cover_fetch after insert or update of cover_src on public.magazine_articles for each row execute function public.magazine_cover_fetch();

-- public address of a magazine page (Hebrew is the root language on sinaiclub.com, English on sinai-global.com)
create or replace function public.magazine_url(p_site text, p_lang text, p_slug text default null) returns text language sql immutable set search_path = public as $$
  select case p_site when 'club' then 'https://sinaiclub.com' else 'https://sinai-global.com' end
      || case when p_lang = (case p_site when 'club' then 'he' else 'en' end) then '' else '/' || p_lang end
      || '/magazine' || coalesce('/' || p_slug, '');
$$;

-- publish what is due and tell IndexNow (Bing, and through it ChatGPT search and Copilot) about the new pages
create or replace function public.magazine_publish_due() returns integer language plpgsql security definer set search_path = public as $$
declare
  n integer := 0;
  r record;
begin
  for r in
    with due as (
      update public.magazine_articles set status = 'published', published_at = now()
       where status = 'scheduled' and publish_at <= now()
      returning site, lang, slug)
    select site, count(*)::int as c,
           (select jsonb_agg(distinct u) from due d2, lateral (values (public.magazine_url(d2.site, d2.lang, d2.slug)), (public.magazine_url(d2.site, d2.lang))) v(u) where d2.site = d.site) as urls
      from due d group by site
  loop
    n := n + r.c;
    perform net.http_post(
      url := 'https://api.indexnow.org/indexnow',
      body := jsonb_build_object(
        'host', case r.site when 'club' then 'sinaiclub.com' else 'sinai-global.com' end,
        'key', case r.site when 'club' then 'f33177f55df3b97bac6af5bcabff77f2' else 'de0302ef2ad707c72e38b83829457624' end,
        'keyLocation', case r.site when 'club' then 'https://sinaiclub.com/f33177f55df3b97bac6af5bcabff77f2.txt' else 'https://sinai-global.com/de0302ef2ad707c72e38b83829457624.txt' end,
        'urlList', r.urls),
      headers := jsonb_build_object('Content-Type', 'application/json; charset=utf-8'),
      timeout_milliseconds := 15000);
  end loop;
  return n;
end $$;

revoke all on function public.magazine_publish_due() from public, anon, authenticated;
revoke all on function public.magazine_cover_fetch() from public, anon, authenticated;
revoke all on function public.magazine_articles_touch() from public, anon, authenticated;

-- every 10 minutes (pages are cached 10 minutes too, so a scheduled article is live within ~20 minutes of its time)
select cron.schedule('magazine-publish-due', '*/10 * * * *', $$select public.magazine_publish_due()$$);
