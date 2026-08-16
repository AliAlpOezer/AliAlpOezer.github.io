---
title: Sage
summary: >-
  A RAG pipeline built by hand over 185 pages of docs, with a hand-labelled golden set and a
  longitudinal RAGAS baseline. The harness took longer than the pipeline, which turned out
  to be correct.
tagline: Building retrieval by hand, so that every part of it could be measured.
stack: [Python, Qdrant, RAGAS, FastAPI, OpenRouter, Cohere]
period: "2026"
status: building
order: 20
featured: true
claims: [proj.sage]
---

Sage is a retrieval-augmented generation system over the LangChain documentation: 185 pages
from a 1,418-URL sitemap, about 4,800 chunks. Frameworks will hand you a working RAG
pipeline in an afternoon. The point here was to implement the mechanics by hand so that
every decision inside them was mine to measure and change, so the pipeline talks to an
OpenAI-compatible API over plain `httpx` and the raw request and response shapes stay
visible.

The corpus choice was the first real decision and it took ten minutes to make and would
have taken a week to discover as a bug. The obvious source is `llms.txt`, which the docs
publish for exactly this purpose. It hard-truncates at 100,000 characters and omits the
entire section I actually needed. The sitemap does not.

## Ports, and the day they paid for themselves

Chunker, Embedder, VectorStore and Generator are Python `Protocol`s. Adapters self-register
with a factory keyed off config, and nothing outside the adapter directory is allowed to
import a backend SDK. This reads as over-architecture right up until you need to compare two
backends on the same corpus and the comparison is one environment variable rather than a
branch.

It proved itself in an unplanned way. Adding a reranking stage months later was a new port,
two adapters and one config knob, with no change to the query loop at all. The baseline
scorecard said `context_precision` was the weakest metric, and the whole intervention aimed
at that one number was a bounded, revertible change.

## The numbers, and the one that is lying

The baseline over 36 hand-labelled triples:

| Metric | Score |
|---|---|
| Faithfulness | 0.948 |
| Answer relevancy | 0.620 |
| Context precision | 0.593 |
| Context recall | 0.679 |

`answer_relevancy` at 0.620 looks like the second-worst problem here. It is mostly not a
problem at all. When I read the worst-scoring cases, most of them were the deliberately
unanswerable questions, correctly refused, scoring zero for relevancy because the metric has
no way to reward abstention. The system doing the right thing is indistinguishable, to
RAGAS, from the system failing.

That is the actual reason to read individual failures rather than a mean. The number told me
where to look; it did not tell me what it meant.

## The labels are never written by AI

Ninety candidate questions were drafted by a model. Turning them into the golden set
required me to hand-write every ground-truth answer, one line at a time, on a worksheet
where blank lines get dropped.

This is not ceremony. The eval set is the ground truth the LLM judge is checked against. If
a model writes both sides, agreement between them measures nothing.

## What building it actually cost

The parts of this that consumed real time were not the retrieval mechanics.

**A reranker that segfaults.** I chose a local cross-encoder to keep the stack free of paid
dependencies. It crashes the process with exit 139 and no Python traceback. Bisecting it
established that the Qdrant client's Rust extension and torch cannot coexist in one process
on this machine, in either load order, before any Qdrant client is even constructed. Not
memory, not an OpenMP duplicate runtime. I switched that one stage to a hosted rerank API,
which sidesteps the conflict entirely and breaks the all-free stack, and left the local
adapter registered and documented as blocked rather than deleting the evidence.

**Idempotent ingestion that never prunes.** Chunk IDs are content hashes, so re-running over
an unchanged corpus is a no-op. It only ever upserts, though, so when a page's text changes,
its old chunks keep their old IDs and linger. The stored vector count legitimately exceeds
the count just embedded, 4,893 against 4,842 on one run, and a clean rebuild means deleting
the store. That is a documented cost, not a bug, and knowing which it is saved me an
afternoon.

**Evaluation economics.** One RAGAS pass over 36 triples is 144 judge calls and takes around
27 minutes at free-tier rates. On one memorable day all four free judge routes failed for
four unrelated reasons: a local gateway with zero connected credentials that hung instead of
erroring, an account with no credit, a provider whose org-wide daily token budget ran out at
job 30 of 144, and a fourth that reached job 139 of 144 before hitting a daily request cap.

That last one is the instructive failure. The generate phase caches per answer and resumes;
the score phase does not, and the scorecard is only written once every job succeeds. Dying
at 97% therefore burned the entire daily quota and produced nothing. The asymmetry between
those two phases is the actual defect, and it is invisible until something kills a run near
the end.

## Where it runs

The same query loop backs both a CLI and a FastAPI service, which is what [Atlas](/work/atlas)
calls for its retrieval page. Retrieval work continues against the baseline; nothing changes
in the pipeline without a scored comparison.
