# index (landing) — lifted values from stardust/current/assets/css/site.css (+ captured inline <style>)

Box model: `*,*:before,*:after{box-sizing:border-box;margin:0;padding:0}` — universal border-box IS the source's model (lifted, not a reset).
Body: font-body / 1rem / lh 1.6 / #000 on #fff; -webkit-font-smoothing antialiased; -moz-osx grayscale. html: scroll-behavior smooth; -webkit-text-size-adjust 100%.
img: max-width 100%; height auto; display block. a: color inherit; no underline. ul,ol: no list-style.

## Tokens (:root) — see canon.css :root (verbatim). Media overrides:
- ≤991: --text-5xl 2.5rem, --text-4xl 2rem, --text-3xl 1.5rem
- ≤767: --text-5xl 2rem, --text-4xl 1.75rem, --text-3xl 1.375rem
- ≤479: --text-5xl 1.75rem, --text-4xl 1.5rem, --container-padding 1rem

## Type ramp
h1-6 + .hN-heading: font-heading, 700, lh 1.1, uppercase. h1 5xl ls -.02em; h2 4xl; h3 3xl; h4 2xl; h5 xl; h6 sm ls .05em
.subheading: font-body lg lh 1.6 400 | .paragraph-xl xl | .paragraph-lg lg | .paragraph-sm sm (all lh 1.6)

## Container / section / grid
.container max-width 1200px; margin-inline auto; padding-inline var(--container-padding)
.section padding-block 8rem (≤991: 5rem; ≤767: 4rem). .secondary-section bg gray-100. .inverse-section bg black/white. .accent-section bg yellow
.grid-layout grid 2 cols gap 2rem; desktop-1-column 1fr; desktop-3-column 3; desktop-4-column 4
 ≤991: .grid-layout 2 cols; tablet-1-column 1fr; tablet-2-column/tablet-2-column-1/desktop-4-column 2 cols; .tab-menu 2 cols; .utility-margin-bottom-8rem → 4rem
 ≤767: .grid-layout,.grid-layout.tablet-2-column-1,.tab-menu 1fr; .button-group column; .button width 100% text-align center
 ≤479: .grid-layout.desktop-4-column,.grid-layout.mobile-portrait-1-column 1fr
grid-gap-xs .5 / sm .75 / md 1 / lg 1.5 / xl 2 / xxl 4rem. flex-horizontal flex center; flex-vertical column; flex-gap-xxs .25/xs .5/sm .75/md 1; y-center; x-left align-items flex-start

## Buttons/tags/links — canon.css verbatim from rules @3614–@4864, @6052, @7571–@7668
## Cards/media: .card, .card-link, .inverse-card-link, .card-body p 2rem, .cover-image, aspect utils, .icon-small/medium, .avatar 3rem, .overlay gradient
## Chrome: .navbar sticky top0 z100 white bb 1px gray-200; .nav-inner flex sb padding-block 1rem gap 2rem; .logo; .nav-logo-icon 2rem; .nav-menu; .nav-link; mega-menu; dropdown; mobile button
 ≤991 nav: .nav-menu display none, fixed inset0 white column stretch padding 5rem cp 2rem overflow-y auto z99; .is-open flex; .nav-menu-list column stretch; .nav-mobile-menu-button flex z101; .mega-menu static w100 border 1px gray-200 p 1rem; .mega-menu-grid 1fr gap 1rem; dropdown-list static pl 1rem
Footer: .footer padding-block 5rem; .inverse-footer black/white --color-gray-500:#999; .footer-link block pb .5rem sm gray-500; .footer-icons-group flex gap .75; .footer-icon-link 2.25rem circle gray-700
## Tabs: .tab-menu grid gap 1rem; .tab-menu-link block p 1rem r 1rem border gray-200; .is-active border black bg gray-100; .tab-pane none / .is-active block
## Inline <style> (Astro scoped) — article-card + faq (see canon.css section "scoped modules")
## Inline style attrs carried on the markup (mirror verbatim as style="" on the prototype): see index.html captured — hero imgs radius-card + aspect 3/2 w270 h180 fetchpriority high; grids align-items center/start; card-body padding 3xl; cta min-height 28rem flex align-end; etc.
## Renditions: single src per img (no srcset) at both widths — no rendition fork possible.
## Scripts: nav-toggle toggles .is-open on #nav-menu + aria-expanded; tabs: click/arrow keys swap .is-active + hidden + aria-selected + tabindex, focus.
