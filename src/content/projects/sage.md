---
title: Sage
headline: Learning RAG by building it by hand, and measuring every step
summary: >-
  A question-answering system over the LangChain and LangGraph docs, built without a RAG
  framework so I could see every part: chunking, hybrid search, reranking, and an
  evaluation set I labelled myself.
takeaways:
  - Build the test set before tuning anything, and write its answers yourself. If a model writes the answers and also grades against them, their agreement measures nothing.
  - Read the worst cases, not just the average. My lowest scores were mostly correct refusals that the metric had no way to reward.
  - Check how many questions each score is based on. A judge that fails quietly shrinks your test set without telling you.
  - Change one thing per comparison. I swapped the judge model between two runs and lost the ability to read the result.
stack: [Python, Qdrant, BM25, RAGAS, FastAPI, Cohere]
period: "2026"
status: building
order: 20
featured: true
claims: [proj.sage]
---

I wanted to understand retrieval-augmented generation properly, not just get it working. A
framework will give you a RAG pipeline in an afternoon, but then every interesting decision
has been made for you. So I built Sage by hand: my own chunker, my own calls to the
embedding and chat APIs over plain HTTP, my own retrieval loop. Every part is something I
can open, swap, and measure.

## What it reads

Sage answers questions about the LangChain and LangGraph Python documentation. I picked it
because I use those docs myself, so I can tell a good answer from a plausible one.

The first decision was where to get the pages. The docs publish an `llms.txt` file meant for
exactly this, but it stops at 100,000 characters and leaves out the section I needed most.
The sitemap lists 1,418 URLs. I took the 185 pages of the Python docs from it, which came to
about 4,800 chunks in a Qdrant vector store.

## A test set I wrote by hand

Before tuning anything, I needed a way to tell whether a change helped. I had a model draft
90 candidate questions, then wrote every ground-truth answer myself, one at a time. I kept
36. They fall into four kinds:

- **Easy**: the answer sits in one place in the docs.
- **Hard**: the answer is there, but the question uses different words than the docs do.
- **Multi-hop**: the answer needs two pages that do not mention each other.
- **Unanswerable**: the docs do not cover it, and the right answer is to say so.

The unanswerable ones matter more than they look. A system that always produces an answer
will look great until someone asks it something it does not know.

Each answer is scored with four [RAGAS](https://docs.ragas.io) metrics, and each one points
at a different part of the pipeline:

| Metric | Question it asks | If it is low, look at |
|---|---|---|
| Faithfulness | Is the answer backed by the retrieved text? | Generation |
| Answer relevancy | Does the answer address the question? | Generation |
| Context precision | Was the retrieved text mostly useful? | Retrieval |
| Context recall | Did retrieval find what the answer needs? | Retrieval |

That split is the most useful idea I took from this project. "The answers got worse" is not
something you can fix. "Recall dropped while faithfulness held" tells you the retriever is
the problem and the model is doing its job.

## The first baseline, read honestly

| Metric | Score | Questions scored |
|---|---|---|
| Faithfulness | 0.948 | 11 of 36 |
| Answer relevancy | 0.620 | 20 of 36 |
| Context precision | 0.593 | 17 of 36 |
| Context recall | 0.679 | 13 of 36 |

I had been quoting the 0.948 on its own. Then I looked at the last column. The judge model
failed to return a usable score on most of the questions, so that number is an average over
eleven of them. It is real, but it is not the score of my test set.

The relevancy number taught me something else. Most of the worst cases were unanswerable
questions that Sage correctly declined. The metric has no way to reward "this is not in the
docs", so a correct refusal scores zero, exactly like a failure. The average told me where to
look. Only reading the individual answers told me what it meant.

## Hybrid search

Embeddings are good at meaning and bad at exact names. Ask about `InMemorySaver` and dense
search may return a chunk about memory in general. Keyword search has the opposite
strengths.

So I added BM25 keyword search next to the vector search and merged the two ranked lists
with reciprocal rank fusion, which I wrote myself against a set of tests: each chunk scores
by its position in each list, and chunks that rank well in both rise to the top. The
retriever now pulls 30 candidates and passes the best 5 to the model.

The first scored run came back worse on paper: recall 0.629, precision 0.564. But between
the two runs I had also moved the judge to a different model, and the new judge scored
almost every question where the old one had managed between a third and a half. Two things changed at once,
so the comparison tells me nothing yet. The next step is to score the baseline again with
the same judge. It is an unexciting step, and skipping it would make every number after it
meaningless.

## Built to be swapped

The chunker, embedder, vector store, keyword retriever, reranker and generator are each
behind a small Python interface, and config decides which implementation runs. That sounds
like over-engineering for a learning project. It is what made hybrid search and reranking
cheap to add: each one was a new piece plugged into the same loop, testable against the
baseline with a single setting.

## What it cost

**A reranker that crashed the process.** I wanted a local reranking model to keep everything
free. It killed Python with a segfault and no traceback. After bisecting, it turned out the
vector database client and PyTorch cannot live in the same process on my machine. I moved
reranking to a hosted API and documented the local option as blocked instead of deleting it.

**Evaluation runs that were not resumable.** One full scoring pass is 144 judge calls and
takes about half an hour on free tiers. Answer generation was cached and could resume;
scoring was not, and the scorecard was only written at the very end. One run died at 97%
when a daily limit ran out and produced nothing at all. Every slow, expensive step in a
pipeline should be able to pick up where it stopped.

**Re-indexing that never cleans up.** Chunk IDs are hashes of their content, so re-running
ingestion is safe and cheap. When a page changes, though, its old chunks stay behind. Knowing
that is a deliberate trade-off rather than a bug saved me an afternoon of debugging.

## Where it is now

Sage runs as a command-line tool and as a small API, which [Atlas](/work/atlas) uses for its
retrieval page. Next on the list is a fair hybrid-search comparison, then contextual
retrieval: giving each chunk the page title and section headings it lost when it was cut
out, so a chunk that says "pass it to the constructor" still knows which class it is about.
