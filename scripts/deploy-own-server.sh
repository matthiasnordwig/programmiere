#!/bin/bash
# Liefert die Seite auf den eigenen Webserver aus: whistle-blower.net, User web412,
# Docroot ~/html/programmiere/ (docs/decisions/0009-own-server.md).
# Läuft auf dem Mac (bzw. in dessen Claude-Arbeitsumgebung) — der Deploy-Schlüssel liegt nur
# dort in .deploy/ (gitignored) und verlässt den Rechner nie.
#
# Ablauf: Stand von GitHub holen → bauen → index.html→index.php → rsync.
# Was dem Server sonst gehört, wird NIE angefasst: impressum/, GDPRCompliantRecaptcha/,
# das Feedback-Datenverzeichnis über dem Docroot. --delete gilt deshalb nur innerhalb der
# Verzeichnisse, die diese Seite selbst erzeugt; Dateien im Wurzelverzeichnis werden nur
# überschrieben, nie gelöscht.
# Aufruf: bash scripts/deploy-own-server.sh [--dry-run]
set -euo pipefail
# Gesamter Ablauf in main(): bash liest Skripte zeilenweise, und der git merge unten kann
# genau diese Datei ersetzen — in einer Funktion ist alles schon gelesen, bevor es läuft.
main() {
cd "$(dirname "$0")/.."
DRY=""; [ "${1:-}" = "--dry-run" ] && DRY="--dry-run"
KEY=".deploy/id_ed25519"; KH=".deploy/known_hosts"
[ -f "$KEY" ] || { echo "deploy: kein Schlüssel in .deploy/"; exit 1; }
TARGET="web412@whistle-blower.net"
DOCROOT="html/programmiere"
SSH="ssh -i $KEY -o UserKnownHostsFile=$KH -o StrictHostKeyChecking=yes -o IdentitiesOnly=yes -o BatchMode=yes"

git fetch -q origin main && git merge -q --ff-only origin/main
npm ci --no-fund --no-audit >/dev/null
npm run build >/dev/null
node scripts/php-index.mjs dist
# Rechte explizit setzen: die Arbeitskopie auf dem Mac hat 600/700 — rsync -a würde das
# übernehmen und der Webserver antwortete 403 (so passiert beim ersten Deploy 2026-10-10).
# Lokal statt per rsync --chmod: das openrsync von macOS kennt --chmod nicht.
chmod -R u=rwX,go=rX dist

# Seiten-eigene Verzeichnisse: exakt spiegeln (inkl. Löschen entfernter Beiträge)
for d in _astro writing projects cv null-device about; do
  [ -d "dist/$d" ] || continue
  rsync -az $DRY --delete -e "$SSH" "dist/$d/" "$TARGET:$DOCROOT/$d/"
done
# Wurzel: nur Dateien, nichts löschen, fremde Verzeichnisse nicht berühren
rsync -az $DRY -e "$SSH" --exclude='*/' dist/ "$TARGET:$DOCROOT/"
# Eine alte index.html im Docroot würde neben index.php stehen — sie stammt nicht von hier
# und wird nur gemeldet, nicht gelöscht.
$SSH "$TARGET" "test -e $DOCROOT/index.html && echo 'deploy: Hinweis — alte index.html im Docroot' || true"

if [ -n "$DRY" ]; then echo "deploy: --dry-run, nichts geändert"; return 0; fi
# Docroot selbst muss lesbar bleiben (ein 700 dort nimmt auch Impressum und Feedback-Empfänger vom Netz)
$SSH "$TARGET" "chmod 755 $DOCROOT"
bad=""
for u in / /cv/ /impressum/ /GDPRCompliantRecaptcha/; do
  c=$(curl -s -o /dev/null -w '%{http_code}' "https://programmiere.de$u" || true)
  [ "$c" = "200" ] || bad="$bad $u=$c"
done
[ -z "$bad" ] || { echo "deploy: FEHLER — nicht erreichbar:$bad"; exit 1; }
echo "deploy: ausgeliefert ($(git rev-parse --short HEAD)) — https://programmiere.de/ antwortet 200"
}
main "$@"
