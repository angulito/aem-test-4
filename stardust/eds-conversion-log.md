# EDS conversion log — C0 foundation (WKND Trendsetters replica)

Date: 2026-09-28. Scope: foundation only (styles, fonts, favicon, header/footer blocks,
`/nav` + `/footer` documents, media upload). Page blocks are owned by the clusters.

## Runtime contract (stardust/runtime-contract.json)
- runtime `vanilla-eds`; `decorateBlock` adds `.block` + `data-block-name`, wraps in
  `div.<name>-wrapper`, section gains `.<name>-container`.
- Buttons: `decorateButtons` (scripts/scripts.js) is formatted-only — `p a[href]` alone in its
  paragraph wrapped in `<strong>` -> `a.button.primary`, `<em>` -> `a.button.secondary`, both ->
  `a.button.accent`; the paragraph becomes `p.button-wrapper`; the emphasis tag is replaced.
  Bare links stay links. Links containing `<img>` are skipped.
- Fragments: `loadFragment(path)` fetches `<path>.plain.html`, runs `decorateMain`, returns a
  `<main>` whose children are `.section` divs; `<script>` is inert (innerHTML).
- `emptySectionCollapse: true` — the metadata block is removed from the served HTML and leaves an
  empty first `<div>` (verified on the dev server: `/nav.plain.html` starts with `<div></div>`).
  Foundation ships `main .section:empty { display: none }`; the chrome blocks skip empty sections.

## Foundation decisions (styles/styles.css)
- Tokens: the source `:root` lifted verbatim from stardust/prototypes/css/canon.css (colours,
  type scale, leading, spacing, radii, shadows, transitions, focus ring, icon sizes). Only change:
  the font stacks gain the metric-matched fallback faces
  (`'Syncopate', syncopate-fallback, sans-serif` / `'Instrument Sans', instrument-sans-fallback,
  sans-serif`).
- Reset: the source's own `*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0 }`
  (the pixel gate passed with it). Base html/body, `img { display:block; max-width:100%; height:auto }`,
  `a { color: inherit; text-decoration: none }`, `ul, ol { list-style: none }`, `:focus-visible`.
- Structural layer kept verbatim: `body { display: none }` / `body.appear`, `header { height:
  var(--nav-height) }`, `header .header` / `footer .footer` visibility gate on
  `[data-block-status="loaded"]`, `main > .section` scaffold.
- `--nav-height: 84px` at every width — measured live `.navbar` = 83.39px at 1440 and at 360
  (rounded up). The header host is `position: sticky; top: 0; z-index: 100` with a white ground,
  mirroring the live `.navbar { position: sticky; top: 0 }`.
- Type ramp: the lifted h1–h6 / `.h1-heading`…`.h6-heading`, `.subheading`, `.paragraph-xl/lg/sm`.
- Layout helpers lifted: `.container`, `.grid-layout*`, `.grid-gap-*`, `.flex-*`, `.y-center`,
  `.x-left`, `.icon*`.
- Section scaffold retuned to the source rhythm: `main > .section { padding-block: var(--space-5xl) }`
  (4xl at <= 991px, 3xl at <= 767px); `main > .section > div` is the source `.container`
  (max-width 1200px, padding-inline `--container-padding`, 1rem at <= 479px).
- Section styles (one `style` value per section): `main .section.secondary` (gray-100 ground),
  `main .section.inverse` (black ground, white text), `main .section.accent` (yellow ground) —
  the source `.secondary-section` / `.inverse-section` / `.accent-section`.
- Button mapping: `a.button:any-link, button.button` (incl. `.primary`) = source `.button`
  (black fill, pill, 2px border, 4px hard shadow, hover translate(-2px,-2px) + 6px shadow, active
  2px shadow); `a.button.secondary` = source `.secondary-button` (white fill, black text);
  `a.button.accent` (`<em><strong>`) = source `.inverse-button` (for dark grounds).
  `p.button-wrapper { margin: 0 }`; `.button-group` = source (flex, wrap, gap 1rem, margin-top 2rem;
  column at <= 767px where `a.button` also goes `width: 100%`). `.text-button`, `.button-label`,
  `.button-icon` lifted.
- Experience Workspace edit-mode snippets (scoped on `.prosemirror-editor`): CTA repaint from
  `<strong>`/`<em>` marks with this project's button declarations, card-as-link inner anchor,
  and the on-dark (`main .section.inverse`) variant LAST in the file.
- Compatibility alias `--background-color: var(--color-white)` in `:root` so the untouched stock
  demo blocks (cards, hero) pass the token-completeness gate until the clusters replace them.

## Fonts
- Brand faces self-hosted in `fonts/` (instrument-sans-latin.woff2, syncopate-400-latin.woff2,
  syncopate-700-latin.woff2 — SIL Open Font Licence 1.1, redistribution permitted, no licensing
  alert needed). Roboto files and their `@font-face` rules removed.
- `styles/fonts.css`: the source `@font-face` rules (same family names, weight ranges,
  unicode-range, `font-display: swap`), `src: /fonts/<file>`.
- `styles/styles.css`: metric-matched fallbacks on local Arial computed with fontTools against
  Liberation Sans (Arial-metric): `instrument-sans-fallback` size-adjust 102.88% / ascent 94.28% /
  descent 24.30%; `syncopate-fallback` size-adjust 170% / ascent 44.69% / descent 12.24% /
  line-gap 4.31%.
- head.html: no font loads or preloads. Its only addition is `<link rel="icon" href="/favicon.svg">`
  (favicon copied from stardust/current/assets/favicon.svg).

## Chrome — decode tier: template-slotted
- `blocks/header/header.js` loads `/nav` (stock `loadFragment`, `nav` metadata override kept),
  builds the source navbar DOM as empty slots
  (`.navbar > .container > .nav-inner > .logo | nav.nav-menu > .nav-menu-list | .nav-right >
  .button-group | .nav-hamburger > button.nav-mobile-menu-button`) and MOVES authored content:
  section 1 (brand `<p><a>`) into `.logo` next to the inline logo SVG; section 2 `<ul>` items into
  `.nav-menu-list-item` slots — a flat nested `<ul>` becomes `.nav-menu-dropdown`, a nested `<ul>`
  whose items have their own `<ul>` becomes `.mega-menu` (3 grouped columns + the promo card = the
  item without a nested list); section 3 CTAs move as their `p.button-wrapper` into `.button-group`.
  Live pipeline shape `<li><p>…</p><ul>` handled (`splitItem` + single-link `<p>` unwrap).
- No class is ever put on an authored element; paint goes through wrapper descendant selectors
  (`header .nav-link a`, `header .nav-dropdown-link a`, `header .mega-nav-link-title`, …).
- Interaction: only what fired live — hover/focus-within dropdown + mega menu (CSS, lifted),
  nav-link / dropdown-link / mega-item hover ground, button hover shadow, hamburger toggling
  `.is-open` on `#nav-menu` + `aria-expanded` (live mechanism) via the kept stock `toggleMenu`
  machinery (escape, focus-out, `isDesktop` = `(min-width: 992px)` matching the source 991px
  breakpoint). Desktop click-to-expand of the stock block is not implemented (live uses hover).
- Invisible addition: `header .mega-menu::before` bridges the 1.5rem hover gap between the
  trigger and the panel (deploy SKILL § Chrome, option b); off in the mobile query.
- Icons: the logo mark, caret, burger, mega-menu marks (ring / ring+dot / file, keyed by group or
  title) and the text-button arrow are inline SVG templates in header.js (brand/decorative marks).
- `blocks/footer/footer.js` renders content/footer.html sections in order: brand column
  (logo SVG + authored brand link, then the authored social list as `.footer-icon-link` discs —
  the authored anchor is MOVED into a `.footer-icon-label` wrapper that covers the disc with its
  text clipped, keeping it clickable and readable by assistive tech), then one
  `nav[aria-label="<heading> links"]` per remaining section (authored `<h2>` + `<ul>`).
  The source `<footer class="footer inverse-footer">` box (padding-block 5rem, black ground,
  white text, `--color-gray-500: #999`) is lifted onto the `footer` host.
- Social icons are inline SVG templates keyed by the authored link text (facebook, instagram,
  x, linkedin, youtube).

## Content documents
- content/nav.html and content/footer.html: DA body fragments, metadata block first (Title,
  Description, Robots noindex), link texts/hrefs verbatim from the prototype (root-relative
  internal hrefs; `#` stays `#`). localize-links check PASS; davids-model-lint PASS; delivery-lint
  0 P0/P1; sanitise: ASCII-only.
- The prototype footer has no legal/copyright line and no other column beyond
  Trends / Inspire / Explore — none authored (nothing dropped from the source).

## Media
- 48/48 AVIF files uploaded to DA `media/wknd/` (scope `wknd`), ledger
  stardust/deploy/media-ledger.json; authored `<img>` URLs must be
  `https://content.da.live/aemcoder/e45f2fd7/media/wknd/<file>`.

## Publish decision
- Publish in the loop: PUT -> preview -> live (deploy-batch.mjs), ledger
  stardust/deploy/ledger-foundation.json.

## Deliberately dropped / not verified
- `.skip-link`, `.breadcrumbs`, card/tab/faq/utility module rules from canon.css are not in the
  foundation (block-owned; clusters lift what they need).
- Horizontal overflow at 360px: the live site itself overflows (scrollWidth 423 > 360); the replica
  shows the same class of overflow (428 on the harness with the fallback face) — kept for fidelity.
- Brand logo mark sits beside (not inside) the authored brand link, so only the text is the link
  (the authored anchor must not be rebuilt or wrapped around template markup).

## Chrome parity fixes (chrome-parity.mjs live vs published /nav)
- Brand text: live carries an inline override on `.paragraph-xl.utility-text-all-caps`
  (Syncopate 700, 14px, lh 1.6, uppercase) -> `header .logo a` / `footer .logo a` (block box 141x22).
- Footer grid: live inline `gap: var(--space-2xl)` on `.grid-layout.desktop-4-column` (columns at
  x 144/444/744/1044); footer social group: live inline `padding-top: var(--space-xl)` (brand
  column 112px, footer 1038px at 360).
- Instagram SVG regenerated verbatim from the prototype (2 paths + 1 circle); all 5 social marks
  match the prototype's path counts.
- Nav triggers: the padded `.nav-link` slot wraps the bare authored text element, mirroring the live
  `a.nav-link > div` shape (Trends text at x 600, Δ 0).
- Remaining parity lines are structural, not visual: tag `<div>` -> `<a>`/`<p>` where the authored
  anchor is the text leaf (About/Blog/Subscribe/footer links carry their own padding like the live
  anchor box), `<a>` box 181x32 -> 141x22 on the brand (icon sits beside the authored link), and
  the 5 visually hidden social link texts (EXTRA) that live exposes only as aria-labels.

## Landing-core cluster — 7 shared blocks, index + case-studies live and gated (2026-09-28)
- Pages: `/` (content/index.html) and `/case-studies` (content/case-studies.html), DA body fragments,
  metadata block first (Title/Description verbatim from the migrated `<head>`), section grounds via
  `section-metadata` Style = secondary / inverse (folded server-side into `.section.secondary|inverse`).
  Images authored as `https://content.da.live/aemcoder/e45f2fd7/media/wknd/<file>` (media-reconcile
  19 + 16 hosted); delivered `.plain.html`: 200, one h1, 0 about:error, 0 /img/, 25/25 and 18/18
  img+alt. Publish in the loop (ledger stardust/deploy/ledger-landing-core.json, 2 ok / 0 failed).
  ai-readability strict 100 / code 100 on both (`/index` is not a served path — probe `/`).
- Decode tiers / variants (block JSDoc = the authoring contract; later clusters reuse untouched):
  - `hero` template-slotted; variants `media-4x3` (faq hero, single 4/3 image) and `article`
    (blog-ace lead: media first, h1 at h2 size, breadcrumbs `<ul>`, meta `<p>`s, tag `<p>`).
    Default = text column + 1–3 images (3/2) in a `grid-layout tablet-1-column grid-gap-xs` media grid.
  - `featured-story` template-slotted, content-classified: `<ul>` = breadcrumbs, pre-heading `<p>`s =
    tag + date row (blog), post-heading `<p>` = meta when it starts with "By" or carries "•", else lede.
  - `snapshot-gallery` reconstructive (head + N 1:1 tiles, one image per row).
  - `testimonial-tabs` template-slotted per unit (one row per testimonial: photo | avatar | name/role/
    quote); the tab menu repeats name + role as `stripInstrumentation()` clones (EW4); click switches
    panes (observed behaviour only) + arrow keys on the tablist.
  - `article-cards` reconstructive (head row + one row per card; card-as-link EW6 unwraps the
    `<h3><a>`; also accepts the flattened single cell segmented on h3/h4).
  - `faq-accordion` reconstructive; EW7: question `<p>` in `div.faq-question-text`, whole row is the
    click target, `<button aria-label>` is the chevron-only toggle; `is-open` rotates the icon 45°
    over .3s (motion inventory faq.json); no head row → `no-head` (48rem centred list, faq page).
  - `cta-band` template-slotted; image present → photo band (28rem card, gradient overlay, h2 at h1
    size, `<em><strong><a>` = .button.accent); no image or `cta-accent` class → centred 36rem band.
- EW exemptions: none (`@ew-exempt` unused). Round-trip (block-roundtrip --ew, profile generic):
  index 7/7 and case-studies 5/5 blocks closed, editable 47/47 and 24/24, dead 0, duplicated 0.
  Yellow only: featured-story date line authored as ONE `<p>` "June 12, 2024 • 4 min read" (source:
  three spans) — a deliberate rewrite, visually identical. qa-gate: 28 ok on index, 22 ok on
  case-studies; the single ✗ is `footer renders non-empty h=0` on the chrome-less static harness
  server (aem up cannot serve stardust/.work — `.hlxignore`), footer is live on the origin (h=207).
- davids-model-lint 🟡 D1 (hero, cta-band single-column prose) and D3 (article-cards, faq-accordion
  head row 1 cell vs item rows 2 cells): justified — bespoke compositions with block behaviour
  (media grid, overlay, card-as-link, accordion); container shape (own head row + one row per child).
- Lint: `npm run lint` 0 errors (1 pre-existing warning in stardust/scripts/deploy/sanitise.js).
- Published-origin gates (`--main main`, marker WKND / "Fashion Blog" for case-studies whose served
  HTML has no WKND): index 1440 pub1 0.75 % Δh −1; index 360 pub1 13.64 % Δh +68 → tab menu 2-up
  (block rule out-cascaded the foundation `mobile-portrait-1-column`) → fixed ≤479px → pub2 1.39 %
  Δh −1; case-studies 1440 pub1 0.61 % Δh −1, 360 pub1 3.69 % Δh −1. Overflow 1440 = 0; 360 build
  423 = live 423 (+63, recorded residual R-01, live-mirrored nav). crop-compare 1440: header 0.00 %,
  footer 2.84 % (frozen footer → foundation-requests.md). Computed-style guard (probes/guard.mjs):
  all grid/flex compute, 8 sections (metadata section h0 hidden), 0 pageerror, 0 zero-width images.
- Residuals: (R-LC1) content-diff 4× MISSING ICON — tab-menu avatars render 48×48 on both sides but
  the pipeline rendition (`media_<hash>.avif?width=…`, natural 750/800) is not classified as an icon;
  (R-LC2) 5× MISSING ARIA-LABEL [footer] + chrome-parity footer deltas — frozen footer, requested;
  chrome-parity header deltas pair the LIVE hero `<header class="section">` with our `<header>`
  chrome (probe selector artifact; header crop 0.00 %); visual-diff SURFACE/GROUND pairs the hero h1
  with the cta-band h2 by identical text (cta h2 computes white, guard-verified), STRETCHED IMAGE
  flags are the prototype's forced aspect crops (object-fit: cover, 1:1 / 4:3 / 3:2 / 16:10);
  (R-LC3) case-studies hero CTA `#cases` has no in-page target (source section id, not authorable);
  (R-LC4) 360 case-studies capture warned FONT LOAD FAILED for the metric-matched fallback faces
  (capture environment, F-B2 class) — pixel passed regardless.

## Listing-static cluster — blog + fashion-insights + faq live and gated, contact-details block (2026-09-28)
- Pages: `/blog` (content/blog.html, listing archetype), `/fashion-insights` (listing sibling, `section-extra`),
  `/faq` (content/faq.html, static archetype). DA body fragments, metadata block first (Title/Description
  verbatim from the migrated `<head>`), section grounds via `section-metadata` Style = secondary / accent.
  Images `https://content.da.live/aemcoder/e45f2fd7/media/wknd/<file>` (media-reconcile 8 + 11 + 1 hosted,
  0 re-uploads). Delivered `.plain.html`: 200, one h1, 0 about:error, 0 /img/, img+alt 8/8, 12/12, 1/1.
  Publish in the loop (ledger stardust/deploy/ledger-listing-static.json, 3 ok / 0 failed).
  ai-readability strict 100 / code 100 on all three.
- Schemas regenerated from the migrated pages on :8795 (`stardust/eds-schema/blog.json` 4 sections,
  `fashion-insights.json` 5, `faq.json` 4; round-trip maps `hero=main > header.section`,
  `<block>=[data-section="N"]`).
- New block `contact-details` (faq only) — decode tier: template-slotted head (h2 + lede, MOVED by role)
  + reconstructive items (segmented on each `<h3>/<h4>` label; value `<p>` — `mailto:`/`tel:` links stay
  plain anchors, no emphasis wrap). Authoring: row 1 one cell (h2, lede p); rows 2..N one cell each
  (h3 label, p value). Canon inline geometry folded into the block CSS (grid-gap-xxl align start,
  h6-heading label = text-sm / .05em / gray-500, value paragraph-lg). `@ew-exempt`: none.
- Shared blocks reused as delivered: hero (default 1 image on listing; `media-4x3` on faq),
  featured-story (tag + date eyebrow on blog; tag only on fashion-insights), article-cards (6 and 4 cards —
  content only), snapshot-gallery, faq-accordion (`no-head` auto), cta-band (centred, Style accent).
  Additive shared-block edits (committed + pushed immediately):
  - `snapshot-gallery.js`: variant `three-column` → `desktop-3-column` grid class (fashion-insights: live
    grid is 3-up with 6 tiles vs index 4-up/8); foundation utility, 0 new CSS.
  - `hero.css`: appended `.hero.media-4x3 .hero-media { grid-template-columns: 1fr }` — measure.mjs: live
    faq image 544×408, build 268×201 (the 2-column media grid squeezed the single image; hero −42 px).
  - `faq-accordion.css`: `.no-head .faq-list` max-width 48rem → 45rem (live: 48rem container minus 24 px
    inline padding = 720 px list; measure.mjs Δw +48 / Δx −24).
  - `contact-details.css`: value gap `var(--space-xs)` — live-now h3 bottom 1614 → link 1622 = 8 px
    (crawl-time inline style said .75rem; live-now wins per the published-origin rule), section +12 → 0.
- Round-trip (block-roundtrip --ew, profile generic): contact-details editable 8/8; blog 4/4 blocks
  32/32, fashion-insights 5/5 27/27, faq 4/4 22/22; dead 0, duplicated 0, 0 structural 🔴.
  qa-gate: 19 / 22 / 20 ok, single ✗ = `footer renders non-empty h=0` (chrome-less harness, known).
  davids-model-lint 🟡 D1 (hero, cta-band) + D3 (article-cards head row) — same justification as
  landing-core (bespoke compositions with block behaviour). delivery-lint 0 P0/P1 (P2 hero external img
  = content.da.live, resolved by media-reconcile).
- Lint: `npm run lint` 0 errors in listing-static files (pre-existing warning stardust/scripts/deploy/
  sanitise.js; 1 `prefer-template` error in blocks/image-columns/image-columns.js — another cluster's
  in-progress file, not touched).
- Published-origin gates (`--main main`; marker WKND for blog/fashion-insights, "Fashion Blog" for faq whose
  served HTML has no WKND): blog 1440 pub1 1.78 % Δh −1, 360 pub1 2.74 % Δh 0; fashion-insights 1440 pub1
  1.29 % Δh −1, 360 pub1 3.42 % Δh −1; faq 1440 pub1 9.64 % Δh +29 (hot band 0–500 = hero image half-column)
  → pub2 1.29 % Δh 0; faq 360 pub1 5.09 % Δh −13 (contact +12) → pub2 1.91 % Δh −1. Overflow 1440 = 0 on all;
  360 build 423 = live 423 (+63, R-01 live-mirrored nav). crop-compare 1440: blog header 0.00 % / footer
  1.80 %; faq header 0.00 % / footer 2.19 % (frozen footer → foundation-requests.md). Computed-style guard
  (probes/guard.mjs): blog 5 sections (metadata h0 hidden), hero/featured/article grids compute, 8 imgs 0
  zero-width, 0 pageerror; faq contact label 14px #666 ls .7px, value 18px, faq-question flex, 0 pageerror.
- Residuals: (R-LS1) content-diff 5× MISSING ARIA-LABEL [footer] on every page + chrome-parity footer
  link tag deltas — frozen footer, already requested; header chrome-parity deltas pair the LIVE hero
  `<header class="section">` with our `<header>` chrome (probe artifact; header crop 0.00 %).
  (R-LS2) visual-diff STRETCHED IMAGE flags (blog 7, fashion-insights, faq 1) = the prototype's forced
  aspect crops (object-fit cover 3/2, 16/10, 1/1, 4/3). (R-LS3) hero CTA `#articles` (blog,
  fashion-insights) has no in-page target — the live section id is not authorable (same class as R-LC3).
  (R-LS4) faq footer band 2.19 % vs 2 % bar — frozen footer. (R-LS5) captures warned FONT LOAD FAILED for
  the metric-matched fallback faces (capture environment, F-B2 class) — pixel passed regardless.

## Article cluster — blog-content block, 7 /blog/* articles live and gated (2026-09-28)
- Pages: `/blog/ace-pro-court-polo` (archetype, `--full` gates) + 6 siblings (`content/blog/<name>.html`),
  DA body fragments generated from the migrated files by a regex converter (verbatim copy; 0 rewording):
  metadata block first (Title/Description from the migrated `<head>`), `hero (article)` section,
  `blog-content` section. Images `https://content.da.live/aemcoder/e45f2fd7/media/wknd/<file>` (all 10
  already in the media ledger; media-reconcile hosted 3/1/1/1/2/1/1). Delivered `.plain.html`: 7× 200,
  one h1, 0 about:error, 0 /img/, img+alt 3/1/1/1/3/1/1. Publish in the loop (ledger
  stardust/deploy/ledger-article.json, 7 ok / 0 failed). ai-readability strict 100 / code 100 on all 7.
  Link hygiene: body prose carries no anchors; breadcrumbs `/` and `/fashion-insights` (root-relative),
  localize-links --check PASS.
- `blog-content` — decode tier reconstructive (prose stream consumed row by row): one-cell rows are
  runs of rich text (h2/h3, p, ul, blockquote, p > img) MOVED with their tags; a run of ≥2-cell rows
  becomes ONE `<table>` (first row `<thead><th>`, rest `<tbody><td>`, cell nodes MOVED). A raw
  `<table>` in DA content is itself read as a block, hence table-as-rows (ace only; 5 rows × 2 cells).
  Variants: none (budget 0). CSS = prototype `blog-ace-pro-court-polo.css` lifted 1:1 + the live inline
  geometry as block-scoped section rules (`.blog-content-container { padding-top: 0 }`,
  `.blog-content-wrapper { max-width: 48rem }`) + `:is(th, td) p { margin: 0; line-height: inherit }`:
  the runtime wraps bare-text cells in `<p>` before decorate() (measure.mjs: `td p` 0 live / 10 build,
  +21.6px per cell, table 167.6 → 297.1px) — the ONE anchors-driven reconcile round at the origin.
- `hero (article)` reused untouched (landing-core JSDoc shape: image row; `<ul>` crumbs, h1, "By
  <strong>Author</strong>", "Date • N min read", tag `<p>`). Round-trip yellow only: date line authored as
  ONE `<p>` (source: three flex divs) — same deliberate, visually identical rewrite as featured-story.
- EW exemptions: none. block-roundtrip --ew (ace, `--map "hero=main > section:first-of-type"`):
  blog-content editable 38/38, hero 5/5, dead 0, duplicated 0, 0 structural 🔴 per block and whole page.
  qa-gate: 14 ok; ✗ footer h=0 (chrome-less harness, known) and ✗ "hero renders ≥19" — both prototype
  sections are named `section`, so the gate pairs section 2's 19 paragraphs with the hero too (schema
  naming artefact; blog-content rendered 29 kids, hero 2/2). davids-model-lint 🟡 D1 hero (bespoke media
  grid, shared) and 🟡 D3 blog-content on ace (rows 1 vs 2 cells: the table rows — justified above).
- Lint: `npm run lint` 0 errors (1 pre-existing warning stardust/scripts/deploy/sanitise.js); only
  `blocks/blog-content` was --fix'ed.
- Published-origin gates (`--main main --marker "Fashion Blog"` — served article HTML has no "WKND"):
  ace 1440 pub1 7.98 % Δh −131 (table) → pub2 1.47 % Δh −1; ace 360 pub1 11.88 % Δh −136 → pub2 2.76 %
  Δh 0. Siblings (pixel rounds, pub1): fashion-blog-post 0.99/1.57; fashion-trends-young-culture
  1.05/1.74; fashion-trends-young-style 0.99/1.79; flip-flop-summer-style 1.12/2.30;
  latest-trends-young-casual-fashion 0.89/1.48; street-style-trends 0.83/1.50 (1440/360 %, |Δh| ≤ 1).
  Overflow 1440 = 0 on all; 360 build 423 = live 423 (R-01, live-mirrored nav) on all. crop-compare
  ace 1440: header 0.00 %, footer 1.80 % (≤ 2 %). Computed-style guard (probes/guard.mjs, 1440): hero
  grid/flex compute, blog-content block, table/blockquote compute, wrapper 768px, section padding-top
  0, li disc, 6 table rows / 2 th, 3 images 0 zero-width, 1 h1, 0 pageerror.
- Residuals: (R-A1) content-diff 5× MISSING ARIA-LABEL [footer] = frozen footer (recorded);
  chrome-parity 22 deltas = footer link tag/padding pairs (frozen, recorded); (R-A2) visual-diff
  STRETCHED IMAGE on the hero lead = prototype's forced 3/2 crop (object-fit: cover); (R-A3) MISSING
  ICON — breadcrumb chevron is a CSS `::before` data-URI on the build (12×12, pixel-identical) vs an
  inline `<svg>` on live; (R-A4) heading `id`s are pipeline-generated (match the source slugs).
  Foundation requests appended: 0 (footer band 1.80 % is inside the bar; the 2.84 % index footer
  request already queued by landing-core stands).

## Landing-rest cluster — image-columns + trend-cards, 3 landing siblings live and gated (2026-09-28)
- Pages: `/fashion-trends-of-the-season`, `/fashion-trends-young-adults`,
  `/fashion-trends-young-adults-casual-sport` (content/<slug>.html, DA body fragments, metadata Title /
  Description verbatim from the migrated `<head>`, section grounds `Style: secondary | accent`). Images
  `https://content.da.live/aemcoder/e45f2fd7/media/wknd/<file>` (media-reconcile 13 / 11 / 11 hosted, 0
  missing). Delivered `.plain.html`: 200, one h1, 0 about:error, 0 /img/, 13/13, 14/14, 11/11 img+alt.
  Publish in the loop (ledger stardust/deploy/ledger-landing-rest.json, 3 ok / 0 failed).
  ai-readability strict 100 / code 100 on all three.
- New blocks (JSDoc = authoring contract):
  - `image-columns` reconstructive (optional head row: h2 [+ lede p]; one row per column, TWO cells:
    image | h2/h3 + body p — an image-led single cell is folded into one `<p>` by wrapTextNodes and its
    texts die; caught by block-roundtrip DROPPED CONTENT on the first run). Content-driven, no variant:
    head → `grid-gap-lg`, no head → `grid-gap-xxl`; column title sized by authored tag (h3 = 2xl,
    h2 = 3xl). Mirrors the live cyclic-percentage quirk (image `height: 100%` + `aspect-ratio: 3/2`
    stretches to the grid row, text flows below the row box) through `display: contents` wrappers.
    Head-only instance = the young-adults centred section intro (no foundation section style exists;
    foundation-requests.md). Head margin-bottom 64px unconditional (live measure: intro Δh −64 → 0).
  - `trend-cards` reconstructive (head row + one row per card, two cells: image 4/3 | tag p,
    `<h3><a>`, body p; card-as-link EW6; also the flattened single cell segmented on h3/h4).
    Rhythm from live measure: tag mb 12, title text-lg mb 8, body m 0, body padding 24, grid-gap-md.
- Shared-block edits (additive, pushed immediately): `featured-story` optional leading head row
  (`splitHead`: first row without image + heading, second row with image → `.featured-head` centred,
  mb 64); `snapshot-gallery` content-driven column count (tiles % 4 ≠ 0 && % 3 = 0 → 3-up; live 6
  tiles = 3 columns); `text-align: center` added to `.snapshot-head`, `.article-cards-head`,
  `.cta-center` — `utility-text-align-center` is defined in no delivered stylesheet (live vs build
  measure: textAlign center → start on `/`).
- EW exemptions: none. block-roundtrip --ew (profile generic, maps `hero=main > header.section`,
  `<block>=[data-section=N]`): season 5/5 blocks closed, editable 21/21; young-adults 6/6, 30/30;
  casual-sport 4/4, 35/35; dead 0, duplicated 0. qa-gate: 22 / 24 / 19 ok, single ✗ = footer h=0 on
  the chrome-less harness (known). davids-model-lint 🟡 D1 (hero, cta-band, image-columns prose
  cells) / D3 (featured-story, article-cards, trend-cards head row 1 cell vs item rows 2 cells):
  justified — bespoke compositions, container shape (head row + one row per child).
- Lint: `npm run lint` 0 errors (1 pre-existing warning stardust/scripts/deploy/sanitise.js).
- Published-origin gates (`--main main --marker "Fashion Blog"`, served HTML has no WKND):
  season 1440 pub1 --full 1.67 % Δh 0; season 360 pub1 --full 1.48 % Δh 0; young-adults 1440 pub1
  13.32 % Δh −63 (intro head margin) → pub2 0.91 % Δh −1; 360 pub1 26.55 % Δh −64 → pub2 1.59 % Δh 0;
  casual-sport 1440 pub1 1.40 % Δh 0; 360 pub1 1.44 % Δh 0. Overflow 1440 = 0 on all; 360 build 423 =
  live 423 (R-01 live-mirrored nav). crop-compare season 1440: header 0.00 %, footer 2.96 % (frozen
  footer, requested by landing-core). Computed-style guard (probes/guard.mjs, season 1440): hero /
  featured / image-columns / snapshot grids compute grid, cta-center block, 13 images 0 zero-width,
  6 sections (metadata h0 hidden), 0 pageerror, CTA band bg rgb(244,254,139).
- Residuals: (R-LR1) content-diff 5× MISSING ARIA-LABEL [footer] + chrome-parity footer 21 / header
  16 deltas — frozen footer / probe pairing artefact (landing-core R-LC2); (R-LR2) visual-diff 7×
  STRETCHED IMAGE — the source's forced aspect crops incl. the image-columns row-stretch quirk
  mirrored on purpose; (R-LR3) hero CTA `#trends` has no in-page target (source section id, not
  authorable — same class as R-LC3); (R-LR4) FONT LOAD FAILED warnings on the metric fallback faces
  in the captures (F-B2 capture environment) — pixel passed regardless.
