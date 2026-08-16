# Design record - personal website

Written 2026-08-16. Direction chosen, scaffold built and committed (`d10f8fc`).
Companion file: `reference-site-analysis.md`.

## Where this stands

Astro scaffold is complete and builds clean: 14 routes, six projects with case-study
pages, one post, five journey entries, `/about`, `/now`, RSS, sitemap, 404.

**Remaining buckets, in order:**

1. **Repo-reading pass.** Rewrite each case study from the actual repositories
   (`advocate`, `sage`, `atlas`, `munich-apartment-agent`, `voice-scheduler`,
   `youtube-mcp-server`, `nemotron-mcp`) around the real decision and the real
   trade-off. The current bodies are written from `master_resume_en.md` - accurate but
   shallow, describing what each system does rather than what happened while building
   it. Alp has explicitly authorised reading and reshaping the projects for
   presentation.
2. **Blog posts.** One sample written (`your-rag-has-no-baseline`) to establish register.
   Topics should carry Alp's own opinions, not inferred ones.
3. **Motion pass.** See below.
4. **Deploy.** Register `alpozer.dev`, Cloudflare Pages, CI gate on broken links and
   accessibility regressions.

## Motion and dynamism - direction added 2026-08-16

Alp's reaction to the built editorial site: *"For a start, it is not that bad. But we
want more dynamism as like Kerem is having, moving shapes in background is not a bad
idea. But we can go there step by step."*

So the editorial direction stands, but it is currently **too static for his taste** and
needs animated background elements. Constraints when adding them:

- **Incremental.** He said step by step. Add one motion element, show it, iterate. Do
  not deliver a motion overhaul in one pass.
- Must not reintroduce what was criticised in the reference site: no forever-running
  O(n²) canvas loop, no blurred glow blobs, no competing simultaneous effects.
- Invariants 3 and 5 still bind: the page must work with JS disabled, and every
  animation must be suppressed under `prefers-reduced-motion`.
- Editorial restraint is the reason direction A was chosen over the atmospheric
  mockup. The motion should read as considered, not as decoration bolted on. Prefer one
  well-made element over several.

Candidate approaches not yet evaluated with him: a slow generative field rendered once
to SVG or canvas with a frame budget; scroll-linked transforms via CSS
`animation-timeline` (no JS); a subtle grain or gradient that drifts; type or rule
animations on section entry. `mockups/b-atmospheric.html` has a working pointer-spotlight
implementation that could be adapted at lower intensity.

## Goal

A hiring manager, a peer engineer, or a future collaborator lands on this site and,
within a minute, understands what Alp builds, believes he can build it, and knows where
he is heading next. Anyone who wants to go deeper has somewhere to go.

The sentence that survives every technology change: **the site's job is to convert a
stranger into someone who trusts the work, using the work itself as the evidence.**

Secondary, and explicitly stated by Alp: it tells a story - where he came from, what he
is aiming at, what he is learning now. This is not a CV in HTML. The trajectory is the
point, not the inventory.

## Invariants

1. **No private data crosses into the public repo.** Public: name, city, email, LinkedIn,
   GitHub. Never: phone number, postal address, `advocate-data` dossier caveats,
   application history, employer-internal detail.
2. **Every factual claim on the site traces to a dossier claim id.** If it is not in
   `advocate-data/EVIDENCE_DOSSIER.md`, it does not go on the site. Same rule `advocate`
   already enforces for generated CVs.
3. **The page works with zero JavaScript.** Content, navigation and reading are HTML and
   CSS. JS is enhancement only. This is the single biggest differentiator from the
   reference site, which renders unstyled without JS.
4. **Nothing loads from a third-party origin at runtime.** No CDN Tailwind, no hotlinked
   Google Fonts, no icon CDN. Self-hosted, subset, versioned. Privacy and GDPR (the site
   is operated from Germany), plus the site does not break when someone else's CDN does.
5. **Every animation respects `prefers-reduced-motion`; the site is AA-contrast in both
   themes.**
6. **Content is data, not markup.** A new project or post is a Markdown file with
   schema-validated frontmatter, never a hand-edited HTML section.

## Components

| Component | Own reason to change | Failure mode | Correctness criterion |
|---|---|---|---|
| Content store (`src/content/`) | a new post or project | malformed frontmatter | Zod schema passes at build |
| Design system (tokens + primitives) | visual identity | drifting spacing and colour | contrast audit + token-only colours |
| Route/page layer | a new section | broken internal link | link check in CI |
| Enhancement islands | interaction polish | JS fails, page still reads | verified with JS disabled |
| Build + deploy | hosting change | failed deploy | Lighthouse + a11y gate in CI |
| Claim-trace checker (dev only) | dossier corrections | dossier absent, skips | every `claim:` id resolves and is not superseded |

## Seams

| Seam | Carrier | Contract | Direction | Failure | Ordering |
|---|---|---|---|---|---|
| dossier → site content | **human promotion**, not code | a cleared fact + its claim id in frontmatter | site depends on nothing at build | n/a - site is self-contained | n/a |
| site content → pages | Astro content collections | Zod-validated frontmatter | pages depend on schema | build fails loudly on bad frontmatter | build-time, total |
| repo → deploy | git push + CI | built `dist/` | deploy depends on repo | last good deploy stays live | one deploy per commit |
| site content → checker | dev-only script reading a local `advocate-data` | claim ids | checker depends on both, nothing depends on checker | absent dossier, skip with a notice | on demand |

The dossier seam is the one that matters. It is deliberately **not** automated.

## Autonomy

Every component is build-time and deterministic. Nothing on this site takes an
outward-facing action, so nothing needs a gate - except publishing itself, which is
human-triggered by a git push.

## Rejected alternatives

- **Build-time import from `advocate-data`.** The site build reads
  `../advocate-data/claims/claims.yaml` directly. Rejected: couples a public repo's build
  to a private sibling checkout (breaks CI, breaks any clone), and puts a personal-data
  leak one glob away. A trust boundary should not be crossed by a build script.
- **Hand-maintained duplication with no traceability.** Simplest, but the dossier has
  already been corrected repeatedly with supersede notes; the site would silently keep
  stating superseded facts. Claim ids cost one frontmatter line and make drift findable.
- **Next.js.** Ships 10-30x the JavaScript for a site that is 95% prose, and has no
  built-in equivalent of content collections. Chosen: **Astro 7.2**, static, islands only.
- **Tailwind via CDN** (what the reference site does). Explicitly not for production:
  ships a CSS compiler to every visitor and leaves the page unstyled without JS.
- **Tailwind v4 at build time.** This was the original choice and it was changed after
  the mockups were built. Astro scopes component styles automatically, which removes the
  naming-collision problem Tailwind mainly solves, and this site has roughly ten
  components. Plain CSS over the token layer produces smaller output, keeps the markup
  readable, and removes a build dependency. Chosen: **hand-written CSS, scoped per
  component, with every colour and size coming from `src/styles/tokens.css`.** If a raw
  hex or px value appears in a component, that is the bug this decision is guarding against.
- **A single-page site.** Rejected: the story needs room, and separate routes for work,
  writing and journey are what make individual pieces linkable and shareable.

## Information architecture

Adopted from the reference site, which gets this right, then deepened:

- `/` - hero statement, selected work, latest writing, current focus
- `/work` - project index, filterable
- `/work/<slug>` - **case study** per project. This is the main upgrade: the reference
  site's cards link straight out to GitHub, so there is nothing to read. Each of these
  is a real write-up - problem, architecture decision, what was measured, what it cost.
- `/writing` - post index
- `/writing/<slug>` - post
- `/journey` - timeline with a sticky rail that tracks scroll (the best interaction on
  the reference site, worth taking)
- `/about` - the story, the goals, where this is heading
- `/now` - what is being worked on this month, dated

## Decisions taken

1. **Design direction: A, editorial.** Light-first warm paper, Newsreader display serif,
   Inter body, ruled index lists, single deep-blue accent. Dark mode is a designed
   palette, not an inversion. Mockups kept in `mockups/` for reference.
2. **Domain: `alpozer.dev`**, confirmed available 2026-08-16 (as were `alpozer.com` and
   `alpozer.de`). Not yet registered.

## Open questions for Alp

1. ~~**Flexus end date.**~~ Resolved 2026-08-16 by Alp: Flexus ended **July 2026**; the
   dossier was right and `master_resume_en.md` was wrong. The résumé has been corrected
   to `03/2023 – 07/2026`. The site already stated July 2026, so no site change needed.
2. **Claim coverage.** `npm run check:claims` reports 10 of 11 public facts unresolved,
   because `claims/claims.yaml` holds only 15 entries and is an acknowledged partial
   migration of `EVIDENCE_DOSSIER.md`. The facts themselves are in the dossier prose; the
   IDs do not exist yet. Either extend the claim store, or accept the check as advisory
   until the migration completes.
3. **Hosting.** Cloudflare Pages assumed but not set up.
