/**
 * snapshot-gallery — centred section head + square image grid (index, case-studies,
 * fashion-insights).
 *
 * Decode tier: reconstructive (repeat group of images; authors add/remove tiles).
 * Schema: stardust/eds-schema/index.json sections[1] (repeats: 8 images).
 *
 * Authoring:
 *   row 1, one cell: <h2>, lede <p>
 *   rows 2..N: one image per row (or several images in one cell — every picture/img found after
 *   the head becomes one 1:1 tile, in authored order)
 *   Column count is content-driven: 4-up by default; a tile count that fills 3-up rows but not
 *   4-up ones (6, 9, …) renders 3-up (fashion-trends-of-the-season, 6 tiles).
 *   variant: `three-column` — 3 tiles per desktop row (fashion-insights, 6 tiles); default is 4
 *
 * Harness-only fallbacks (EW5): bare text nodes are wrapped by MOVING them into a fresh <p>.
 */

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

function collectNodes(block) {
  const out = [];
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    let kids = [...cell.children];
    if (kids.length === 1 && kids[0].tagName === 'P' && kids[0].children.length
      && kids[0].querySelector('picture, img')) {
      kids = [...kids[0].childNodes].map((n) => {
        if (n.nodeType === 1) return n;
        if (n.textContent.trim()) {
          const p = document.createElement('p');
          p.append(n);
          return p;
        }
        return null;
      }).filter(Boolean);
    }
    if (kids.length) out.push(...kids);
    else if (cell.textContent.trim()) {
      const p = document.createElement('p');
      p.append(...cell.childNodes);
      out.push(p);
    }
  });
  return out;
}

const mediaOf = (el) => (el.matches('picture, img') ? el : el.querySelector('picture, img'));
const isHeading = (el) => /^H[1-6]$/.test(el.tagName);
const isCta = (el) => el.tagName === 'P' && !!el.querySelector('a[href]');

export default function decorate(block) {
  const nodes = collectNodes(block);
  if (!nodes.length) return;
  const heading = nodes.find(isHeading);
  const head = document.createElement('div');
  head.className = 'snapshot-head utility-text-align-center';
  const grid = document.createElement('div');
  const cols = block.classList.contains('three-column') ? 'desktop-3-column' : 'desktop-4-column';
  grid.className = `snapshot-grid grid-layout ${cols} tablet-2-column-1 `
    + 'mobile-portrait-1-column grid-gap-sm';
  const leftovers = [];
  nodes.forEach((n) => {
    const m = mediaOf(n);
    if (m && !n.textContent.trim()) grid.append(wrapNode(m, 'snapshot-tile utility-aspect-1x1'));
    else if (n === heading) head.append(wrapNode(n, 'headline'));
    else if (n.tagName === 'P' && !isCta(n)) head.append(wrapNode(n, 'lede'));
    else if (n.textContent.trim()) leftovers.push(n);
  });
  const tiles = grid.children.length;
  if (tiles && tiles % 4 !== 0 && tiles % 3 === 0) {
    grid.classList.replace('desktop-4-column', 'desktop-3-column');
  }
  const parts = [];
  if (head.children.length) parts.push(head);
  if (grid.children.length) parts.push(grid);
  block.replaceChildren(...parts, ...leftovers);
}
