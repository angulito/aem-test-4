/**
 * cta-band — closing call-to-action band (index, case-studies, blog, faq: 8 instances).
 *
 * Decode tier: template-slotted (fixed composition; nodes MOVED by role).
 * Schema: stardust/eds-schema/index.json sections[5]; blog.json / faq.json last section.
 *
 * Two compositions, chosen by content (the section ground is section metadata: `Style: inverse`
 * for the photo band, `Style: accent` for the centred band):
 *   photo band  — one row, one cell: image (decorative, alt ""), <h2> (rendered at h1 size),
 *                 lede <p>, CTA <p> (<em><strong><a> = .button.accent on the dark photo)
 *   centred band — one row, one cell: <h2>, lede <p>, CTA <p> (<strong><a>); no image.
 *   The `cta-accent` variant class (plan.md variant budget) forces the centred composition even
 *   when an image is authored.
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
  const media = [];
  const ctas = [];
  const lede = [];
  const leftovers = [];
  nodes.forEach((n) => {
    const m = mediaOf(n);
    if (m && !n.textContent.trim()) media.push(m);
    else if (isCta(n)) ctas.push(n);
    else if (n !== heading && n.tagName === 'P') lede.push(n);
    else if (n !== heading && n.textContent.trim()) leftovers.push(n);
  });
  const centred = block.classList.contains('cta-accent') || !media.length;

  const body = document.createElement('div');
  body.className = centred ? 'cta-center utility-text-align-center' : 'cta-body';
  if (heading) body.append(wrapNode(heading, 'headline'));
  lede.forEach((p) => body.append(wrapNode(p, 'lede')));
  if (ctas.length) {
    const group = document.createElement('div');
    group.className = 'button-group';
    group.append(...ctas);
    body.append(group);
  }
  body.append(...leftovers);

  if (centred) {
    block.replaceChildren(body);
    return;
  }
  const card = document.createElement('div');
  card.className = 'cta-card';
  const mw = document.createElement('div');
  mw.className = 'cta-media';
  media.forEach((m) => mw.append(m));
  const overlay = document.createElement('div');
  overlay.className = 'cta-overlay';
  card.append(mw, overlay, body);
  block.replaceChildren(card);
}
