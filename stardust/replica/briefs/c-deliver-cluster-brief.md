# C-deliver cluster brief — shared contract (read once, then your cluster prompt)

Replica migration of https://www.wknd-trendsetters.site/ to AEM Edge Delivery Services
(vanilla aem-boilerplate). Project root /workspace/e45f2fd7, git branch main, remote
github aemcoder/e45f2fd7. Preview origin: https://main--e45f2fd7--aemcoder.aem.page .
DA org `aemcoder`, site `e45f2fd7`, ref `main`. Media scope `wknd`.
You convert the pages of ONE template cluster, deploy them, and gate them on the
published origin. You never touch another cluster's pages or blocks, and never a frozen
foundation file.

## Hard rules
- Never read, print or copy a token. The DA token is a FILE whose path is in the env var
  `ADOBE_IMS_TOKEN_FILE`; pass it to drivers ONLY as `--token-file "$ADOBE_IMS_TOKEN_FILE"`.
  Never read `.env`. Never write a credential under the repo.
- FROZEN (never edit; `node stardust/scripts/replica/foundation-freeze.mjs check` must stay
  exit 0): `styles/`, `fonts/`, `head.html`, `scripts/`, `blocks/header/`, `blocks/footer/`,
  `content/nav.html`, `content/footer.html`. A foundation finding is ONE appended line in
  `stardust/rollout/foundation-requests.md`:
  `- <unit> | <what> | <evidence: instrument + numbers> | <templates affected>` — and your
  block ships with a scoped override inside its OWN block CSS; you do not wait.
- Never edit `scripts/aem.js`. Never install browsers. Never `npm install`.
- At most ONE headless browser at a time in your agent (three clusters share a 4-CPU box).
  Long commands (gate rounds, Playwright captures, deploy batches) run through
  `node stardust/scripts/replica/run-bg.mjs start --name <cluster>-<what> -- <cmd…>` and
  `node stardust/scripts/replica/run-bg.mjs wait` as the NEXT tool call (returns ≤ ~100 s;
  exit 75 = still running → `wait` again as the next call; never `sleep`, never a shell
  loop). Read job output with `run-bg.mjs log <job> --grep <re>`. Tool calls < 4 minutes.
- Reading discipline: docs by section (`node stardust/scripts/replica/section.mjs <doc>
  --list`, then one heading); HTML through `node stardust/scripts/replica/html-slice.mjs
  <file> <selector> [--max-chars n] [--all]`; JSON through
  `node stardust/scripts/replica/json-query.mjs <file> [--path p] [--fields a,b] [--tsv]`;
  CSS through `sed -n a,bp` on ranges found with `grep -n`. Never cat a whole doc.
  Images: one crop per fact, never a whole stitched page.
- This is a REPLICA. Every value (spacing, size, colour, radius, shadow, font) is lifted
  from `stardust/prototypes/css/canon.css` + the archetype's per-page CSS in
  `stardust/prototypes/css/<archetype>.css`; text, hrefs, alt text are verbatim from the
  migrated page. No rewording, no fabrication, no "improvements".
- Lint (project config, blocking): ESLint airbnb-base + Stylelint standard; lines ≤ 100
  chars; kebab-case classes and custom properties; one statement per line; block JS
  `export default async function decorate(block)`; ESM imports only from `/scripts/`
  (`../fragment/fragment.js` is the only cross-block import). Lint ONLY your own files:
  `npx eslint blocks/<name>` and `npx stylelint "blocks/<name>/*.css"`; never `--fix` a
  file you do not own, never run `npm run lint:fix` (it touches every file).
- Every `var(--x)` your CSS uses must exist in `styles/styles.css` `:root` (grep it). A
  missing token is a request line + a local fallback value in your CSS, never a
  foundation edit.

## Inputs per page
- Content source (verbatim): `stardust/migrated/<path>/index.html` (root page:
  `stardust/migrated/index.html`) — semantic canon DOM with `<header class="section …">`
  (the hero) and `<section class="section [secondary-section|inverse-section|accent-section]">`
  per module; images `./assets/images/<file>.avif`. Sidecar `_meta.json` beside it:
  `modules[]` (blocks in order), `variants[]` (composition variants), `metadata`
  (title, description).
- Coverage row + plan step: `stardust/rollout/coverage/pages.json` (path, templateId,
  blocks) and `stardust/rollout/plan.json` (per page `convert` / `reuse`).
- Prototype (the DOM + CSS to rebuild): `http://localhost:8791/<archetype>-proposed.html`
  (server running; never start another), file `stardust/prototypes/<archetype>-proposed.html`.
- Section schema (ENCODE/DECODE contract): `stardust/eds-schema/<archetype>.json` (roles
  per section + repeat units). Cite the path in each block's JSDoc.
- Media ledger: `stardust/deploy/media-ledger.json` — local file → the
  `https://content.da.live/aemcoder/e45f2fd7/media/wknd/<file>` URL to author. Look a file
  up by basename with json-query; never guess a URL, never author `/img/` or `./assets`.
- Runtime contract: `stardust/runtime-contract.json`. Foundation decisions (section style
  values, button mapping, nav height): `stardust/eds-conversion-log.md` (read the
  foundation section only).
- Live URL for gating: the coverage row's path on https://www.wknd-trendsetters.site .
- Reference (by section only): `/home/node/adobe-skills/plugins/stardust/skills/deploy/SKILL.md`
  — "2b. Section schema", "8. Block JS scaffold" (+ its "Experience Workspace editability
  contract"), "9. Content page scaffold", "Local QA before deploy";
  `/home/node/adobe-skills/plugins/stardust/skills/replica/reference/source-fidelity-gate.md`
  — "Band breakdown", "The published-origin gate".

## ENCODE — the content page (`content/<path>.html`)
DA body fragment: starts at `<body>`, no doctype/html/head; `<header></header>` and
`<footer></footer>` empty; each top-level `<div>` inside `<main>` is ONE section holding
ONE block table or default content. First section: the `metadata` block
(`Title` = the page's `<title>`/h1-derived title, `Description` = sidecar description).
One block per migrated section, block name = the sidecar `modules[]` entry (kebab-case,
`<div class="<name>">` rows/cells). Repeat groups: one row per unit, cells in schema order.
Fixed compositions: one row per role. CTAs authored paragraph-wrapped as `<strong><a>`
(primary = canon `.button`) or `<em><a>` (secondary = canon `.secondary-button`), one CTA
per `<p>`. Images: `<img src="https://content.da.live/…/media/wknd/<file>.avif" alt="…">`
(the pipeline emits `<picture>`). Section ground/padding variants (`secondary-section`,
`inverse-section`, `accent-section` on the migrated section) are authored as ONE
section-metadata style value using the foundation's names (read the conversion log's
foundation section for the exact values, e.g. `secondary`, `inverse`, `accent`):
`<div class="section-metadata"><div><div>style</div><div>secondary</div></div></div>` as the
last child of that section div. Variant classes (sidecar `variants[]`, e.g. `trend-card`,
`cta-accent`, `section-extra`) become block variant classes: `<div class="cta-band accent">`.
Root page: `content/index.html` (served at `/`). Nested: `content/blog/<slug>.html`.
Internal hrefs root-relative and extensionless (`/blog/ace-pro-court-polo`); external
fully-qualified; `#` stays `#`.

## DECODE — the block (`blocks/<name>/<name>.js` + `.css`)
- Decode tier: template-slotted for fixed compositions (hero, featured-story, cta-band,
  contact-details, blog-content header), reconstructive for repeat groups (article-cards,
  snapshot-gallery, testimonial-tabs, faq-accordion, trend-cards, image-columns). Record
  the tier per block in your cluster log.
- `decorate()` rebuilds the prototype section's inner DOM (classes from canon, so the
  lifted CSS matches) as EMPTY slot containers and MOVES the authored nodes into them by
  role. EW1–EW10: move `h1–h6/p/ul/ol/picture/img` with `append()`/`prepend()`; never
  rebuild from `textContent`/`innerHTML`, never `cloneNode`+discard, never retag, never
  `.trim()` displayed text; wrappers carry the layout classes, style authored elements
  via descendant selectors (`.headline :is(h2, h3)`), never a class on the authored
  element, never `>`/`:first-child`/`:nth-child` on the path to it; CTAs move as their
  `<p>` (`decorateButtons()` already classed the anchor `button primary|secondary` —
  never manufacture button anchors); card-as-link: read `href`, unwrap the inner anchor,
  wrap the card in one `<a>`; presentational clones get `stripInstrumentation()`; EW7: no
  `<button>`/`<summary>` hosts authored text — an accordion question stays its authored
  element, MOVED into a `<div class="faq-question" role="button" tabindex="0"
  aria-expanded="false">` wrapper whose click/keydown toggles the answer wrapper in JS (the
  source's `<details>` is matched visually and behaviourally, not by tag); tab labels the
  same way; `decorate()` re-entrant; no `<header>` element in block DOM (use a div).
- The hero's first `<img>`: `loading="eager"` + `fetchpriority="high"`; reserve its media
  box (aspect-ratio / min-height from the prototype) so nothing shifts.
- Interactive behaviour (tabs, accordion open/close) ONLY as observed in
  `stardust/replica/motion/<archetype>.json`; render the default state in markup.
- CSS: the canon rules for that section's classes, scoped under `.<name>` (`.<name> .x`),
  plus the section-level padding/ground when the block always owns it. Mobile rules at the
  same specificity as the desktop variant. Inline SVG icons per block (copy the prototype's
  SVG markup, no shared utility). `prefers-reduced-motion` honoured.

## Per-page chain (in this order; a failure stops the page, not the cluster)
1. Author blocks (only those in your plan `convert` list) and the content file.
2. `node stardust/scripts/deploy/davids-model-lint.mjs content/<path>.html` → exit 0.
3. Per converted block: `node stardust/scripts/deploy/block-roundtrip.mjs
   "http://localhost:8791/<archetype>-proposed.html" content/<path>.html --blocks <name>
   --ew --profile generic` → exit 0 (0 structural 🔴, 0 DEAD TEXT / DROPPED / DUPLICATED).
   Then one whole-page run without `--blocks`.
4. Harness (structural only, never a pixel verdict): `node stardust/scripts/deploy/
   build-harness.mjs content/<path>.html stardust/.work/harness/<slug>.html` then
   `node stardust/scripts/deploy/qa-gate.mjs http://localhost:3000/stardust/.work/harness/<slug>.html
   --schema stardust/eds-schema/<archetype>.json --full-bleed hero,cta-band` → exit 0
   (dev server on :3000 is running; never start one).
5. `node stardust/scripts/rollout/delivery-lint.mjs --file content/<path>.html --path /<path>`
   (no P0/P1); `node stardust/scripts/rollout/media-reconcile.mjs --file content/<path>.html
   --deploy-host main--e45f2fd7--aemcoder.aem.page --media-ledger stardust/deploy/media-ledger.json`
   → exit 0; `node stardust/scripts/deploy/localize-links.mjs --source-host
   www.wknd-trendsetters.site --content content` then `--check`;
   `node stardust/scripts/deploy/sanitise.js content/<path>.html` (one file per call).
6. Lint your files (`npx eslint blocks/<name>`; `npx stylelint "blocks/<name>/*.css"`).
7. Commit + push YOUR files only, then confirm the code is served:
   `git add blocks/<names> content/<your files> stardust/deploy/<your files>
   stardust/eds-schema/ && git commit -qm "replica phase 5 C-deliver <cluster>: <what>"
   && git pull --rebase -q origin main && git push -q origin main` (on `index.lock`, wait
   2 s and retry once; never delete another process's lock). Then poll
   `curl -sf https://main--e45f2fd7--aemcoder.aem.page/blocks/<name>/<name>.js | head -c 80`
   ≤ 5 s apart, at most 3 minutes (if it still 404s: `curl -s -X POST
   https://admin.hlx.page/code/aemcoder/e45f2fd7/main/*` → 202, then poll again).
8. Deploy (background): write `stardust/deploy/paths-<cluster>.txt` (one web path per line,
   no extension: `/`, `/blog/ace-pro-court-polo`… — check `deploy-batch.mjs --help` for the
   root form) then `node stardust/scripts/deploy/deploy-batch.mjs --org aemcoder --repo
   e45f2fd7 --branch main --content content --paths stardust/deploy/paths-<cluster>.txt
   --concurrency 2 --ledger stardust/deploy/ledger-<cluster>.json --log
   stardust/deploy/ledger-<cluster>.log --token-file "$ADOBE_IMS_TOKEN_FILE"` via run-bg;
   `wait`. Exit 3 = token halt: stop, report the halt line verbatim, do not retry twice.
   Then `curl -s https://main--e45f2fd7--aemcoder.aem.page/<path>.plain.html`: 200, one
   `<h1>`, 0 `about:error`, no `/img/`, expected `<img>` count.
9. Record: `node stardust/scripts/rollout/update-coverage.mjs <slug> --status deployed --url
   https://main--e45f2fd7--aemcoder.aem.page/<path>` and, once per converted block,
   `node stardust/scripts/rollout/update-coverage.mjs --block <id> --status converted
   --eds-name <name>` (lock-safe; never hand-edit coverage files).
10. PUBLISHED-ORIGIN GATE (the only number that counts), representative page first, then
    every sibling. One round = one background job:
    `node stardust/scripts/replica/run-bg.mjs start --name <slug>-1440-pub1 --
    stardust/scripts/replica/gate.sh <slug> "https://www.wknd-trendsetters.site/<path>"
    "https://main--e45f2fd7--aemcoder.aem.page/<path>" 1440 pub1 --full --main main
    --marker "<a string unique to that page's served HTML, e.g. its h1 text>"` and the same
    at 360 (start both, then `wait`). Pass bar per width: pixel ≤ 10 % with no unexplained
    500 px band, |height Δ| ≤ 8 px, 0 structural 🔴 (content-diff), chrome deltas 0,
    build scrollWidth within 4 px of the viewport at 1440. At 360 the LIVE site itself
    overflows (+63 px, residual R-01, live-mirrored): an overflow at 360 that matches the
    live value is recorded, not fixed (`stardust/replica/progress.json` → `landing.gates.360`
    for the waiver text). Exit 124 = a probe hit its deadline → re-run, not a verdict.
    Iterate: `anchor.mjs` / band breakdown (gate doc "Band breakdown"), fix the FIRST hot
    band top-down, fixes come off the instruments never off eyeballing; pixel rounds
    `pub2`, `pub3`; confirmation round `--full`. HARD CAP 3 rounds per width; after 3, log
    the residual with numbers and move on. A block CSS/JS fix rides a commit+push (step 7);
    a content fix re-PUTs that one page (`deploy-batch.mjs … --force` with a one-line
    paths file). The gate dir `stardust/replica/gates/<slug>-<width>/` already holds the
    live capture from the recreate phase — reuse it (same dir, `pub<N>` label).
11. Chrome bands once per template, on the representative page's published URL:
    `node stardust/scripts/replica/chrome-parity.mjs "<live>" "<preview>" --width 1440
    --live-cache stardust/replica/gates/<slug>-1440/chrome-live.json` (exit 0 = quiet) and
    header/footer `crop-compare.mjs` bands ≤ 2 % (`--help` for flags; crop the header
    band at y 0 and the footer band from the bottom of live.png / build.png in the gate dir).
    A chrome delta is a foundation-requests line (rule above), never a fix by you.
12. Update `stardust/rollout/progress.json`? NO — the main agent owns it. Write your own
    cluster log at `stardust/deploy/conversion-log-<cluster>.md` (tiers, decisions,
    residuals, requests) and append nothing to shared markdown except
    `foundation-requests.md`.

## Report (final message, ≤ 30 lines)
Line 1, verbatim shape:
`<cluster>: pages n/n live, blocks k, gate 1440 <slug>=x% Δh … / 360 <slug>=y% Δh …, chrome <quiet|n deltas>, crop header a% footer b%, requests r`
Then: per page one line (`<slug> deployed <url> | 1440 x%/Δn | 360 y%/Δn | rounds a+b |
residual …`); blocks written; files committed (paths only, last commit sha); anything not
verified or deliberately dropped; the foundation-requests lines you appended. No token,
no file contents, no screenshots.
