# Dynamic features plan — www.wknd-trendsetters.site

## Phases
| phase | deliverable | rows | effort |
|---|---|---|---|
| implement | nothing — 0 findings (static site) | 0 | none |
| verify | `dynamics-check.mjs` presence sweep is moot; the Phase 4 motion-observe/motion-compare pass covers observed interactions (FAQ accordion, nav) | 0 | covered by replica Phase 4 |

## Authoring contract
Static authored content for every page; no sheets, no indexes, no forms. Any interaction that
motion-observe records on the live archetype is implemented in the block's JS to the same timing.

## Verification
- replica Phase 4 motion-compare per archetype (parity / MISSING / EXTRA lines).
- rollout B2-dynamic: re-run `dynamics-detect.mjs` on the published origin; expected 0 findings.

## Owner decisions
none pending.
