/**
 * blog-content — rich-text article body (article template, 7 instances).
 *
 * Decode tier: reconstructive (a prose stream consumed row by row, in order — never rows[N]).
 * Prototype section: `main > section:nth-of-type(2) .blog-content` (blog-ace-pro-court-polo);
 * schema stardust/eds-schema/blog-ace-pro-court-polo.json sections[1].
 *
 * Authoring:
 *   one-cell row: a run of rich text — h2/h3, p, ul/ol, blockquote, p > img — MOVED as authored,
 *     tags untouched (the pipeline delivers the run with its block-level tags intact)
 *   rows with 2+ cells: a data table. A run of consecutive multi-cell rows becomes ONE <table>;
 *     its first row is the header (<thead><th>), the rest the body (<tbody><td>). The cell's
 *     authored nodes are MOVED into the th/td (single-paragraph cells arrive as inline content).
 *     Live source: an unstyled UA-default table, so no table rule exists here either.
 * Variants: none (variant budget 0 — copy length, image count and the table are content).
 */
export default function decorate(block) {
  const out = [];
  let table = null;
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells.length >= 2) {
      if (!table) {
        table = document.createElement('table');
        table.append(document.createElement('thead'), document.createElement('tbody'));
        out.push(table);
      }
      const isHead = !table.tHead.children.length;
      const tr = document.createElement('tr');
      cells.forEach((cell) => {
        const slot = document.createElement(isHead ? 'th' : 'td');
        slot.append(...cell.childNodes);
        tr.append(slot);
      });
      (isHead ? table.tHead : table.tBodies[0]).append(tr);
    } else {
      table = null;
      cells.forEach((cell) => out.push(...cell.childNodes));
    }
  });
  block.replaceChildren(...out);
}
