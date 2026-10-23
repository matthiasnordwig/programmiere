# programmiere.de — Handbuch

Kompakte Architektur-Referenz: **Ordner → Datei → Funktion**, mit Verweisen, wer wen nutzt.
Erst hier nachsehen, dann gezielt die eine Datei öffnen. Bei strukturellen Änderungen im selben
Zug mitpflegen (neue Datei = eine Zeile hier). Begründungen stehen nicht hier, sondern in
`docs/decisions/`.

Die Seite = statisches **Astro 7**-Projekt, englischer Inhalt, ausgeliefert auf den **eigenen
Server** (whistle-blower.net, User `web412`, Docroot `~/html/programmiere/`). GitHub
(`matthiasnordwig/programmiere`) ist Quelle der Wahrheit und Build-Prüfung, liefert aber nicht aus.

---

## 1. Wege einer Änderung

| Was | Weg | Skript |
|---|---|---|
| Neuer Beitrag (Post) | Branch `post/<slug>` → Review `publish-reviewer` → Check → Merge → Push | `npm run publish -- <datei>` (`scripts/publish.sh`) |
| Änderung an der Seite selbst (Layout, Seiten, CV, Projekte, Doku) | Commit auf `main` → Push (verweigert Post-Änderungen) | `npm run ship` (`scripts/ship-site.sh`) |
| Auslieferung auf den Server | auf dem Mac: holen, bauen, `index.html`→`index.php`, rsync, Erreichbarkeit prüfen | `bash scripts/deploy-own-server.sh` |
| Beitrag zurücknehmen | nur auf Anweisung des Owners | `scripts/unpublish.sh <datei> "<grund>"` |
| Terminal-Parodie neu bauen | aus `~/programmiere/terminal-cv` nach `public/null-device/` | `scripts/sync-cv.sh` |

Direkte `git push`/`gh pr merge` verweigert `.claude/hooks/publish-gate.sh`. **Nach jedem Push
folgt der Deploy** — erst dann ist etwas online.

---

## 2. Ordner und Dateien

```
programmiere/
├── CLAUDE.md                 Arbeitsanweisungen (lädt in jeder Session)
├── HANDBUCH.md               diese Datei
├── BACKLOG.md / ISSUES.md    Vorhaben / bekannte Probleme
├── SOURCES.md                Quellenkarte: welche Repo-Stelle speist welchen Inhalt, was tabu ist
├── docs/
│   ├── POSITIONING.md        Wofür die Seite steht, für wen, Ton — Leitplanke für jeden Text
│   └── decisions/NNNN-*.md   Grundsatzentscheidungen (Kontext → Entscheidung → Konsequenzen)
├── astro.config.mjs          site=https://programmiere.de, Sitemap, Shiki-Themes
├── package.json              Skripte: dev, build, preview, publish, publish-check, ship
├── config/confidential-terms.txt   Begriffe, die nie in einen Beitrag dürfen (publish-check)
├── inbox/diy/                lokales Rohmaterial für DIY-Posts (gitignored außer README)
├── .deploy/                  Deploy-Schlüssel + gepinnter Host-Key — nur auf dem Mac, gitignored
├── .github/workflows/build.yml  Build-Prüfung bei jedem Push (keine Auslieferung)
├── public/                   1:1 ausgeliefert: favicon.svg, og-matrix.jpg (Social-Vorschau), null-device/
├── scripts/                  s. §1 und §4
└── src/                      s. §3
```

---

## 3. `src/` — die Seite

**Daten & Konfiguration**
- `site.ts` — `SITE`: Name, Tagline, GitHub, LinkedIn, E-Mail, wp.org-Link. Von `Base.astro`, `index.astro`, `rss.xml.js` genutzt.
- `content.config.ts` — Collections + Schemas: `posts` (`title`, `description` ≤200, `date`, `type` `deep-dive|build-log|diy`, `project`, `tags`, `draft`=**true** per Default) und `projects` (`title`, `summary`, `status`, `order`, `featured`, `links`).
- `lib.ts` — `publishedPosts()` (Drafts nur in `astro dev`), `TYPE_LABEL`, `fmtDate()`. Genutzt von Startseite, Writing, Projektseiten, RSS.
- `data/cv.ts` — einzige Quelle des Lebenslaufs: `PERSON`, `RUN` (Stationen mit `fights`: `boss`/`hp`/`result`/`line`), `SIDE_QUESTS`, `LOADOUT`, `EXTRAS`. Fakten nur aus dem eigenen CV; Arbeitgeber-interne Zahlen bleiben draußen.

**Layout & Stil**
- `layouts/Base.astro` — HTML-Gerüst: Meta/OG/Twitter-Card, optional JSON-LD (`jsonld`), Navigation (Matrix · Anti-spam · The loop · Writing · About), Footer (CV, RSS, GitHub, LinkedIn, E-Mail, Legal notice). Props: `title`, `description`, `wide`, `image`, `jsonld`.
- `styles/global.css` — Farb-Tokens (hell/dunkel), Grundtypografie; Display-Schrift Bricolage Grotesque (selbst gehostet über `@fontsource-variable`).
- `styles/story.css` — Bausteine der langen Projektseiten: `.beat`, `.split`, `.grid3`, `.steps` (nummeriert), `.who.ai`/`.who.rules`, `.numbers`, `.card`, `table.demo`, `.go`.

**Seiten** (`pages/`)
- `index.astro` — Startseite: Matrix als Hero mit echter Aufnahme, darunter zwei „Türen“ je Publikum (Loop für Agent-Bauer, Plugin für WordPress-Betreiber), neueste Notizen, kurz „wer“.
- `projects/matrix.astro`, `projects/gdpr-recaptcha.astro`, `projects/maintainer-loop.astro` — handgebaute Langseiten aus „Beats“; Fakten aus den Projekt-Repos (s. `SOURCES.md`).
- `projects/[id].astro` — generische Projektseite für alle Projekte **ohne** eigene Seite (Liste `OWN` darin pflegen!), mit JSON-LD.
- `projects/index.astro` — Übersicht aller Projekte (`order`).
- `writing/index.astro`, `writing/[...id].astro` — Beitragsliste und Beitragsseite.
- `about.astro` — kurze Person; `cv.astro` — Lebenslauf: schlicht/druckbar als Standard, Speedrun-Fassung per Schalter oder `#speedrun`.
- `rss.xml.js` — Feed (nur veröffentlichte Posts); `404.astro`.

**Komponenten** (`components/`)
- `PostList.astro` — Beitragsliste (Datum · Art · Draft-Badge).
- `story/Zoom.astro` — Screenshot über volle Breite, Klick öffnet Vollbild (`<dialog>`).
- `diagrams/MatrixFlow.astro`, `LoopFlow.astro`, `PowFlow.astro` — schematische SVGs, nutzen die Farb-Tokens; keine erfundenen Inhalte.

**Inhalte** (`content/`)
- `projects/*.md` — Projekt-Stammdaten; Dateiname = `id` = `project`-Wert der Posts. Für Projekte mit eigener Seite dient nur das Frontmatter (Übersicht, Verknüpfung der Posts).
- `posts/*.md` — Beiträge; Bilder unter `assets/posts/<slug>/`.
- `assets/projects/` — Screenshots (Matrix: Graph, Graph-Ausschnitt, Chat).

---

## 4. Gate, Deploy, Automatik

- `scripts/publish-check.mjs` — deterministischer Check eines Posts: Pflichtfelder, Mindestlänge je Art, keine REVIEW-Marker/Platzhalter, keine Zugangsdaten, lokalen Pfade, privaten IPs, fremden E-Mails, gesperrten Begriffe.
- `scripts/publish.sh` — nur von `post/<slug>`: Check → `draft: false` → Build → Merge nach `main` → Push.
- `scripts/ship-site.sh` — Push von `main`, bricht ab, wenn Posts betroffen sind (Vergleich gegen `FETCH_HEAD`).
- `scripts/deploy-own-server.sh` — läuft auf dem Mac (`main()`-gekapselt): fast-forward, `npm ci`, Build, `php-index.mjs`, rsync mit `--chmod=D755,F644`; `--delete` nur in `_astro writing projects cv null-device about`; prüft am Ende `/`, `/cv/`, `/impressum/`, `/GDPRCompliantRecaptcha/` auf 200.
- `scripts/php-index.mjs` — jede `index.html` → `index.php` (Server kennt nur `index.php`, sonst 403); Abbruch bei `<?` im HTML.
- **Nicht von hier verwaltet**, liegt aber im selben Docroot: `impressum/` (zweisprachig) und `GDPRCompliantRecaptcha/` (Feedback-Empfänger) — beide gepflegt im Plugin-Repo unter `server/programmiere.de/`.

**Claude-Konfiguration** (`.claude/`)
- `settings.json` — Projekt-Repos `~/matrix` und `~/wp-plugins/gdpr-recaptcha` als zusätzliche Verzeichnisse, dort **nur lesen**; sensible Pfade gesperrt; Hook `publish-gate.sh`.
- `agents/publish-reviewer.md` — unabhängiges Review (opus) vor jeder Veröffentlichung: PASS/FAIL.
- `rules/writing.md` — Schreibregeln, laden mit Posts, Projektseiten und About.
- `skills/` — `build-log`, `deep-dive`, `diy-post`, `profile-update`, `scheduled-run`.

**Geplante Aufgaben** (claude.ai, laufen in der Cloud mit verbundenem Mac): Build Log sonntags
17:49, Deep Dive am 1. des Monats 9:49 — jeweils nach Skill `scheduled-run`, Ergebnis eine Zeile.

---

## 5. Gelockte Entscheidungen (Kurzform, Details in `docs/decisions/`)

- Englischer Seiteninhalt, deutsche Repo-Doku (0001). Projekte zuerst, Person zuletzt (`docs/POSITIONING.md`).
- Statisch, keine Datenbank, kein CMS (0002); eigener Server, nie GitHub Pages (0009).
- Veröffentlichen nur über das zweistufige Gate, kein direkter Push (0008).
- Keine Drittanfragen: keine fremden Fonts, kein Tracking, keine Cookies (0005).
- Arbeitgeber nur im Werdegang; Matrix-Herkunft/Einsatzort allgemein halten (0006).
