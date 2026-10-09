#!/bin/bash
# Baut den Terminal-Lebenslauf (~/programmiere/terminal-cv) mit Basis /cv/ und legt das
# Ergebnis unter public/cv/ ab. Nur nötig, wenn sich terminal-cv geändert hat.
# Aufruf: bash scripts/sync-cv.sh [pfad-zu-terminal-cv]
set -euo pipefail
SRC="${1:-$HOME/programmiere/terminal-cv}"
HERE="$(cd "$(dirname "$0")/.." && pwd)"
TMP="$(mktemp -d)"
rsync -a --exclude node_modules --exclude dist --exclude .DS_Store "$SRC/" "$TMP/"
(cd "$TMP" && npm ci --no-fund --no-audit >/dev/null && npx tsc && npx vite build --base=/cv/ >/dev/null)
rm -rf "$HERE/public/cv" && mkdir -p "$HERE/public/cv" && cp -a "$TMP/dist/." "$HERE/public/cv/"
echo "public/cv aktualisiert aus $SRC"
