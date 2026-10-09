# 0008 — Veröffentlichen vollautomatisch, über ein zweistufiges Gate

**Status:** gilt · 2026-10-10 · **ersetzt 0003**

**Kontext.** Owner-Vorgabe: alles läuft vollautomatisch, keine Einzelfragen, keine
Handgriffe. Die menschliche Freigabe aus 0003 entfällt damit. Das Prinzip aus dem
Maintainer-Loop bleibt — das Modell schlägt vor, eine deterministische Instanz entscheidet —
nur sitzt an der Stelle des Menschen jetzt ein zweites, unabhängiges Modell plus ein Check.

**Entscheidung.** Ein Beitrag wird nur veröffentlicht, wenn **beide** Stufen bestehen:
1. **Review** durch den Agent `publish-reviewer` (eigenes Modell, hat den Text nicht
   geschrieben): Vertraulichkeit (0006), Fakten gegen die Quellen, Schreibregeln. FAIL → der
   Schreiber bessert **einmal** nach, zweites Review; erneut FAIL → bleibt Entwurf, kein
   Push, nächster Lauf darf es wieder versuchen.
2. **`scripts/publish-check.mjs`** (ohne Modell): Pflichtfelder, Mindestlänge, keine offenen
   REVIEW-Marker/Platzhalter, keine Zugangsdaten, lokalen Pfade, privaten IPs, fremden
   E-Mails, keine Begriffe aus `config/confidential-terms.txt`.
Danach setzt `scripts/publish.sh` `draft: false`, baut, merged nach `main` und pusht. Das ist
der **einzige** Weg nach außen: direkte Pushes verweigert `.claude/hooks/publish-gate.sh`.

**Akzeptiertes Restrisiko.** Kein Mensch liest vor der Veröffentlichung. Ein Fehler, den
Schreiber *und* Reviewer übersehen und den der Check nicht kennt, geht online. Gegenmittel:
gesperrte Quellen (`.claude/settings.json`), strenger Reviewer, die Begriffsliste wächst mit
jedem Fund. Änderungen an der Seite selbst (Layout, Lebenslauf, Projektseiten, Doku) gehen über
`npm run ship` (`scripts/ship-site.sh`), das Beitragsänderungen verweigert.
Zurücknehmen: `scripts/unpublish.sh <beitrag> "<grund>"` — nur auf ausdrückliche
Owner-Anweisung.

**Konsequenzen.** Geplante Läufe brauchen keine Rückfrage. Der Owner wird nur benachrichtigt,
wenn ein Lauf etwas veröffentlicht hat oder nicht arbeiten konnte.
