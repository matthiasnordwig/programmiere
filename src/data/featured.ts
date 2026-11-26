// Beiträge, die die Startseite mit Bild hervorhebt (je ein Abschnitt nach den beiden Matrix-Blöcken,
// in dieser Reihenfolge; das Bild wechselt die Seite). Steht bewusst hier und nicht im Frontmatter:
// Diese Auswahl ist eine Änderung an der Seite und geht mit `npm run ship` raus; Änderungen unter
// src/content/posts/ gehen nur über das Gate (0008).
// Eintrag: `post` = Datei-ID (Dateiname ohne .md), Bilder unter public/writing/<slug>/. Leere Liste
// blendet die Abschnitte aus. Ist ein Beitrag nicht (mehr) veröffentlicht, entfällt er von selbst.
// Bilder breit (etwa 16:9), am besten mit transparentem Hintergrund und je einer Fassung für hell und
// dunkel, ohne Animation; ein deckendes Bild ohne Dunkel-Fassung steht im Rahmen `.pic`.
export type Featured = {
  post: string;
  image: string;
  imageDark?: string;
  width: number;
  height: number;
};

export const FEATURED: Featured[] = [
  {
    post: 'nobody-actually-noticed',
    image: '/writing/nobody-actually-noticed/treppchen-1600x900.png',
    width: 1600,
    height: 900,
  },
  {
    post: 'ein-ganz-normaler-tag',
    image: '/writing/ein-ganz-normaler-tag/home-light.png',
    imageDark: '/writing/ein-ganz-normaler-tag/home-dark.png',
    width: 1200,
    height: 669,
  },
];
