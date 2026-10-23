# Issues

Rückblickend: bekannte Fehler, Unklarheiten, Restposten. Nicht akut Kritisches hier sammeln,
sicher Problematisches sofort beheben. Erledigtes **entfernen**.

## Geplante Läufe melden Erfolg, veröffentlichen aber nichts

Der einmalige „Erste Deep Dive: Maintainer-Loop“ lief am 2026-10-11 (11 Minuten, Status
SUCCEEDED), der Build Log am 2026-10-19 (2 Minuten, SUCCEEDED) — auf `main` ist bis
2026-10-23 kein einziger Beitrag angekommen, `src/content/posts/` ist leer. Ursache unbekannt
(die Sitzungsprotokolle sind aus einer anderen Sitzung nicht lesbar). Kandidaten: Mac nicht
erreichbar (dann hätte eine „kein Beitrag“-Meldung kommen müssen), Review-FAIL, `npm run
publish` vom Hook oder an fehlendem Push-Recht gescheitert, oder `.claude/agents` und Hooks in
der Cloud-Sitzung nicht geladen. Nächster Schritt: einen Lauf von Hand in einer beobachteten
Sitzung fahren und an jedem Schritt prüfen; `scheduled-run` danach so ändern, dass jeder
Abbruchgrund in der einen Meldungszeile steht.

## GitHub-Pages-Kopie noch online

`matthiasnordwig.github.io/programmiere/` zeigt einen Stand vom 2026-10-10 (vor dem Umzug auf
den eigenen Server). Abschalten nur in den Repo-Einstellungen (Settings → Pages → Unpublish),
für Claude über die Schnittstelle gesperrt — Owner. Unschädlich, weil `canonical` auf
programmiere.de zeigt, aber Duplicate Content.

## Alte Dateien der Terminal-Seite im Docroot

`assets/`, `Logo_Webseite.svg`, `icons.svg`, `icon-128x128.jpg`, `icon-256x256.jpg` liegen
ungenutzt im Docroot (gesichert unter `~/backup-programmiere-20261010-*` auf dem Server).
`deploy-own-server.sh` löscht im Wurzelverzeichnis bewusst nichts. Entfernen nur mit Freigabe.

## Git-Locks in der lokalen Kopie

Aus Claudes Mac-Umgebung bleiben nach `git`-Befehlen `.lock`-Dateien unter `.git/` liegen,
solange Löschen in `~/projects` nicht freigegeben ist („File exists“ bei späteren
Git-Befehlen). Freigabe gilt je Sitzung (`device_request_delete_permission`). In einer
normalen lokalen Claude-Code-Sitzung tritt das nicht auf.
