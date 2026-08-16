# Design record - personal website

Written 2026-08-16. Direction chosen, scaffold built and committed (`d10f8fc`).
Companion file: `reference-site-analysis.md`.

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
4. **Deploy.** Register `alpozer.dev`, Cloudflare Pages, CI gate on broken links and
   accessibility regressions.

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

1. ~~**Design direction: A, editorial.**~~ **SUPERSEDED 2026-08-16.** Alp ruled the visual
   identity a **full reset**: warm paper, Newsreader and Inter are no longer assumed, and
   the pairing and palette are open again. Three coded prototypes (`mockups/c-quiet.html`,
   `d-console.html`, `e-broadsheet.html`) replace it, to be judged in a browser rather than
   argued in the abstract. See `visual-direction.md` for the ruling and the prototype table.
   The original entry read: light-first warm paper, Newsreader display serif, Inter body,
   ruled index lists, single deep-blue accent, with a designed dark palette rather than an
   inversion. Nothing in the built site has been re-styled yet, so `src/styles/tokens.css`
   still encodes direction A - it is now the *current implementation*, not the *decision*.
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
