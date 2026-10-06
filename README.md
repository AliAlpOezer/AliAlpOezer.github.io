# alpozer.dev

Personal site: work, writing, and how I got here.

Built with [Astro](https://astro.build) as a fully static site. No client-side framework,
no runtime third-party requests, no CDN dependencies.

## Running it

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # -> dist/
npm run preview    # serve the built output
```

The public, employer-neutral CV is edited in `src/cv/public-cv.html` and regenerated with
`npm run build:cv`. The generated PDF is `public/cv/ali-alp-oezer.pdf`. Review its text and
rendered page before publishing. Do not copy a tailored PDF from `advocate-data` into this
public repository: those files contain private contact details and employer-specific copy.

Deployment: every push to `main` builds and publishes to GitHub Pages at
<https://alialpoezer.github.io/> through `.github/workflows/deploy.yml`.

One-off, only when changing typefaces:

```bash
node scripts/fetch-fonts.mjs   # downloads webfonts, regenerates src/styles/fonts.css
```

## Adding content

Everything is a Markdown file with schema-validated frontmatter. The schemas live in
`src/content.config.ts`; a malformed file fails the build rather than shipping broken.

| What | Where | Route |
|---|---|---|
| Project case study | `src/content/projects/<slug>.md` | `/work/<slug>` |
| Blog post | `src/content/posts/<slug>.md` | `/writing/<slug>` |
| Timeline entry | `src/content/journey/<slug>.md` | `/journey` |

Set `draft: true` to keep something out of the build. Project ordering on the index is by
the `order` field, ascending; `featured: true` also puts it on the home page.

## The rules this site is built to

These are not style preferences. Each one is load-bearing, and the reasoning is in
[`docs/context/design-record.md`](docs/context/design-record.md).

1. **No private data in this repo.** Public: name, city, email, LinkedIn, GitHub. Never
   the phone number, a postal address, or anything out of the private evidence dossier
   that has not been explicitly cleared. `.gitignore` blocks the obvious filenames as a
   backstop, not as the primary defence.
2. **Every factual claim traces to a dossier claim ID.** See below.
3. **The site works with JavaScript disabled.** All content, navigation and reading are
   HTML and CSS. JS only adds the theme override and the journey rail's active state.
4. **Nothing loads from a third-party origin at runtime.** Fonts are self-hosted. This is
   a privacy and GDPR requirement, not an optimisation.
5. **Reduced motion is respected, and both themes pass AA contrast.**
6. **Colours and sizes come only from `src/styles/tokens.css`.** A raw hex or px value in
   a component is a bug.

## Claim traceability

Factual statements carry the IDs of the evidence-dossier entries that back them:

```yaml
claims: [exp.flexus, edu.tum_msc.active_enrollment]
```

```bash
npm run check:claims
```

This resolves each ID against `advocate-data/claims/claims.yaml` and fails on anything
missing, superseded, or graded weak. It is the **only** link between the two repositories
and it is deliberately manual: the site build never reads `advocate-data`, so a clone of
this repo is self-contained and there is no path by which private data can be pulled in
during a build.

On a machine without the dossier the check prints a notice and exits 0, so it is safe in
CI. Point it elsewhere with `ADVOCATE_DATA=/path/to/advocate-data`.

## Layout

```
src/
  content/          projects, posts, journey  (Markdown + frontmatter)
  content.config.ts collection schemas
  components/       Header, Footer, IndexRow, ThemeToggle
  layouts/Base      <head>, meta, JSON-LD, theme bootstrap
  pages/            routes
  styles/
    tokens.css      every colour, size, and duration in the design system
    global.css      reset, shared utilities, accessibility
    prose.css       long-form article typography
    fonts.css       GENERATED - do not hand-edit
scripts/
  fetch-fonts.mjs   downloads and self-hosts the webfonts
  check-claims.mjs  verifies public claims against the private dossier
mockups/            the two design directions explored before building
```

## Licence

Code is MIT. Prose and design are not - please do not republish the writing.
