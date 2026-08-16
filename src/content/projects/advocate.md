---
title: Advocate
summary: >-
  An application agent whose generator never writes facts. It selects claim IDs from a
  graded evidence store and writes only the connective prose, so every factual sentence
  traces back to something verified.
tagline: What happens when you forbid a language model from stating anything it cannot cite.
stack: [LangGraph, Python, Pydantic, SQLite]
period: "2026"
status: building
order: 10
featured: true
claims: [proj.advocate]
---

Most "AI writes your CV" tools have the same failure mode: the model invents a metric,
inflates a title, or asserts a skill nobody can back up. The output reads well and cannot
be defended in an interview.

Advocate is built so that failure is structurally impossible rather than discouraged by
prompting. The generator is not permitted to write facts at all. It selects claim IDs from
a graded evidence store and writes only the connective prose between them, so every
factual sentence in a generated document traces to a verified entry.

## The constraint that shaped everything

The design constraint came first and the architecture followed from it:

> The generator never writes facts.

That single rule decides the component boundaries. Evidence lives in its own store, with
its own grading and its own supersede history. Selection is deterministic code. Judgment
(which claims fit this posting, how they connect) belongs to the model. Nothing outward
facing happens without a human approving the exact bytes.

## Data separation as a repository boundary

The engine and the evidence are two repositories, not two folders. `advocate` contains no
personal data by design; the dossier, master résumés, photo assets and previously sent
applications live in a private sibling that the system reads at run time, with
`.gitignore` enforcing the boundary. Anyone who forks the public repo gets the engine and
synthetic example claims, never a real candidate's file.

## Status

In progress. The discovery and fit-scoring graph is complete and running; the
evidence-grounding layer is what I am building now.
