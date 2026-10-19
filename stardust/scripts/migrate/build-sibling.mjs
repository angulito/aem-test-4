#!/usr/bin/env node
// build-sibling.mjs — Path A′ clone recipe (stardust/migrate/plan.md § Clone recipe):
// archetype prototype's <head> (title + description swapped for the sibling's captured values)
// and chrome verbatim; <main> = the sibling's captured live <main> verbatim, with only
// src="/images/…" → assets/images/… and any inline <script> inside main removed (logged).
// Usage: node build-sibling.mjs <slug> <archetype-slug> [--out stardust/migrate/siblings]
import fs from 'node:fs';
import path from 'node:path';
const [slug, arch] = process.argv.slice(2);
if (!slug || !arch) { console.error('usage: build-sibling.mjs <slug> <archetype-slug>'); process.exit(1); }
const outDir = (process.argv.indexOf('--out') > 0) ? process.argv[process.argv.indexOf('--out') + 1] : 'stardust/migrate/siblings';
const proto = fs.readFileSync(`stardust/prototypes/${arch}-proposed.html`, 'utf8');
const live = fs.readFileSync(`stardust/current/pages/${slug}.html`, 'utf8');
const attr = (html, re) => { const m = html.match(re); return m ? m[1] : null; };
const liveTitle = attr(live, /<title>([^<]*)<\/title>/i);
const liveDesc = attr(live, /<meta\s+name="description"\s+content="([^"]*)"/i);
let liveMain = attr(live, /(<main[^>]*>[\s\S]*?<\/main>)/i);
if (!liveMain) { console.error('no <main> in live capture'); process.exit(1); }
let scriptsDropped = 0;
liveMain = liveMain.replace(/<script[\s\S]*?<\/script>/gi, () => { scriptsDropped++; return ''; });
const imgs = (liveMain.match(/src="\/images\//g) || []).length;
liveMain = liveMain.replace(/src="\/images\//g, 'src="assets/images/');
let out = proto.replace(/(<main[^>]*>)[\s\S]*?<\/main>/i, () => liveMain);
if (liveTitle) out = out.replace(/<title>[^<]*<\/title>/i, `<title>${liveTitle}</title>`);
if (liveDesc) out = out.replace(/(<meta\s+name="description"\s+content=")[^"]*(")/i, `$1${liveDesc}$2`);
fs.mkdirSync(outDir, { recursive: true });
const file = path.join(outDir, `${slug}.html`);
fs.writeFileSync(file, out);
console.log(`${slug} ← ${arch}: ${file} (title ${JSON.stringify(liveTitle)}, ${imgs} image srcs remapped, ${scriptsDropped} inline main scripts dropped, main ${liveMain.length} chars)`);
