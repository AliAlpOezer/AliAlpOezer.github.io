---
title: Advocate
summary: >-
  An application agent built around two laws: no factual sentence exists without a claim it
  traces to, and no stage reports success on its own say-so. Both were learned the
  expensive way.
tagline: Every component I trusted to tell me it had worked eventually lied about it.
stack: [LangGraph, Python, Postgres, pgvector, Pydantic, Telegram]
period: "2026"
status: building
order: 10
featured: true
repo: https://github.com/AliAlpOezer/advocate
claims: [proj.advocate]
---

Advocate writes job applications from an evidence store. Three loops that never call each
other: a hunt that fills a databank on a timer, a drafter that turns a shortlisted posting
into a CV and a German cover letter, and a submitter that only ever runs when a human
pressed a button. They meet in one place, the store, and nowhere else.

Two rules hold the whole thing up.

## The generator is not allowed to write facts

Every factual sentence in a generated document traces to an entry in a claim store. The
model selects claim IDs and writes the connective prose between them. It does not get to
assert anything else.

The interesting part is what the real evidence did to that schema. I sketched it first as
you would expect: German text, English text, a grade, a `never_claim` boolean. Then I read
the actual dossier and found four things that sketch could not express.

Wording rules that constrain claims which are perfectly true, like *say "familiar with",
not "read"*. A boolean cannot carry those, and a free-text note invites the drafter to
paraphrase around them, so phrasings became their own table of required, preferred and
forbidden strings, with rows that carry no claim ID at all and are scanned against every
draft. Audience scope, because one section of evidence belongs to a single former employer
and transfers nowhere. Citation cardinality, because one claim is only assertable when
paired with at least two of three named artifacts. And a split between *how strong* the
evidence is and *where it came from*, which turn out to be independent: a self-reported
fact can be usable, and well-documented coursework must never read as experience.

A claim now spans two tables and every read needs a join. That is the price of a schema
that fits the data instead of the sketch.

## Nothing gets to report its own success

The first version of the drafter shelled out to an agent CLI. Two runs died inside the
first model call, on a 502 and a 504, after 206 and 310 seconds, having written nothing at
all. **The subprocess exited 0 both times.** The driver logged success. The entire failover
chain underneath it, key rotation and two backup providers, was gated on a non-zero exit
that this class of failure never produces.

The only thing that caught it was an independent checker noticing the output documents were
still byte-identical to the template.

That is one of five times the same lesson arrived. A provider returned `finish_reason:
"error"` inside an HTTP 200 with 2,464 completion tokens of reasoning and no content, which
reads exactly like a model declining the work. A PDF renderer printed "image not found" and
exited 0. A hunt marked postings as seen before it had judged them.

So it is now a law: **success is an observable property of a stage's output, checked by code
that did not produce it.** There is no `finish` tool. A stage ends when its file is right on
disk and `problems()` returns empty, not when the model says it is done. Three things fall
out of that. A failure names a stage rather than a turn count. A retry resumes, because a
stage whose problems are already empty is skipped without a model call. And the nudge on a
retry is computed from the folder, so a model that got it nearly right is told about the
leftover marker, not asked to try harder.

## The horizon, not the loop

Asked to produce a whole application in one conversation, the model read the posting and
both templates, wrote a correct strategy document, and then simply stopped emitting tool
calls. Three turns and four tool calls. With a nudge node live: six turns and the *same*
four tool calls.

The loop was fine. The horizon was too long.

It is five short stages now, each a fresh conversation carrying the same preloaded
grounding, each writing exactly one file: analyse, draft the CV, draft the letter, map the
claims, render. Rendering is not a model turn at all, which removed the two tool calls both
stalled runs died before reaching. Each stage is handed exactly one way to write, so the CV
stage has no tool that can touch the cover letter.

The grounding is preloaded rather than fetched, all 85,587 characters of it, straight into
the system prompt. Under the old harness each document was a read the model could silently
skip, and a draft written without the dossier looks identical to one written with it until
you re-check every sentence.

## Taste, converted into a gate

Two documents reached the review card that were true, grounded, correct, and unsendable on
sight. A one-page cover letter that spilled onto a second page carrying only the signature.
A CV that bolded nothing except the marathons.

Neither defect needed a model to catch, and neither is a matter of opinion. There is now a
layout checker that reads the *rendered PDF* rather than the markup, because a page break is
a property of the rendering and not of the source: per page it walks the text runs and the
top and bottom baselines through Chrome's flipped coordinate system, and a last page under
12% fill carrying under 220 characters is an orphan. On top of it sits a judgement about
emphasis share, bolded-run length and profile length.

The thresholds are measured, not chosen. They were fitted against the two documents I had
written by hand, and admit both with zero problems. Then the gate immediately earned its
keep by catching my own over-correction: the first rewrite came back marking 66% of bullets
where the hand-written references sit at 40 to 43%.

## The boundary that is deliberately not automated

The engine and the evidence are two repositories. This one is public and contains no
personal data by design; the dossier, the master résumés and the sent applications live in a
private sibling. Credentials go in a database on a private network, never in the application
folder, because that folder is committed to git and a password written there is in history
permanently.

## Status

In progress. Hunt, drafter, verifier and the approval gate are built and running; the
submitter, the one component that takes an irreversible outward action, is not. That
ordering is deliberate.
