---
name: deep-dive
description: Entwirft einen Deep-Dive-Beitrag für programmiere.de über ein geknacktes Problem aus Matrix, dem Plugin oder dem Maintainer-Loop — Einsicht, Weg, Fehler, Zahlen. Nutzen, wenn ein Langbeitrag zu einem bestimmten Thema gewünscht ist.
---

# Deep Dive schreiben

1.500–3.000 Wörter Englisch. Aufbau (0004): **Problem** und warum es schwer aussah →
**die Einsicht** → **wie es geknackt wurde** → **was schiefging** → **die Zahlen** →
**was offen bleibt**. Veröffentlicht wird nur über das Gate (0008).

1. **Thema wählen:** Ist es vorgegeben, damit arbeiten. Sonst selbst wählen — das stärkste noch
   nicht behandelte Problem aus den `SOURCES.md`-Quellen (eine echte Einsicht, belegbare
   Zahlen, ehrlicher Fehler); bereits veröffentlichte Deep Dives nicht wiederholen. Nicht fragen.
2. **Recherche gezielt:** Handbuch-Index → eine Bereichsdatei → die Commits/Diffs, die die
   Einsicht tragen → ISSUES/Fix-Commits für „what broke". Fakten mit Fundstelle notieren.
3. **Gliederung zuerst** als Kommentar am Dateianfang, dann ausschreiben.
4. **Code/Diagramme:** kurze, echte Ausschnitte (≤ 20 Zeilen, Pfad nennen); Architektur als
   Mermaid- oder SVG-Diagramm, wenn es den Mechanismus zeigt.
5. **Prüfen:** Fakten gegen Fundstellen, Vertraulichkeit (0006) mit `<!-- REVIEW -->`,
   `npm run build`.
6. **Ablegen und veröffentlichen:** Datei `src/content/posts/<slug>.md`, `type: deep-dive`,
   `draft: true`, Branch `post/<slug>`, committen. Dann das **Gate**: Agent `publish-reviewer` mit dem Dateipfad aufrufen → bei `VERDICT: FAIL`
   die Befunde **einmal** einarbeiten, committen, erneut prüfen lassen → bei PASS
   `npm run publish -- <datei>` (Check, `draft: false`, Build, Merge, Push); scheitert der
   Check, Befund beheben und noch einmal. Bleibt es bei FAIL: Entwurf liegen lassen, nichts
   pushen. Ergebnis in **einem** Satz melden (veröffentlicht: Titel + URL, oder: nicht
   veröffentlicht + Grund). Keine Rückfragen.
