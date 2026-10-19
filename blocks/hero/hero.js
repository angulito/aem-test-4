/**
 * hero — lead composition shared by every template (15 instances).
 *
 * Decode tier: template-slotted (fixed two-column lead; authored nodes MOVED by role).
 * Prototype section: `main > header.section` (index / blog / faq) and
 * `main > section:first-of-type`
 * (blog-ace-pro-court-polo). Schema: stardust/eds-schema/index.json sections[0] (the migrated
 * page carries data-section on the hero header; the prototype does not, so
 * round-trip runs with `--map hero=main > header.section`).
 *
 * Authoring — default (landing / listing / static templates):
 *   row 1, one cell: <h1>, lede <p>(s), CTA <p>(s) (<strong><a> primary, <em><a> secondary)
 *   row 2, one cell: 1–3 images (each becomes a 3/2 tile in a 2-column media grid; the row is
 *   optional — case-studies has no media)
 *   variants: `media-4x3` — a single 4/3 image (faq page hero)
 * Authoring — `hero (article)` (article template):
 *   row 1, one cell: image (3/2)
 *   row 2, one cell: <ul> breadcrumbs, <h1> (rendered at h2 size), meta <p>s
 *   ("By <strong>Author</strong>", "Date • N min read"), tag <p> (short label, last)
 *
 * Harness-only fallbacks (EW5): the collector wraps bare text nodes in a fresh <p> by MOVING the
 * node; on DA content every text is already a <p>/<h*>, so the branch never fires there.
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

export default function decorate(block) {
  const nodes = collectNodes(block);
  if (!nodes.length) return;
  const article = block.classList.contains('article');
  const heading = nodes.find(isHeading);
  const media = [];
  const crumbs = [];
  const ctas = [];
  const copy = [];
  nodes.forEach((n) => {
    const m = mediaOf(n);
    if (m && !n.textContent.trim()) media.push(m);
    else if (n.tagName === 'UL' || n.tagName === 'OL') crumbs.push(n);
    else if (isCta(n)) ctas.push(n);
    else if (n !== heading && n.textContent.trim()) copy.push(n);
  });

  const grid = document.createElement('div');
  grid.className = `hero-grid grid-layout tablet-1-column ${article ? 'grid-gap-lg' : 'grid-gap-xxl'}`;

  const text = document.createElement('div');
  text.className = 'hero-copy';
  crumbs.forEach((list) => text.append(wrapNode(list, 'breadcrumbs')));
  if (heading) text.append(wrapNode(heading, 'headline'));
  if (article) {
    const meta = document.createElement('div');
    meta.className = 'hero-meta';
    const tags = [];
    copy.forEach((p) => {
      if (isMeta(p)) meta.append(wrapNode(p, 'meta-line'));
      else tags.push(wrapNode(p, 'tag-wrap'));
    });
    if (meta.children.length) text.append(meta);
    text.append(...tags);
  } else {
    copy.forEach((p, i) => text.append(wrapNode(p, i ? 'lede-more' : 'lede')));
  }
  if (ctas.length) {
    const group = document.createElement('div');
    group.className = 'button-group';
    group.append(...ctas);
    text.append(group);
  }

  let mediaWrap = null;
  if (media.length) {
    mediaWrap = document.createElement('div');
    mediaWrap.className = article ? 'hero-media' : 'hero-media grid-layout tablet-1-column grid-gap-xs';
    media.forEach((m) => mediaWrap.append(m));
  }

  if (article) grid.append(...[mediaWrap, text].filter(Boolean));
  else grid.append(...[text, mediaWrap].filter(Boolean));
  block.replaceChildren(grid);
}
