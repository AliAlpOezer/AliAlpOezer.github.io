---
title: Nemotron Delegate
summary: >-
  An MCP server that keeps bulk reading out of an expensive context window, sized against
  47 logged calls rather than assumptions. The measurements contradicted the limits I had
  already written into it.
tagline: I wrote the capacity limits from intuition, then read the log and found every one of them wrong.
stack: [Python, MCP, LiteLLM, OpenRouter]
period: "2026"
status: live
order: 60
draft: true
claims: []
---

A local MCP server that hands bulk read-and-summarise work to a large free model, so that
reading forty files to answer one question never enters the expensive context window I am
actually working in. Three tools: two one-shot and read-only, one a real tool-loop agent
confined to a required root directory.

It has one job and therefore one failure mode worth caring about. Every way this can go
wrong is bad for the same reason: it hands the work back to the model I was trying not to
spend. **A loud, cheap refusal beats an answer built from half the material**, because a
wrong answer costs more than a no.

## Reading my own log

I capped input size because latency scales with input. That sentence was written in a
comment in the source, and it is wrong.

Forty-seven real calls, logged over three weeks:

| Input chars | Output tokens | Seconds |
|---|---|---|
| 202,086 | 1,142 | 38.3 |
| 193,219 | 482 | 14.9 |
| 166,428 | 4,319 | 130.3 |
| 157,844 | 5,104 | 161.1 |

Throughput sits at about 31 output tokens per second regardless of how much input went in.
202,000 characters answered in 38 seconds; a *smaller* input that produced four times the
output took four times as long. The 300-second timeout is therefore a budget of roughly
9,300 output tokens, and input size barely touches it. The input cap I had so carefully
tuned was guarding a limit that does not exist.

Context has never once been the binding constraint either: zero context-length errors in the
whole log. The failures were quota, authentication, and a flaky gateway.

## The quota is a request count, and that changes everything

The real ceiling is a flat number of requests per day, charged identically whether a request
carried 200 tokens or 200,000.

Two intuitions die at once. Dropping to a smaller model to conserve quota saves nothing,
because the small model costs exactly one request too. And splitting a large job into
several smaller calls, which feels like the careful thing to do, is the single most
expensive move available.

Almost every "be efficient" instinct I had was calibrated for a per-token world and is
actively wrong in a per-request one.

## Rotation, with three different reasons to stop

Credentials rotate on exhaustion, with a ledger that survives process restart. That last
part is not incidental: a fresh server process starts per session, so an in-memory ledger
would rediscover the same spent credentials several times a day.

Three block reasons, three durations, because they are genuinely different conditions. A
daily cap blocks until the reset instant the provider itself names. A per-minute ceiling
blocks for sixty seconds. An authentication failure blocks for fifteen minutes and
explicitly **not** permanently, because every 401 in this log was a provider-side glitch
rather than a revoked key, and a permanent block on a transient fault silently shrinks the
pool with no way back.

Selection is lowest-live-index rather than round-robin. For a daily count there is nothing
to gain from spreading load, and draining sequentially makes "how much of today is gone" a
question with a straight answer. No key material touches the ledger, the logs or any answer;
it is keyed by a truncated hash.

Rotation is not triggered by just any error. A key leaves the pool only for a reason the
pool recognises. Collecting six more copies of a genuine request fault is a slower way to
fail.

## Truncation is a failure, not a footnote

The worst defect this server ever had was not overflow. Overflow has never happened.

It was that when the gather step hit its character cap, it stopped reading, appended a note
saying so *after* the answer, and returned. The answer above that note read as complete and
confident, and had been produced from part of the material.

Now the gather step reports "it did not fit" separately from "you asked for something that
is not there", because only the first invalidates an answer. Per-file truncation is gone
from that path entirely: a file goes in whole or is named as excluded, since half a file
yields confident nonsense about code. A file larger than the whole budget gets its own
message, because splitting the call will not help and the caller needs to hear that. The
default behaviour on overflow is to refuse, name what was left out and list the fixes;
proceeding anyway is possible but stamps the answer with a partial-answer header placed
*above* it rather than below.

## The rule underneath all of it

Deterministic decisions stay in code. What to include, how to pack it, which tier to use,
whether a plan is even affordable before the first request is sent. Only the judgement is
the model's.

A plan that runs out of budget at the last step has spent the whole quota and produced
nothing usable, which is strictly worse than declining at the start.
