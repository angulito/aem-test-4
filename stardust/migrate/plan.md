# migrate plan — www.wknd-trendsetters.site (replica flow, sibling tier) — 2026-09-28

Fan-out brief for Phase 5 handoff row 1–4. Archetypes were gated in replica Phase 4 (every one
0.00 % / Δ0 at 1440 and 360; residual R-01 only). Siblings inherit that gate and re-check only
content, media and the delivery contract (fidelity-tiers.md § The three tiers).

```
migrate plan
============

In scope: 15 pages
  Path A  (approved)                4 pages: index, blog, blog-ace-pro-court-polo, faq
  Path A' (template-applied)       11 pages: 4 landing, 1 listing, 6 article
  Path B  (unique)                  0 pages

Skipped:  0 stale, 0 unscoped

DESIGN.md sha:    n/a (replica flow — canon is the lifted site CSS, no DESIGN.md)
Canon shas:       canon.css:bfc32be  index:3fcdae3  blog:dd831d9  article:d684b4c  faq:c6fe81d
                  (chrome = header/footer of index-proposed.html, identical on every archetype)

Output:           stardust/migrated/  +  per-page _meta.json sidecars
Idempotent skip:  enabled (run with --force to override)
Hands-off:        confirmation skipped (state.json handsOff: true)
```

## Sibling map (template → archetype → siblings)

| template | archetype (Path A, gated) | siblings (Path A′, fidelityTier sibling) |
|---|---|---|
| landing | index (`/`) | case-studies, fashion-trends-of-the-season, fashion-trends-young-adults, fashion-trends-young-adults-casual-sport |
| listing | blog (`/blog`) | fashion-insights |
| article | blog-ace-pro-court-polo | blog-fashion-blog-post, blog-fashion-trends-young-culture, blog-fashion-trends-young-style, blog-flip-flop-summer-style, blog-latest-trends-young-casual-fashion, blog-street-style-trends |
| static | faq | — (no siblings; Path A only) |

## Sibling-variance probe (once per template, live pages, 1440, tolerance 2 px)

JSON next to this brief: `variance-landing-1440.json`, `variance-listing-1440.json`,
`variance-article-1440.json` (run-bg jobs `variance-<template>-1440`). All three exit 2.
Reading: no probe reported a computed-style delta (background layers/colour, padding, font,
heading font, radius, list-style, `::before` are equal on every sibling); every delta is
section COMPOSITION (which canon sections a page uses) or content length (rect heights,
match counts, image present/absent). The archetype markup is the live markup verbatim
(index-proposed.html `<main>` = captured index.html `<main>`, 133/133 tags), so the siblings'
own live `<main>` already uses the same canon classes — the clone is chrome + verbatim main.

### landing (archetype index — 7 sections: hero · featured · snapshots · tabs · article-cards · faq · inverse CTA)
- case-studies — 5 sections: hero (no image collage) · featured · snapshots · tabs · inverse CTA (h 786 vs 815: shorter copy). Missing on page: article-cards, faq.
- fashion-trends-of-the-season — 5 sections: hero (h 757, longer copy) · section · secondary · section (h 1233) · **accent-section CTA**. Missing: tabs, article-cards, faq, inverse CTA.
- fashion-trends-young-adults — 6 sections: hero (h 757) · section · secondary · section · article-cards (4) · **accent-section CTA**. Missing: tabs, faq, inverse CTA.
- fashion-trends-young-adults-casual-sport — 4 sections: hero (h 605) · **trend-card grid** (h 1262) · secondary · **accent-section CTA**. Missing: tabs, article-cards, faq, inverse CTA.

### listing (archetype blog — 4 sections: hero · section · article-cards(6) · accent CTA)
- fashion-insights — 5 sections: hero · section · article-cards (4, card h 300 vs 359 — content) · **extra section[3] (h 1233, same module as fashion-trends-of-the-season's)** · accent CTA.

### article (archetype blog-ace-pro-court-polo — hero · blog-content)
- all six: same 2 sections; `.blog-content` height 985–3228 vs 3233 (copy length); five have 1 image in main vs the archetype's 3 (content, not style). flip-flop-summer-style is near-identical (Δ5 px).

## Variant budget per template (block VARIANT classes on the sibling's content — never a per-page block fork, never new CSS)

| template | style variants | composition variants (recorded in `_meta.json` `variants[]`) | new CSS rules |
|---|---|---|---|
| landing | 0 | `cta-accent` (accent-section band instead of inverse-section: 3 pages — canon.css already styles `.accent-section`, used by the blog archetype); `trend-card` grid (casual-sport; `.trend-card*` are structural classes with NO rule in site.css — nothing to add); section subset per page (declared as `modules[]`) | 0 |
| listing | 0 | `section-extra` (fashion-insights carries one section the archetype lacks — same canon module as landing's section[3]); card count/height are content | 0 |
| article | 0 | none — copy length + image count are content | 0 |
| static | — | — | — |

Budget total: 3 composition variants, 0 style variants, 0 CSS. Every sibling ships canon.css +
its archetype's per-page css untouched. The 360 pixel bar (contract row 5) is the check that
this 1440-only probe cannot give; it runs per sibling after render, before C-deliver.

## Units (stardust/migrate/progress.json)

1. `plan` — this file. 2. `render-landing` — index (Path A, cluster smoke test) + 4 landing
siblings. 3. `render-listing` — blog + fashion-insights. 4. `render-article` — archetype + 6.
5. `render-static` — faq (Path A). 6. `assets` — not needed unless media is rehosted (driver
bundles same-origin assets at render). 7. `report` — state.mjs advance … --to migrated + summary.

## Clone recipe (render units, Path A′)

Sibling source = `stardust/migrate/siblings/<slug>.html`: index-proposed.html's `<head>`
(title + description swapped for the sibling's captured values), chrome (skip link, navbar,
footer, the two body-level module scripts) verbatim; `<main>` = the sibling's captured live
main verbatim with only `src="/images/…"` → `assets/images/…` and the live inline tabs
`<script>` inside main removed (the archetype's body-level tabs module drives every
`.tabs-wrapper`; logged as a contentDeviation exactly as the archetype's gate justified it).
Driver: `migrate.mjs render <slugs> --archetype <slug>=<archetype> --source <slug>=<file>
--canon-css stardust/prototypes/css/canon.css`. Content-count acceptance per page against
`stardust/current/pages/<slug>.json` (headings, body/list nodes, CTAs + hrefs, images).
