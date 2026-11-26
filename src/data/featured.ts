// Ein Beitrag, den die Startseite mit Bild hervorhebt (Abschnitt nach den beiden Matrix-Blöcken).
// Steht bewusst hier und nicht im Frontmatter des Beitrags: Diese Auswahl ist eine Änderung an der
// Seite und geht mit `npm run ship` raus; Änderungen unter src/content/posts/ gehen nur über das Gate (0008).
// Wechseln: `post` auf die Datei-ID (Dateiname ohne .md) setzen, Bilder unter public/writing/<slug>/.
// `null` blendet den Abschnitt aus. Ist der Beitrag nicht (mehr) veröffentlicht, entfällt er von selbst.
// Bilder breit (etwa 16:9), transparenter Hintergrund, je eine Fassung für hell und dunkel, ohne Animation.
export type Featured = {
  post: string;
  image: string;
  imageDark?: string;
  width: number;
  height: number;
};

export const FEATURED: Featured | null = {
  post: 'nobody-actually-noticed',
  image: '/writing/nobody-actually-noticed/treppchen-1600x900.png',
  width: 1600,
  height: 900,
};
