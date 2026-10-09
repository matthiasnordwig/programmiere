---
name: build-log
description: Schreibt den wöchentlichen Build-Log-Entwurf für programmiere.de aus den Commits der Projekt-Repos seit dem letzten Build Log. Nutzen, wenn ein Build Log fällig ist oder ein geplanter Lauf ihn anstößt.
---

# Build Log schreiben

Ziel: 200–500 Wörter Englisch, **eine** Geschichte der Woche plus kurze Liste weiterer
Bewegungen. Nie veröffentlichen (`docs/decisions/0003-publish-gate.md`).

1. **Zeitraum:** Datum des neuesten `type: build-log` in `src/content/posts/` (auch Drafts);
   keiner vorhanden → letzte 7 Tage.
2. **Material holen — nur die Logs** (Befehle in `SOURCES.md`): Matrix (alle drei Repos),
   Plugin (mit `Changelog:`-Trailern). Nichts davon: Tabu-Liste in `SOURCES.md`.
3. **Auswählen:** die eine Änderung mit der besten Geschichte (eine Einsicht, ein Fehler,
   eine Zahl). Erst für diese Commit-Bodies und höchstens eine Handbuch-Stelle lesen.
   Keine Bewegung in der Woche → keinen Post schreiben, das melden.
4. **Schreiben** nach `.claude/rules/writing.md`, Datei
   `src/content/posts/build-log-<jjjj>-w<kw>.md`, Frontmatter: `type: build-log`, passendes
   `project` (bei mehreren: das der Hauptgeschichte), `draft: true`, `description` ≤ 200.
5. **Prüfen:** jede Zahl/Version/Datei gegen die Quelle; `<!-- REVIEW -->` an heiklen Stellen
   (0006); `npm run build` grün.
6. **Ablegen:** Branch `post/build-log-<jjjj>-w<kw>`, committen, **nicht pushen**. Ergebnis
   in einem Satz melden: Titel, Hauptgeschichte, offene REVIEW-Punkte — Freigabe mit „ja".
