/**
 * article-cards — centred section head + grid of linked article cards (index, blog,
 * fashion-insights, fashion-trends-young-adults).
 *
 * Decode tier: reconstructive (repeat group; authors add/remove cards).
 * Schema: stardust/eds-schema/index.json sections[3] (repeats: 4 cards); blog.json (6 cards).
 *
 * Authoring:
 *   row 1, one cell (no image): <h2>, lede <p>
 *   rows 2..N, one row per card, two cells: image (16/10) | tag <p>, date <p>,
 *   <h3><a href>Title</a></h3>
 *   Card-as-link (EW6): the card <a> takes the title link's href and the inner anchor is unwrapped.
 *   Meta classification: a paragraph carrying a digit is the date; the other is the tag pill.
 *   Also accepted: the DA-flattened single cell — cards are then segmented on each <h3>/<h4>, media
 *   before a card heading belonging to that card.
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
const isCardHeading = (el) => el.tagName === 'H3' || el.tagName === 'H4';

function segment(block) {
  const rows = [...block.children];
  const cardRows = rows.filter((r) => r.querySelector('h3, h4'));
  if (cardRows.length >= 2) {
    const head = [];
    const cards = [];
    rows.forEach((r) => {
      const items = [];
      [...r.querySelectorAll(':scope > div')].forEach((cell) => {
        let kids = [...cell.children];
        if (kids.length === 1 && kids[0].tagName === 'P' && kids[0].children.length
          && kids[0].querySelector('picture, img')) {
          kids = [...kids[0].children];
        }
        if (!kids.length && cell.textContent.trim()) {
          const p = document.createElement('p');
          p.append(...cell.childNodes);
          kids = [p];
        }
        items.push(...kids);
      });
      if (r.querySelector('h3, h4')) cards.push(items);
      else head.push(...items);
    });
    return { head, cards };
  }
  const nodes = collectNodes(block);
  const head = [];
  const cards = [];
  let pending = [];
  nodes.forEach((n) => {
    if (isCardHeading(n)) {
      cards.push([...pending, n]);
      pending = [];
    } else if (cards.length && !mediaOf(n)) {
      cards[cards.length - 1].push(n);
    } else if (mediaOf(n) && !n.textContent.trim()) {
      pending.push(n);
    } else {
      head.push(n);
    }
  });
  head.push(...pending);
  return { head, cards };
}

function buildCard(items) {
  const heading = items.find(isCardHeading);
  const link = heading ? heading.querySelector('a[href]')
    : items.map((n) => n.querySelector('a[href]')).find(Boolean);
  const card = document.createElement(link ? 'a' : 'div');
  card.className = 'article-card card-link';
  if (link) {
    card.href = link.getAttribute('href');
    link.replaceWith(...link.childNodes);
  }
  const meta = document.createElement('div');
  meta.className = 'article-card-meta';
  const body = document.createElement('div');
  body.className = 'article-card-body';
  const leftovers = [];
  items.forEach((n) => {
    const m = mediaOf(n);
    if (m && !n.textContent.trim()) card.append(wrapNode(m, 'article-card-image'));
    else if (n !== heading && n.tagName === 'P' && n.textContent.trim()) {
      meta.append(wrapNode(n, /\d/.test(n.textContent) ? 'meta-date' : 'tag-wrap'));
    } else if (n !== heading && n.textContent.trim()) leftovers.push(n);
  });
  if (meta.children.length) body.append(meta);
  if (heading) body.append(wrapNode(heading, 'article-card-title'));
  body.append(...leftovers);
  card.append(body);
  return card;
}

export default function decorate(block) {
  const { head, cards } = segment(block);
  const parts = [];
  if (head.length) {
    const box = document.createElement('div');
    box.className = 'article-cards-head utility-text-align-center';
    head.forEach((n) => {
      if (isHeading(n)) box.append(wrapNode(n, 'headline'));
      else if (n.tagName === 'P') box.append(wrapNode(n, 'lede'));
      else box.append(n);
    });
    parts.push(box);
  }
  if (cards.length) {
    const grid = document.createElement('div');
    grid.className = 'article-cards-grid grid-layout desktop-4-column tablet-2-column-1 '
      + 'mobile-portrait-1-column grid-gap-md';
    cards.forEach((items) => grid.append(buildCard(items)));
    parts.push(grid);
  }
  block.replaceChildren(...parts);
}
