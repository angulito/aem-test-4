/**
 * featured-story — one highlighted story: image beside breadcrumbs/eyebrow + title + meta or lede
 * + CTA (index, case-studies, blog, fashion-insights).
 *
 * Decode tier: template-slotted (fixed two-column composition; nodes MOVED by role).
 * Schema: stardust/eds-schema/index.json sections[0]; blog.json sections[0].
 *
 * Authoring — one row, two cells (optionally preceded by a head row):
 *   head row (optional), one cell, no image: <h2>, [lede <p>] — centred section head above the
 *           story (fashion-trends-of-the-season "Trend alert"); the story heading is then an <h3>
 *   cell 1: image (3/2)
 *   cell 2: [<ul> breadcrumbs] [eyebrow <p>s before the heading: first = tag pill, rest = date]
 *           <h2> [meta <p>s: "By <strong>Author</strong>", "Date • N min read"] [lede <p>]
 *           [CTA <p> — <strong><a>]
 *   Post-heading link-free paragraphs are meta when they start with "By" or carry "•";
 *   otherwise
 *   lede. The case-studies breadcrumb tail is plain text (<li>Case studies</li>) — not a link
 *   there.
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
const isMeta = (el) => /^by\s/i.test(el.textContent.trim()) || /•/.test(el.textContent);

function splitHead(block) {
  const rows = [...block.children];
  const first = rows[0];
  if (rows.length < 2 || !first || first.querySelector('picture, img')
    || !first.querySelector('h1, h2, h3, h4') || !rows[1].querySelector('picture, img')) {
    return [];
  }
  const head = [];
  first.querySelectorAll(':scope > div').forEach((cell) => {
    const kids = [...cell.children];
    if (kids.length) head.push(...kids);
    else if (cell.textContent.trim()) {
      const p = document.createElement('p');
      p.append(...cell.childNodes);
      head.push(p);
    }
  });
  first.remove();
  return head;
}

export default function decorate(block) {
  const head = splitHead(block);
  const nodes = collectNodes(block);
  if (!nodes.length && !head.length) return;
  const heading = nodes.find(isHeading);
  const headingAt = heading ? nodes.indexOf(heading) : nodes.length;
  const media = [];
  const crumbs = [];
  const eyebrow = [];
  const meta = [];
  const lede = [];
  const ctas = [];
  nodes.forEach((n, i) => {
    const m = mediaOf(n);
    if (m && !n.textContent.trim()) media.push(m);
    else if (n.tagName === 'UL' || n.tagName === 'OL') crumbs.push(n);
    else if (isCta(n)) ctas.push(n);
    else if (n !== heading && n.textContent.trim()) {
      if (i < headingAt) eyebrow.push(n);
      else if (isMeta(n)) meta.push(n);
      else lede.push(n);
    }
  });

  const grid = document.createElement('div');
  grid.className = 'featured-grid grid-layout tablet-1-column grid-gap-lg';
  if (media.length) {
    const mw = document.createElement('div');
    mw.className = 'featured-media';
    media.forEach((m) => mw.append(m));
    grid.append(mw);
  }
  const copy = document.createElement('div');
  copy.className = 'featured-copy';
  crumbs.forEach((list) => copy.append(wrapNode(list, 'breadcrumbs')));
  if (eyebrow.length) {
    const row = document.createElement('div');
    row.className = 'featured-eyebrow';
    eyebrow.forEach((p, i) => row.append(wrapNode(p, i ? 'eyebrow-meta' : 'tag-wrap')));
    copy.append(row);
  }
  if (heading) copy.append(wrapNode(heading, 'headline'));
  if (meta.length) {
    const box = document.createElement('div');
    box.className = 'featured-meta';
    meta.forEach((p) => box.append(wrapNode(p, 'meta-line')));
    copy.append(box);
  }
  lede.forEach((p) => copy.append(wrapNode(p, 'lede')));
  if (ctas.length) {
    const group = document.createElement('div');
    group.className = 'button-group';
    group.append(...ctas);
    copy.append(group);
  }
  grid.append(copy);
  if (head.length) {
    const box = document.createElement('div');
    box.className = 'featured-head';
    const headHeading = head.find(isHeading);
    head.forEach((n) => {
      if (n === headHeading) box.append(wrapNode(n, 'headline'));
      else if (n.tagName === 'P') box.append(wrapNode(n, 'lede'));
      else box.append(n);
    });
    block.replaceChildren(box, grid);
    return;
  }
  block.replaceChildren(grid);
}
