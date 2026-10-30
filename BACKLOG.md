# Backlog

Vorwärts gerichtet: was als Nächstes gebaut oder verbessert werden kann. Jeder Eintrag mit genug
Kontext für eine frische Session. Erledigtes **entfernen**, nicht abhaken (steht in der
Git-Historie). Richtungsentscheidungen gehören dem Owner — hier als Vorschlag notieren.

## Inhalte

- **Matrix LLM: Seite veröffentlichen, sobald macOS 0.2.5 freigegeben ist** (Owner, 2026-10-29). iOS 1.0.2 ist seit
  2026-10-29 im App Store. Der fertige Entwurf liegt auf Branch `draft/matrix-app` (Matrix-Seite mit Store-Link und
  Smart App Banner, Assistent, erste fünf Minuten, neue Screenshots, Messwerte aus `DEMO.md`; Projekteintrag, CV,
  Startseiten-Tür). Dann: `git switch main && git merge draft/matrix-app`, `npm run ship`, Deploy; die Vorschau-Kopie
  `~/projects/programmiere-draft` (git worktree) mit `git worktree remove ../programmiere-draft` entfernen. Hero der
  Startseite: die App, mit Wissensgraph und iPhone (Owner, 2026-10-30).
- **Matrix für Claude Code: Aufnahme in Anthropics Plugin-Liste** (eingereicht, Owner
  2026-10-29). Sobald aufgenommen: auf `projects/matrix-claude-code.astro` und im
  Installationsabschnitt nennen (ggf. Installation aus der offiziellen Liste statt eigenem
  Marketplace) und einen kurzen LinkedIn-Nachtrag vorschlagen. Lizenz ist laut
  `~/matrix/app/claude-plugin/LICENSE` noch offen (kostenlos, nicht Open Source) — auf der
  Seite steht deshalb „free“, nie „open source“.

- **TIL-Notizen** („today I learned“): kurze Beiträge aus einzelnen Commits/Einsichten der
  Projekt-Repos, Vorbild simonwillison.net. Braucht eine neue Beitragsart `til` in
  `src/content.config.ts` + `docs/decisions/0004-content-types.md` + Skill. Owner hat die Idee
  positiv aufgenommen, aber noch nicht freigegeben.
- **Weitere Projekte zeigen:** öffentliche Repos `pdf-struct-chunker`, `llm-json-extract`,
  `matrix-core` (GitHub `matthiasnordwig`); lokal außerdem `antispam-bot-tester`,
  `homematic-rollladen` (DIY-Kandidat). Je Projekt prüfen, ob es eine eigene Seite trägt oder
  als Eintrag in `src/content/projects/` reicht. Whistle-Blower.net (eigenes SaaS) fehlt bisher
  als Projekt.
- **Matrix: Grid- und Community-Ansicht fotografieren**, sobald die zwei Fehler in Matrix
  behoben sind (`~/matrix/ISSUES.md`: Prompt-Echo als Dokumenttitel; rohes Markdown in
  Community-Zusammenfassungen). Ein Grid mit ausgefüllten Antworten wäre das stärkste Bild.
  Aufnahme per Computer-Use; Seitenleiste mit Kontextliste immer wegschneiden (0006).
- **Kurzes Video von Matrix im Flugmodus auf dem iPhone** als Hero — braucht eine Aufnahme vom
  Owner.

## Verbreitung

- Zu jedem neuen Beitrag fertige Texte für Hacker News („Show HN“ bei Projekten), Reddit
  (r/LocalLLaMA für Matrix, r/Wordpress für das Plugin) und LinkedIn erzeugen und dem Owner zum
  Einfügen schicken — posten selbst kann Claude nicht (fremde Konten, öffentlich).
- Link von der wp.org-Plugin-Seite (readme.txt, Plugin URI / Author URI) auf
  `programmiere.de/projects/gdpr-recaptcha/` — größter Hebel für echte Besucher. Änderung im
  Plugin-Repo, geht mit dem nächsten Plugin-Release raus (dortige Release-Regeln beachten).
- GitHub-Profil-README (`matthiasnordwig/matthiasnordwig`) mit Verweis auf die Seite und die
  neuesten Beiträge.
- Newsletter/E-Mail-Abo zusätzlich zu RSS — nur ohne Drittanbieter-Tracking (0005).

## Technik

- **OG-Bilder je Seite** statt überall `og-matrix.jpg` (WordPress-Plugin, Loop, CV eigene Vorschaubilder; Startseite und Claude-Code-Plugin haben schon `og-matrix-claude-code.png`, gerendert aus HTML mit Chrome headless).
- **404 auf dem Server:** Astro erzeugt `404.html`, der Server nutzt sie nicht. Lösung über
  `ErrorDocument` in der `.htaccess` des Docroots — die Datei gehört dem Owner/Server, nur mit
  Freigabe ändern.
- **Visuelle Prüfung automatisieren:** Playwright-Screenshots (Desktop + Mobil, hell + dunkel)
  der Hauptseiten als Skript in `scripts/`, damit jede Layout-Änderung mit Bild verifiziert wird.
