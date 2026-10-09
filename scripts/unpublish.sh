#!/bin/bash
# Nimmt einen veröffentlichten Beitrag wieder von der Seite (Datei löschen, Commit, Push).
# Einziger zweiter Weg nach außen neben publish.sh — nur auf ausdrückliche Owner-Anweisung.
# Aufruf: bash scripts/unpublish.sh src/content/posts/<datei>.md "<grund>"
set -euo pipefail
cd "$(dirname "$0")/.."
POST="${1:?Pfad fehlt}"; WHY="${2:?Grund fehlt}"
git checkout -q main
git rm -q "$POST"
npm run build >/dev/null
git commit -q -m "Unpublish: $(basename "$POST") — $WHY"
git push -q origin main
echo "unpublish: entfernt — $POST"
