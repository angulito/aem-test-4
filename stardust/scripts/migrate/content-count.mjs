#!/usr/bin/env node
// content-count.mjs — content-count acceptance (fidelity-tiers.md § Content-count acceptance):
// live capture vs rendered file, document-level, scripts/styles/comments stripped.
// Usage: node content-count.mjs <slug> <rendered-file>   → one line: PASS/FAIL + counts
import fs from 'node:fs';
const [slug, rendered] = process.argv.slice(2);
const strip = (h) => h.replace(/<!--[\s\S]*?-->/g, '').replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');
const count = (h) => ({
  h1: (h.match(/<h1[\s>]/gi) || []).length, h2: (h.match(/<h2[\s>]/gi) || []).length, h3: (h.match(/<h3[\s>]/gi) || []).length,
  h4: (h.match(/<h4[\s>]/gi) || []).length, p: (h.match(/<p[\s>]/gi) || []).length, li: (h.match(/<li[\s>]/gi) || []).length,
  img: (h.match(/<img[\s>]/gi) || []).length, alt: (h.match(/<img[^>]*\salt="/gi) || []).length,
  'a[href]': (h.match(/<a\s[^>]*href=/gi) || []).length, button: (h.match(/<button[\s>]/gi) || []).length,
  text: h.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim().length,
});
const live = count(strip(fs.readFileSync(`stardust/current/pages/${slug}.html`, 'utf8')));
const out = count(strip(fs.readFileSync(rendered, 'utf8')));
const parts = []; let drops = 0;
for (const k of Object.keys(live)) { parts.push(`${k} ${live[k]}/${out[k]}`); if (out[k] < live[k]) drops++; else if (out[k] !== live[k]) drops += 0; }
let json = '';
try { const j = JSON.parse(fs.readFileSync(`stardust/current/pages/${slug}.json`, 'utf8')); if (j.allImgCount !== undefined) json = `; JSON allImgCount ${j.allImgCount} vs rendered img ${out.img}`; } catch {}
const mism = Object.keys(live).filter((k) => live[k] !== out[k]);
console.log(`${drops ? 'FAIL' : 'PASS'} ${slug}: ${parts.join(' ')}${json}${mism.length ? ` — mismatch on ${mism.join(',')}` : ''}`);
process.exit(drops ? 2 : 0);
