/**
 * contact-details — "Let's connect" head column beside a stacked list of labelled contact
 * channels (faq page: Email / Phone / Address).
 *
 * Decode tier: template-slotted head (fixed two-column composition, nodes MOVED by role) +
 * reconstructive items (repeat group segmented on the label heading; authors add/remove channels).
 * Schema: stardust/eds-schema/faq.json sections[2] (repeats: 3 items).
 *
 * Authoring:
 *   row 1, one cell: <h2>, lede <p>
 *   rows 2..N, one row per channel, one cell: label <h3>, value <p> (a plain <a href="mailto:"> /
 *   <a href="tel:"> inside the <p> stays a plain link — not a button, no emphasis wrap)
 *   Also accepted: everything in one cell — items are segmented on each <h3>/<h4>.
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
    const kids = [...cell.children];
    if (kids.length) out.push(...kids);
    else if (cell.textContent.trim()) {
      const p = document.createElement('p');
      p.append(...cell.childNodes);
      out.push(p);
    }
  });
  return out;
}

const isHeading = (el) => /^H[1-6]$/.test(el.tagName);
const isLabel = (el) => el.tagName === 'H3' || el.tagName === 'H4';

export default function decorate(block) {
  const nodes = collectNodes(block);
  if (!nodes.length) return;
  const head = document.createElement('div');
  head.className = 'contact-copy';
  const list = document.createElement('div');
  list.className = 'contact-items';
  let item = null;
  nodes.forEach((n) => {
    if (isLabel(n)) {
      item = document.createElement('div');
      item.className = 'contact-item';
      item.append(wrapNode(n, 'contact-label'));
      list.append(item);
    } else if (item) {
      item.append(wrapNode(n, 'contact-value'));
    } else if (isHeading(n)) {
      head.append(wrapNode(n, 'headline'));
    } else if (n.textContent.trim()) {
      head.append(wrapNode(n, 'lede'));
    }
  });
  const grid = document.createElement('div');
  grid.className = 'contact-grid grid-layout tablet-1-column grid-gap-xxl';
  if (head.children.length) grid.append(head);
  if (list.children.length) grid.append(list);
  block.replaceChildren(grid);
}
