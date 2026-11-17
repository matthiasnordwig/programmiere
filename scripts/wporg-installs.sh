#!/bin/bash
# Holt die aktiven Installationen des Anti-Spam-Plugins von der WordPress.org-API und schreibt sie
# als <zielverzeichnis>/wporg-installs.json: {"active_installs":5000,"fetched":"2026-11-17T18:00:00Z"}
# Läuft täglich auf dem Server (Plesk > Geplante Aufgaben, HANDBUCH §4) mit Ziel
# ~/html/programmiere/data — dort liest components/Installs.astro die Datei im Browser.
# Der Deploy fasst data/ nicht an (kein --delete dort, die Wurzel-Synchronisation lässt Verzeichnisse aus).
#
# Übernommen wird nur eine plausible Zahl: ganze Zahl von 1 bis 100.000.000 und nicht unter der
# Hälfte des bisherigen Werts (fängt Ausreißer wie 0 oder 10 ab). Sonst bleibt die alte Datei
# stehen, Meldung auf stderr, Exit 1 (Plesk schickt dann eine Mail). Sinkt die Zahl wirklich so
# stark, die alte Datei einmal von Hand löschen.
# Schreiben atomar: temporäre Datei im selben Verzeichnis, dann mv. Kein jq nötig (fehlt auf dem Server).
#
# Aufruf: bash wporg-installs.sh <zielverzeichnis>
# Zum Testen: WPORG_API=<url> überschreibt die Adresse (auch file:///pfad/antwort.json).
set -euo pipefail

DIR="${1:?Aufruf: wporg-installs.sh <zielverzeichnis>}"
SLUG="gdpr-compliant-recaptcha-for-all-forms"
API="${WPORG_API:-https://api.wordpress.org/plugins/info/1.2/?action=plugin_information&request[slug]=$SLUG&request[fields][active_installs]=1}"
OUT="$DIR/wporg-installs.json"

fail() { echo "wporg-installs: $*, $OUT bleibt unverändert" >&2; exit 1; }

body=$(curl -fsS -g --max-time 30 --retry 2 --retry-delay 10 "$API") || fail "Abruf fehlgeschlagen"
n=$(printf '%s' "$body" | grep -oE '"active_installs"[[:space:]]*:[[:space:]]*[0-9]+' | head -n 1 | grep -oE '[0-9]+$' || true)
[ -n "$n" ] || fail "keine Zahl active_installs in der Antwort"
[ "${#n}" -le 9 ] && [ "$n" -ge 1 ] && [ "$n" -le 100000000 ] || fail "unplausible Zahl $n"
n=$((10#$n))

if [ -f "$OUT" ]; then
  old=$(grep -oE '"active_installs":[0-9]+' "$OUT" | grep -oE '[0-9]+$' || true)
  if [ -n "$old" ] && [ "$n" -lt $((10#$old / 2)) ]; then
    fail "neue Zahl $n liegt unter der Hälfte der bisherigen $old"
  fi
fi

mkdir -p "$DIR"
tmp=$(mktemp "$DIR/.wporg-installs.XXXXXX")
trap 'rm -f "$tmp"' EXIT
printf '{"active_installs":%d,"fetched":"%s"}\n' "$n" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > "$tmp"
chmod 644 "$tmp"
mv -f "$tmp" "$OUT"
trap - EXIT
