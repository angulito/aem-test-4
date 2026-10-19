<!-- stardust:provenance
  writtenBy: stardust:extract
  writtenAt: 2026-09-28T10:24:00Z
  readArtifacts:
    - https://www.wknd-trendsetters.site/
    - stardust/current/_brand-extraction.json
    - stardust/current/_crawl-log.json
    - stardust/current/pages/*.json (15)
  synthesizedInputs: []
  stardustVersion: 0.25.1
  note: descriptive snapshot of the EXISTING site; not an authored target. Sections marked `_provenance: inferred` are agent judgment from captured copy.
-->
# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Young adults (late teens to late twenties) who follow street, sport-casual, beach and nightlife fashion and want quick, visual trend inspiration rather than shopping. The copy addresses them in the second person as "trendsetters" and asks them to share outfit photos and join a community (FAQ: "Can I share my own outfit pics?", "How can I join your community?").

_provenance: inferred — from hero copy, tag taxonomy (Casual Cool, Beach Vibes, Nightlife, Sport) and the FAQ questions; no analytics or persona document was captured._

## Product Purpose

WKND Trendsetters (wordmark "Fashion Blog") is an editorial fashion blog: a home landing, four trend-category landing pages (season, young adults, casual/sport, insights), a blog index with seven long-form articles, a case-studies showcase and a FAQ/contact page. It exists to publish trend round-ups and style stories ("Discover the latest fashion trends, style tips, and stories for young trendsetters" — meta description) and to grow a subscriber community (every page ends in a "Subscribe / Join now" band). Success, as the site expresses it, is readership and subscriptions — there is no commerce, login or lead form.

## Positioning

Fashion coverage framed as lived moments rather than product pushes: "see how young trendsetters own every moment, from courtside to the dance floor." Articles are first-person-ish narratives around named people (Alex, Jamie, Morgan, Jordan Ellis "Trend Spotter") and real settings (tennis court, beach, festival, night out), with a pull-quote per story. The visual claim is equally specific: all-caps Syncopate headlines, hard-offset black pill buttons and a single lime accent — a look a neutral fashion magazine template would not carry.

_provenance: inferred — from captured headlines, pull-quotes and the computed brand surface._

## Capabilities and Constraints

- Static Astro build (`/_astro/` bundle, `data-astro-cid-*` attributes); no runtime data endpoints, no forms, no third-party scripts, no hydration (crawl `--dynamics`: 0/0/0/0).
- Interactive surface is limited to a CSS/JS mega-menu (Trends, Support) and native `details/summary` FAQ accordions.
- Footer link columns (Trends / Inspire / Explore, 15 links) all point to `#` — placeholder IA, not real destinations.
- Subscribe / Join CTAs are plain links; no subscription backend was observed.
- A Cloudflare email-protection route (`/cdn-cgi/l/email-protection`) is linked but returns HTTP 404 when fetched directly; the visible contact e-mail is `hello@fashionblog.com`.
- Terminology: "trendsetters", "fits", "looks", "vibes", "snapshots"; category tags are Title Case two-word pills.
- Images are AVIF served from `/images/`, mostly 800 px wide (3:2 or landscape crops); no video.

## Brand Commitments

- **Register:** `brand` — marketing/editorial landing pages, hero copy above the fold, no authentication.
- **Name & marks:** site title "WKND Trendsetters"; header wordmark "FASHION BLOG" beside a 33×33 inline-SVG mark (rounded square with a four-point star cut-out, `currentColor`). Favicon `favicon.svg`.
- **Personality (observed):** playful-bright, confident, youthful; short imperative triads ("Fresh looks, bold stories, real life"), em-dash asides, no jargon.
- **Type:** Syncopate 700 uppercase for every heading; Instrument Sans 400/600 for body and buttons (both self-hosted woff2, captured).
- **Color:** black/white with one lime accent (#f4fe8b) and warm greys; declared lavender (#cbd4ff) and lilac (#f4e5fc) tokens exist but were not observed in use.
- **Observed anti-references (what the site does not do):** no gradients except a dark photo overlay, no soft drop shadows on cards, no serif or script type, no colour photography treatments — images are untreated photos in rounded tiles.

## Evidence on Hand

- `stardust/current/pages/<slug>.json` + `.html` — 15 live Playwright renders (1440×900, medium wait; case-studies re-captured at slow) with headings, body copy, CTAs, links, media inventory, CSS custom properties, `dynamic` reach signals and typed `slots`.
- `stardust/current/assets/screenshots/<slug>.png` — full-page screenshots (+ `*-thumb.png` review thumbnails).
- `stardust/current/_computed-styles.json` — style census, 15 pages × {1440, 360}.
- `stardust/current/_brand-extraction.json` — palette, type, motifs, component styles, 9 system components, voice.
- `stardust/current/assets/logo.svg`, `assets/favicon.svg`, `assets/fonts/*.woff2` (3 files).
- `stardust/current/_crawl-log.json` — discovery, failures (1 × HTTP 404), vision check (14 ok, 1 recaptured).
- **Absent (do not fabricate):** author bylines/dates on article pages (dates appear only on listing cards), real footer destinations, testimonials beyond the two captured quote blocks, any pricing, product or form content, og:image / social cards (all `og:*` null).

## Product Principles

1. Lead with the moment, not the garment — every story and card is anchored in a place and a person.
2. One voice, one accent — black type, white space, a single lime highlight; the restraint is the brand.
3. Headlines are the design — uppercase Syncopate carries hierarchy; imagery stays untreated.
4. Always end with the community — a subscribe/join band closes every page.

_provenance: inferred — derived from the captured copy and computed brand surface; to be confirmed in `direct --prep`._

## Accessibility & Inclusion

Observed only: a "Skip to main content" link on every page, `aria-label`led navigation landmarks, `aria-hidden` decorative SVGs, native `details/summary` for accordions, a 2 px black focus ring token (`--focus-ring-*`). 10 of 109 images (9 %) carry empty alt text; the rest are descriptive. No stated standard was captured.
