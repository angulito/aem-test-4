import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// the source navbar collapses to the hamburger at <= 991px
const isDesktop = window.matchMedia('(min-width: 992px)');

/* brand / decorative marks, lifted inline from the source navbar */
const LOGO_SVG = '<svg width="100%" height="100%" viewBox="0 0 33 33" '
  + 'preserveAspectRatio="xMidYMid meet" aria-hidden="true"><path d="M28,0H5C2.24,0,0,2.24,0,5v23c0,'
  + '2.76,2.24,5,5,5h23c2.76,0,5-2.24,5-5V5c0-2.76-2.24-5-5-5ZM29,17c-6.63,0-12,5.37-12,12h-1c0-6.63'
  + '-5.37-12-12-12v-1c6.63,0,12-5.37,12-12h1c0,6.63,5.37,12,12,12v1Z" fill="currentColor"/></svg>';
const CARET_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" '
  + 'viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 6L8 10L12 6" '
  + 'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const ARROW_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" '
  + 'viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2 8H14.5M14.5 8L8.5 2M14.5 8L8.5 14" '
  + 'stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>';
const BURGER_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" '
  + 'aria-hidden="true"><g stroke-linecap="square" stroke-linejoin="miter" stroke-width="1.5" '
  + 'fill="none" stroke="currentColor" stroke-miterlimit="10"><line x1="1" y1="12" x2="23" y2="12"/>'
  + '<line x1="1" y1="5" x2="23" y2="5"/><line x1="1" y1="19" x2="23" y2="19"/></g></svg>';
const MEGA_ICON_OPEN = '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" '
  + 'viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">';
const MEGA_ICON_RING = '<path d="M16 4a12 12 0 1 0 12 12A12 12 0 0 0 16 4Zm0 22a10 10 0 1 1 10-10 '
  + '10 10 0 0 1-10 10Z"/>';
const MEGA_ICON_DOT = '<path d="M16 10a6 6 0 1 0 6 6 6 6 0 0 0-6-6Zm0 10a4 4 0 1 1 4-4 4 4 0 0 1-4 '
  + '4Z"/>';
const MEGA_ICON_FILE = '<path d="m25.7 9.3l-7-7A.9.9 0 0 0 18 2H8a2.006 2.006 0 0 0-2 2v24a2.006 '
  + '2.006 0 0 0 2 2h16a2.006 2.006 0 0 0 2-2V10a.9.9 0 0 0-.3-.7M18 4.4l5.6 5.6H18ZM24 28H8V4h8v6a2.006 '
  + '2.006 0 0 0 2 2h6Z" stroke-linejoin="round"/>';
const MEGA_ICONS = {
  streetwear: `${MEGA_ICON_OPEN}${MEGA_ICON_RING}${MEGA_ICON_DOT}</svg>`,
  ring: `${MEGA_ICON_OPEN}${MEGA_ICON_RING}</svg>`,
  file: `${MEGA_ICON_OPEN}${MEGA_ICON_FILE}</svg>`,
};
// the source's per-group icon families: "Inspo" links use the file mark, the rest the ring
const FILE_ICON_GROUPS = ['inspo'];

function el(tag, className, html) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (html) node.innerHTML = html;
  return node;
}

function key(text) {
  return (text || '').trim().toLowerCase();
}

/**
 * Splits an authored list item into its lead nodes (text, <p>, <a> before the
 * nested list) and its nested list, tolerating the live pipeline shape
 * <li><p><a></p><ul>…</ul></li> as well as the tight <li><a><ul>…</ul></li>.
 */
function splitItem(li) {
  const lead = [];
  let sub = null;
  [...li.childNodes].forEach((node) => {
    if (!sub && node.nodeType === Node.ELEMENT_NODE && /^(UL|OL)$/.test(node.tagName)) {
      sub = node;
    } else if (node.nodeType !== Node.TEXT_NODE || node.textContent.trim()) {
      lead.push(node);
    }
  });
  return { lead, sub };
}

/** Moves the item's lead nodes into `slot`, unwrapping a single-link <p>. */
function moveLead(lead, slot) {
  lead.forEach((node) => {
    const single = node.nodeType === Node.ELEMENT_NODE
      && node.tagName === 'P' && node.children.length === 1
      && node.firstElementChild.tagName === 'A' && node.textContent.trim()
        === node.firstElementChild.textContent.trim();
    slot.append(single ? node.firstElementChild : node);
  });
}

function buildTrigger(lead, hasSub) {
  const hasLink = lead.some((n) => n.nodeType === Node.ELEMENT_NODE
    && (n.tagName === 'A' || n.querySelector('a')));
  // the slot is the source a.nav-link box; the authored text element stays bare inside it
  const trigger = el('div', hasLink ? 'nav-link' : 'nav-link nav-link-trigger');
  moveLead(lead, trigger);
  if (hasSub) trigger.append(el('div', 'nav-caret', CARET_SVG));
  return trigger;
}

/** One column of the mega menu: heading + linked items with descriptions. */
function buildMegaGroup(groupLi) {
  const { lead, sub } = splitItem(groupLi);
  const li = el('li');
  const heading = el('div', 'mega-menu-heading');
  moveLead(lead, heading);
  li.append(heading);
  const iconName = FILE_ICON_GROUPS.includes(key(heading.textContent)) ? 'file' : 'ring';
  const list = el('ul');
  [...sub.children].forEach((itemLi) => {
    const parts = splitItem(itemLi);
    const item = el('li');
    const card = el('div', 'mega-nav-link-item');
    const icon = MEGA_ICONS[key(parts.lead[0]?.textContent)] || MEGA_ICONS[iconName];
    card.append(el('div', 'icon-medium', icon));
    const text = el('div', 'mega-nav-link-text');
    const [title, ...rest] = parts.lead;
    if (title) {
      const titleSlot = el('div', 'mega-nav-link-title');
      moveLead([title], titleSlot);
      text.append(titleSlot);
    }
    if (rest.length) {
      const copy = el('div', 'mega-nav-link-copy');
      rest.forEach((node) => copy.append(node));
      text.append(copy);
    }
    card.append(text);
    item.append(card);
    list.append(item);
  });
  li.append(list);
  return li;
}

/** The mega menu's promo card: title link, copy and a text-button label. */
function buildMegaCard(cardLi) {
  const { lead } = splitItem(cardLi);
  const li = el('li', 'flex-horizontal');
  const card = el('div', 'inverse-card-link');
  const body = el('div', 'card-body');
  const title = lead.find((n) => n.nodeType === Node.ELEMENT_NODE
    && (n.tagName === 'A' || n.querySelector('a'))) || lead[0];
  const rest = lead.filter((n) => n !== title);
  const label = rest.length > 1 ? rest.pop() : null;
  if (title) {
    const titleSlot = el('div', 'mega-card-title');
    moveLead([title], titleSlot);
    body.append(titleSlot);
  }
  if (rest.length) {
    const copy = el('div', 'mega-card-copy');
    rest.forEach((node) => copy.append(node));
    body.append(copy);
  }
  if (label) {
    const button = el('div', 'text-button');
    button.append(label);
    button.append(el('div', 'button-icon', ARROW_SVG));
    const wrap = el('div');
    wrap.append(button);
    body.append(wrap);
  }
  card.append(body);
  li.append(card);
  return li;
}

function buildMegaMenu(sub) {
  const mega = el('div', 'mega-menu');
  const grid = el('ul', 'mega-menu-grid');
  [...sub.children].forEach((child) => {
    grid.append(child.querySelector(':scope > ul, :scope > ol') ? buildMegaGroup(child) : buildMegaCard(child));
  });
  mega.append(grid);
  return mega;
}

function buildDropdown(lead, sub) {
  const dropdown = el('div', 'nav-menu-dropdown');
  dropdown.append(buildTrigger(lead, true));
  const listWrap = el('div', 'nav-menu-dropdown-list');
  const list = el('ul');
  [...sub.children].forEach((itemLi) => {
    const li = el('li');
    const slot = el('div', 'nav-dropdown-link');
    moveLead(splitItem(itemLi).lead, slot);
    li.append(slot);
    list.append(li);
  });
  listWrap.append(list);
  dropdown.append(listWrap);
  return dropdown;
}

/** A top-level nav item: plain link, dropdown (flat sub-list) or mega menu (grouped sub-list). */
function buildTopItem(authoredLi) {
  const { lead, sub } = splitItem(authoredLi);
  const item = el('li', 'nav-menu-list-item');
  if (!sub) {
    item.append(buildTrigger(lead, false));
  } else if ([...sub.children].some((c) => c.querySelector(':scope > ul, :scope > ol'))) {
    item.append(buildTrigger(lead, true));
    item.append(buildMegaMenu(sub));
  } else {
    item.append(buildDropdown(lead, sub));
  }
  return item;
}

function closeOnEscape(e) {
  if (e.code === 'Escape' && !isDesktop.matches) {
    const nav = document.getElementById('nav');
    // eslint-disable-next-line no-use-before-define
    toggleMenu(nav, false);
    nav.querySelector('.nav-hamburger button').focus();
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget) && !isDesktop.matches) {
    // eslint-disable-next-line no-use-before-define
    toggleMenu(nav, false);
  }
}

/**
 * Toggles the mobile menu (the source toggles .is-open on #nav-menu + aria-expanded).
 * @param {Element} nav The navbar root
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  const menu = nav.querySelector('.nav-menu');
  const open = !expanded && !isDesktop.matches;
  document.body.style.overflowY = open ? 'hidden' : '';
  nav.setAttribute('aria-expanded', open ? 'true' : 'false');
  button.setAttribute('aria-expanded', open ? 'true' : 'false');
  button.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  if (menu) menu.classList.toggle('is-open', open);
  if (open) {
    window.addEventListener('keydown', closeOnEscape);
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

function contentSections(fragment) {
  if (!fragment) return [];
  fragment.querySelectorAll('.metadata').forEach((m) => m.remove());
  return [...fragment.querySelectorAll(':scope > div')]
    .filter((section) => section.textContent.trim() || section.querySelector('img, a'));
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);
  const [brandSection, menuSection, toolsSection] = contentSections(fragment);

  // the source navbar, as empty slots
  block.textContent = '';
  const nav = el('div', 'navbar');
  nav.id = 'nav';
  const container = el('div', 'container');
  const inner = el('div', 'nav-inner');
  nav.append(container);
  container.append(inner);

  // brand: inline logo mark + the authored brand link
  const logo = el('div', 'logo');
  logo.append(el('div', 'nav-logo-icon', LOGO_SVG));
  if (brandSection) {
    const brandLink = brandSection.querySelector('a');
    const brandNode = brandLink ? brandLink.closest('p') || brandLink : brandSection.firstElementChild;
    if (brandNode) logo.append(brandNode);
  }
  inner.append(logo);

  // menu: each authored top-level <li> becomes a nav item
  const menu = el('nav', 'nav-menu');
  menu.id = 'nav-menu';
  menu.setAttribute('aria-label', 'Main navigation');
  const list = el('ul', 'nav-menu-list');
  const authoredList = menuSection ? menuSection.querySelector('ul, ol') : null;
  if (authoredList) [...authoredList.children].forEach((li) => list.append(buildTopItem(li)));
  menu.append(list);
  inner.append(menu);

  // tools: CTAs move as their (button-wrapper) paragraphs
  const right = el('div', 'nav-right');
  const group = el('div', 'button-group');
  if (toolsSection) {
    [...toolsSection.querySelectorAll('p')].forEach((p) => group.append(p));
  }
  right.append(group);
  inner.append(right);

  // hamburger for mobile
  const hamburger = el('div', 'nav-hamburger');
  hamburger.innerHTML = '<button type="button" class="nav-mobile-menu-button" aria-controls="nav-menu" '
    + 'aria-expanded="false" aria-label="Open navigation"></button>';
  hamburger.querySelector('button').append(el('div', 'icon', BURGER_SVG));
  hamburger.addEventListener('click', () => toggleMenu(nav));
  inner.append(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  toggleMenu(nav, false);
  // prevent mobile nav behavior on window resize
  isDesktop.addEventListener('change', () => toggleMenu(nav, false));

  block.append(nav);
}
