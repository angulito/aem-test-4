---
_provenance:
  writtenBy: stardust:replica
  writtenAt: 2026-09-28T10:32:06Z
  againstInput: https://www.wknd-trendsetters.site/
  readArtifacts:
    - stardust/current/PRODUCT.md
    - stardust/current/DESIGN.md
    - stardust/current/DESIGN.json
---

# Direction — preserve mode (same-design migration)

Mode: PRESERVE. The target spec is the captured current state of
https://www.wknd-trendsetters.site/, promoted verbatim (no direct invocation, no creative decisions).

Promoted: current/PRODUCT.md → PRODUCT.md · current/DESIGN.md → DESIGN.md ·
current/DESIGN.json → DESIGN.json (at 2026-09-28T10:32:06Z).

Permitted deltas: ONLY the entries of stardust/replica/inconsistency-register.md
(empty — pure replica).

Fidelity: ia verbatim · design verbatim · content verbatim.

## Hands-off activation

Hands-off mode activated at 2026-09-28T10:32:06Z by `--hands-off` on `stardust:replica`
(`state.json.handsOff: true`). Every interactive gate auto-resolves per the master skill's
hands-off table; prototype approvals are recorded `approvedBy: "hands-off"` only after all
quality gates pass.

Named assumptions:
- Scope is fixed by `stardust/.labs/site-plan.json`: 16 selected pages, of which 15 exist
  (`/cdn-cgi/l/email-protection` is a Cloudflare artifact answering HTTP 404 — no page to migrate).
  Volume caps are moot; no roster pruning.
- Gate breakpoints: run.json `desktop,mobile` → 1440 px and 360 px.
- Page types from extract are kept as the archetype set (no `direct --prep` refinement in this
  flow): landing (archetype `index`, siblings case-studies, fashion-trends-of-the-season,
  fashion-trends-young-adults, fashion-trends-young-adults-casual-sport), listing (archetype
  `blog`, sibling fashion-insights), article (archetype `blog-ace-pro-court-polo`, 6 siblings),
  static (archetype `faq`).
- Inconsistency register: hands-off policy adopts no audit candidates; the user supplied none.
- Fonts: Syncopate and Instrument Sans are open-licence Google faces intercepted as woff2 at
  extract; they are self-hosted from the capture, no substitution.
