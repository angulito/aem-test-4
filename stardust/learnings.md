# Learnings — WKND Trendsetters replica migration (2026-09-28)

Per `skills/stardust/reference/learnings.md`. One entry per failure class this run surfaced.

### Sibling styled by a per-page scoped `<style>` invisible to the site.css lift
- failure class: capture-gap (CSS lift read only linked stylesheets; the variance probe never selected the sibling-only component)
- evidence: `fashion-trends-young-adults-casual-sport` pixel bar pb1 25.14 % / Δ156 at 1440, 48.96 % / Δ778 at 360 (hot bands y 1000–3265, the trend-card grid); the live page styles `.trend-card` from an Astro scoped `<style data-astro-cid-5nygekyv>` (675 chars) that site.css never carries; `stardust/migrate/plan.md` budgeted "structural classes, no CSS needed" from site.css alone. Fixed by lifting the six rules into `stardust/prototypes/css/index.css`; pb2 0.00 % / Δ0.
- proposed change: `skills/replica/reference/recreation-procedure.md` § CSS lifting — harvest inline and scoped `<style>` blocks of every captured page (not only `<link>` stylesheets) into the lift; `skills/migrate/reference/fidelity-tiers.md` § Sibling variance probe — auto-probe every class present on the sibling and absent from the archetype, so a sibling-only component cannot go unprobed.
- status: pending

### Overflow assert fails every 360 round on a live-mirrored defect
- failure class: false-fail (gate asserts the build side against the viewport while the live side has the identical overflow)
- evidence: every 360 round of this run (4 archetypes × iterations, 11 siblings × pb rounds, 4 published rounds) exited on `FAIL: horizontal overflow +63px` (scrollWidth 423) although `measure.mjs` reads 423 on the live `.nav-inner` too; resolved by a per-page `overflow-live-mirrored` decision and `passOnPixelBars: true` in `stardust/replica/progress.json` and 15 sidecars — bookkeeping repeated on every unit.
- proposed change: `skills/replica/scripts/gate.sh` + `reference/source-fidelity-gate.md` § horizontal-overflow assert — measure `scrollWidth` on the live capture too and downgrade the assert to an advisory `overflow live-mirrored (+N px both sides)` when the two agree within `GATE_OVERFLOW_TOLERANCE`; keep the FAIL for build-only overflow.
- status: pending

### Scorecard shows `null` for a layer whose detectors found nothing
- failure class: reporting (a clean layer reads as "not assessed")
- evidence: F-optimize run-1, `stardust/rollout/optimize/scorecard.json#current.dimensions` accessibility `null`, seo `null` while both baseline detectors ran over 15 pages with 0 findings; `computeScorecard` in `skills/rollout/scripts/lib.mjs` derives `assessed` from the findings present, so health 100 is the mean of two layers instead of four and the report line reads `a11y null · seo null`.
- proposed change: `skills/rollout/scripts/lib.mjs` `computeScorecard` — seed `assessed` with `ASSESSED_BY_BASELINE` whenever the run source is `rollout:baseline` (or pass the assessed layers from the run record), so a clean layer scores 100, not `null`.
- status: pending

### Cloudflare `/cdn-cgi/` artifact selected as a page
- failure class: capture-gap (discovery noise in the page roster)
- evidence: `stardust/.labs/site-plan.json` selected `https://www.wknd-trendsetters.site/cdn-cgi/l/email-protection` as page 16 of 16; the crawl recorded an HTTP 404 (`HTTPError`, same in curl) and the extract end line had to explain a 15/16 capture on every later phase.
- proposed change: `skills/extract/SKILL.md` § Discovery — drop `/cdn-cgi/*` (and other well-known CDN service paths) from the candidate roster before typing/selection, listing them in `_crawl-log.json` as `artifact`, so plan counts and capture counts agree.
- status: pending

### Re-rendering an already-migrated sibling needs a state round-trip
- failure class: path-safety (no re-render path once a page is `migrated`)
- evidence: after the trend-card CSS lift, the pixel-bar unit had to move `fashion-trends-young-adults-casual-sport` from `migrated` back to `directed` with `state.mjs advance --force`, re-render Path A′, and re-advance — three bookkeeping steps for a re-render whose HTML changed only in the provenance comment.
- proposed change: `skills/migrate/SKILL.md` § render — a `--rerender <slug>` path that re-emits an A′ clone for a `migrated` page in place, recording the reason in the sidecar and leaving the state row untouched.
- status: pending

### Dashboard counts source-parity findings as open and shows 0 pages optimised
- failure class: reporting (dashboard and scorecard disagree on the same ledger)
- evidence: I-dashboard first run, `stardust/rollout/dashboard/data.json` stageCount optimised 0 and `openFindings: 2` on `index` while `optimize/scorecard.json` read open P1 0 / P2 0 / P3 0 and health 100; `skills/rollout/scripts/dashboard.mjs` lines 83 and 149 filter on `status` only and never call `isSourceParity` from `lib.mjs`. Cleared by resolving the 16 parity findings `accepted` through `findings.mjs` (the decision the journal already recorded), then optimised 15/15.
- proposed change: `skills/rollout/scripts/dashboard.mjs` — exclude `isSourceParity(f)` findings from the per-page `openFindings` and the `optimised` stage test, the same rule `computeScorecard` applies; or have `optimize.mjs` write parity findings with `status: accepted` at detection time so every consumer agrees.
- status: pending
