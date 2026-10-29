#!/bin/zsh
# Publish the committed site (HEAD) to Cloudflare Pages project "sinai-global".
# Usage: node build/build.mjs && git commit … && ./deploy-cf.sh
set -e
cd "$(dirname "$0")"
T=$(mktemp -d)
git archive HEAD | tar -x -C "$T"
rm -rf "$T"/{CNAME,README.md,LICENSE,build,docs,.shots,.sync,.github,deploy-cf.sh,CLAUDE.md}
npx -y wrangler@4 pages deploy "$T" --project-name sinai-global --branch main --commit-hash "$(git rev-parse HEAD)" --commit-message "$(git log -1 --format=%s | cut -c1-200)"
rm -rf "$T"
