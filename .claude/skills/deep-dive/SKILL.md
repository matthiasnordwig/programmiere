---
name: deep-dive
description: Entwirft einen Deep-Dive-Beitrag für programmiere.de über ein geknacktes Problem aus Matrix, dem Plugin oder dem Maintainer-Loop — Einsicht, Weg, Fehler, Zahlen. Nutzen, wenn ein Langbeitrag zu einem bestimmten Thema gewünscht ist.
---

# Deep Dive schreiben

1.500–3.000 Wörter Englisch. Aufbau (0004): **Problem** und warum es schwer aussah →
**die Einsicht** → **wie es geknackt wurde** → **was schiefging** → **die Zahlen** →
**was offen bleibt**. Nie veröffentlichen (0003).

1. **Thema klären:** Ist es vorgegeben, damit arbeiten. Sonst 3 Kandidaten aus
   `SOURCES.md`-Quellen vorschlagen (je eine Zeile: Problem + Einsicht) und eine Wahl
   abwarten — das ist eine Richtungsentscheidung.
2. **Recherche gezielt:** Handbuch-Index → eine Bereichsdatei → die Commits/Diffs, die die
   Einsicht tragen → ISSUES/Fix-Commits für „what broke". Fakten mit Fundstelle notieren.
3. **Gliederung zuerst** als Kommentar am Dateianfang, dann ausschreiben.
4. **Code/Diagramme:** kurze, echte Ausschnitte (≤ 20 Zeilen, Pfad nennen); Architektur als
   Mermaid- oder SVG-Diagramm, wenn es den Mechanismus zeigt.
5. **Prüfen:** Fakten gegen Fundstellen, Vertraulichkeit (0006) mit `<!-- REVIEW -->`,
   `npm run build`.
6. **Ablegen:** Datei `src/content/posts/<slug>.md`, `type: deep-dive`, `draft: true`, Branch
   `post/<slug>`, committen, nicht pushen. Melden: Titel, These in einem Satz, REVIEW-Punkte.
