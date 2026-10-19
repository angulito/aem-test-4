/**
 * trend-cards — centred section head + grid of linked trend cards (4/3 image, tag pill, title,
 * short body) — fashion-trends-young-adults-casual-sport.
 *
 * Decode tier: reconstructive (repeat group; authors add/remove cards).
 * Schema: stardust/eds-schema/fashion-trends-young-adults-casual-sport.json sections[1]
 * (repeats: 8 cards, uniform).
 *
 * Authoring:
 *   row 1, one cell (no image): <h2>, lede <p>
 *   rows 2..N, one row per card, two cells: image (4/3) | tag <p>, <h3><a href>Title</a></h3>,
 *   body <p>
 *   Card-as-link (EW6): the card <a> takes the title link's href and the inner anchor is unwrapped.
 *   Paragraphs before the card heading are the tag pill(s); paragraphs after it are the body.
 *   Also accepted: the DA-flattened single cell — cards are then segmented on each <h3>/<h4>,
 *   media and tag before a card heading belonging to that card.
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
const isCardHeading = (el) => el.tagName === 'H3' || el.tagName === 'H4';
const isMedia = (el) => !!mediaOf(el) && !el.textContent.trim();

function segment(block) {
  const rows = [...block.children];
  const cardRows = rows.filter((r) => r.querySelector('h3, h4'));
  if (cardRows.length >= 2) {
    const head = [];
    const cards = [];
    rows.forEach((r) => {
      const items = [];
      [...r.querySelectorAll(':scope > div')].forEach((cell) => items.push(...cellNodes(cell)));
      if (r.querySelector('h3, h4')) cards.push(items);
      else head.push(...items);
    });
    return { head, cards };
  }
  const nodes = collectNodes(block);
  const head = [];
  const cards = [];
  let pending = [];
  let headDone = false;
  nodes.forEach((n) => {
    if (isCardHeading(n)) {
      cards.push([...pending, n]);
      pending = [];
      headDone = true;
    } else if (isMedia(n)) {
      if (pending.some(isMedia) && cards.length) cards[cards.length - 1].push(...pending);
      pending = [n];
      headDone = true;
    } else if (!headDone) {
      head.push(n);
    } else if (pending.length) {
      pending.push(n);
    } else if (cards.length) {
      cards[cards.length - 1].push(n);
    } else {
      head.push(n);
    }
  });
  if (pending.length) {
    if (cards.length) cards[cards.length - 1].push(...pending);
    else head.push(...pending);
  }
  return { head, cards };
}

function buildCard(items) {
  const heading = items.find(isCardHeading) || items.find(isHeading);
  const link = heading ? heading.querySelector('a[href]')
    : items.map((n) => n.querySelector('a[href]')).find(Boolean);
  const card = document.createElement(link ? 'a' : 'div');
  card.className = 'trend-card card-link';
  if (link) {
    card.href = link.getAttribute('href');
    link.replaceWith(...link.childNodes);
  }
  const body = document.createElement('div');
  body.className = 'trend-card-body';
  const headingAt = heading ? items.indexOf(heading) : items.length;
  const leftovers = [];
  items.forEach((n, i) => {
    if (isMedia(n)) card.append(wrapNode(mediaOf(n), 'trend-card-image'));
    else if (n === heading) body.append(wrapNode(n, 'trend-card-title'));
    else if (n.tagName === 'P' && n.textContent.trim()) {
      body.append(wrapNode(n, i < headingAt ? 'tag-wrap' : 'trend-card-text'));
    } else if (n.textContent.trim()) leftovers.push(n);
  });
  body.append(...leftovers);
  card.append(body);
  return card;
}

export default function decorate(block) {
  const { head, cards } = segment(block);
  const parts = [];
  if (head.length) {
    const box = document.createElement('div');
    box.className = 'trend-cards-head';
    const heading = head.find(isHeading);
    head.forEach((n) => {
      if (n === heading) box.append(wrapNode(n, 'headline'));
      else if (n.tagName === 'P') box.append(wrapNode(n, 'lede'));
      else box.append(n);
    });
    parts.push(box);
  }
  if (cards.length) {
    const grid = document.createElement('div');
    grid.className = 'trend-cards-grid grid-layout desktop-4-column tablet-2-column-1 '
      + 'mobile-portrait-1-column grid-gap-md';
    cards.forEach((items) => grid.append(buildCard(items)));
    parts.push(grid);
  }
  block.replaceChildren(...parts);
}
