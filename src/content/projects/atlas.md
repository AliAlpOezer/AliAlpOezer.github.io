---
title: Atlas
summary: >-
  A multi-provider tool-using assistant with a step-capped agent loop, a retrieval page
  backed by a separate Python service, and an inspector that shows you the raw chunks
  behind every citation.
tagline: Two agent loops that do different jobs, kept deliberately apart.
stack: [Next.js, TypeScript, Vercel AI SDK, Anthropic, OpenRouter]
period: "2026"
status: shipped
order: 50
claims: [proj.atlas]
---

Atlas has two surfaces. A streaming tool-using chat, and a retrieval Q&A page backed by
[Sage](/work/sage), a Python service in a separate repository.

Keeping those two things apart was the first decision worth making. A tool-calling loop and
a retrieve-then-answer loop look similar in a UI and behave nothing alike, and folding them
into one chat window would have conflated two different failure modes into one box that
sometimes cites and sometimes does not. So retrieval lives on its own route, reachable from
a tab, and the tool-using assistant stays exactly as it was. It is also the reversible
choice, which is usually the argument that decides it.

## A tool that throws on purpose

There are three tools: a calculator, a lookup against a small in-repo knowledge base, and a
unit converter. Two of them return `{ ok: false, error }` when they fail. The calculator
throws.

That is deliberate and it is not a bug waiting to be tidied up. Anything outside a
`^[0-9+\-*/(). %]+$` whitelist raises, because the point of that tool is to exercise the
path where a thrown error becomes a tool-error part in the stream that the model can read
and recover from. If the assistant handles it badly, the fix belongs in the system prompt,
not in making the tool lie about failing.

The lookup tool has the complementary property: when it finds nothing it returns
`found: false` rather than a plausible-looking answer. Half of grounding a model is giving
its tools a way to say no.

The agent loop is capped at five steps. An unbounded loop is a bill.

## Boundaries that the type system enforces

Model metadata and provider clients are two different files on purpose. `lib/models.ts` is
pure data with no provider imports and no secrets, so a client component can import it to
render the model switcher. `lib/provider.ts` is marked `server-only` and is the single place
in the app that constructs a real provider client. A client component that reaches for the
wrong one fails the build rather than shipping a key.

The same shape applies across the network boundary. The browser never calls the Python
service directly. It posts to this app's own route, which proxies onward, so the upstream
host and any credentials stay server-side and there is no CORS in the real request path. The
cost is an extra hop and a 502 to handle when the backend is down or its index is empty,
which is a cost I would rather pay than the alternative.

System prompts are data too. Four personas live in a library and the route composes a base
rule set with the selected persona. The personas never contain the tool-use rules, so
switching voice cannot accidentally switch behaviour.

## Showing the retrieval, not just the answer

Every `[n]` citation on the retrieval page links to an inspector that shows the raw chunk
behind it: title, source URL, similarity score, full text.

This started as a debugging affordance and stayed because it is the honest version of a
cited answer. A citation that you cannot open is a claim that the system retrieved something
relevant, and the whole reason to build retrieval evaluation is that this claim is often
false. Being able to see, in one click, that the model wrote a good sentence off a chunk
scoring 0.31 changes what you work on next.

## The rule this repo is actually testing

Every commit is tagged `[hand]`, `[ai]` or `[hand+ai]`, and any AI-written line I cannot
explain in a self-review gets deleted and rewritten rather than kept.

Atlas is classified in my own working contract as production code where AI assistance is
*required*, because building at that speed is the skill being practised. The tagging is what
stops that from quietly becoming code I merely host. Glancing at the ratio each week is a
cheap signal that the practice has not drifted.

## What is not done

The eval suite is a spec and 30 drafted cases. The ground truth is not hand-labelled yet,
there is no runner committed, and the release pass bar is still a placeholder in the spec
file. I would rather say that than describe an eval harness that does not run: the argument
of the rest of this site is that an unmeasured system is unmeasured no matter how it is
described.
