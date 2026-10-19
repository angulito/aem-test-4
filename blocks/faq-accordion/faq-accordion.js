/**
 * faq-accordion — optional head column (title + lede) beside a list of collapsible Q&A items
 * (index: two columns; faq page: list only, centred at 48rem).
 *
 * Decode tier: reconstructive (repeat group; authors add/remove questions).
 * Schema: stardust/eds-schema/index.json sections[4]; faq.json sections[0].
 *
 * Authoring:
 *   optional row 1, one cell: <h2>, lede <p>         (absent on the faq page → `no-head` layout)
 *   rows 2..N, one row per question, two cells: question <p> | answer <p>(s)
 *   (a single-cell row also works: first <p> = question, the rest = answer)
 * Behaviour (observed: live <details>/<summary>, motion inventory
 *   stardust/replica/motion/faq.json):
 *   click the question row → answer toggles; plus icon rotates 45° over .3s; row hover tint .15s.
 *   EW7: the question paragraph stays editable in div.faq-question-text; the whole row takes the
 *   click, the <button> is a chevron-only toggle with an aria-label.
 *
 * Harness-only fallbacks (EW5): bare text nodes are wrapped by MOVING them into a fresh <p>.
 */

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

const isHeading = (el) => /^H[1-6]$/.test(el.tagName);
const ICON = '<svg class="faq-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" '
  + 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" '
  + 'stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"></line>'
  + '<line x1="5" y1="12" x2="19" y2="12"></line></svg>';

let instance = 0;

function cellNodes(cell) {
  const kids = [...cell.children];
  if (kids.length) return kids;
  if (!cell.textContent.trim()) return [];
  const p = document.createElement('p');
  p.append(...cell.childNodes);
  return [p];
}

function buildItem(question, answers, id) {
  const item = document.createElement('div');
  item.className = 'faq-item';
  const row = document.createElement('div');
  row.className = 'faq-question';
  const text = document.createElement('div');
  text.className = 'faq-question-text';
  text.append(...question);
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'faq-toggle';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', id);
  toggle.setAttribute('aria-label', 'Toggle answer');
  toggle.innerHTML = ICON;
  row.append(text, toggle);
  const answer = document.createElement('div');
  answer.className = 'faq-answer';
  answer.id = id;
  answer.setAttribute('hidden', '');
  answer.append(...answers);
  item.append(row, answer);
  row.addEventListener('click', () => {
    const open = item.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) answer.removeAttribute('hidden');
    else answer.setAttribute('hidden', '');
  });
  return item;
}

export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;
  instance += 1;
  const head = document.createElement('div');
  head.className = 'faq-head';
  const list = document.createElement('div');
  list.className = 'faq-list';
  rows.forEach((row, i) => {
    const cells = [...row.querySelectorAll(':scope > div')];
    const nodes = cells.map(cellNodes);
    const flat = nodes.flat();
    if (flat.some(isHeading) && !flat.some((n) => n.tagName === 'P' && cells.length > 1)) {
      flat.forEach((n) => head.append(wrapNode(n, isHeading(n) ? 'headline' : 'lede')));
      return;
    }
    let question;
    let answers;
    if (cells.length >= 2) {
      [question] = nodes;
      answers = nodes.slice(1).flat();
    } else {
      question = flat.slice(0, 1);
      answers = flat.slice(1);
    }
    if (!question.length) return;
    list.append(buildItem(question, answers, `faq${instance}-a${i}`));
  });
  if (head.children.length) {
    const grid = document.createElement('div');
    grid.className = 'faq-grid grid-layout tablet-1-column grid-gap-xxl';
    grid.append(head, list);
    block.replaceChildren(grid);
  } else {
    block.classList.add('no-head');
    block.replaceChildren(list);
  }
}
