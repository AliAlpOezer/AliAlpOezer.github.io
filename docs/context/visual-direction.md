---
topic: visual-direction
updated: 2026-08-16
---

Companion files: `design-record.md` (goal, invariants, components, decisions),
`reference-site-analysis.md` (what `keremkeptig.info` actually is, and what was
deliberately copied from it).

## The priority inverted on 2026-08-16: visual quality now outranks the remaining content buckets

Alp, after seeing the rewritten case studies:

> "I guess I will polish the context of the projects, but it is still far away from how
> Kerem's website looks like. His website is much more beautiful. [...] I want to persuade
> you, that our priority is that the webpage is being astonishing."

Read that as a re-ordering of the buckets in `design-record.md`, not as a complaint about
the copy. The remaining order is now: **visual/interaction pass first**, then blog posts,
then deploy. Content quality is no longer the bottleneck he perceives.

## "Step by step" is superseded. He asked for the full pass.

Earlier the same day the recorded constraint was incremental motion - one element, shown,
iterated. He has now explicitly withdrawn that:

> "I don't care if it's costing a lot of compute. We don't care."

Do not cite the incremental-motion constraint back at him. It was his instruction and he
replaced it.

**Two of the three constraints that used to sit here are also withdrawn as of 2026-08-16.**
The line previously read "no forever-running O(n²) canvas loop, no blurred glow blobs, no
several competing effects at once". Alp has since ruled that the reference site's particle
field is *wanted*, so the first clause no longer stands as an aesthetic constraint - only as
an engineering note. See "The background is now a named deliverable" below and the correction
in `reference-site-analysis.md`. Still standing: no blurred glow blobs, and no several
competing effects at once.

## Page weight is explicitly permitted. JS-dependence still is not.

> "If somebody ever will going to visit it, it will going to be an HR, so it doesn't matter
> if the webpage is being heavy."

Accepted: a heavy, asset-rich, animation-rich page is in scope. Large self-hosted images,
video, a real font stack, generous JS for interaction.

**This does not release invariants 3 and 5**, and it does not need to. They are orthogonal
to weight:

- **Invariant 3 (works with zero JS)** is about *what renders*, not how much ships. A
  statically rendered page with lavish progressive enhancement satisfies both "astonishing"
  and "readable with JS off". The reference site fails this by rendering unstyled without
  JS, which is the single fault the analysis file singles out. Beating it visually while
  repeating its worst technical fault would be a bad trade.
- **Invariant 5 (`prefers-reduced-motion`)** costs one media query per animation and is an
  accessibility floor, not a restraint on the default experience.
- **Invariant 4 (nothing from a third-party origin at runtime)** is the one that will
  actually bite this pass. Self-host every font, image, video and library. No CDN.

### Alp's ruling on this, 2026-08-16

He was asked and answered directly:

> "Be pragmatic and do the rendering with JS if we need. You can also lazy load. [...] If
> you can reach the same faster, then you are allowed to do it in the best practise way.
> If not, do not compromise on beauty. That's a muscle show off store baby!!"

**The rule is therefore: beauty wins ties, and best practice is only mandatory when it is
free.** Applied to each invariant:

- **Invariant 3 stays, because in Astro it is free.** Static HTML is the default output;
  interactivity is added as islands on top. Server-rendering the content costs nothing and
  removes nothing - it is not a restraint, it is just what the framework already does. No
  effect gets dropped for it. Where an effect genuinely cannot exist without JS (a WebGL
  field, a scroll-driven canvas), it simply does not render without JS, and the page still
  reads. That is the correct outcome, not a compromise.
- **Invariant 5 stays** - one media query per animation.
- **Invariant 4 (self-host everything) stays**, and lazy-loading is the tool that makes it
  affordable at the weight he wants.

The concrete reason this is not purity, and the one worth remembering: the audience is HR.
Corporate proxies, mail-client link previews and some ATS tooling strip or fail JS. A
portfolio that renders blank in that environment scores zero, and the failure is invisible
from Alp's own browser. Costing nothing to prevent, it stays prevented.

**If any specific effect ever forces a real choice between the two, beauty wins.** That is
the standing instruction; do not come back to ask again.

## Four things he asked for by name

1. **A visible stack display.** What he liked most on the reference site: the technologies
   he uses, or has ever worked with, shown as a visible surface rather than buried in
   project frontmatter. Note the scope - "has ever seen" is broader than "used in a shipped
   project", so this is not just an aggregation of the `stack:` arrays.
2. **A logo, taking the LangChain logo as inspiration.** He named this specifically as
   something Kerem has and he wants. Not yet decided: glyph vs wordmark, and how far
   "inspired by" goes before it is derivative.
3. **Apple-grade web design practice.** He asked for this to be researched, not guessed at:
   > "CHECK THE BEAUTIFUL WEBPAGE DESIGN PRACTICES, AND HOW APPLE DESIGN ITS WEBPAGE."
4. **More interactive**, with the reference site as the bar to clear.

## Content pivot: lead with method, not with inventory

> "More than representing the projects I am holding (because I don't have that much projects
> as Kerem is having), we can share my experiences, my methods."

This is a real strategic call and it is correct: competing on project count is a losing
comparison, competing on how he works is not. Topics he named, to develop later - he said
he will lean into this further, so treat these as seeds rather than a spec:

- Obsidian, and how he uses it
- The LLM-wiki pattern / Google-OKF-styled knowledge base (he already runs this in
  `munich-apartment-agent` and via the `document` skill)
- Why he got into RAG
- His roadmap to becoming an AI engineer (the 16-week sprint)

This likely means new routes or a reshaped `/about` and `/journey`, not just new posts.
Architecture decision, not a content decision - worth running through `system-design`
before building.

## Blog direction: the AI field, not only his own work

Named topics: running small models on very constrained hardware (ESP32 with ~16 MB RAM),
Kolibri, `llama.cpp`, how the attention mechanism works.

Note this widens the register set beyond `your-rag-has-no-baseline`, which is a
first-person "here is what I measured" piece. Explainers about the field are a different
voice, and `design-record.md` already records that posts must carry Alp's own opinions
rather than inferred ones - which is harder for an explainer than for a war story. Worth
deciding deliberately whether these are explainers, opinion pieces, or build logs.

## Open research task, not yet started

He asked for a web search on how to produce aesthetically strong photography and video for
a site like this. Nothing has been researched yet - this is the first task of the next
session, alongside the Apple/design-practice research above. Both are `web-researcher`
work.

## Ruled on by Alp, 2026-08-16 (all three questions closed)

1. **Identity is a full reset.** Direction A is binned. Warm paper, Newsreader and Inter
   are no longer assumed - the pairing and palette are open again, to be decided from
   coded prototypes judged in a browser rather than argued in the abstract. This is the
   Apple method as researched: make, test, throw away.
2. **`b-atmospheric` contributes its signature element only.** The pointer-spotlight card
   grid is ported; the rest of that mockup stays rejected. One well-made effect, not a
   decoration layer.
3. **"Interactive" means all four**, in this order: scroll-driven storytelling, pointer
   and hover response, the stack display as an interactive centrepiece, and real live
   demos of the projects. The fourth is the expensive one and the only one that needs a
   backend - it is an architecture decision, not a design one, and is not yet designed.

## Research findings, 2026-08-16 (the pass Alp asked for by name)

**Apple.** The four published principles are clarity, deference, depth, consistency;
deference is the operative one - the interface never competes with the content. What
apple.com actually does: typography carries the identity (tracking tightens as size grows,
about `-0.28px` at a 56px hero against `-0.374px` at 17px body); one accent; no decorative
gradients anywhere; a single shadow recipe; rhythm from full-bleed section flips where the
colour change *is* the divider; ~980px text measure, 80px section padding; sticky nav at
`saturate(180%) blur(20px)`. The signature interaction is a scroll-pinned canvas image
sequence. **Caveat: those numbers come from third-party teardowns of apple.com, not from
Apple.** The published HIG covers app UI, not the marketing site. Treat them as measured.

On method: "designing and making are inseparable", and every product went through dozens of
discarded models. That is why the identity decision is being made from coded prototypes.

**Award tier, 2026.** Immersive 3D/WebGL now takes 61% of Awwwards Site of the Day in Q1
2026, up from 23% in 2024, and scores 8.7/10 on creativity against 6.4 for flat layouts.
That lane is real but crowded, and it is a different sport from "an HR reader trusts this
engineer in 60 seconds". The transferable winner is Uncommon Studio's pattern: a confident
grid that breaks at chosen moments, with section transitions that read as camera moves.

**Motion tech.** Native CSS scroll-driven animations are viable (Chrome/Edge 115+,
Safari 18+, Firefox 132+, ~84-90% support). `view()` for element-enters-viewport, `scroll()`
for page progress, `animation-range` for the window. Compositor-safe means transform and
opacity only. This buys most of the Apple feel with **zero JS**, so invariants 3 and 5 cost
nothing - GSAP plus canvas is needed only for a true pinned image sequence.

**Photography and video.** Colour grading is the biggest "looks expensive" lever, and
consistency across the whole set is the signature; understated, no teal-and-orange. For
self-hosting under invariant 4: list WebM/AV1 `<source>` **before** the MP4/H.264 fallback,
because the browser takes the first format it supports rather than the best; 1080p WebM at
CRF 31-33, two-pass, 1500-2500 kbps, 2s keyframes; `muted` and `playsinline` are mandatory
for autoplay; the poster frame counts toward LCP. The conclusion that matters: for a
technical portfolio the imagery is mostly **not** photography of a person. Consistently
graded capture of his own running systems is stronger evidence and cheaper to produce than
a branding shoot. One good portrait, then let the work be the imagery.

## Where the prototypes stand

Three coded identity prototypes, served with **real self-hosted webfonts** so type is judged
honestly - the older `a-editorial` and `b-atmospheric` render in system fonts, which
probably made direction A look flatter than it is.

    npm run mockups     ->  http://localhost:4330/

| File | Direction | Type | Register |
|---|---|---|---|
| `mockups/c-quiet.html` | Apple lineage | Instrument Sans, single family | light, achromatic, one blue, full-bleed section flips |
| `mockups/d-console.html` | technical | JetBrains Mono + Inter | dark-first, hairline grid, amber, data-dense |
| `mockups/e-broadsheet.html` | editorial with teeth | Bodoni Moda + Archivo | stark paper/black, vermilion, Didone at display scale |

Each carries the same real project content, the ported pointer spotlight, native
scroll-driven reveals, and a working interactive stack display with a shipped/explored
split (the "has ever seen" scope Alp asked for). Each also proposes a **different logo**,
so the logo deliverable is being explored inside the identity decision rather than after it:
C an A assembled from detached links, D an A set in brackets, E the Ö of Özer drawn as a
true Didone with its umlaut as the two-node motif.

**Known constraint, deliberate:** above-the-fold content is never scroll-linked. An element
already in view at load sits at whatever progress its range maps to and paints
half-finished, so hero content uses a time-based intro and only below-fold sections use
`view()`. This bug was live in the first cut and is worth not reintroducing.

Supporting scripts, both throwaway: `scripts/fetch-proto-fonts.mjs` (prototype-only
families into `mockups/fonts/`, kept out of the production `fetch-fonts.mjs`) and
`scripts/serve-mockups.mjs` (zero-dep static server; needed because Chrome refuses webfonts
over `file://`). Delete both once a direction is chosen and its families are promoted.

## Second pass, 2026-08-16: all three built out to full pages

One screen of hero could not carry an identity decision, so each prototype now runs
hero → work → **set piece** → stack → method → journey → writing → contact → footer,
with the same real content in all three. Two of the four "interactive" items Alp ranked
are now actually built (scroll-driven storytelling, pointer and hover response); the stack
display was already there; live demos remain unbuilt and still need an architecture
decision.

### The set piece is the same story told three ways

All three open up **one real system** - the Munich agent's six-stage cycle - as a pinned
stage whose visual advances while the copy scrolls past it. Same content, same structure,
deliberately different execution, because that is the thing being chosen:

| | Pinned element | What it is trying to prove |
|---|---|---|
| C | a black product panel, rail of six nodes, connector filling as it goes | Apple's move: the interface defers, the object does the talking |
| D | an execution trace with timings, return codes and a stage counter | you are looking over an engineer's shoulder at their own instrument |
| E | a Didone numeral at ~9.5rem with the stage name in vermilion italic | the one thing neither of the others can do at all |

E's exhibit is the strongest single image across the three. D's trace is the most
convincing to an engineer reader. C's panel is the most restrained and the easiest to
extend to other pages.

### Content added, and where it came from

`method` is the content pivot Alp named - a knowledge base per repo, Obsidian, why
retrieval, the sixteen-week program - written from `journey/ai-engineering-program.md` and
this file. `journey` uses the five real entries with the sticky rail taken from the
reference site. `writing` teases the one real post. **These are seeds, not final copy**;
he said he would lean into the method material further.

### Deliberate limitation: the prototypes render blank without JS

Verified with `--blink-settings=scriptEnabled=false`: with JS off the pages show the header,
the section chrome and an empty panel. Every list is built from a JS array.

This is **not** a decision to abandon invariant 3, and it is not the reference site's fault
repeated. In Astro the same content comes from content collections and is emitted as static
HTML at build time; only the observers and pointer handlers stay as islands. Making the
prototypes static would triple their length and slow down exactly the iteration they exist
for, and it would not change the decision being made, which is about type, colour and the
set piece. **What it does mean: invariant 3 is currently unproven, and the promotion of a
chosen direction into `src/` is the step that has to prove it.** Re-run the no-JS check
then, not now.

### Bugs found by screenshotting, worth not reintroducing

1. **`.step p` outranks `.eyebrow` / `.kicker`.** A class selector loses to
   class-plus-element. It silently repainted every stage label muted grey in C and E, and
   had already done the same to the journey organisation line. Specificity, not a typo -
   it will happen again wherever a scoped `element` rule sits below a bare utility class.
2. **A sticky element bottoms out during its last step.** The pinned stage scrolled half
   out of frame while stage 06 was still being read. Fixed with `padding-bottom: 14vh` on
   the steps column so the container outlives the last step.
3. **`auto-fit` with a known item count.** Four method cards in a 3-up `auto-fit` grid left
   two empty cells, and the 1px hairline background showed through them as a grey block.
   State the column count when you know it.
4. **A frosted light header over a full-bleed dark section reads as a broken overlay.**
   Both C and E now invert the bar, driven by a 1px observation line at the header's
   midpoint, rebuilt on resize.
5. **An IntersectionObserver detection line leaves gaps.** Between two copy blocks nothing
   intersects, so arriving mid-section by anchor link or a restored scroll position left
   the panel stuck on whatever it showed last. Replaced in all three by measuring six rects
   for nearest-to-centre on a throttled passive scroll - no gaps, exact handover.

### The screenshot harness, and the trap in it

`scratchpad/shoot.mjs` drives Playwright's Chromium over raw CDP with no npm dependency
(Node 24 has a global `WebSocket`), taking viewport shots at scroll offsets.

**The trap that cost the most time here:** `window.scrollTo(0, y)` obeys
`scroll-behavior: smooth`, so every capture landed mid-scroll and froze transitions and
entry animations part-way. It looked exactly like a synchronisation bug in the page and led
to one real fix being made for the wrong reason. Always pass `behavior: 'instant'`. This
generalises to the existing note about `fullPage` screenshots: **capture a scroll-driven
page only from a settled scroll position.**

### Copy that must be checked before any of this is promoted

- The six pipeline stage descriptions are written from `munich-apartment-agent`'s summary
  and decision record, but the phrasing about the TLS fingerprint and the three portals is
  inferred from what `curl-cffi` is for. Verify against the repo.
- D's trace timings are **illustrative, not measured**. They exist so the trace reads as a
  trace. Replace with real numbers from the agent's logs or drop the column.
- `hello@alpozer.dev` is a placeholder on an unregistered domain; the LinkedIn link is `#`.
- "If you are hiring for this, I would like to hear from you" is a claim about intent that
  Alp should confirm he wants stated that directly.

## The background is now a named deliverable, 2026-08-16

Alp chose **direction C** ("I liked c the most") and immediately added a requirement:

> "I want you to implement background moving stuff like kerem is having. [...] WE LIKE THAT
> KIND OF REVOLVING THING"

So the brief is a **living, drifting, revolving field of connected nodes** - the
constellation/particle-mesh family from `keremkeptig.info` - built into C. This is decided,
not open. Do not propose replacing it with something calmer, and do not argue that a moving
background is undisciplined; that argument was made, heard, and overruled.

**What is actually hard about it, and where the effort goes:**

1. **It has to work on three backgrounds.** C flips full-bleed between white, parchment
   `#f5f5f7` and near-black `#1d1d1f`. Most particle fields on the web are designed for a
   dark hero and read as dirt on white. The field must be built for the light bands first,
   not adapted to them afterwards.
2. **Palette discipline still binds.** Achromatic greys or the single blue
   (`#0066cc` / `#2997ff`). Colour is not what makes this good.
3. **The burn is the engineering problem, not the effect.** Naive all-pairs is 1,770 checks
   a frame at 60 nodes. A uniform spatial hash or grid buckets gives an identical picture far
   cheaper; batch all segments into one canvas path rather than one per line; cap the frame
   rate for slow drift; pause on `IntersectionObserver` and `visibilitychange`; be careful
   with `devicePixelRatio` on a full-bleed canvas. Target is a 4 GB Surface Laptop Go.
4. **Invariants 3, 4 and 5 are untouched.** Vendored and self-hosted, suppressed under
   `prefers-reduced-motion`, and the page reads with the canvas absent.
5. **The failure mode to design against is looking dated** - a 2014 startup landing page.
   The audience is HR and hiring engineers.

Research on how to build it ran as a seven-agent workflow (five survey lenses, an adversarial
vet, then a synthesis). Its script is worth keeping as the template for this kind of pass:
`~/.claude/projects/C--Users-alial-dev-website/.../workflows/scripts/c-background-motion-*.js`.

**Process note worth not repeating:** the first launch of that workflow carried the old
"particle mesh is rejected" line in its brief, which would have made all five lenses research
the wrong question. It had to be stopped and relaunched. When a recorded constraint is
overruled, fix the context packs *before* spending agents against them.

## Quiet Field: the background, built 2026-08-16

Live in `mockups/c-quiet.html` on the hero (white) and the closing `.band--tile` (near-black).
Deliberately **not** on the pinned-run band - a field behind the set piece is two effects
competing, which is still a standing constraint.

**What makes it different from the reference**, and the whole reason it is not just a
particle plugin: velocity is the curl of a single divergence-free Perlin potential, so
neighbouring nodes lean the *same* way and the streams rearrange over ~90s. Per-node random
velocity with wall bounce - the usual implementation, and the reference's - has no coherence
between neighbours, which is exactly why that version reads as gas rather than as a field.
Three depth layers then curve around their own off-screen centres with the middle one
**counter-rotating**, which is what makes the parallax legible without speeding anything up.

**Two structural decisions that are not tuneable later:**

1. **Rotation is applied as a velocity term** (`ω × (p − c)`) with toroidal wrap on a domain
   overscanned by 100px, never by rotating stored positions. Position-rotation slowly drains
   the composition out of one corner over several minutes - invisible in a short review,
   obvious to anyone who leaves the tab open.
2. **The canvas is section-scoped, not full-bleed.** A canvas spanning the whole page is
   always intersecting, which makes the `IntersectionObserver` pause dead code.

**Measured, not asserted** (headless Chrome, 1440×681, `?qfdebug` exposes the handle):

| | |
|---|---|
| `beginPath` calls per frame | **5**, for 428 links |
| Frame cost | **1.19 ms** |
| Max node degree | 5 (cap binding) |
| Driver while scrolled past | stopped; dark band `visible: false` at scroll 0 |
| Under `prefers-reduced-motion` | **0 canvases, 0 fields, no rAF** |

The `beginPath` count is the number that matters. Distance-faded link alpha is a continuous
float, and applying it per segment defeats batching entirely - that is how tsParticles ends
up emitting ~450 stroke calls a frame in exactly the config that produces this look. Alpha is
quantised into six buckets instead, so the whole frame is at most six paths. **If that number
ever climbs, the effect has silently reverted to the expensive version.** Check it before
believing any later refactor.

**Two fixes the screenshots forced**, both invisible in code review:

- The hero was `<section class="hero wrap">`, so the canvas was clipped to the 1120px text
  column and the field ended in a vertical edge either side. The wrap moved inside.
- A section's height is not final when the canvas is built - the webfonts land afterwards and
  reflow the copy, leaving a stale backing store. Fixed with a `ResizeObserver`;
  `document.fonts.ready` alone still misses late reflows.
- On white the section below the hero is *also* white, so an unmasked canvas ended in a hard
  horizontal cut across the page. The light host gets a `mask-image` dissolve. The dark band
  needs none, because there the colour flip is already the divider.

**Rejected, do not re-propose** (full reasoning in the workflow result): tsParticles (43.1 KB
gzip measured, and its config cannot express curl drift or layered rotation); particles.js
(dead, hardcoded all-pairs); Delaunay/Voronoi as the connection primitive (a triangulation
connects everything always, so links never breathe - and unfiltered it reads as the 2015
low-poly hero); three.js/OGL/raw WebGL point rendering (GPU-side motion leaves the CPU with no
positions, so no neighbour graph and therefore no lines at all); OffscreenCanvas + worker
(nothing to move at 1.2 ms/frame); alpha WebM (software-decode fallback is the exact burn this
avoids). Also settled: **no Awwwards/FWA site in this register could be verified - do not let a
later pass fill that gap with a guessed name.**

Still open: `Depth Cloud` (rank 2) is a genuine 3-D slab rotating on a tilted axis - more
literally "revolving", but with silhouette pile-up and closer to the sci-fi trope. Worth
building as a second experiment on the real hero and judging side by side, not instead.
