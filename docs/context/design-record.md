# Design record - personal website

Written 2026-08-16. Direction chosen, scaffold built and committed (`d10f8fc`).
Companion file: `reference-site-analysis.md`.

## First deployment - 2026-10-06

Alp asked to ship the current state and keep improving it live. The site deploys to GitHub Pages as the user site `AliAlpOezer/AliAlpOezer.github.io`, served at `https://alialpoezer.github.io/` by `.github/workflows/deploy.yml` on every push to `main`. That workflow runs `npm run build`, so the CV file check gates each deploy. A user site serves from the root, so no Astro `base` is needed and absolute links keep working. `SITE.url`, `astro.config.mjs`, the public CV and `og-default.png` all name this origin, because `alpozer.dev` is still unregistered and a link to it would be dead. Rejected: a project site under `/website/`, because every root-relative link would need a base prefix. Superseded: the earlier Cloudflare Pages plan, which needed the domain first. Cost accepted: the repository has to be public on the free plan, so `docs/` and `mockups/` are public too, which invariant 1 already allows. When the domain is registered, add `public/CNAME` and change those four places.

## Homepage brief correction - 2026-10-06

Alp clarified that a visitor arrives to learn who he is as well as what he builds. The one-line anonymous hero was too sparse. Keep a concise name, agentic-systems focus, relevant enterprise background, real product UI, and a public CV download in the first part of the homepage. The full biography still belongs on `/about`. The chosen Quiet identity and static Astro content remain; the Kerem reference informs image-led hierarchy, not a wholesale color or code copy. Rejected: a biography dump in the hero, because the work must remain visible in the first viewport. Cost accepted: the hero has to balance a personal introduction with a product image at both desktop and mobile widths.

## Public CV boundary - 2026-10-06

Goal: a visitor can download a concise, accurate CV without receiving private application data or stale claims. This is a public portfolio artifact, not an export of an employer-specific application.

Invariants: (1) The public CV contains only the contact fields already permitted on this site, enforced by reviewing the editable source and extracted PDF text. (2) Its project statements must agree with the current case studies, enforced by a manual content comparison before regeneration. (3) The download always resolves to a real, readable PDF, enforced by a build-time file check and a post-build PDF extraction/render check.

| Component | Owns | Autonomy | Failure |
|---|---|---|---|
| Private Advocate Data | Historical evidence and tailored applications | Human-triggered | Unavailable: the public site still builds |
| Public CV source | Deliberately selected, employer-neutral claims and contact fields | Human-triggered | Missing or stale: do not regenerate the PDF |
| PDF renderer | Deterministic source-to-PDF conversion | Human-triggered | Nonzero exit or bad output: keep the prior artifact and do not update the link |
| Website | Download link to the reviewed local PDF | Autonomous static build | Missing PDF: build verification fails |

Seams: the private source is consulted manually, never imported by the website build; the public source is a versioned HTML file; the renderer writes a versioned local PDF; the homepage links only to that PDF. Dependency points from public content to reviewed facts, never from the static build into the private repository. Repeated rendering replaces only the named generated PDF after review; a malformed input or renderer failure cannot silently publish a different application PDF.

Decision: create a public, employer-neutral CV using current portfolio facts. Rejected: copying the most recent tailored PDF, because it includes a private phone number and employer-specific framing. Rejected: copying `master_resume_en.md` as-is, because its project stack and deployment details conflict with current case studies. Cost accepted: the public CV must be manually updated when portfolio facts change. The site remains local until the owner chooses to publish it.

## Project evidence and media - 2026-10-06

Goal: a visitor can see the value of shipped work before deciding whether to read its implementation.

Invariants: (1) Screenshots are captured from real project UI, never fabricated; the content editor verifies the source before copying an asset. (2) A private project's source URL never crosses into the public site; `repo` remains optional and `sourceReviewed: true` is required before the case-study template exposes it. (3) Each image has descriptive alt text and remains accessible without JavaScript; the content schema and static templates enforce this.

| Component | Owns | Failure behavior |
|---|---|---|
| Project content | Narrative, status, optional media captions and optional public links | Missing media leaves a text-first card; missing link leaves no source CTA |
| Local media assets | Versioned, self-hosted screenshots | Missing asset is caught by build/HTTP verification before publication |
| Astro views | The same media contract on home, index and case study | Static text and links still render without JavaScript |

The seam is project frontmatter `media: [{ src, alt, caption }]` into Astro's content schema and then into static HTML. The first image is the card cover; the full ordered set appears in the case study. Content owns ordering and alt text; templates own layout. A malformed entry fails schema validation rather than being silently omitted. Media assets live under `public/project-media/` so GitHub Pages can serve them directly. Pages only depend on parsed content, never on sibling repositories or private evidence files.

Decision: show Streamline through its actual demo UI, with no repository link. The user identifies it as the Munich EIT Water Hackathon team's second-place project, alongside an individual third-place student award. The organizer page establishes separate team and student award tracks but does not itself name winners, so this placement remains attributed to the user's firsthand report until a public result or certificate is available. Existing `repo` entries remain in content but are hidden until each source passes a visibility, documentation, structure, and secret-safety review. Rejected: linking the private repo, because screenshots communicate the product without exposing code. Rejected: generating UI mockups, because they would imply product states that may not exist. Cost accepted: each image needs a manual privacy and legibility review before publication.

Carried question: which other projects have representative, safe screenshots? Add them incrementally after reviewing each real interface, rather than inventing covers to fill the grid.

## Where this stands

Astro scaffold is complete and builds clean: 14 routes, six projects with case-study
pages, one post, five journey entries, `/about`, `/now`, RSS, sitemap, 404.

**Remaining buckets, in order:**

1. ~~**Repo-reading pass.**~~ Done 2026-08-16. See "Repo-reading pass" below.
2. **Visual and interaction pass.** Promoted to top priority by Alp on 2026-08-16, ahead
   of the two buckets below. Brief: `visual-direction.md`.
3. **Blog posts.** One sample written (`your-rag-has-no-baseline`) to establish register.
   Topics should carry Alp's own opinions, not inferred ones. Scope widened 2026-08-16 to
   include explainers about the AI field, not only his own work.
4. **Deploy.** Live on GitHub Pages since 2026-10-06 (see "First deployment"). Still
   open: register `alpozer.dev`, and add a CI gate on broken links and accessibility
   regressions.

## Repo-reading pass - done 2026-08-16

All six case studies rewritten from each repo's `docs/context/` pack plus the source
where the pack was thin. Source of truth was `decisions.md` and `gotchas.md` in each
repo, which is where the real trade-offs already live; `STATUS.md` fixed the honest
current state.

**What the pass corrected, not just deepened:**

- **Atlas had a fabricated feature.** The old body led on a "live per-request token and
  cost meter" as the thing worth keeping. There is no cost meter. `lib/models.ts` holds
  per-1M price metadata and nothing renders or computes spend; the only string asserting
  a cost meter is a canned entry inside the `kbLookup` tool fixture, i.e. test data.
  Also wrong: Sage is *not* "wired in as a callable tool". It is a separate `/ask` route
  behind a same-origin proxy, and keeping the two agent loops apart is a recorded
  decision.
- **Munich stack was stale.** Frontmatter listed Supabase and Docker. Supabase was
  deliberately removed for local SQLite; deployment is a systemd timer, not Docker. Also
  "running without me for months" overclaimed - it is roughly one month, with a known
  stuck-scraper bug still open, which the rewrite now states.
- **Voice Scheduler had two adapters, not three.** Hausarzt, dentist and restaurant.
- **Sage numbers were vague.** Real baseline is now on the page (faithfulness 0.948,
  answer_relevancy 0.620, context_precision 0.593, context_recall 0.679 over 36 triples).

**Status values re-derived from repo state:** `munich` live, `youtube-mcp-server` and
`voice-scheduler` and `atlas` shipped, `advocate` and `sage` building. Sage moved off
"shipped" because W6 optimisation is in flight and no eval run currently completes.

**Seventh project added as a draft.** `nemotron-mcp.md`, `draft: true`, so it does not
build until Alp decides. The repo is private on GitHub, so it carries no `repo:` link.
Content is deliberately scrubbed of the multi-account free-quota detail.

**Deliberately left out, for Alp to rule on:**

1. `voice-scheduler`'s German persona prompt instructs the agent to never reveal it is
   AI. Real disclosure expectations apply to a German booking line, and publishing that
   rule reads badly regardless. Not on the site; worth changing in the repo.
2. `advocate` application history (employers applied to) - invariant 1 forbids it, so no
   company names appear even where the repo's status notes are specific.
3. The home server's hostname and tailnet name are generalised to "a private network".
4. The public GitHub description of `munich-apartment-agent` still says "dedups to
   Supabase", which now contradicts the site. Fix it on GitHub.
5. `your-rag-has-no-baseline` claims the unanswerable pass rate "started at roughly
   zero". Sage's scorecard supports a related but different reading (those questions are
   correctly refused and score zero *on the relevancy metric*). Reconcile in bucket 2.

**Claim coverage is unchanged.** No claim IDs were added or altered, so
`npm run check:claims` still reports the same 10 unresolved references as before - see
open question 2. The rewrites add many technical facts about Alp's own repositories,
which are self-evidencing in a way dossier-backed biographical facts are not; whether
invariant 2 should extend to them is worth deciding explicitly.

## Repo visibility, checked 2026-08-16

Governs which case studies may carry a `repo:` link. Verified with `gh api`.

**Public:** `advocate`, `munich-apartment-agent`, `youtube-mcp-server`.
**Private:** `sage`, `atlas`, `voice-scheduler`, `nemotron-mcp`.

Re-check before adding a link; a 404 on a portfolio is worse than no link.

## Motion and dynamism - SUPERSEDED 2026-08-16 by `visual-direction.md`

Alp escalated this bucket the same day, from "step by step" to a full visual and
interaction pass at top priority, with page weight explicitly permitted. **Read
`visual-direction.md` before doing any design work** - it carries the current brief, what
he asked for by name, and the three questions he still needs to answer. The section below
is kept because its constraints on *how* to animate still hold; its framing of the bucket
as small and incremental does not.

### Original entry - direction added 2026-08-16

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

1. **Design direction: C, "Quiet".** Chosen by Alp 2026-08-16 after judging the three
   coded prototypes in a browser: *"I liked c the most."* Apple lineage - Instrument Sans
   as a single family at two optical registers, white / parchment `#f5f5f7` / near-black
   tile `#1d1d1f` as full-bleed section flips where the colour change is the divider, one
   accent (`#0066cc` light, `#2997ff` on dark), no decorative gradients, one shadow recipe.
   Logo: the A assembled from four detached links with the apex carrying the accent.
   Reference implementation is `mockups/c-quiet.html`; `d-console.html` and
   `e-broadsheet.html` are now rejected alternatives, kept for the record.

   **Not yet promoted.** `src/styles/tokens.css` still encodes the old direction A, so the
   built site and the chosen identity currently disagree. Promotion is the next structural
   task, and it is also what has to prove invariant 3 (see `visual-direction.md`).

   Two prior entries superseded: direction A (light-first warm paper, Newsreader + Inter,
   ruled index lists, deep-blue accent) was binned on 2026-08-16 when Alp ruled the identity
   a full reset; the three-prototype bake-off that replaced it is now itself resolved.

   **Amendment, same day:** Alp asked for an animated background - *"implement background
   moving stuff like kerem is having"* - explicitly funded as a multi-agent research pass.
   This does not reopen the direction; it adds a background layer that must hold C's
   restraint. Constraints and the shortlist land in `visual-direction.md`.
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

## Direction C promoted into `src/` - 2026-08-16

The site now runs on the chosen identity. `npm run dev`, or `npm run build &&
npm run preview`. 14 routes build clean.

**What changed:**

- **Fonts.** Newsreader + Inter out, **Instrument Sans** in - one family at two
  optical registers, the way SF Pro Display / SF Pro Text works. 92 KB total,
  down from ~330 KB. `scripts/fetch-fonts.mjs` regenerates it.
- **`tokens.css` rewritten.** Three grounds rather than two: page, sunk band,
  and a full-bleed near-black tile. The tile is a first-class surface here, not
  a dark-mode artefact - the homepage flips into it twice.
- **Dark mode is not an inversion.** It is the tile register the light theme
  already uses for its bands, promoted to the whole page. That is why it needed
  no separate design pass: it was already on the homepage.
- **New components:** `QuietField` (the background), `RunPanel` (the pinned
  six-stage set piece), `StackField`, `CopyButton`. Non-collection home data
  lives in `src/data/home.ts`.
- **Mono dropped from eight UI spots**, kept in `prose.css` where code wants it.

**Invariant 3 is now proven, not deferred.** Verified with
`--blink-settings=scriptEnabled=false`: with JS fully disabled the homepage
renders every project card, tagline and tag, the full-bleed bands, and all copy.
The prototypes rendered blank here, which was the one thing that had to change
on promotion. The islands are only the observers, the stack filter and the copy
button.

**Cross-component wiring verified on real data**, not by inspection: clicking
the LangGraph chip sets `aria-pressed`, writes "LangGraph ships in 2 projects:
Advocate, Munich Apartment Agent" into the readout, dims the four
non-matching cards and highlights both matching tags. `StackField` addresses the
cards by `data-stack` rather than importing them, so the two stay decoupled.

**Two header bugs found by screenshotting:**

1. The bar was too transparent (72%) to read against dense content scrolling
   under it. Now 88%, plus an `@supports not (backdrop-filter)` fallback to a
   fully opaque bar - the translucency only works because the blur smears what
   is behind it, and any renderer that skips that compositing pass leaves body
   text legible straight through the nav.
2. The `stuck` sentinel never fired. It observed `<main>` against a zero-height
   line at the viewport top, but `<main>` spans the whole document and therefore
   always intersects. Scroll position was the thing actually being asked about.

**Still open after this pass:**

- The inner routes (`/work`, `/writing`, `/journey`, `/about`, `/now`) inherit
  the new tokens and read coherently, but they were not redesigned - they are
  still direction A's *structure* wearing C's *skin*. "One design system across
  every route" is the primary quality bar from `reference-site-analysis.md`, so
  this is the next piece of work, not a finished state.
- `mockups/` and the two throwaway scripts (`fetch-proto-fonts.mjs`,
  `serve-mockups.mjs`) are still present. This file previously authorised
  deleting them once a direction was promoted; they are kept for now because the
  side-by-side is still useful. Delete when that stops being true.
- Claim coverage still reports unresolved IDs - see open question 2, unchanged.

## Voice, identity and takeaways pass - 2026-10-06

Goal: a stranger understands each project without prior context and leaves with methods they could reuse, in a first-person voice that sounds like a person.

Decisions:
- **Identity.** Visible name is "Alp" everywhere (`SITE.name`). The legal name lives only in `SITE.legalName`, used for JSON-LD `alternateName` and the CV file, so a search for it still resolves. Rejected: the full name in the hero, because it wrapped badly at display size and the owner does not want the surname foregrounded.
- **Projects lead with what they are, not their name.** Schema adds `headline` (the visible heading) and `takeaways` (generalisable lessons, rendered as "What I would reuse" on each case study). `title` is now the short project name, used as a label, in tabs and in the stack readout. `tagline` was removed: its aphorisms assumed the reader already knew the project.
- **Home "How I work" became "Lessons that carry over".** Each lesson links to the project that taught it (`LESSONS` in `src/data/home.ts`). The process notes (per-repo knowledge base, Obsidian) moved to `/about`.
- **Copy rules.** First person singular; context before detail; no em or en dashes; no stage-number eyebrows; plain functional labels.

Facts corrected against source repos (checked 2026-10-06):
- Sage's baseline faithfulness 0.948 is a mean over 11 of 36 questions (judge returned NaN on 25); every baseline metric is now shown with its scored count. The first hybrid-search run (dense + BM25, RRF) changed the judge model at the same time, so it is described as not yet comparable. Source: `sage/evals/scorecard_baseline.md`, `sage/evals/runs/index.jsonl`.
- Sage's corpus is the LangChain and LangGraph Python docs (`docs.langchain.com/oss/python`); the eval set is split 15/15 between the two.
- The Munich agent deduplicates by `(source, external_id)` against stored listings from one source. The earlier "three portals, keyed on stable attributes" line was wrong.
- The RAG baseline post no longer claims the unanswerable category "started at roughly zero" or cites illustrative deltas as if measured.

Carried questions: project motivations written into the intros ("why I built it") are reasonable inferences, not quotes, and need the owner's review. `npm run check:claims` fails on 10 IDs that predate this pass because the dossier holds only 15 claims.
