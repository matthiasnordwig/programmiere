#!/bin/bash
# Liefert Änderungen an der Seite selbst aus (Layout, Seiten, Lebenslauf, Projektseiten, Doku),
# NICHT an Beiträgen — die gehen nur über scripts/publish.sh (docs/decisions/0008).
# Bricht ab, wenn der Push Beiträge unter src/content/posts/ verändern würde.
# Aufruf: npm run ship
set -euo pipefail
cd "$(dirname "$0")/.."
[ "$(git rev-parse --abbrev-ref HEAD)" = "main" ] || { echo "ship: nur von main"; exit 1; }
[ -z "$(git status --porcelain)" ] || { echo "ship: Arbeitsbaum nicht sauber — erst committen"; exit 1; }
git fetch -q origin main
if git diff --name-only origin/main..HEAD | grep -q '^src/content/posts/'; then
  echo "ship: enthält Beitragsänderungen — die gehen nur über npm run publish"; exit 1
fi
npm run build >/dev/null
git push -q origin main
echo "ship: ausgeliefert ($(git rev-parse --short HEAD))"
