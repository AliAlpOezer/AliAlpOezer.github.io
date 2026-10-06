---
title: Your RAG has no baseline
description: >-
  Most retrieval "improvements" are unfalsifiable. What it takes to build a golden set
  small enough to hand-label and honest enough to trust.
pubDate: 2026-08-10
updated: 2026-10-06
tags: [RAG, evaluation, retrieval]
---

Here is a conversation I have had several times, in slightly different words each time.

> "I switched the chunker to semantic chunking and the answers got better."
>
> "Better how much?"
>
> "They just seem better."

That exchange is the whole problem. Almost every retrieval-augmented generation system I
have seen, including the first version of my own, is tuned by vibes. Someone changes the
chunk size, reads four answers, decides it improved, and ships. The change might have been
an improvement. It might have been a regression that happened not to show up in the four
questions anyone bothered to ask.

There is no way to tell, because there is no baseline.

## What a baseline actually costs

A baseline is a set of questions with known good answers, scored the same way every time,
recorded so that today's number can be compared against last month's. That is it. It is not
technically difficult. It is just tedious, and it has to be done by hand, and it produces no
demo.

For [Sage](/work/sage) I hand-labelled a golden set split across four categories:

- **Easy** - the answer is in one chunk, stated plainly.
- **Hard** - the answer is in one chunk, but the question does not share vocabulary with it.
- **Multi-hop** - the answer requires combining two chunks that do not reference each other.
- **Unanswerable** - the corpus does not contain the answer at all.

The set is small: 36 questions, 14 of them unanswerable. A model drafted the candidate
questions; I wrote every answer myself. Small enough to label by hand is the only reason it
exists.

## The category that matters most

The unanswerable questions.

A retrieval system that always returns a confident answer is not a good system, it is a
broken one, and no amount of testing with answerable questions will reveal that. Top-k
retrieval always returns k results. It returns them whether or not any of them are relevant,
because cosine similarity has no concept of "none of these". Feed those k irrelevant chunks
to a generator with an instruction to answer from context, and it will write you something
confident and wrong.

The only way to find that failure is to ask questions you know the corpus cannot answer,
and check that the system says so.

Sage, as it happens, declined those questions correctly. And that exposed a second problem:
the answer relevancy metric has no way to reward "this is not in the docs", so every correct
refusal scored zero. Most of my worst-scoring cases were the system doing the right thing.
Without the category, I would never have seen either the behaviour or the blind spot in the
metric.

## Longitudinal, not one-shot

The score is worth little on the day you first compute it. What makes it valuable is the
row below it next month.

Sage keeps every scored run in an append-only log, and each change is compared against the
baseline. The interesting result is never a single score. It is a shape, like "this change
helped the multi-hop questions and hurt the ones it should refuse", which is a trade-off you
can reason about and which reading four sample answers will never show you.

It only works if one thing changes at a time. My first hybrid-search run changed the
retriever *and* the judge model, so its numbers cannot be compared with the baseline at all.
The fix is boring: score the baseline again with the new judge. A baseline is only a
baseline if everything except the change stays still.

## The uncomfortable part

Building the harness took longer than building the retrieval pipeline it measures.

That ratio felt wrong while I was in it, and I think it is actually correct. The pipeline is
a handful of well-understood steps: embed, retrieve, order, generate. The harness is the
thing that tells you whether your version of those steps works, and without it you are not
engineering, you are decorating.

If you are building RAG right now and you cannot state your current score on a fixed set of
questions, that is the next thing to build. Not a better reranker. Not a bigger embedding
model. A number you can be wrong about.
