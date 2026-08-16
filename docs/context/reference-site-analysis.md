---
topic: reference-site-analysis
updated: 2026-08-16
---

# keremkeptig.info - what the reference site actually is

Alp's friend Kerem Keptiğ's site was the starting brief ("get inspired, we can do
better"). Analysed 2026-08-16 by fetching all five routes and screenshotting them.
Recorded because re-deriving it costs an afternoon, and because several design
decisions here were made against it.

## It is three different sites wearing one name

The single most useful finding. Styling is inconsistent per route:

| Route | Styling |
|---|---|
| `/` | Tailwind via `cdn.tailwindcss.com` + Lucide icons - redesigned, 2026 |
| `/projects`, `/blogs` | Boxicons + hand-rolled CSS |
| `/about`, `/myjourney` | hand-rolled `about.css`, `animations.css`, `experience.css` |
| `/contact` | **Bootstrap 5** + Popper |

Nav markup differs between them and the footers still read `© 2024`. The homepage was
redesigned; the rest was not. The polished first impression breaks on the first click.

**This is why "one design system across every route" is the primary quality bar for
alpozer.dev**, ahead of any individual visual flourish.

## Concrete technical faults, worth not repeating

- `cdn.tailwindcss.com` is explicitly not for production. It ships a CSS compiler to
  every visitor and generates styles at runtime, so **with JS disabled the page has no
  styling at all**, and there is a flash of unstyled content on every cold load.
- Google Fonts are hotlinked. For a site operated from Germany that is live GDPR
  exposure (LG München, 2022). Self-hosting is the fix and nobody does it.
- The background particle canvas is an O(n²) loop: 60 nodes = 1,770 distance checks per
  frame at 60fps, forever. **The implementation is the fault here, not the effect** - see
  the correction below, which reverses an earlier reading of this line.
- Content is thin. Three project cards linking straight out to GitHub, so there is
  nothing to read on the site itself.

## Correction, 2026-08-16: the particle background is a feature, not a fault

Alp overruled this file directly:

> "WE DO NOT CRITICIZE KEREM'S O(n²) PARTICLE LOOP ANYMORE, IT'S COOL!!!! WE LIKE THAT KIND
> OF REVOLVING THING"

This entry previously listed the particle canvas alongside the CDN Tailwind and hotlinked
fonts as something to avoid, and `visual-direction.md` carried it forward as a constraint on
any motion work. **That was wrong and is withdrawn.** The drifting, revolving field of
connected nodes is now a named deliverable for alpozer.dev, not an anti-pattern.

What survives of the original criticism is narrow and purely about implementation: naive
all-pairs neighbour-finding on the main thread, forever, is expensive, and Alp works on a
4 GB Surface Laptop Go. The effect is wanted; the same look comes out of a uniform spatial
hash or grid bucketing at a fraction of the cost, with the field paused when off-screen or
on a hidden tab. **Deliver the aesthetic, engineer away the burn - do not water the effect
down in the name of restraint.**

The two genuine faults in the list above - the CDN and the hotlinked fonts - are unaffected.

## What is genuinely good and was deliberately copied

Initial judgement from the homepage alone was too harsh. On full inspection:

- **The `/myjourney` timeline is the best thing on the site**: a sticky left rail that
  tracks scroll position through a list of roles. Copied into `/journey`, reimplemented
  with `IntersectionObserver` and a no-JS fallback to a plain anchor list.
- The overall information architecture is sound - projects with filters, blog with tags
  and excerpts, journey timeline, homepage pulling previews from each. Adopted, then
  deepened with `/work/<slug>` case studies, which is the gap his site leaves open.

## Alp's stated goal, in his words

Not to beat Kerem. To get inspired by him and by other engineers' sites, and to **tell
his story, his goals, and where he is heading**, with a neat design. The trajectory is
the point, not the inventory. This is why `/journey`, `/about` and `/now` exist and are
weighted as heavily as `/work`.
