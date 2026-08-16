/**
 * Home-page data that is not a content collection.
 *
 * These are single-instance site facts, not repeatable content types, so they
 * live here rather than under src/content. They are still data rather than
 * markup, which is what invariant 6 actually asks for.
 */

/** Technologies explored but not shipped in anything public.
 *
 *  Alp asked for the stack display to cover what he "has ever seen", which is
 *  deliberately broader than an aggregation of the projects' `stack:` arrays -
 *  that scope is the whole point of the second tier. */
export const EXPLORED = [
  'LangChain', 'llama.cpp', 'PyTorch', 'Transformers', 'ESP32', 'Kolibri',
  'Docker', 'React', 'Obsidian', 'Cloudflare', 'LiteLLM',
] as const;

/** The set piece: one real system, opened up stage by stage.
 *
 *  Every line here is sourced from the Munich agent's own decision record.
 *  If that project changes, this changes with it. */
export const PIPELINE = [
  {
    name: 'Scrape',
    mode: 'deterministic',
    body: 'A plain HTTP client gets refused, so the fetch layer presents a real browser TLS fingerprint. This is the only stage whose job is to be indistinguishable from a person.',
  },
  {
    name: 'Filter',
    mode: 'deterministic',
    body: 'Hard criteria first, in code: rent ceiling, rooms, district. Cheap, total, and it means the model never spends a token on a listing that already failed a rule.',
  },
  {
    name: 'Dedup',
    mode: 'deterministic',
    body: 'The same flat is posted to three portals under three different IDs. Keyed on the attributes that do not change between listings, then written once.',
  },
  {
    name: 'Enrich',
    mode: 'model',
    body: 'The one stage the model owns. Free-text descriptions carry what the structured fields never do, and reading prose is the thing a language model is actually better at than I am.',
  },
  {
    name: 'Persist',
    mode: 'deterministic',
    body: 'Local SQLite. Supabase was in here and was removed on purpose: a hosted database for a single-user agent bought nothing and cost a network hop on every cycle.',
  },
  {
    name: 'Notify',
    mode: 'deterministic',
    body: 'A message per new match, and a heartbeat on every cycle whether or not there is anything to say. Without the heartbeat, a silent agent and a dead agent look identical.',
  },
] as const;

/** How I work. The content pivot: lead with method, not with inventory. */
export const METHOD = [
  {
    title: 'A knowledge base per repo',
    body: 'Every project I keep carries a context pack: decisions with the alternatives I rejected, the gotchas that cost me a day, and an honest current status. It is written to be read cold by a model. The test is whether a fresh session resumes from the conclusion instead of the transcript.',
  },
  {
    title: 'Obsidian is the room I argue in',
    body: 'Notes are not storage. They are where a half-formed idea gets taken apart before it costs anything. What survives the argument gets promoted into a repository’s context pack; the rest stays a note, which is the correct outcome for most ideas.',
  },
  {
    title: 'Retrieval, because it is falsifiable',
    body: 'Generation quality is largely a matter of taste, and taste does not survive a disagreement. Retrieval quality is a number on a golden set, and it either went up or it did not. That is the part of an LLM system where I can still be provably wrong, so it is the part I went at first.',
  },
  {
    title: 'Sixteen weeks, ending in repositories',
    body: 'LLM applications, retrieval, agents, evaluation, fine-tuning — structured like a syllabus rather than a reading list. Every block ends in a shipped repository rather than a certificate, which is why Sage, Voice Scheduler and the Munich agent all exist.',
  },
] as const;

/** Figures that are evidence. Deliberately not animated on entry: a number
 *  that counts up invites the reader to watch the animation instead of
 *  reading the number. */
export const FIGURES = [
  { value: '185', note: 'pages indexed by hand for Sage, from a 1,418-URL sitemap.' },
  { value: '0.948', note: 'faithfulness on a hand-labelled golden set of 36 triples.' },
  { value: '3h', note: 'timer driving the Munich agent, unattended, on a home server.' },
] as const;
