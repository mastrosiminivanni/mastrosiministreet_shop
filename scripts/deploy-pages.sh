#!/usr/bin/env bash
# Pubblica il sito su GitHub Pages: costruisce la versione statica e la manda sul ramo "gh-pages".
#   bash scripts/deploy-pages.sh
# Il sito esce su https://<utente>.github.io/mastrosiministreet_shop/
set -euo pipefail
cd "$(dirname "$0")/.."
export PATH="$HOME/.local/node/bin:$HOME/.local/bin:$PATH"

REMOTE=$(git remote get-url origin)
GITHUB_PAGES=1 npm run build
touch out/.nojekyll   # senza questo Pages ignora le cartelle che iniziano con "_" (_next)

TMP=$(mktemp -d)
cp -R out/. "$TMP"/
cd "$TMP"
git init -q -b gh-pages
git add -A
git -c user.name="mastrosiminivanni" -c user.email="${PAGES_COMMIT_EMAIL:-mastrosiminivanni@users.noreply.github.com}" \
  commit -q -m "Deploy $(date -u +%Y-%m-%dT%H:%MZ)"
git push -q -f "$REMOTE" gh-pages
echo "Pubblicato sul ramo gh-pages."
