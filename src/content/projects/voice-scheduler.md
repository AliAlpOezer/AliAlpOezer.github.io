---
title: Voice Scheduler
summary: >-
  A real-time German booking agent running voice end to end, from VAD through STT and a
  tool-calling LLM to streaming TTS. Every architectural choice in it is a latency choice.
tagline: In a voice interface, latency is not a performance metric. It is the product.
stack: [TypeScript, Vercel AI SDK, MCP, Whisper, ElevenLabs, Drizzle, SQLite]
period: "2026"
status: shipped
order: 30
featured: true
claims: [proj.voice_scheduler]
---

A caller speaks German. The system detects that they have stopped talking, transcribes,
works out what they asked for, checks real availability against a database, books, and
answers out loud. In the time a person will tolerate waiting, which is roughly one second.

The pipeline is VAD → STT → LLM → TTS, and every stage adds delay. Tool calls add more. No
model in that chain is fast enough to hide the gap, so the architecture has to.

## The trick that makes it feel alive

The pipeline's own timing contract, written in a comment at the top of the file:

```
T=0ms     VAD fires end-of-speech
T=~50ms   Filler audio starts emitting from cache
T=~600ms  STT result arrives
```

At the instant the caller stops speaking, before transcription has even started, the agent
plays one of six pre-generated German filler phrases from disk. The call to do it is
deliberately not awaited and is the first thing in the pipeline; STT runs concurrently
underneath it.

Then the honest part: one filler runs 1.1 to 1.4 seconds, and getting to the first real LLM
token after a tool call takes around 1.5. One filler does not cover it. So they chain, up to
two, picked by a weighted random that excludes whatever was used last so it does not repeat
itself, with real audio queued and drained only once the filler has finished.

It is a trick. It is also the difference between a system that feels alive and one that
feels broken, and no amount of model selection buys the same second back.

That timing contract is load-bearing in a way that is easy to destroy. Move the filler call
behind any `await` during a refactor and it still works, still passes, and no longer feels
instant.

## Latency decisions, all the way down

**Streaming TTS tuned for first chunk, not fidelity.** The TTS provider's
`optimize_streaming_latency` is set to 4, trading a little audio quality for roughly 200ms
off the first chunk. For a live conversation that is not close.

**A chunker between the model and the voice.** The LLM's token stream is split into
TTS-ready phrases: hard splits at `.?!`, soft splits at a comma once at least six words have
accumulated. Sending fragments to a TTS engine produces artifacts; waiting for whole
sentences makes the agent sound like it is reading. The comma rule is the compromise.

**Energy-based voice activity detection, no ML model.** RMS thresholds over 16kHz PCM,
explicitly tuned for phone-quality audio, zero dependencies and effectively zero cost. It
will need replacing the day noisy input becomes a requirement, and that is a fair trade for
now.

**Two entry points into one agent loop.** The voice path streams token by token so speech
can start early; a CLI harness runs the identical loop text-only with a simpler non-streaming
call. Being able to iterate on the agent's reasoning without paying voice latency or TTS
cost on every attempt is worth more than it sounds.

## One agent, three businesses

The architecture I would keep is a `BusinessAdapter` interface. A GP practice, a dental
practice and a restaurant are the same booking problem wearing different rules: party sizes
and table logic against patient verification and calendar-backed slots.

Rather than three agents, there is one agent and three adapters, each with its own SQLite
database and its own schema. No shared tables. The restaurant does not need a patient list
and should not have a column for one.

The part that makes this work rather than merely factor is **optional capabilities**.
`verifyClient` exists on the medical adapters and is simply absent from the restaurant one.
The agent checks whether a capability is present rather than calling it and handling a
failure, so an identity check is offered where it is meaningful and does not exist at all
where it is not. Business-specific logic never leaks upward into the pipeline, the agent
loop, or the tool server.

## MCP as the tool layer

Five booking tools are exposed over a Model Context Protocol server with Zod-validated
parameters, consumed by a multi-step agent loop. A second MCP server writes bookings into
Google Calendar, so the owner sees them appear in the tool they already use rather than a
dashboard they would have to remember to open.

The whole thing runs on a free tool-calling model. Scheduling logic is not the hard part of
this system, and paying frontier prices for it would have bought nothing.

## Shipping it without a phone bill

The proof of concept runs over Telegram voice messages rather than real telephony: webhook
secret-token validation on every request, per-chat session state, concurrency guards, and a
graceful text fallback when TTS fails. Zero cost to demonstrate, and a path to actual PSTN
calls specified but not built.

Choosing a demonstrable end-to-end system over a partially built real one was the right call
for something whose entire claim is about how it feels to talk to.
