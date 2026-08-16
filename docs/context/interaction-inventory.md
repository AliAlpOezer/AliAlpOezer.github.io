---
topic: interaction-inventory
updated: 2026-08-16
---

# Micro-interactions: what the reference site does, and what to take

Alp asked for hover and click finework, "without exaggerating it", and asked that the
reference site be read route by route first. All six routes of `keremkeptig.info` were
fetched and their stylesheets read from source (raw CSS, not CSSOM - it keeps the authoring
comments and the rule ordering, which is where the drift shows).

Companion files: `visual-direction.md` (the brief and the background), `design-record.md`
(invariants), `reference-site-analysis.md` (what the site is overall).

## Route-by-route inventory

| Route | Stylesheet | Interaction vocabulary |
|---|---|---|
| `/` | inline `<style>` + Tailwind CDN | `.btn-glow` lift + glow, `.card-hover` lift, `.reveal-on-scroll`, rotating hero role text |
| `/projects` | `projects.css` | filter pills with a shared moving indicator, card lift + sheen sweep, per-letter heading shake |
| `/blogs` | `blogs.css` | **gap-widening arrow links**, card lift, border-colour change |
| `/about` | `about.css` + `animations.css` | wipe-fill buttons, social icons with `::before` fill, competency tiles scale + rotateY |
| `/myjourney` | + `experience.css` | sticky rail with a scaling nav dot, journey cards |
| `/contact` | `contact.css` + Bootstrap 5 | form focus glow, primary button inverts on hover |

### The measured numbers

- Colour-only hovers: `.15s` (Tailwind default) up to `.3s ease`.
- Card lifts: `.4s cubic-bezier(.2,.7,.2,1)` - a genuinely nice curve, slow-out and settled.
- Fills and sweeps: `.4s` to `.6s`, sheen `left -100% -> 100%` over `.5s`.
- Competency tiles: `.4s cubic-bezier(.175,.885,.32,1.275)` - an overshoot/back curve.
- Letter flip on `/about`: out `.32s cubic-bezier(.6,0,.7,.2)`, in `.38s ease`.
- Per-letter stagger on the heading shake: `.08s` per letter.

## What is genuinely good and is being taken

1. **Gap-widening arrow links.** `.read-more { gap: 6px; transition: gap .3s ease }` and
   `:hover { gap: 10px }`. The best single idea on the site: the arrow slides away from the
   word, which *means* forward motion rather than decorating it. Costs one property.
2. **A shared moving indicator behind filter pills.** `.category-indicator`, absolutely
   positioned, `border-radius: 999px`, animating between the active buttons. The right
   pattern for a filter row.
3. **Icon response inside a button** - `.category-btn:hover i { transform: scale(1.08) }`.
   The icon reacts slightly more than its label, which reads as depth.
4. **A real `:focus-visible` treatment** - `outline: 2px solid; outline-offset: 3px`.
   Credit where due, he has this and many portfolios do not.
5. **`prefers-reduced-motion` is honoured**, with a global duration kill plus per-page
   overrides. Also to his credit.

## What is deliberately not being taken

- **Everything glows cyan.** Hover states stack two and three coloured box-shadows
  (`.port-box:hover` has three). C has one accent and one shadow recipe; a lift is expressed
  by *movement*, not by a light source that does not exist elsewhere on the page.
- **The lifts are too big.** `translateY(-8px)` and `-10px` at card scale reads as the card
  jumping at the cursor. Apple's equivalent moves 2-4px, or does not move at all.
- **`transform: scale(1.1) rotateY(5deg)`** on competency tiles, and the per-letter heading
  shake, are novelty rather than feedback - they respond to hovering, not to anything the
  user is trying to do.
- **`transition: all`** appears repeatedly. It animates properties nobody intended, including
  ones that force layout.
- **The CSS has accumulated conflicting overrides**: `.card-hover:hover` is declared twice
  (`-8px` then `-4px`), and `.blog-card:hover` three times, the last being
  `transform: none`. Two of the three published lift values on that site are dead. This is
  the same "three sites wearing one name" problem the analysis file already records, showing
  up at rule level.

## Craft rules from the research, which set the timings

Sourced rather than guessed:

- **Feedback must start within ~100ms** of the cursor arriving, or the element does not feel
  interactive (NN/g).
- **Hover transitions: 200-300ms.** Longer reads as lag on an element the user is pointing at.
- **Click/press feedback: 100-200ms.** A press must feel immediate and mechanical.
- **Anything over ~400ms on a frequently repeated interaction reads as sluggish.**
- **Hover-intent delay of 300-500ms applies only to *revealing hidden content*** (menus,
  popovers) - never to a colour or transform change, which must be instant.
- **Exit is faster than entry.** Leaving should not feel like the element is reluctant.

Sources: [NN/g, timing guidelines for exposing hidden content](https://www.nngroup.com/articles/timing-exposing-content/),
[Equal Design, 5 rules for motion in UI transitions](https://www.equal.design/blog/5-rules-for-motion-in-ui-transitions),
[Justinmind, micro-interaction guidelines](https://www.justinmind.com/web-design/micro-interactions).

## The spec built for C

One vocabulary, applied everywhere, expressed as tokens so it cannot drift:

```
--t-fast:  120ms   press, and any state that must feel mechanical
--t-base:  220ms   hover colour, border, opacity
--t-slow:  380ms   position and size changes, reveals
--ease-out: cubic-bezier(.2,.7,.2,1)     entry, settle
--ease-in:  cubic-bezier(.4,0,.7,.2)     exit, faster
```

Applied to:

1. **Arrow links** (`All projects ->`, `Read it ->`, the stage links): the arrow is its own
   element, the gap widens 4px on hover. Taken from `.read-more`, at half the travel.
2. **Nav links**: a hairline underline growing from the left, `transform: scaleX` on a
   `::after` so it is compositor-only. No colour glow.
3. **Chips and buttons**: `:active { transform: scale(.97) }` at `--t-fast`. Press is the
   one place a transform is unambiguously *feedback* rather than decoration.
4. **Work cards**: no lift - the grid is hairline-separated, and lifting one cell breaks the
   seam. Instead the title takes the accent and a chevron fades in. The pointer spotlight
   already carries the "this one is live" reading.
5. **Stat figures**: nothing. They are evidence, and animating a number invites the reader
   to watch the animation instead of reading the number.
6. **The email**: click to copy, label swaps to "Copied" for 1.6s. The only *new* behaviour
   rather than a polish pass, and the only one that does something useful.

Everything sits behind `@media (prefers-reduced-motion: no-preference)` or uses properties
that degrade to an instant state change.
