---
title: Munich Apartment Agent
summary: >-
  An autonomous agent on a three-hour timer: scrape, filter, dedup, enrich, persist, notify.
  Deterministic where correctness matters, the model only at the edges, and a heartbeat that
  proves it is alive.
tagline: The part I got right was deciding which parts the model is not allowed to touch.
stack: [LangGraph, Python, SQLite, FastAPI, systemd, curl-cffi]
period: "2026"
status: live
order: 15
featured: true
repo: https://github.com/AliAlpOezer/munich-apartment-agent
claims: [proj.munich_agent]
---

Munich's rental market moves faster than a person can watch it. This agent watches it
instead. A systemd timer fires every three hours and a LangGraph state machine runs scrape →
filter → dedup → detail → enrich → persist → notify, ending in a Telegram message if
anything is worth my attention. It runs on a small home server and I do not touch it between
runs.

## Deterministic core, model at the edges

The filter is pure Python: rent, size, move-in date, radius. No LLM call, unit-tested, and
the same input always produces the same decision.

The model ranks fit and writes prose. That is all it does. **It never decides control flow.**
There is exactly one conditional edge in the graph, and it is deterministic: when dedup
finds zero new listings, the run skips straight to the end and nothing downstream executes
on an empty diff.

This is the decision I would defend hardest. An agent that lets a language model decide
whether a flat matches your budget is not more capable, it is just less predictable about
arithmetic, and when it drifts you cannot tell whether the rule changed or the mood did.

## The listing price is a lie, and fixing that costs requests

Search results on the target site show a price that is usually *Kaltmiete*, cold rent,
excluding utilities. What you actually pay is the *Warmmiete*, and in Munich the gap between
them varies far too widely to estimate.

So the card price is treated as a permissive lower bound only. Every candidate that survives
the cheap filter gets its detail page fetched to resolve the true warm rent, and then the
filter runs again against the real number.

The two alternatives were both worse in ways that are easy to miss. Trusting the card price
is fast and *systematically* wrong, always in the same direction, so the agent quietly
notifies you about flats you cannot afford. Estimating utilities as a fixed percentage is
cheap and wrong unpredictably, which is harder to debug than wrong consistently.

What it costs: N additional HTTP requests per run against a site that is already watching
for bots, and an HTML detail parser that will break on the next layout change.

## Getting the page at all

Plain `requests` is reliably blocked, not by a rate limit but by a TLS fingerprint check.
The fetcher uses `curl-cffi` impersonating Chrome's TLS handshake, with headless Playwright
as an escalation only when that fails.

I will describe this honestly: it is a cat-and-mouse hack and it breaks when the site
upgrades its detection. Scraping goes through a source-adapter interface, so adding a second
site is a subclass rather than a change to the graph, and swapping the fetch strategy does
not touch anything above it.

## Cost that scales with difficulty, not volume

Three LLM tiers: a free route first, a cheap paid route second, a frontier model third. The
router escalates only on an error or when the answer comes back below a confidence
threshold.

Always-Claude is simple and costs money on every run forever. A single free model is free
and brittle with no recovery path. Confidence-gated escalation means the bill tracks how
hard the work was rather than how much of it there was. The cost accepted is latency
variance: an awkward listing can traverse several throttled free models before it reaches
the tier that answers.

## The heartbeat, and the bug it found

Every run sends a heartbeat, even a run that found nothing. That exists for one reason: a
silent agent and a dead agent look identical from the outside, and the failure mode of
something that runs while you sleep is not crashing, it is quietly stopping.

It worked. The heartbeats surfaced a run reporting `scraped=18 / matched=12 / new=0`
identically, hour after hour, for most of a day. Something upstream is serving a stale or
cached result set and I have not yet proved which.

That is the honest state of it: the observability found a bug the notifications never would
have, and the bug is still open. Instrumentation earns its place by telling you things you
did not want to hear.

## The rest of the unattended problem

**Durable checkpointing.** The graph compiles with a SQLite checkpointer, so an interrupted
run resumes from the last completed node rather than restarting and re-fetching.

**Retries scoped to transient failures only.** A network timeout is worth retrying. A parse
error is not, and retrying it burns three requests on the same broken input.

**One local SQLite file, not a hosted database.** One box, one writer. Supabase was in the
first version and came out: a network dependency and a set of credentials were pure
overhead. The cost is no managed backups and no remote access without SSH, which is the
right trade at this size and would be the wrong one at any other.

**Feedback that costs one tap.** A 👍 or 👎 reaction on a Telegram notification feeds a
learned preference model. Human-in-the-loop only works when the loop is cheaper than
ignoring it.

93 tests pass, one skipped behind a flag that hits live models.
