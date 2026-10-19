/**
 * testimonial-tabs — four testimonials as tab panes with an avatar tab menu (index, case-studies).
 *
 * Decode tier: template-slotted per unit (one authored row = one testimonial; nodes MOVED by role).
 * Schema: stardust/eds-schema/index.json sections[2] (repeats: 4 units, 8 images).
 *
 * Authoring — one row per testimonial, three cells:
 *   cell 1: pane photo (4/3)     cell 2: avatar (1:1, decorative alt "")
 *   cell 3: <p><strong>Name</strong></p>, <p>Role</p>, <p>“Quote”</p>
 *   Classification: name = paragraph that is only a <strong>; quote = paragraph carrying a
 *   quotation mark (or the longest one); role = the remaining paragraph. Order is the fallback.
 * The tab menu repeats name and role: those are presentational CLONES with the workspace
 * instrumentation stripped (EW4) — the editable originals live in the pane.
 * Behaviour (observed on the live page): click a tab → its pane shows, the others hide.
 *
 * Harness-only fallbacks (EW5): bare text nodes are wrapped by MOVING them into a fresh <p>.
 */

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

const mediaOf = (el) => (el.matches('picture, img') ? el : el.querySelector('picture, img'));

function stripInstrumentation(el) {
  el.querySelectorAll('[data-prose-index], [data-image-index]').forEach((n) => {
    n.removeAttribute('data-prose-index');
    n.removeAttribute('data-image-index');
  });
  el.removeAttribute('data-prose-index');
  return el;
}

const isName = (p) => p.children.length === 1 && p.firstElementChild.tagName === 'STRONG'
  && p.firstElementChild.textContent.trim() === p.textContent.trim();
const isQuote = (p) => /[“"„«]/.test(p.textContent);

let instance = 0;

function classify(row) {
  const media = [];
  const ps = [];
  const rest = [];
  [...row.querySelectorAll(':scope > div')].forEach((cell) => {
    [...cell.children].forEach((n) => {
      const m = mediaOf(n);
      if (m && !n.textContent.trim()) media.push(m);
      else if (n.tagName === 'P' && n.textContent.trim()) ps.push(n);
      else if (n.textContent.trim()) rest.push(n);
    });
    if (!cell.children.length && cell.textContent.trim()) {
      const p = document.createElement('p');
      p.append(...cell.childNodes);
      ps.push(p);
    }
  });
  const name = ps.find(isName) || ps[0] || null;
  let quote = ps.find((p) => p !== name && isQuote(p)) || null;
  if (!quote) {
    quote = ps.filter((p) => p !== name)
      .sort((a, b) => b.textContent.length - a.textContent.length)[0]
      || null;
  }
  const role = ps.find((p) => p !== name && p !== quote) || null;
  const leftovers = ps.filter((p) => p !== name && p !== quote && p !== role).concat(rest);
  return {
    photo: media[0] || null, avatar: media[1] || null, name, role, quote, leftovers,
  };
}

function activate(block, index) {
  block.querySelectorAll('.tab-pane').forEach((pane, i) => {
    pane.classList.toggle('is-active', i === index);
    if (i === index) pane.removeAttribute('hidden');
    else pane.setAttribute('hidden', '');
  });
  block.querySelectorAll('.tab-menu-link').forEach((tab, i) => {
    tab.classList.toggle('is-active', i === index);
    tab.setAttribute('aria-selected', i === index ? 'true' : 'false');
    tab.setAttribute('tabindex', i === index ? '0' : '-1');
  });
}

export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;
  instance += 1;
  const prefix = `tt${instance}`;
  const wrapper = document.createElement('div');
  wrapper.className = 'tabs-wrapper';
  const content = document.createElement('div');
  content.className = 'tabs-content';
  const menu = document.createElement('div');
  menu.className = 'grid-layout desktop-4-column tablet-2-column-1 mobile-portrait-1-column tab-menu';
  menu.setAttribute('role', 'tablist');
  menu.setAttribute('aria-label', 'Testimonials');

  rows.forEach((row, i) => {
    const unit = classify(row);
    const pane = document.createElement('div');
    pane.className = `tab-pane${i === 0 ? ' is-active' : ''}`;
    pane.id = `${prefix}-panel-${i}`;
    pane.setAttribute('role', 'tabpanel');
    pane.setAttribute('aria-labelledby', `${prefix}-tab-${i}`);
    pane.setAttribute('tabindex', '0');
    if (i !== 0) pane.setAttribute('hidden', '');
    const grid = document.createElement('div');
    grid.className = 'grid-layout tablet-1-column grid-gap-md';
    if (unit.photo) grid.append(wrapNode(unit.photo, 'tab-media'));
    const copy = document.createElement('div');
    copy.className = 'tab-copy';
    const person = document.createElement('div');
    person.className = 'tab-person';
    const tabName = unit.name ? stripInstrumentation(unit.name.cloneNode(true)) : null;
    const tabRole = unit.role ? stripInstrumentation(unit.role.cloneNode(true)) : null;
    if (unit.name) person.append(wrapNode(unit.name, 'tab-name'));
    if (unit.role) person.append(wrapNode(unit.role, 'tab-role'));
    if (person.children.length) copy.append(person);
    if (unit.quote) copy.append(wrapNode(unit.quote, 'tab-quote'));
    copy.append(...unit.leftovers);
    grid.append(copy);
    pane.append(grid);
    content.append(pane);

    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = `tab-menu-link${i === 0 ? ' is-active' : ''}`;
    tab.id = `${prefix}-tab-${i}`;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    tab.setAttribute('aria-controls', pane.id);
    tab.setAttribute('tabindex', i === 0 ? '0' : '-1');
    const inner = document.createElement('div');
    inner.className = 'flex-horizontal y-center flex-gap-xs';
    if (unit.avatar) inner.append(wrapNode(unit.avatar, 'avatar'));
    const label = document.createElement('div');
    label.className = 'tab-menu-text';
    if (tabName) label.append(wrapNode(tabName, 'tab-menu-name'));
    if (tabRole) label.append(wrapNode(tabRole, 'tab-menu-role'));
    inner.append(label);
    tab.append(inner);
    tab.addEventListener('click', () => activate(block, i));
    menu.append(tab);
  });

  menu.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const tabs = [...menu.querySelectorAll('.tab-menu-link')];
    const current = tabs.findIndex((t) => t.classList.contains('is-active'));
    const next = (current + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length;
    activate(block, next);
    tabs[next].focus();
    e.preventDefault();
  });

  wrapper.append(content, menu);
  block.replaceChildren(wrapper);
}
