<!-- stardust:provenance
  writtenBy: stardust:extract
  writtenAt: 2026-09-28T10:25:00Z
  readArtifacts:
    - stardust/current/_brand-extraction.json
    - stardust/current/_computed-styles.json
    - stardust/current/pages/index.json (customProps)
  synthesizedInputs: []
  stardustVersion: 0.25.1
  note: descriptive record of the EXISTING design system (current state); values are computed/declared on the live site, cited in _brand-extraction.json.
-->
---
name: WKND Trendsetters (current state)
description: Fresh looks, bold stories, real life — black/white editorial fashion blog with one lime accent
colors:
  black: "#000000"
  white: "#ffffff"
  lime: "#f4fe8b"
  gray-100: "#f5f5f5"
  gray-200: "#e8e8e8"
  gray-300: "#d4d4d4"
  gray-500: "#666666"
  gray-700: "#404040"
  gray-900: "#171717"
  text-muted: "#999999"
  lavender: "#cbd4ff"
  lilac: "#f4e5fc"
typography:
  display:
    fontFamily: "Syncopate, sans-serif"
    fontSize: "56px"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
    textTransform: "uppercase"
  headline:
    fontFamily: "Syncopate, sans-serif"
    fontSize: "40px"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
    textTransform: "uppercase"
  title:
    fontFamily: "Syncopate, sans-serif"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: 1.3
    textTransform: "uppercase"
  body:
    fontFamily: "Instrument Sans, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  body-lg:
    fontFamily: "Instrument Sans, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Instrument Sans, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.3
rounded:
  sm: "6px"
  md: "8px"
  lg: "16px"
  card: "20px"
  full: "9999px"
spacing:
  xxs: "4px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
  3xl: "64px"
  4xl: "80px"
  5xl: "128px"
components:
  button-primary:
    backgroundColor: "{colors.black}"
    textColor: "{colors.white}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "12px 24px"
  button-secondary:
    backgroundColor: "{colors.white}"
    textColor: "{colors.black}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "12px 24px"
  tag-pill:
    backgroundColor: "{colors.lime}"
    textColor: "{colors.black}"
    rounded: "{rounded.full}"
  card:
    backgroundColor: "{colors.white}"
    textColor: "{colors.black}"
    rounded: "{rounded.card}"
  section-tint:
    backgroundColor: "{colors.gray-100}"
    textColor: "{colors.black}"
    padding: "128px 0"
  section-inverse:
    backgroundColor: "{colors.black}"
    textColor: "{colors.white}"
    padding: "128px 0"
---
# Design System: WKND Trendsetters (current state)

## Overview

**Creative North Star: "The Zine Poster"**

The site reads like a black-and-white street-fashion zine blown up to poster scale: every heading is set in Syncopate — a wide, geometric, all-caps display face — at 56/40 px with tight negative tracking, and everything else steps back into quiet Instrument Sans. Colour is almost absent: pure black type and pill buttons on white, alternating with a #f5f5f5 tint, and one lime highlight (#f4fe8b) that appears only as tag pills and the subscribe band. Photography is untreated and rounded at 20 px, arranged in 2–4 column collages.

Density is generous — 128 px section padding, a 1200 px container, one idea per section. Depth is flat except for one signature: a hard, unblurred 4 px black offset shadow under every pill button that grows to 6 px on hover.

**Key characteristics:** uppercase geometric headlines · monochrome with a single lime accent · hard-offset shadow pills · rounded photo tiles · alternating white/tint/black bands · flat cards.

## Colors

A monochrome system with one accent; the census found black as the dominant fill and text colour (weight 1582), white as the page surface, and lime as the only chroma in use.

### Primary
- **Ink Black** (#000000): headings, body links, primary button fill, footer and inverse CTA-band background, 2 px button borders, focus ring. It is simultaneously the text colour and the primary action colour.

### Secondary
- **Lime Pop** (#f4fe8b): tag pills on cards and article heroes, the subscribe/join CTA band background. The only saturated colour observed (6 pages, 5.2 M px² of background).

### Neutral
- **Paper White** (#ffffff): page background, secondary button fill, text on inverse sections.
- **Tint** (#f5f5f5): alternating section background (hero header, gallery, latest-articles).
- **Rule Grey** (#e8e8e8): borders and card dividers; **Slate** (#666666) secondary text; **Charcoal** (#404040) tertiary text and small labels; **Mist** (#999999) muted meta text (dates, read time).
- **Declared but unobserved:** Lavender (#cbd4ff), Lilac (#f4e5fc), Gray-300 (#d4d4d4), Gray-900 (#171717) exist as `--color-*` tokens on `:root` yet never appear in the computed census — see the T-color-imbalance tensions.

### Named Rules
**The One Accent Rule.** Lime is the only chroma and it appears on at most one band and the tag pills per page. Everything else is black, white or grey.

## Typography

**Display Font:** Syncopate (with sans-serif fallback) — 400 and 700 self-hosted woff2, only 700 observed.
**Body Font:** Instrument Sans (with sans-serif fallback) — variable 400–700 woff2; 400 body, 600 buttons/labels.

**Character:** a wide, mechanical, all-caps display face set very large against a neutral humanist grotesque; the contrast in width and case does all the hierarchical work, so there is no italic, no serif and no colour in type.

### Hierarchy
- **Display / H1** (700, 56px → 28px at 360, line-height 1.1, letter-spacing −1.12px, uppercase): page hero headline on every non-article page and article titles.
- **Headline / H2** (700, 40px, 1.1, uppercase): section headings (62 observed) — "Style in every snapshot", "Latest articles", CTA-band headlines.
- **Title / H3** (700, 18px, 1.3, uppercase): card titles, FAQ contact labels, mega-menu group labels (also 24px on some sub-heads).
- **Body** (400, 16px, 1.6): article paragraphs; **Body-lg** (400, 18px): heroes' subheading and section intros.
- **Label** (600, 14px, 1.3): all buttons and nav links, sentence case; tag pills use Syncopate 700 at 12–14px uppercase.

### Named Rules
**The Caps-Only Rule.** Every heading level is uppercase Syncopate 700; no heading is ever mixed-case or set in the body face.
**Scale note.** The declared ladder (`--text-xs … --text-5xl` = .75/.875/1/1.125/1.25/1.5/2/2.5/3.5 rem) is hand-picked, not a constant ratio (`scaleAudit.kind: ad-hoc`).

## Layout

A single 1200 px max-width container with 24 px side padding; sections are full-bleed bands with 128 px vertical padding (`--space-5xl`) that alternate white → #f5f5f5 → white, ending in a black inverse band and the black footer. Inside, a `grid-layout` utility drives 2-column heroes (text left, photo collage right), 3–4 column card grids (`desktop-4-column tablet-2-column mobile-portrait-1-column`), and 2×4 / 3-column photo galleries, all with 16–48 px gaps. Articles use a narrower single column of body copy with the lead image beside the title. Spacing tokens run 4 → 8 → 12 → 16 → 24 → 32 → 48 → 64 → 80 → 128 px. At 360 px everything collapses to one column and H1 drops to 28 px.

## Elevation & Depth

Flat-by-default with one signature hard shadow. Cards, tiles and sections carry no shadow at rest (the declared `--shadow-card: 0 2px 8px rgba(0,0,0,.08)` is never applied in the census); depth comes from the alternating tint/white/black bands and from rounded photo tiles sitting on tinted sections. The only real "elevation" is the button shadow.

### Shadow Vocabulary
- **Offset pill** (`box-shadow: 4px 4px 0 0 #000`): every pill button at rest; 74 occurrences.
- **Offset pill · hover** (`box-shadow: 6px 6px 0 0 #000`): the same button on hover (40 hover deltas observed); no colour change.
- **Offset pill · on inverse** (`box-shadow: 4px 4px 0 0 rgba(255,255,255,.3)`): white pill on the black image band.
- **Photo overlay** (`linear-gradient(to top, rgba(0,0,0,.7) 0%, rgba(0,0,0,0) 60%)`): the only gradient, on the inverse image CTA band.

### Named Rules
**The Hard-Shadow Rule.** Shadows are never blurred. A shadow is a solid black offset, and only a button may have one.

## Shapes

Two radii do all the work: the full pill (9999 px — 314 occurrences: buttons, tag pills, avatar chips, nav Subscribe) and the 20 px card radius (`--radius-card: 1.25rem` — photo tiles, collage images, article cards, FAQ accordions). Smaller tokens exist (6/8/16 px) but only 8 px appears, on the skip-link's bottom corners. Images are always clipped to 20 px with fixed aspect ratios (3:2 hero tiles, square gallery tiles). No decorative geometry beyond the four-point-star logo cut-out.

## Components

### Buttons
- **Shape:** full pill (9999 px), 2 px solid black border, 12 px 24 px padding, Instrument Sans 600 14 px, sentence case.
- **Primary:** black fill, white text, 4 px 4 px 0 #000 shadow.
- **Secondary:** white fill, black text, same border and shadow.
- **Hover / Focus:** shadow grows to 6 px 6 px 0 (transition .15s ease); colours unchanged; 2 px black focus ring at 2 px offset.
- **On inverse:** white pill with 30 % white offset shadow.
- **Text button:** label + 16 px arrow icon, no border (mega-menu "Discover").

### Chips
- **Tag pill:** lime #f4fe8b background, black Syncopate 700 uppercase ~12–14 px, full radius; on cards (with a grey date beside it) and article heroes.
- **People chip:** #efefef / #f5f5f5 background, 16 px radius, 1 px border, avatar + name + role at 13 px (testimonial rows).

### Cards / Containers
- **Corner Style:** 20 px on the image and the card.
- **Background:** white on tinted sections, tinted on white sections; inverse card in the mega-menu is black.
- **Shadow Strategy:** none (flat; see Elevation).
- **Border:** none; the whole card is one `<a class="article-card card-link">` with image → meta (tag + date) → H3.
- **Internal Padding:** 16–24 px.

### Navigation
- Sticky-less white header, thin rule below; logo (33 px mark + "FASHION BLOG" Syncopate 700 uppercase 14 px) left, centred nav "Trends ▾ · About · Blog · Support ▾" in Instrument Sans 600 14 px, black pill "Subscribe" right. Mega-menus are 2–3 column link grids with 24 px icons, H3 group labels and one inverse promo card. Footer is black with the logo, three H2-labelled link columns and five circular social icons.

### Signature Component — Hero Collage
Two-column header: uppercase H1 + `paragraph-lg` subheading + button group left; a 1–3 image collage of 20 px-rounded 3:2 photos right (absent on /case-studies). Repeats on 8 pages.

### FAQ Accordion
Native `<details>/<summary>`, 4 items, 20 px radius, question in Syncopate, answer in Instrument Sans; reused on home and /faq.

## Do's and Don'ts

### Do:
- **Do** set every heading in Syncopate 700 uppercase with −0.02em tracking; H1 56 px / H2 40 px / H3 18 px.
- **Do** give every pill button the 4 px 4 px 0 #000 offset shadow and grow it to 6 px on hover.
- **Do** clip every photo to 20 px and keep it untreated (no tint, no gradient) except the inverse CTA band.
- **Do** alternate white and #f5f5f5 bands at 128 px vertical padding and close the page with a black band + black footer.
- **Do** reserve lime #f4fe8b for tag pills and the subscribe band.

### Don't:
- **Don't** use blurred drop shadows, gradients on cards, or the declared `--shadow-card`.
- **Don't** introduce lavender/lilac or any second accent — they are declared but unused on the live site.
- **Don't** set headings in mixed case or in Instrument Sans.
- **Don't** change button colour on hover; the state is carried by the shadow alone.
