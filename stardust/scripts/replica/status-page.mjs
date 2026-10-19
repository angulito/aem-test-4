#!/usr/bin/env node
// status-page.mjs — rewrites tools/replica/progress.html (customer-facing status page) whole.
// Usage: node status-page.mjs --rendered a,b --delivered a,b --now "…" --next "…" [--state "In progress"]
//        [--step5 "In progress"] [--attention]
import fs from 'node:fs';
const arg = (k, d = '') => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const run = JSON.parse(fs.readFileSync('stardust/.labs/run.json', 'utf8'));
const state = JSON.parse(fs.readFileSync('stardust/state.json', 'utf8'));
const pages = state.pages.map((p) => ({ slug: p.slug, type: p.type, path: new URL(p.url).pathname }));
const rendered = new Set(arg('--rendered').split(',').filter(Boolean));
const delivered = new Set(arg('--delivered').split(',').filter(Boolean));
const overall = arg('--state', 'In progress');
const attention = process.argv.includes('--attention');
const step5 = arg('--step5', 'In progress');
const M = pages.length;
// percent: 10 + 10 + 40 (4 templates done) + 10 + 30 split per page (rendered = half, delivered = full)
const perPage = 30 / M;
let mig = 0; for (const p of pages) mig += delivered.has(p.slug) ? perPage : rendered.has(p.slug) ? perPage / 2 : 0;
const pct = Math.min(100, Math.round(10 + 10 + 40 + 10 + mig));
const now = new Date();
const started = new Date(run.startedAt), deadline = new Date(run.deadlineAt);
let estimate = 'Estimating…';
if (pct >= 10 && pct < 100) {
  const elapsedMin = (now - started) / 60000;
  const remain = elapsedMin * (100 - pct) / pct;
  const q = (m) => Math.max(15, Math.round(m / 15) * 15);
  const lo = q(remain * 0.8), hi = q(remain * 1.3);
  const capMin = Math.max(0, (deadline - now) / 60000);
  const fmt = (m) => { m = Math.min(m, Math.floor(capMin / 15) * 15); const h = Math.floor(m / 60), r = m % 60; return h ? `${h} h${r ? ` ${r} min` : ''}` : `${r} min`; };
  estimate = lo === hi ? `About ${fmt(lo)} remaining` : `About ${fmt(lo)} to ${fmt(hi)} remaining`;
} else if (pct >= 100) estimate = 'Complete';
const badge = (s) => s === 'Done' || s === 'Ready' ? `<span class="spectrum-badge spectrum-badge--positive">${s}</span>` : s === 'In progress' ? `<span class="spectrum-badge spectrum-badge--informative">${s}</span>` : s === 'Needs attention' ? `<span class="spectrum-badge spectrum-badge--notice">${s}</span>` : `<span class="spectrum-badge">${s}</span>`;
const templates = [
  ['Home and landing pages', 'landing'], ['Blog listing pages', 'listing'], ['Blog articles', 'article'], ['FAQ and support page', 'static'],
].map(([name, t]) => ({ name, n: pages.filter((p) => p.type === t).length }));
const ready = pages.filter((p) => delivered.has(p.slug));
const preview = run.previewUrl.replace(/\/$/, '');
const html = `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Migration status — WKND Trendsetters</title>
<link rel="stylesheet" href="spectrum.css">
<style>
  main { max-width: 760px; margin: 0 auto; padding: 40px 24px 64px; }
  header { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
  .meta { margin: 0 0 24px; }
  .spectrum-panel { margin-bottom: 16px; }
  .spectrum-panel-header { margin: 0; padding: 0 16px; }
  .panel-body { padding: 16px; }
  .panel-body > :last-child { margin-bottom: 0; }
  .bar { height: 8px; border-radius: 9999px; background-color: var(--spectrum-gray-200); overflow: hidden; }
  .bar span { display: block; height: 100%; background-color: var(--spectrum-accent-bg); }
  .estimate { margin: 8px 0 0; }
  .pct { margin: 0 0 8px; }
  ol.steps { list-style: none; padding: 0; margin: 0; }
  ol.steps li { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 0; }
  ol.steps li + li { border-top: 1px solid var(--spectrum-gray-200); }
  table { width: 100%; border-collapse: collapse; }
  th, td { padding: 8px; text-align: left; border-bottom: 1px solid var(--spectrum-gray-200); }
  ul.pages { margin: 8px 0 0; padding-left: 20px; }
  ul.pages li { padding: 2px 0; }
  details summary { cursor: pointer; }
</style>
</head>
<body>
<main>
  <header>
    <h1>Migration status</h1>
    ${badge(overall)}
  </header>
  <p class="meta">Source site: <a href="${run.scope.sourceUrl}">${run.scope.sourceUrl}</a><br>Preview site: <a href="${run.previewUrl}">${run.previewUrl}</a><br>Last updated: ${now.toISOString().slice(0, 16).replace('T', ' ')} UTC</p>

  <section class="spectrum-panel">
    <h2 class="spectrum-panel-header">Journey</h2>
    <div class="panel-body">
      <ol class="steps">
        <li>Analyzing your site${badge('Done')}</li>
        <li>Capturing brand and design${badge('Done')}</li>
        <li>Rebuilding page templates${badge('Done')}</li>
        <li>Checking fidelity${badge('Done')}</li>
        <li>Migrating your pages${badge(step5)}</li>
      </ol>
    </div>
  </section>

  <section class="spectrum-panel">
    <h2 class="spectrum-panel-header">Page templates</h2>
    <div class="panel-body">
      <table>
        <thead><tr><th>Template</th><th>Pages</th><th>Desktop</th><th>Mobile</th><th>Status</th></tr></thead>
        <tbody>
${templates.map((t) => `        <tr><td>${t.name}</td><td>${t.n}</td><td>Looks right</td><td>Looks right</td><td>${badge('Done')}</td></tr>`).join('\n')}
        </tbody>
      </table>
    </div>
  </section>

  <section class="spectrum-panel">
    <h2 class="spectrum-panel-header">Pages migrated</h2>
    <div class="panel-body">
      <details${M > 12 ? '' : ' open'}>
        <summary>${ready.length} of ${M} pages are ready on the preview site</summary>
${ready.length ? `        <ul class="pages">\n${ready.map((p) => `          <li><a href="${preview}${p.path}">${p.path}</a></li>`).join('\n')}\n        </ul>` : '        <p>Links to each page will appear here as it goes live on the preview site.</p>'}
      </details>
    </div>
  </section>

  <section class="spectrum-panel">
    <h2 class="spectrum-panel-header">Progress</h2>
    <div class="panel-body">
      <p class="pct">${pct}% complete</p>
      <div class="bar"><span style="width: ${pct}%"></span></div>
      <p class="estimate">${estimate}</p>
    </div>
  </section>

  <section class="spectrum-panel">
    <h2 class="spectrum-panel-header">What's happening now</h2>
    <div class="panel-body">
      <p>${arg('--now')}</p>${attention ? '\n      <p>Some pages need a closer look; we\'re on it.</p>' : ''}
    </div>
  </section>

  <section class="spectrum-panel">
    <h2 class="spectrum-panel-header">What's next</h2>
    <div class="panel-body">
      <p>${arg('--next')}</p>
    </div>
  </section>
</main>
</body>
</html>
`;
fs.writeFileSync('tools/replica/progress.html', html);
console.log(`progress.html: ${pct}% · ${ready.length}/${M} ready · ${estimate}`);
