# Inconsistency register — www.wknd-trendsetters.site replica

Everything not listed here is frozen; any design delta found by the gate is a defect, not an
improvement. All entries below are `deferred`: nothing changes in this run; they are a handover
list for the site owner.

## R-01 — Mobile nav row overflows the 360 px viewport on the live site

- **Evidence:** `measure.mjs` at 360: live `document.documentElement.scrollWidth` 423 vs viewport 360
  (+63 px); the only box past the viewport is `button.nav-mobile-menu-button` (x 383–423). Same
  numbers on the prototype. Files: `stardust/replica/gates/index-360/overflow-live-iter1.txt`,
  `stardust/replica/gates/index-360/overflow-iter1.txt`.
- **Finding:** the `.nav-inner` flex row (logo + Subscribe button + hamburger, 2 rem gap, no wrap)
  is wider than the 328 px mobile container, so every page scrolls horizontally by 63 px on a
  360 px phone — the mobile header is designed to fit the viewport and does not.
- **Minimal change:** let `.nav-inner` shrink its gap / allow the Subscribe button to compress at
  ≤ 400 px so the row fits 328 px; no other header change.
- **Status:** deferred (replicated verbatim; the gate's overflow assert is waived for this
  live-mirrored delta on every archetype).
- **Where:** site header, every page type, 360 px.
