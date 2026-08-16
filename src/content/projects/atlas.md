---
title: Atlas
summary: >-
  A streaming multi-provider assistant with a live per-request token and cost meter,
  tool-calling with structured error recovery, and Sage wired in as a callable tool for
  cited, retrieval-grounded answers.
tagline: A tool-using assistant that shows you what each answer cost.
stack: [Next.js, TypeScript, Vercel AI SDK, Anthropic, OpenRouter]
period: "2026"
status: shipped
order: 50
claims: [proj.atlas]
---

A streaming LLM assistant that talks to multiple providers behind one interface, with a
model switcher and a live per-request token and cost meter.

## Making cost visible

The cost meter is the feature I would keep if I had to drop everything else. Token spend is
invisible in most chat interfaces, which means it is invisible while you are developing
against them, which is how people ship things that quietly cost a fortune. Putting the
number on screen next to the answer changes how you build.

## Guardrails around tool calling

Tool calls are where an assistant stops being a text generator and starts being something
that acts. Atlas whitelists and sanitises inputs before evaluation rather than trusting
what the model produced, and recovers from tool errors with structured retries rather than
handing the raw stack trace back into the context window.

## Grounded answers

Sage is integrated as a callable tool, so Atlas can answer from a real retrieval pipeline
with citations rather than from parametric memory alone. The two projects are useful
separately and better together, which is the outcome the ports-and-adapters work in Sage
was aiming at.
