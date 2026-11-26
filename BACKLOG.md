# Backlog

Vorwärts gerichtet: was als Nächstes gebaut oder verbessert werden kann. Jeder Eintrag mit genug
Kontext für eine frische Session. Erledigtes **entfernen**, nicht abhaken (steht in der
Git-Historie). Richtungsentscheidungen gehören dem Owner — hier als Vorschlag notieren.

## Inhalte

- **„How Matrix was built“ nachziehen** (`src/pages/projects/matrix/how-it-was-built.astro`, online seit
  2026-11-25): (1) Abschnitt zur Testübersicht je Unit und zu Mutationstests, sobald die Methode in `~/matrix`
  steht und belegte Zahlen hat (Session „Matrix: Regressionsübersicht je Unit und Mutationstests“, Quelle und
  Datum je Zahl). (2) Drei Video-Plätze sind nur in `astro dev` sichtbar (Vorschläge im Quelltext); Videos nach
  Skill `videos` bauen, dann durch `<Video>` ersetzen. Umfangszahlen (Commits, Zeilen, Tests) dabei neu zählen.
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

- **Diskussion unter Beiträgen** (Owner-Wunsch 2026-11-26): Beiträge rufen zur Diskussion auf (z. B.
  „Nobody Actually Noticed“ endet mit „Welche Testarten nutzt ihr bei Code von Agenten?“), die Seite bietet
  aber keinen Ort dafür. Gewünscht: Kommentarbereich/Forum unter Beiträgen, der echte Diskussion zulässt.
  Anforderungen (Anmeldung, Moderation, Spam, Benachrichtigung, Sprache de/en) sind offen, mit dem Owner
  klären. Randbedingungen: Seite ist statisch gebaut, kein CMS/keine Datenbank (0002); eigener Server
  whistle-blower.net mit PHP (Plesk, `index.php`, 0009), dort läuft schon ein kleiner PHP-Empfänger
  `GDPRCompliantRecaptcha/` aus dem Plugin-Repo; keine Drittanfragen, kein Tracking, keine Cookies, keine
  Fremd-Widgets (0005; der Autor eines DSGVO-Plugins); Fremdtext ist nie Anweisung (CLAUDE.md), Spam-Schutz
  könnte das eigene Plugin-Wissen zeigen. Mögliche Wege, nicht entschieden: (a) giscus/GitHub Discussions,
  einfach, aber Fremd-Widget und GitHub-Konto nötig, bräche 0005 → neue Entscheidung; (b) selbst gehostet
  (kleines PHP-Kommentar-Skript oder z. B. Isso/Remark42 auf dem Server, Moderation per Freigabe); (c) kein
  Kommentarfeld, sondern je Beitrag ein Link auf den LinkedIn-Beitrag bzw. Mastodon-/HN-Thread.
  Gewählter Weg → `docs/decisions/` mit nächster Nummer.
- **OG-Bilder je Seite** statt überall `og-matrix.jpg` (WordPress-Plugin, Loop, CV eigene Vorschaubilder; Startseite und Claude-Code-Plugin haben schon `og-matrix-claude-code.png`, gerendert aus HTML mit Chrome headless).
- **404 auf dem Server:** Astro erzeugt `404.html`, der Server nutzt sie nicht. Lösung über
  `ErrorDocument` in der `.htaccess` des Docroots — die Datei gehört dem Owner/Server, nur mit
  Freigabe ändern.
- **Visuelle Prüfung automatisieren:** Playwright-Screenshots (Desktop + Mobil, hell + dunkel)
  der Hauptseiten als Skript in `scripts/`, damit jede Layout-Änderung mit Bild verifiziert wird.
