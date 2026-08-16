---
title: Munich Apartment Agent
summary: >-
  An autonomous agent running unattended every three hours: scrape, filter, dedup, enrich,
  persist, notify. Durable checkpointing for crash-safe resumption, and Telegram reactions
  that train a learned preference model.
tagline: An agent that has been running without me for months, and what it took to trust it.
stack: [LangGraph, Python, Supabase, FastAPI, Docker, systemd]
period: "2026"
status: live
order: 15
featured: true
repo: https://github.com/AliAlpOezer/munich-apartment-agent
claims: [proj.munich_agent]
---

Munich's rental market moves faster than a person can watch it. This agent watches it
instead: a systemd timer fires every three hours, and a LangGraph pipeline runs scrape →
filter → dedup → detail-fetch → enrich → persist → notify, ending in a Telegram message
if anything is worth my attention.

It has been running unattended in production. That word "unattended" is the whole
engineering problem.

## What unattended actually requires

An agent you check on every day can be sloppy. One that runs while you sleep cannot be.

**Durable checkpointing.** The graph is compiled with a SQLite checkpointer, so a crash
mid-run resumes from the last completed node instead of restarting and re-fetching.

**Retries scoped to transient failures only.** A network timeout is worth retrying. A
parse error is not, and retrying it just burns tokens on the same broken input three times.

**Prompt-injection-safe handling of scraped text.** Listing descriptions are written by
strangers, and they land in a model's context. They are treated as untrusted input
throughout, never as instructions.

**Cost control.** A tiered multi-model routing layer sends cheap deterministic work to
cheap models and reserves the expensive tier for the calls that need it.

## The feedback loop

The part I am most pleased with is the smallest. Telegram reactions on notifications feed
back into a learned preference model, so telling the agent it was wrong takes one tap and
no context switch. Human-in-the-loop only works if the loop is cheaper than ignoring it.

## Observability

Per-node timings and token usage per run, plus an evaluation harness built on golden
fit-bands and LLM-as-judge scoring. When the agent's taste drifts, I can see it in the
numbers before I see it in the notifications.
