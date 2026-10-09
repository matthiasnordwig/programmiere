#!/bin/bash
# Veröffentlicht EINEN Beitrag — der einzige Weg auf main (docs/decisions/0008).
# Voraussetzung: der Beitrag liegt auf einem Branch post/<slug> und hat das Review des
# Agents publish-reviewer bestanden. Dieses Skript ist die deterministische Hälfte:
# Check → draft:false → Build → Merge nach main → Push. Schlägt ein Schritt fehl, wird nichts
# gepusht und der Beitrag bleibt Entwurf.
# Aufruf: npm run publish -- src/content/posts/<datei>.md
set -euo pipefail
cd "$(dirname "$0")/.."
POST="${1:?Pfad zum Beitrag fehlt}"
BRANCH="$(git rev-parse --abbrev-ref HEAD)"
[[ "$BRANCH" == post/* ]] || { echo "publish: nur von einem post/<slug>-Branch aus (aktuell: $BRANCH)"; exit 1; }
[ -z "$(git status --porcelain)" ] || { echo "publish: Arbeitsbaum nicht sauber"; exit 1; }

node scripts/publish-check.mjs "$POST"
sed -i.bak 's/^draft:[[:space:]]*true[[:space:]]*$/draft: false/' "$POST" && rm -f "$POST.bak"
grep -q '^draft: false$' "$POST" || printf '%s\n' "$(awk 'NR==1{print;print "draft: false";next}1' "$POST")" > "$POST"
npm run build >/dev/null
TITLE="$(grep -m1 '^title:' "$POST" | sed 's/^title:[[:space:]]*//; s/^["'\'']//; s/["'\'']$//')"
git add "$POST"
git commit -q -m "Publish: $TITLE"
git checkout -q main
git merge -q --no-ff "$BRANCH" -m "Merge $BRANCH"
git push -q origin main
git branch -q -d "$BRANCH"
echo "publish: veröffentlicht — $TITLE"
