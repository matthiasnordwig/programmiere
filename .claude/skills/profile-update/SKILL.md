---
name: profile-update
description: Zieht die Seite nach, wenn sich am Profil etwas ändert — neues Projekt, Release, Meilenstein, neue Rolle, neue Kennzahl. Aktualisiert Projektseiten, Startseite, CV und About konsistent und liefert aus. Nutzen bei "trag X ein", "aktualisier mein Profil", "neues Projekt", oder wenn ein Build Log einen Meilenstein findet.
---

# Profil nachziehen

Ziel: Die Seite zeigt jederzeit den aktuellen Stand — ohne dass der Owner Einzelheiten liefern
muss. Leitplanke ist `docs/POSITIONING.md` (Werk vor Person, Englisch, unterhaltsam, belegt).

1. **Was hat sich geändert?** Aus dem Auftrag, sonst aus den Quellen (`SOURCES.md`): neue Commits,
   Releases (`plugin/readme.txt`), neue Repos unter `matthiasnordwig`, neue Zahlen
   (`loop/metrics/wporg.jsonl`), CV-Datei. Nur Belegbares übernehmen.
2. **Wo muss es hin?** Eine Änderung zieht oft mehrere Stellen nach sich — alle im selben Zug:

   | Änderung | Stellen |
   |---|---|
   | Neues Projekt | `src/content/projects/<id>.md`; eigene Langseite unter `src/pages/projects/<id>.astro` nur wenn es trägt (dann `OWN` in `[id].astro` ergänzen); ggf. Tür auf `index.astro`; `SIDE_QUESTS` in `src/data/cv.ts`; HANDBUCH §3 |
   | Release / neue Kennzahl | Zahl auf der Projektseite (`.numbers`), ggf. `status` im Projekt-Frontmatter, CV-Eintrag |
   | Neue Rolle / Station | `RUN` in `src/data/cv.ts` (beide Ansichten lesen daraus), `about.astro` |
   | Neue Fähigkeit | `LOADOUT` in `src/data/cv.ts` |

3. **Vertraulichkeit** (`docs/decisions/0006`): keine internen Arbeitgeber-Zahlen, keine Kunden,
   Matrix-Herkunft allgemein. Telefonnummer und Privatadresse nie (Adresse steht nur im Impressum).
4. **Prüfen:** `npm run build`; Zahlen gegen Quelle; bei Layout-Änderungen Screenshot
   (Desktop + Mobil) ansehen.
5. **Ausliefern:** committen, `npm run ship`, danach `bash scripts/deploy-own-server.sh` auf dem
   Mac. Ergebnis in einem Satz melden: was jetzt anders auf der Seite steht.
6. **Nachpflegen:** HANDBUCH bei neuen Dateien, BACKLOG/ISSUES bereinigen.
