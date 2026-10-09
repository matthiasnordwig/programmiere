# 0003 — Veröffentlichen nur mit Freigabe (Publish-Gate)

**Status:** ersetzt durch 0008 · 2026-10-10

**Kontext.** Veröffentlichen ist nach außen gerichtet und praktisch nicht umkehrbar (Caches,
Feeds, Crawler). Gleiches Prinzip wie im Maintainer-Loop: das Modell schlägt vor, eine
deterministische Instanz und ich entscheiden.

**Entscheidung.** Push auf `main` ist die Veröffentlichung. Neue Beiträge haben `draft: true`
(Schema-Default) und entstehen auf `post/<slug>`. `draft: false`, Merge und Push nur nach
meinem ausdrücklichen „ja" in der laufenden Session. Durchgesetzt, nicht erinnert:
`ask`-Regeln für `git push`/`gh pr merge` in `.claude/settings.json` plus
`.claude/hooks/publish-gate.sh` für Varianten (`git -C . push`, Ketten). Drafts erscheinen nie
im Build und nie im RSS.

**Konsequenzen.** Ein geplanter (unbeaufsichtigter) Lauf kann Entwürfe schreiben und
committen, aber nie veröffentlichen — er endet mit einer Meldung an mich. Freigabe kostet mich
ein Wort. Wird das Repo öffentlich, ist auch ein gepushter Draft-Branch sichtbar — deshalb
gilt das Gate für jeden Push, nicht nur für `main`.
