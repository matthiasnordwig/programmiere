---
name: diy-post
description: Macht aus Fotos und einer Sprachnotiz in inbox/diy/<ordner>/ einen DIY-Beitragsentwurf für programmiere.de. Nutzen, wenn neues DIY-Material im Eingang liegt oder ein DIY-Post gewünscht ist.
---

# DIY-Beitrag schreiben

1. **Material:** `inbox/diy/<ordner>/notes.md` (Transkript) lesen, Fotos ansehen. Fehlt das
   Transkript, aus den Fotos nur eine Gliederung + Fragen an mich schreiben.
2. **Bilder:** nur verwendete übernehmen, auf max. 1600 px Kante verkleinern, EXIF/GPS
   entfernen (`sips`/`exiftool`, sonst Python/Pillow), nach `src/assets/posts/<slug>/`.
   Keine Gesichter oder Adressen Dritter.
3. **Schreiben** nach `.claude/rules/writing.md`: was gebaut wurde, warum, Material/Werkzeug,
   die Schritte, was schiefging, Ergebnis. Bilder mit Alt-Text.
4. **Ablegen:** `type: diy`, `project: diy`, `draft: true`, Branch `post/<slug>`, committen,
   nicht pushen, `npm run build` grün. Melden mit offenen Fragen.
