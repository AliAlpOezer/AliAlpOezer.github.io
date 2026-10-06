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

/** The set piece: one real system, opened up step by step.
 *
 *  Every line here is checked against the Munich agent's own code and decision
 *  record. If that project changes, this changes with it. */
export const PIPELINE = [
  {
    name: 'Fetch',
    mode: 'code',
    body: 'Get the newest listings. Ordinary scripts get blocked, so the requests carry the same network fingerprint as Chrome. This is the most fragile step, so it sits behind its own interface and can change without touching anything else.',
  },
  {
    name: 'Filter',
    mode: 'code',
    body: 'Rent, size, move-in date, distance. These are rules, so they are code: tested, instant, and the same answer every time. Anything that passes gets its detail page checked for the real rent, utilities included, and is filtered again.',
  },
  {
    name: 'Skip seen',
    mode: 'code',
    body: 'Most listings were already there three hours ago. Anything already saved is dropped, and if nothing new is left, the run ends right here and nothing after it runs.',
  },
  {
    name: 'Read',
    mode: 'model',
    body: 'The one step the model owns. It reads each description and judges how well the flat fits me. Free text says things the structured fields never do, and reading prose is what a language model is genuinely good at.',
  },
  {
    name: 'Save',
    mode: 'code',
    body: 'Everything goes into one local SQLite file. The first version used a hosted database, which for one user on one machine only added a network hop and another set of credentials.',
  },
  {
    name: 'Notify',
    mode: 'code',
    body: 'A Telegram message for each good match, and a short heartbeat on every run, even when there is nothing to report. Without it, an agent that died and an agent with nothing to say look exactly the same.',
  },
] as const;

/** Lessons that carry over. Each one is drawn from a project and links back to it,
 *  so the method is shown with its evidence rather than asserted. */
export const LESSONS = [
  {
    title: 'Measure retrieval before tuning it',
    body: 'Retrieval is one of the few parts of an LLM system you can actually score. I write the test answers myself, split the scores by stage, and read the worst cases, because the average alone has misled me more than once.',
    from: { name: 'Sage', href: '/work/sage' },
  },
  {
    title: 'Code decides, the model reads',
    body: 'Rules that must be right live in plain, tested code. The model gets the fuzzy part, like reading a listing’s description. When something goes wrong, I can tell which side caused it.',
    from: { name: 'the apartment agent', href: '/work/munich-apartment-agent' },
  },
  {
    title: 'Check the output, not the exit code',
    body: 'A process that exits cleanly has not necessarily done its job. A step in my agents is finished when separate code has checked what it produced, not when the model says it is done.',
    from: { name: 'Advocate', href: '/work/advocate' },
  },
  {
    title: 'Hide the wait you cannot remove',
    body: 'In a voice conversation, one second of silence feels broken. When no model is fast enough, the design has to cover the gap: a short filler phrase, streamed speech, sentences cut at natural pauses.',
    from: { name: 'Voice Scheduler', href: '/work/voice-scheduler' },
  },
] as const;

/** Figures that are evidence. Deliberately not animated on entry: a number
 *  that counts up invites the reader to watch the animation instead of
 *  reading the number. */
export const FIGURES = [
  { value: '36', note: 'test questions I answered by hand to grade my RAG system, 14 of them ones it should refuse.' },
  { value: '~1 s', note: 'the pause my voice agent has to cover before a conversation starts to feel broken.' },
  { value: '3 h', note: 'between runs of my apartment agent, which works unattended on a small server at home.' },
] as const;
