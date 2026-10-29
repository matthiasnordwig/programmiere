#!/bin/bash
# Baut die Terminal-Parodie (terminal-cv/ in diesem Repo) mit Basis /null-device/ und legt das
# Ergebnis unter public/null-device/ ab. Nur nötig, wenn sich terminal-cv geändert hat.
# Aufruf: bash scripts/sync-cv.sh [pfad-zu-terminal-cv]
set -euo pipefail
HERE="$(cd "$(dirname "$0")/.." && pwd)"
SRC="${1:-$HERE/terminal-cv}"
TMP="$(mktemp -d)"
rsync -a --exclude node_modules --exclude dist --exclude .DS_Store "$SRC/" "$TMP/"
(cd "$TMP" && npm ci --no-fund --no-audit >/dev/null && npx tsc && npx vite build --base=/null-device/ >/dev/null)
rm -rf "$HERE/public/null-device" && mkdir -p "$HERE/public/null-device" && cp -a "$TMP/dist/." "$HERE/public/null-device/"
echo "public/null-device aktualisiert aus $SRC"
