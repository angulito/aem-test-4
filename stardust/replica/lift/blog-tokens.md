# blog (listing, /blog) — lift notes

Shared layer: everything /blog uses is already lifted in stardust/replica/lift/index-tokens.md and
carried by stardust/prototypes/css/canon.css (tokens, ramp, container/section/grid + @media,
buttons, .tag, .cover-image, .utility-aspect-3x2, article-card scoped module, footer, navbar).
Verified per class with grep (canon:1 / site:1 for .tag, utility-text-secondary,
utility-text-align-center, utility-aspect-3x2, flex-gap-xxs, accent-section, h4-heading,
grid-gap-xxl/xs/lg/md, tablet-2-column-1, mobile-portrait-1-column, desktop-4-column,
secondary-button, subheading, paragraph-lg/sm, button-group, flex-horizontal).

Chrome: captured /blog header (`body > div.navbar`), `nav#nav-menu`, `footer.footer` and the inline
Astro <style> block are byte-identical to the captured index (html-slice diff: NAVBAR SAME,
FOOTER SAME, STYLE SAME). Header/footer markup html-sliced from index-proposed.html (lines 16–154,
384–441: skip-link + navbar; footer + nav-toggle script). /blog has ONE module <script> on live
(nav toggle); no tabs → tabs script not carried.

## Content skeleton (counts before authoring)
- main#main-content > header.section.secondary-section (hero: h1, subheading, 2 buttons, 1 img
  fashion-insights-hero.avif w270 h180 fetchpriority high, radius-card + aspect 3/2)
- section.section (featured: img ace-polo-court-style.avif .utility-aspect-3x2 radius-card; tag
  "Featured" + date; h2; paragraph-lg gray-700; 1 button → /blog/ace-pro-court-polo)
- section.section.secondary-section#articles (h2 + paragraph-lg centered, mb 3xl; grid
  desktop-4 / tablet-2-column-1 / mobile-portrait-1 gap-md; 6 article-cards, h3.h4-heading
  font-size text-lg inline)
- section.section.accent-section (centered max-width 36rem; h2; paragraph-lg mt md; button-group
  justify center; Subscribe → #)
- 8 images total = media.allImgCount 8. Root-relative links kept (/blog/…, /fashion-trends-of-the-season, #articles).

## Inline style attrs mirrored verbatim
hero grid align-items center; subheading mt space-lg; featured grid align-items center; meta row
mb space-md; paragraph mt space-md + color gray-700; articles heading block mb space-3xl; sub p mt
space-sm; card h3 font-size text-lg; CTA wrapper max-width 36rem margin 0 auto; p mt space-md;
button-group justify-content center.

## Renditions: single src per img (no srcset) — same as index; no rendition fork possible.
