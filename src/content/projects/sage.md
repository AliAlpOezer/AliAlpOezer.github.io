---
title: Sage
summary: >-
  A RAG pipeline built from scratch over 4,800 chunks of documentation, on a
  ports-and-adapters architecture where backends swap by config. A RAGAS harness with a
  hand-labelled golden set means retrieval changes are measured, not guessed.
tagline: Building retrieval by hand, so that every part of it could be measured.
stack: [Python, Qdrant, RAGAS, FastAPI, OpenRouter]
period: "2026"
status: shipped
order: 20
featured: true
claims: [proj.sage]
---

Sage is a retrieval-augmented generation system built over the LangChain documentation
corpus: 185 pages, roughly 4,800 chunks. The point was not to have a working RAG system
quickly. Frameworks will do that in an afternoon. The point was to implement the retrieval
mechanics by hand so that each decision inside them was mine to measure and change.

## Ports and adapters

The pipeline is organised as four ports: Embedder, VectorStore, Generator and Chunker.
Each has adapters behind it, and the running configuration decides which adapter loads.
Swapping the vector store is a config change, not a refactor.

This sounds like over-architecture until the day you need to compare two embedding models
on the same corpus, and the comparison is one line rather than a branch.

## Ingestion and query

Ingestion is idempotent: chunk IDs are content hashes, so re-running over an unchanged
corpus is a no-op and a changed page updates only its own chunks. The query loop is embed,
top-k retrieval, context assembly, cited answer generation, with context ordered to account
for the lost-in-the-middle effect rather than concatenated in score order.

## The part that actually mattered

The evaluation harness. A hand-labelled golden question set split across four kinds -
easy, hard, multi-hop, and deliberately unanswerable - scored with RAGAS against a
longitudinal baseline scorecard.

The unanswerable questions matter most. A retrieval system that always produces a
confident answer is not good, it is broken, and nothing but a labelled set of questions
with no answer in the corpus will reveal it.

Every pipeline variant gets A/B tested against that baseline. Retrieval changes are
measured, not guessed.
