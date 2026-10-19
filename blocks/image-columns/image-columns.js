/**
 * image-columns — three image-led columns (3/2 image, title, short body), with an optional
 * centred section head (fashion-trends-of-the-season, fashion-trends-young-adults).
 *
 * Decode tier: reconstructive (repeat group of columns; authors add/remove columns).
 * Schema: stardust/eds-schema/fashion-trends-of-the-season.json sections[2] (3 columns + head);
 *         stardust/eds-schema/fashion-trends-young-adults.json sections[1] (3 columns, no head).
 *
 * Authoring:
 *   optional row 1, one cell (no image): <h2>, [lede <p>]           — centred head
 *   rows 2..N, one row per column, two cells: image (3/2) | <h2>/<h3> title, body <p>
 *   (the image has its own cell — an image-led text cell is folded into ONE <p> by the runtime's
 *   wrapTextNodes and its texts stop being editable)
 *   Also accepted: the DA-flattened single cell — columns are then segmented on each image
 *   (the columns are image-led by design), falling back to the most frequent heading tag when
 *   no image is authored.
 * Content-driven composition (no variant class): with a head the grid is `grid-gap-lg`, without
 *   one `grid-gap-xxl`; the column title keeps its authored tag and is sized by tag (h3 = 2xl,
 *   h2 = 3xl), mirroring the source pages. A head-only block (no columns) renders just the
 *   centred head — the source's centred section intro, which the frozen foundation has no
 *   section style for (foundation-requests.md).
 *
 * Harness-only fallbacks (EW5): bare text nodes are wrapped by MOVING them into a fresh <p>.
 */

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

function cellNodes(cell) {
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
  if (!kids.length && cell.textContent.trim()) {
    const p = document.createElement('p');
    p.append(...cell.childNodes);
    kids = [p];
  }
  return kids;
}

function collectNodes(block) {
  const out = [];
  block.querySelectorAll(':scope > div > div').forEach((cell) => out.push(...cellNodes(cell)));
  return out;
}

const mediaOf = (el) => (el.matches('picture, img') ? el : el.querySelector('picture, img'));
const isHeading = (el) => /^H[1-6]$/.test(el.tagName);
const isMedia = (el) => !!mediaOf(el) && !el.textContent.trim();

function segment(block) {
  const rows = [...block.children];
  const mediaRows = rows.filter((r) => r.querySelector('picture, img'));
  if (mediaRows.length >= 2) {
    const head = [];
    const columns = [];
    rows.forEach((r) => {
      const items = [];
      [...r.querySelectorAll(':scope > div')].forEach((cell) => items.push(...cellNodes(cell)));
      if (r.querySelector('picture, img')) columns.push(items);
      else head.push(...items);
    });
    return { head, columns };
  }
  const nodes = collectNodes(block);
  const head = [];
  const columns = [];
  if (nodes.some(isMedia)) {
    nodes.forEach((n) => {
      if (isMedia(n)) columns.push([n]);
      else if (columns.length) columns[columns.length - 1].push(n);
      else head.push(n);
    });
    return { head, columns };
  }
  const tags = nodes.filter(isHeading).map((h) => h.tagName);
  const counts = tags.reduce((acc, t) => ({ ...acc, [t]: (acc[t] || 0) + 1 }), {});
  const unit = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
  if (!unit || counts[unit] < 2) return { head: nodes, columns };
  nodes.forEach((n) => {
    if (n.tagName === unit) columns.push([n]);
    else if (columns.length) columns[columns.length - 1].push(n);
    else head.push(n);
  });
  return { head, columns };
}

function buildColumn(items) {
  const col = document.createElement('div');
  col.className = 'image-column';
  const heading = items.find(isHeading);
  const leftovers = [];
  items.forEach((n) => {
    if (isMedia(n)) col.append(wrapNode(mediaOf(n), 'column-media utility-aspect-3x2'));
    else if (n === heading) col.append(wrapNode(n, 'column-title'));
    else if (n.tagName === 'P' && n.textContent.trim()) col.append(wrapNode(n, 'column-body'));
    else if (n.textContent.trim()) leftovers.push(n);
  });
  col.append(...leftovers);
  return col;
}

export default function decorate(block) {
  const { head, columns } = segment(block);
  const parts = [];
  if (head.length) {
    const box = document.createElement('div');
    box.className = 'image-columns-head';
    const heading = head.find(isHeading);
    head.forEach((n) => {
      if (n === heading) box.append(wrapNode(n, 'headline'));
      else if (n.tagName === 'P') box.append(wrapNode(n, 'lede'));
      else box.append(n);
    });
    parts.push(box);
  }
  if (columns.length) {
    const grid = document.createElement('div');
    grid.className = `image-columns-grid grid-layout desktop-3-column tablet-1-column ${
      head.length ? 'grid-gap-lg' : 'grid-gap-xxl'}`;
    columns.forEach((items) => grid.append(buildColumn(items)));
    parts.push(grid);
  }
  block.replaceChildren(...parts);
}
