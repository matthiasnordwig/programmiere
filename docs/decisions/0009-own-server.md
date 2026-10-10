# 0009 — Hosting auf dem eigenen Webserver

**Status:** gilt · 2026-10-10 · **ersetzt den Hosting-Teil von 0002** (GitHub Pages)

**Kontext.** Owner-Vorgabe: Die Inhalte gehören auf den eigenen Server, nicht zu einem
Dritten. programmiere.de liegt schon dort: whistle-blower.net (178.20.101.171), User `web412`,
Docroot `~/html/programmiere/` — daneben leben `impressum/` und `GDPRCompliantRecaptcha/`
(Feedback-Empfänger des Plugins), Daten eine Ebene über dem Docroot.

**Entscheidung.** GitHub bleibt Quelle der Wahrheit und prüft jeden Push (Build check), liefert
aber nichts aus. Ausgeliefert wird vom Mac per `scripts/deploy-own-server.sh`: Stand holen,
bauen, jede `index.html` → `index.php` (der Server kennt nur index.php als DirectoryIndex und
antwortet sonst 403), rsync per eigenem Deploy-Schlüssel.
- Schlüssel: `.deploy/id_ed25519` auf dem Mac (gitignored), Host-Schlüssel gepinnt in
  `.deploy/known_hosts`. Der private Schlüssel verlässt den Mac nie; GitHub-Secrets wären der
  andere Weg, sind aus der Claude-Umgebung aber nicht setzbar.
- Fremdes bleibt unberührt: `--delete` nur in den Verzeichnissen, die die Seite selbst erzeugt
  (`_astro`, `writing`, `projects`, `cv`, `null-device`, `about`); Wurzeldateien werden nur
  überschrieben.

**Konsequenzen.** Auslieferung braucht den Mac (wie die geplanten Läufe ohnehin). `publish.sh`
und `ship-site.sh` pushen nach GitHub; der Lauf ruft danach `deploy-own-server.sh` auf dem Mac
auf. Einmalig nötig: den öffentlichen Deploy-Schlüssel in `~/.ssh/authorized_keys` von `web412`
eintragen (Owner, per bestehendem SSH-Zugang).
