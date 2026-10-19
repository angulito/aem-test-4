# blog-ace-pro-court-polo (article, /blog/ace-pro-court-polo) — lift notes

Shared layer: canon.css already carries every class this page uses (verified grep canon:≥1 / site:1 for
.breadcrumbs, .text-link, .secondary-text-link, .tablet-1-column, .grid-gap-lg, .utility-text-black,
.utility-margin-bottom-0, .utility-margin-top-0-5rem, .utility-text-secondary, .cover-image,
.utility-aspect-3x2, .h2-heading, .tag, .flex-gap-xxs, .flex-horizontal, .paragraph-sm).

Chrome: captured navbar (`body > div.navbar`) and `footer.footer` are byte-identical to the captured
/blog (html-slice diff: only the offset line differs). Header/footer markup html-sliced from
blog-proposed.html lines 16–154 (skip-link + navbar) and 248–307 (footer + nav-toggle script).
Live has ONE module <script> (nav toggle). NOTE: on this page the hero is `section.section`, not
`header.section` — mirrored as captured.

## New module (article-only Astro-scoped <style>, 768 chars, `[data-astro-cid-2q5oecfc]`)
.blog-content h2 mt 2.5rem mb 1rem | h3 mt 2rem mb .75rem | p mb 1.25rem lh 1.7 | ul,ol mb 1.25rem pl 1.5rem
| li mb .5rem list-style disc | ol li decimal | blockquote border-left 4px yellow, pl 1.5rem, m 2rem 0,
italic, gray-700 | img radius-card, m 2rem 0. Table: no rule anywhere (UA defaults under the universal
margin/padding 0 reset) — left unstyled.

## Content skeleton (counts before authoring)
- main#main-content > section.section > .container > .grid-layout.tablet-1-column.grid-gap-lg
  (style align-items center): [img cover-image utility-aspect-3x2 ace-polo-court-style.avif,
  radius-card, fetchpriority high] + [breadcrumbs (Home › svg chevron 12×12 › Blog → /fashion-insights),
  h1.h2-heading, meta block (mt md): By / Taylor Brooks; February 23, 2026 • 4 min read (mt .5rem),
  .tag Casual Cool (mt md)]
- section.section (style padding-top 0) > .container (style max-width 48rem) > .blog-content:
  7 h2 (ids), 1 h3, 19 p (2 wrapping <img>), 1 ul (4 li), 1 blockquote (1 p), 1 table (2 th, 5 rows × 2 td).
- 3 images total = media.allImgCount 3. Root-relative links kept (/, /fashion-insights).

## Renditions: single src per img (no srcset) — same as index/blog; no rendition fork possible.
