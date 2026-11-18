// Untertitel des Matrix-App-Videos (WebVTT unter public/projects/matrix/, erzeugt im Videoprojekt aus den Tafeln der Fassung).
export const MATRIX_VIDEO_TRACKS = [
  ['en', 'English'], ['de', 'Deutsch'], ['es', 'Español'], ['fr', 'Français'], ['it', 'Italiano'],
  ['nl', 'Nederlands'], ['pt-BR', 'Português (Brasil)'], ['ja', '日本語'], ['ko', '한국어'],
].map(([lang, label]) => ({ lang, label, src: `/projects/matrix/matrix-video.${lang}.vtt` }));
