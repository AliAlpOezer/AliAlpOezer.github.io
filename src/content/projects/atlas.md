---
title: Atlas
headline: A chat assistant where every citation opens the text it came from
summary: >-
  A web app with two sides: an assistant that uses tools, and a question-answering page built
  on Sage where each citation opens the exact chunk of documentation behind it.
takeaways:
  - Let people open every citation. A citation nobody can inspect is just a claim.
  - Give every tool a way to say no. A lookup that returns "not found" keeps the model from filling the gap.
  - Cap the agent loop. An unbounded loop is an unbounded bill.
  - Put boundaries where the build enforces them. Secrets live in a server-only module, so a mistake fails the build instead of shipping a key.
stack: [Next.js, TypeScript, Vercel AI SDK, Anthropic, OpenRouter]
period: "2026"
status: shipped
order: 50
claims: [proj.atlas]
---

Atlas is where I practise building the parts of an AI app that users touch. It has two pages:
a streaming chat assistant that can call tools, and a question-answering page backed by
[Sage](/work/sage), my retrieval service, which runs as a separate Python project.

Keeping those two apart was the first real decision. A tool-calling assistant and a
retrieve-then-answer system look alike in a chat window but fail in completely different ways.
Merging them would have produced one box that sometimes cites its sources and sometimes does
not, with no way to tell which mode you were in. So retrieval has its own page, one tab away,
and the assistant stayed as it was. It was also the easier choice to reverse, which usually
settles it.

## A tool that fails on purpose

The assistant has three tools: a calculator, a lookup against a small knowledge base, and a
unit converter. Two of them return a structured error when they fail. The calculator throws.

That is deliberate. Anything outside a strict whitelist of characters raises an error, because
I wanted to exercise the path where a thrown error reaches the model as part of the stream and
the model has to recover. If it recovers badly, the fix belongs in the system prompt, not in
making the tool pretend it worked.

The lookup tool does the opposite: when it finds nothing, it says `found: false` instead of
returning something plausible. Half of keeping a model grounded is giving its tools a way to
say no.

The agent loop stops after five steps. An unbounded loop is an unbounded bill.

## Boundaries the build enforces

The list of models and the code that talks to providers live in two different files on purpose.
The model list is plain data with no secrets, so the browser can import it to draw the model
picker. The provider code is marked server-only and is the one place that creates a real API
client. If a browser component ever reaches for it, the build fails instead of shipping a key.

The same idea applies across the network. The browser never calls the Python service directly.
It calls Atlas's own server route, which forwards the request, so the service address and any
credentials stay on the server. The cost is one extra hop and an error to handle when the
retrieval service is down.

System prompts are data too. Four personas live in a small library, and the server combines a
base set of rules with the persona you picked. The personas never contain the tool rules, so
changing the voice cannot change the behaviour.

## Showing the retrieval, not just the answer

Every `[n]` citation on the retrieval page opens an inspector with the raw chunk behind it: page
title, source link, similarity score and full text.

I built it to debug and kept it because it is the honest version of a cited answer. A citation
you cannot open is only a claim that the system found something relevant, and the reason I
evaluate retrieval at all is that this claim is often wrong. Seeing in one click that a
confident sentence was written from a chunk scoring 0.31 changes what you work on next.

## Keeping AI-written code honest

Every commit in this project is tagged as written by hand, by AI, or both. Any AI-written line I
cannot explain when I review it gets deleted and rewritten.

Atlas is the project where I deliberately build fast with AI assistance, because that is a skill
worth practising too. The tags stop that from quietly turning into code I merely host, and
glancing at the ratio each week tells me whether the habit is holding.

## Not done yet

The evaluation suite is a written spec and 30 drafted test cases. The answers are not
hand-labelled yet, nothing runs them, and the passing bar is still a placeholder. I would rather
say so than describe a test suite that does not exist.
