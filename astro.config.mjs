// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://programmiere.de',
  // Astro 7 defaults to JSX whitespace rules, which drop the space at a line break before a link or <code>
  // ("is in<a>DEMO.md</a>"). true keeps one space, as before Astro 7.
  compressHTML: true,
  integrations: [sitemap()],
  markdown: { shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' } } },
});
