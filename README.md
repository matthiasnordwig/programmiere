# programmiere.de

Persönliche Seite von Matthias Nordwig — Projekte, Beiträge, Lebenslauf. Astro, statisch,
ausgeliefert auf den eigenen Server.

```sh
npm install
npm run dev        # lokal, zeigt auch Entwürfe
npm run build      # Build nach dist/ (prüft das Frontmatter-Schema)
npm run ship       # Seitenänderungen nach GitHub pushen (keine Beiträge)
npm run publish -- src/content/posts/<datei>.md   # Beitrag über das Gate veröffentlichen
bash scripts/deploy-own-server.sh                  # auf den Server ausliefern (nur auf dem Mac)
```

Einstieg für Claude Code und Menschen: `CLAUDE.md` (Arbeitsweise), `HANDBUCH.md` (Architektur),
`docs/POSITIONING.md` (wofür die Seite steht), `BACKLOG.md` / `ISSUES.md`, `docs/decisions/`.
