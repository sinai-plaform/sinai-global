#!/bin/zsh
# Publish the committed site (HEAD) to Cloudflare Pages project "sinai-global".
# Usage: node build/build.mjs && git commit … && ./deploy-cf.sh
set -e
cd "$(dirname "$0")"
# W/site = the static site; W/functions + W/server = the magazine's Pages Functions (wrangler compiles ./functions of the
# folder it runs in — they must sit beside the site folder, not inside it, or their source would be served as files)
W=$(mktemp -d); T="$W/site"; mkdir "$T"
git archive HEAD | tar -x -C "$T"
# .wrangler/cache (which Cloudflare account) travels with them, so wrangler never stops to ask
for d in functions server .wrangler; do [[ -d "$T/$d" ]] && mv "$T/$d" "$W/$d"; done
rm -rf "$T"/{CNAME,README.md,LICENSE,build,docs,supabase,.shots,.sync,.github,deploy-cf.sh,CLAUDE.md,_magtest}
HASH="$(git rev-parse HEAD)"; MSG="$(git log -1 --format=%s | cut -c1-200)"
(cd "$W" && npx -y wrangler@4 pages deploy site --project-name sinai-global --branch main --commit-hash "$HASH" --commit-message "$MSG")
rm -rf "$W"
