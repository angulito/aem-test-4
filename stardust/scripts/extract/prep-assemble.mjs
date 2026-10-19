#!/usr/bin/env node
// prep-assemble.mjs — extract --prep post-pass over the captured records (offline; no live probe):
//   * page typing (LLM-inferred table below, per state-machine.md § Page types)
//   * typed `slots` section appended to every pages/<slug>.json (prep-mode.md § 4)
//   * module candidates → stardust/.work/replica/modules.json (merged into DESIGN.json.extensions.modules[])
//   * stardust/state.json (state-machine.md schema; live-render provenance enforced before `extracted`)
import fs from 'node:fs';

const cur = 'stardust/current';
const now = new Date().toISOString();
const log = JSON.parse(fs.readFileSync(`${cur}/_crawl-log.json`, 'utf8'));
const sections = JSON.parse(fs.readFileSync('stardust/.work/replica/sections.json', 'utf8'));
const files = fs.readdirSync(`${cur}/pages`).filter((f) => f.endsWith('.json')).sort();
const pages = files.map((f) => JSON.parse(fs.readFileSync(`${cur}/pages/${f}`, 'utf8')));
const html = (slug) => fs.readFileSync(`${cur}/pages/${slug}.html`, 'utf8');
const strip = (s) => s.replace(/<svg[\s\S]*?<\/svg>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

// ---- page typing (inferred from URL pattern + content shape) ----
const TYPES = {
  index: 'landing', 'case-studies': 'landing', 'fashion-trends-of-the-season': 'landing', 'fashion-trends-young-adults': 'landing', 'fashion-trends-young-adults-casual-sport': 'landing',
  blog: 'listing', 'fashion-insights': 'listing', faq: 'static',
};
const typeOf = (p) => TYPES[p.slug] || (p.slug.startsWith('blog-') ? 'article' : 'unique');

// ---- slot extraction helpers (offline against the rendered DOM) ----
const cardsOf = (h) => [...h.matchAll(/<a href="([^"]*)" class="article-card card-link"[^>]*>([\s\S]*?)<\/a>/g)].map((m) => {
  const c = m[2];
  return { href: m[1], image: (c.match(/<img[^>]*src="([^"]*)"/) || [])[1] || null, tag: strip((c.match(/<span class="tag"[^>]*>([\s\S]*?)<\/span>/) || [, ""])[1]) || null,
    date: strip((c.match(/<span class="paragraph-sm[^"]*"[^>]*>([\s\S]*?)<\/span>/) || [, ""])[1]) || null, title: strip((c.match(/<h[2-4][^>]*>([\s\S]*?)<\/h[2-4]>/) || [, ""])[1]) || null };
}).filter((c) => c.title);
const faqOf = (h) => [...h.matchAll(/<details[^>]*>\s*<summary[^>]*>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/g)].map((m) => ({ q: strip(m[1]), a: strip(m[2]).slice(0, 400) }));
const quotesOf = (h) => [...h.matchAll(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/g)].map((m) => strip(m[1]));
const heroOf = (p, h) => {
  const hd = h.slice(h.indexOf('<header'), h.indexOf('</header>'));
  return { headline: p.headings[0]?.text || null, subcopy: strip((hd.match(/<p class="subheading[^"]*"[^>]*>([\s\S]*?)<\/p>/) || [, ''])[1]) || null,
    ctas: [...hd.matchAll(/<a href="([^"]*)" class="button[^"]*">([^<]*)<\/a>/g)].map((m) => ({ label: m[2].trim(), href: m[1] })),
    collage: [...hd.matchAll(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"/g)].map((m) => ({ src: m[1], alt: m[2] })) };
};
const sectionsOf = (slug) => (sections[slug] || []).filter((s) => s.tag === 'section').map((s) => ({ selector: s.selector, heading: (s.h[0] || '').replace(/^h\d:/, '') || null, imgs: s.imgs, buttons: s.btns, cards: s.cards, inverse: s.inverse, tint: s.secondary }));

for (const p of pages) {
  const h = html(p.slug); const t = typeOf(p); const m = h.slice(h.indexOf('<main'), h.indexOf('</main>'));
  let slots;
  if (t === 'article') {
    const head = m.slice(0, m.indexOf('</section>'));
    slots = { headline: p.headings[0]?.text || null, deck: null, tag: strip((head.match(/class="tag[^"]*"[^>]*>([\s\S]*?)<\/div>/) || [, ''])[1]) || null,
      breadcrumb: strip((head.match(/class="breadcrumbs"[^>]*>([\s\S]*?)<\/(?:nav|div)>/) || [, ''])[1]).replace(/\s+/g, ' › ') || 'Home › Blog',
      byline: strip((head.match(/(?:author|byline|meta)[^>]*>([\s\S]{0,200}?)<\/(?:p|div|span)>/i) || [, ''])[1]) || null,
      'lead-image': p.media.imgs[0] || null, body: p.body, pullquotes: quotesOf(m), 'inline-images': p.media.imgs.slice(1), related: [] };
  } else if (t === 'listing') {
    slots = { 'index-headline': p.headings[0]?.text || null, intro: heroOf(p, h).subcopy, hero: heroOf(p, h), featured: sectionsOf(p.slug).find((s) => s.imgs === 1 && s.cards < 8) || null,
      'filter-controls': null, 'card-grid': cardsOf(m), gallery: sectionsOf(p.slug).find((s) => /snapshot/i.test(s.heading || '')) || null, 'cta-band': sectionsOf(p.slug).find((s) => s.buttons >= 2 && s.imgs === 0) || null };
  } else if (t === 'static') {
    slots = { headline: p.headings[0]?.text || null, intro: heroOf(p, h).subcopy, 'lead-image': p.media.imgs[0] || null, faq: faqOf(m),
      contact: (() => { const t = strip(m); const g = t.match(/Email (\S+) Phone (.+?) Address (.+?) Fresh/); return g ? { email: g[1], phone: g[2], address: g[3] } : null; })(), 'cta-band': sectionsOf(p.slug).find((s) => s.buttons >= 2 && s.imgs === 0) || null };
  } else {
    slots = { hero: heroOf(p, h), sections: sectionsOf(p.slug), 'card-grid': cardsOf(m), gallery: sectionsOf(p.slug).find((s) => /snapshot/i.test(s.heading || '')) || null, faq: faqOf(m), quotes: quotesOf(m),
      'cta-band': sectionsOf(p.slug).find((s) => s.buttons >= 2 && s.imgs === 0 && !s.inverse) || null, 'image-cta': sectionsOf(p.slug).find((s) => s.inverse) || null };
  }
  p.type = t; p.slots = slots;
  fs.writeFileSync(`${cur}/pages/${p.slug}.json`, JSON.stringify(p, null, 2));
}

// ---- module candidates (signals: headings ×, CTA labels ×, section outlines) ----
const hash = (s) => { let x = 0; for (const c of s) x = (x * 31 + c.charCodeAt(0)) >>> 0; return x.toString(16).slice(0, 6); };
const cand = (name, slotDefs, pred, signal) => {
  const instances = []; for (const [slug, secs] of Object.entries(sections)) for (const s of secs) if (pred(s, slug)) instances.push({ slug, selector: s.selector });
  return instances.length >= 2 ? { id: `candidate-${hash(name)}`, name, signal, confidence: instances.length >= 3 ? 'high' : 'medium', slots: slotDefs.map(([n, ty, r = false]) => ({ name: n, type: ty, required: r })), instances, status: 'candidate' } : null;
};
const isH1 = (s) => /^h1:/.test(s.h[0] || '');
const modules = [
  { id: 'candidate-' + hash('site-header'), name: 'site-header', signal: 'ctas: 15/15 pages share Trends/About/Blog/Support/Subscribe', confidence: 'high', slots: [['logo', 'image', true], ['nav-items', 'link[]', true], ['cta', 'link']].map(([n, t, r = false]) => ({ name: n, type: t, required: r })), instances: pages.map((p) => ({ slug: p.slug, selector: 'nav.nav-menu' })), status: 'candidate' },
  { id: 'candidate-' + hash('site-footer'), name: 'site-footer', signal: 'headings: Trends/Inspire/Explore h2 on 15/15 pages', confidence: 'high', slots: [['logo', 'image'], ['columns', 'link-group[]', true], ['social', 'link[]']].map(([n, t, r = false]) => ({ name: n, type: t, required: r })), instances: pages.map((p) => ({ slug: p.slug, selector: 'footer' })), status: 'candidate' },
  cand('hero-collage', [['headline', 'text', true], ['subcopy', 'text'], ['buttons', 'link[]'], ['images', 'image[]']], (s) => s.tag === 'header' && isH1(s), 'section outline: header.section with h1 + subheading + button-group (+ collage) on every non-article page'),
  cand('article-hero', [['breadcrumb', 'link[]'], ['headline', 'text', true], ['tag', 'text'], ['lead-image', 'image', true]], (s, slug) => slug.startsWith('blog-') && s.tag === 'section' && isH1(s), 'headings: h1 + .tag + img in first section of 7/7 articles'),
  cand('cta-band', [['headline', 'text', true], ['subcopy', 'text'], ['buttons', 'link[]', true]], (s) => s.tag === 'section' && !s.inverse && s.btns >= 2 && s.imgs === 0 && /^h2:Fresh (looks|fits), bold/.test(s.h[0] || ''), 'headings: "Fresh looks/fits, bold …" h2 + 2 pill CTAs; ctas: Subscribe/Join/See trends'),
  cand('snapshot-gallery', [['headline', 'text', true], ['subcopy', 'text'], ['images', 'image[]', true]], (s) => /^h2:Style in every snapshot/.test(s.h[0] || ''), 'headings: "Style in every snapshot" h2 on 5 pages'),
  cand('article-card-grid', [['headline', 'text'], ['cards', 'card[] {image, tag, title, excerpt, href}', true]], (s) => s.cards >= 8, 'headings: repeated h3 article titles under Latest articles / Trend alert; .card DOM repeats'),
  cand('featured-story', [['image', 'image', true], ['label', 'text'], ['headline', 'text', true], ['meta', 'text'], ['button', 'link']], (s) => s.tag === 'section' && !isH1(s) && s.imgs === 1 && !s.inverse && s.cards < 8 && s.btns <= 2 && !s.details && s.h.length > 0, 'section outline: one image + h2 + optional pill on 8 pages'),
  cand('faq-accordion', [['headline', 'text'], ['items', 'qa[]', true]], (s) => s.details >= 3, 'DOM: 4× details/summary on home + /faq'),
  cand('image-cta-inverse', [['background-image', 'image', true], ['headline', 'text', true], ['subcopy', 'text'], ['button', 'link']], (s) => s.inverse && s.tag === 'section', 'section outline: .inverse-section with gradient overlay on home + case-studies'),
  cand('testimonial', [['image', 'image'], ['quote', 'text', true], ['attribution', 'text'], ['people', 'chip[]']], (s) => s.btns >= 6 && s.imgs >= 4 && s.cards === 0 && !s.inverse, 'section outline: portrait + quote + 4 avatar chips on home + case-studies'),
  cand('pullquote', [['quote', 'text', true], ['attribution', 'text']], (s) => s.quote, 'DOM: blockquote in article body on 7/7 articles'),
].filter(Boolean);
fs.mkdirSync('stardust/.work/replica', { recursive: true });
fs.writeFileSync('stardust/.work/replica/modules.json', JSON.stringify(modules, null, 2));

// ---- state.json ----
const order = JSON.parse(fs.readFileSync('stardust/.labs/site-plan.json', 'utf8')).pages.map((p) => p.slug);
const ok = (pr) => pr && pr.renderedBy === 'playwright' && Number.isInteger(pr.waitMs) && pr.waitMs > 0 && /^\d{4}-\d{2}-\d{2}T/.test(pr.fetchedAt || '') && Number.isInteger(pr.httpStatus) && pr.httpStatus >= 200 && pr.httpStatus < 400 && /^(fast|medium|slow|spec|networkidle|domcontentloaded)(\(fallback\))?$/.test(pr.waitMode || '');
const rows = pages.filter((p) => ok(p._provenance)).sort((a, b) => order.indexOf(a.slug) - order.indexOf(b.slug)).map((p) => ({
  slug: p.slug, url: p.url, title: p.title, type: p.type, status: 'extracted', history: [{ status: 'extracted', at: p._provenance.fetchedAt }], stale: false, staleReason: null,
  currentStatePath: `${cur}/pages/${p.slug}.json`, prototypePath: null, migratedPath: null }));
const rejected = pages.filter((p) => !ok(p._provenance)).map((p) => p.slug);
const state = {
  _provenance: { writtenBy: 'stardust:extract', writtenAt: now, stardustVersion: '0.25.1' },
  site: { originUrl: 'https://www.wknd-trendsetters.site/', deployUrl: null, extractedAt: now, pageCap: 0, totalDiscovered: 16, crawled: rows.length, scope: '--pages (16 fixed URLs)', failed: (log.crawl?.failures || []).map((f) => ({ url: f.url, errorClass: f.errorClass, message: f.message })), captureGaps: log.captureGaps?.roots || [] },
  direction: null,
  handsOff: true,
  flow: 'replica', flowChosenAt: now, flowSource: 'hands-off-default',
  pages: rows,
};
fs.writeFileSync('stardust/state.json', JSON.stringify(state, null, 2));
const byType = {}; for (const r of rows) (byType[r.type] = byType[r.type] || []).push(r.slug);
console.log(`state.json: ${rows.length} extracted, rejected(provenance): ${JSON.stringify(rejected)}`);
console.log('types:', Object.entries(byType).map(([t, s]) => `${t} ${s.length} [${s.join(', ')}]`).join('\n       '));
console.log('modules:', modules.map((m) => `${m.name}×${m.instances.length}(${m.confidence})`).join(', '));
