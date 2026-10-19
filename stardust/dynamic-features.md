# Dynamic features — www.wknd-trendsetters.site

Detector run 2026-09-28 (re-verified 2026-09-28 at rollout B2 against the target origin main--e45f2fd7--aemcoder.aem.page: 0 findings, 0 host-bound paths, nothing to deliver) on the four archetypes (/, /blog, /blog/ace-pro-court-polo, /faq) with the
crawl's per-page reach signals (`extract --dynamics`, 15 pages): 0 third-party hosts, 0 first-party
API calls, 0 forms, 0 modal/player triggers, 0 client-rendered regions. The site is a fully static
build; every listing card, FAQ item and CTA is present in the served HTML.

## Listings contract
none — the blog listing (/blog) and /fashion-insights render their article cards statically in the
source HTML (7 articles, all in scope). The replica authors the cards from the captured content
(verbatim). An index-driven listing (query-index + `<meta>` fields per article) is not needed for
parity; it is recorded below as a decided-out feature for the owner to revisit after go-live.

## Features
| # | id | feature | class | reach | disposition | reproducibility | status | pattern | decision / owner | evidence |
|---|---|---|---|---|---|---|---|---|---|---|
| — | — | no dynamic features detected | — | — | — | — | — | — | — | stardust/current/_dynamics.json (0 findings) |

## Decision batch
none — no row needs an owner decision.

## Register (decided-out)
| feature | reason | production statement |
|---|---|---|
| index-driven blog listing | source renders the listing statically; parity is met by static cards | Listing pages are authored content; adding an article means adding a card (hands-off default, revisit at rollout) |
| FAQ accordion | detector found no JS trigger firing; open/closed state is confirmed by motion-observe in Phase 4 before any behaviour is implemented | Behaviour follows the observed source; nothing inferred from class names |
