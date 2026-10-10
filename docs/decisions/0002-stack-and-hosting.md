# 0002 — Stack und Hosting

**Status:** gilt · 2026-10-10 · Hosting-Teil ersetzt durch 0009 (eigener Server statt GitHub Pages)

**Entscheidung.** Astro (statisch, Content Collections mit Schema), Markdown-Beiträge im Repo,
GitHub Pages mit eigener Domain `programmiere.de` (`public/CNAME`), Build per GitHub Action.
Eigenes Repo und eigener Ordner (`~/projects/programmiere`), getrennt von den Projekt-Repos.

**Warum.** Beiträge als Dateien sind für Agenten der natürlichste Arbeitsgegenstand (Branch,
Diff, Review); kein CMS, keine Datenbank, kein Server. Statisch heißt auch: keine
Angriffsfläche, keine Betriebslast — wichtig, weil Weiterbetreiben nicht meine Stärke ist.
Getrenntes Repo, weil der Blog andere Regeln hat als die Projekte und sie nur liest.

**Konsequenzen.** `npm run build` ist der Schema- und Gesamttest. GitHub-Repo, Pages und DNS
richtet Claude ein (0008: vollautomatisch). Die bisherige Terminal-Seite von
programmiere.de (`~/programmiere/terminal-cv`, eine Parodie auf Recruiting-Portale) lebt unter
`/null-device/` weiter (`scripts/sync-cv.sh`); `/cv/` ist der neue Lebenslauf.
