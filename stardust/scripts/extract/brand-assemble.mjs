#!/usr/bin/env node
// brand-assemble.mjs — assemble stardust/current/_brand-extraction.json (extract Phase 3)
// from artifacts already on disk: _computed-styles.json (style-census aggregate), the
// per-page records (pages/*.json + rendered *.html), assets/fonts, assets/logo.svg.
// No live probe: every value is read from a captured artifact and cites its source.
import fs from 'node:fs';
import path from 'node:path';

const cur = 'stardust/current';
const now = new Date().toISOString();
const C = JSON.parse(fs.readFileSync(`${cur}/_computed-styles.json`, 'utf8'));
const A = C.aggregate;
const pageFiles = fs.readdirSync(`${cur}/pages`).filter((f) => f.endsWith('.json')).sort();
const pages = pageFiles.map((f) => JSON.parse(fs.readFileSync(`${cur}/pages/${f}`, 'utf8')));
const sections = JSON.parse(fs.readFileSync('stardust/.work/replica/sections.json', 'utf8'));
const home = pages.find((p) => p.slug === 'index');
const props = home.customProps;
const homeCensus = C.pages[home.url]['1440'];
const origin = 'https://www.wknd-trendsetters.site';

const rgbToHex = (s) => {
  const m = s.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  return m ? '#' + [m[1], m[2], m[3]].map((n) => (+n).toString(16).padStart(2, '0')).join('') : s;
};
const src = (list, n = 2) => (list || []).slice(0, n).map((s) => ({ url: s.url, selector: s.selector, prop: s.prop }));

// ---- palette: census clusters (computed) + token layer (declared) ----
const roleFor = (hex) => ({
  '#ffffff': 'background', '#000000': 'text-primary / primary', '#666666': 'text-secondary',
  '#404040': 'text-tertiary', '#999999': 'text-muted', '#e8e8e8': 'border', '#f4fe8b': 'accent',
}[hex] || 'other');
const palette = A.colors.map((c) => ({
  value: c.hex, role: roleFor(c.hex), weight: c.weight, bgArea: c.bgArea || 0,
  usedAs: Object.entries(c.by || {}).filter(([, n]) => n > 0).map(([k]) => k),
  token: Object.entries(props).find(([k, v]) => k.startsWith('--color') && v.toLowerCase() === c.hex)?.[0] || null,
  sources: src(c.sources, 2),
}));
// declared-but-rare accents from the token layer (surface tints)
for (const [k, v] of Object.entries(props)) {
  if (!k.startsWith('--color')) continue;
  if (!palette.some((p) => p.value === v.toLowerCase())) {
    palette.push({ value: v, role: k.includes('gray') ? 'neutral-scale' : 'accent-tint (declared)', weight: 0, usedAs: ['token-only'], token: k,
      sources: [{ url: home.url, selector: ':root', prop: k }] });
  }
}
// surface tint seen in census surfaces
const surf = (homeCensus.surfaces || []).find((s) => /245, 245, 245/.test(s.backgroundColor));
if (surf) palette.push({ value: '#f5f5f5', role: 'surface (alternating section)', weight: 0, usedAs: ['background'], token: '--color-gray-100',
  sources: [{ url: home.url, selector: surf.selector, prop: 'background-color' }] });

// ---- type ----
const fontFiles = fs.readdirSync(`${cur}/assets/fonts`).map((f) => ({
  file: `${cur}/assets/fonts/${f}`, bytes: fs.statSync(`${cur}/assets/fonts/${f}`).size,
  family: /syncopate/.test(f) ? 'Syncopate' : 'Instrument Sans', weight: /700/.test(f) ? '700' : (/400/.test(f) ? '400' : '400 700 (variable)'),
  sourceUrl: `${origin}/fonts/${f}`, format: 'woff2',
  licensing: 'Google Fonts family (SIL Open Font License) self-hosted by the source site; verify before redistribution',
}));
const sizes = A.type.sizes.map((s) => s.px).filter((px) => px >= 12).sort((a, b) => a - b);
const ratios = sizes.slice(1).map((s, i) => +(s / sizes[i]).toFixed(3));
const declaredScale = Object.entries(props).filter(([k]) => k.startsWith('--text-')).map(([k, v]) => `${k}=${v}`);
const type = {
  headingFamily: A.type.headingFamily, bodyFamily: A.type.bodyFamily,
  families: A.type.families, weights: A.type.weights, sizes: A.type.sizes, levels: A.type.levels,
  mobileLevels: Object.fromEntries((C.pages[home.url]['360'].headings || []).filter((h) => /^h[1-3]$/.test(h.tag))
    .reduce((m, h) => (m.has(h.tag) ? m : m.set(h.tag, { fontSize: h.fontSize, lineHeight: h.lineHeight, letterSpacing: h.letterSpacing })), new Map())),
  headingTransform: 'uppercase', headingLetterSpacing: '-0.02em', leading: { tight: props['--leading-tight'], snug: props['--leading-snug'], normal: props['--leading-normal'] },
  declaredScale,
  scaleAudit: { kind: 'ad-hoc', sizes, ratios, note: 'declared token steps (.75/.875/1/1.125/1.25/1.5/2/2.5/3.5rem) are a hand-picked ladder, not a constant ratio; computed sizes add 13.33px UA-default and 22/28px in-between steps' },
  files: fontFiles,
  sources: src(A.type.families?.[0]?.sources || homeCensus.headings.slice(0, 2).map((h) => ({ url: home.url, selector: h.selector, prop: 'font-family' })), 2),
};

// ---- spacing / motifs / components ----
const spacing = {
  scale: Object.fromEntries(Object.entries(props).filter(([k]) => k.startsWith('--space-'))),
  container: { maxWidth: props['--container-max'], padding: props['--container-padding'] },
  sectionPadding: surf ? surf.padding : '128px 0px',
  sources: [{ url: home.url, selector: ':root', prop: '--space-*' }, { url: home.url, selector: 'header.section', prop: 'padding' }],
};
const motifs = {
  borderRadius: { mode: A.motifs.radius.mode, pill: A.motifs.radius.pill, tokens: Object.fromEntries(Object.entries(props).filter(([k]) => k.startsWith('--radius'))),
    occurrences: A.motifs.radius.values.map((v) => ({ value: v.value, count: v.count, area: v.area, sources: src(v.sources, 1) })) },
  shadows: A.motifs.shadows.map((s) => ({ value: s.value, count: s.count, sources: src(s.sources, 1) })).concat([{ value: props['--shadow-card'], count: 0, token: '--shadow-card', sources: [{ url: home.url, selector: ':root', prop: '--shadow-card' }] }]),
  gradients: A.motifs.gradients.map((g) => ({ value: g.value, count: g.count, area: g.area, sources: src(g.sources, 1) })),
  hover: A.hover.map((h) => ({ kind: h.kind, from: h.from, to: h.to, count: h.count, sources: src(h.sources, 1) })),
  patterns: ['hard-offset-shadow pill button (4px 4px 0 #000, grows to 6px on hover)', 'rounded-1.25rem photo tiles in 2–4 column collages', 'ALL-CAPS Syncopate headlines with tight negative tracking', 'lime (#f4fe8b) uppercase tag pill on cards and article heroes', 'alternating white / #f5f5f5 sections, black inverse CTA band and footer', 'bottom-up black gradient overlay on image CTA band'],
  transitions: { fast: props['--transition-fast'], normal: props['--transition-normal'] },
  focusRing: { color: props['--focus-ring-color'], width: props['--focus-ring-width'], offset: props['--focus-ring-offset'] },
};
const componentStyle = {
  buttonPrimary: { background: '#000000', text: '#ffffff', border: '2px solid #000000', radius: '9999px', padding: '12px 24px', font: 'Instrument Sans 600 14px', shadow: '4px 4px 0 0 #000000', hoverShadow: '6px 6px 0 0 #000000', sources: [{ url: home.url, selector: 'header > div > div > div:nth-of-type(1) > div > a:nth-of-type(1)' }] },
  buttonSecondary: { background: '#ffffff', text: '#000000', border: '2px solid #000000', radius: '9999px', padding: '12px 24px', font: 'Instrument Sans 600 14px', shadow: '4px 4px 0 0 #000000', hoverShadow: '6px 6px 0 0 #000000', sources: [{ url: home.url, selector: 'header > div > div > div:nth-of-type(1) > div > a:nth-of-type(2)' }] },
  buttonOnInverse: { background: '#ffffff', text: '#000000', border: '2px solid #000000', radius: '9999px', shadow: '4px 4px 0 0 rgba(255,255,255,0.3)', sources: [{ url: `${origin}/case-studies`, selector: 'section.inverse-section a.button' }] },
  tagPill: { background: '#f4fe8b', text: '#000000', radius: '9999px', font: 'Syncopate 700 ~12–14px uppercase', sources: [{ url: `${origin}/blog/ace-pro-court-polo`, selector: 'main section:nth-of-type(0) div.tag' }] },
  card: { radius: props['--radius-card'], shadow: 'none (token --shadow-card declared, unused in census)', imageRadius: props['--radius-card'], sources: [{ url: home.url, selector: 'section:nth-of-type(4) .card' }] },
  accordion: { element: 'details/summary', count: 4, sources: [{ url: `${origin}/faq`, selector: 'main details' }] },
  breadcrumb: { pattern: 'Home › Blog (svg chevron)', sources: [{ url: `${origin}/blog/ace-pro-court-polo`, selector: '.breadcrumbs' }] },
};

// ---- system components (cross-page repeats from headings + CTA labels + section outlines) ----
const has = (slug, pred) => (sections[slug] || []).some(pred);
const inst = (pred) => Object.keys(sections).filter((s) => has(s, pred));
const sel = (slug, pred) => (sections[slug] || []).find(pred)?.selector;
const sc = (name, kind, pred, extra = {}) => { const ex = inst(pred); return ex.length ? { name, kind, occurrences: ex.length, examplePages: ex.slice(0, 5), exampleSlug: ex.includes('index') ? 'index' : ex[0], exampleSelector: sel(ex.includes('index') ? 'index' : ex[0], pred), ...extra } : null; };
const systemComponents = [
  { name: 'site-header', kind: 'header', occurrences: pages.length, headingSequence: [], ctaLabels: ['Trends', 'About', 'Blog', 'Support', 'Subscribe'], navItems: ['Trends (mega menu: Casual / …)', 'About', 'Blog', 'Support'], logoWordmark: 'FASHION BLOG', exampleSlug: 'index', exampleSelector: 'nav.nav-menu', examplePages: pages.slice(0, 5).map((p) => p.slug), notes: 'identical on 15/15 pages; brand mark = 33×33 inline SVG + Syncopate all-caps wordmark; black pill Subscribe CTA right' },
  { name: 'site-footer', kind: 'footer', occurrences: pages.length, headingSequence: ['Trends', 'Inspire', 'Explore'], ctaLabels: ['Style', 'Looks', 'Events', 'Brands', 'Tips', 'Stories', 'People', 'Culture', 'Vibes', 'Fun', 'Travel', 'Beach', 'Night', 'Sport', 'Chill'], exampleSlug: 'index', exampleSelector: 'footer.footer.inverse-footer', examplePages: pages.slice(0, 5).map((p) => p.slug), notes: 'black inverse footer, logo left, 3 link columns × 5 links (all href="#"), 5 circular social icons' },
  sc('cta-band', 'cta-band', (s) => s.tag === 'section' && !s.inverse && s.btns >= 2 && s.imgs === 0 && /^h2:Fresh (looks|fits), bold/.test(s.h[0] || ''), { ctaLabels: ['Subscribe', 'Join', 'See trends', 'Explore the blog'], notes: 'lime #f4fe8b band, centered Syncopate headline + 2 pill buttons' }),
  sc('snapshot-gallery', 'other', (s) => /^h2:Style in every snapshot/.test(s.h[0] || ''), { headingSequence: ['Style in every snapshot'], notes: 'rounded photo tile grid (2×4 / 3-col)' }),
  sc('article-card-grid', 'other', (s) => s.cards >= 8 && /^h2:(Latest articles|Trend alert|Trends (that turn heads|for every vibe))/i.test(s.h[0] || ''), { headingSequence: ['Latest articles | Trend alert'], notes: '3–4 column cards: rounded image, lime tag pill, h3 title, excerpt' }),
  sc('featured-story', 'cross-promo', (s) => s.tag === 'section' && !/^h1:/.test(s.h[0] || '') && s.imgs === 1 && !s.inverse && s.h.length && !/Fresh (looks|fits), bold/.test(s.h[0]) && s.cards < 8 && s.btns <= 2 && !s.details, { notes: 'single featured card: image + breadcrumb-ish label + h2 + byline/pill' }),
  sc('faq-accordion', 'other', (s) => s.details >= 3, { notes: '4 × details/summary; on home under "Got questions? We\'ve got answers." and on /faq' }),
  sc('image-cta-inverse', 'cta-band', (s) => s.inverse && s.tag === 'section', { notes: 'full-bleed dark photo with bottom-up black gradient, white Syncopate headline, white pill button' }),
  sc('testimonial', 'other', (s) => s.btns >= 6 && s.imgs >= 4 && s.cards === 0 && !s.inverse, { notes: 'large portrait + quote + 4 avatar/name chips (chips render as small rounded "buttons" in the census)' }),
  { name: 'breadcrumb', kind: 'breadcrumb', occurrences: pages.filter((p) => p.slug.startsWith('blog-')).length, exampleSlug: 'blog-ace-pro-court-polo', exampleSelector: '.breadcrumbs', examplePages: pages.filter((p) => p.slug.startsWith('blog-')).map((p) => p.slug).slice(0, 5), notes: 'Home › Blog on every article' },
].filter(Boolean);

// ---- voice ----
const heroImg = home.media.imgs[0];
const voice = {
  heroHeadline: home.headings[0].text, heroSubcopy: home.body[0],
  heroImage: { url: heroImg.src, alt: heroImg.alt, source: 'img', domPath: 'header.section > div > div > div:nth-of-type(2) > img:nth-of-type(1)', localPath: null, rect: null, notes: 'first of a 3-image rounded collage (hero-hiphop-dance / hero-family-vacation / hero-music-concert.avif)' },
  heroMedium: null,
  primaryCTALabel: 'See case', ctaSamples: ['See case', 'All stories', 'Subscribe', 'See trends', 'Explore the blog', 'Read the full article'],
  navItems: ['Trends', 'About', 'Blog', 'Support', 'Subscribe'], footerHeadings: ['Trends', 'Inspire', 'Explore'],
  firstParagraph: home.body[1] || home.body[0],
  tone: { guess: 'playful-bright', evidence: 'short imperative fragments ("Fresh looks, bold stories, real life"), second-person, slang-adjacent ("fits that serve", "Game on, style up"), em-dash asides, no jargon' },
  siteName: 'WKND Trendsetters', wordmark: 'Fashion Blog', tagline: 'Fresh looks, bold stories, real life',
  sources: [{ url: home.url, selector: 'header h1.h1-heading' }, { url: home.url, selector: 'header p.subheading' }],
};
const ctaCounts = {};
for (const p of pages) for (const c of p.ctas) ctaCounts[c.label] = (ctaCounts[c.label] || 0) + 1;
const voiceTable = { ctaLabels: Object.entries(ctaCounts).sort((a, b) => b[1] - a[1]).filter(([l]) => l.length < 40).slice(0, 30).map(([label, count]) => ({ label, count })),
  headlinePatterns: ['"Fresh looks, bold …" triad', 'noun + comma + imperative ("Game on, style up")', 'question headline for FAQ ("Got questions? We\'ve got answers.")'] };

const out = {
  _provenance: { writtenBy: 'stardust:extract', writtenAt: now, readArtifacts: [home.url, `${cur}/_computed-styles.json`, `${cur}/_crawl-log.json`, ...pageFiles.map((f) => `${cur}/pages/${f}`)], synthesizedInputs: [], stardustVersion: '0.25.1',
    notes: ['palette/type/motifs aggregated across all 15 extracted pages at 1440 and 360 (style-census.mjs, 30 measurements); logo, voice, hero are home-only',
      'census logo chain returned "none" (the mark is an inline <svg aria-hidden> inside a.logo) — logo captured by DOM read of pages/index.html instead',
      'home-only radius mode equals cross-page mode (20px / pill); no divergence',
      'declared token --shadow-card is not applied anywhere in the census: cards are flat'] },
  site: { name: 'WKND Trendsetters', tagline: voice.tagline, originUrl: `${origin}/`, description: home.description, generator: 'Astro (static; /_astro/ bundle)', pagesAggregated: pages.length },
  origins: [{ url: `${origin}/`, role: 'primary', pages: pages.length, contributed: ['palette', 'type', 'motifs', 'voice', 'systemComponents', 'logo', 'favicon', 'fonts'] }],
  logo: { source: 'inline-svg', selector: 'a.logo > div.nav-logo-icon > svg[viewBox="0 0 33 33"]', file: `${cur}/assets/logo.svg`, wordmark: { text: 'Fashion Blog', font: 'Syncopate 700, uppercase, --text-sm', selector: 'a.logo > div.paragraph-xl.utility-text-all-caps' }, variants: ['currentColor: black on white header, white on black footer'], sourceUrl: home.url },
  favicon: { file: `${cur}/assets/favicon.svg`, url: `${origin}/favicon.svg` },
  palette, type, spacing, motifs, componentStyle, systemComponents, iconFont: null, voice, voiceTable,
  crossPromo: { detected: systemComponents.filter((s) => s.kind === 'cta-band' || s.kind === 'cross-promo').map((s) => s.name), notes: 'subscribe/newsletter CTA band on most pages; no third-party promos' },
  register: 'brand',
  dynamicSurface: { summary: 'static site: 0 same-site data endpoints, 0 forms, 0 third-party script hosts, 0 hydration hints (crawl.mjs --dynamics)', interactive: ['nav mega-menu (Trends/Support carets)', 'details/summary FAQ accordion', 'Cloudflare email-protection link (/cdn-cgi/l/email-protection → 404 when fetched directly)'] },
};
fs.writeFileSync(`${cur}/_brand-extraction.json`, JSON.stringify(out, null, 2));
console.log(`wrote ${cur}/_brand-extraction.json: palette ${palette.length}, fonts ${fontFiles.length}, systemComponents ${systemComponents.map((s) => s.name + '×' + s.occurrences).join(', ')}`);
