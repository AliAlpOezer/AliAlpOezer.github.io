/**
 * Verifies that every factual claim stated publicly on this site still
 * resolves to a live entry in the private evidence dossier.
 *
 *   npm run check:claims
 *
 * WHY THIS EXISTS
 * ---------------
 * The site repeats facts that live, graded and versioned, in advocate-data.
 * That dossier gets corrected: entries are superseded, downgraded, or found
 * to rest on nothing. When that happens the website will happily keep
 * stating the old version forever, because nothing connects the two.
 *
 * This script is that connection, and it is deliberately the ONLY one. The
 * site build never reads advocate-data - coupling a public repo's build to
 * a private sibling checkout would break every clone and put a personal-data
 * leak one glob away. See docs/context/design-record.md.
 *
 * So: run this locally, when you have both repos. On any machine without
 * the dossier it prints a notice and exits 0, which is what makes it safe
 * to leave wired into CI.
 */
import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { parse } from 'yaml';

const ROOT = resolve(import.meta.dirname, '..');
const CONTENT = join(ROOT, 'src', 'content');

const DOSSIER =
  process.env.ADVOCATE_DATA ?? resolve(ROOT, '..', 'advocate-data');
const CLAIMS_FILE = join(DOSSIER, 'claims', 'claims.yaml');

const c = {
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

if (!existsSync(CLAIMS_FILE)) {
  console.log(
    c.dim(
      `claim check skipped: no evidence dossier at ${CLAIMS_FILE}\n` +
        `(set ADVOCATE_DATA to point at it, or ignore this on a machine that should not have it)`
    )
  );
  process.exit(0);
}

/* ---------- load the claim store ---------- */

const store = parse(await readFile(CLAIMS_FILE, 'utf8'));
const byId = new Map();
for (const claim of store?.claims ?? []) {
  if (claim?.id) byId.set(claim.id, claim);
}
console.log(c.dim(`loaded ${byId.size} claims from ${relative(ROOT, CLAIMS_FILE)}`));

/* ---------- collect claim references from site content ---------- */

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (/\.mdx?$/.test(e.name)) yield p;
  }
}

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---/;
const refs = [];

for await (const file of walk(CONTENT)) {
  const src = await readFile(file, 'utf8');
  const block = src.match(FRONTMATTER)?.[1];
  if (!block) continue;

  let data;
  try {
    data = parse(block);
  } catch (err) {
    console.error(c.red(`  cannot parse frontmatter: ${relative(ROOT, file)}`));
    console.error(c.dim(`    ${err.message}`));
    process.exitCode = 1;
    continue;
  }

  for (const id of data?.claims ?? []) {
    refs.push({ id, file: relative(ROOT, file) });
  }
}

if (refs.length === 0) {
  console.log(c.yellow('no claim references found in src/content - nothing to verify'));
  process.exit(process.exitCode ?? 0);
}

/* ---------- verify ---------- */

const missing = [];
const weak = [];
const ok = [];

// Grades that must not be presented publicly as established fact.
const WEAK_GRADES = new Set(['weak', 'unproven', 'disputed']);

for (const ref of refs) {
  const claim = byId.get(ref.id);
  if (!claim) {
    missing.push(ref);
    continue;
  }
  if (claim.superseded_by || claim.status === 'superseded') {
    missing.push({ ...ref, reason: `superseded by ${claim.superseded_by ?? 'a newer entry'}` });
    continue;
  }
  if (WEAK_GRADES.has(String(claim.grade))) {
    weak.push({ ...ref, grade: claim.grade });
    continue;
  }
  ok.push(ref);
}

console.log('');
console.log(`${c.green('✓')} ${ok.length} claim reference(s) resolve to a graded entry`);

if (weak.length) {
  console.log('');
  console.log(c.yellow(c.bold(`${weak.length} reference(s) point at a weak claim:`)));
  for (const w of weak) {
    console.log(c.yellow(`  ${w.id}`) + c.dim(`  grade=${w.grade}  ${w.file}`));
  }
  console.log(c.dim('  A weak claim can appear on the site, but not stated as established fact.'));
}

if (missing.length) {
  console.log('');
  console.log(c.red(c.bold(`${missing.length} reference(s) do NOT resolve:`)));
  for (const m of missing) {
    console.log(c.red(`  ${m.id}`) + c.dim(`  ${m.file}${m.reason ? `  (${m.reason})` : ''}`));
  }
  console.log('');
  console.log(
    c.dim(
      'Either the ID is wrong, or the dossier has not captured this fact yet.\n' +
        'Run the talent-hunter skill in advocate-data to add it, then re-run this.'
    )
  );
  process.exitCode = 1;
}

console.log('');
