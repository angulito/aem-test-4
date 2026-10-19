# Rollout report — WKND Trendsetters → AEM Edge Delivery (replica flow)

Generated 2026-09-28T14:30Z from `stardust/rollout/rollout.json#lastRun` (2026-09-28T14:21:39Z),
`stardust/rollout/optimize/scorecard.json` (run-1) and `stardust/dynamics/parity.json`.

```
rollout — https://www.wknd-trendsetters.site/ → aem-eds (main--e45f2fd7--aemcoder.aem.live)
==================================================
Pages       15 total · 15 verified · 0 deployed · 0 pending · 0 content-pending · 0 stale · 0 failed
Templates   4 (index/landing 5/5 · blog-ace-pro-court-polo/article 7/7 · blog/listing 2/2 · faq/static 1/1)
Blocks      11 total · 11 converted · 0 pending
Quality     health 100/100 · open P1 0 / P2 0 / P3 0 · source-parity informational 16 (P2 15 jsonld, P3 1 duplicate-description)
To deliver  none
Content     0 pages awaiting content track
```

## Scope

16 URLs selected in `stardust/.labs/site-plan.json`; 15 are pages and are delivered 1:1 at their source
paths. The 16th, `/cdn-cgi/l/email-protection`, is a Cloudflare artifact that answers HTTP 404 on the
source itself and was excluded at Phase 1 (`state.json#site.failed`). No redirects are needed (paths preserved).

## Templates and blocks

| Template | Archetype | Pages | Blocks converted from it |
|---|---|---|---|
| Landing | `index` | 5 | hero, featured-story, article-cards, snapshot-gallery, testimonial-tabs, cta-band, image-columns, trend-cards |
| Blog listing | `blog` | 2 | hero, article-cards, cta-band |
| Article | `blog-ace-pro-court-polo` | 7 | hero, blog-content |
| Static (FAQ) | `faq` | 1 | hero, faq-accordion, contact-details |

11 distinct blocks, 53 instances across 15 pages; block dedup at B-block made every template share
the same block code (`hero` 15 instances, `cta-band` 8, `blog-content` 7, `featured-story` 6,
`snapshot-gallery` 5, `article-cards` 4, `faq-accordion` 2, `image-columns` 2, `testimonial-tabs` 2,
`contact-details` 1, `trend-cards` 1). Foundation (styles, fonts, header/footer, nav + footer documents)
frozen at C0, 17 files, re-frozen after C-final applied 3 of 4 queued foundation requests.

## Fidelity (published-origin gate, `--full`, 1440 / 360)

| Archetype | Pixel 1440 | Δh | Pixel 360 | Δh | Structural 🔴 |
|---|---|---|---|---|---|
| index | 0.40 % | −1 | 1.22 % | −1 | 0 (4 R-LC1 avatar-icon classifications) |
| blog | 1.07 % | −1 | 2.29 % | 0 | 0 |
| blog-ace-pro-court-polo | 1.34 % | −1 | 2.76 % | 0 | 0 |
| faq | 0.75 % | 0 | 1.51 % | −1 | 0 |

Bar: ≤ 10 % pixel, |Δh| ≤ 8 px. Siblings: 11/11 at 0.00 % / Δ0 against their archetype clone in the
migrate pixel bar; content-count identical 15/15. Residual R-01: at 360 the live `.nav-inner` overflows
the viewport (scrollWidth 423 on live and build alike) — mirrored verbatim because the inconsistency
register is empty; flagged for the site owner. Inconsistency register: empty (pure replica).

## Dynamic parity (D2-dynamic, `stardust/dynamics/parity.json`)

| Feature | Class | Reach | Disposition | Replayed check |
|---|---|---|---|---|
| static pages render without script errors | S (baseline) | 15 pages | none (baseline) | `dynamics-check` on aem.live 1/1 PASS, 0 page errors over 15 paths |
| index-driven blog listing | L | 2 pages | decided-out — static listing, cards authored as content; no query-index | self |
| FAQ accordion | I | 1 page | decided-out — `<details>`-style accordion in `faq-accordion` block, no runtime dependency | self |

Detector re-run on the 4 archetypes at B2: 0 findings, 0 host-bound rows. The site does nothing its
static recreation does not also do.

## Quality (F-optimize, run-1)

Health 100/100. Accessibility, SEO, ai-search and cross-page detectors ran over 15 pages: 0 open
findings at any severity. 16 informational source-parity items mirror the source (no JSON-LD on any
page; one meta description shared by 8 landing/listing/FAQ pages) and are kept as captured. G-aem
autofix: 0 candidates.

## Links (E2-link-audit)

17 documents (15 pages + nav + footer): 0 source-host links, 0 non-canonical internal hrefs, 15
root-relative internal targets all HTTP 200 on the live origin, 0 absolute/external. Bare `#` hrefs
(footer social row, "Subscribe" / "See more" / "Join now" CTAs) are placeholders carried verbatim from
the source.

## What's missing

Nothing pending, stale or failed. Open for the site owner: R-01 (mobile nav overflow inherited from the
source) and the 16 source-parity items, should they want the new site to improve on the current one.
