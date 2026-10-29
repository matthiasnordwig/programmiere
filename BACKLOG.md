# Backlog

Vorwärts gerichtet: was als Nächstes gebaut oder verbessert werden kann. Jeder Eintrag mit genug
Kontext für eine frische Session. Erledigtes **entfernen**, nicht abhaken (steht in der
Git-Historie). Richtungsentscheidungen gehören dem Owner — hier als Vorschlag notieren.

## Inhalte

- **Matrix als App „Matrix LLM“ für macOS und iOS** (Owner, 2026-10-29): Laut
  `~/matrix/dist-release/ios-store/STORE_TEXTS.md` schon im App Store (iOS 1.0.1, macOS 0.2.2);
  das große Update iOS 1.0.2 / macOS 0.2.5 liegt bei Apple bzw. kurz davor. Die Seite erwähnt
  die App bisher gar nicht. **Nachziehen, wenn Apple das Update freigegeben hat** — Skill
  `profile-update` (Projektseite, Startseite, CV, About), App-Store-Links und Versionen aus der
  Quelle, nie aus dem Gedächtnis. Die Bild- und Video-Vorhaben unten passen dann auf die App.

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

- **OG-Bilder je Seite** statt überall `og-matrix.jpg` (Plugin, Loop, CV eigene Vorschaubilder).
- **404 auf dem Server:** Astro erzeugt `404.html`, der Server nutzt sie nicht. Lösung über
  `ErrorDocument` in der `.htaccess` des Docroots — die Datei gehört dem Owner/Server, nur mit
  Freigabe ändern.
- **Visuelle Prüfung automatisieren:** Playwright-Screenshots (Desktop + Mobil, hell + dunkel)
  der Hauptseiten als Skript in `scripts/`, damit jede Layout-Änderung mit Bild verifiziert wird.
