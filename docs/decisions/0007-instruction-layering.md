# 0007 — Wie die Anweisungen für Claude Code geschichtet sind

**Status:** gilt · 2026-10-10

**Entscheidung.** Eine einzige `CLAUDE.md`, keine `AGENTS.md` (Claude Code liest `AGENTS.md`
nicht, sobald eine `CLAUDE.md` existiert — zwei Dateien wären zwei Wahrheiten; kommt ein
zweites Werkzeug dazu: `AGENTS.md` als einzige Quelle, `CLAUDE.md` = `@AGENTS.md`).
Schichtung nach Ladeverhalten:
- `CLAUDE.md` — lädt immer, darum kurz (< 200 Zeilen): Grenzen, Struktur, Verweise.
- `docs/decisions/` — Begründungen, nur bei Bedarf gelesen, **nie importiert**.
- `.claude/skills/` — Abläufe, laden nur wenn gebraucht.
- `.claude/rules/` mit `paths:` — Regeln, die nur bei bestimmten Dateien gelten (Schreibstil).
- `.claude/settings.json` + Hooks — was hart gelten muss (Publish-Gate, Lesesperren).
- `SOURCES.md` — Quellenkarte statt Repo-Durchsuchen (Token sparen, wie die Handbuch-Indizes).
- `HANDBUCH.md` — Architektur-Index (Ordner → Datei → Funktion), wie in Matrix und im Plugin;
  `BACKLOG.md` (vorwärts) und `ISSUES.md` (rückblickend) als Arbeitslisten (seit 2026-10-23).
- `docs/POSITIONING.md` — inhaltliche Leitplanke: wofür die Seite steht, für wen, Ton.
- Claude Codes eigenes Auto-Memory wird nicht nachgebaut.

**Konsequenzen.** Neue Regel → erst fragen, welche Schicht; „muss gelten" gehört in
Settings/Hooks, nicht in Prosa.
