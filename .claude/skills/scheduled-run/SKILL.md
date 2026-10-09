---
name: scheduled-run
description: Ablauf eines geplanten, unbeaufsichtigten Laufs für programmiere.de (Build Log oder Deep Dive) in einer Cloud-Sitzung mit verbundenem Mac — Repo holen, Quellen über das Gerät lesen, Beitrag schreiben, Gate, veröffentlichen, lokale Kopie nachziehen, eine Zeile melden.
---

# Geplanter Lauf (unbeaufsichtigt)

Niemand schaut zu, niemand beantwortet Fragen. Entscheiden, im Ergebnis nennen
(`docs/decisions/0008`). Der Auftrag des Laufs nennt die Art: `build-log` oder `deep-dive`
(optional mit Thema).

## 1. Arbeitskopie

- Repo `matthiasnordwig/programmiere` mit Push-Zugriff anhängen (`add_repo`, access `push`),
  nach `/home/claude/programmiere` klonen, dort `npm ci`.
- `CLAUDE.md`, `SOURCES.md` und den Skill der Beitragsart (`.claude/skills/<art>/SKILL.md`)
  lesen. Hooks und Agent-Definitionen dieses Repos sind in der Cloud-Sitzung evtl. nicht
  geladen — ihre Regeln gelten trotzdem und werden hier von Hand eingehalten.

## 2. Quellen (über den verbundenen Mac, nur lesen)

Die Projekt-Repos liegen auf dem Mac und sind per `device_bash` erreichbar:

| In `SOURCES.md` | Im Lauf |
|---|---|
| `~/matrix` | `$HOME/mnt/matrix` |
| `~/wp-plugins/gdpr-recaptcha` | `$HOME/mnt/gdpr-recaptcha` |
| `~/projects/programmiere` | `$HOME/mnt/projects/programmiere` (lokale Kopie dieses Repos) |

Dort **nichts schreiben** außer dem Nachziehen der lokalen Kopie (Schritt 4). Die
Tabu-Listen aus `SOURCES.md` gelten — `device_bash` kennt die Lesesperren aus
`.claude/settings.json` nicht, also selbst einhalten. Ist der Mac nicht erreichbar: nichts
schreiben, nur das melden.

## 3. Beitrag, Gate, Veröffentlichen

Skill der Beitragsart befolgen. Das Review macht ein **eigener Subagent** (`Agent`,
`model: opus`), dem der Inhalt von `.claude/agents/publish-reviewer.md` als Anweisung, der
Dateipfad und die Quellen-Zuordnung aus Schritt 2 mitgegeben werden — nie der schreibende
Kontext selbst. Veröffentlicht wird ausschließlich mit `npm run publish -- <datei>`; nie
direkt `git push`.

Danach den Deploy prüfen: `gh run list -R matthiasnordwig/programmiere --limit 1`, bei
Bedarf warten (`gh run watch <id>`). Fehlgeschlagen → in der Meldung nennen.

## 4. Lokale Kopie nachziehen

`device_bash`: `git -C $HOME/mnt/projects/programmiere pull --ff-only`. Scheitert das
(lokale Änderungen), nichts erzwingen, nur melden.

## 5. Meldung

Genau **eine** Zeile über `SendUserMessage`:
- veröffentlicht: `Neu auf programmiere.de: <Titel> — https://programmiere.de/writing/<id>/`
- nicht veröffentlicht: `programmiere.de: kein Beitrag — <Grund in wenigen Worten>`
Keine Details, keine Rückfragen.
