#!/usr/bin/env node
// Deterministischer Teil des Publish-Gates (docs/decisions/0008-automated-publish-gate.md).
// Prüft einen Beitrag, BEVOR er veröffentlicht wird. Exit 0 = darf raus, 1 = darf nicht.
// Absichtlich ohne Modell: was hier steht, kann kein Prompt wegdiskutieren.
// Aufruf: node scripts/publish-check.mjs src/content/posts/<datei>.md
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OWN_EMAIL = 'matthias.nordwig@programmiere.de';
const file = process.argv[2];
if (!file) { console.error('usage: publish-check.mjs <post.md>'); process.exit(2); }

const src = readFileSync(file, 'utf8');
const m = src.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
const problems = [];
if (!m) problems.push('kein Frontmatter');
const fm = m ? m[1] : '';
const body = m ? m[2] : src;
for (const key of ['title', 'description', 'date', 'type']) {
  if (!new RegExp(`^${key}:\\s*\\S`, 'm').test(fm)) problems.push(`Frontmatter-Feld fehlt: ${key}`);
}
const words = body.replace(/```[\s\S]*?```/g, '').split(/\s+/).filter(Boolean).length;
const type = (fm.match(/^type:\s*(\S+)/m) || [])[1];
const MIN = { 'deep-dive': 800, 'build-log': 120, diy: 120 };
if (type && MIN[type] && words < MIN[type]) problems.push(`zu kurz für ${type}: ${words} Wörter (< ${MIN[type]})`);

const text = src;
const rules = [
  [/<!--\s*REVIEW/i, 'offener REVIEW-Marker'],
  [/\b(TODO|FIXME|TBD|XXX)\b/, 'Platzhalter (TODO/FIXME/TBD/XXX)'],
  [/(sk-[A-Za-z0-9_-]{20,}|ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{20,}|AKIA[0-9A-Z]{16}|xox[abprs]-[A-Za-z0-9-]{10,}|-----BEGIN [A-Z ]*PRIVATE KEY)/, 'sieht nach Zugangsdaten aus'],
  [/(\/Users\/[A-Za-z]|\/home\/[a-z]|C:\\Users\\)/, 'lokaler Benutzerpfad'],
  [/\b(10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})\b/, 'private IP-Adresse'],
];
for (const [re, why] of rules) if (re.test(text)) problems.push(why);

const emails = [...text.matchAll(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g)].map((x) => x[0]);
const foreign = emails.filter((e) => e.toLowerCase() !== OWN_EMAIL && !/@(example\.(com|org)|anthropic\.com)$/i.test(e));
if (foreign.length) problems.push(`fremde E-Mail-Adresse(n): ${[...new Set(foreign)].join(', ')}`);

const terms = readFileSync(join(ROOT, 'config/confidential-terms.txt'), 'utf8')
  .split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
for (const t of terms) if (text.toLowerCase().includes(t.toLowerCase())) problems.push(`gesperrter Begriff: "${t}"`);

if (problems.length) {
  console.error(`publish-check: NICHT freigegeben — ${file}\n  - ${problems.join('\n  - ')}`);
  process.exit(1);
}
console.log(`publish-check: ok — ${file} (${words} Wörter)`);
