# faq (static) — lift note (2026-09-28)

Source: stardust/current/pages/faq.{json,html}, site.css, captured inline `<style>` (Astro-scoped faq module).
Tokens/ramp/container/section/grid/buttons/chrome/@media: identical to index-tokens.md (same site.css) — canon.css carries them all.

## Page inventory (counts reconciled before authoring)
- main#main-content: 4 top-level blocks — header.section.secondary-section (hero) · section.section (FAQ) ·
  section.section.secondary-section (contact) · section.section.accent-section (CTA band).
- Hero: h1.h1-heading, p.subheading, p (gray-700), 1 img.cover-image `/images/faq-hero.avif` alt "FAQ" loading=lazy
  (media.allImgCount 1 → assets/images/faq-hero.avif, 42702 B). Single src, no srcset — no rendition fork.
- FAQ: .container[max-width 48rem] > .faq-list > 4× details.faq-item > summary.faq-question (span + svg.faq-icon 20×20 plus) + .faq-answer > p.
  No `open` attr on any details (all collapsed at t=0). 4 identical inline SVGs, lifted verbatim.
- Contact: h2.h2-heading, p.paragraph-lg; .contact-items (inline flex column gap xl) > 3 groups: h3.h6-heading.utility-text-secondary +
  a.paragraph-lg (mailto / tel, inline `margin-top xs; display block`) / p.paragraph-lg (address).
- CTA band: .utility-text-align-center[max-width 36rem; margin 0 auto] > h2.h2-heading, p.paragraph-lg, .button-group[justify-content center] > a.button "Join now" href "#".
- ctas: 24 total on page (chrome 20 + hero 0 + contact 2 + CTA 1 … per json; markup mirrors live anchors 1:1).

## Inline style attrs (mirrored verbatim on the prototype, same elements, same order)
hero grid `align-items: center` · subheading `margin-top: var(--space-lg)` · hero p `margin-top: var(--space-md); color: var(--color-gray-700)` ·
img `border-radius: var(--radius-card); aspect-ratio: 4/3` · FAQ .container `max-width: 48rem` · contact grid `align-items: start` ·
contact p `margin-top: var(--space-md); color: var(--color-gray-700)` · .contact-items `display: flex; flex-direction: column; gap: var(--space-xl)` ·
mailto/tel a `margin-top: var(--space-xs); display: block` · address p `margin-top: var(--space-xs)` ·
CTA wrapper `max-width: 36rem; margin: 0 auto` · CTA p `margin-top: var(--space-md)` · .button-group `justify-content: center`.

## Rules
- Scoped faq module (captured `<style>`, 923 B) == canon.css lines 226–233 declaration-for-declaration (verified by eye against the capture).
- `.contact-items`, `.accent-section`, `.utility-text-align-center`: site.css has only the latter two (bg yellow / text-align center) — both in canon.
- Chrome: live /faq navbar (8980 B) and footer (6209 B) are byte-identical (whitespace-normalised) to live /blog → blog-proposed.html chrome spliced verbatim.
- Marker: "WKND" occurs 0× in live /faq HTML → `--marker "Got questions"` (h1).
