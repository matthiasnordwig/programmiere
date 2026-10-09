---
name: diy-post
description: Macht aus Fotos und einer Sprachnotiz in inbox/diy/<ordner>/ einen DIY-Beitragsentwurf für programmiere.de. Nutzen, wenn neues DIY-Material im Eingang liegt oder ein DIY-Post gewünscht ist.
---

# DIY-Beitrag schreiben

1. **Material:** `inbox/diy/<ordner>/notes.md` (Transkript) lesen, Fotos ansehen. Fehlt das
   Transkript, nur aus den Fotos schreiben, was sicher erkennbar ist — nichts erfinden.
2. **Bilder:** nur verwendete übernehmen, auf max. 1600 px Kante verkleinern, EXIF/GPS
   entfernen (`sips`/`exiftool`, sonst Python/Pillow), nach `src/assets/posts/<slug>/`.
   Keine Gesichter oder Adressen Dritter.
3. **Schreiben** nach `.claude/rules/writing.md`: was gebaut wurde, warum, Material/Werkzeug,
   die Schritte, was schiefging, Ergebnis. Bilder mit Alt-Text.
4. **Ablegen und veröffentlichen:** `type: diy`, `project: diy`, `draft: true`, Branch
   `post/<slug>`, `npm run build` grün, committen. Dann das **Gate**: Agent `publish-reviewer` mit dem Dateipfad aufrufen → bei `VERDICT: FAIL`
   die Befunde **einmal** einarbeiten, committen, erneut prüfen lassen → bei PASS
   `npm run publish -- <datei>` (Check, `draft: false`, Build, Merge, Push); scheitert der
   Check, Befund beheben und noch einmal. Bleibt es bei FAIL: Entwurf liegen lassen, nichts
   pushen. Ergebnis in **einem** Satz melden (veröffentlicht: Titel + URL, oder: nicht
   veröffentlicht + Grund). Keine Rückfragen.
