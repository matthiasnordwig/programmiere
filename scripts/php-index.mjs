#!/usr/bin/env node
// Nach dem Build: jede index.html in dist/ wird zu index.php umbenannt.
// Grund (gemessen, nicht vermutet): der Webserver von programmiere.de kennt als
// DirectoryIndex nur index.php — eine index.html beantwortet er mit 403
// (gdpr-recaptcha/server/README.md, Vorfall 2026-09-24). PHP gibt reines HTML unverändert aus.
// Sicherheitsnetz: enthält eine Seite "<?", würde PHP sie als Code lesen — dann bricht der
// Lauf ab, statt eine kaputte Seite auszuliefern.
import { readdirSync, readFileSync, renameSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIST = process.argv[2] || 'dist';
let n = 0;
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) { walk(p); continue; }
    if (name !== 'index.html') continue;
    if (readFileSync(p, 'utf8').includes('<?')) {
      console.error(`php-index: "${p}" enthält "<?" — würde als PHP ausgeführt. Abbruch.`);
      process.exit(1);
    }
    renameSync(p, join(dir, 'index.php'));
    n++;
  }
}
walk(DIST);
console.log(`php-index: ${n} Seiten als index.php`);
