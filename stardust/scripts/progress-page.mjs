#!/usr/bin/env node
// Renders the customer status page tools/replica/progress.html from stardust/replica/status-page.json
// and stardust/.labs/run.json. Layout-only inline CSS using --spectrum-* vars; no JS; whole file rewritten.
import fs from 'node:fs';

const model = JSON.parse(fs.readFileSync('stardust/replica/status-page.json', 'utf8'));
const run = JSON.parse(fs.readFileSync('stardust/.labs/run.json', 'utf8'));
const now = new Date();
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const BADGE = {
  done: ['spectrum-badge spectrum-badge--positive', 'Done'],
  ready: ['spectrum-badge spectrum-badge--positive', 'Ready'],
  inprogress: ['spectrum-badge spectrum-badge--informative', 'In progress'],
  attention: ['spectrum-badge spectrum-badge--notice', 'Needs attention'],
  upcoming: ['spectrum-badge', 'Upcoming'],
};
const badge = (k) => { const [c, t] = BADGE[k] || BADGE.upcoming; return `<span class="${c}">${t}</span>`; };
const frac = (s) => (s === 'done' ? 1 : s === 'inprogress' ? 0.5 : 0);

const steps = model.steps; // analyze, brand, templates, fidelity, migrate
const templates = model.templates || [];
const pages = model.pages || [];
const total = model.totalPages || pages.length;
const ready = pages.filter((p) => p.ready).length;

const tFrac = templates.length ? templates.reduce((a, t) => a + (t.fraction ?? frac(t.status)), 0) / templates.length : frac(steps.templates);
const pct = Math.round(
  10 * (steps.analyzeFraction ?? frac(steps.analyze))
  + 10 * (steps.brandFraction ?? frac(steps.brand))
  + 40 * tFrac
  + 10 * (steps.fidelityFraction ?? frac(steps.fidelity))
  + 30 * (total ? ready / total : 0),
);

function fmtDur(ms) {
  const m = Math.round(ms / 60000);
  const h = Math.floor(m / 60); const r = m % 60;
  if (h === 0) return `${r} min`;
  return r ? `${h} h ${r} min` : `${h} h`;
}
function estimate() {
  if (pct >= 100) return 'Complete';
  if (pct < 10) return 'Estimating…';
  const started = new Date(run.startedAt).getTime();
  const deadline = new Date(run.deadlineAt).getTime();
  const elapsed = now.getTime() - started;
  const remaining = elapsed * (100 - pct) / pct;
  const q = 15 * 60000;
  const cap = Math.max(0, deadline - now.getTime());
  let lo = Math.max(q, Math.round(remaining * 0.8 / q) * q);
  let hi = Math.max(lo + q, Math.round(remaining * 1.3 / q) * q);
  lo = Math.min(lo, Math.floor(cap / q) * q);
  hi = Math.min(hi, Math.floor(cap / q) * q);
  if (hi <= 0) return 'Finishing up';
  if (lo <= 0 || lo === hi) return `About ${fmtDur(hi)} remaining`;
  return `About ${fmtDur(lo)} to ${fmtDur(hi)} remaining`;
}

const overall = model.attention ? 'attention' : (pct >= 100 ? 'ready' : 'inprogress');
const preview = run.previewUrl.replace(/\/$/, '');
const lastUpdated = now.toISOString().replace('T', ' ').slice(0, 16) + ' UTC';

const journey = [
  ['Analyzing your site', steps.analyze],
  ['Capturing brand and design', steps.brand],
  ['Rebuilding page templates', steps.templates],
  ['Checking fidelity', steps.fidelity],
  ['Migrating your pages', steps.migrate],
].map(([t, s]) => `        <li>${t}${badge(s)}</li>`).join('\n');

const tRows = templates.length
  ? templates.map((t) => `        <tr><td>${esc(t.name)}</td><td>${t.pages}</td><td>${esc(t.desktop || '—')}</td><td>${esc(t.mobile || '—')}</td><td>${badge(t.status)}</td></tr>`).join('\n')
  : '        <tr><td colspan="5">We\'re identifying your page templates now.</td></tr>';

const readyPages = pages.filter((p) => p.ready);
const pageList = readyPages.length
  ? `      <ul class="pages">\n${readyPages.map((p) => `        <li><a href="${esc(preview + p.path)}">${esc(p.title || p.path)}</a></li>`).join('\n')}\n      </ul>`
  : '      <p>No pages are live on the preview site yet.</p>';
const detailsOpen = total > 12 ? '' : ' open';

const html = `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Migration status</title>
<link rel="stylesheet" href="spectrum.css">
<style>
  body { background-color: var(--spectrum-bg-app); }
  main { max-width: 760px; margin: 0 auto; padding: 40px 24px 64px; }
  header { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
  .meta { color: var(--spectrum-text-subdued); margin: 0 0 24px; }
  .spectrum-panel { margin-bottom: 16px; }
  .spectrum-panel-header { margin: 0; padding: 0 16px; }
  .panel-body { padding: 16px; }
  .panel-body > :last-child { margin-bottom: 0; }
  .bar { height: 8px; border-radius: 9999px; background-color: var(--spectrum-gray-200); overflow: hidden; }
  .bar span { display: block; height: 100%; background-color: var(--spectrum-accent-bg); }
  .estimate { color: var(--spectrum-text-subdued); margin: 8px 0 0; }
  .pct { margin: 0 0 8px; }
  ol.steps { list-style: none; padding: 0; margin: 0; }
  ol.steps li { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 0; }
  ol.steps li + li { border-top: 1px solid var(--spectrum-gray-200); }
  table { width: 100%; border-collapse: collapse; }
  th, td { padding: 8px; text-align: left; border-bottom: 1px solid var(--spectrum-gray-200); }
  th { color: var(--spectrum-text-subdued); }
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
  <p class="meta">Source site: <a href="${esc(run.scope.sourceUrl)}">${esc(run.scope.sourceUrl)}</a><br>Preview site: <a href="${esc(run.previewUrl)}">${esc(run.previewUrl)}</a><br>Last updated: ${lastUpdated}</p>

  <section class="spectrum-panel">
    <h2 class="spectrum-panel-header">Journey</h2>
    <div class="panel-body">
      <ol class="steps">
${journey}
      </ol>
    </div>
  </section>

  <section class="spectrum-panel">
    <h2 class="spectrum-panel-header">Page templates</h2>
    <div class="panel-body">
      <table>
        <thead><tr><th>Template</th><th>Pages</th><th>Desktop</th><th>Mobile</th><th>Status</th></tr></thead>
        <tbody>
${tRows}
        </tbody>
      </table>
    </div>
  </section>

  <section class="spectrum-panel">
    <h2 class="spectrum-panel-header">Pages migrated</h2>
    <div class="panel-body">
      <details${detailsOpen}>
        <summary>${ready} of ${total} pages are ready on the preview site</summary>
${pageList}
      </details>
    </div>
  </section>

  <section class="spectrum-panel">
    <h2 class="spectrum-panel-header">Progress</h2>
    <div class="panel-body">
      <p class="pct">${pct}% complete</p>
      <div class="bar"><span style="width: ${pct}%"></span></div>
      <p class="estimate">${estimate()}</p>
    </div>
  </section>

  <section class="spectrum-panel">
    <h2 class="spectrum-panel-header">What's happening now</h2>
    <div class="panel-body">
      <p>${esc(model.now)}</p>${model.attention ? '\n      <p>Some pages need a closer look; we\'re on it.</p>' : ''}
    </div>
  </section>

  <section class="spectrum-panel">
    <h2 class="spectrum-panel-header">What's next</h2>
    <div class="panel-body">
      <p>${esc(model.next)}</p>
    </div>
  </section>
</main>
</body>
</html>
`;
fs.mkdirSync('tools/replica', { recursive: true });
fs.writeFileSync('tools/replica/progress.html', html);
console.log(`progress.html written: ${pct}% · ${overall} · ${ready}/${total} pages · ${estimate()}`);
