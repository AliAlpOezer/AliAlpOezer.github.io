import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * `claims` carries the IDs of the entries in the private advocate-data
 * evidence dossier that back the factual statements in this file.
 *
 * Nothing in this repo reads that dossier - the boundary is deliberately
 * not automated (see docs/context/design-record.md). These IDs exist so
 * `npm run check:claims` can verify, on a machine that has advocate-data
 * checked out, that every public claim still resolves and has not been
 * superseded. On any other machine the check is a no-op.
 */
const claims = z.array(z.string()).default([]);

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    /** One sentence for the index list. Keep it under ~200 characters. */
    summary: z.string(),
    /** Longer hook shown at the top of the case study. */
    tagline: z.string().optional(),
    stack: z.array(z.string()).min(1),
    period: z.string(),
    status: z.enum(['live', 'shipped', 'building', 'archived']),
    /** Lower sorts first within the work index. */
    order: z.number().default(100),
    featured: z.boolean().default(false),
    repo: z.string().url().optional(),
    demo: z.string().url().optional(),
    draft: z.boolean().default(false),
    claims,
  }),
});

const posts = defineCollection({
  loader: glob({ base: './src/content/posts', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    claims,
  }),
});

const journey = defineCollection({
  loader: glob({ base: './src/content/journey', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    org: z.string(),
    location: z.string().optional(),
    kind: z.enum(['work', 'education', 'milestone']),
    /** ISO date. Used for sorting, so it must parse. */
    start: z.coerce.date(),
    /** Omit for "present". */
    end: z.coerce.date().optional(),
    /** How the dates are rendered, since ranges read better than ISO. */
    period: z.string(),
    draft: z.boolean().default(false),
    claims,
  }),
});

export const collections = { projects, posts, journey };
